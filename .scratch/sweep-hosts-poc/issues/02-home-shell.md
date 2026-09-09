# 02: Home shell

**What to build:** Home renders its full stack of cards over the teal header band, matching
screenshots `01` and `02`. The cards that hold no data yet show their designed empty states, so the
screen is complete and demoable on its own; ticket 04 wires the Projects card and ticket 05 wires
the Cleaner Search card as those stores arrive.

Delivers the teal header (Sweep wordmark, blue "Get $100 credit" pill, bell with badge, messages
icon), the "Search for New Cleaners" card, "Invite Current Teammates", the dismissible blue
$100 promo card with its "Don't show this anymore" checkbox, the Projects card with
"There are no projects right now.", the Notifications card with its seeded notifications, and the
Quality center card that stays in a spinner forever.

This is the first ticket to load data, so it establishes the pattern the rest of the app copies:
mock modules in `packages/mocks` exposed as async functions that resolve after 600–1200ms, one
Zustand store per domain with its own `loading` flag, skeleton placeholders for lists and cards,
spinners for full-screen loads and button actions, and `testID`s named by screen and role.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Home matches screenshots `01` and `02` in structure, spacing, type scale, colors, icons and copy
- [ ] Cards mount into skeletons, then resolve into content after the artificial delay
- [ ] The promo card dismisses and stays dismissed for the session
- [ ] The "Search for New Cleaners" card navigates to the Marketplace tab
- [ ] Projects card shows its empty state; Notifications card shows seeded notifications with date and time on the right
- [ ] The Quality center card renders in a permanent spinner state
- [ ] `home.e2e.ts` passes for the static cards, the empty states, promo dismissal and mount skeletons
- [ ] The mock resolver and store pattern is built test-first per ADR-0001: the loading flag is observably true before content resolves
