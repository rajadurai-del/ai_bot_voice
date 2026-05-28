import { defineComponent, h, onMounted, ref, watch } from "vue";
import { TAG_NAME, register } from "ai_bot_voice";

const ATTR_MAP = {
  primaryColor: "primary-color",
  accentColor: "accent-color",
  bgColor: "bg-color",
  textColor: "text-color",
  buttonLabel: "button-label",
  bubbleCount: "bubble-count",
  agentId: "agent-id",
  userId: "user-id",
  secsLeft: "secs-left",
  signedUrlEndpoint: "signed-url-endpoint",
  width: "width",
  height: "height",
  origin: "origin"
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
  agentId: { type: String, default: undefined },
  userId: { type: String, default: undefined },
  secsLeft: { type: [Number, String], default: undefined },
  origin: { type: String, default: undefined },
  signedUrlEndpoint: { type: String, default: undefined },
  overrides: { type: [Object, String], default: undefined }
};

const EVENTS = ["aw:open", "aw:close", "aw:start", "aw:stop", "aw:mode", "aw:mute", "aw:error"];

const AmbernexusBubbleWidget = defineComponent({
  name: "AmbernexusBubbleWidget",
  props: PROP_DEFS,
  emits: EVENTS,
  setup(props, { emit, expose }) {
    const elRef = ref(null);
    register();

    function syncOverrides() {
      const el = elRef.current ?? elRef.value;
      if (!el) return;
      if (props.overrides === undefined || props.overrides === null) {
        el.removeAttribute("overrides");
        return;
      }
      const value = typeof props.overrides === "string"
        ? props.overrides
        : JSON.stringify(props.overrides);
      el.setAttribute("overrides", value);
    }

    onMounted(() => {
      const el = elRef.value;
      if (!el) return;
      EVENTS.forEach((name) => {
        el.addEventListener(name, (e) => emit(name, e));
      });
      syncOverrides();
    });

    watch(() => props.overrides, syncOverrides, { deep: true });

    expose({ element: elRef });

    return () => {
      const attrs = { ref: elRef };
      Object.entries(props).forEach(([key, value]) => {
        if (key === "overrides") return;
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
