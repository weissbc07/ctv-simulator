/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ctv-dark': '#0a0a0a',
        'ctv-gray': '#1a1a1a',
        'ctv-blue': '#3b82f6',
        'ctv-green': '#10b981',
        'ctv-red': '#ef4444',
        'ctv-yellow': '#f59e0b',
      },
      fontFamily: {
        'mono': ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      }
    },
  },
  plugins: [],
} 