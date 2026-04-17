import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: "#050202",
          panel: "#0a0303",
          cyan: "#fca5a5",
          gold: "#fbbf24",
          red: "#dc2626",
          crimson: "#991b1b",
          blood: "#450a0a",
          ivory: "#fef2f2",
          bone: "#fef2f2",
          grid: "#2a0a0a",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        hud: "0 0 32px rgba(220,38,38,0.35), inset 0 0 14px rgba(251,191,36,0.18)",
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
          "0%,100%": { boxShadow: "0 0 20px #dc2626, 0 0 40px #fbbf24" },
          "50%": { boxShadow: "0 0 10px #dc2626, 0 0 20px #fbbf24" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
