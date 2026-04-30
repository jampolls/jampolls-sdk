export interface WidgetOptions {
  /**
   * Widget color theme. Overrides the poll owner's dashboard setting.
   * Use this to match your site's design. Defaults to the owner's configured theme.
   */
  theme?: 'auto' | 'light' | 'dark' | 'jampolls';
  /**
   * CSS custom property overrides applied directly to the widget element.
   * Use this to customise colours, border radius, max-width, etc.
   * @example
   * vars: { '--jp-primary': '#7c3aed', '--jp-radius': '4px', 'max-width': '100%' }
   */
  vars?: Record<string, string>;
  /** Called after poll data loads successfully. */
  onLoad?: (data: PollData) => void;
  /** Called after a vote is submitted or removed. */
  onVote?: (event: VoteEvent) => void;
  /** Called when a network or API error occurs. */
  onError?: (error: Error) => void;
}

export interface PollOption {
  id: number;
  text: string;
  votes_count: number;
  placement: number;
}

export interface PollData {
  poll_data: {
    question: string;
    options: PollOption[];
    votes_count: number;
    is_active: boolean;
    poll_type: string;
    created_at: string;
  };
  embed_settings: {
    theme: string;
    show_results: boolean;
    show_branding: boolean;
    auto_height: boolean;
  };
}

export interface VoteEvent {
  optionId: number;
  removed: boolean;
}

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
