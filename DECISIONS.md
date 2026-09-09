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

## 02 — Home shell

- **Screenshot conflict — Home's page background is white, not the PRD's light gray.** The Design
  section calls for a `~#F1F2F6` page. Sampling screenshots `01`–`03` between the cards, below the
  last card and inside a card all return `#FFFEFF`: on Home the cards separate from the page by
  their shadow alone. The screenshot wins, so Home passes `surface` to `Screen`. The `background`
  token keeps the PRD's gray for the screens that do show it.
- **Screenshot conflict — the blue "Get $100 credit" pill is not unconditional.** The PRD lists it
  as part of the Home header. Screenshot `02` shows the pill *and* the promo card; screenshot `01`
  is the same screen with the promo card gone, and the pill is gone with it. They are one feature,
  so dismissing the promo hides both.
- **The bell badge is the notification count, and disappears at zero.** `01` and `02` have no
  notifications and no badge; `03` has notifications and a red `3`. The PRD only says "a bell with
  badge count".
- **Screenshot simplification — the promo card is flat blue, not a gradient.** The screenshot's card
  runs `#1E69BE` on the left to `#4790E1` on the right. A gradient needs either
  `expo-linear-gradient` — a native module, so every parallel ticket inherits a dev-client rebuild —
  or RN 0.81's `experimental_backgroundImage`, which react-native-web does not implement, so the
  card would lose its background entirely on the web target. Flat `accent` on both platforms;
  swap in `expo-linear-gradient` if the gradient ever outweighs that.
- **Four tokens added to `packages/ui/tokens.js`**, all read off the screenshots: `primaryInk`
  (`#0E8C85`) because teal *text* on white reads far deeper than the band teal, `accent`
  (`#1E68BF`) for the credit pill and promo card, `skeleton` (`#E7E9EE`) and `surfaceMuted`
  (`#F8F8FB`) for panels inside a card, like the Quality center's title strip. The band teal itself
  stays the PRD's `#22C99C`; the screenshots read `#38D4B1`, which is inside the PRD's "around".
- **`Skeleton` is deliberately static — no shimmer.** Detox waits for animations to settle, and an
  endless pulse would force every spec that mounts a list to drop synchronization. Skeletons appear
  on nearly every screen, so keeping them still is what lets the other tickets' specs stay
  synchronized.
- **The Quality center's starburst is still, not spinning.** Detox waits for animations to settle,
  so a spinner that never stops leaves the app permanently "busy" — measured here, it took out
  `navigation.e2e.ts` too, not just Home. The alternative is dropping synchronization across the
  whole suite, which would push flakiness onto every other feature's spec. `Spinner` animates
  everywhere it is tied to a mock resolver (button and full-screen loads finish on their own and
  are safe); the one permanent instance passes `animating={false}` and renders exactly the still
  starburst the reference screenshot shows. If it ever has to rotate, drive that one with
  Reanimated, whose UI-thread animations Detox does not track.
- **"See all" targets.** Projects → the Projects tab. Notifications → inert: the PoC has no
  notifications screen and the PRD does not ask for one.
- **`Screen` gained `insetTop` and `surface`.** A screen with a teal `HeaderBand` needs the band,
  not the page, to clear the status bar, so it passes `insetTop={false}`; the band applies the
  inset itself and paints `extend` more teal below the header row, behind the first cards.
  Both are booleans rather than a `className` passthrough — two `bg-` classes on one element
  resolve by stylesheet order, not by the order they appear in the string.
- **Home's Projects card loads through a real `useProjects` store** over an empty `seededProjects`
  in `packages/mocks`. The card mounts into a skeleton and resolves into
  "There are no projects right now." exactly as it will resolve into rows, so the Projects ticket
  fills the seed and adds the row, and changes nothing else.
- **The promo card's megaphone is the 📣 emoji**, not an image asset. Nothing is shipped, downloaded
  or licensed, and it renders identically on both targets.
