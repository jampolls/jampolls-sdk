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

/**
 * Applies CSS custom property overrides and the fixed-height mode to the
 * rendered .jp-widget element. Shared by every tool renderer so this stays
 * one behavior instead of four copies that could drift.
 */
export function applyWidgetVisualOverrides(container, vars, autoHeight) {
  const el = container.querySelector('.jp-widget');
  if (!el) return;
  if (vars && typeof vars === 'object') {
    Object.entries(vars).forEach(([prop, val]) => el.style.setProperty(prop, val));
  }
  el.classList.toggle('jp-fixed-height', autoHeight === false);
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

// startTrigger: 'cover' — a small branded start screen shown in place of the
// real tool until the visitor opts in. Nothing is fetched or mounted until
// the button is clicked, so a scroll-by impression never counts as an attempt.
export function renderCoverScreen(container, opts, onStart) {
  const themeClass = resolveTheme(opts.theme);
  const label = opts.startLabel || 'Start';

  container.innerHTML =
    `<div class="jp-widget jp-theme-${esc(themeClass)} jp-cover" role="region" aria-label="${esc(label)}">` +
    `<button type="button" class="jp-cover-btn">${esc(label)}</button>` +
    `</div>`;

  container.querySelector('.jp-cover-btn').addEventListener('click', onStart, { once: true });
}

export function renderPoll(container, data, state) {
  const { poll_data, embed_settings } = data;
  const { question, options, votes_count, created_at, image } = poll_data;
  const { show_results, show_branding } = embed_settings;
  const { votedOptionIds, selectedOptionIds, submitting, feedback, onOptionClick, onSubmit, themeOverride, vars, layoutClass, isStale, lastFetchedAt } = state;
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

  const showingResults = show_results && votes_count > 0;
  const maxVotes = showingResults
    ? Math.max(...sortedOptions.map(o => Number(o.votes_count) || 0))
    : 0;

  const optionsHtml = sortedOptions
    .map(opt => {
      const optionId = Number(opt.id);
      const voted = currentSelection.has(optionId);
      const optionImage = imageUrl(opt.image);
      const disabled = submitting || (!canChangeVote && hasSubmittedVotes);
      const pct =
        showingResults
          ? Math.round((opt.votes_count / votes_count) * 100)
          : null;
      const isLeading = showingResults && maxVotes > 0 && Number(opt.votes_count) === maxVotes;

      return (
        `<button class="jp-option${voted ? ' jp-voted' : ''}"` +
        ` data-id="${Number.isFinite(optionId) ? optionId : ''}"` +
        (disabled ? ' disabled' : '') +
        ` aria-pressed="${voted}">` +
        (pct !== null ? `<span class="jp-bar" style="--pct:${pct}%"></span>` : '') +
        (allowMultipleVotes ? `<span class="jp-choice-indicator" aria-hidden="true"></span>` : '') +
        (optionImage ? `<img class="jp-option-image" src="${esc(optionImage)}" alt="">` : '') +
        `<span class="jp-option-text">${esc(opt.text)}</span>` +
        (pct !== null ? `<span class="jp-pct">${isLeading ? '🔥 ' : ''}${pct}%</span>` : '') +
        '</button>'
      );
    })
    .join('');

  const staleNotice = isStale && lastFetchedAt
    ? `<div class="jp-stale-notice" role="status">Last synced ${formatRelativeTime(lastFetchedAt)}</div>`
    : '';
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
    `<div class="jp-widget jp-theme-${esc(themeClass)}${layoutClass ? ' ' + layoutClass : ''}" role="region" aria-label="Poll">` +
    '<div class="jp-body">' +
    '<div class="jp-col-left">' +
    '<div class="jp-header">' +
    `<p class="jp-question">${esc(question)}</p>` +
    '<div class="jp-meta-row">' +
    `<span class="jp-meta">${Number(votes_count).toLocaleString()} vote${votes_count !== 1 ? 's' : ''}</span>` +
    (relativeTime ? `<span class="jp-meta">${esc(relativeTime)}</span>` : '') +
    '</div>' +
    badgesHtml +
    '</div>' +
    pollImageHtml +
    '</div>' +
    '<div class="jp-col-right">' +
    feedbackHtml +
    `<div class="jp-options${allowMultipleVotes ? ' jp-options-multiple' : ''}" role="group" aria-label="Poll options">${optionsHtml}</div>` +
    submit +
    '</div>' +
    '</div>' +
    staleNotice +
    footer +
    '</div>';

  // Apply any CSS custom property overrides the developer passed in
  applyWidgetVisualOverrides(container, vars, embed_settings.auto_height);

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

const RATING_EMOJIS = ['😞', '😐', '🙂', '😀', '😍'];

function formatAverage(avg) {
  if (avg == null) return null;
  const n = Number(avg);
  return Number.isFinite(n) ? n.toFixed(1) : null;
}

export function renderRating(container, data, state) {
  const { rating_data, embed_settings } = data;
  const {
    submitted,
    selectedRating,
    comment,
    feedback,
    submitting,
    onSelectRating,
    onCommentChange,
    onSubmit,
    themeOverride,
    vars,
  } = state;

  const themeClass = resolveTheme(themeOverride || embed_settings.theme);
  const { show_branding } = embed_settings;
  const {
    title,
    description,
    rating_type: ratingType,
    max_rating: maxRating,
    min_label: minLabel,
    max_label: maxLabel,
    show_average: showAverage,
    require_comments: requireComments,
    average_rating: averageRating,
    response_count: responseCount,
  } = rating_data;

  const showAvg =
    showAverage &&
    (submitted || responseCount > 0) &&
    averageRating != null;
  const avgFormatted = formatAverage(averageRating);
  const avgHtml = showAvg
    ? `<div class="jp-avg-display">${avgFormatted} avg · ${Number(responseCount).toLocaleString()} rating${responseCount !== 1 ? 's' : ''}</div>`
    : '';

  const footer = show_branding
    ? `<div class="jp-footer"><a href="https://jampolls.com" target="_blank" rel="noopener noreferrer"><span>Powered by</span>${BRAND_LOGO_SVG}</a></div>`
    : '';

  const feedbackHtml = feedback?.message
    ? `<div class="jp-feedback jp-feedback-${esc(feedback.type || 'error')}" role="alert">${esc(feedback.message)}</div>`
    : '';

  let bodyContent = '';

  if (submitted) {
    bodyContent =
      `<div class="jp-rating-submitted"><p>Thanks for rating!</p>${avgHtml}</div>`;
  } else {
    if (ratingType === 'numbers') {
      const buttons = Array.from({ length: maxRating }, (_, i) => {
        const val = i + 1;
        const selected = selectedRating === val;
        return `<button type="button" class="jp-number-btn${selected ? ' jp-selected' : ''}" data-value="${val}" aria-pressed="${selected}">${val}</button>`;
      }).join('');
      bodyContent = `<div class="jp-numbers" role="group" aria-label="Rate from 1 to ${maxRating}">${buttons}</div>`;
    } else if (ratingType === 'emojis') {
      const buttons = RATING_EMOJIS.map((emoji, i) => {
        const val = i + 1;
        const selected = selectedRating === val;
        return `<button type="button" class="jp-emoji-btn${selected ? ' jp-selected' : ''}" data-value="${val}" aria-label="Rate ${val} of 5">${emoji}</button>`;
      }).join('');
      bodyContent = `<div class="jp-emojis" role="group" aria-label="Rate with emoji">${buttons}</div>`;
    } else {
      const stars = Array.from({ length: maxRating }, (_, i) => {
        const val = i + 1;
        const filled = selectedRating != null && val <= selectedRating;
        return `<button type="button" class="jp-star${filled ? ' jp-star-filled' : ''}" data-value="${val}" aria-label="Rate ${val} of ${maxRating}">★</button>`;
      }).join('');
      bodyContent = `<div class="jp-stars" role="group" aria-label="Rate with stars" data-selected="${selectedRating ?? ''}">${stars}</div>`;
    }

    const labelsHtml =
      minLabel || maxLabel
        ? `<div class="jp-rating-labels"><span>${esc(minLabel || '')}</span><span>${esc(maxLabel || '')}</span></div>`
        : '';

    const showComment = requireComments || selectedRating != null;
    const commentHtml = showComment
      ? `<textarea class="jp-rating-comment" placeholder="${requireComments ? 'Comment (required)' : 'Add a comment (optional)'}" rows="3"${requireComments ? ' required' : ''}>${esc(comment)}</textarea>`
      : '';

    const canSubmit =
      selectedRating != null &&
      (!requireComments || comment.trim().length > 0);

    const submitHtml =
      `<div class="jp-actions"><button class="jp-submit jp-rating-submit" type="button"${submitting || !canSubmit ? ' disabled' : ''}>${submitting ? 'Submitting...' : 'Submit rating'}</button></div>`;

    bodyContent += labelsHtml + commentHtml + submitHtml;
  }

  container.innerHTML =
    `<div class="jp-widget jp-rating jp-theme-${esc(themeClass)}" role="region" aria-label="Rating">` +
    '<div class="jp-body">' +
    '<div class="jp-header">' +
    `<p class="jp-question">${esc(title)}</p>` +
    (description ? `<p class="jp-meta">${esc(description)}</p>` : '') +
    (!submitted ? avgHtml : '') +
    '</div>' +
    feedbackHtml +
    bodyContent +
    '</div>' +
    footer +
    '</div>';

  applyWidgetVisualOverrides(container, vars, embed_settings.auto_height);

  if (!submitted) {
    container.querySelectorAll('[data-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.value);
        if (!submitting && Number.isFinite(val) && onSelectRating) onSelectRating(val);
      });
    });

    const starsEl = container.querySelector('.jp-stars');
    if (starsEl) {
      starsEl.querySelectorAll('.jp-star').forEach(star => {
        star.addEventListener('mouseenter', () => {
          const hoverVal = Number(star.dataset.value);
          starsEl.querySelectorAll('.jp-star').forEach(s => {
            const v = Number(s.dataset.value);
            s.classList.toggle('jp-star-filled', v <= hoverVal);
          });
        });
      });
      starsEl.addEventListener('mouseleave', () => {
        const sel = Number(starsEl.dataset.selected);
        starsEl.querySelectorAll('.jp-star').forEach(s => {
          const v = Number(s.dataset.value);
          s.classList.toggle('jp-star-filled', Number.isFinite(sel) && v <= sel);
        });
      });
    }

    const commentEl = container.querySelector('.jp-rating-comment');
    if (commentEl) {
      commentEl.addEventListener('input', e => {
        if (onCommentChange) onCommentChange(e.target.value);
      });
    }

    const submitBtn = container.querySelector('.jp-rating-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!submitting && onSubmit) onSubmit();
      });
    }
  }
}

