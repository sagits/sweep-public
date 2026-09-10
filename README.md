# Sweep Hosts

A universal host app — one codebase running on iOS and in the browser — for the turnover
cleaning that sits between short-term-rental guests. It is a portfolio piece and an architecture
study: mock data only, no backend, no API, no auth, and every async operation is a timer.

**What a host does in it**

- **Registers a property**: address, unit, bedroom/bed/bathroom counts, unit size, check-in and
  check-out times, and a photo from the camera roll. Three come seeded.
- **Schedules a cleaning project** against one of those properties, on a calendar that lays the
  next few days out and shows what is unassigned.
- **Posts a search to the marketplace** when a property needs a cleaner, through a two-step
  wizard that confirms the property and describes the work.
- **Reviews the bids** that come back: each cleaner's profile, rating, badges, message, price,
  and a gallery of their previous work.
- **Looks over payment history**, and their own profile.

Every screen loads behind a skeleton, every list has a designed empty state reachable with a seed
toggle, and every tab pulls to refresh — the loading and empty states are the point of the study
as much as the populated ones are.

## Stack

Expo (SDK 54) + Expo Router · TypeScript · NativeWind · Zustand · React Native Web · Turborepo +
pnpm · Detox.

`expo-image-picker` is the one native module here, used by the New Property form's photo upload.
Adding or changing a native module means rebuilding the Detox dev client (`pnpm e2e:build`) before
the simulator can see it — a JS reload is not enough.

The UI is a hand-rolled design system in `packages/ui` on top of NativeWind — one component per
file, drawing from the tokens in `packages/ui/tokens.js`. The original PRD named gluestack-ui v2 as
part of the stack; it is deliberately not used here. gluestack v2 is copy-in, so its components
would have been rewritten into `packages/ui` regardless, and the primitives this PoC needs are
small enough that owning them outright is the simpler answer. See `DECISIONS.md`.

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
app/                     the routes — Expo Router is file-based, so this tree is the navigation
  (tabs)/                the five tabs: index (Home), projects, marketplace, properties, more
  payments.tsx           pushed from Home's $ icon, not a tab
  property/new.tsx       the New Property form
  project/new.tsx        project/[id].tsx
  search/new.tsx         search/[id].tsx (the bids), search/congrats.tsx
  cleaner/[id].tsx       a cleaner's full profile
  _layout.tsx            the root stack; +html.tsx is the web shell
src/                     everything the routes are built from, by feature
  home/ projects/ marketplace/ properties/ payments/ more/
  navigation/            TabBar and the shared white ScreenHeader
  stores/                Zustand stores, plus once.ts (the shared load guard) and merge.ts
  testing/               test-only helpers, e.g. flush()
  **/*.test.tsx          Jest + RNTL, beside the code they cover
assets/                  bundled photographs (properties, work-photos) and icons
e2e/                     Detox specs, one per feature, plus support.ts and their own tsconfig
scripts/e2e-test.sh      starts Metro, waits for it, runs Detox, shuts it down
```

The two test seams live in different places on purpose: **Jest specs sit next to the code**
(`src/stores/useProperties.test.ts` beside `useProperties.ts`), because they are written first and
drive its design. **Detox specs live apart in `e2e/`**, because they exercise whole screens through
the running app and belong to no single file. See [ADR-0001](docs/adr/0001-testing-seams-tdd-and-detox.md).

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
EXPO_PUBLIC_SEED=false pnpm build:web          # needs --clear if the flag changed, see DECISIONS
EXPO_PUBLIC_SEED=false pnpm --filter @sweep/host e2e:test e2e/seed.e2e.ts
```

The spec path has to go through `--filter`: the root `pnpm e2e:test` hands its argument to turbo,
which reads it as a task name.

Everything runs locally — no EAS, no Expo/Apple/Google account. `ios/` and `android/` are generated
on demand by `pnpm e2e:build` (Continuous Native Generation) and are not committed.

**iOS only.** There is no Android SDK on the development machine, so `.detoxrc.js` has no Android
configuration. The only simulator configured is `iPhone 16`.

`pnpm e2e:build` additionally needs Xcode, CocoaPods and `cmake` (React Native's `hermes-engine`
podspec requires it). `pnpm test`, `pnpm typecheck` and `pnpm build:web` need none of them.

## Testing

Two seams, per [ADR-0001](docs/adr/0001-testing-seams-tdd-and-detox.md): stores and mock resolvers
are built test-first under Jest + React Native Testing Library; screens are covered by Detox specs
in `apps/host/e2e/`. There are no snapshot tests.

Layout fidelity is not eyeballed. Colours and sizes are settled by decoding a reference screenshot
and a screenshot of the app and comparing pixel values — a screenshot is px-per-point scaled
(`width / 393`), so ink heights and insets convert straight to points. Every colour and size
argument recorded in `DECISIONS.md` was settled that way, and several of them overturned what the
PRD's prose said. Where the PRD and a screenshot disagree, the screenshot wins.

## The web target

`pnpm build:web` exports 20 prerendered routes into `apps/host/dist`; `npx serve apps/host/dist`
serves them. Serve it **without** `--single`: the flag rewrites every request to `index.html` and
the app then client-renders every route out of Home's prerender, which throws away the static
output the export exists for.

The trade-off is that the three dynamic routes — `/cleaner/[id]`, `/project/[id]`, `/search/[id]` —
export as literal `[id].html` files and 404 on a plain file server. Reaching them from inside the
app works; deep-linking one needs a rewrite from the host (on Vercel, a rewrite of `/cleaner/:id`
to `/cleaner/[id].html`, and the same for the other two). Every static route, `/projects` included,
deep-links as it stands.

## Platform-specific files

`.web.tsx` files are used only where a native module has no web equivalent. **None exist** — the
web verification pass in ticket 10 drove every screen and every flow in a browser and did not need
one.

## Image credits

The three seeded properties use real photographs, downloaded into
`apps/host/assets/properties/` rather than hotlinked, and scaled to 480px wide. All three are
**CC0** (public domain dedication), taken from Wikimedia Commons' mirror of Unsplash:

| File | Source | Photographer | Licence |
|---|---|---|---|
| `beach-house.jpg` | [Beach hut on stilts](https://commons.wikimedia.org/wiki/File:Beach_hut_on_stilts_(Unsplash).jpg) | Bjørn Tore Økland | CC0 |
| `rural-home.jpg` | [Basic rural home](https://commons.wikimedia.org/wiki/File:Basic_rural_home_(Unsplash).jpg) | Andrik Langfield Petrides | CC0 |
| `city-apartment.jpg` | [Brown apartment building](https://commons.wikimedia.org/wiki/File:Brown_apartment_building_(Unsplash).jpg) | Rene Bieder | CC0 |

The cleaner profiles' work gallery uses six interiors, same store, same licence, in
`apps/host/assets/work-photos/` — `living-room`, `kitchen`, `bedroom`, `dining`, `hallway` and
`dining-view`, by Jarosław Ceborski, NeONBRAND, Viktoria Hall-Waldhauser, Nirzar Pangarkar,
Erick Lee Hodge and Rik van der Kroon respectively. One shared set serves every cleaner.

CC0 waives the attribution requirement, so these credits are courtesy rather than obligation.
`Property.image` holds a key or a `data:` URI, never a path — `apps/host/src/properties/images.ts`
resolves a seed key to its bundled asset and wraps an uploaded base64 photo as a `uri` source. That
keeps `packages/mocks` free of anything the bundler has to resolve, and means a photo a host adds
travels inside the property itself, since there is no server and no file store.