- **`autoInstallPeers: false` in `pnpm-workspace.yaml`.** `packages/ui` declares `react` as a peer
  with range `*`, so pnpm auto-installed React 19.2.3 into `packages/ui/node_modules` beside the
  app's 19.1.0. Every hook called from inside `packages/ui` then threw
  `Cannot read properties of null (reading 'useRef')` — `Spinner` was the first component in there
  to call one, and it took down the whole screen. The peers come from the hoisted root
  `node_modules`, which is the layout Expo's Metro resolver wants anyway.
- **`@testing-library/react-native` 14's `render` is async.** It returns a promise, so a test must
  `await render(...)` before touching `screen`; forgetting the `await` fails with the misleading
  "`render` function has not been called".
- **Card shadows are `boxShadow`, not the `shadow*` style props.** Those are deprecated in
  React Native 0.81 and warn on every render in the web target, which the PRD's web verification
  step explicitly rules out. Same for `pointerEvents`, which moved into `style`.
- **Detox's `toBeVisible` does not work on containers**, and this bit every spec. It scores a
  view's visible area against a 75% threshold, counting everything drawn over it — its own
  children included — so a container packed with content never passes. `screen.home` failed the
  moment Home stopped being a placeholder, which took `navigation.e2e.ts` down with it. The rule
  the specs now follow, and the one the remaining tickets should copy: **containers assert
  `toExist`, text asserts `toBeVisible`.** `navigation.e2e.ts` moved to `toExist` for its screen
  ids. Scrolling to something below the fold uses `whileElement(...).scroll()` against a `by.text`
  matcher, since text nodes are leaves and score cleanly.
- **A skeleton cannot be observed while Detox is synchronized.** Detox waits out pending JS
  timers before handing control back, and the PRD's 600–1200ms mock delay is one — so by the time
  a synchronized `launchApp` returns, every skeleton has already resolved. The one test that
  watches Home load drives its own launch with
  `launchArgs: { detoxEnableSynchronization: 0 }` and re-enables synchronization once the
  skeletons are gone. `device.disableSynchronization()` before `launchApp` does not survive the
  launch; the launch argument does. Every other test stays synchronized.
- **The teal band's extension is offset with a negative `bottom`, not `top: '100%'`.** Fabric does
  not resolve a percentage `top` on an absolutely positioned view — it silently collapses to 0, and
  the extension covered the header row it was supposed to sit below. It cost a full Detox cycle to
  find, because the app rendered perfectly except for an empty teal band.

## 03 — Properties

- **Screenshot conflict — the form's address is the PRD's `Los Angeles, CA 90001, USA`, not the
  screenshot's `Beacon, NY 12508, USA`.** Screenshots `25`/`26` show whatever the host typed into
  a live address autocomplete, which this PoC deliberately does not have; the PRD names the fixed
  stand-in value explicitly. Data, not layout — everything around the field follows the screenshot.
- **Screenshot simplification — the pagination row (`‹ 1 ›`) under the list is dropped.** With
  three or four properties and "Show 5 properties" there is exactly one page, so the control would
  be permanently inert. The page-size dropdown is real instead: it slices the list. The webview
  chrome around the screen — hamburger header, `RP` avatar, the `X`, the Intercom bubble — goes
  with it; the PRD already rules that this becomes a native screen.
- **The "Adding Properties" info row is on both form steps.** The PRD puts it on step 1, screenshot
  `27` shows it on the details step. Both, then; it is one row.
- **Provider tiles are wordmarks, not logos.** Nothing branded is downloaded or shipped, and the
  tiles are inert either way. Same reasoning as ticket 02's megaphone emoji.
- **Property images are emoji, and a property without one falls back to a grey house outline** —
  which is exactly what screenshot `24` shows. So the seed reads as "each with its own image"
  without shipping an asset, and a property registered through the form matches the reference.
- **Measured off screenshot `24`:** the page is the PRD's grey (`#F1F0F6` sampled — unlike Home,
  which is white), cards are white, the New Property and search buttons sample `#76E2C9` → the
  `primary` token, and the alias, "Edit property groups" and "Add teammates" sample `#028878` /
  `#078270` at their darkest → `primaryInk`, the token ticket 02 added for teal text on white.
  Rules under the fields sample `#E1E0E6` → `border`. No new tokens were needed.