export function flattenSurveyQuestions(surveyData) {
  if (!surveyData) return [];
  if (surveyData.display_mode === 'sections' && surveyData.sections?.length) {
    return surveyData.sections.flatMap(section =>
      [...(section.questions || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
    );
  }
  return [...(surveyData.questions || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function selectionHintText(question) {
  const { min_selections: min, max_selections: max } = question;
  if (min && max) return min === max ? `Select exactly ${min}` : `Select ${min}–${max}`;
  if (min) return `Select at least ${min}`;
  if (max) return `Select up to ${max}`;
  return '';
}

/** Renders the write-in text field beneath a choice list when the "Other" option is selected. */
function renderOtherTextField(qid, question, selectedIds, otherTextValue) {
  const otherOption = (question.options || []).find(o => o.is_other);
  if (!otherOption || !selectedIds.includes(Number(otherOption.id))) return '';
  return (
    `<input class="jp-survey-other-input" type="text" maxlength="250" placeholder="Please specify" ` +
    `value="${esc(otherTextValue ?? '')}" data-qid="${qid}">`
  );
}

function renderSurveyQuestionInput(question, value, error, onSetAnswer, otherTextValue) {
  const qid = Number(question.id);
  const requiredMark = question.required ? '<span class="jp-survey-required" aria-hidden="true">*</span>' : '';
  const errorHtml = error ? `<div class="jp-survey-error" role="alert">${esc(error)}</div>` : '';

  if (['text', 'email', 'phone', 'url'].includes(question.question_type)) {
    const inputType = question.question_type === 'text' ? 'text' : question.question_type;
    return (
      `<div class="jp-survey-question" data-qid="${qid}">` +
      `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
      `<input class="jp-survey-text-input" type="${esc(inputType)}" value="${esc(value ?? '')}" data-qid="${qid}">` +
      errorHtml +
      '</div>'
    );
  }

  if (question.question_type === 'date') {
    return (
      `<div class="jp-survey-question" data-qid="${qid}">` +
      `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
      `<input class="jp-survey-text-input" type="date" value="${esc(value ?? '')}" data-qid="${qid}">` +
      errorHtml +
      '</div>'
    );
  }

  if (question.question_type === 'time') {
    return (
      `<div class="jp-survey-question" data-qid="${qid}">` +
      `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
      `<input class="jp-survey-text-input" type="time" value="${esc(value ?? '')}" data-qid="${qid}">` +
      errorHtml +
      '</div>'
    );
  }

  if (question.question_type === 'dropdown') {
    const options = [...(question.options || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const optsHtml = options.map(opt =>
      `<option value="${Number(opt.id)}"${Number(value) === Number(opt.id) ? ' selected' : ''}>${esc(opt.text)}</option>`
    ).join('');
    const selectedIds = value != null && value !== '' ? [Number(value)] : [];
    return (
      `<div class="jp-survey-question" data-qid="${qid}">` +
      `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
      `<select class="jp-survey-dropdown" data-qid="${qid}"><option value="">Select…</option>${optsHtml}</select>` +
      renderOtherTextField(qid, question, selectedIds, otherTextValue) +
      errorHtml +
      '</div>'
    );
  }

  if (question.question_type === 'multiple_choice') {
    const selected = new Set(Array.isArray(value) ? value.map(Number) : []);
    const options = [...(question.options || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    // Once max_selections is reached, unselected options disable — matches
    // the same behavior in the main app's survey builder.
    const isMaxSelected = !!question.max_selections && selected.size >= question.max_selections;
    const optsHtml = options.map(opt => {
      const oid = Number(opt.id);
      const checked = selected.has(oid);
      const isDisabled = !checked && isMaxSelected;
      return (
        `<button type="button" class="jp-option jp-survey-checkbox${checked ? ' jp-voted' : ''}${opt.is_other ? ' jp-option-other' : ''}${isDisabled ? ' jp-option-disabled' : ''}" data-qid="${qid}" data-oid="${oid}" aria-pressed="${checked}"${isDisabled ? ' disabled' : ''}>` +
        `<span class="jp-choice-indicator" aria-hidden="true"></span>` +
        `<span class="jp-option-text">${esc(opt.text)}</span>` +
        '</button>'
      );
    }).join('');
    const selectionHint = (question.min_selections || question.max_selections)
      ? `<p class="jp-meta jp-survey-selection-hint">${selectionHintText(question)}</p>`
      : '';
    return (
      `<div class="jp-survey-question" data-qid="${qid}">` +
      `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
      selectionHint +
      `<div class="jp-survey-options jp-options-multiple">${optsHtml}</div>` +
      renderOtherTextField(qid, question, Array.from(selected), otherTextValue) +
      errorHtml +
      '</div>'
    );
  }

  if (['single_choice'].includes(question.question_type)) {
    const options = [...(question.options || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const optsHtml = options.map(opt => {
      const oid = Number(opt.id);
      const selected = Number(value) === oid;
      return (
        `<button type="button" class="jp-option${selected ? ' jp-voted' : ''}${opt.is_other ? ' jp-option-other' : ''}" data-qid="${qid}" data-oid="${oid}" aria-pressed="${selected}">` +
        `<span class="jp-option-text">${esc(opt.text)}</span>` +
        '</button>'
      );
    }).join('');
    const selectedIds = value != null ? [Number(value)] : [];
    return (
      `<div class="jp-survey-question" data-qid="${qid}">` +
      `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
      `<div class="jp-survey-options">${optsHtml}</div>` +
      renderOtherTextField(qid, question, selectedIds, otherTextValue) +
      errorHtml +
      '</div>'
    );
  }

  if (['likert', 'rating'].includes(question.question_type)) {
    const minVal = question.min_val ?? 1;
    const maxVal = question.max_val ?? 5;
    const rType = question.rating_type || 'star';
    const emojis = question.emojis || RATING_EMOJIS;

    if (rType === 'emoji') {
      const btns = emojis.map((emoji, i) => {
        const val = minVal + i;
        const selected = Number(value) === val;
        return `<button type="button" class="jp-emoji-btn${selected ? ' jp-selected' : ''}" data-qid="${qid}" data-value="${val}">${emoji}</button>`;
      }).join('');
      return (
        `<div class="jp-survey-question" data-qid="${qid}">` +
        `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
        `<div class="jp-emojis">${btns}</div>` +
        errorHtml +
        '</div>'
      );
    }

    if (rType === 'number') {
      const btns = Array.from({ length: maxVal - minVal + 1 }, (_, i) => {
        const val = minVal + i;
        const selected = Number(value) === val;
        return `<button type="button" class="jp-number-btn${selected ? ' jp-selected' : ''}" data-qid="${qid}" data-value="${val}">${val}</button>`;
      }).join('');
      return (
        `<div class="jp-survey-question" data-qid="${qid}">` +
        `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
        `<div class="jp-numbers">${btns}</div>` +
        errorHtml +
        '</div>'
      );
    }

    const stars = Array.from({ length: maxVal - minVal + 1 }, (_, i) => {
      const val = minVal + i;
      const filled = value != null && val <= Number(value);
      return `<button type="button" class="jp-star${filled ? ' jp-star-filled' : ''}" data-qid="${qid}" data-value="${val}">★</button>`;
    }).join('');
    return (
      `<div class="jp-survey-question" data-qid="${qid}">` +
      `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
      `<div class="jp-stars">${stars}</div>` +
      errorHtml +
      '</div>'
    );
  }

  return (
    `<div class="jp-survey-question" data-qid="${qid}">` +
    `<label class="jp-survey-q-label">${esc(question.text)}${requiredMark}</label>` +
    `<p class="jp-meta">This question type is not supported in embeds yet.</p>` +
    errorHtml +
    '</div>'
  );
}

export function renderSurvey(container, data, state) {
  const { survey_data, embed_settings } = data;
  const {
    phase,
    currentStep,
    answers,
    otherText,
    validationErrors,
    feedback,
    submitting,
    questions,
    onSetAnswer,
    onSetOtherText,
    onNext,
    onBack,
    onSubmit,
    canAdvance,
    themeOverride,
    vars,
  } = state;

  const themeClass = resolveTheme(themeOverride || embed_settings.theme);
  const { show_branding } = embed_settings;
  const displayMode = survey_data.display_mode || 'all_questions';
  const isOneByOne = displayMode === 'one_by_one';

  const footer = show_branding
    ? `<div class="jp-footer"><a href="https://jampolls.com" target="_blank" rel="noopener noreferrer"><span>Powered by</span>${BRAND_LOGO_SVG}</a></div>`
    : '';

  const feedbackHtml = feedback?.message
    ? `<div class="jp-feedback jp-feedback-${esc(feedback.type || 'error')}" role="alert">${esc(feedback.message)}</div>`
    : '';

  if (phase === 'outro') {
    const outroImage = imageUrl(survey_data.outro_image);
    container.innerHTML =
      `<div class="jp-widget jp-survey jp-theme-${esc(themeClass)}" role="region" aria-label="Survey complete">` +
      '<div class="jp-survey-outro">' +
      (outroImage ? `<img class="jp-survey-outro-image" src="${esc(outroImage)}" alt="">` : '') +
      `<h3 class="jp-question">${esc(survey_data.outro_title || 'Thank you!')}</h3>` +
      (survey_data.outro_description ? `<p class="jp-meta">${esc(survey_data.outro_description)}</p>` : '') +
      '</div>' +
      footer +
      '</div>';
    return;
  }

  const visibleQuestions = isOneByOne
    ? (questions[currentStep] ? [questions[currentStep]] : [])
    : questions;

  const progressHtml = isOneByOne && questions.length > 1
    ? `<div class="jp-survey-progress"><div class="jp-survey-progress-bar" style="--pct:${Math.round(((currentStep + 1) / questions.length) * 100)}%"></div><span class="jp-survey-step">Step ${currentStep + 1} of ${questions.length}</span></div>`
    : '';

  const questionsHtml = visibleQuestions.map(q => {
    const val = answers.get(Number(q.id));
    const err = validationErrors.get(Number(q.id));
    const otherVal = otherText ? otherText.get(Number(q.id)) : undefined;
    return renderSurveyQuestionInput(q, val, err, onSetAnswer, otherVal);
  }).join('');

  const isLastStep = !isOneByOne || currentStep >= questions.length - 1;
  const navHtml = isOneByOne
    ? `<div class="jp-survey-nav">` +
      `<button type="button" class="jp-survey-back" ${currentStep === 0 ? 'disabled' : ''}>Back</button>` +
      (isLastStep
        ? `<button type="button" class="jp-submit jp-survey-submit"${submitting || !canAdvance ? ' disabled' : ''}>${submitting ? 'Submitting...' : 'Submit'}</button>`
        : `<button type="button" class="jp-submit jp-survey-next"${!canAdvance ? ' disabled' : ''}>Next</button>`) +
      '</div>'
    : `<div class="jp-actions"><button type="button" class="jp-submit jp-survey-submit"${submitting || !canAdvance ? ' disabled' : ''}>${submitting ? 'Submitting...' : 'Submit survey'}</button></div>`;

  container.innerHTML =
    `<div class="jp-widget jp-survey jp-theme-${esc(themeClass)}" role="region" aria-label="Survey">` +
    '<div class="jp-body">' +
    '<div class="jp-header">' +
    `<p class="jp-question">${esc(survey_data.title)}</p>` +
    (survey_data.description ? `<p class="jp-meta">${esc(survey_data.description)}</p>` : '') +
    '</div>' +
    progressHtml +
    feedbackHtml +
    `<div class="jp-survey-questions">${questionsHtml}</div>` +
    navHtml +
    '</div>' +
    footer +
    '</div>';

  applyWidgetVisualOverrides(container, vars, embed_settings.auto_height);

  container.querySelectorAll('.jp-survey-text-input, .jp-survey-dropdown').forEach(el => {
    el.addEventListener('change', e => {
      const qid = Number(e.target.dataset.qid);
      if (onSetAnswer) onSetAnswer(qid, e.target.value);
    });
    if (el.tagName === 'INPUT') {
      el.addEventListener('input', e => {
        const qid = Number(e.target.dataset.qid);
        if (onSetAnswer) onSetAnswer(qid, e.target.value);
      });
    }
  });

  container.querySelectorAll('.jp-survey-other-input').forEach(el => {
    el.addEventListener('input', e => {
      const qid = Number(e.target.dataset.qid);
      if (onSetOtherText) onSetOtherText(qid, e.target.value);
    });
  });

  container.querySelectorAll('.jp-option[data-oid]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qid = Number(btn.dataset.qid);
      const oid = Number(btn.dataset.oid);
      const question = questions.find(q => Number(q.id) === qid);
      if (!question || !onSetAnswer) return;

      if (question.question_type === 'multiple_choice') {
        const current = new Set(Array.isArray(answers.get(qid)) ? answers.get(qid).map(Number) : []);
        if (current.has(oid)) current.delete(oid);
        else current.add(oid);
        onSetAnswer(qid, Array.from(current));
      } else {
        onSetAnswer(qid, oid);
      }
    });
  });

  container.querySelectorAll('.jp-star[data-qid], .jp-number-btn[data-qid], .jp-emoji-btn[data-qid]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qid = Number(btn.dataset.qid);
      const val = Number(btn.dataset.value);
      if (onSetAnswer) onSetAnswer(qid, val);
    });
  });

  const backBtn = container.querySelector('.jp-survey-back');
  if (backBtn) backBtn.addEventListener('click', () => { if (onBack) onBack(); });

  const nextBtn = container.querySelector('.jp-survey-next');
  if (nextBtn) nextBtn.addEventListener('click', () => { if (canAdvance && onNext) onNext(); });

  const submitBtn = container.querySelector('.jp-survey-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (!submitting && canAdvance && onSubmit) onSubmit();
    });
  }
}

// ── Quiz widget ──

function quizOptionIndicator(selected, isMultiple) {
  const shape = isMultiple ? 'jp-quiz-indicator-square' : 'jp-quiz-indicator-round';
  const check = selected
    ? isMultiple
      ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>'
      : '<span class="jp-quiz-indicator-dot"></span>'
    : '';
  return `<span class="jp-quiz-option-indicator ${shape}${selected ? ' jp-quiz-option-indicator-selected' : ''}" aria-hidden="true">${check}</span>`;
}

function renderQuizOptions(question, selectedIds, onDisabled) {
  const isMultiple = question.question_type === 'multiple_choice';
  const isTrueFalse = question.question_type === 'true_false';
  const selectedSet = new Set(selectedIds);

  if (isTrueFalse) {
    return (
      `<div class="jp-quiz-options jp-quiz-options-true-false" role="group" aria-label="Answer options">` +
      question.options
        .map(opt => {
          const selected = selectedSet.has(opt.id);
          return (
            `<button type="button" class="jp-quiz-option jp-quiz-option-toggle${selected ? ' jp-quiz-option-selected' : ''}"` +
            ` data-id="${opt.id}"${onDisabled ? ' disabled' : ''} aria-pressed="${selected}">` +
            `${esc(opt.text)}</button>`
          );
        })
        .join('') +
      '</div>'
    );
  }

  return (
    `<div class="jp-quiz-options" role="group" aria-label="Answer options">` +
    question.options
      .map(opt => {
        const selected = selectedSet.has(opt.id);
        const optionImage = imageUrl(opt.image);
        const hasMedia = !!optionImage;
        return (
          `<button type="button" class="jp-quiz-option${hasMedia ? ' jp-quiz-option-has-media' : ''}${selected ? ' jp-quiz-option-selected' : ''}"` +
          ` data-id="${opt.id}"${onDisabled ? ' disabled' : ''} aria-pressed="${selected}">` +
          (!hasMedia ? quizOptionIndicator(selected, isMultiple) : '') +
          (hasMedia ? `<img class="jp-quiz-option-image" src="${esc(optionImage)}" alt="">` : '') +
          `<span class="jp-quiz-option-text">${esc(opt.text)}</span>` +
          (hasMedia ? quizOptionIndicator(selected, isMultiple) : '') +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}

// Player matching board — stacked prompt rows with drop slots + a chip bank of
// unassigned options (curveballs stay in the bank). Dual-mode: pointer drag
// with a floating ghost, or tap-chip-then-tap-slot. Wired format stays
// selectedMatches [{prompt, option}, ...].
const MATCH_DRAG_THRESHOLD_PX = 6;
const MATCH_GRIP_SVG =
  '<svg class="jp-match-chip-grip" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true" focusable="false">' +
  '<circle cx="2" cy="2" r="1.5" fill="currentColor"/>' +
  '<circle cx="8" cy="2" r="1.5" fill="currentColor"/>' +
  '<circle cx="2" cy="8" r="1.5" fill="currentColor"/>' +
  '<circle cx="8" cy="8" r="1.5" fill="currentColor"/>' +
  '<circle cx="2" cy="14" r="1.5" fill="currentColor"/>' +
  '<circle cx="8" cy="14" r="1.5" fill="currentColor"/>' +
  '</svg>';

function renderQuizMatching(question, selectedMatches, selectedMatchOptionId, onDisabled) {
  const prompts = question.prompts || [];
  const options = question.match_options || [];
  const optionById = new Map(options.map(o => [o.id, o]));
  const optionIdByPromptId = new Map(selectedMatches.map(m => [m.prompt, m.option]));
  const assignedOptionIds = new Set(selectedMatches.map(m => m.option));

  const rowsHtml = prompts
    .map(p => {
      const assignedOptionId = optionIdByPromptId.get(p.id);
      const assigned = assignedOptionId != null ? optionById.get(assignedOptionId) : null;
      const filled = !!assigned;
      const slotClass =
        'jp-match-slot' +
        (filled ? ' filled' : '') +
        (selectedMatchOptionId != null && !filled ? ' jp-match-slot-targetable' : '');
      const slotInner = filled
        ? `<span class="jp-match-slot-text">${esc(assigned.text)}</span>` +
          `<button type="button" class="jp-match-slot-eject" data-eject-prompt-id="${p.id}"` +
          `${onDisabled ? ' disabled' : ''} aria-label="Remove match">×</button>`
        : '<span class="jp-match-slot-placeholder">Drop match</span>';
      return (
        `<div class="jp-match-row">` +
        `<div class="jp-match-row-prompt">` +
        `<span class="jp-match-row-bullet" aria-hidden="true"></span>` +
        `<span class="jp-match-row-text">${esc(p.text)}</span>` +
        `</div>` +
        `<div class="${slotClass}" data-prompt-id="${p.id}" role="button" tabindex="${onDisabled ? '-1' : '0'}"` +
        ` aria-label="${filled ? 'Change match for ' + esc(p.text) : 'Drop match for ' + esc(p.text)}">` +
        slotInner +
        `</div>` +
        `</div>`
      );
    })
    .join('');

  const chipsHtml = options
    .filter(o => !assignedOptionIds.has(o.id))
    .map(o => {
      const selected = selectedMatchOptionId === o.id;
      return (
        `<button type="button" class="jp-match-chip${selected ? ' selected' : ''}"` +
        ` data-option-id="${o.id}"${onDisabled ? ' disabled' : ''}` +
        ` aria-pressed="${selected}">` +
        MATCH_GRIP_SVG +
        `<span class="jp-match-chip-text">${esc(o.text)}</span>` +
        `</button>`
      );
    })
    .join('');

  return (
    '<div class="jp-quiz-matching">' +
    `<div class="jp-match-rows">${rowsHtml}</div>` +
    '<div class="jp-match-chip-bank">' +
    '<p class="jp-match-chip-bank-label">Matches</p>' +
    `<div class="jp-match-chips">${chipsHtml}</div>` +
    '</div>' +
    '</div>'
  );
}

function bindQuizMatching(container, {
  optionsLocked,
  onSetMatchPair,
  onClearMatchPair,
  onSelectMatchOption,
  onMatchDragActive,
}) {
  if (optionsLocked) return;

  const matchingRoot = container.querySelector('.jp-quiz-matching');
  if (!matchingRoot) return;

  matchingRoot.querySelectorAll('.jp-match-slot-eject').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const promptId = Number(btn.dataset.ejectPromptId);
      if (Number.isFinite(promptId) && onClearMatchPair) onClearMatchPair(promptId);
    });
  });

  const placeOrSelect = (promptId) => {
    if (!Number.isFinite(promptId) || !onSetMatchPair) return;
    // Tap-to-place: if a chip is selected, assign it; otherwise no-op on empty
    // slots (filled slots are cleared via the eject button).
    const selectedChip = matchingRoot.querySelector('.jp-match-chip.selected');
    if (!selectedChip) return;
    const optionId = Number(selectedChip.dataset.optionId);
    if (Number.isFinite(optionId)) onSetMatchPair(promptId, optionId);
  };

  matchingRoot.querySelectorAll('.jp-match-slot').forEach(slot => {
    const activate = () => {
      const promptId = Number(slot.dataset.promptId);
      placeOrSelect(promptId);
    };
    slot.addEventListener('click', (e) => {
      if (e.target.closest('.jp-match-slot-eject')) return;
      activate();
    });
    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  matchingRoot.querySelectorAll('.jp-match-chip').forEach(chip => {
    chip.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button !== 0) return;
      const optionId = Number(chip.dataset.optionId);
      if (!Number.isFinite(optionId)) return;

      const startX = e.clientX;
      const startY = e.clientY;
      let dragging = false;
      let ghost = null;
      let overSlot = null;

      const clearOver = () => {
        if (overSlot) {
          overSlot.classList.remove('over');
          overSlot = null;
        }
      };

      const cleanup = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        clearOver();
        if (ghost) {
          ghost.remove();
          if (container._jpMatchGhost === ghost) container._jpMatchGhost = null;
          ghost = null;
        }
        chip.classList.remove('dragging');
        if (onMatchDragActive) onMatchDragActive(false);
      };

      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!dragging) {
          if (dx * dx + dy * dy < MATCH_DRAG_THRESHOLD_PX * MATCH_DRAG_THRESHOLD_PX) return;
          dragging = true;
          if (onMatchDragActive) onMatchDragActive(true);
          chip.classList.add('dragging');
          ghost = document.createElement('div');
          ghost.className = 'jp-match-chip-ghost';
          ghost.innerHTML = MATCH_GRIP_SVG + '<span class="jp-match-chip-text"></span>';
          const ghostText = ghost.querySelector('.jp-match-chip-text');
          if (ghostText) {
            ghostText.textContent = chip.querySelector('.jp-match-chip-text')?.textContent || '';
          }
          // Append to body so .jp-widget { overflow: hidden } can't clip the
          // floating chip while dragging outside the embed bounds. Copy the
          // widget's theme tokens onto the ghost so it still matches.
          const widget = container.querySelector('.jp-widget');
          if (widget) {
            const cs = getComputedStyle(widget);
            [
              '--jp-primary',
              '--jp-text',
              '--jp-quiz-option-bg',
              '--jp-quiz-muted-text',
            ].forEach((prop) => {
              const val = cs.getPropertyValue(prop).trim();
              if (val) ghost.style.setProperty(prop, val);
            });
            ghost.style.fontFamily = cs.fontFamily;
          }
          document.body.appendChild(ghost);
          container._jpMatchGhost = ghost;
          try { chip.setPointerCapture(ev.pointerId); } catch (_) { /* ignore */ }
          if (ev.cancelable) ev.preventDefault();
        }
        if (!ghost) return;
        if (ev.cancelable) ev.preventDefault();
        const gw = ghost.offsetWidth || 200;
        ghost.style.left = `${ev.clientX - gw / 2}px`;
        ghost.style.top = `${ev.clientY - 20}px`;

        ghost.style.pointerEvents = 'none';
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        ghost.style.pointerEvents = '';
        const slot = el?.closest?.('.jp-match-slot');
        // Only highlight slots that belong to this widget instance.
        const validSlot = slot && matchingRoot.contains(slot) ? slot : null;
        if (validSlot !== overSlot) {
          clearOver();
          overSlot = validSlot;
          if (overSlot) overSlot.classList.add('over');
        }
      };

      const onUp = () => {
        const wasDragging = dragging;
        const dropSlot = overSlot;
        cleanup();
        if (wasDragging) {
          if (dropSlot && onSetMatchPair) {
            const promptId = Number(dropSlot.dataset.promptId);
            if (Number.isFinite(promptId)) onSetMatchPair(promptId, optionId);
          }
          return;
        }
        // Tap (no real drag): toggle chip selection for tap-then-tap-slot.
        if (onSelectMatchOption) onSelectMatchOption(optionId);
      };

      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });
  });
}

function renderQuizProgress(total, currentIndex) {
  const segments = Array.from({ length: Math.max(total, 1) }, (_, i) =>
    `<span class="jp-quiz-progress-segment${i <= currentIndex ? ' jp-quiz-progress-segment-filled' : ''}"></span>`
  ).join('');
  return (
    `<div class="jp-quiz-progress" role="progressbar" aria-valuenow="${currentIndex + 1}"` +
    ` aria-valuemin="1" aria-valuemax="${total}">${segments}</div>`
  );
}

function renderQuizTimer(timeRemainingMs, urgentThresholdS) {
  if (timeRemainingMs == null) return '';
  const seconds = Math.max(0, Math.ceil(timeRemainingMs / 1000));
  const urgent = seconds <= urgentThresholdS;
  return (
    `<span class="jp-quiz-timer${urgent ? ' jp-quiz-timer-urgent' : ''}" aria-live="polite">` +
    `<span class="jp-quiz-num">${seconds}s</span></span>`
  );
}

function renderQuizBlocked(data, attemptStatus) {
  const { show_branding } = data.embed_settings;
  const footer = show_branding
    ? `<div class="jp-footer"><a href="https://jampolls.com" target="_blank" rel="noopener noreferrer"><span>Powered by</span>${BRAND_LOGO_SVG}</a></div>`
    : '';
  const attemptsLine =
    attemptStatus?.attempts_allowed != null
      ? `<p class="jp-quiz-blocked-detail">You've used ${attemptStatus.attempts_used} of ${attemptStatus.attempts_allowed} allowed attempt${attemptStatus.attempts_allowed === 1 ? '' : 's'}.</p>`
      : '';
  return (
    '<div class="jp-quiz-blocked">' +
    '<p class="jp-quiz-blocked-title">You’ve already completed this quiz</p>' +
    attemptsLine +
    '</div>' +
    footer
  );
}

function renderQuizResults(data, results, revealScoreOverride, passThresholdOverride) {
  const revealScore =
    revealScoreOverride !== undefined ? revealScoreOverride : data.embed_settings.reveal_score;
  const passThreshold =
    passThresholdOverride !== undefined ? passThresholdOverride : data.embed_settings.pass_threshold;
  const { show_branding } = data.embed_settings;
  const footer = show_branding
    ? `<div class="jp-footer"><a href="https://jampolls.com" target="_blank" rel="noopener noreferrer"><span>Powered by</span>${BRAND_LOGO_SVG}</a></div>`
    : '';

  if (revealScore === false || !results) {
    return (
      '<div class="jp-quiz-results">' +
      '<p class="jp-quiz-results-title">Thanks for completing the quiz!</p>' +
      '</div>' +
      footer
    );
  }

  const pct = Number(results.percentage_score) || 0;
  const hasPassLine = typeof passThreshold === 'number' && passThreshold !== null;
  const passed = hasPassLine ? pct >= passThreshold * 100 : null;
  const passBadge = hasPassLine
    ? `<span class="jp-quiz-pass-badge${passed ? ' jp-quiz-pass' : ' jp-quiz-fail'}">${passed ? 'Passed' : 'Not passed'}</span>`
    : '';

  return (
    '<div class="jp-quiz-results">' +
    `<p class="jp-quiz-score">${pct}%</p>` +
    passBadge +
    `<p class="jp-quiz-results-detail">${results.correct_answers}/${results.total_questions} correct · ${results.total_score} pts</p>` +
    '</div>' +
    footer
  );
}

export function renderQuiz(container, data, state) {
  const { quiz_data, embed_settings } = data;
  const {
    phase,
    attemptStatus,
    currentQuestion,
    selected,
    selectedMatches,
    selectedMatchOptionId,
    timeRemainingMs,
    urgentThresholdS,
    isLastQuestion,
    submitting,
    canAdvance,
    feedback,
    results,
    questions,
    currentIndex,
    themeOverride,
    revealScoreOverride,
    passThresholdOverride,
    vars,
    answerFeedback,
    checkingAnswer,
    onToggleOption,
    onSetMatchPair,
    onClearMatchPair,
    onSelectMatchOption,
    onMatchDragActive,
    onNext,
  } = state;

  const themeClass = resolveTheme(themeOverride || embed_settings.theme);
  let body;

  if (phase === 'blocked') {
    body = renderQuizBlocked(data, attemptStatus);
  } else if (phase === 'results') {
    body = renderQuizResults(data, results, revealScoreOverride, passThresholdOverride);
  } else {
    const questionImage = imageUrl(currentQuestion?.image);
    const feedbackHtml = feedback?.message
      ? `<div class="jp-feedback jp-feedback-${esc(feedback.type || 'error')}" role="alert">${esc(feedback.message)}</div>`
      : '';
    const answerFeedbackHtml = answerFeedback
      ? `<div class="jp-quiz-answer-feedback ${answerFeedback.correct ? 'jp-quiz-answer-feedback-correct' : 'jp-quiz-answer-feedback-wrong'}" role="status">` +
        `${answerFeedback.correct ? 'Correct!' : 'Not quite.'}</div>`
      : '';
    const optionsLocked = submitting || checkingAnswer || !!answerFeedback;
    const nextLabel = checkingAnswer
      ? 'Checking…'
      : answerFeedback
        ? 'Continue'
        : submitting
          ? 'Submitting…'
          : isLastQuestion
            ? 'Submit'
            : 'Next';
    const nextDisabled = checkingAnswer || submitting || (!answerFeedback && !canAdvance);
    body =
      renderQuizProgress(questions.length, currentIndex) +
      '<div class="jp-quiz-topbar">' +
      `<span class="jp-quiz-counter">Question ${currentIndex + 1} / ${questions.length}</span>` +
      renderQuizTimer(timeRemainingMs, urgentThresholdS) +
      '</div>' +
      `<h2 class="jp-quiz-question jp-quiz-motion-enter">${esc(currentQuestion?.text || '')}</h2>` +
      (questionImage ? `<img class="jp-quiz-question-image" src="${esc(questionImage)}" alt="">` : '') +
      (currentQuestion
        ? currentQuestion.question_type === 'matching'
          ? renderQuizMatching(currentQuestion, selectedMatches, selectedMatchOptionId, optionsLocked)
          : renderQuizOptions(currentQuestion, selected, optionsLocked)
        : '') +
      answerFeedbackHtml +
      feedbackHtml +
      `<button type="button" class="jp-quiz-next"${nextDisabled ? ' disabled' : ''}>${nextLabel}</button>`;
  }

  container.innerHTML =
    `<div class="jp-widget jp-quiz jp-theme-${esc(themeClass)}" role="region" aria-label="Quiz">` +
    `<div class="jp-quiz-title-row"><p class="jp-quiz-title">${esc(quiz_data.title)}</p></div>` +
    body +
    '</div>';

  applyWidgetVisualOverrides(container, vars, embed_settings.auto_height);

  // A broken/slow image must never block the timer or an option's
  // clickability — both are already independent of image load state. On
  // error, collapse the element entirely rather than leaving a broken-image
  // icon sitting in the space reserved for it.
  container.querySelectorAll('.jp-quiz-question-image, .jp-quiz-option-image').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
  });

  const optionsLocked = phase !== 'blocked' && phase !== 'results' && (submitting || checkingAnswer || !!answerFeedback);
  container.querySelectorAll('.jp-quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const optionId = Number(btn.dataset.id);
      if (!optionsLocked && Number.isFinite(optionId) && onToggleOption) onToggleOption(optionId);
    });
  });
  bindQuizMatching(container, {
    optionsLocked,
    onSetMatchPair,
    onClearMatchPair,
    onSelectMatchOption,
    onMatchDragActive,
  });

  const nextBtn = container.querySelector('.jp-quiz-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const disabled = checkingAnswer || submitting || (!answerFeedback && !canAdvance);
      if (!disabled && onNext) onNext();
    });
  }
}
