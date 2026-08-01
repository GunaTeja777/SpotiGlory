import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          "green-hover": "#1ED760",
          "green-glow": "rgba(29, 185, 84, 0.3)",
          black: "#0A0A0C",
          surface: "rgba(255, 255, 255, 0.06)",
          "surface-hover": "rgba(255, 255, 255, 0.09)",
          border: "rgba(255, 255, 255, 0.12)",
          "border-bright": "rgba(255, 255, 255, 0.22)",
        },
        violet: {
          accent: "#6B21A8",
          glow: "rgba(107, 33, 168, 0.25)",
        },
      },
      boxShadow: {
        "specular-top": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)",
        "specular-double": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.3), 0 12px 32px -4px rgba(0, 0, 0, 0.5)",
        "spotify-glow": "0 0 25px -3px rgba(29, 185, 84, 0.4)",
        "spotify-glow-lg": "0 0 45px -5px rgba(29, 185, 84, 0.5)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "mesh-drift": "meshDrift 22s ease-in-out infinite alternate",
        "mesh-drift-reverse": "meshDriftReverse 28s ease-in-out infinite alternate",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite alternate",
      },
      keyframes: {
        meshDrift: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(40px, -30px) scale(1.1)" },
          "100%": { transform: "translate(-30px, 20px) scale(0.95)" },
        },
        meshDriftReverse: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(-50px, 40px) scale(1.15)" },
          "100%": { transform: "translate(30px, -20px) scale(0.9)" },
        },
        pulseGlow: {
          "0%": { opacity: "0.2" },
          "100%": { opacity: "0.45" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
