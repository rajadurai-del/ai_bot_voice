const DEFAULT_SIGNED_URL_ENDPOINT = "https://voice-api.ambernexus.ai:4011/api/conversation/signedUrl";
const DEFAULT_API_KEY = "vA9wjNYv97D4QrSJ8AfHu1rjHWRcfAYWqUk7zy2EByF4qweQTXQmDQf7vj8NZm6F";
const TAG_NAME = "ambernexus-bubble-widget";

const MODE_LABELS = {
  idle: "Ready",
  connecting: "Connecting…",
  listening: "Listening",
  speaking: "Speaking"
};

const MODE_MESSAGES = {
  idle: "Tap below to start a voice conversation.",
  connecting: "Connecting to your AI assistant…",
  listening: "I'm listening — go ahead and speak.",
  speaking: "Agent is responding…"
};

const ERROR_MIC_DENIED = "Microphone access blocked. Please allow microphone access in your browser settings and try again.";

const MODE_COLORS = {
  idle: "#9370ff",
  connecting: "#facc15",
  listening: "#4ade80",
  speaking: "#50c2ff"
};

const TEMPLATE_HTML = `
  <style>
    :host {
      all: initial;
      display: inline-block;
      --aw-primary: #4466ee;
      --aw-accent: #f37d2c;
      --aw-bg: rgba(17, 24, 47, 0.96);
      --aw-text: #ffffff;
      --aw-muted: rgba(255, 255, 255, 0.62);
      --aw-width: 340px;
      --aw-height: 460px;
      --aw-radius: 22px;
      --aw-z: 9999;
      --aw-mode-color: ${MODE_COLORS.idle};
      font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; }

    .root {
      position: relative;
      display: inline-block;
      z-index: var(--aw-z);
      color: var(--aw-text);
    }

    .trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      height: 56px;
      padding: 0 18px 0 10px;
      border-radius: 999px;
      border: 1px solid color-mix(in oklab, var(--aw-primary), white 24%);
      color: var(--aw-text);
      background: linear-gradient(145deg, #101a33, #0d1428);
      cursor: pointer;
      overflow: hidden;
      box-shadow:
        0 14px 30px rgba(0, 0, 0, 0.42),
        inset 0 1px 1px rgba(255, 255, 255, 0.14);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .trigger:hover { transform: translateY(-2px); box-shadow: 0 20px 38px rgba(0,0,0,0.5); }
    .trigger:active { transform: translateY(0); }
    .trigger:focus-visible { outline: 2px solid var(--aw-accent); outline-offset: 2px; }

    .trigger::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg,
        color-mix(in oklab, var(--aw-primary), transparent 82%),
        transparent 40%,
        color-mix(in oklab, var(--aw-accent), transparent 85%));
      opacity: 0.6;
      pointer-events: none;
    }

    .trigger-orb {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      flex-shrink: 0;
      background:
        radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.06) 24%, transparent 50%),
        radial-gradient(circle at 70% 75%,
          color-mix(in oklab, var(--aw-accent), white 12%),
          color-mix(in oklab, var(--aw-primary), black 30%) 60%,
          #110b22 95%);
      box-shadow:
        0 0 0 2px color-mix(in oklab, var(--aw-accent), transparent 60%),
        inset 0 1px 3px rgba(255,255,255,0.35),
        inset 0 -3px 8px rgba(0,0,0,0.4);
      animation: triggerPulse 2.6s ease-in-out infinite;
    }
    @keyframes triggerPulse {
      0%, 100% { box-shadow: 0 0 0 2px color-mix(in oklab, var(--aw-accent), transparent 60%), inset 0 1px 3px rgba(255,255,255,0.35), inset 0 -3px 8px rgba(0,0,0,0.4); }
      50% { box-shadow: 0 0 0 7px color-mix(in oklab, var(--aw-accent), transparent 82%), inset 0 1px 3px rgba(255,255,255,0.35), inset 0 -3px 8px rgba(0,0,0,0.4); }
    }

    .trigger-label { position: relative; z-index: 1; white-space: nowrap; }

    .trigger-live {
      display: none;
      align-items: center;
      gap: 5px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.6px;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(239, 68, 68, 0.22);
      border: 1px solid rgba(239, 68, 68, 0.55);
      color: #fff;
      position: relative;
      z-index: 1;
    }
    :host([data-call-active="true"]) .trigger-live { display: inline-flex; }
    .trigger-live::before {
      content: "";
      width: 6px; height: 6px;
      border-radius: 999px;
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
      animation: liveBlink 1.1s ease-in-out infinite;
    }
    @keyframes liveBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

    .panel {
      position: absolute;
      right: 0;
      top: 72px;
      width: var(--aw-width);
      height: var(--aw-height);
      background: var(--aw-bg);
      backdrop-filter: blur(14px);
      border: 1px solid color-mix(in oklab, var(--aw-primary), white 20%);
      border-radius: var(--aw-radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: translateY(14px) scale(0.97);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s ease, opacity 0.2s ease;
      box-shadow: 0 26px 60px rgba(0, 0, 0, 0.55);
    }
    .panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .bubbles {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .bubble {
      position: absolute;
      bottom: -12px;
      border-radius: 50%;
      background: color-mix(in oklab, var(--aw-mode-color), white 18%);
      opacity: 0.45;
      animation: rise linear infinite;
      transition: background 0.5s ease;
    }
    @keyframes rise {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.65; }
      50% { transform: translateY(-180px) translateX(20px); opacity: 0.85; }
      100% { transform: translateY(-400px) translateX(-20px); opacity: 0; }
    }

    .panel-header {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.10);
    }
    .panel-title {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .status-dot {
      width: 10px; height: 10px;
      border-radius: 999px;
      background: var(--aw-mode-color);
      box-shadow: 0 0 12px color-mix(in oklab, var(--aw-mode-color), transparent 40%);
      transition: background 0.3s ease, box-shadow 0.3s ease;
      flex-shrink: 0;
    }
    :host([data-mode="connecting"]) .status-dot,
    :host([data-mode="listening"]) .status-dot,
    :host([data-mode="speaking"]) .status-dot {
      animation: dotPulse 1.4s ease-in-out infinite;
    }
    @keyframes dotPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.5); }
    }
    .panel-title-text { min-width: 0; }
    .panel-name {
      display: block;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .panel-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--aw-muted);
      margin-top: 3px;
      letter-spacing: 0.1px;
    }
    .call-timer {
      display: none;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      color: color-mix(in oklab, var(--aw-mode-color), white 12%);
      padding-left: 4px;
      border-left: 1px solid rgba(255,255,255,0.18);
    }
    :host([data-call-active="true"]) .call-timer { display: inline-block; }
    .close {
      border: 0;
      width: 30px; height: 30px;
      border-radius: 10px;
      background: rgba(255,255,255,0.06);
      color: var(--aw-text);
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      transition: background 0.2s ease, transform 0.15s ease;
      flex-shrink: 0;
    }
    .close:hover { background: rgba(255,255,255,0.14); }
    .close:active { transform: scale(0.94); }
    .close:focus-visible { outline: 2px solid var(--aw-accent); outline-offset: 2px; }

    .panel-body {
      position: relative;
      z-index: 2;
      flex: 1;
      display: grid;
      grid-template-rows: 1fr auto auto auto;
      padding: 16px;
      gap: 12px;
      min-height: 0;
    }

    .orb-area {
      position: relative;
      display: grid;
      place-items: center;
      min-height: 150px;
    }

    .orb-shell {
      position: relative;
      width: 140px;
      height: 140px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      opacity: 0.55;
      transform: scale(0.88);
      transition: opacity 0.35s ease, transform 0.35s ease;
    }
    .orb-shell.started {
      opacity: 1;
      transform: scale(1);
    }

    .orb {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 999px;
      background:
        radial-gradient(circle at 32% 28%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 22%, transparent 46%),
        radial-gradient(circle at 68% 76%,
          color-mix(in oklab, var(--aw-mode-color), white 10%) 0%,
          color-mix(in oklab, var(--aw-mode-color), black 40%) 44%,
          #110b22 88%);
      box-shadow:
        0 0 0 1px color-mix(in oklab, var(--aw-mode-color), white 22%),
        0 0 0 6px color-mix(in oklab, var(--aw-mode-color), transparent 78%),
        inset 0 3px 10px rgba(255,255,255,0.22),
        inset 0 -10px 14px rgba(0,0,0,0.3);
      animation: orbPulse 3.4s ease-in-out infinite;
      transition: background 0.6s ease, box-shadow 0.5s ease;
    }
    .orb::before {
      content: "";
      position: absolute;
      inset: -32%;
      border-radius: 999px;
      filter: blur(10px);
      opacity: 0.55;
      animation: orbRing 8s linear infinite;
      pointer-events: none;
      background: conic-gradient(from 0deg,
        transparent 0deg,
        color-mix(in oklab, var(--aw-mode-color), white 15%) 44deg,
        transparent 120deg,
        color-mix(in oklab, var(--aw-mode-color), white 5%) 190deg,
        transparent 280deg);
    }
    .orb::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 999px;
      pointer-events: none;
      opacity: 0.4;
      background-image:
        radial-gradient(circle at 18% 22%, rgba(255,255,255,0.55) 0 1px, transparent 1px),
        radial-gradient(circle at 78% 22%, rgba(255,255,255,0.45) 0 1px, transparent 1px),
        radial-gradient(circle at 72% 70%, rgba(255,255,255,0.4) 0 1px, transparent 1px),
        radial-gradient(circle at 34% 76%, rgba(255,255,255,0.35) 0 1px, transparent 1px);
      background-size: 36px 36px, 42px 42px, 30px 30px, 34px 34px;
      animation: sparkleDrift 6s linear infinite;
    }
    @keyframes orbRing { to { transform: rotate(360deg); } }
    @keyframes sparkleDrift {
      0% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-6px) translateX(4px); }
      100% { transform: translateY(0) translateX(0); }
    }
    @keyframes orbPulse {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-3px) scale(1.03); }
    }
    :host([data-mode="listening"]) .orb,
    :host([data-mode="speaking"]) .orb {
      animation: none;
      transform: scale(calc(1 + var(--aw-level, 0) * 0.18));
      transition: transform 0.08s ease-out;
    }

    .wave-wrap {
      position: absolute;
      left: 8px;
      right: 8px;
      bottom: -2px;
      height: 44px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .wave-wrap.active { opacity: 0.9; }
    canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    .messages {
      text-align: center;
      font-size: 13px;
      line-height: 1.5;
      color: var(--aw-muted);
      min-height: 38px;
      padding: 0 4px;
    }

    .error-banner {
      display: none;
      background: rgba(239, 68, 68, 0.14);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #fecaca;
      padding: 9px 12px;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.45;
    }
    .error-banner.visible { display: block; }

    .controls {
      display: flex;
      align-items: stretch;
      gap: 10px;
    }

    .mic-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      flex-shrink: 0;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 14px;
      background: rgba(255,255,255,0.06);
      color: #fff;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
    }
    .mic-btn:hover { background: rgba(255,255,255,0.12); }
    .mic-btn:active { transform: scale(0.95); }
    .mic-btn:focus-visible { outline: 2px solid var(--aw-accent); outline-offset: 2px; }
    .mic-btn svg { width: 20px; height: 20px; fill: currentColor; }
    .mic-btn.muted {
      background: rgba(239, 68, 68, 0.18);
      border-color: rgba(239, 68, 68, 0.55);
      color: #fecaca;
    }
    .mic-btn .mic-slash { display: none; }
    .mic-btn.muted .mic-slash { display: block; }
    .mic-btn.muted .mic-on { display: none; }
    :host([data-call-active="true"]) .mic-btn { display: inline-flex; }

    .call-btn {
      flex: 1;
      border: 0;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
      cursor: pointer;
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(145deg, var(--aw-accent), #d84f2b);
      box-shadow: 0 10px 24px rgba(243,125,44,0.38);
      transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.35s ease, opacity 0.2s ease;
    }
    .call-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(243,125,44,0.5); }
    .call-btn:active { transform: translateY(0); }
    .call-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    .call-btn:disabled { cursor: wait; opacity: 0.85; }

    :host([data-mode="connecting"]) .call-btn {
      background: linear-gradient(145deg, #facc15, #ca8a04);
      box-shadow: 0 10px 24px rgba(234,179,8,0.45);
    }
    :host([data-mode="listening"]) .call-btn,
    :host([data-mode="speaking"]) .call-btn {
      background: linear-gradient(145deg, #ef4444, #b91c1c);
      box-shadow: 0 10px 24px rgba(239,68,68,0.5);
    }

    .call-icon {
      display: inline-flex;
      width: 18px; height: 18px;
    }
    .call-icon svg { width: 100%; height: 100%; fill: currentColor; }
    :host([data-mode="connecting"]) .call-icon { display: none; }
    :host([data-mode="listening"]) .icon-start,
    :host([data-mode="speaking"]) .icon-start { display: none; }
    :host(:not([data-mode="listening"]):not([data-mode="speaking"])) .icon-end { display: none; }

    .spinner {
      display: none;
      width: 16px; height: 16px;
      border-radius: 999px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    :host([data-mode="connecting"]) .spinner { display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>

  <div class="root">
    <button class="trigger" type="button" aria-label="Open assistant">
      <span class="trigger-orb" aria-hidden="true"></span>
      <span class="trigger-label label">Ask Revo AI</span>
      <span class="trigger-live" aria-hidden="true">LIVE</span>
    </button>
    <section class="panel" aria-hidden="true" role="dialog" aria-label="AI Assistant">
      <div class="bubbles"></div>
      <header class="panel-header">
        <div class="panel-title">
          <span class="status-dot" aria-hidden="true"></span>
          <div class="panel-title-text">
            <span class="panel-name">AI Assistant</span>
            <span class="panel-status">
              <span class="status-label">Ready</span>
              <span class="call-timer" aria-label="Call duration">00:00</span>
            </span>
          </div>
        </div>
        <button class="close" type="button" aria-label="Close">×</button>
      </header>
      <div class="panel-body">
        <div class="orb-area">
          <span class="orb-shell"><span class="orb"></span></span>
          <div class="wave-wrap"><canvas></canvas></div>
        </div>
        <div class="messages" aria-live="polite">Tap below to start a voice conversation.</div>
        <div class="error-banner" role="alert"></div>
        <div class="controls">
          <button class="mic-btn" type="button" aria-label="Mute microphone" aria-pressed="false">
            <svg class="mic-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11z"/></svg>
            <svg class="mic-slash" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V8.7l-6-6V11a3 3 0 0 0 3 3z"/><path d="M3 4.3 4.3 3l16.7 16.7-1.3 1.3-3.4-3.4A9 9 0 0 1 13 19.94V22h-2v-2.06A9 9 0 0 1 3 11h2a7 7 0 0 0 9.83 6.41L13.3 15.9A5 5 0 0 1 7 11V8.3L3 4.3z"/></svg>
          </button>
          <button class="call-btn" type="button">
            <span class="spinner" aria-hidden="true"></span>
            <span class="call-icon icon-start" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11z"/></svg>
            </span>
            <span class="call-icon icon-end" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M21 15.5 18.5 13c-.4-.4-.5-1-.3-1.5l.7-1.5A11 11 0 0 0 6.3 10l.7 1.5c.2.5.1 1.1-.3 1.5L4.2 15.5a1.6 1.6 0 0 1-2.3 0L.6 14.2a1.6 1.6 0 0 1-.2-2.1A14.7 14.7 0 0 1 24.6 12.1a1.6 1.6 0 0 1-.2 2.1l-1.3 1.3a1.6 1.6 0 0 1-2.1 0z"/></svg>
            </span>
            <span class="call-label">Start call</span>
          </button>
        </div>
      </div>
    </section>
  </div>
`;

