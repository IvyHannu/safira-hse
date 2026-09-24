const {
  colors,
  spacing,
  radius,
  typography,
} = require('@safira/design-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      spacing: Object.fromEntries(
        Object.entries(spacing).map(([key, value]) => [key, `${value}px`]),
      ),
      borderRadius: Object.fromEntries(
        Object.entries(radius).map(([key, value]) => [key, `${value}px`]),
      ),
      fontFamily: { sans: [typography.fontFamily] },
    },
  },
  plugins: [],
};
