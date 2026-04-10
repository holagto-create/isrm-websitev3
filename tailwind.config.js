/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f2557',
          light: '#1a3d7c',
          dark: '#071435',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#e0c36c',
        },
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'Georgia', 'serif'],
        'source': ['Source Serif 4', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
