import '../styles/widget.css';
import { JampollsApi } from './api.js';
import { getVoterId } from './voter.js';
import { PollWidget } from './widget.js';
import { RatingWidget } from './rating.js';
import { SurveyWidget } from './survey.js';
import { renderLoading, renderError } from './renderer.js';

const _registry = new WeakMap();
const _context = new WeakMap();

function createWidget(toolType, embedKey, container, opts) {
  switch (toolType) {
    case 'rating':
      return new RatingWidget(embedKey, container, opts);
    case 'survey':
      return new SurveyWidget(embedKey, container, opts);
    default:
      return new PollWidget(embedKey, container, opts);
  }
}

async function mountWidget(embedKey, container, opts) {
  const api = new JampollsApi(opts.apiUrl);
  renderLoading(container);

  try {
    await getVoterId(api.baseUrl);
    const envelope = await api.fetchTool(embedKey);
    if (!container.isConnected) return null;

    const widgetOpts = {
      ...opts,
      onToolSwitch: (payload) => {
        if (opts.onToolChanged) opts.onToolChanged(payload);
        remountWidget(container);
      },
    };

    const widget = createWidget(envelope.tool_type, embedKey, container, widgetOpts);
    _registry.set(container, widget);
    widget.init(envelope);
    return widget;
  } catch (err) {
    if (!container.isConnected) return null;
    renderError(container, 'Could not load widget. Please try again.');
    if (opts.onError) opts.onError(err);
    return null;
  }
}

function remountWidget(container) {
  const ctx = _context.get(container);
  if (!ctx) return;

  const existing = _registry.get(container);
  if (existing) {
    existing.destroy();
    _registry.delete(container);
  }

  mountWidget(ctx.embedKey, container, ctx.opts);
}

const JamPolls = {
  /**
   * Embed a Jampolls widget (poll, rating, or survey) into a container element.
   * @param {string} embedKey - Your embed key from the Jampolls dashboard.
   * @param {string|HTMLElement} target - CSS selector or DOM element to embed into.
   * @param {Object} [opts] - Optional configuration.
   * @returns {PollWidget|RatingWidget|SurveyWidget|null}
   */
  embed(embedKey, target, opts) {
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) {
      console.warn('[Jampolls] Container not found:', target);
      return null;
    }

    JamPolls.removeWidget(container);

    const resolvedOpts = opts || {};
    _context.set(container, { embedKey, opts: resolvedOpts });

    mountWidget(embedKey, container, resolvedOpts);
    return _registry.get(container) || null;
  },

  /**
   * Get the widget instance for a container.
   * @param {string|HTMLElement} target
   */
  getWidget(target) {
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    return container ? (_registry.get(container) || null) : null;
  },

  /**
   * Destroy and remove the widget from a container.
   * @param {string|HTMLElement} target
   */
  removeWidget(target) {
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) return;
    const widget = _registry.get(container);
    if (widget) {
      widget.destroy();
      _registry.delete(container);
    }
    _context.delete(container);
  },

  /**
   * Auto-initialize all elements with a [data-jampolls] attribute on the page.
   */
  autoEmbed() {
    document.querySelectorAll('[data-jampolls]').forEach(el => {
      const key = el.getAttribute('data-jampolls');
      if (!key) return;
      const opts = {};
      const theme = el.getAttribute('data-jampolls-theme');
      if (theme) opts.theme = theme;
      JamPolls.embed(key, el, opts);
    });
  },
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => JamPolls.autoEmbed());
  } else {
    JamPolls.autoEmbed();
  }
}

export default JamPolls;
