function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveTheme(theme) {
  if (theme && theme !== 'auto') return theme;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function renderLoading(container) {
  container.innerHTML =
    '<div class="jp-widget jp-loading" role="status" aria-live="polite">' +
    '<div class="jp-spinner"></div></div>';
}

export function renderError(container, message) {
  container.innerHTML =
    `<div class="jp-widget jp-error" role="alert">` +
    `<p class="jp-error-msg">${esc(message)}</p></div>`;
}

export function renderPoll(container, data, state) {
  const { poll_data, embed_settings } = data;
  const { question, options, votes_count } = poll_data;
  const { show_results, show_branding } = embed_settings;
  const { votedOptionId, submitting, onOptionClick, themeOverride, vars } = state;

  // Developer's theme option overrides the poll owner's backend default.
  // show_branding and show_results are NOT overridable — they're subscription-gated on the backend.
  const themeClass = resolveTheme(themeOverride || embed_settings.theme);

  const optionsHtml = options
    .map(opt => {
      const voted = votedOptionId === opt.id;
      const pct =
        show_results && votes_count > 0
          ? Math.round((opt.votes_count / votes_count) * 100)
          : null;

      return (
        `<button class="jp-option${voted ? ' jp-voted' : ''}"` +
        ` data-id="${opt.id}"` +
        (submitting ? ' disabled' : '') +
        ` aria-pressed="${voted}">` +
        (pct !== null ? `<span class="jp-bar" style="--pct:${pct}%"></span>` : '') +
        `<span class="jp-option-text">${esc(opt.text)}</span>` +
        (pct !== null ? `<span class="jp-pct">${pct}%</span>` : '') +
        '</button>'
      );
    })
    .join('');

  const footer = show_branding
    ? '<div class="jp-footer"><a href="https://jampolls.com" target="_blank" rel="noopener noreferrer">Powered by Jampolls</a></div>'
    : '';

  container.innerHTML =
    `<div class="jp-widget jp-theme-${esc(themeClass)}" role="region" aria-label="Poll">` +
    '<div class="jp-header">' +
    `<p class="jp-question">${esc(question)}</p>` +
    `<span class="jp-meta">${Number(votes_count).toLocaleString()} vote${votes_count !== 1 ? 's' : ''}</span>` +
    '</div>' +
    `<div class="jp-options" role="group" aria-label="Poll options">${optionsHtml}</div>` +
    footer +
    '</div>';

  // Apply any CSS custom property overrides the developer passed in
  if (vars && typeof vars === 'object') {
    const el = container.querySelector('.jp-widget');
    if (el) {
      Object.entries(vars).forEach(([prop, val]) => {
        el.style.setProperty(prop, val);
      });
    }
  }

  container.querySelectorAll('.jp-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!submitting && onOptionClick) onOptionClick(Number(btn.dataset.id));
    });
  });
}
