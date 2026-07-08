# Jampolls SDK

The official JavaScript SDK for embedding Jampolls **polls**, **ratings**, and **surveys** on any website. One embed key serves whichever tool the dashboard owner has active; live embeds update when they switch tools — no code changes on your site.

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
2. Open **Embeds** in your dashboard
3. Create or select an embed and activate a poll, rating, or survey
4. Copy your embed key

The SDK reads `tool_type` from the API and renders the matching widget automatically.

---

## Usage

### Script tag (plain HTML)

```html
<script src="https://cdn.jampolls.com/latest/jampolls.min.js"></script>

<div id="my-widget"></div>

<script>
  JamPolls.embed('YOUR_EMBED_KEY', '#my-widget');
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
      onSubmit={(event) => console.log('submitted', event)}
      onToolChanged={({ tool_type }) => console.log('switched to', tool_type)}
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
  theme: 'dark',       // override the owner's theme setting
  layout: 'auto',      // poll layout: 'vertical' | 'horizontal' | 'auto'
  vars: {              // override any CSS custom property
    '--jp-primary': '#7c3aed',
    '--jp-radius':  '4px',
    'max-width':    '100%',
  },
  apiUrl: 'http://localhost:8000', // optional, local development only
  onLoad:  (data)  => console.log(data.tool_type, data),
  onVote:  (event) => console.log(event),           // poll only
  onSubmit:(event) => console.log(event),           // rating / survey
  onToolChanged: (payload) => console.log(payload.tool_type), // SSE tool switch
  onError: (err)   => console.error(err),
});
```

| Option | Type | Description |
|---|---|---|
| `theme` | `'auto' \| 'light' \| 'dark' \| 'jampolls'` | Overrides the owner's dashboard theme. `auto` follows the visitor's system preference. |
| `layout` | `'vertical' \| 'horizontal' \| 'auto'` | Poll widget layout only. `auto` switches at 520 px container width. |
| `vars` | `Record<string, string>` | CSS custom property overrides applied directly to the widget. |
| `apiUrl` | `string` | API origin override for local development. Defaults to `https://hub.jampolls.com`. |
| `onLoad` | `(data: EmbedToolData) => void` | Fired when tool data loads. Check `data.tool_type` (`poll`, `rating`, or `survey`). |
| `onVote` | `(event: VoteEvent) => void` | Poll only — fired after a vote is submitted or removed. |
| `onSubmit` | `(event) => void` | Rating / survey — fired after a successful submission. |
| `onToolChanged` | `(payload) => void` | Fired when the dashboard owner switches the active tool (via SSE). Widget re-inits automatically. |
| `onError` | `(error: Error) => void` | Fired on network or API errors. |

> **Note:** `show_results`, `show_branding`, and poll voting rules are controlled by the owner from their Jampolls dashboard — they are not developer options.

---

## Tool types

| `tool_type` | Widget | Submission |
|---|---|---|
| `poll` | Vote on options, live results via SSE | `POST /widgets/{key}/vote/` |
| `rating` | Stars, numbers, or emojis + optional comment | `POST /widgets/{key}/submit/` |
| `survey` | Text, choice, likert/rating, dropdown questions | `POST /widgets/{key}/submit/` |

Survey display modes: `all_questions`, `one_by_one`, and `auto_advance` (auto-advances 300 ms after a single-choice or rating answer in step mode).

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

Fetches the active tool and mounts the matching widget into a container. Returns a widget instance.

- `embedKey` — your embed key from the Jampolls dashboard (**Embeds** page)
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
import JamPolls, {
  WidgetOptions,
  EmbedToolData,
  PollData,
  RatingData,
  SurveyData,
  VoteEvent,
} from '@jampolls/sdk';
```

---

## Real-time updates (SSE)

Once a widget loads, it connects to a Server-Sent Events stream for the embed. Counts and state update automatically — no page refresh needed.

| Event | When |
|---|---|
| `snapshot` | Initial connect — full tool state |
| `poll.update` | Poll vote recorded |
| `rating.update` | Rating submitted |
| `survey.update` | Survey response recorded |
| `tool_type_changed` | Dashboard owner switched active tool — SDK destroys and re-inits in place |

- **Auto-reconnect** — exponential backoff (1 s → 60 s, ±20 % jitter)
- **Idle tab** — stream disconnects when hidden, reconnects on return

---

## Offline cache and stale-data indicator

The poll widget caches state in `localStorage` (key: `jampolls_embed_{embedKey}`) after every successful fetch or live update.

**When the server is unreachable on load**, the poll widget renders from cache and shows a muted "Last synced X ago" notice until fresh data arrives.

```
localStorage key: jampolls_embed_<embedKey>
value shape:      { data: {...}, lastFetchedAt: "<ISO8601 timestamp>" }
```

Voter identity is stored separately under `jp_voter_id` (server-issued via `POST /api/v1/voter/identity/`).

---

## Local development and testing

### 1. Build the SDK

```bash
npm install
npm run build
```

### 2. Serve an example page

```bash
npm run dev
# or
python -m http.server 8000
# then open examples/basic.html
```

Replace `YOUR_EMBED_KEY` in the example HTML with a real key from your dashboard **Embeds** page.

### 3. Point at a local backend (optional)

```javascript
JamPolls.embed('YOUR_EMBED_KEY', '#container', {
  apiUrl: 'http://localhost:8000',
  onLoad: (data) => console.log('tool_type:', data.tool_type),
  onToolChanged: (p) => console.log('switched to', p.tool_type),
});
```

Run the Django backend (`python manage.py runserver`) alongside the SDK dev server.

### 4. Test each tool type

Use **one embed key** and switch the active tool in the dashboard **Embeds** page:

1. **Poll** — vote on options; confirm counts update live (SSE `poll.update`)
2. **Rating** — submit a star/number/emoji rating; confirm thank-you state and average display
3. **Survey** — answer questions and submit; confirm outro screen

With the embed open in a browser tab, switch the active tool in the dashboard — the widget should re-render as the new type without reloading your page (`tool_type_changed` SSE event).

### 5. Verify in DevTools

- **Network** — `GET /api/v1/widgets/{key}/fetch/` returns `tool_type` + one populated `*_data` field
- **Network** — `POST /api/v1/voter/identity/` runs once per session before submissions
- **EventStream** — `GET /api/v1/widgets/{key}/stream/` delivers `snapshot` then tool-specific update events

---

## Browser support

Chrome 60+, Firefox 55+, Safari 12+, Edge 79+. No IE11.

---

## License

MIT — see [LICENSE](LICENSE)
