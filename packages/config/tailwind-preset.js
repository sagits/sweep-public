// Shared NativeWind preset. Every app and package extends this so the PRD's design
// tokens reach Tailwind class names (bg-primary, text-ink, ...) from one place.
const { colors, radius, layout } = require('@sweep/ui/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors,
      borderRadius: {
        card: `${radius.card}px`,
      },
      spacing: {
        sidebar: `${layout.sidebarWidth}px`,
      },
      maxWidth: {
        content: `${layout.maxContentWidth}px`,
      },
    },
  },
  plugins: [],
};
