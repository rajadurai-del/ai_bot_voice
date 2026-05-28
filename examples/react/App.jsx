import { useRef } from "react";
import { AmbernexusBubbleWidget } from "ai_bot_voice/react";

export default function App() {
  const widgetRef = useRef(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: 24, background: "#0b1226" }}>
      <AmbernexusBubbleWidget
        ref={widgetRef}
        buttonLabel="Ask Nexus AI"
        primaryColor="#db2777"
        accentColor="#f472b6"
        bgColor="rgba(20,30,54,0.92)"
        textColor="#ffffff"
        width="320px"
        height="380px"
        bubbleCount={32}
        agentId="77310792-06ee-4621-852b-df51fb58fa85"
        userId="12"
        secsLeft={600}
        origin="browser"
        overrides={{ timezone: "Asia/Kolkata", dynamic_variables: {} }}
        onStart={(e) => console.log("started", e.detail)}
        onMode={(e) => console.log("mode", e.detail.mode)}
        onError={(e) => console.error("error", e.detail.message)}
      />
    </div>
  );
}
