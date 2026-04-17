import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: "#08081a",
          panel: "#10102a",
          cyan: "#22d3ee",
          gold: "#f472b6",
          red: "#ec4899",
          crimson: "#a855f7",
          blood: "#1e1b4b",
          ivory: "#e0e7ff",
          bone: "#f5f3ff",
          grid: "#1e1b4b",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        hud: "0 0 32px rgba(236,72,153,0.35), inset 0 0 14px rgba(34,211,238,0.22)",
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
          "0%,100%": { boxShadow: "0 0 20px #ec4899, 0 0 40px #22d3ee" },
          "50%": { boxShadow: "0 0 10px #ec4899, 0 0 20px #22d3ee" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
