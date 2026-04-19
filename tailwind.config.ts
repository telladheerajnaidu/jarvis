import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: "#0a1118",
          panel: "#111a24",
          cyan: "#60a5fa",
          gold: "#e8b97c",
          red: "#c17a56",
          crimson: "#7a8b7a",
          blood: "#122234",
          ivory: "#f5ecd9",
          bone: "#fdf6e3",
          grid: "#1e3a5f",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        hud: "0 0 32px rgba(193,122,86,0.32), inset 0 0 14px rgba(96,165,250,0.22)",
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
          "0%,100%": { boxShadow: "0 0 20px #c17a56, 0 0 40px #60a5fa" },
          "50%": { boxShadow: "0 0 10px #c17a56, 0 0 20px #60a5fa" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