let cachedTemplate = null;
function getTemplate() {
  if (cachedTemplate) return cachedTemplate;
  const tpl = document.createElement("template");
  tpl.innerHTML = TEMPLATE_HTML;
  cachedTemplate = tpl;
  return tpl;
}

const HTMLElementCtor =
  typeof HTMLElement !== "undefined"
    ? HTMLElement
    : /** @type {any} */ (class {});

class AmbernexusBubbleWidget extends HTMLElementCtor {
  static get observedAttributes() {
    return [
      "primary-color",
      "accent-color",
      "bg-color",
      "text-color",
      "width",
      "height",
      "button-label",
      "bubble-count",
      "agent-id",
      "user-id",
      "secs-left",
      "origin",
      "signed-url-endpoint",
      "overrides"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(getTemplate().content.cloneNode(true));
    this.isOpen = false;
    this.isAnimating = false;
    this.points = [];
    this.frame = null;
    this.overrides = {
      timezone: "Asia/Kolkata",
      dynamic_variables: {}
    };
    this.mode = "idle";
    this.ws = null;
    this.micStream = null;
    this.captureCtx = null;
    this.captureSource = null;
    this.captureProcessor = null;
    this.micAnalyser = null;
    this.playbackCtx = null;
    this.playbackAnalyser = null;
    this.playbackTime = 0;
    this.speakingTimer = null;
    this.isMuted = false;
    this.callStartTime = 0;
    this.callTimerInterval = null;
    this.levelFrame = null;
    this.setAttribute("data-mode", "idle");
    this.setAttribute("data-call-active", "false");
  }

  connectedCallback() {
    this.root = this.shadowRoot.querySelector(".root");
    this.label = this.shadowRoot.querySelector(".trigger-label");
    this.panel = this.shadowRoot.querySelector(".panel");
    this.bubbles = this.shadowRoot.querySelector(".bubbles");
    this.messages = this.shadowRoot.querySelector(".messages");
    this.errorBanner = this.shadowRoot.querySelector(".error-banner");
    this.statusLabel = this.shadowRoot.querySelector(".status-label");
    this.callTimer = this.shadowRoot.querySelector(".call-timer");
    this.callBtn = this.shadowRoot.querySelector(".call-btn");
    this.callLabel = this.shadowRoot.querySelector(".call-label");
    this.micBtn = this.shadowRoot.querySelector(".mic-btn");
    this.orbEl = this.shadowRoot.querySelector(".orb");
    this.canvas = this.shadowRoot.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.shadowRoot.querySelector(".trigger").addEventListener("click", () => this.toggle());
    this.shadowRoot.querySelector(".close").addEventListener("click", () => this.close());
    this.callBtn.addEventListener("click", () => this.onCallButton());
    this.micBtn.addEventListener("click", () => this.toggleMute());

    this.applyConfigFromAttributes();
    this.renderBubbles();
    this.initCanvas();
    this.applyMode("idle");
    this.resizeHandler = () => {
      this.initCanvas();
      if (this.isOpen) this.positionPanel();
    };
    window.addEventListener("resize", this.resizeHandler);
  }

  disconnectedCallback() {
    this.stop();
    if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler);
  }