- **The confirm dialog is an absolutely positioned overlay — not `Alert`, not `Modal`.**
  `Alert` is a no-op under react-native-web, and the PoC's web target has to run the same flow.
  `Modal` renders *nothing at all* under jest-expo (React Native 0.81's Modal mock never reaches
  the tree here), which would drop the confirm step, and every dropdown, out of the TDD seam. The
  overlay fills the form's root view, matches screenshot `29` and is testable in both seams. The
  form's dropdowns expand inline for the same reason, plus one of their own: a modal inside a
  ScrollView gets clipped.
- **RNTL 14 + React 19: a `fireEvent` state update only lands on the next async flush, and two
  events fired back to back without one wedge the render loop.** Every later update is then
  dropped silently — the component simply stops re-rendering, with no warning and no error. This
  cost an hour: a form test typed into two fields in a row and every assertion after it saw the
  initial state. The rule the specs now follow: **await something after every `fireEvent`** —
  `findBy*`, `waitFor`, or a bare `setTimeout(0)` flush. This is on top of ticket 02's finding
  that `render` itself must be awaited.
- **`useProperties` carries a `loaded` flag as well as `loading`.** `load()` is a no-op once the
  seed has arrived, so returning to the tab after registering a property does not re-seed over it.
  That is what "persists for the session" means, and it is what the store test pins down.
- **The seed switch is one env read, `EXPO_PUBLIC_SEED=false`, living in
  `packages/mocks/src/properties.ts`.** It makes the empty state reachable today without a code
  edit; ticket 09 owns generalising it across every list. `process` is declared locally rather than
  pulling `@types/node` into a package that needs nothing else from Node.
- **Times are text fields and the image tile is inert.** The PRD lets a date-time picker and an
  image picker be simplified; both would otherwise be native modules, which the PoC avoids.
- **`ConfirmDialog` and the form's field primitives stay in `apps/host/src/properties/`.** They are
  shared-looking, but this is the only feature using them today and a whole duplicated file is a
  worse merge than a one-line barrel conflict. Promote them into `packages/ui` when a second
  feature needs them.
- **Verified in the browser instead of the simulator**, since three agents share one dev client:
  `build:web` exports cleanly, `/properties` and `/property/new` both render (deep-linked too), the
  whole skip → fill → save flow runs and appends the fourth card, and the console is free of errors
  and react-native-web warnings.
## 07 — Payments

- **Screenshot conflict — the empty state is not the screen.** Screenshot `22` is the only Payments
  reference and it is empty; the PRD overrides it and ships the tab populated. Both are built: the
  list is the default and the screenshot's folder state renders whenever the store holds nothing.
- **The filter icon clears the history.** The empty state has to be *reachable*, and the PoC has no
  filter sheet to build it out of. The header's filter icon is wired to `usePayments().clear()`,
  which is the only path to the screenshot's state, and it is what `payments.e2e.ts` taps. Leaving
  the tab and coming back reloads the seed, so nothing is lost. Swap the handler the day a real
  filter sheet exists.
- **The type on this screen is the largest in the app, and that is measured, not a guess.** Ink
  heights off screenshot `22`, scaled against ticket 02's `Sweep` wordmark (26px of ink at 28px):
  "Payment History" is 31px of ink → **30px**, and the empty-state sentence is 38px → **36px** over
  a 44px line, which is what makes it wrap after "any" exactly as the screenshot does. Rows fall
  back to the established scale (17px name, 15px property, 19px amount).
- **`PaymentsHeader` is local to the screen, not a shared primitive.** `HeaderBand` is the teal
  band and centers nothing; this header is white, clears the status bar itself and centers its
  title with the icons pinned right. Two screens would have to want it before it earns a spot in
  `packages/ui`.
- **No divider under the header.** Sampled down the left edge of `22`: white runs to y=179 and the
  page gray starts at 180, with no border line between them.
