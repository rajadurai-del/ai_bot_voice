import { defineComponent, h, onMounted, ref } from "vue";
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

const PROP_DEFS = {
  primaryColor: { type: String, default: undefined },
  accentColor: { type: String, default: undefined },
  bgColor: { type: String, default: undefined },
  textColor: { type: String, default: undefined },
  width: { type: String, default: undefined },
  height: { type: String, default: undefined },
  buttonLabel: { type: String, default: undefined },
  bubbleCount: { type: [Number, String], default: undefined },
  signedUrlEndpoint: { type: String, default: undefined }
};

const EVENTS = ["aw:open", "aw:close", "aw:start", "aw:stop", "aw:mode", "aw:mute", "aw:error"];

const AmbernexusBubbleWidget = defineComponent({
  name: "AmbernexusBubbleWidget",
  props: PROP_DEFS,
  emits: EVENTS,
  setup(props, { emit, expose }) {
    const elRef = ref(null);
    register();

    onMounted(() => {
      const el = elRef.value;
      if (!el) return;
      EVENTS.forEach((name) => {
        el.addEventListener(name, (e) => emit(name, e));
      });
    });

    expose({ element: elRef });

    return () => {
      const attrs = { ref: elRef };
      Object.entries(props).forEach(([key, value]) => {
        if (value === undefined || value === null || value === false) return;
        const attrName = ATTR_MAP[key] || key;
        attrs[attrName] = value === true ? "" : String(value);
      });
      return h(TAG_NAME, attrs);
    };
  }
});

export { AmbernexusBubbleWidget };
export default AmbernexusBubbleWidget;