  attributeChangedCallback() {
    if (!this.shadowRoot) return;
    this.applyConfigFromAttributes();
    this.renderBubbles();
  }

  configure(config = {}) {
    Object.entries(config).forEach(([k, v]) => {
      if (k === "overrides" && v && typeof v === "object") {
        this.overrides = {
          ...this.overrides,
          ...v,
          dynamic_variables: {
            ...(this.overrides.dynamic_variables || {}),
            ...(v.dynamic_variables || {})
          }
        };
        return;
      }
      const attr = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      this.setAttribute(attr, String(v));
    });
  }

  getStartParams() {
    const secsLeftAttr = this.getAttribute("secs-left");
    const secsLeft = secsLeftAttr === null ? 600 : Number(secsLeftAttr);
    return {
      agentId: this.getAttribute("agent-id") || "",
      userId: this.getAttribute("user-id") || "",
      secsLeft: Number.isFinite(secsLeft) ? secsLeft : 600,
      origin: this.getAttribute("origin") || "browser",
      overrides: {
        timezone: this.overrides.timezone || "Asia/Kolkata",
        dynamic_variables: this.overrides.dynamic_variables || {}
      }
    };
  }

  applyConfigFromAttributes() {
    const s = this.style;
    if (this.getAttribute("primary-color")) s.setProperty("--aw-primary", this.getAttribute("primary-color"));
    if (this.getAttribute("accent-color")) s.setProperty("--aw-accent", this.getAttribute("accent-color"));
    if (this.getAttribute("bg-color")) s.setProperty("--aw-bg", this.getAttribute("bg-color"));
    if (this.getAttribute("text-color")) s.setProperty("--aw-text", this.getAttribute("text-color"));
    if (this.getAttribute("width")) s.setProperty("--aw-width", this.getAttribute("width"));
    if (this.getAttribute("height")) s.setProperty("--aw-height", this.getAttribute("height"));

    const label = this.getAttribute("button-label");
    if (this.label && label) this.label.textContent = label;

    const overridesAttr = this.getAttribute("overrides");
    if (overridesAttr) {
      try {
        const parsed = JSON.parse(overridesAttr);
        if (parsed && typeof parsed === "object") {
          this.overrides = {
            timezone: parsed.timezone || this.overrides.timezone,
            dynamic_variables: parsed.dynamic_variables || {}
          };
        }
      } catch {
        /* ignore malformed JSON */
      }
    }
  }

