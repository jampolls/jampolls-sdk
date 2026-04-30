import '../styles/widget.css';
import { Widget } from './widget.js';

const _registry = new WeakMap();

const JamPolls = {
  /**
   * Embed a Jampolls poll into a container element.
   * @param {string} embedKey - Your embed key from the Jampolls dashboard.
   * @param {string|HTMLElement} target - CSS selector or DOM element to embed into.
   * @param {Object} [opts] - Optional configuration.
   * @returns {Widget|null}
   */
  embed(embedKey, target, opts) {
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) {
      console.warn('[Jampolls] Container not found:', target);
      return null;
    }

    // Remove any existing widget in this container first
    JamPolls.removeWidget(container);

    const widget = new Widget(embedKey, container, opts || {});
    _registry.set(container, widget);
    widget.init();
    return widget;
  },

  /**
   * Get the widget instance for a container.
   * @param {string|HTMLElement} target
   * @returns {Widget|null}
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

// Auto-run on DOM ready when loaded via <script> tag
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => JamPolls.autoEmbed());
  } else {
    JamPolls.autoEmbed();
  }
}

export default JamPolls;
