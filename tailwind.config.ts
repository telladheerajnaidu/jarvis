import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: "#020617",
          panel: "#0b1220",
          cyan: "#22d3ee",
          gold: "#f59e0b",
          red: "#ef4444",
          grid: "#0e1a2b",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        hud: "0 0 24px rgba(34,211,238,0.25), inset 0 0 12px rgba(34,211,238,0.15)",
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
          "0%,100%": { boxShadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee" },
          "50%": { boxShadow: "0 0 10px #22d3ee, 0 0 20px #22d3ee" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
