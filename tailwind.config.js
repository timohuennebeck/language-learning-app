/** @type {import('tailwindcss').Config} */
const { colors, fonts } = require('./src/shared/theme/tokens.cjs');

module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  corePlugins: {
    // Weights are expressed through the loaded Inter faces (font-medium -> Inter-Medium).
    fontWeight: false,
  },
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: [fonts.regular],
        regular: [fonts.regular],
        medium: [fonts.medium],
        semibold: [fonts.semibold],
        bold: [fonts.bold],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