- **One token added — `illustration` (`#CDCBCF`)**, the flat gray of the folder, sampled off the
  screenshot. `skeleton` and `border` are both too light for an illustration and `inkMuted` is far
  too dark. The folder itself is `MaterialCommunityIcons` `folder` at 128, which measures 133×103
  in the screenshot.
- **`Payment` has no `status` field.** Every payment in the PoC is paid, so the pill's label is a
  constant. A field with one possible value is a field that lies about the model.
- **The row layout is invented.** No screenshot shows a populated payment. It follows the shape the
  rest of the app already uses for list rows — name and property on the left with the "Paid" `Pill`
  under them, amount over a `DateTimeStamp` on the right, hairline dividers, inside one `Card`.
- **Amounts format through `Intl`** (`toLocaleString('en-US', { style: 'currency' })`), the same
  API `DateTimeStamp` already relies on, so no formatting helper was added.
## 08 — More (profile)

- **Screenshot conflict — the avatar in `23` is a broken image, so it was interpreted, not
  copied.** What the reference renders is a collapsed gray bar with the edit badge floating at its
  right end: the classic failed image load. Shipped instead is what it was meant to be — a 64pt
  circular placeholder with a person glyph and the white pencil badge on its lower right. Nothing
  else on the screen was reinterpreted.
- **Icons come from `MaterialCommunityIcons`**, the set already in the app; no second icon font is
  added for one screen. Two of the ten are approximations of glyphs MDI does not carry exactly:
  Inventories is `paper-roll` and both Guest rows are `star-half-full` (the reference draws the
  same notched star for Guest Checkout Feedback and Guest Center).
- **The footer link is band teal (`primary`), not `primaryInk`.** Home's card titles needed the
  deeper ink teal to read on white; "Check for updates" in `23` is measurably the lighter band
  teal, on the gray page. Same token family, different value — the screenshot decides per element.
- **The header and profile block do not scroll; the menu card and footer do.** In `23` everything
  fits without scrolling, and the alternative — scrolling the profile over the fixed teal that
  `HeaderBand`'s `extend` paints — would slide the name out from under its own background. So the
  teal profile block sits outside the `ScrollView` and carries its own extension, 176pt of teal
  behind the top of the card, measured off `23`.
- **Ten rows, one destination.** Every row is a `Pressable` with no `onPress` except Properties,
  which calls `router.navigate('/properties')` — the tab path, so nothing here imports from the
  Properties screens.
- **The screen itself has no unit test; `MoreMenu` does.** ADR-0001 puts screens behind Detox, and
  the route's only logic is `useRouter`. The part worth a TDD test — ten rows in order, and exactly
  one of them wired — is in `MoreMenu`, which takes its navigation as a prop and needs no router.

## Integration — typed routes are generated, and a missing file lies

Found merging tickets 03/07/08 together, not in any single worktree.

`app.json` sets `experiments.typedRoutes: true`, so `router.push()` only accepts routes listed in
`apps/host/.expo/types/router.d.ts`. That file is **generated by `expo start`** — `expo export` does
not write it, there is no `expo typegen` command, and `.expo/` is gitignored.

The trap: when `router.d.ts` is **absent**, the `expo-router` module augmentation never happens and
`Href` degrades to an unconstrained string, so `pnpm typecheck` passes on anything. A fresh worktree
has no `.expo/`, so a ticket that adds a route typechecks green in isolation and fails the moment it
merges into a checkout that has a stale `router.d.ts` listing only the old routes. Ticket 03's
`/property/new` did exactly this.

**If your ticket adds a route**, run the dev server once (`pnpm dev`, or
`npx expo start --web` and kill it as soon as `.expo/types/router.d.ts` appears) before you trust
`pnpm typecheck`. A green typecheck with no `.expo/types/` present proves nothing about `Href`.

## 04 — Projects

- **Screenshot conflict — the calendar's day sections are populated, not empty.** Screenshot `04`
  is the only calendar reference and every day section in it is empty; the PRD's seeding section
  overrides that ("1 project per property, spread across the next few days"). The layout follows
  `04` exactly — header, month navigator, weekday row, week strip, drag handle, one section per
  day — and the rows are the PRD's. Days with nothing still get their section, which is what `04`
  shows.
