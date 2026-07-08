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
}

export interface PollOption {
  id: number;
  text: string;
  image: string | null;
  votes_count: number;
  placement: number;
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
}

export interface SurveySection {
  id: number;
  title: string;
  description: string;
  order: number;
  questions: SurveyQuestion[];
}

export type EmbedToolData = PollData | RatingData | SurveyData;

export interface ToolSwitchPayload {
  tool_type: 'poll' | 'rating' | 'survey';
  snapshot: Record<string, unknown>;
}

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

declare const JamPolls: {
  /**
   * Embed a Jampolls poll into a container.
   * @param embedKey - Your embed key from the Jampolls dashboard.
   * @param target - CSS selector string or HTMLElement.
   * @param opts - Optional configuration.
   */
  embed(embedKey: string, target: string | HTMLElement, opts?: WidgetOptions): JampollsWidgetInstance | null;

  /** Get the widget instance currently attached to a container. */
  getWidget(target: string | HTMLElement): JampollsWidgetInstance | null;

  /** Destroy and remove the widget from a container. */
  removeWidget(target: string | HTMLElement): void;

  /** Auto-initialize all [data-jampolls] elements on the page. Called automatically on DOMContentLoaded. */
  autoEmbed(): void;
};

export default JamPolls;
