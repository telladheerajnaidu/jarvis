import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: "#140707",
          panel: "#1a0a09",
          cyan: "#facc15",
          gold: "#fde047",
          red: "#ef4444",
          crimson: "#dc2626",
          blood: "#991b1b",
          ivory: "#fef3c7",
          bone: "#fafaf9",
          grid: "#2a0f0d",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        hud: "0 0 28px rgba(239,68,68,0.35), inset 0 0 14px rgba(253,224,71,0.2)",
      },
      animation: {
        flicker: "flicker 3s linear infinite",
        scan: "scan 6s linear infinite",
        pulseReactor: "pulseReactor 2.5s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseReactor: {
          "0%,100%": { boxShadow: "0 0 20px #ef4444, 0 0 40px #fde047" },
          "50%": { boxShadow: "0 0 10px #ef4444, 0 0 20px #fde047" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
