// Design tokens from the PRD's Design section. Single source of truth: the NativeWind
// preset in @sweep/config reads this, and TS callers import it via `@sweep/ui`.
// Plain CommonJS so tailwind.config.js can require it without a build step.

const colors = {
  // Primary teal — header band, primary buttons, links, active tab
  primary: '#22C99C',
  primaryDark: '#00C1AF',
  // Inactive tab icons: teal, muted
  primaryMuted: '#A8E9D5',
  // Dark navy body text
  ink: '#2B3450',
  inkMuted: '#8A90A2',
  // Light gray page background
  background: '#F1F2F6',
  surface: '#FFFFFF',
  border: '#E3E5EC',
  // Destructive actions ("Reject Bid") are a red outline
  danger: '#E2574C',
};

const radius = {
  card: 8,
};

// White cards with soft shadows
const shadow = {
  card: {
    shadowColor: '#2B3450',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
};

// Layout constants shared by the NativeWind preset (as `sidebar` spacing and `content`
// max-width) and by any component that needs the raw number.
const layout = {
  sidebarWidth: 88,
  maxContentWidth: 720,
};

const tokens = { colors, radius, shadow, layout };

module.exports = { tokens, colors, radius, shadow, layout };
