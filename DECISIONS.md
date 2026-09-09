# Decisions

Choices made while building from `poc/PRD.md` where the PRD left something open. Newest last.

## 01 — Monorepo foundation and 6-tab shell

- **gluestack-ui is not installed yet.** The PRD's stack names gluestack-ui v2, but v2 is a
  copy-in component library: you pull in only the components you use. The tab shell needs none of
  them, so installing it now would add unused code. NativeWind and the shared tokens carry this
  ticket; gluestack components get added as the screens that need them land.
- **Design tokens live in `packages/ui/tokens.js` as CommonJS.** `tailwind.config.js` has to
  `require()` them without a build step, so the single source is plain JS, re-exported from
  `@sweep/ui`. No hand-written `.d.ts` sits beside it: `allowJs` infers the shape from the source,
  so the types cannot drift from the values.
- **One Jest project, rooted in `apps/host`, covering `packages/` too.** ADR-0001's TDD seam spans
  host stores *and* the shared mock resolvers; a second runner in `packages/mocks` would be a
  second answer to a question the ADR already settled. `pnpm test` runs it through Turbo.
- **The tab bar is a custom `tabBar` renderer, not two layouts.** One component renders a bottom bar
  on phones and a left sidebar at `md` and above, so the PRD's "do not build a second web layout"
  holds. Content is capped at 720px and centered by the shared `Screen` component in `packages/ui`.
- **The breakpoint is expressed as NativeWind `md:` classes, not `useWindowDimensions`.** Two
  reasons, both found the hard way: the tab navigator memoizes the element it renders for `tabBar`,
  so a value threaded down as a prop goes stale; and in the static web export `useWindowDimensions`
  reports a narrow width and never updates, even across a real browser resize. `md:` compiles to a
  CSS media query on web and is evaluated against device width on native, so both targets flip
  correctly. `sidebar` spacing and the `content` max-width are named in the shared preset so the
  numbers still live in `packages/ui/tokens.js`.
- **Tab icons come from `MaterialCommunityIcons`** (`home`, `calendar`, `handshake`, `credit-card`,
  `office-building`, `dots-horizontal`) — the only icon set in `@expo/vector-icons` that carries all
  six, including the handshake.
- **The tab bar's props are derived from `Tabs`'s own `tabBar` prop**, not imported from
  `@react-navigation/bottom-tabs`. That package reaches the app only transitively through
  expo-router, and which react-navigation packages expo-router depends on has already changed
  between SDK versions; reading the type off the navigator survives that.
- **pnpm uses `nodeLinker: hoisted`**, per Expo's monorepo guide — Metro's resolver expects a
  hoisted `node_modules`.
- **TypeScript 5.9.3**, the version Expo SDK 54 pins.
- **Detox specs are type-checked separately** (`e2e/tsconfig.json`, run as part of `pnpm typecheck`)
  so a broken spec surfaces without waiting on a simulator build.
- **Screenshot conflict, already acknowledged by the PRD:** every reference screenshot shows five
  tabs, with Properties reached from More. The PRD promotes Properties to a sixth tab, and that is
  what is built.
- **Installed `cmake` (Homebrew).** React Native 0.86's `hermes-engine.podspec` calls
  `Pod::Executable.which!('cmake')` unconditionally, so `pod install` — and therefore
  `pnpm e2e:build` — cannot run without it. Nothing already on the machine was re-installed or
  upgraded; cmake was simply absent. It is a prerequisite for the native build only, and the web
  build and unit tests do not need it.
- **`settings.react.version` is pinned in the shared ESLint config.** `eslint-plugin-react` 7.37.5
  crashes under ESLint 10 while auto-detecting the React version (`context.getFilename` was
  removed); giving it the version explicitly skips detection. Revisit when the plugin ships ESLint
  10 support.
- **Expo SDK 54, not SDK 57 (the current latest).** The PRD asks for the latest SDK, but the
  provisioned Xcode 16.4 (Swift 6.1.2) cannot build the newer ones, and upgrading Xcode is
  explicitly out of bounds — so the SDK moved instead:
  - **SDK 56/57** ship `expo-modules-jsi`, whose SwiftPM package declares
    `swift-tools-version: 6.2`. `pod install` fails outright: *"package 'apple' is using Swift
    tools version 6.2.0 but the installed version is 6.1.0"*.
  - **SDK 55**'s `expo-modules-core` sets `swift_version = '6.0'` and uses Swift 6.2 concurrency
    syntax; `xcodebuild` fails with ~48 actor-isolation errors (`unknown attribute 'MainActor'`,
    *"main actor-isolated property … cannot be referenced from a nonisolated context"*).
  - **SDK 54** (React Native 0.81) sets `swift_version = '5.9'` and builds cleanly here.

  SDK 54 carries everything the PRD's stack needs. Revisit when the machine's Xcode is upgraded.
- **The `md:` sidebar applies on any wide viewport, not only web.** The PRD scopes it to
  "on web at the `md` breakpoint and above"; a breakpoint class cannot distinguish platform, so a
  wide native device (an iPad — `supportsTablet` is on) gets the sidebar too. That is a superset of
  what was asked and reads correctly; the only simulator available here is an iPhone 16, so it does
  not affect anything under test.
- **`pnpm e2e:test` starts Metro itself** (`apps/host/scripts/e2e-test.sh`). Detox drives a debug
  dev client, which loads its bundle from Metro, so the documented command has to work from a cold
  shell. The script starts Metro, waits for `:8081/status`, runs the suites and shuts it down. It is
  deliberately *not* wired to `e2e:build` in `turbo.json` — the PRD wants `e2e:test` to run every
  time while `e2e:build` only re-runs when something native changes.
- **`expo-status-bar` is not listed in `app.json` plugins.** It is not a config plugin in SDK 54;
  `expo install` had added it while the project was briefly on a newer SDK.
- **`tailwindcss` is pinned to 3.4.x.** NativeWind 4 does not support Tailwind 4, and
  `expo install` resolves `tailwindcss` to the 4.x line.
- **Known flake in `pnpm e2e:build`:** React Native picks its Hermes source by curling
  `repo1.maven.org` to see whether a prebuilt tarball exists. If that check fails transiently it
  silently falls back to building Hermes from the GitHub tag, and the Hermes tag's sources do not
  compile against React Native's bundled `ReactCommon/jsi` (`fatal error: 'jsi/hermes-interfaces.h'
  file not found`). Running `pod install` as its own step in `e2e:build` — rather than letting
  `expo prebuild` invoke it — resolves the prebuilt tarball reliably, which is why the script is
  `expo prebuild --no-install && pod install && detox build`. Once downloaded, the tarball is
  cached in `~/Library/Caches/ReactNative`.
