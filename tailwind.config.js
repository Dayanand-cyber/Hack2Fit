/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#030712',
        },
        zinc: {
          850: '#202024',
          950: '#09090b',
        },
        brand: {
          violet: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          cyan: '#06b6d4',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'stutter': 'stutter 0.2s ease-in-out infinite alternate',
      },
      keyframes: {
        stutter: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-1px, 1px)' },
        }
      }
    },
  },
  plugins: [],
}
