/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "apple-red": "#FA233B",
        "apple-pink": "#FB5C74",
        "youtube-red": "#FF0000",
        "gradient-start": "#667eea",
        "gradient-end": "#764ba2",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};
