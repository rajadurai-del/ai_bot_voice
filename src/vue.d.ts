import type { DefineComponent } from "vue";
import type {
  AiBotOverrides,
  AiBotStartDetail,
  AiBotModeDetail,
  AiBotMuteDetail,
  AiBotErrorDetail
} from "./index";

export interface AmbernexusBubbleWidgetProps {
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  buttonLabel?: string;
  bubbleCount?: number | string;
  agentId?: string;
  userId?: string;
  secsLeft?: number | string;
  origin?: string;
  signedUrlEndpoint?: string;
  overrides?: AiBotOverrides | string;
}

export interface AmbernexusBubbleWidgetEmits {
  "aw:open": (e: CustomEvent<void>) => void;
  "aw:close": (e: CustomEvent<void>) => void;
  "aw:start": (e: CustomEvent<AiBotStartDetail>) => void;
  "aw:stop": (e: CustomEvent<void>) => void;
  "aw:mode": (e: CustomEvent<AiBotModeDetail>) => void;
  "aw:mute": (e: CustomEvent<AiBotMuteDetail>) => void;
  "aw:error": (e: CustomEvent<AiBotErrorDetail>) => void;
}

declare const AmbernexusBubbleWidget: DefineComponent<
  AmbernexusBubbleWidgetProps,
  unknown,
  unknown,
  Record<string, never>,
  Record<string, never>,
  unknown,
  unknown,
  AmbernexusBubbleWidgetEmits
>;

export { AmbernexusBubbleWidget };
export default AmbernexusBubbleWidget;
