import { JampollsApi, resolveBaseUrl } from './api.js';
import { getVoterId } from './voter.js';
import { renderLoading, renderError, renderQuiz } from './renderer.js';
import { QUIZ_TIMER_URGENT_THRESHOLD_S } from './quizTokens.js';

const TIMER_TICK_MS = 250;

export class QuizWidget {
  constructor(embedKey, container, opts) {
    this.embedKey = embedKey;
    this.container = container;
    this.opts = opts || {};
    this.api = new JampollsApi(resolveBaseUrl(this.opts));
    this.toolType = 'quiz';
    this.data = null;
    // `answers` accumulates one entry per question already advanced past —
    // forward-only, no Back button, so a question is scored the moment the
    // respondent leaves it and never revisited.
    this.answers = new Map();
    this.state = {
      phase: 'checking', // checking -> blocked | question -> results
      currentIndex: 0,
      selected: [],
      attemptStatus: null,
      results: null,
      feedback: null,
      timeRemainingMs: null,
      questionStartedAtMs: null,
      answerFeedback: null,
    };
    this.submitting = false;
    this.checkingAnswer = false;
    this._destroyed = false;
    this._timerHandle = null;
    this._attemptStartedAtMs = null;
    this._startFired = false;
  }

  // Unlike revealScore/passThreshold (pure rendering choices), this one calls
  // a security-gated endpoint that 403s unless the embed owner's own
  // instant_feedback setting is on — so opts.instantFeedback can only narrow
  // that (suppress it on this page) and never force it on past what the
  // owner allowed, which would otherwise waste a network round trip on a
  // guaranteed rejection every single question.
  _effectiveInstantFeedback() {
    if (!this._embedSettings().instant_feedback) return false;
    return this.opts.instantFeedback !== undefined ? !!this.opts.instantFeedback : true;
  }

  _questions() {
    return this.data?.quiz_data?.questions || [];
  }

  _currentQuestion() {
    return this._questions()[this.state.currentIndex] || null;
  }

  _embedSettings() {
    return this.data?.embed_settings || {};
  }

  _effectiveTimeLimit(question) {
    const perQuestionOverride = this._embedSettings().per_question_seconds;
    if (typeof perQuestionOverride === 'number' && perQuestionOverride > 0) return perQuestionOverride;
    return typeof question?.time_limit === 'number' ? question.time_limit : null;
  }

  async init(envelope) {
    renderLoading(this.container);
    this.data = envelope;
    this.answers = new Map();
    this._attemptStartedAtMs = Date.now();
    this._startFired = false;
    this.state = {
      phase: 'checking',
      currentIndex: 0,
      selected: [],
      attemptStatus: null,
      results: null,
      feedback: null,
      timeRemainingMs: null,
      questionStartedAtMs: null,
      answerFeedback: null,
    };
    if (this.opts.onLoad) this.opts.onLoad(this.data);
    await this._checkAttemptStatus();
  }

  // Precheck is a UX nicety, not a security boundary — the server enforces
  // retake policy again at submit time regardless. A precheck failure (e.g.
  // a transient network error) should never block someone from attempting
  // the quiz, so this fails open into the question phase.
  async _checkAttemptStatus() {
    try {
      const anonymousId = await getVoterId(this.api.baseUrl);
      this._anonymousId = anonymousId;
      const status = await this.api.fetchQuizAttemptStatus(this.embedKey, {
        externalRespondentId: this.opts.externalRespondentId,
        anonymousId,
      });
      if (this._destroyed) return;
      if (status?.already_completed) {
        this.state.phase = 'blocked';
        this.state.attemptStatus = status;
        this._render();
        return;
      }
    } catch (err) {
      if (this.opts.onError) this.opts.onError(err);
    }
    if (this._destroyed) return;
    this.state.phase = 'question';
    if (!this._startFired) {
      this._startFired = true;
      if (this.opts.onQuizStart) this.opts.onQuizStart();
    }
    this._beginQuestion();
  }

  _beginQuestion() {
    this._clearTimer();
    const question = this._currentQuestion();
    const previouslyAnswered = question ? this.answers.get(question.id) : null;
    this.state.selected = previouslyAnswered
      ? previouslyAnswered.selected_options.map(o => o.option)
      : [];
    this.state.answerFeedback = null;
    this.state.questionStartedAtMs = Date.now();

    const limitS = this._effectiveTimeLimit(question);
    this.state.timeRemainingMs = limitS != null ? limitS * 1000 : null;

    if (limitS != null) {
      this._timerHandle = setInterval(() => {
        const elapsed = Date.now() - this.state.questionStartedAtMs;
        const remaining = Math.max(0, limitS * 1000 - elapsed);
        this.state.timeRemainingMs = remaining;
        this._render();
      }, TIMER_TICK_MS);
    }

    this._render();
  }

  _clearTimer() {
    if (this._timerHandle) {
      clearInterval(this._timerHandle);
      this._timerHandle = null;
    }
  }

  _toggleOption(optionId) {
    if (this.state.phase !== 'question') return;
    const question = this._currentQuestion();
    if (!question) return;

    if (question.question_type === 'multiple_choice') {
      const set = new Set(this.state.selected);
      if (set.has(optionId)) set.delete(optionId);
      else set.add(optionId);
      this.state.selected = Array.from(set);
    } else {
      this.state.selected = [optionId];
    }
    this._render();
  }

