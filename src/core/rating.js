import { JampollsApi } from './api.js';
import { EmbedSSE } from './sse.js';
import { renderLoading, renderError, renderRating } from './renderer.js';

export class RatingWidget {
  constructor(embedKey, container, opts) {
    this.embedKey = embedKey;
    this.container = container;
    this.opts = opts || {};
    this.api = new JampollsApi(this.opts.apiUrl);
    this.toolType = 'rating';
    this.data = null;
    this.state = {
      submitted: false,
      selectedRating: null,
      hoveredRating: null,
      comment: '',
      feedback: null,
    };
    this.submitting = false;
    this._destroyed = false;
    this._sse = null;
  }

  _applySsePayload(payload) {
    if (!this.data || payload.tool !== 'rating') return;
    const rd = this.data.rating_data || {};
    this.data = {
      ...this.data,
      rating_data: {
        ...rd,
        title: payload.title ?? rd.title,
        average_rating: payload.average_rating ?? rd.average_rating,
        response_count: payload.response_count ?? rd.response_count,
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
    if (event === 'rating.update' || (event === 'snapshot' && payload.tool === 'rating')) {
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
      submitted: false,
      selectedRating: null,
      hoveredRating: null,
      comment: '',
      feedback: null,
    };
    this._render();
    this._startSSE();
    if (this.opts.onLoad) this.opts.onLoad(this.data);
  }

  _selectRating(value) {
    if (this.submitting || this.state.submitted || this._destroyed) return;
    this.state.selectedRating = value;
    this.state.feedback = null;
    this._render();
  }

  _setComment(value) {
    this.state.comment = value;
    this._render();
  }

  async _submitRating() {
    if (this.submitting || this.state.submitted || this._destroyed) return;
    const ratingData = this.data?.rating_data || {};
    if (!this.state.selectedRating) return;
    if (ratingData.require_comments && !this.state.comment.trim()) return;

    this.submitting = true;
    this.state.feedback = null;
    this._render();

    try {
      await this.api.submitRating(this.embedKey, {
        rating: this.state.selectedRating,
        comment: this.state.comment.trim(),
      });
      this.state.submitted = true;
      this.state.feedback = null;
      if (this.opts.onSubmit) this.opts.onSubmit({ rating: this.state.selectedRating });
    } catch (err) {
      this.state.feedback = { type: 'error', message: err.message || 'Could not submit your rating. Please try again.' };
      if (this.opts.onError) this.opts.onError(err);
    } finally {
      this.submitting = false;
      if (!this._destroyed) this._render();
    }
  }

  _render() {
    if (!this.data || this._destroyed) return;
    renderRating(this.container, this.data, {
      ...this.state,
      submitting: this.submitting,
      onSelectRating: value => this._selectRating(value),
      onCommentChange: value => this._setComment(value),
      onSubmit: () => this._submitRating(),
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
      renderError(this.container, 'Could not load rating. Please try again.');
      if (this.opts.onError) this.opts.onError(err);
    });
  }

  destroy() {
    this._destroyed = true;
    if (this._sse) { this._sse.destroy(); this._sse = null; }
    this.container.innerHTML = '';
  }
}