  renderBubbles() {
    if (!this.bubbles) return;
    this.bubbles.innerHTML = "";
    const count = Number(this.getAttribute("bubble-count") || 28);
    for (let i = 0; i < count; i += 1) {
      const b = document.createElement("span");
      b.className = "bubble";
      const size = 3 + Math.floor(Math.random() * 7);
      const delay = (Math.random() * 7).toFixed(2);
      const duration = (14 + Math.random() * 18).toFixed(2);
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.style.left = `${Math.random() * 100}%`;
      b.style.animationDelay = `${delay}s`;
      b.style.animationDuration = `${duration}s`;
      this.bubbles.appendChild(b);
    }
  }

  initCanvas() {
    if (!this.canvas || !this.panel) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, rect.width);
    this.canvas.height = Math.max(1, rect.height);
    const n = 80;
    this.points = Array.from({ length: n }, (_, i) => ({
      x: (this.canvas.width / (n - 1)) * i,
      y: this.canvas.height / 2
    }));
  }

  drawCurve(points, stroke, width) {
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i += 1) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  animate = () => {
    if (!this.isAnimating) return;
    const { width, height } = this.canvas;
    const now = Date.now() / 1000;
    this.ctx.clearRect(0, 0, width, height);
    const baseAmp = this.mode === "speaking" ? 14 : this.mode === "listening" ? 8 : 4;
    const amp = baseAmp + Math.sin(now * 2) * 3;
    this.points.forEach((p, i) => {
      const x = i / (this.points.length - 1);
      p.y = height / 2 + Math.sin(now * 3 + x * 10) * amp;
    });
    this.drawCurve(this.points, "rgba(255,255,255,0.85)", 2);
    this.frame = requestAnimationFrame(this.animate);
  };

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.positionPanel();
    this.panel.classList.add("open");
    this.panel.setAttribute("aria-hidden", "false");
    this.dispatchEvent(new CustomEvent("aw:open"));
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove("open");
    this.panel.setAttribute("aria-hidden", "true");
    this.dispatchEvent(new CustomEvent("aw:close"));
  }

  positionPanel() {
    if (!this.panel) return;
    const trigger = this.shadowRoot.querySelector(".trigger");
    if (!trigger) return;

    this.panel.style.top = "auto";
    this.panel.style.bottom = "auto";
    this.panel.style.left = "auto";
    this.panel.style.right = "auto";
    this.panel.style.maxHeight = "";
    this.panel.style.maxWidth = "";

    const triggerRect = trigger.getBoundingClientRect();
    const cs = getComputedStyle(this);
    const panelHeight = parseInt(cs.getPropertyValue("--aw-height")) || this.panel.offsetHeight || 460;
    const panelWidth = parseInt(cs.getPropertyValue("--aw-width")) || this.panel.offsetWidth || 340;
    const gap = 12;
    const margin = 8;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const spaceBelow = vh - triggerRect.bottom - margin;
    const spaceAbove = triggerRect.top - margin;
    const spaceRight = vw - triggerRect.right - margin;
    const spaceLeft = triggerRect.left - margin;

    const fitsBelow = spaceBelow >= panelHeight + gap;
    const fitsAbove = spaceAbove >= panelHeight + gap;
    const fitsRight = spaceRight >= panelWidth + gap;
    const fitsLeft = spaceLeft >= panelWidth + gap;

    let side;
    if (fitsBelow) side = "below";
    else if (fitsAbove) side = "above";
    else if (fitsRight) side = "right";
    else if (fitsLeft) side = "left";
    else {
      const max = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft);
      if (max === spaceBelow) side = "below";
      else if (max === spaceAbove) side = "above";
      else if (max === spaceRight) side = "right";
      else side = "left";
    }

    if (side === "below" || side === "above") {
      if (side === "below") this.panel.style.top = `${triggerRect.height + gap}px`;
      else this.panel.style.bottom = `${triggerRect.height + gap}px`;
      if (triggerRect.left + panelWidth <= vw - margin) this.panel.style.left = "0";
      else this.panel.style.right = "0";
    } else {
      if (side === "right") this.panel.style.left = `${triggerRect.width + gap}px`;
      else this.panel.style.right = `${triggerRect.width + gap}px`;
      if (triggerRect.top + panelHeight <= vh - margin) this.panel.style.top = "0";
      else this.panel.style.bottom = "0";
    }
  }

  applyMode(mode) {
    const wasActive = this.mode === "listening" || this.mode === "speaking";
    const isActive = mode === "listening" || mode === "speaking";
    this.mode = mode;
    this.setAttribute("data-mode", mode);
    this.setAttribute("data-call-active", isActive ? "true" : "false");
    this.style.setProperty("--aw-mode-color", MODE_COLORS[mode] || MODE_COLORS.idle);

    if (this.statusLabel) this.statusLabel.textContent = MODE_LABELS[mode] || "";
    if (this.messages && !this.errorBanner?.classList.contains("visible")) {
      this.messages.textContent = MODE_MESSAGES[mode] || "";
    }
    if (this.callLabel) {
      this.callLabel.textContent =
        mode === "connecting" ? "Connecting…" :
        isActive ? "End call" :
        "Start call";
    }
    if (this.callBtn) {
      this.callBtn.disabled = mode === "connecting";
    }

    if (isActive && !wasActive) {
      this.startCallTimer();
      this.startLevelLoop();
    } else if (!isActive && wasActive) {
      this.stopCallTimer();
      this.stopLevelLoop();
      this.style.setProperty("--aw-level", "0");
    }
    if (mode === "idle" && this.isMuted) this.setMuted(false);
  }

  setMode(mode) {
    this.applyMode(mode);
    this.dispatchEvent(new CustomEvent("aw:mode", { detail: { mode } }));
  }

  showError(message) {
    if (!this.errorBanner) return;
    this.errorBanner.textContent = message;
    this.errorBanner.classList.add("visible");
  }

  clearError() {
    if (!this.errorBanner) return;
    this.errorBanner.classList.remove("visible");
    this.errorBanner.textContent = "";
  }

  onCallButton() {
    if (this.mode === "idle") this.start();
    else if (this.mode === "listening" || this.mode === "speaking") this.stop();
  }

  async start() {
    if (this.mode !== "idle") return;
    this.clearError();
    const params = this.getStartParams();
    if (!params.agentId) {
      this.showError("Missing agent-id attribute.");
      this.dispatchEvent(new CustomEvent("aw:error", { detail: { message: "Missing agent-id" } }));
      return;
    }
    const endpoint = this.getAttribute("signed-url-endpoint") || DEFAULT_SIGNED_URL_ENDPOINT;

    this.setMode("connecting");
    this.shadowRoot.querySelector(".orb-shell").classList.add("started");
    this.shadowRoot.querySelector(".wave-wrap").classList.add("active");
    this.initCanvas();
    this.isAnimating = true;
    cancelAnimationFrame(this.frame);
    this.animate();
    this.dispatchEvent(new CustomEvent("aw:start", { detail: params }));

    try {
      const signedUrl = await this.fetchSignedUrl(endpoint, params);
      await this.openSession(signedUrl, params);
    } catch (err) {
      const message = err?.message || String(err);
      this.dispatchEvent(new CustomEvent("aw:error", { detail: { message } }));
      this.showError(message);
      this.teardownSession();
      this.shadowRoot.querySelector(".orb-shell").classList.remove("started");
      this.shadowRoot.querySelector(".wave-wrap").classList.remove("active");
      this.isAnimating = false;
      cancelAnimationFrame(this.frame);
      this.frame = null;
      this.setMode("idle");
    }
  }

  async fetchSignedUrl(endpoint, params) {
    const apiKey = DEFAULT_API_KEY;
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["x-api-key"] = apiKey;
    const body = {
      agentId: params.agentId,
      userId: params.userId,
      overrides: {
        timezone: params.overrides.timezone || "Asia/Kolkata",
        dynamic_variables: params.overrides.dynamic_variables || {}
      },
      secsLeft: params.secsLeft,
      origin: params.origin
    };
    const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Signed URL request failed (${res.status})`);
    const data = await res.json().catch(() => null);
    const url = data && (data.signedUrl || data.signed_url || data.url || (typeof data === "string" ? data : null));
    if (typeof url !== "string" || !url) throw new Error("Signed URL missing in response");
    return url;
  }

  openSession(signedUrl, params) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(signedUrl);
      this.ws = ws;
      let opened = false;

      ws.onopen = () => {
        opened = true;
        ws.send(JSON.stringify({
          type: "conversation_initiation_client_data",
          conversation_config_override: { agent: {}, tts: {} },
          custom_llm_extra_body: {},
          dynamic_variables: params.overrides.dynamic_variables || {}
        }));
        this.startMicCapture().then(() => {
          this.setMode("listening");
          resolve();
        }).catch(reject);
      };

      ws.onmessage = (event) => this.handleServerMessage(event.data);

      ws.onerror = () => {
        if (!opened) reject(new Error("WebSocket connection failed"));
      };

      ws.onclose = () => {
        if (!opened) {
          reject(new Error("WebSocket closed before opening"));
          return;
        }
        this.teardownSession();
        if (this.mode !== "idle") {
          this.shadowRoot.querySelector(".orb-shell")?.classList.remove("started");
          this.shadowRoot.querySelector(".wave-wrap")?.classList.remove("active");
          this.isAnimating = false;
          cancelAnimationFrame(this.frame);
          this.frame = null;
          this.setMode("idle");
        }
      };
    });
  }

  handleServerMessage(raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === "ping") {
      const eventId = msg.ping_event?.event_id;
      try { this.ws?.send(JSON.stringify({ type: "pong", event_id: eventId })); } catch {}
      return;
    }

    if (msg.type === "audio") {
      const b64 = msg.audio_event?.audio_base_64;
      if (b64) this.playPcm16Base64(b64);
      this.markSpeaking();
      return;
    }

    if (msg.type === "interruption") {
      this.flushPlayback();
      this.setMode("listening");
      return;
    }
  }

  async startMicCapture() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });
    } catch (err) {
      if (err && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError" || err.name === "SecurityError")) {
        throw new Error(ERROR_MIC_DENIED);
      }
      throw err;
    }
    this.micStream = stream;
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    this.captureCtx = ctx;
    const source = ctx.createMediaStreamSource(stream);
    this.captureSource = source;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    this.micAnalyser = analyser;
    source.connect(analyser);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    this.captureProcessor = processor;
    processor.onaudioprocess = (e) => {
      if (this.isMuted) return;
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const input = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(input.length);
      for (let i = 0; i < input.length; i += 1) {
        const s = Math.max(-1, Math.min(1, input[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      const b64 = this.arrayBufferToBase64(pcm.buffer);
      try { this.ws.send(JSON.stringify({ user_audio_chunk: b64 })); } catch {}
    };
    source.connect(processor);
    processor.connect(ctx.destination);
  }

  playPcm16Base64(b64) {
    if (!this.playbackCtx) {
      this.playbackCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      this.playbackTime = this.playbackCtx.currentTime;
      this.playbackAnalyser = this.playbackCtx.createAnalyser();
      this.playbackAnalyser.fftSize = 512;
      this.playbackAnalyser.connect(this.playbackCtx.destination);
    }
    const ctx = this.playbackCtx;
    const bytes = this.base64ToBytes(b64);
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
    const float = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i += 1) float[i] = pcm[i] / 0x8000;
    const buffer = ctx.createBuffer(1, float.length, 16000);
    buffer.copyToChannel(float, 0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.playbackAnalyser);
    const startAt = Math.max(this.playbackTime, ctx.currentTime);
    src.start(startAt);
    this.playbackTime = startAt + buffer.duration;
  }

  flushPlayback() {
    if (this.playbackCtx) {
      try { this.playbackCtx.close(); } catch {}
      this.playbackCtx = null;
      this.playbackAnalyser = null;
      this.playbackTime = 0;
    }
  }

  formatDuration(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  startCallTimer() {
    this.callStartTime = Date.now();
    if (this.callTimer) this.callTimer.textContent = "00:00";
    clearInterval(this.callTimerInterval);
    this.callTimerInterval = setInterval(() => {
      if (!this.callTimer) return;
      this.callTimer.textContent = this.formatDuration((Date.now() - this.callStartTime) / 1000);
    }, 1000);
  }

  stopCallTimer() {
    clearInterval(this.callTimerInterval);
    this.callTimerInterval = null;
    if (this.callTimer) this.callTimer.textContent = "00:00";
  }

  startLevelLoop() {
    cancelAnimationFrame(this.levelFrame);
    const tick = () => {
      const analyser = this.mode === "speaking" ? this.playbackAnalyser : this.micAnalyser;
      let level = 0;
      if (analyser && !(this.mode === "listening" && this.isMuted)) {
        const buf = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(buf);
        let peak = 0;
        for (let i = 0; i < buf.length; i += 1) if (buf[i] > peak) peak = buf[i];
        level = Math.min(1, (peak / 255) * 1.4);
      }
      this.style.setProperty("--aw-level", level.toFixed(3));
      this.levelFrame = requestAnimationFrame(tick);
    };
    this.levelFrame = requestAnimationFrame(tick);
  }

  stopLevelLoop() {
    cancelAnimationFrame(this.levelFrame);
    this.levelFrame = null;
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((t) => { t.enabled = !this.isMuted; });
    }
    if (this.micBtn) {
      this.micBtn.classList.toggle("muted", this.isMuted);
      this.micBtn.setAttribute("aria-pressed", String(this.isMuted));
      this.micBtn.setAttribute("aria-label", this.isMuted ? "Unmute microphone" : "Mute microphone");
    }
    this.dispatchEvent(new CustomEvent("aw:mute", { detail: { muted: this.isMuted } }));
  }

  toggleMute() {
    if (this.mode !== "listening" && this.mode !== "speaking") return;
    this.setMuted(!this.isMuted);
  }

  markSpeaking() {
    if (this.mode !== "speaking") this.setMode("speaking");
    clearTimeout(this.speakingTimer);
    this.speakingTimer = setTimeout(() => {
      if (this.mode === "speaking") this.setMode("listening");
    }, 600);
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  base64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  teardownSession() {
    clearTimeout(this.speakingTimer);
    this.speakingTimer = null;
    this.stopLevelLoop();
    this.stopCallTimer();
    this.style.setProperty("--aw-level", "0");
    this.isMuted = false;
    if (this.micBtn) {
      this.micBtn.classList.remove("muted");
      this.micBtn.setAttribute("aria-pressed", "false");
      this.micBtn.setAttribute("aria-label", "Mute microphone");
    }
    if (this.captureProcessor) {
      try { this.captureProcessor.disconnect(); } catch {}
      this.captureProcessor.onaudioprocess = null;
      this.captureProcessor = null;
    }
    if (this.captureSource) {
      try { this.captureSource.disconnect(); } catch {}
      this.captureSource = null;
    }
    if (this.micAnalyser) {
      try { this.micAnalyser.disconnect(); } catch {}
      this.micAnalyser = null;
    }
    if (this.captureCtx) {
      try { this.captureCtx.close(); } catch {}
      this.captureCtx = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.flushPlayback();
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws.onopen = this.ws.onclose = this.ws.onerror = this.ws.onmessage = null;
      this.ws = null;
    }
  }

  stop() {
    this.teardownSession();
    this.shadowRoot.querySelector(".orb-shell")?.classList.remove("started");
    this.shadowRoot.querySelector(".wave-wrap")?.classList.remove("active");
    this.isAnimating = false;
    cancelAnimationFrame(this.frame);
    this.frame = null;
    if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setMode("idle");
    this.dispatchEvent(new CustomEvent("aw:stop"));
  }
}

function register(tag = TAG_NAME) {
  if (typeof window === "undefined" || typeof customElements === "undefined") return;
  if (!customElements.get(tag)) {
    customElements.define(tag, AmbernexusBubbleWidget);
  }
}

register();

function autoInit(selector = "[data-ai-bot-voice]") {
  if (typeof document === "undefined") return [];
  const nodes = Array.from(document.querySelectorAll(selector));
  return nodes.map((el) => {
    const widget = document.createElement(TAG_NAME);
    Array.from(el.attributes).forEach((a) => {
      if (a.name.startsWith("data-")) return;
      widget.setAttribute(a.name, a.value);
    });
    if (el.dataset) {
      Object.entries(el.dataset).forEach(([k, v]) => {
        if (k === "aiBotVoice" || v == null) return;
        const attr = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        widget.setAttribute(attr, String(v));
      });
    }
    el.replaceWith(widget);
    return widget;
  });
}

export { AmbernexusBubbleWidget, AmbernexusBubbleWidget as default, register, autoInit, TAG_NAME };
