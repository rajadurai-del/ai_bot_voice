import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { TAG_NAME, register } from "ai_bot_voice";

const ATTR_MAP = {
  primaryColor: "primary-color",
  accentColor: "accent-color",
  bgColor: "bg-color",
  textColor: "text-color",
  buttonLabel: "button-label",
  bubbleCount: "bubble-count",
  signedUrlEndpoint: "signed-url-endpoint",
  width: "width",
  height: "height"
};

const EVENT_PROP_MAP = {
  onOpen: "aw:open",
  onClose: "aw:close",
  onStart: "aw:start",
  onStop: "aw:stop",
  onMode: "aw:mode",
  onMute: "aw:mute",
  onError: "aw:error"
};

const AmbernexusBubbleWidget = forwardRef(function AmbernexusBubbleWidget(props, ref) {
  const elementRef = useRef(null);

  useEffect(() => {
    register();
  }, []);

  useImperativeHandle(ref, () => elementRef.current, []);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return undefined;
    const offs = [];
    Object.entries(EVENT_PROP_MAP).forEach(([propName, eventName]) => {
      const handler = props[propName];
      if (typeof handler !== "function") return;
      const listener = (e) => handler(e);
      el.addEventListener(eventName, listener);
      offs.push(() => el.removeEventListener(eventName, listener));
    });
    return () => offs.forEach((off) => off());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onOpen, props.onClose, props.onStart, props.onStop, props.onMode, props.onMute, props.onError]);

  const elementProps = { ref: elementRef };
  Object.entries(props).forEach(([key, value]) => {
    if (key === "children" || key in EVENT_PROP_MAP) return;
    const attrName = ATTR_MAP[key] || key;
    if (value === undefined || value === null || value === false) return;
    elementProps[attrName] = value === true ? "" : String(value);
  });

  return createElement(TAG_NAME, elementProps);
});

export { AmbernexusBubbleWidget };
export default AmbernexusBubbleWidget;
