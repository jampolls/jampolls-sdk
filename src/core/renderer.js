function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function imageUrl(src) {
  const value = String(src || '').trim();
  if (!value) return '';
  if (/^(https?:\/\/|\/|\.\/|\.\.\/|data:image\/)/i.test(value)) return value;
  return '';
}

function formatRelativeTime(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '';
  const diffSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [unit, seconds] of units) {
    const amount = Math.floor(diffSeconds / seconds);
    if (amount >= 1) return `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;
  }

  return 'Just now';
}

function resolveTheme(theme) {
  if (['light', 'dark', 'jampolls'].includes(theme)) return theme;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const BRAND_LOGO_SVG =
  '<svg class="jp-brand-logo" width="124" height="32" viewBox="0 0 124 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
  '<path d="M23.9614 4.68894L24.8906 4.63855L24.6381 0L8.87856 0.860935L9.12996 5.49948L10.4362 5.42704C12.9187 5.2916 15.6705 5.37349 17.2564 7.00402C18.1677 7.94055 19.6489 10.1328 19.321 14.2852L19.3137 14.3482C18.9586 17.582 18.1897 19.4991 16.5703 21.1832C14.3653 23.4783 11.0783 23.6831 9.55105 23.0993C8.18826 22.5775 7.24447 21.5528 6.92917 20.2666C7.70013 20.6939 8.48365 21.0047 9.26194 21.1937C10.0874 21.3932 10.8929 21.494 11.6555 21.494C12.9585 21.494 14.1255 21.2073 15.1237 20.6425C16.1429 20.0671 16.939 19.2293 17.489 18.1521C18.0546 17.0444 18.2976 15.8989 18.2107 14.7461C18.1279 13.6647 17.7456 12.62 17.1045 11.7234C15.6611 9.70652 13.078 8.64924 10.5242 9.02827C9.13939 9.233 7.05068 10.012 5.33803 11.5838C5.21862 11.694 5.1013 11.8074 4.98607 11.925C4.68125 11.4651 4.50946 11.1586 4.50108 11.1449L4.04752 10.3428L0 12.5854L0.45147 13.4033C0.533174 13.5492 1.2748 14.8658 2.50351 16.3777C2.25002 17.3951 2.14317 18.4881 2.18507 19.6272C2.25211 21.4341 2.85756 23.1276 3.93544 24.5261C4.9316 25.8207 6.30277 26.8276 7.89811 27.4386C9.03673 27.8743 10.2393 28.0959 11.4701 28.0959C12.2117 28.0959 13.4456 27.9646 14.1642 27.8082C16.122 27.383 18.2704 26.1115 19.9087 24.4054C22.1535 22.0693 23.2229 19.392 23.7215 14.8564C23.9866 12.4321 23.6901 9.52173 23.3465 6.15358L23.2795 5.48793C23.2586 5.28845 23.3193 5.09421 23.4492 4.94198C23.5791 4.78974 23.7614 4.69944 23.9614 4.68894ZM8.05628 15.4349C8.18512 15.2858 8.32339 15.143 8.46899 15.0097C9.47458 14.0857 10.6603 13.7036 11.2029 13.6227C12.0462 13.4978 12.8716 13.8044 13.3189 14.4049L13.3388 14.4322C13.6708 14.8942 13.6782 15.4191 13.3639 16.0344C12.8203 17.098 11.2428 16.8943 10.3492 16.678C9.64533 16.5069 8.85342 16.0785 8.05628 15.4349Z" fill="#FF9724"/>' +
  '<path d="M31.6117 13.4404C28.8662 13.4404 26.5491 14.1029 24.7223 15.4111L24.6123 15.4899L24.737 16.5503L24.8889 17.8448L25.024 19.0008C26.922 17.6716 28.9531 17.0249 31.2325 17.0249C32.0967 17.0249 33.5443 17.1362 33.5443 17.8753C33.5443 18.2375 33.2217 18.5609 31.6546 18.9599L29.4339 19.4659C25.8002 20.2901 24.1074 21.8177 24.1074 24.2746C24.1074 26.6925 26.0432 28.2548 29.038 28.2548C30.5348 28.2548 31.8013 27.901 32.7262 27.249C33.0698 27.0065 33.5443 27.2616 33.5443 27.6826V28.5687H38.2318V18.5588C38.2318 15.2578 35.8802 13.4404 31.6117 13.4404ZM30.4762 25.0232C29.7817 25.0232 28.6179 24.8709 28.6179 23.8441C28.6179 23.1795 29.0673 22.5989 31.2576 21.9206L33.5443 21.2371V22.2766C33.5443 23.9963 32.3973 25.0232 30.4762 25.0232Z" fill="#FF9724"/>' +
  '<path d="M64.0061 19.7215V28.5682H59.3448V20.5058C59.3448 18.7273 58.4649 17.7078 56.9314 17.7078C55.1129 17.7078 53.9387 19.2522 53.9387 21.644V28.5682H49.2763V20.5058C49.2763 18.7273 48.4058 17.7078 46.889 17.7078C45.0706 17.7078 43.8953 19.2522 43.8953 21.644V28.5682H39.2078V13.6331H43.8953V14.5937C43.8953 15.0316 44.4012 15.2814 44.7417 15.0074C45.6823 14.2473 46.9288 13.8441 48.4027 13.8441C50.6139 13.8441 52.4114 14.8405 53.3154 16.535C54.3786 14.7491 56.1017 13.8441 58.445 13.8441C61.8232 13.8441 64.0061 16.1508 64.0061 19.7215Z" fill="#FF9724"/>' +
  '<path d="M74.4873 13.5444C72.9307 13.5444 71.5774 13.9539 70.5634 14.7035C70.2167 14.9597 69.7275 14.714 69.7275 14.2825V13.6316H65.041V31.9999H69.7275V26.4123C70.7415 27.6585 72.4269 28.3578 74.4873 28.3578C78.6469 28.3578 81.3348 25.4453 81.3348 20.938C81.3348 16.4464 78.6469 13.5444 74.4873 13.5444ZM73.1748 24.4699C71.0484 24.4699 69.7275 23.1166 69.7275 20.939C69.7275 18.7604 71.0484 17.4071 73.1748 17.4071C75.3012 17.4071 76.6221 18.7604 76.6221 20.939C76.6221 23.1166 75.3012 24.4699 73.1748 24.4699Z" fill="#FF9724"/>' +
  '<path d="M90.4761 13.439C85.5801 13.439 82.291 16.4732 82.291 20.99C82.291 25.5225 85.5906 28.5673 90.5013 28.5673C95.4119 28.5673 98.7115 25.5225 98.7115 20.99C98.7115 16.4732 95.4025 13.439 90.4761 13.439ZM90.5013 24.6217C88.3591 24.6217 87.0288 23.2295 87.0288 20.99C87.0288 18.7999 88.3916 17.3835 90.5013 17.3835C92.6109 17.3835 93.9737 18.7999 93.9737 20.99C93.9737 23.2305 92.6434 24.6217 90.5013 24.6217Z" fill="#FF9724"/>' +
  '<path d="M104.341 9.31665H99.6279V28.568H104.341V9.31665Z" fill="#FF9724"/>' +
  '<path d="M110.027 9.31665H105.314V28.568H110.027V9.31665Z" fill="#FF9724"/>' +
  '<path d="M124.002 24.0379C124.002 26.8318 121.571 28.5683 117.658 28.5683C115.218 28.5683 112.946 28.0759 111.426 27.2171L111.291 27.1404V23.2043L111.686 23.4458C113.163 24.3487 115.251 24.9314 117.003 24.9314C117.856 24.9314 119.289 24.7981 119.289 23.9088C119.289 23.1297 117.96 22.7696 116.421 22.3538C114.045 21.7123 111.088 20.9134 111.088 17.9421C111.088 15.206 113.647 13.439 117.608 13.439C119.597 13.439 121.591 13.882 123.076 14.6558L123.219 14.7293V18.6623L122.828 18.4324C121.286 17.5305 119.674 17.0727 118.036 17.0727C116.679 17.0727 115.801 17.4654 115.801 18.0712C115.801 18.8503 117.13 19.2093 118.669 19.6251C121.045 20.2666 124.002 21.0656 124.002 24.0379Z" fill="#FF9724"/>' +
  '</svg>';

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
  const { question, options, votes_count, created_at, image } = poll_data;
  const { show_results, show_branding } = embed_settings;
  const { votedOptionIds, selectedOptionIds, submitting, feedback, onOptionClick, onSubmit, themeOverride, vars } = state;
  const selectedIds = new Set(votedOptionIds || []);
  const pendingIds = new Set(selectedOptionIds || votedOptionIds || []);
  const allowMultipleVotes = Boolean(poll_data.allow_multiple_votes);
  const canChangeVote = poll_data.can_change_vote !== false;
  const hasSubmittedVotes = selectedIds.size > 0;
  const currentSelection = allowMultipleVotes ? pendingIds : selectedIds;
  const hasSelectionChanges =
    allowMultipleVotes &&
    (currentSelection.size !== selectedIds.size ||
      Array.from(currentSelection).some(id => !selectedIds.has(id)));

  // Developer's theme option overrides the poll owner's backend default.
  // show_branding and show_results are NOT overridable — they're subscription-gated on the backend.
  const themeClass = resolveTheme(themeOverride || embed_settings.theme);
  const relativeTime = formatRelativeTime(created_at);
  const pollImage = imageUrl(image);
  const badges = [
    poll_data.allow_anonymous ? 'Anonymous poll' : '',
    allowMultipleVotes ? 'Multi-choice' : '',
  ].filter(Boolean);
  const badgesHtml = badges.length
    ? `<div class="jp-badges">${badges.map(label => `<span class="jp-badge">${esc(label)}</span>`).join('')}</div>`
    : '';
  const pollImageHtml = pollImage ? `<img class="jp-poll-image" src="${esc(pollImage)}" alt="">` : '';

  const sortedOptions = [...options].sort((a, b) => {
    const placementA = Number(a.placement);
    const placementB = Number(b.placement);
    if (!Number.isFinite(placementA) || !Number.isFinite(placementB)) return 0;
    return placementA - placementB;
  });

  const optionsHtml = sortedOptions
    .map(opt => {
      const optionId = Number(opt.id);
      const voted = currentSelection.has(optionId);
      const optionImage = imageUrl(opt.image);
      const disabled = submitting || (!canChangeVote && hasSubmittedVotes);
      const pct =
        show_results && votes_count > 0
          ? Math.round((opt.votes_count / votes_count) * 100)
          : null;

      return (
        `<button class="jp-option${voted ? ' jp-voted' : ''}"` +
        ` data-id="${Number.isFinite(optionId) ? optionId : ''}"` +
        (disabled ? ' disabled' : '') +
        ` aria-pressed="${voted}">` +
        (pct !== null ? `<span class="jp-bar" style="--pct:${pct}%"></span>` : '') +
        (allowMultipleVotes ? `<span class="jp-choice-indicator" aria-hidden="true"></span>` : '') +
        (optionImage ? `<img class="jp-option-image" src="${esc(optionImage)}" alt="">` : '') +
        `<span class="jp-option-text">${esc(opt.text)}</span>` +
        (pct !== null ? `<span class="jp-pct">${pct}%</span>` : '') +
        '</button>'
      );
    })
    .join('');

  const footer = show_branding
    ? `<div class="jp-footer"><a href="https://jampolls.com" target="_blank" rel="noopener noreferrer"><span>Powered by</span>${BRAND_LOGO_SVG}</a></div>`
    : '';
  const submit = allowMultipleVotes
    ? `<div class="jp-actions"><button class="jp-submit" type="button"${submitting || !hasSelectionChanges ? ' disabled' : ''}>${submitting ? 'Submitting...' : 'Submit vote'}</button></div>`
    : '';
  const feedbackHtml = feedback?.message
    ? `<div class="jp-feedback jp-feedback-${esc(feedback.type || 'error')}" role="alert">${esc(feedback.message)}</div>`
    : '';

  container.innerHTML =
    `<div class="jp-widget jp-theme-${esc(themeClass)}" role="region" aria-label="Poll">` +
    '<div class="jp-header">' +
    `<p class="jp-question">${esc(question)}</p>` +
    '<div class="jp-meta-row">' +
    `<span class="jp-meta">${Number(votes_count).toLocaleString()} vote${votes_count !== 1 ? 's' : ''}</span>` +
    (relativeTime ? `<span class="jp-meta">${esc(relativeTime)}</span>` : '') +
    '</div>' +
    badgesHtml +
    '</div>' +
    feedbackHtml +
    pollImageHtml +
    `<div class="jp-options${allowMultipleVotes ? ' jp-options-multiple' : ''}" role="group" aria-label="Poll options">${optionsHtml}</div>` +
    submit +
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
      const optionId = Number(btn.dataset.id);
      if (!submitting && Number.isFinite(optionId) && onOptionClick) onOptionClick(optionId);
    });
  });

  const submitButton = container.querySelector('.jp-submit');
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      if (!submitting && onSubmit) onSubmit();
    });
  }
}
