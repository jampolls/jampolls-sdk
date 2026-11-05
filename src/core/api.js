import { getVoterId } from './voter.js';

const BASE_URL = 'https://hub.jampolls.com';
// Internal use only — not documented beyond a generic mention in the public config.
const ENVIRONMENT_URLS = {
  production: BASE_URL,
  sandbox: 'https://staging-hub.jampolls.com',
};
const SDK_VERSION = '1.5.0';

/**
 * Resolve the effective API base URL from widget options.
 * Precedence: explicit apiUrl override > env shorthand > production default.
 */
export function resolveBaseUrl(opts = {}) {
  if (opts.apiUrl) return opts.apiUrl;
  if (opts.env && ENVIRONMENT_URLS[opts.env]) return ENVIRONMENT_URLS[opts.env];
  return BASE_URL;
}

function getApiError(data, status) {
  return (
    data?.errors?.message ||
    data?.errors?.error ||
    data?.error ||
    `HTTP ${status}`
  );
}

function unwrapApiResponse(data, status) {
  if (data?.success === false) {
    throw new Error(getApiError(data, status));
  }

  return data?.data || data;
}

export class JampollsApi {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = String(baseUrl || BASE_URL).replace(/\/+$/, '');
  }

  async fetchTool(embedKey) {
    const res = await fetch(`${this.baseUrl}/api/v1/widgets/${embedKey}/fetch/?src=embed`, {
      headers: { 'X-SDK-Version': SDK_VERSION },
    });
    // A 404 here means embedKey isn't a legacy single-slot embed — quiz embeds
    // (and any future multi-embed-only tool) only ever exist in the newer
    // per-instance Embed table, so fall back there before giving up. Both
    // endpoints return the same envelope shape (tool_type/poll_data/rating_data/
    // survey_data/embed_settings); the multi-embed one adds quiz_data.
    if (res.status === 404) return this.fetchEmbed(embedKey);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }

  async fetchEmbed(embedKey) {
    const res = await fetch(`${this.baseUrl}/api/v1/embeds/public/${embedKey}/?src=embed`, {
      headers: { 'X-SDK-Version': SDK_VERSION },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }

  async fetchQuizAttemptStatus(embedKey, { externalRespondentId, anonymousId } = {}) {
    const params = new URLSearchParams();
    if (externalRespondentId) params.set('external_respondent_id', externalRespondentId);
    if (anonymousId) params.set('anonymous_id', anonymousId);
    const qs = params.toString();
    const res = await fetch(
      `${this.baseUrl}/api/v1/embeds/public/${embedKey}/quiz-attempt-status/${qs ? `?${qs}` : ''}`,
      { headers: { 'X-SDK-Version': SDK_VERSION } }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }

  /**
   * Instant-feedback check for one question (only meaningful when the embed's
   * instant_feedback setting is on — the endpoint 403s otherwise). Never
   * returns the answer key, just whether the given selection was correct.
   */
  async checkQuizAnswer(embedKey, { questionId, selectedOptionIds, matches, externalRespondentId }) {
    const anonymousId = await getVoterId(this.baseUrl);
    const res = await fetch(`${this.baseUrl}/api/v1/embeds/public/${embedKey}/quiz-question-check/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-SDK-Version': SDK_VERSION },
      body: JSON.stringify({
        question_id: questionId,
        // matching only — replaces option_ids for this question.
        ...(matches ? { matches } : { option_ids: selectedOptionIds }),
        anonymous_id: anonymousId,
        external_respondent_id: externalRespondentId || '',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }

  /**
   * Submit a completed (or partially completed) quiz attempt.
   * @param {string} quizSlug - `quiz_data.slug` from the fetch envelope. This
   *   endpoint is shared with native (non-embed) quiz-taking, hence slug-keyed
   *   rather than embed_key-keyed.
   * @param {Object} opts
   * @param {string} opts.embedKey - Links the response back to this embed for
   *   retake-policy enforcement and the completion webhook.
   * @param {Array<{question: number, selected_options?: Array<{option: number}>, matches?: Array<{prompt: number, option: number}>, time_spent?: number}>} opts.answers
   *   For matching questions, `matches` replaces `selected_options`.
   * @param {number} [opts.totalTimeSpent] - Seconds, whole attempt.
   * @param {string} [opts.externalRespondentId]
   */
  async submitQuiz(quizSlug, { embedKey, answers, totalTimeSpent, externalRespondentId }) {
    const anonymousId = await getVoterId(this.baseUrl);
    const res = await fetch(`${this.baseUrl}/api/v1/quizzes/${quizSlug}/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-SDK-Version': SDK_VERSION },
      body: JSON.stringify({
        answers,
        anonymous_id: anonymousId,
        total_time_spent: totalTimeSpent,
        external_respondent_id: externalRespondentId || '',
        embed_key: embedKey,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }

  /** @deprecated Use fetchTool() — kept for internal poll refresh paths */
  async fetchPoll(embedKey) {
    return this.fetchTool(embedKey);
  }

  async vote(embedKey, optionId, remove = false) {
    const voterId = await getVoterId(this.baseUrl);
    const res = await fetch(`${this.baseUrl}/api/v1/widgets/${embedKey}/vote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SDK-Version': SDK_VERSION,
      },
      body: JSON.stringify({
        option_id: optionId,
        voter_id: voterId,
        remove_vote: remove,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }

  async submitRating(embedKey, { rating, comment }) {
    const voterId = await getVoterId(this.baseUrl);
    const res = await fetch(`${this.baseUrl}/api/v1/widgets/${embedKey}/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SDK-Version': SDK_VERSION,
      },
      body: JSON.stringify({
        voter_id: voterId,
        rating,
        comment: comment || '',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }

  async submitSurvey(embedKey, answers) {
    const voterId = await getVoterId(this.baseUrl);
    const res = await fetch(`${this.baseUrl}/api/v1/widgets/${embedKey}/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SDK-Version': SDK_VERSION,
      },
      body: JSON.stringify({
        voter_id: voterId,
        answers,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }
}
