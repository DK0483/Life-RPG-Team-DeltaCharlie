import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        rpg: {
          bg: "#0B0F19",
          card: "#131B2E",
          cardHover: "#1A243D",
          border: "#233054",
          gold: "#F59E0B",
          goldLight: "#FDE68A",
          goldDark: "#B45309",
          health: "#EF4444",
          healthLight: "#FCA5A5",
          mana: "#3B82F6",
          manaLight: "#93C5FD",
          xp: "#8B5CF6",
          xpLight: "#C4B5FD",
          strength: "#F87171",
          intellect: "#60A5FA",
          vitality: "#34D399",
          agility: "#FBBF24",
          charisma: "#F472B6",
        },
      },
      fontFamily: {
        rpg: ["ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Cinzel", "Georgia", "serif"],
      },
      animation: {
        "float-up": "floatUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        floatUp: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-48px) scale(1.15)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))" },
          "50%": { opacity: "1", filter: "drop-shadow(0 0 16px rgba(245, 158, 11, 0.8))" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
