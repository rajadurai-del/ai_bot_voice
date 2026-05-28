export type AiBotMode = "idle" | "connecting" | "listening" | "speaking";

export interface AiBotOverrides {
  timezone?: string;
  dynamic_variables?: Record<string, unknown>;
}

export interface AiBotStartDetail {
  agentId: string;
  userId: string;
  secsLeft: number;
  origin: string;
  overrides: Required<AiBotOverrides>;
}

export interface AiBotErrorDetail {
  message: string;
}

export interface AiBotModeDetail {
  mode: AiBotMode;
}

export interface AiBotMuteDetail {
  muted: boolean;
}

export interface AiBotConfig {
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  buttonLabel?: string;
  bubbleCount?: number;
  agentId?: string;
  userId?: string;
  secsLeft?: number;
  origin?: string;
  signedUrlEndpoint?: string;
  overrides?: AiBotOverrides;
}

export interface AmbernexusBubbleWidgetEventMap extends HTMLElementEventMap {
  "aw:open": CustomEvent<void>;
  "aw:close": CustomEvent<void>;
  "aw:start": CustomEvent<AiBotStartDetail>;
  "aw:stop": CustomEvent<void>;
  "aw:mode": CustomEvent<AiBotModeDetail>;
  "aw:mute": CustomEvent<AiBotMuteDetail>;
  "aw:error": CustomEvent<AiBotErrorDetail>;
}

export class AmbernexusBubbleWidget extends HTMLElement {
  mode: AiBotMode;
  isOpen: boolean;
  isMuted: boolean;
  overrides: Required<AiBotOverrides>;

  configure(config: AiBotConfig): void;
  open(): void;
  close(): void;
  toggle(): void;
  start(): Promise<void>;
  stop(): void;
  setMuted(muted: boolean): void;
  toggleMute(): void;

  addEventListener<K extends keyof AmbernexusBubbleWidgetEventMap>(
    type: K,
    listener: (this: AmbernexusBubbleWidget, ev: AmbernexusBubbleWidgetEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
}

export const TAG_NAME: "ambernexus-bubble-widget";

export function register(tag?: string): void;
export function autoInit(selector?: string): AmbernexusBubbleWidget[];

declare global {
  interface HTMLElementTagNameMap {
    "ambernexus-bubble-widget": AmbernexusBubbleWidget;
  }
}

export default AmbernexusBubbleWidget;
