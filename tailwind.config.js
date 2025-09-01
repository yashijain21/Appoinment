/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tw-elements/js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "rgb(153,191,55)", // Primary Green
        secondary: "rgb(52,162,217)", // Secondary Blue
        dark6: "#E8E8E8",
        dark2: "#444444",
        dark3: "#737373",
      },
      animation: {
        slidebar: "slidebar 5s linear infinite",
      },
      keyframes: {
        slidebar: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        customtheme: {
          primary: "rgb(153,191,55)",
          secondary: "rgb(52,162,217)",
          accent: "#37cdbe",
          neutral: "#3d4451",
          "base-100": "#ffffff",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
};
