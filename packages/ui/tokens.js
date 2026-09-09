// Design tokens from the PRD's Design section. Single source of truth: the NativeWind
// preset in @sweep/config reads this, and TS callers import it via `@sweep/ui`.
// Plain CommonJS so tailwind.config.js can require it without a build step.

const colors = {
  // Primary teal — header band, primary buttons, links, active tab
  primary: '#22C99C',
  primaryDark: '#00C1AF',
  // Inactive tab icons: teal, muted
  primaryMuted: '#A8E9D5',
  // Teal as *text* on white — the "Search for New Cleaners" card titles read much deeper
  // in the screenshots than the band teal does.
  primaryInk: '#0E8C85',
  // The blue of the "Get $100 credit" pill and the $100 promo card
  accent: '#1E68BF',
  // Dark navy body text
  ink: '#2B3450',
  inkMuted: '#8A90A2',
  // Light gray page background
  background: '#F1F2F6',
  surface: '#FFFFFF',
  // Off-white panels inside a card: the Quality center's title strip, the search row on Home
  surfaceMuted: '#F8F8FB',
  border: '#E3E5EC',
  // Skeleton placeholder blocks
  skeleton: '#E7E9EE',
  // Destructive actions ("Reject Bid") are a red outline
  danger: '#E2574C',
};

const radius = {
  card: 8,
};

// White cards with soft shadows. `boxShadow` rather than the `shadow*` props: those are
// deprecated in React Native 0.81 and warn on every render in the web target.
const shadow = {
  card: {
    boxShadow: '0px 2px 8px rgba(43, 52, 80, 0.10)',
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
