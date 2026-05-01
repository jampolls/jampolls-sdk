const MIN_MS = 1000;
const MAX_MS = 60000;

export class EmbedSSE {
  constructor(streamUrl, { onData, onStale }) {
    this._url = streamUrl;
    this._onData = onData;
    this._onStale = onStale;
    this._es = null;
    this._backoff = MIN_MS;
    this._timer = null;
    this._destroyed = false;
    this._vh = null;
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

    const handle = e => {
      const data = this._json(e.data);
      if (!data) return;
      this._backoff = MIN_MS;
      this._onData(data);
    };

    this._es.addEventListener('snapshot', handle);
    this._es.addEventListener('poll.update', handle);

    this._es.onerror = () => {
      this._abort();
      this._onStale();
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

  _json(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }

  destroy() {
    this._destroyed = true;
    this._abort();
    if (this._vh) document.removeEventListener('visibilitychange', this._vh);
  }
}
