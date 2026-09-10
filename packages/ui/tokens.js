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
  // Flat gray of the empty-state illustrations — measured off screenshot 22's folder
  illustration: '#CDCBCF',
  // Amber of the "Still Unassigned - Due 24h" warning glyph, sampled off screenshot 09
  warning: '#F2792A',
  // The violet star on the "Manual Project" pill, sampled off screenshot 09
  violet: '#6C4FD8',
  // The deeper teal of the "Super Cleaner" chip and the completed "While you wait" circles
  primaryDeep: '#2DA4A8',
  // Review stars
  star: '#F5BA5C',
  // The purple "Background Checked" shield
  badge: '#6510CC',
  // The slate warning block under the cleaning-needs textarea
  slate: '#6F7C8B',
};

const radius = {
  card: 8,
};

// White cards with soft shadows. `boxShadow` rather than the `shadow*` props: those are
// deprecated in React Native 0.81 and warn on every render in the web target.
//
// Measured off the reference rather than guessed: Home's page is white, so the shadow is the
// only thing separating a card from it. Sampling straight down from a card's bottom edge, the
// reference darkens to ~205/255 and fades out over ~8.5pt, which is this blur and alpha. The
// original 0.10/8px was invisible on white.
const shadow = {
  card: {
    boxShadow: '0px 2px 10px rgba(43, 52, 80, 0.20)',
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
