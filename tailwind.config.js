/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neo-Brutalism Vibrant Theme
        primary: "#FF7F50", // Coral Orange
        "vibrant-orange": "#FF7F50",

        // Pastel Colors
        pastel: {
          green: "#C1FF72",
          purple: "#C5B4E3",
          pink: "#FFB1D8",
          blue: "#A0D7FF",
          yellow: "#FDFD96",
          cream: "#FFF6E3",
        },

        // Card backgrounds
        card: {
          white: "#FFFFFF",
          dark: "#1a1a2e",
        },

        // Text
        border: "#000000",

        // Stats colors
        neo: {
          blue: "#4fb3ff",
          yellow: "#ffd33d",
          pink: "#ff79c6",
          green: "#C1FF72",
        },
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "Inter", "System", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000000",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-lg": "6px 6px 0px 0px #000000",
        "brutal-xl": "8px 8px 0px 0px #000000",
      },
    },
  },
  plugins: [],
};
