import { useEffect, useRef, createElement } from 'react';
import JamPolls from '../core/index.js';

/**
 * React component for embedding a Jampolls poll.
 *
 * Usage:
 *   import { JampollsWidget } from '@jampolls/sdk/react';
 *   <JampollsWidget embedKey="your_embed_key" theme="auto" />
 */
export function JampollsWidget({ embedKey, theme, vars, onLoad, onVote, onError, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !embedKey) return;
    const container = ref.current;

    JamPolls.embed(embedKey, container, {
      theme,
      vars,
      onLoad,
      onVote,
      onError,
    });

    return () => {
      JamPolls.removeWidget(container);
    };
  }, [embedKey, theme, vars, onLoad, onVote, onError]);

  return createElement('div', { ref, className, style });
}
