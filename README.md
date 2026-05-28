# ai_bot_voice

A framework-agnostic AI voice bubble widget for the browser. Shipped as a **Web Component** (custom element), so it works in **React, Next.js, Vue, Angular, Vite, Create React App, plain HTML/JS, and via CDN** — no framework-specific lock-in.

- Real-time voice conversation over WebSocket (PCM-16 in/out)
- Microphone capture + playback with mute/unmute, level metering, and waveform
- Animated trigger pill + floating panel with bubbles, orb, and call timer
- Themeable via CSS custom properties and HTML attributes
- SSR-safe — importing the package in Node does not touch `document` or `customElements`
- ESM + CJS + UMD builds with TypeScript declarations
- Thin React + Vue wrappers exposing typed props and events

---

## Install

```sh
npm install ai_bot_voice
# or
yarn add ai_bot_voice
# or
pnpm add ai_bot_voice
```

---

## CDN (no install)

```html
<script src="https://cdn.jsdelivr.net/npm/ai_bot_voice/dist/ambernexus-ai_bot_voice.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/ai_bot_voice/dist/ambernexus-ai_bot_voice.min.js"></script>
```

The UMD bundle registers the `<ambernexus-bubble-widget>` element and also exposes a global `window.AmbernexusAiBotVoice` namespace containing `{ AmbernexusBubbleWidget, register, autoInit, TAG_NAME }`.

---

## Usage

### Vanilla HTML + JS

```html
<ambernexus-bubble-widget
  button-label="Ask Nexus AI"
  primary-color="#db2777"
  accent-color="#f472b6"
  width="320px"
  height="380px"
  agent-id="your-agent-id"
  user-id="12"
  secs-left="600"
  origin="browser"
  overrides='{"timezone":"Asia/Kolkata","dynamic_variables":{}}'
></ambernexus-bubble-widget>

<script src="https://cdn.jsdelivr.net/npm/ai_bot_voice/dist/ambernexus-ai_bot_voice.min.js"></script>
<script>
  const w = document.querySelector("ambernexus-bubble-widget");
  w.addEventListener("aw:start", (e) => console.log("started", e.detail));
  w.addEventListener("aw:mode", (e) => console.log("mode", e.detail.mode));
  w.addEventListener("aw:error", (e) => console.error(e.detail.message));
</script>
```

### Auto-init from `data-ai-bot-voice`

```html
<div data-ai-bot-voice agent-id="your-agent-id" user-id="12"></div>
<script src="https://cdn.jsdelivr.net/npm/ai_bot_voice/dist/ambernexus-ai_bot_voice.min.js"></script>
<script>AmbernexusAiBotVoice.autoInit();</script>
```

### React

```jsx
import { AmbernexusBubbleWidget } from "ai_bot_voice/react";

export default function App() {
  return (
    <AmbernexusBubbleWidget
      agentId="your-agent-id"
      userId="12"
      primaryColor="#db2777"
      width="320px"
      height="380px"
      overrides={{ timezone: "Asia/Kolkata", dynamic_variables: {} }}
      onStart={(e) => console.log("started", e.detail)}
      onMode={(e) => console.log("mode", e.detail.mode)}
      onError={(e) => console.error(e.detail.message)}
    />
  );
}
```

### Next.js (App Router)

The widget uses browser-only APIs (`document`, `customElements`, `WebSocket`, `AudioContext`), so render it on the client:

```jsx
"use client";
import { AmbernexusBubbleWidget } from "ai_bot_voice/react";

export default function Page() {
  return <AmbernexusBubbleWidget agentId="your-agent-id" userId="12" />;
}
```

If you import the core (non-React) entry from a server component, do it via `dynamic`:

```jsx
import dynamic from "next/dynamic";
const Widget = dynamic(() => import("./WidgetClient"), { ssr: false });
```

### Vue 3

```vue
<script setup>
import { AmbernexusBubbleWidget } from "ai_bot_voice/vue";
</script>

<template>
  <AmbernexusBubbleWidget
    agent-id="your-agent-id"
    user-id="12"
    primary-color="#db2777"
    :overrides="{ timezone: 'Asia/Kolkata', dynamic_variables: {} }"
    @aw:start="(e) => console.log('started', e.detail)"
    @aw:error="(e) => console.error(e.detail.message)"
  />
</template>
```

If you'd rather use the custom element directly in a Vue template, tell Vue not to compile it as a Vue component:

```js
// vite.config.js / vue.config.js
export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === "ambernexus-bubble-widget"
        }
      }
    })
  ]
};
```

