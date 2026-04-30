import { defineComponent, onMounted, onUnmounted, ref, watch, h } from 'vue';
import JamPolls from '../core/index.js';

/**
 * Vue 3 component for embedding a Jampolls poll.
 *
 * Usage (Options API):
 *   import { JampollsWidget } from '@jampolls/sdk/vue';
 *   components: { JampollsWidget }
 *   <JampollsWidget embed-key="your_embed_key" theme="auto" />
 */
export const JampollsWidget = defineComponent({
  name: 'JampollsWidget',

  props: {
    embedKey: { type: String, required: true },
    theme: { type: String, default: 'auto' },
  },

  emits: ['load', 'vote', 'error'],

  setup(props, { emit }) {
    const containerRef = ref(null);
    let widget = null;

    function mount() {
      if (!containerRef.value || !props.embedKey) return;
      widget = JamPolls.embed(props.embedKey, containerRef.value, {
        theme: props.theme,
        onLoad: data => emit('load', data),
        onVote: event => emit('vote', event),
        onError: err => emit('error', err),
      });
    }

    onMounted(mount);

    watch(() => props.embedKey, () => {
      if (widget) widget.destroy();
      mount();
    });

    onUnmounted(() => {
      if (widget) widget.destroy();
    });

    return () => h('div', { ref: containerRef });
  },
});
