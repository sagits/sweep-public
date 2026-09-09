# 01: Monorepo foundation and 6-tab shell

**What to build:** The app boots in the iOS simulator straight into the logged-in state for the
hardcoded user, and the six tabs — Home, Projects, Marketplace, Payments, Properties, More —
render and switch. Each tab is a placeholder screen for now; this ticket delivers the shell they
will be built into, and proves the three build targets (simulator, web, Detox dev client) all work
before any feature depends on them.

Sets up the Turborepo/pnpm workspace with `apps/host` and the `ui`, `mocks`, `types` and `config`
packages, and puts the design tokens from the PRD's Design section into the shared theme so every
later screen draws from one place. Detox runs through Continuous Native Generation — `ios/` and
`android/` are generated on demand and stay out of the repo. iOS only: leave Android out of the
Detox config entirely, and verify the simulator name with `xcrun simctl list devices available`
before writing it.

Also creates `DECISIONS.md` at the repo root — every ticket appends to it rather than asking
questions — and the README paragraph naming the reference product as the inspiration with no affiliation.

**Blocked by:** None (can start immediately)

**Status:** done — shipped in affb2c7. Verified this session: workspace + 6 tab routes, turbo pipelines, jest-expo + RNTL (`pnpm test` green, 3 tests), DECISIONS.md, `ios/` and `android/` gitignored. Simulator boot, `build:web` output and the Detox run were taken from the commit, not re-run here.

- [x] `pnpm dev` boots the app in the iOS simulator with no login screen
- [x] All six tabs render with the correct icons; the active tab is teal with a visible label and inactive tabs are muted teal with no label
- [x] At the `md` breakpoint and above on web, the tab bar becomes a left sidebar and content is centered with a max width
- [x] Naming matches the PRD's Naming table everywhere — app name, slug, bundle id, header wordmark, web title — and the reference product's name appears only in the README
- [x] `pnpm build:web` produces a static `dist/` with `web.bundler = "metro"` and `web.output = "static"`
- [x] `pnpm e2e:build` produces a dev client without any Apple or Expo account login, and `ios/` and `android/` are gitignored
- [x] `navigation.e2e.ts` passes: all six tabs render, switch, and show the active styling
- [x] Turbo pipelines exist for `dev`, `build`, `build:web`, `lint`, `typecheck`, `test`, `e2e:build`, `e2e:test`
- [x] Jest runs under the `jest-expo` preset with React Native Testing Library, ignores `e2e/`, and `pnpm test` passes on a first trivial store test (see ADR-0001)
