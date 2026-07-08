import { JampollsApi } from './api.js';
import { EmbedSSE } from './sse.js';
import { renderLoading, renderError, renderSurvey, flattenSurveyQuestions } from './renderer.js';

export class SurveyWidget {
  constructor(embedKey, container, opts) {
    this.embedKey = embedKey;
    this.container = container;
    this.opts = opts || {};
    this.api = new JampollsApi(this.opts.apiUrl);
    this.toolType = 'survey';
    this.data = null;
    this.state = {
      phase: 'survey',
      currentStep: 0,
      answers: new Map(),
      submitted: false,
      feedback: null,
      validationErrors: new Map(),
    };
    this.submitting = false;
    this._destroyed = false;
    this._sse = null;
    this._autoAdvanceTimer = null;
  }

  _getQuestions() {
    return flattenSurveyQuestions(this.data?.survey_data);
  }

  _applySsePayload(payload) {
    if (!this.data || payload.tool !== 'survey') return;
    const sd = this.data.survey_data || {};
    this.data = {
      ...this.data,
      survey_data: {
        ...sd,
        title: payload.title ?? sd.title,
        is_active: payload.status === 'active',
      },
    };
  }

  _handleSseEvent(event, payload) {
    if (this._destroyed) return;
    if (event === 'tool_type_changed') {
      this.opts.onToolSwitch?.(payload);
      return;
    }
    if (event === 'survey.update' || (event === 'snapshot' && payload.tool === 'survey')) {
      this._applySsePayload(payload);
      this._render();
    }
  }

  _startSSE() {
    if (this._sse || this._destroyed) return;
    const streamUrl = `${this.api.baseUrl}/api/v1/widgets/${this.embedKey}/stream/`;
    this._sse = new EmbedSSE(streamUrl, {
      currentToolType: this.toolType,
      onEvent: (event, payload) => this._handleSseEvent(event, payload),
    });
    this._sse.start();
  }

  init(envelope) {
    renderLoading(this.container);
    this.data = envelope;
    this.state = {
      phase: 'survey',
      currentStep: 0,
      answers: new Map(),
      submitted: false,
      feedback: null,
      validationErrors: new Map(),
    };
    this._render();
    this._startSSE();
    if (this.opts.onLoad) this.opts.onLoad(this.data);
  }

  _setAnswer(questionId, value) {
    this.state.answers.set(Number(questionId), value);
    this.state.validationErrors.delete(Number(questionId));
    this.state.feedback = null;
    this._render();

    const surveyData = this.data?.survey_data || {};
    const questions = this._getQuestions();
    const question = questions.find(q => Number(q.id) === Number(questionId));
    const isOneByOne = surveyData.display_mode === 'one_by_one';

    if (
      surveyData.auto_advance &&
      isOneByOne &&
      question &&
      ['single_choice', 'dropdown', 'rating', 'likert'].includes(question.question_type)
    ) {
      clearTimeout(this._autoAdvanceTimer);
      this._autoAdvanceTimer = setTimeout(() => {
        if (this._canAdvance()) this._next();
      }, 300);
    }
  }

  _answerValue(question) {
    return this.state.answers.get(Number(question.id));
  }

  _isAnswered(question) {
    const value = this._answerValue(question);
    if (value === undefined || value === null) return false;
    if (question.question_type === 'multiple_choice') {
      return Array.isArray(value) && value.length > 0;
    }
    if (['text', 'email', 'phone', 'url'].includes(question.question_type)) {
      return String(value).trim().length > 0;
    }
    return value !== '' && value !== null;
  }

  _canAdvance() {
    const surveyData = this.data?.survey_data || {};
    const questions = this._getQuestions();
    if (surveyData.display_mode === 'all_questions') {
      return questions.every(q => !q.required || this._isAnswered(q));
    }
    const current = questions[this.state.currentStep];
    if (!current) return false;
    return !current.required || this._isAnswered(current);
  }

  _next() {
    const questions = this._getQuestions();
    if (this.state.currentStep < questions.length - 1) {
      this.state.currentStep += 1;
      this._render();
    }
  }

  _back() {
    if (this.state.currentStep > 0) {
      this.state.currentStep -= 1;
      this._render();
    }
  }

  _buildAnswersPayload() {
    const questions = this._getQuestions();
    return questions.map(q => {
      const value = this._answerValue(q);
      const base = { question_id: q.id };

      if (['text', 'email', 'phone', 'date', 'time', 'url'].includes(q.question_type)) {
        return { ...base, text_answer: String(value ?? '') };
      }
      if (['likert', 'rating'].includes(q.question_type)) {
        return { ...base, numeric_answer: Number(value) };
      }
      if (q.question_type === 'multiple_choice') {
        return { ...base, option_ids: Array.isArray(value) ? value : [] };
      }
      if (['single_choice', 'dropdown'].includes(q.question_type)) {
        return { ...base, option_ids: value != null ? [value] : [] };
      }
      return base;
    }).filter(a => {
      if (a.text_answer !== undefined) return a.text_answer.trim().length > 0;
      if (a.numeric_answer !== undefined) return Number.isFinite(a.numeric_answer);
      if (a.option_ids !== undefined) return a.option_ids.length > 0;
      return false;
    });
  }

  async _submitSurvey() {
    if (this.submitting || this.state.submitted || this._destroyed) return;
    const questions = this._getQuestions();
    const errors = new Map();

    questions.forEach(q => {
      if (q.required && !this._isAnswered(q)) {
        errors.set(Number(q.id), 'This question is required');
      }
    });

    if (errors.size > 0) {
      this.state.validationErrors = errors;
      this.state.feedback = { type: 'error', message: 'Please answer all required questions.' };
      this._render();
      return;
    }

    this.submitting = true;
    this.state.feedback = null;
    this._render();

    try {
      await this.api.submitSurvey(this.embedKey, this._buildAnswersPayload());
      this.state.submitted = true;
      this.state.phase = 'outro';
      this.state.feedback = null;
      if (this.opts.onSubmit) this.opts.onSubmit({ answers: this._buildAnswersPayload() });
    } catch (err) {
      this.state.feedback = { type: 'error', message: err.message || 'Could not submit your survey. Please try again.' };
      if (this.opts.onError) this.opts.onError(err);
    } finally {
      this.submitting = false;
      if (!this._destroyed) this._render();
    }
  }

  _render() {
    if (!this.data || this._destroyed) return;
    renderSurvey(this.container, this.data, {
      ...this.state,
      questions: this._getQuestions(),
      submitting: this.submitting,
      onSetAnswer: (id, value) => this._setAnswer(id, value),
      onNext: () => this._next(),
      onBack: () => this._back(),
      onSubmit: () => this._submitSurvey(),
      canAdvance: this._canAdvance(),
      themeOverride: this.opts.theme,
      vars: this.opts.vars,
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
      renderError(this.container, 'Could not load survey. Please try again.');
      if (this.opts.onError) this.opts.onError(err);
    });
  }

  destroy() {
    this._destroyed = true;
    clearTimeout(this._autoAdvanceTimer);
    if (this._sse) { this._sse.destroy(); this._sse = null; }
    this.container.innerHTML = '';
  }
}
