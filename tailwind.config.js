/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '300px',
        'md': '600px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        foreground: "#E5E5E5",
        background: "#1c1c1c",
        lightgray: "#262626",
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

