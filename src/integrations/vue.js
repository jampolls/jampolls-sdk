import { defineComponent, onMounted, onUnmounted, ref, watch, h } from 'vue';
import JamPolls from '../core/index.js';

/**
 * Vue 3 component for embedding a Jampolls poll.
 *
 * Usage (Options API):
 *   import { JampollsWidget } from '@jampolls/sdk/vue';
 *   components: { JampollsWidget }
 *   <JampollsWidget embed-key="your_embed_key" theme="auto" :vars="{ '--jp-primary': '#7c3aed' }" />
 */
export const JampollsWidget = defineComponent({
  name: 'JampollsWidget',

  props: {
    embedKey: { type: String, required: true },
    theme: { type: String, default: 'auto' },
    vars: { type: Object, default: undefined },
    apiUrl: { type: String, default: undefined },
  },

  emits: ['load', 'vote', 'error'],

  setup(props, { emit }) {
    const containerRef = ref(null);
    let widget = null;

    function mount() {
      if (!containerRef.value || !props.embedKey) return;
      widget = JamPolls.embed(props.embedKey, containerRef.value, {
        theme: props.theme,
        vars: props.vars,
        apiUrl: props.apiUrl,
        onLoad: data => emit('load', data),
        onVote: event => emit('vote', event),
        onError: err => emit('error', err),
      });
    }

    function unmount() {
      if (!widget) return;
      if (containerRef.value) {
        JamPolls.removeWidget(containerRef.value);
      } else {
        widget.destroy();
      }
      widget = null;
    }

    onMounted(mount);

    watch(() => [props.embedKey, props.theme, props.vars, props.apiUrl], () => {
      unmount();
      mount();
    }, { deep: true });

    onUnmounted(() => {
      unmount();
    });

    return () => h('div', { ref: containerRef });
  },
});
