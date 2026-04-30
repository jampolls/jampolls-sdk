import { useEffect, useRef, createElement } from 'react';
import JamPolls from '../core/index.js';

/**
 * React component for embedding a Jampolls poll.
 *
 * Usage:
 *   import { JampollsWidget } from '@jampolls/sdk/react';
 *   <JampollsWidget embedKey="your_embed_key" theme="auto" />
 */
export function JampollsWidget({ embedKey, theme, vars, apiUrl, onLoad, onVote, onError, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !embedKey) return;

    const widget = JamPolls.embed(embedKey, ref.current, {
      theme,
      vars,
      apiUrl,
      onLoad,
      onVote,
      onError,
    });

    return () => {
      if (ref.current) JamPolls.removeWidget(ref.current);
    };
  }, [embedKey, apiUrl]);

  return createElement('div', { ref, className, style });
}
