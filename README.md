# Sweep Hosts

<div>
    <a href="https://www.loom.com/share/1bafd79c084a4b11ad9ff99f044bb0f1">
      <p>Sweep app - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/1bafd79c084a4b11ad9ff99f044bb0f1">
      <img style="max-width:300px;" src="https://www.loom.com/v1/videos/1bafd79c084a4b11ad9ff99f044bb0f1/thumbnail">
    </a>
  </div>


An app to find cleaners and schedule cleanings for short-term rental properties, running from one
codebase on iOS and in the browser. It is a portfolio piece and an architecture study: mock data
only, no backend, no API, no auth, and every async operation is a timer.

Sweep has two sides, the host who owns the property and the cleaner who turns it over, so the
repo is a monorepo built to hold both apps. Only the host app exists so far. The cleaner app has
not been written yet; when it is, it lands beside this one in `apps/` and draws on the same
shared packages.

## What a host does

- Registers a property, with address, unit, bedroom, bed and bathroom counts, unit size, check-in
  and check-out times, and a photo from the camera roll. Three come seeded.
- Schedules a cleaning project against one of those properties, on a calendar that lays the next
  few days out and shows what is unassigned.
- Posts a search to the marketplace when a property needs a cleaner, through a wizard that
  confirms the property, describes the cleaning needed and takes a note.
- Reviews the bids that come back: each cleaner's profile, rating, badges, message, price, and a
  gallery of their previous work.
- Looks over payment history, and their own profile.

## What this project has

- A Turborepo monorepo holding a universal Expo app (the host), running as React Native on iOS
  and as React on the web.
- End-to-end tests with Detox, one spec per feature, driven against the iOS simulator.
- Integration tests with Jest and React Native Testing Library, covering the Zustand stores, the
  mock resolvers and the components that carry real interaction.
- A shared `packages/` folder, so UI, domain types and mock data are written once and used by
  every app in the repo.
- React Native Web, so the same components render on native and in the browser.
- Zustand for state management.
- Expo Router for routes and navigation, with the file tree as the route tree.
- NativeWind for Tailwind class names and design tokens.

## Stack

Expo (SDK 54) + Expo Router · TypeScript · NativeWind · Zustand · React Native Web · Turborepo +
pnpm · Detox.

`expo-image-picker` is the one native module here, used by the New Property form's photo upload.
Adding or changing a native module means rebuilding the Detox dev client (`pnpm e2e:build`) before
the simulator can see it. A JS reload is not enough.

Styling is NativeWind, so Tailwind class names compile to React Native styles, and the design
tokens in `packages/ui/tokens.js` feed the Tailwind theme. Components live in `packages/ui` and
serve both targets: Expo builds the iOS app and the web bundle from the same source, and React
Native Web renders those components in the browser.

```
apps/
  host/                  the Sweep Hosts app
packages/
  ui/                    design tokens and shared components
  mocks/                 mock data and delayed async resolvers
  types/                 shared domain types
  config/                shared tsconfig, eslint, NativeWind preset
```

Inside `apps/host`:

```
app/                     the routes. Expo Router is file-based, so this tree is the navigation
  (tabs)/                the five tabs: index (Home), projects, marketplace, properties, more
  payments.tsx           pushed from Home's $ icon, not a tab
  notifications.tsx      messages.tsx, chat/[id].tsx: pushed from Home's header icons
  property/new.tsx       the New Property form
  project/new.tsx        project/[id].tsx
  search/new.tsx         search/[id].tsx (the bids), search/congrats.tsx
  cleaner/[id].tsx       a cleaner's full profile
  _layout.tsx            the root stack; +html.tsx is the web shell
src/                     everything the routes are built from, by feature
  home/ projects/ marketplace/ properties/ payments/ more/ notifications/ messages/
  navigation/            TabBar and the shared white ScreenHeader
  stores/                Zustand stores, plus once.ts (the shared load guard) and merge.ts
  testing/               test-only helpers, e.g. flush()
  **/*.test.tsx          Jest + RNTL, beside the code they cover
assets/                  bundled photographs (properties, work-photos) and icons
e2e/                     Detox specs, one per feature, plus support.ts and their own tsconfig
scripts/e2e-test.sh      starts Metro, waits for it, runs Detox, shuts it down
```

The two test seams live in different places on purpose. Jest specs sit next to the code
(`src/stores/useProperties.test.ts` beside `useProperties.ts`), because they are written first and
drive its design. Detox specs live apart in `e2e/`, because they exercise whole screens through
the running app and belong to no single file. See
[ADR-0001](docs/adr/0001-testing-seams-tdd-and-detox.md).

## Running it

| What | Command |
|---|---|
| App in the iOS simulator | `pnpm dev` |
| Web build (static `dist/`) | `pnpm build:web` |
| Web smoke check | `npx serve apps/host/dist` |
| Detox dev client | `pnpm e2e:build` |
| Detox suites | `pnpm e2e:test` |
| Unit tests | `pnpm test` |
| Types | `pnpm typecheck` |
| One Detox spec | `pnpm --filter @sweep/host e2e:test e2e/<name>.e2e.ts` |

### The seed toggle

The app boots with three properties, three projects and three open searches. `EXPO_PUBLIC_SEED=false`
boots it empty instead, which is the only way to reach the empty state every list implements:

```
EXPO_PUBLIC_SEED=false pnpm dev
EXPO_PUBLIC_SEED=false pnpm build:web          # add --clear if the flag changed
EXPO_PUBLIC_SEED=false pnpm --filter @sweep/host e2e:test e2e/seed.e2e.ts
```

The spec path has to go through `--filter`: the root `pnpm e2e:test` hands its argument to turbo,
which reads it as a task name.

Everything runs locally, with no EAS and no Expo, Apple or Google account. `ios/` and `android/`
are generated on demand by `pnpm e2e:build` (Continuous Native Generation) and are not committed.

`pnpm e2e:build` additionally needs Xcode, CocoaPods and `cmake` (React Native's `hermes-engine`
podspec requires it). `pnpm test`, `pnpm typecheck` and `pnpm build:web` need none of them.

## Testing

Two seams, per [ADR-0001](docs/adr/0001-testing-seams-tdd-and-detox.md): stores and mock resolvers
are built test-first under Jest + React Native Testing Library; screens are covered by Detox specs
in `apps/host/e2e/`. There are no snapshot tests.

## The web target

`pnpm build:web` exports the app as a static site into `apps/host/dist`, and `npx serve` will
host that directory:

```
pnpm build:web
npx serve apps/host/dist
```

`serve` prints the URL it is listening on, normally <http://localhost:3000>.
