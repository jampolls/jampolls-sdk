# Jampolls SDK

The official JavaScript SDK for embedding Jampolls interactive polls on any website.

[![npm](https://img.shields.io/npm/v/@jampolls/sdk)](https://www.npmjs.com/package/@jampolls/sdk)
[![License](https://img.shields.io/npm/l/@jampolls/sdk)](LICENSE)

---

## Installation

### CDN (no build step required)

```html
<script src="https://cdn.jampolls.com/latest/jampolls.min.js"></script>
```

Pin to a specific version in production:

```html
<script src="https://cdn.jampolls.com/v1.0.0/jampolls.min.js"></script>
```

### npm

```bash
npm install @jampolls/sdk
```

---

## Get your embed key

1. Sign in at [jampolls.com](https://jampolls.com)
2. Create a poll and set it as active in your dashboard → **Widgets**
3. Copy your embed key

---

## Usage

### Script tag (plain HTML)

```html
<script src="https://cdn.jampolls.com/latest/jampolls.min.js"></script>

<div id="my-poll"></div>

<script>
  JamPolls.embed('YOUR_EMBED_KEY', '#my-poll');
</script>
```

### Auto-embed via data attribute

No JavaScript needed — just add the attribute and the SDK initialises it automatically:

```html
<script src="https://cdn.jampolls.com/latest/jampolls.min.js"></script>

<div data-jampolls="YOUR_EMBED_KEY"></div>
```

### React

```jsx
import { JampollsWidget } from '@jampolls/sdk/react';

export default function Page() {
  return (
    <JampollsWidget
      embedKey="YOUR_EMBED_KEY"
      theme="dark"
      vars={{ '--jp-primary': '#7c3aed', '--jp-radius': '12px', 'max-width': '480px' }}
      onVote={({ optionId, removed }) => console.log(optionId, removed)}
    />
  );
}
```

### Vue 3

```vue
<script setup>
import { JampollsWidget } from '@jampolls/sdk/vue';

const vars = {
  '--jp-primary': '#7c3aed',
  '--jp-radius': '12px',
  'max-width': '480px',
};
</script>

<template>
  <JampollsWidget embed-key="YOUR_EMBED_KEY" theme="auto" :vars="vars" @vote="onVote" />
</template>
```

---

## Options

```javascript
JamPolls.embed('YOUR_EMBED_KEY', '#container', {
  theme: 'dark',       // override the poll owner's theme setting
  vars: {              // override any CSS custom property
    '--jp-primary': '#7c3aed',
    '--jp-radius':  '4px',
    'max-width':    '100%',
  },
  onLoad:  (data)  => console.log(data),
  onVote:  (event) => console.log(event.optionId, event.removed),
  onError: (err)   => console.error(err),
});
```

| Option | Type | Description |
|---|---|---|
| `theme` | `'auto' \| 'light' \| 'dark' \| 'jampolls'` | Overrides the poll owner's dashboard theme. `auto` follows the visitor's system preference. |
| `vars` | `Record<string, string>` | CSS custom property overrides applied directly to the widget. Use this to match your brand. |
| `onLoad` | `(data: PollData) => void` | Fired when poll data loads successfully. |
| `onVote` | `(event: VoteEvent) => void` | Fired after a vote is submitted or removed. |
| `onError` | `(error: Error) => void` | Fired on network or API errors. |

> **Note:** `show_results`, `show_branding`, and `allow_multiple_votes` are controlled by the poll owner from their Jampolls dashboard — they are not developer options. Your subscription tier determines what the owner can configure.

---

## CSS customisation

The widget uses CSS custom properties scoped to `.jp-widget`. Override them via the `vars` option or in your own stylesheet:

```css
.jp-widget {
  --jp-primary:     #7c3aed; /* accent colour */
  --jp-bg:          #ffffff;
  --jp-surface:     #f8fafc;
  --jp-text:        #0f172a;
  --jp-text-muted:  #64748b;
  --jp-border:      #e2e8f0;
  --jp-radius:      12px;    /* widget corner radius */
  --jp-option-radius: 8px;   /* option button corner radius */
  max-width:        480px;   /* widget width cap */
}
```

The widget fills its container at `width: 100%` up to `max-width`. Control the width by sizing the container or overriding `max-width` via `vars`.

---

## API reference

### `JamPolls.embed(embedKey, target, opts?)`

Mounts a poll widget into a container. Returns a widget instance.

- `embedKey` — your embed key from the Jampolls dashboard
- `target` — CSS selector string or HTMLElement
- `opts` — optional configuration (see Options above)

### `JamPolls.getWidget(target)`

Returns the widget instance currently mounted in a container, or `null`.

### `JamPolls.removeWidget(target)`

Destroys the widget and clears the container.

### `JamPolls.autoEmbed()`

Scans the page for `[data-jampolls]` elements and initialises them. Called automatically on `DOMContentLoaded` when using the CDN script.

### Widget instance

```javascript
const widget = JamPolls.embed('KEY', '#container');

widget.refresh(); // re-fetch and re-render
widget.destroy(); // unmount and clear
```

---

## TypeScript

Full type definitions are included:

```typescript
import JamPolls, { WidgetOptions, PollData, VoteEvent } from '@jampolls/sdk';
```

---

## Browser support

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+. No IE11.

---

## License

MIT — see [LICENSE](LICENSE)
