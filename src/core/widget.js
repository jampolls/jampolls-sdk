import { JampollsApi } from './api.js';
import { renderLoading, renderError, renderPoll } from './renderer.js';

export class Widget {
  constructor(embedKey, container, opts) {
    this.embedKey = embedKey;
    this.container = container;
    this.opts = opts || {};
    this.api = new JampollsApi(this.opts.apiUrl);
    this.data = null;
    this.votedOptionIds = new Set();
    this.pendingOptionIds = new Set();
    this.submitting = false;
    this.feedback = null;
    this._destroyed = false;
    this._isHorizontal = false;
    this._ro = null;
  }

  _getLayoutClass() {
    const layout = this.opts.layout || 'auto';
    if (layout === 'horizontal') return 'jp-layout-horizontal';
    if (layout === 'auto' && this._isHorizontal) return 'jp-layout-horizontal';
    return '';
  }

  _applyLayout() {
    const el = this.container.querySelector('.jp-widget');
    if (el) el.classList.toggle('jp-layout-horizontal', this._getLayoutClass() === 'jp-layout-horizontal');
  }

  _setupLayoutObserver() {
    if ((this.opts.layout || 'auto') !== 'auto') return;
    if (typeof ResizeObserver === 'undefined') return;
    this._ro = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width;
      if (width === undefined) return;
      const wasHorizontal = this._isHorizontal;
      this._isHorizontal = width > 520;
      if (wasHorizontal !== this._isHorizontal) this._applyLayout();
    });
    this._ro.observe(this.container);
  }

  init() {
    renderLoading(this.container);
    this._setupLayoutObserver();
    this._load();
  }

  async _load() {
    try {
      this.data = await this.api.fetchPoll(this.embedKey);
      if (this._destroyed) return;
      this.feedback = null;
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
    const pollData = this.data?.poll_data || {};
    const allowMultipleVotes = Boolean(pollData.allow_multiple_votes);
    const canChangeVote = pollData.can_change_vote !== false;
    const alreadyVoted = this.votedOptionIds.has(optionId);
    const hasVoted = this.votedOptionIds.size > 0;

    if (allowMultipleVotes) {
      if (!canChangeVote && hasVoted) return;
      if (this.pendingOptionIds.has(optionId)) {
        this.pendingOptionIds.delete(optionId);
      } else {
        this.pendingOptionIds.add(optionId);
      }
      this.feedback = null;
      this._render();
      return;
    }

    if (!canChangeVote && (alreadyVoted || (!allowMultipleVotes && hasVoted))) return;

    this.submitting = true;
    this.feedback = null;
    this._render();

    const removing = alreadyVoted;

    try {
      await this.api.vote(this.embedKey, optionId, removing);
      if (allowMultipleVotes) {
        if (removing) {
          this.votedOptionIds.delete(optionId);
        } else {
          this.votedOptionIds.add(optionId);
        }
      } else {
        this.votedOptionIds = removing ? new Set() : new Set([optionId]);
      }

      // Re-fetch for up-to-date counts
      this.data = await this.api.fetchPoll(this.embedKey);
      this.feedback = null;

      if (this.opts.onVote) this.opts.onVote({ optionId, removed: removing });
    } catch (err) {
      this.feedback = { type: 'error', message: err.message || 'Could not submit your vote. Please try again.' };
      if (this.opts.onError) this.opts.onError(err);
    } finally {
      this.submitting = false;
      if (!this._destroyed) this._render();
    }
  }

  async _submitMultipleVotes() {
    if (this.submitting || this._destroyed) return;
    const pollData = this.data?.poll_data || {};
    if (!pollData.allow_multiple_votes) return;
    if (pollData.can_change_vote === false && this.votedOptionIds.size > 0) return;

    const selectedIds = new Set(this.pendingOptionIds);
    const addedOptionIds = Array.from(selectedIds).filter(id => !this.votedOptionIds.has(id));
    const removedOptionIds = Array.from(this.votedOptionIds).filter(id => !selectedIds.has(id));
    if (addedOptionIds.length === 0 && removedOptionIds.length === 0) return;

    this.submitting = true;
    this.feedback = null;
    this._render();

    try {
      await Promise.all([
        ...addedOptionIds.map(id => this.api.vote(this.embedKey, id, false)),
        ...removedOptionIds.map(id => this.api.vote(this.embedKey, id, true)),
      ]);

      this.votedOptionIds = selectedIds;
      this.pendingOptionIds = new Set(selectedIds);
      this.data = await this.api.fetchPoll(this.embedKey);
      this.feedback = null;

      if (this.opts.onVote) {
        this.opts.onVote({
          optionIds: Array.from(selectedIds),
          addedOptionIds,
          removedOptionIds,
        });
      }
    } catch (err) {
      this.feedback = { type: 'error', message: err.message || 'Could not submit your vote. Please try again.' };
      if (this.opts.onError) this.opts.onError(err);
    } finally {
      this.submitting = false;
      if (!this._destroyed) this._render();
    }
  }

  _render() {
    if (!this.data || this._destroyed) return;
    renderPoll(this.container, this.data, {
      votedOptionIds: Array.from(this.votedOptionIds),
      selectedOptionIds: Array.from(
        this.data.poll_data?.allow_multiple_votes ? this.pendingOptionIds : this.votedOptionIds
      ),
      submitting: this.submitting,
      feedback: this.feedback,
      onOptionClick: id => this._vote(id),
      onSubmit: () => this._submitMultipleVotes(),
      themeOverride: this.opts.theme,
      vars: this.opts.vars,
      layoutClass: this._getLayoutClass(),
    });
  }

  refresh() {
    if (this._destroyed) return;
    renderLoading(this.container);
    this._load();
  }

  destroy() {
    this._destroyed = true;
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    this.container.innerHTML = '';
  }
}
