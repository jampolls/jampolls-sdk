export interface WidgetOptions {
  /**
   * Widget color theme. Overrides the poll owner's dashboard setting.
   * Use this to match your site's design. Defaults to the owner's configured theme.
   */
  theme?: 'auto' | 'light' | 'dark' | 'jampolls';
  /**
   * Widget layout mode (poll widget only).
   * - `'vertical'` — stacked top-to-bottom (question → image → options). Best for narrow containers.
   * - `'horizontal'` — two-column split (question + image left, options right). Best for wide sections.
   * - `'auto'` — switches automatically based on container width (default). Vertical ≤ 520 px, horizontal above.
   * @default 'auto'
   */
  layout?: 'vertical' | 'horizontal' | 'auto';
  /**
   * CSS custom property overrides applied directly to the widget element.
   * Use this to customise colours, border radius, max-width, etc.
   * @example
   * vars: { '--jp-primary': '#7c3aed', '--jp-radius': '4px', 'max-width': '100%' }
   */
  vars?: Record<string, string>;
  /**
   * Override the API origin. Defaults to https://hub.jampolls.com.
   * Intended for local development and testing.
   */
  apiUrl?: string;
  /**
   * Target environment. Defaults to 'production'. Ignored if apiUrl is also set.
   */
  env?: 'production' | 'sandbox';
  /** Called after tool data loads successfully. */
  onLoad?: (data: EmbedToolData) => void;
  /** Called after a poll vote is submitted or removed. */
  onVote?: (event: VoteEvent) => void;
  /** Called after a rating or survey is submitted. */
  onSubmit?: (event: Record<string, unknown>) => void;
  /** Called when the dashboard owner switches the active embed tool (via SSE). */
  onToolChanged?: (payload: ToolSwitchPayload) => void;
  /** Called when a network or API error occurs. */
  onError?: (error: Error) => void;
  /**
   * Controls when the widget actually mounts.
   * - `'auto'` (default) — mounts immediately, unchanged from every version before this option existed.
   * - `'cover'` — shows a small branded start screen in the container; nothing is fetched
   *   or rendered until the visitor clicks it.
   * - `'manual'` — mounts nothing until your own code calls `.start()` on the instance
   *   `embed()` returns. Use this to drive the widget from your own "Begin" button.
   * @default 'auto'
   */
  startTrigger?: 'auto' | 'cover' | 'manual';
  /** Button label shown in `'cover'` mode. @default 'Start' */
  startLabel?: string;
  /**
   * Quiz widget only. Your own opaque identifier for this respondent (e.g. your
   * logged-in user's ID), so a completed attempt can be matched back to your own
   * records via the completion webhook. Put an ID here, not a name or email.
   */
  externalRespondentId?: string;
  /**
   * Quiz widget only. Overrides the embed's dashboard-configured `reveal_score`
   * setting. `false` shows a plain completion message instead of the score,
   * pass/fail badge, and correct-answer count on the results screen.
   */
  revealScore?: boolean;
  /**
   * Quiz widget only. When the embed's dashboard-configured `instant_feedback` is on,
   * this can turn it off for this page (`false`) — it can NOT force instant feedback
   * on for an embed where the owner has it off; the check endpoint itself 403s in
   * that case, so the SDK never even tries. When on, "Next" shows a correct/incorrect
   * banner right after locking in an answer, and becomes "Continue" for a second tap.
   */
  instantFeedback?: boolean;
  /**
   * Quiz widget only. Overrides the embed's dashboard-configured `pass_threshold`.
   * 0.0–1.0, or `null` to hide the pass/fail badge entirely and show only the score.
   */
  passThreshold?: number | null;
  /** Quiz widget only. Called once, when the first question is shown (not called if the visitor is blocked by retake policy). */
  onQuizStart?: () => void;
  /** Quiz widget only. Called each time an answer is locked in — when moving off a question, not on every option click.
   *  For question_type='matching', `matches` is set instead of `selectedOptionIds`. */
  onAnswerLocked?: (event: {
    questionId: number;
    selectedOptionIds?: number[];
    matches?: Array<{ prompt: number; option: number }>;
    timeSpentS: number;
  }) => void;
  /** Quiz widget only. Called after the final submission, with the full score breakdown. */
  onQuizComplete?: (result: QuizResults) => void;
}

export interface PollOption {
  id: number;
  text: string;
  image: string | null;
  votes_count: number;
  placement: number;
  /** Survey question options only: true for the server-managed "Other" write-in option. */
  is_other?: boolean;
}

export interface PollData {
  tool_type: 'poll';
  poll_data: {
    question: string;
    image: string | null;
    options: PollOption[];
    votes_count: number;
    allow_multiple_votes: boolean;
    can_change_vote: boolean;
    allow_anonymous: boolean;
    created_at: string;
    is_active?: boolean;
  } | null;
  rating_data: null;
  survey_data: null;
  embed_settings: EmbedSettings;
}

export interface RatingData {
  tool_type: 'rating';
  poll_data: null;
  rating_data: {
    id: number;
    title: string;
    description: string;
    rating_type: 'stars' | 'numbers' | 'emojis';
    max_rating: number;
    min_label: string;
    max_label: string;
    show_average: boolean;
    require_comments: boolean;
    allow_anonymous: boolean;
    is_active: boolean;
    average_rating: number | null;
    response_count: number;
  } | null;
  survey_data: null;
  embed_settings: EmbedSettings;
}