  _isAnswered() {
    return this.state.selected.length > 0;
  }

  _timeExpired() {
    return this.state.timeRemainingMs !== null && this.state.timeRemainingMs <= 0;
  }

  _canAdvance() {
    return this._isAnswered() || this._timeExpired();
  }

  _recordCurrentAnswer() {
    const question = this._currentQuestion();
    if (!question || this.state.selected.length === 0) return;
    const timeSpentS = Math.max(0, Math.round((Date.now() - this.state.questionStartedAtMs) / 1000));
    const selectedOptionIds = [...this.state.selected];
    this.answers.set(question.id, {
      question: question.id,
      selected_options: selectedOptionIds.map(optionId => ({ option: optionId })),
      time_spent: timeSpentS,
    });
    if (this.opts.onAnswerLocked) {
      this.opts.onAnswerLocked({ questionId: question.id, selectedOptionIds, timeSpentS });
    }
  }

  _next() {
    if (this.submitting || this.checkingAnswer) return;

    // Second click after a feedback banner is already showing — this one
    // means "continue", not "lock in an answer" (already done).
    if (this.state.answerFeedback) {
      this._advanceQuestion();
      return;
    }

    if (!this._canAdvance()) return;
    this._recordCurrentAnswer();

    if (this._effectiveInstantFeedback()) {
      this._runInstantFeedbackCheck();
    } else {
      this._advanceQuestion();
    }
  }

  _advanceQuestion() {
    const questions = this._questions();
    const isLast = this.state.currentIndex >= questions.length - 1;
    if (isLast) {
      this._submit();
      return;
    }
    this.state.currentIndex += 1;
    this._beginQuestion();
  }

  async _runInstantFeedbackCheck() {
    const question = this._currentQuestion();
    this.checkingAnswer = true;
    this._render();
    try {
      const result = await this.api.checkQuizAnswer(this.embedKey, {
        questionId: question.id,
        selectedOptionIds: [...this.state.selected],
        externalRespondentId: this.opts.externalRespondentId,
      });
      if (this._destroyed) return;
      this.state.answerFeedback = { correct: !!result?.correct };
    } catch (err) {
      this.checkingAnswer = false;
      if (this._destroyed) return;
      // Fails open — the answer is already recorded, so advancing without a
      // feedback banner is better than stranding the visitor on this question.
      if (this.opts.onError) this.opts.onError(err);
      this._advanceQuestion();
      return;
    }
    this.checkingAnswer = false;
    if (!this._destroyed) this._render();
  }

  async _submit() {
    if (this.submitting || this._destroyed) return;
    this._clearTimer();
    this.submitting = true;
    this.state.feedback = null;
    this._render();

    const totalTimeSpentS = Math.max(0, Math.round((Date.now() - this._attemptStartedAtMs) / 1000));

    try {
      const result = await this.api.submitQuiz(this.data.quiz_data.slug, {
        embedKey: this.embedKey,
        answers: Array.from(this.answers.values()),
        totalTimeSpent: totalTimeSpentS,
        externalRespondentId: this.opts.externalRespondentId,
      });
      if (this._destroyed) return;
      this.state.phase = 'results';
      this.state.results = result?.results || null;
      if (this.opts.onQuizComplete) this.opts.onQuizComplete(this.state.results);
    } catch (err) {
      if (this._destroyed) return;
      this.state.feedback = { type: 'error', message: err.message || 'Could not submit your quiz. Please try again.' };
      if (this.opts.onError) this.opts.onError(err);
    } finally {
      this.submitting = false;
      if (!this._destroyed) this._render();
    }
  }

  _render() {
    if (!this.data || this._destroyed) return;
    renderQuiz(this.container, this.data, {
      ...this.state,
      questions: this._questions(),
      currentQuestion: this._currentQuestion(),
      submitting: this.submitting,
      checkingAnswer: this.checkingAnswer,
      canAdvance: this._canAdvance(),
      urgentThresholdS: QUIZ_TIMER_URGENT_THRESHOLD_S,
      isLastQuestion: this.state.currentIndex >= this._questions().length - 1,
      onToggleOption: (optionId) => this._toggleOption(optionId),
      onNext: () => this._next(),
      themeOverride: this.opts.theme,
      revealScoreOverride: this.opts.revealScore,
      passThresholdOverride: this.opts.passThreshold,
      vars: { ...(this.data?.embed_settings?.vars || {}), ...(this.opts.vars || {}) },
    });
  }

  refresh() {
    if (this._destroyed) return;
    renderLoading(this.container);
    this.api.fetchTool(this.embedKey).then(envelope => {
      if (this._destroyed) return;
      this.init(envelope);
    }).catch(err => {
      if (this._destroyed) return;
      renderError(this.container, 'Could not load quiz. Please try again.');
      if (this.opts.onError) this.opts.onError(err);
    });
  }

  destroy() {
    this._destroyed = true;
    this._clearTimer();
    this.container.innerHTML = '';
  }
}
