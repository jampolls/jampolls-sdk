import { JampollsApi } from './api.js';
import { renderLoading, renderError, renderPoll } from './renderer.js';

export class Widget {
  constructor(embedKey, container, opts) {
    this.embedKey = embedKey;
    this.container = container;
    this.opts = opts || {};
    this.api = new JampollsApi(this.opts.apiUrl);
    this.data = null;
    this.votedOptionId = null;
    this.submitting = false;
    this._destroyed = false;
  }

  init() {
    renderLoading(this.container);
    this._load();
  }

  async _load() {
    try {
      this.data = await this.api.fetchPoll(this.embedKey);
      if (this._destroyed) return;
      this._render();
      if (this.opts.onLoad) this.opts.onLoad(this.data);
    } catch (err) {
      if (this._destroyed) return;
      renderError(this.container, 'Could not load poll. Please try again.');
      if (this.opts.onError) this.opts.onError(err);
    }
  }

  async _vote(optionId) {
    if (this.submitting || this._destroyed) return;
    this.submitting = true;
    this._render();

    const removing = this.votedOptionId === optionId;

    try {
      await this.api.vote(this.embedKey, optionId, removing);
      this.votedOptionId = removing ? null : optionId;

      // Re-fetch for up-to-date counts
      this.data = await this.api.fetchPoll(this.embedKey);

      if (this.opts.onVote) this.opts.onVote({ optionId, removed: removing });
    } catch (err) {
      if (this.opts.onError) this.opts.onError(err);
    } finally {
      this.submitting = false;
      if (!this._destroyed) this._render();
    }
  }

  _render() {
    if (!this.data || this._destroyed) return;
    renderPoll(this.container, this.data, {
      votedOptionId: this.votedOptionId,
      submitting: this.submitting,
      onOptionClick: id => this._vote(id),
      themeOverride: this.opts.theme,
      vars: this.opts.vars,
    });
  }

  refresh() {
    if (this._destroyed) return;
    renderLoading(this.container);
    this._load();
  }

  destroy() {
    this._destroyed = true;
    this.container.innerHTML = '';
  }
}
