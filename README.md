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
  signed-url-endpoint="https://your-backend.example.com/api/signedUrl"
></ambernexus-bubble-widget>

<script src="https://cdn.jsdelivr.net/npm/ai_bot_voice/dist/ambernexus-ai_bot_voice.min.js"></script>
<script>
  const w = document.querySelector("ambernexus-bubble-widget");
  w.addEventListener("aw:start", () => console.log("started"));
  w.addEventListener("aw:mode", (e) => console.log("mode", e.detail.mode));
  w.addEventListener("aw:error", (e) => console.error(e.detail.message));
</script>
```

The widget holds **no secrets**. It only needs `signed-url-endpoint`, which points at
your own backend (`POST /api/signedUrl`). That backend proxies the Voice API, keeps the
`VOICE_API_KEY` server-side, and injects the agent/session config from env vars — so the
browser never sees an API key, agent id, or any session params. See
[Backend endpoint reference](#backend-endpoint-reference) below.

### Auto-init from `data-ai-bot-voice`

```html
<div data-ai-bot-voice signed-url-endpoint="https://your-backend.example.com/api/signedUrl"></div>
<script src="https://cdn.jsdelivr.net/npm/ai_bot_voice/dist/ambernexus-ai_bot_voice.min.js"></script>
<script>AmbernexusAiBotVoice.autoInit();</script>
```

### React

```jsx
import { AmbernexusBubbleWidget } from "ai_bot_voice/react";

export default function App() {
  return (
    <AmbernexusBubbleWidget
      signedUrlEndpoint="https://your-backend.example.com/api/signedUrl"
      primaryColor="#db2777"
      width="320px"
      height="380px"
      onStart={() => console.log("started")}
      onMode={(e) => console.log("mode", e.detail.mode)}
      onError={(e) => console.error(e.detail.message)}
    />
  );
}
```

### Next.js (App Router)

The widget uses browser-only APIs (`document`, `customElements`, `WebSocket`, `AudioContext`), so render it in a client component:

```jsx
"use client";
import { AmbernexusBubbleWidget } from "ai_bot_voice/react";

export default function Page() {
  return <AmbernexusBubbleWidget signedUrlEndpoint="https://your-backend.example.com/api/signedUrl" />;
}
```

#### Hydration safety

As of **1.0.2**, the widget is hydration-safe. The host element (`<ambernexus-bubble-widget>`) is **never** mutated by the constructor or `connectedCallback` — all dynamic state (`data-mode`, `data-call-active`, the `--aw-*` CSS variables) lives on an internal `<div class="root">` inside the shadow DOM, which is invisible to React's reconciler. The HTML React renders on the server matches the HTML it sees on the client.

If you're on **1.0.0 or 1.0.1** you may have seen warnings like:

> A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
> `- data-mode="idle"` `- data-call-active="false"` `- style={{--aw-primary:"#e51515", …}}`

Upgrade to `1.0.2`+ to fix this — no app-side changes required.

#### Optional extra safety (only if you cannot upgrade)

If you must stay on an older version, you can keep the widget out of SSR with `next/dynamic`:

```jsx
// WidgetClient.tsx
"use client";
import { AmbernexusBubbleWidget } from "ai_bot_voice/react";
export default function WidgetClient(props) {
  return <AmbernexusBubbleWidget {...props} />;
}
```

```jsx
// app/page.tsx
import dynamic from "next/dynamic";
const Widget = dynamic(() => import("./WidgetClient"), { ssr: false });

export default function Page() {
  return <Widget signedUrlEndpoint="https://your-backend.example.com/api/signedUrl" />;
}
```

### Vue 3

```vue
<script setup>
import { AmbernexusBubbleWidget } from "ai_bot_voice/vue";
</script>

