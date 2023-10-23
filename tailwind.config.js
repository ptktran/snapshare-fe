/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "#E5E5E5",
        background: "#1c1c1c",
        accent: "#89AAE6"
      },
      fontFamily: {
        'space-mono': ['Space Mono', 'sans-serif'],
        'inter': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}

