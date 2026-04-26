/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:  '#7c3aed',
        secondary:'#a78bfa',
        dark:     '#0f0a1e',
        card:     '#1a1035',
        border:   '#2d1f5e',
        muted:    '#6b7280',
      },
    },
  },
  plugins: [],
}
