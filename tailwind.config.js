/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'default-background': '#ffffff',
        'neutral-border': '#d1d5db',
        'neutral-50': '#f9fafb',
        'default-font': '#374151',
      },
    },
  },
  plugins: [],
}