- **Screenshot deviation — project detail and the manual form have no tab bar.** `09` draws the
  bottom bar with Projects active, so the real app pushes detail *inside* the tab. Here
  `/project/[id]` and `/project/new` are root stack routes, the shape ticket 03 already set for
  `/property/new` — and screenshots `06`–`08` show the form full-screen with no bar, so the two
  references disagree with each other. Putting detail under the tab would mean a nested stack
  (`app/(tabs)/projects/_layout.tsx` + `index` + `[id]`) for one strip of chrome.
- **The seed is relative to boot, not fixed ISO dates.** The first two sections are always "Today"
  and "Tomorrow", so hard-coded dates would drift out of them the day after they were written.
  `packages/mocks/src/projects.ts` builds `startsAt`/`endsAt` from `new Date()`: today 11:00
  unassigned, tomorrow 10:00 assigned to Ramona, +4 days 13:00 unassigned.
- **`Project` grew `propertyAddress`, denormalised off the property.** The detail's address row is
  the only thing that needs it, and carrying the string means the detail screen — which can be
  deep-linked — does not have to load and join the properties store. Nothing in the PoC joins
  projects back to properties.
- **Project ids are the digits the detail header prints** (`38261465`), not `project-1`. `09`
  renders "Project #38261465" and inventing a second display number for the same row would be a
  field that lies about the model.
- **The header refresh keeps what the host added.** There is no server, so re-fetching the seed
  would silently drop a project created this session. `reload()` merges: anything the fetch does
  not know about survives. The filter icon is inert — the PoC has no filter sheet and, unlike
  Payments, the empty state here is already reachable (any day with no projects).
- **The `+` dialog is its own component, not `ConfirmDialog`.** Same overlay reasoning as ticket 03
  (`Alert` is a no-op on react-native-web, `Modal` renders nothing under jest-expo), but the shape
  in `05` is two link-style rows separated by hairlines plus a checkbox, where `ConfirmDialog` is
  two stacked buttons. Sharing them would have meant a variant flag per difference.
- **Two tokens added — `warning` (`#F2792A`) and `violet` (`#6C4FD8`)**, sampled off `09` for the
  "Still Unassigned - Due 24h" glyph and the "Manual Project" star. `danger` is the red of the
  fourth pill and was already there.
- **The mint band behind the "Cleaning" pill is the existing `primaryMuted`.** `09`'s band is the
  same light teal as `04`'s inactive tab icons, so no third teal was introduced.
- **Two places where the shared design system wins over the pixel.** `05`'s checkbox has a teal
  box and a ~19px label, and `06`'s "Project Name" is a bold label over a filled input box; both
  render here through `Checkbox` and ticket 03's `Field` instead. Editing either shared file for
  one screen's border colour would fight the Marketplace ticket, which uses the same two.
- **Date and time pickers are the preset lists the PRD allows** — the next 14 days and an hourly
  8am–8pm — expanding inline for ticket 03's reasons (a modal inside a ScrollView is clipped, and
  `Modal` is invisible to jest-expo). The toggles are React Native's own `Switch`, which needs no
  new primitive and works on both targets.
- **`ProjectRow` is one component, rendered by both Home's card and the calendar's day sections.**
  It keeps the date-over-time stamp in the calendar too, where the section header already names
  the day; the alternative was a variant prop for a duplicated line.
- **Verified in the browser rather than the simulator**, since two agents share one dev client:
  `/projects`, `/project/new` and `/project/38261465` all render (deep-linked too), the whole
  `+` → dialog → form → submit flow runs, lands back on Home with the new row in the Projects card
  and places it under "Today" on the calendar, and the console is clean apart from the
  `useNativeDriver` notice ticket 02's `Spinner` already produces on web. `pnpm build:web` exports
  all 17 routes.
- **Typed routes: the dev server was run before trusting `pnpm typecheck`**, per the integration
  note above. `.expo/types/router.d.ts` lists `/project/new` and `/project/[id]`; navigation uses
  the `{ pathname: '/project/[id]', params: { id } }` form rather than a template literal.