export interface SurveyData {
  tool_type: 'survey';
  poll_data: null;
  rating_data: null;
  survey_data: {
    id: number;
    title: string;
    description: string;
    display_mode: string;
    randomize_questions: boolean;
    allow_anonymous: boolean;
    auto_advance: boolean;
    outro_title: string;
    outro_description: string;
    outro_image: string | null;
    is_active: boolean;
    questions: SurveyQuestion[];
    sections: SurveySection[];
  } | null;
  embed_settings: EmbedSettings;
}

export interface EmbedSettings {
  theme: 'auto' | 'light' | 'dark' | 'jampolls';
  show_results: boolean;
  show_branding: boolean;
  /** Quiz embeds (multi-embed model) only — absent for poll/rating/survey. */
  auto_height?: boolean;
  retake_policy?: 'unlimited' | 'once' | 'max_attempts';
  max_attempts?: number | null;
  reveal_score?: boolean;
  instant_feedback?: boolean;
  /** 0.0–1.0, or null for no pass/fail line. */
  pass_threshold?: number | null;
  /** null = use each question's own time_limit. */
  per_question_seconds?: number | null;
  start_trigger?: 'auto' | 'cover' | 'manual';
}

export interface QuizOption {
  id: number;
  text: string;
  image: string | null;
  order: number;
}

/** matching only — the left-hand column. No correct_option: an embed visitor
 *  never sees the answer key before submitting. */
export interface QuizMatchPrompt {
  id: number;
  text: string;
  order: number;
}

/** matching only — the right-hand match bank (may outnumber the prompts;
 *  unmatched entries are distractors). */
export interface QuizMatchOption {
  id: number;
  text: string;
  order: number;
}

export interface QuizQuestion {
  id: number;
  text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'matching';
  image: string | null;
  order: number;
  points_value: number;
  /** Seconds, or null for no per-question timer. */
  time_limit: number | null;
  /** Empty for question_type='matching' — see prompts/match_options instead. */
  options: QuizOption[];
  /** matching only — mirrors `options` for choice types. */
  prompts?: QuizMatchPrompt[];
  match_options?: QuizMatchOption[];
}

export interface QuizData {
  tool_type: 'quiz';
  poll_data: null;
  rating_data: null;
  survey_data: null;
  quiz_data: {
    id: number;
    title: string;
    description: string;
    /** Needed to POST to the submit endpoint — shared with native quiz-taking. */
    slug: string;
    display_mode: string;
    randomize_questions: boolean;
    points_per_question: number;
    time_limit_per_question: number | null;
    is_active: boolean;
    question_count: number;
    total_points_possible: number;
    estimated_seconds: number;
    questions: QuizQuestion[];
  } | null;
  embed_settings: EmbedSettings;
}

export interface QuizResults {
  id: number;
  total_score: number;
  percentage_score: number;
  correct_answers: number;
  total_questions: number;
  total_time_spent: number | null;
}

export interface SurveyQuestion {
  id: number;
  text: string;
  question_type: string;
  required: boolean;
  order: number;
  rating_type?: string | null;
  min_val?: number | null;
  max_val?: number | null;
  options?: PollOption[];
  emojis?: string[] | null;
  /** Whether respondents may write in their own answer via the "Other" option (single_choice/multiple_choice/dropdown). */
  allow_other_option?: boolean;
  /** multiple_choice only: minimum options the respondent must select if they answer at all. */
  min_selections?: number | null;
  /** multiple_choice only: maximum options the respondent may select. */
  max_selections?: number | null;
}

export interface SurveySection {
  id: number;
  title: string;
  description: string;
  order: number;
  questions: SurveyQuestion[];
}

export type EmbedToolData = PollData | RatingData | SurveyData | QuizData;

export interface ToolSwitchPayload {
  tool_type: 'poll' | 'rating' | 'survey';
  snapshot: Record<string, unknown>;
}

/** Passed to `onSubmit` for the quiz widget. `onSubmit` for rating/survey still receives `Record<string, unknown>`. */
export type QuizSubmitEvent = QuizResults;

export interface SingleVoteEvent {
  optionId: number;
  removed: boolean;
}

export interface MultipleVoteEvent {
  optionIds: number[];
  addedOptionIds: number[];
  removedOptionIds: number[];
}

export type VoteEvent = SingleVoteEvent | MultipleVoteEvent;

export interface JampollsWidgetInstance {
  /** Re-fetch and re-render the poll. */
  refresh(): void;
  /** Destroy the widget and clear the container. */
  destroy(): void;
}

/** Returned by `embed()` when `startTrigger` is `'cover'` or `'manual'`, before the real widget has mounted. */
export interface DeferredWidgetInstance {
  /** Mount the real widget now. No-op if already started or destroyed. */
  start(): void;
  /** Destroy and clear the container. Before `start()`, this just clears the cover screen (if any). */
  destroy(): void;
}

declare const JamPolls: {
  /**
   * Embed a Jampolls poll into a container.
   * @param embedKey - Your embed key from the Jampolls dashboard.
   * @param target - CSS selector string or HTMLElement.
   * @param opts - Optional configuration.
   */
  embed(embedKey: string, target: string | HTMLElement, opts?: WidgetOptions): JampollsWidgetInstance | DeferredWidgetInstance | null;

  /** Get the widget instance currently attached to a container. */
  getWidget(target: string | HTMLElement): JampollsWidgetInstance | DeferredWidgetInstance | null;

  /** Destroy and remove the widget from a container. */
  removeWidget(target: string | HTMLElement): void;

  /** Auto-initialize all [data-jampolls] elements on the page. Called automatically on DOMContentLoaded. */
  autoEmbed(): void;
};

export default JamPolls;