```vue
<script setup>
import "ai_bot_voice";
</script>

<template>
  <ambernexus-bubble-widget agent-id="..." user-id="12" />
</template>
```

### Angular

In your module, add `CUSTOM_ELEMENTS_SCHEMA` so Angular's template compiler accepts the unknown tag:

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "ai_bot_voice";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

```html
<ambernexus-bubble-widget agent-id="your-agent-id" user-id="12"></ambernexus-bubble-widget>
```

### Vite / Create React App / vanilla bundlers

```js
import "ai_bot_voice";
// the custom element is now registered globally
```

---

## Attributes

All attributes are optional except `agent-id` (required to start a call).

| Attribute              | Type    | Default                          | Notes                                              |
| ---------------------- | ------- | -------------------------------- | -------------------------------------------------- |
| `agent-id`             | string  | —                                | **Required.** Voice agent identifier.              |
| `user-id`              | string  | `""`                             | Identifies the caller.                             |
| `secs-left`            | number  | `600`                            | Remaining call seconds.                            |
| `origin`               | string  | `"browser"`                      | Origin tag forwarded to the backend.               |
| `signed-url-endpoint`  | string  | Ambernexus default               | Override the signed-URL endpoint.                  |
| `overrides`            | JSON    | `{"timezone":"Asia/Kolkata"}`    | JSON-stringified `{ timezone, dynamic_variables }` |
| `button-label`         | string  | `"Ask Revo AI"`                  | Trigger pill label.                                |
| `bubble-count`         | number  | `28`                             | Animated background bubble count.                  |
| `primary-color`        | CSS     | `#4466ee`                        | `--aw-primary`                                     |
| `accent-color`         | CSS     | `#f37d2c`                        | `--aw-accent`                                      |
| `bg-color`             | CSS     | `rgba(17, 24, 47, 0.96)`         | `--aw-bg`                                          |
| `text-color`           | CSS     | `#ffffff`                        | `--aw-text`                                        |
| `width`                | CSS     | `340px`                          | `--aw-width`                                       |
| `height`               | CSS     | `460px`                          | `--aw-height`                                      |

### CSS custom properties

The same values can be set via `:host` or any ancestor — every attribute above is implemented as a CSS variable (`--aw-*`) for easy theming.

---

## Events

The custom element dispatches the following `CustomEvent`s:

| Event       | `detail`                                       |
| ----------- | ---------------------------------------------- |
| `aw:open`   | —                                              |
| `aw:close`  | —                                              |
| `aw:start`  | `{ agentId, userId, secsLeft, origin, overrides }` |
| `aw:stop`   | —                                              |
| `aw:mode`   | `{ mode: "idle" \| "connecting" \| "listening" \| "speaking" }` |
| `aw:mute`   | `{ muted: boolean }`                           |
| `aw:error`  | `{ message: string }`                          |

The React wrapper forwards these as `onOpen`, `onClose`, `onStart`, `onStop`, `onMode`, `onMute`, `onError`. The Vue wrapper emits them with their original `aw:*` names.

---

## Imperative API

```ts
const w = document.querySelector("ambernexus-bubble-widget");
w.open();          // open the panel
w.close();         // close the panel
w.start();         // begin a call
w.stop();          // end a call
w.toggleMute();    // toggle the microphone
w.setMuted(true);  // set mute explicitly
w.configure({ primaryColor: "#f00", overrides: { timezone: "UTC" } });
```

---

## SSR notes

- Importing the package on the server is safe: the template DOM is created lazily on first instantiation, and `customElements.define` is guarded by a `typeof window !== "undefined"` check.
- The element only renders in the browser. If you SSR a host page that contains `<ambernexus-bubble-widget>`, the tag will be emitted as-is and upgrade on the client once the script is loaded.
- For frameworks that complain about unknown tags (Vue, Angular), see the integration notes above.

---

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge, mobile Safari/Chrome). The widget uses `AudioContext`, `MediaDevices.getUserMedia`, `WebSocket`, and CSS `color-mix()`/`backdrop-filter`. Microphone capture requires a secure origin (HTTPS or `localhost`).

---

## Local development

```sh
npm install
npm run build       # produces dist/ (ESM, CJS, UMD, min, .d.ts)
npm run build:watch # rebuild on change
```

Open `examples/html-js/index.html` after building to exercise the UMD bundle locally (serve through any static server — `npx serve .` works).

---

## License

ISC © Ambernexus