<template>
  <AmbernexusBubbleWidget
    signed-url-endpoint="https://your-backend.example.com/api/signedUrl"
    primary-color="#db2777"
    @aw:start="() => console.log('started')"
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
  <ambernexus-bubble-widget signed-url-endpoint="https://your-backend.example.com/api/signedUrl" />
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
<ambernexus-bubble-widget signed-url-endpoint="https://your-backend.example.com/api/signedUrl"></ambernexus-bubble-widget>
```

### Vite / Create React App / vanilla bundlers

```js
import "ai_bot_voice";
// the custom element is now registered globally
```

---

## Attributes

All attributes are optional except `signed-url-endpoint` (required to start a call).

| Attribute              | Type    | Default                          | Notes                                              |
| ---------------------- | ------- | -------------------------------- | -------------------------------------------------- |
| `signed-url-endpoint`  | string  | —                                | **Required.** Your backend `POST /api/signedUrl` URL. No default. |
| `button-label`         | string  | `"Ask Revo AI"`                  | Trigger pill label.                                |
| `bubble-count`         | number  | `28`                             | Animated background bubble count.                  |
| `primary-color`        | CSS     | `#4466ee`                        | `--aw-primary`                                     |
| `accent-color`         | CSS     | `#f37d2c`                        | `--aw-accent`                                      |
| `bg-color`             | CSS     | `rgba(17, 24, 47, 0.96)`         | `--aw-bg`                                          |
| `text-color`           | CSS     | `#ffffff`                        | `--aw-text`                                        |
| `width`                | CSS     | `340px`                          | `--aw-width`                                       |
| `height`               | CSS     | `460px`                          | `--aw-height`                                      |

The widget POSTs an **empty body** (`{}`) with **no API key** to `signed-url-endpoint`
and expects `{ "signedUrl": "..." }` back. All agent/session config lives on the backend.

### CSS custom properties

The same values can be set via `:host` or any ancestor — every attribute above is implemented as a CSS variable (`--aw-*`) for easy theming.

---

## Events

The custom element dispatches the following `CustomEvent`s:

| Event       | `detail`                                       |
| ----------- | ---------------------------------------------- |
| `aw:open`   | —                                              |
| `aw:close`  | —                                              |
| `aw:start`  | —                                              |
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
w.configure({ primaryColor: "#f00", signedUrlEndpoint: "https://your-backend.example.com/api/signedUrl" });
```

---

## Backend endpoint reference

The widget points `signed-url-endpoint` at **your own backend**, which proxies the Voice
API so the `VOICE_API_KEY` is never exposed to the browser. This is the contract the
widget expects.

### `POST /api/signedUrl`

Generates a short-lived **signed URL** for the Voice API.

|              |                                 |
| ------------ | ------------------------------- |
| Method       | `POST`                          |
| URL          | `/api/signedUrl`                |
| Auth         | None (server holds the API key) |
| Content-Type | `application/json`              |

**Request body** — optional. The widget always sends an empty body (`{}`). You may
optionally forward `dynamic_variables` (object) to the Voice API as overrides; an empty
body or no body is also valid.

```json
{
  "dynamic_variables": { "user_name": "Naga", "plan": "pro" }
}
```

**Success — `200 OK`**

```json
{ "signedUrl": "https://voice.example.com/session?token=..." }
```

The widget also accepts `signed_url`, `url`, or a bare string for backwards compatibility.

**Error responses**

| Status | Body                                                              | When                            |
| ------ | ---------------------------------------------------------------- | ------------------------------- |
| 400    | `{ "success": false, "message": "Invalid JSON in request body" }` | Request body is malformed JSON. |
| 500    | `{ "message": "Failed to generate signed URL", "error": ... }`    | Upstream Voice API call failed. |

**Example**

```bash
curl -X POST https://your-backend.example.com/api/signedUrl \
  -H "Content-Type: application/json" \
  -d '{}'
```

> **PowerShell note:** quoting differs — use
>
> ```powershell
> curl -Method POST https://your-backend.example.com/api/signedUrl -ContentType "application/json" -Body '{}'
> ```

### Backend environment variables

The endpoint calls an external Voice API. Configure these in the backend's `.env`:

| Variable          | Description                                          | Default        |
| ----------------- | ---------------------------------------------------- | -------------- |
| `VOICE_API_URL`   | URL of the external Voice API signed-URL endpoint    | —              |
| `VOICE_API_KEY`   | Secret API key for the Voice API (server-side only)  | —              |
| `VOICE_AGENT_ID`  | Voice agent identifier                               | —              |
| `VOICE_USER_ID`   | User identifier forwarded to the Voice API           | `12`           |
| `VOICE_TIMEZONE`  | Timezone forwarded to the Voice API                  | `Asia/Kolkata` |
| `VOICE_SECS_LEFT` | Session length in seconds                            | `600`          |
| `VOICE_ORIGIN`    | Origin label forwarded to the Voice API              | `browser`      |

For local development, point the widget at your dev server, e.g.
`signed-url-endpoint="http://localhost:5000/api/signedUrl"`.

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
