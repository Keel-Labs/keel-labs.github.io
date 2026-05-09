/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        serif: [
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      colors: {
        // Warm neutral "stone-ish" scale. The class name `ink` is kept so
        // existing components keep working, but the values are now warm
        // (closer to Tailwind's stone) to fit the calmer aesthetic.
        ink: {
          50: '#fafaf8',
          100: '#f5f3ef',
          200: '#e7e3da',
          300: '#d2cdc1',
          400: '#a8a298',
          500: '#7a7468',
          600: '#5b554c',
          700: '#403c35',
          800: '#262420',
          900: '#16140f',
          950: '#0b0a07',
        },
        // Warm terracotta — the app's --accent: rgb(207, 122, 92) and
        // sampled as a secondary tone in the Keel logo.
        accent: {
          DEFAULT: '#cf7a5c',
          50: '#fbf2ed',
          100: '#f5dfd2',
          200: '#ebbfa5',
          300: '#df9f7e',
          500: '#cf7a5c',
          600: '#b65f43',
          700: '#8e4933',
          light: '#df9f7e',
          dark: '#b65f43',
        },
      },
    },
  },
  plugins: [],
};
