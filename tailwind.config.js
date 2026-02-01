/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Cyber Lime Dark Theme
        "cyber-lime": "#CDFF00",
        "cyber-lime-light": "rgba(205, 255, 0, 0.15)",
        "cyber-lime-muted": "rgba(205, 255, 0, 0.6)",

        // Background Hierarchy
        background: "#0A0A0A",
        surface: "#121212",
        "surface-elevated": "#1A1A1A",
        "surface-hover": "#252525",

        // Text Colors
        "text-primary": "#FFFFFF",
        "text-secondary": "#A0A0A0",
        "text-muted": "#606060",

        // Border Colors
        "border-default": "#2A2A2A",
        "border-active": "#CDFF00",
        "border-muted": "#1F1F1F",

        // Status Colors
        success: "#00FF88",
        warning: "#FFB800",
        error: "#FF4444",
        info: "#00B4FF",

        // Heatmap Colors
        heatmap: {
          empty: "#1A1A1A",
          level1: "rgba(205, 255, 0, 0.2)",
          level2: "rgba(205, 255, 0, 0.4)",
          level3: "rgba(205, 255, 0, 0.7)",
          level4: "#CDFF00",
        },

        // Category Colors
        category: {
          health: "#00FF88",
          fitness: "#FF6B6B",
          mindfulness: "#A78BFA",
          learning: "#3B82F6",
          work: "#F59E0B",
          personal: "#EC4899",
        },
      },
      fontFamily: {
        display: ["Inter", "System", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        sm: "0 2px 4px rgba(0, 0, 0, 0.25)",
        md: "0 4px 8px rgba(0, 0, 0, 0.3)",
        lg: "0 8px 16px rgba(0, 0, 0, 0.4)",
        glow: "0 0 12px rgba(205, 255, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
