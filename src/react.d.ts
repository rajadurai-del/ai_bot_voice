import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type {
  AmbernexusBubbleWidget as ElementClass,
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
  bubbleCount?: number;
  agentId?: string;
  userId?: string;
  secsLeft?: number;
  origin?: string;
  signedUrlEndpoint?: string;
  overrides?: AiBotOverrides | string;

  onOpen?: (event: CustomEvent<void>) => void;
  onClose?: (event: CustomEvent<void>) => void;
  onStart?: (event: CustomEvent<AiBotStartDetail>) => void;
  onStop?: (event: CustomEvent<void>) => void;
  onMode?: (event: CustomEvent<AiBotModeDetail>) => void;
  onMute?: (event: CustomEvent<AiBotMuteDetail>) => void;
  onError?: (event: CustomEvent<AiBotErrorDetail>) => void;
}

declare const AmbernexusBubbleWidget: ForwardRefExoticComponent<
  AmbernexusBubbleWidgetProps & RefAttributes<ElementClass>
>;

export { AmbernexusBubbleWidget };
export default AmbernexusBubbleWidget;
