const MIN_MS = 1000;
const MAX_MS = 60000;

const UPDATE_EVENTS = ['poll.update', 'rating.update', 'survey.update'];

export class EmbedSSE {
  constructor(streamUrl, { onEvent, onStale, currentToolType }) {
    this._url = streamUrl;
    this._onEvent = onEvent;
    this._onStale = onStale;
    this._currentToolType = currentToolType || 'poll';
    this._es = null;
    this._backoff = MIN_MS;
    this._timer = null;
    this._destroyed = false;
    this._vh = null;
  }

  setToolType(toolType) {
    this._currentToolType = toolType;
  }

  start() {
    this._open();
    this._vh = () => {
      if (document.hidden) {
        this._abort();
      } else {
        this._reconnect(0);
      }
    };
    document.addEventListener('visibilitychange', this._vh);
  }

  _open() {
    if (this._destroyed || (typeof document !== 'undefined' && document.hidden)) return;
    this._es = new EventSource(this._url);

    const handleUpdate = (eventName, e) => {
      const payload = this._json(e.data);
      if (!payload) return;
      this._backoff = MIN_MS;
      this._onEvent?.(eventName, payload);
    };

    this._es.addEventListener('snapshot', e => {
      const payload = this._json(e.data);
      if (!payload) return;
      this._backoff = MIN_MS;

      const snapshotTool = payload.tool;
      if (snapshotTool && snapshotTool !== this._currentToolType) {
        this._onEvent?.('tool_type_changed', {
          tool_type: snapshotTool,
          snapshot: payload,
        });
        return;
      }

      this._onEvent?.('snapshot', payload);
    });

    UPDATE_EVENTS.forEach(name => {
      this._es.addEventListener(name, e => handleUpdate(name, e));
    });

    this._es.addEventListener('tool_type_changed', e => {
      const payload = this._json(e.data);
      if (!payload) return;
      this._backoff = MIN_MS;
      this._onEvent?.('tool_type_changed', payload);
    });

    this._es.onerror = () => {
      this._abort();
      this._onStale?.();
      this._reconnect();
    };
  }

  _abort() {
    if (this._es) { this._es.close(); this._es = null; }
    clearTimeout(this._timer);
  }

  _reconnect(fixed) {
    clearTimeout(this._timer);
    if (this._destroyed) return;
    let delay;
    if (fixed !== undefined) {
      delay = fixed;
    } else {
      const jitter = 1 + (Math.random() * 0.4 - 0.2);
      delay = Math.min(this._backoff * jitter, MAX_MS);
      this._backoff = Math.min(this._backoff * 2, MAX_MS);
    }
    this._timer = setTimeout(() => { if (!this._destroyed) this._open(); }, delay);
  }

  get connected() {
    return this._es !== null && this._es.readyState === 1;
  }

  _json(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }

  destroy() {
    this._destroyed = true;
    this._abort();
    if (this._vh) document.removeEventListener('visibilitychange', this._vh);
  }
}
