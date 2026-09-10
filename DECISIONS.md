# Decisions

Choices made while building from `poc/PRD.md` where the PRD left something open. Newest last.

## 01 — Monorepo foundation and 6-tab shell

- **gluestack-ui is not installed, and never will be on this branch.** The PRD's stack names
  gluestack-ui v2, but v2 is a copy-in component library: you pull in only the components you use,
  and they land in your repo as your own source. The tab shell needed none of them, so ticket 01
  deferred it — "gluestack components get added as the screens that need them land" — and no later
  ticket picked it up. The code review caught that at the end of the build: every primitive in
  `packages/ui/src/` is hand-rolled, and `grep -r gluestack` over `apps/` and `packages/` finds
  nothing.

  Reviewed and **kept as-is, deliberately**. The eleven primitives are all in use, covered by the
  Jest and Detox suites, and verified in a browser; because v2 is copy-in, its components would have
  been rewritten into `packages/ui` anyway, so the retrofit would have bought a dependency rather
  than a different architecture. The honest statement is that this app runs on **NativeWind plus a
  hand-rolled design system**, not on gluestack-ui — the README says so, and the PRD's Tech Stack
  line is out of date on this point.
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
- **Screenshot conflict — the blue "Get $100 credit" pill is not unconditional.** *(Moot as of the
  polish pass: the pill was removed from Home's header on request. The `Pill` component stays —
  the Payments "Paid" chip uses it.)* The PRD lists it
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
- **The type on this screen is the largest in the app, and that is measured, not a guess.**
  *(Superseded by the polish pass: Payments is a pushed screen now and wears the shared header's
  18px title and 26px icons. The measurement below still describes screenshot `22`; it no longer
  describes the code.)* Ink heights off screenshot `22`, scaled against ticket 02's `Sweep` wordmark (26px of ink at 28px):
  "Payment History" is 31px of ink → **30px**, and the empty-state sentence is 38px → **36px** over
  a 44px line, which is what makes it wrap after "any" exactly as the screenshot does. Rows fall
  back to the established scale (17px name, 15px property, 19px amount).
- **`PaymentsHeader` is local to the screen, not a shared primitive.** *(Superseded by the polish
  pass: this file is gone; Payments now uses the shared `ScreenHeader`.)* `HeaderBand` is the teal
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
## 05 — Marketplace

- **The type scale is anchored on shipped code, not on raw screenshot pixels.** The references
  export at 768px for a 393pt device, so ink measured in them is ~1.95× a point. Rather than guess
  the factor, `SectionHeader`'s known 19px was measured in screenshot `03` ("Notifications", 29px
  of ink) — so **code px ≈ ink × 0.655**, which also reproduces the shipped 17px row name and 15px
  row subtitle exactly. Everything on these screens is measured that way: screen titles 18px
  ("Marketplace searches", "Beach apartment", "New Cleaner Search" all measure a 25–26px cap),
  the empty-state headline 22px over 15px body and 26px stat figures, bid-card name 19px, price
  19px over "per project" 17px, "While you wait" 19px over 15px. Payments' 30px header was scaled
  off a different anchor and is left alone — it is ticket 07's screen.
- **Four tokens appended, all sampled off the references:** `primaryDeep` (`#2DA4A8`, the deeper
  teal of the "Super Cleaner" chip *and* the completed "While you wait" circles — measurably not
  `primary`, `primaryDark` or `primaryInk`), `star` (`#F5BA5C`), `badge` (`#6510CC`, the purple
  background-check shield) and `slate` (`#6F7C8B`, the warning block under the notes textarea).
  The pale circle on an unfinished checklist row is `bg-primary/20`, which lands on the sampled
  `#D9F8F1` without a fifth token. The handshake samples `#9B999D`, darker than ticket 07's
  `illustration` `#CDCBCF`; the token was reused rather than adding a second illustration gray.
- **Neither `Bid` nor `CleanerSearch` carries a status.** Accepting a bid is inert per the PRD and
  nothing in the PoC closes a search, so both fields would have exactly one value forever — the
  same reason ticket 07's `Payment` has no `status`. The Accepted-bids tab renders an empty line
  and the Closed tab renders the handshake empty state, **which is how that empty state stays
  reachable without disabling the seed** — one tap, and `marketplace.e2e.ts` asserts it there.
- **Screenshot conflict — the Congrats overlay is a 🎉 above the word "Congrats!", not the PRD's
  "Congrats! 🎉".** Screenshot `13` also shows it as a hard-edged teal rectangle at half the
  screen's width and height over a ~30% black scrim, with the footer button holding its spinner
  underneath. Built as shown.
- **Screenshot conflict — the "Super Cleaner" chip and the "is also a Rental Handy Pro" line are
  per cleaner, not per card.** The PRD lists both as parts of the bid card; `14`/`15` show Aurea
  with neither. They are booleans on `Cleaner`, and Aurea has them false.
- **Deliberate deviation — the wizard's inputs are the property form's field primitives.**
  Screenshots `11`/`12` draw filled boxes with the label outside; `Field` / `ReadOnlyField` /
  `SelectField` / `SegmentedToggle` are underlined. Reusing them keeps one field vocabulary across
  the app and, more to the point, reuses `SelectField`'s inline expansion — the machinery that
  exists because `Modal` renders nothing under jest-expo. Labels, order, values, copy and the
  footer button text all follow the reference; only the chrome differs. The notes textarea is the
  filled box the screenshot shows, since no primitive covers it.
- **A Property picker was added as step 1's first field.** The reference wizard is entered with a
  property already chosen, and this PoC has no screen that does the choosing — without it every
  posted search would land on the same property. It is a `SelectField` over the registered
  properties, and picking one re-derives the address and the bed/bath counts below it.
- **`useMarketplace.load()` holds its in-flight promise at module scope, and `post()` awaits it.**
  A `loading` flag alone is not enough: a second caller sees it, returns immediately, and the seed
  landing afterwards overwrites what it appended in between. Reaching `/search/new` directly did
  exactly that — the posted search was created, then wiped by the bid list's own `load()`, and the
  screen bounced back to an unchanged list of three. Pinned by a store test.
- **Detox cannot match a string that React Native split into nodes.** `Expires in {n} days` and
  `{n} reviews` render as three and two separate text nodes; `by.text('Expires in 2 days')` never
  matches them. Every interpolated string on these screens is one template literal, and the price
  is two sibling `Text`s (`$100`, `per project`) rather than one nested pair. Worth copying: it is
  invisible until a spec runs.
- **`MarketplaceHeader`, `Segmented`, `StarRating` and the Super Cleaner chip stay local.**
  `HeaderBand` is the teal band and centres nothing, `SegmentedToggle` is the small unpadded
  sq. ft. pair, and `Pill` is a full-radius label without an icon. Three of the four screens that
  want this header are in this one folder; promote them when a fourth feature asks.
- **`BidCard` takes an `onPress` that nothing passes yet.** Ticket 06 owns `/cleaner/...`; wiring
  it here would have added a route that does not exist. The whole `Cleaner` rides on the `Bid`, so
  that screen needs no lookup: `completedProjects`, `location`, `distanceMiles`, `memberSince`,
  `message`, `workPhotos`, `superCleaner`, `rentalHandyPro` and `backgroundChecked` are all there.
- **Cleaner photos are emoji**, for the reason ticket 03 gave for property images — and the
  reference photos are of real people.
- **The header's magnifier is inert.** There is no search field behind it in the reference, and
  unlike Payments' filter icon it has no empty state to unlock: the Closed tab already reaches it.
- **Typed routes were generated before trusting `pnpm typecheck`**, per the note above: `expo
  start` was run once, and `.expo/types/router.d.ts` lists `/search/new` and `/search/[id]`.
- **Verified in the browser, not the simulator**, since two agents share one dev client. `serve
  dist` over a clean `build:web`: all 17 routes prerender, the seeded list, the bids list, both
  wizard steps and the Closed empty state render, posting a fourth search lands on its own bids
  and appends to Home's card, and the console is free of errors and react-native-web warnings.
  `marketplace.e2e.ts` is written but was not run.

## 06 — Cleaner detail

- **Screenshot conflict — the references disagree with each other about section order.** `18` and
  `20` (Jairo) run Information → Message from Cleaner → Badges → Reviews → Rental Handy Pro, and
  `19` ends on the work photos; that is the order the PRD lists and the one shipped, for every
  cleaner. The two Ramona shots contradict it and each other: `17` goes Information → **Badges**
  with no Message section at all, and `19` goes Message → **Photos** with no Badges, Reviews or
  Rental Handy Pro in between. One order per screen beats reproducing an inconsistency, and
  Jairo's is the one both the PRD and the ticket name.
- **The summary row and the Reviews row draw one star, not the bid card's five.** `17`–`20` show a
  single amber star before the number in both places, where `14`/`15` show a five-star rating on
  the card. `StarRating` is therefore not reused here — it is a different control, not a smaller
  one.
- **The route is `/cleaner/[id]` keyed by the *bid* id, not the cleaner id.** The whole `Cleaner`
  rides on the `Bid`, so the screen needs no lookup — and the bid is also what carries the price
  and the expiry the screen prints. The search that owns the bid supplies the header's property
  alias, so one `searches` selector answers everything and `CleanerProfile` itself touches no
  store: the route hands it a `Bid` and an alias.
- **The Show/Hide expander is an inline nested `Text`, and its state lives on the pressable's
  `accessibilityLabel`.** `19` shows "Hide" flowing at the end of the last line, which only a
  nested `Text` does — but ticket 05's finding cuts the other way here: Detox reads a nested
  `Text` as part of its parent, so neither `by.text('Hide')` nor a testID on it is reachable. The
  whole paragraph is the tap target, and it labels itself `Show message` / `Hide message`, which
  `toHaveLabel` matches. The section title stays *outside* that pressable so it keeps a node of
  its own. Collapsing is by character count (150, cut back to a word boundary), not
  `numberOfLines`, because an ellipsis drawn by the text engine cannot be followed by a link.
- **Work photos are the emoji stand-ins ticket 05 seeded, banded BEFORE/AFTER across the middle.**
  The reference tiles are two stacked photographs of real rooms with the words over them; one
  emoji per tile plus the band reads as the same control without shipping or licensing anything —
  the same call ticket 03 made for property images.
- **The price card's "More" is invented — no screenshot shows it open.** It breaks down exactly
  what the collapsed row names and nothing else: "Cleaner Bid $125.00" over "Fees / Added at
  checkout". Amounts format through `Intl`, as ticket 07's do.
- **Two places where the design system wins over the pixel, both already-settled precedents.** The
  info row's checkbox is `Checkbox` (13px label) where `17` draws a ~19px one, and both footer
  buttons are `Button` (16px label) where the reference is larger. Editing either shared file for
  one screen is what ticket 04 declined to do for the same two components.
- **No new tokens.** Ticket 05's `primaryDeep`, `star` and `badge` cover the chip, the ratings and
  the shield; the band over a work photo is `bg-ink/70`, an opacity modifier on a token rather
  than a fifth gray.
- **`SuperCleanerPill` is exported from `BidCard.tsx` rather than promoted or re-cut.** It is the
  same chip, and ticket 05 already recorded why it is not `Pill` (a size-and-icon variant on a
  file every feature imports buys nothing). Two screens in one folder is not yet
  `packages/ui`.
- **RNTL: unmounting a tree and rendering another inside one test wedges everything after it.** A
  loop over the three seeded cleaners passed for Ramona and Jairo and rendered *empty* for Aurea,
  and every later test in the file then failed too — the same silent-wedge failure mode ticket 03
  found with two `fireEvent`s. The fix is `it.each`, so each cleaner gets its own test and RNTL's
  own cleanup. Worth copying: the symptom is "element not found" on a tree `debug()` prints in
  full.
- **`SafeAreaProvider` renders nothing under jest-expo** — it waits on a layout pass that never
  arrives, even with `initialMetrics` — so a component calling `useSafeAreaInsets` is tested by
  feeding `SafeAreaInsetsContext.Provider` directly. This screen needs it twice: the header clears
  the status bar and the sticky footer clears the home indicator.
- **Typed routes were generated before trusting `pnpm typecheck`**, per the integration note:
  `expo start` was run once and `.expo/types/router.d.ts` lists `/cleaner/[id]`. Navigation uses
  the `{ pathname: '/cleaner/[id]', params: { id } }` form.
- **Verified in the browser, not the simulator**, since the accumulated Detox suite was running on
  the one device. `serve dist` over a clean `build:web`: all 18 routes export, a bid card opens
  the profile, both expanders work, Ramona renders `17`/`19`/`20` and Aurea renders correctly
  without the Super Cleaner chip or either Rental Handy Pro row, and the console is free of errors
  and react-native-web warnings. `cleaner-detail.e2e.ts` is written but was not run.

## 09 — Seed toggle and empty states

- **One switch, `packages/mocks/src/seed.ts`, read by every `fetch*`.** Tickets 03, 04 and 05 had
  each copied the same `declare const process` / `EXPO_PUBLIC_SEED !== 'false'` pair into their own
  mock module, and Payments and Notifications had none at all — so `SEED=false` left the bell badge
  and the payment history seeded. `seeded(rows)` replaces all three copies and covers all five
  lists. Nothing is exported from the package barrel: no screen needs to know.
- **The env var is read per call, not once at module load.** In a *dev* bundle babel-preset-expo
  does not inline `process.env.EXPO_PUBLIC_*` — it rewrites the read into a reference to
  `expo/virtual/env`, which is literally `process.env`, and `@expo/metro-config`'s
  `environmentVariableSerializerPlugin` injects the values into the bundle prelude at serialize
  time from the dev server's own environment. A per-call read is therefore a live read, which is
  what lets `seed.test.ts` drive both branches in one process without `jest.resetModules()`. A
  production `expo export` inlines the literal instead and constant-folds the ternary away, so the
  indirection costs nothing shipped.
- **How it is toggled.** `EXPO_PUBLIC_SEED=false pnpm dev` for the simulator,
  `EXPO_PUBLIC_SEED=false pnpm --filter @sweep/host e2e:test e2e/seed.e2e.ts` for Detox — `scripts/e2e-test.sh` starts
  Metro itself, so the variable reaches both the bundle and the test runner from one shell. No code
  edit, no `.env` file.
- **`expo export` needs `--clear` when the flag changes; `expo start` does not.** Measured: two
  back-to-back `expo export --platform web` runs with different `EXPO_PUBLIC_SEED` values produced
  a byte-identical entry bundle (same content hash), because Metro's transform cache does not key
  on the value babel inlines. `--clear` produces a different hash and the right build. The dev path
  is immune — the value is injected by the serializer, not baked into a transform.
- **`seed.e2e.ts` is the only spec that passes both ways, by design.** It branches on
  `process.env.EXPO_PUBLIC_SEED` in the runner and asserts either the seeded counts or the empty
  states across Home, Properties, Projects, Marketplace and Payments. The rest of the suite asserts
  the seeded app and is expected to fail with the seed off; run the seed-off pass as
  `EXPO_PUBLIC_SEED=false pnpm --filter @sweep/host e2e:test e2e/seed.e2e.ts`.
- **Ticket 07's filter-clears-history hack is removed.** The header's filter icon was wired to
  `usePayments().clear()` purely because clearing was the only route to screenshot `22`'s folder
  state. `EXPO_PUBLIC_SEED=false` is that route now, so the icon is inert with an
  `accessibilityLabel`, exactly like the Projects filter and the Marketplace magnifier, and
  `clear()` is gone from the store — a control that wipes history is a lie about what "filter"
  does. `payments.e2e.ts` loses its clear-then-empty test; `seed.e2e.ts` asserts the folder state
  instead, and also taps the filter to prove it changes nothing.
- **No new empty states were built.** Every screen ticket had already shipped one, and the sweep
  found no screen without a reachable one: Home's Projects and Notifications cards, the "Search for
  New Cleaners" prompt that replaces the Cleaner Search card, `properties.empty`,
  `marketplace.empty`, `payments.empty`, and the Projects calendar's day sections — which stay
  rendered and empty, which *is* screenshot `04`.
- **No screenshot conflicts found.** The seed-off states each match the reference their own ticket
  measured; this ticket changed no layout, copy, token or component.
- **Verified in the browser, not the simulator**, since the Detox suite is on the one device.
  `expo export --platform web` served on port 8123 (deliberately not 8081, which Metro owns):
  with `EXPO_PUBLIC_SEED=false` Home shows the prompt card, no bell badge and both "There are no…"
  cards, Properties shows "You have 0 properties" over its empty card, Marketplace shows the
  handshake, Payments shows the folder, and the calendar shows fourteen empty day sections. Rebuilt
  seeded (`--clear`): Cleaner Search (3), three project rows, three notifications, badge `3`, three
  property cards and four payment rows, and the filter icon leaves the history alone. Console clean
  both ways. `seed.e2e.ts` is written but was not run.
## Integration — the Detox specs against the real simulator

Tickets 03–06 wrote their specs and verified in the browser, so ten tests met the device for the
first time here. Every failure was spec-side; none of them was an app defect. Four rules came out
of it, on top of ticket 02's "containers assert `toExist`, text asserts `toBeVisible`":

- **Anything below the fold has to be scrolled to, even when the ticket only lists it.** Home's
  Projects card, the third property card, the "While you wait" checklist row and the promo card's
  headline all render fine and all fail `toBeVisible` — clipped, at 0% of the 75% threshold. A spec
  that writes them as flat assertions is asserting something no human can see either.
- **Scroll to the *lowest* line of a row, not the first one that matches.**
  `whileElement(...).scroll()` stops the instant its target passes the threshold, so the target
  ends up at the bottom edge and whatever sits under it is still clipped. Home's project row is
  the cleaner name over the alias: scrolling to `Unassigned` left `Beach apartment` off-screen,
  and scrolling to the alias brings both.
- **A repeated string is scoped, not indexed at random.** Three seeded searches all say "Created a
  minute ago"; Home names a property in the Cleaner Search card *and* in the Projects card; the
  cleaner profile prints the rating in the summary row and again in the Reviews row. The order of
  preference is a `by.id` on the element that is actually meant (`cleaner.rating` was added for
  exactly this), then `by.text(...).withAncestor(by.id(card))`, then `.atIndex(n)` where the index
  itself carries the meaning — `Downtown loft` `.atIndex(1)` inside the Projects card *is* the
  assertion that the manual project this test created was appended next to the seeded one.
- **Two taps that need help.** A multiline `TextInput` swallows the return key, so the keyboard
  stays up and covers a sticky footer button — tapping a non-touchable view inside the
  `keyboardShouldPersistTaps="handled"` scroll view closes it. And an element that grows when
  tapped (the cleaner's message paragraph) is tapped at an explicit `{ x, y }` near its top-left:
  `tap()` aims at the centre, which leaves the fold as soon as the paragraph expands.

## 10 — Web verification

- **The one app defect the browser found: every icon prerendered empty, and React threw a
  hydration error on load.** `@expo/vector-icons` renders a bare `<Text />` until
  `Font.isLoaded(family)` is true. Nothing loads the font during a static export, so all 20
  exported HTML files carried `<div class="css-146c3p1"></div>` where each icon should be, while
  the browser — which gets the `@font-face` from the export's own stylesheet — drew the glyph on
  its first client render. Every screen with an icon therefore mismatched, and React logged
  *"Hydration failed because the server rendered HTML didn't match the client"* (minified as
  #418) and re-rendered the tree. The fix is one call in `app/_layout.tsx`, above every screen:
  `useFonts(MaterialCommunityIcons.font)`. `expo-font` swaps `useFonts` for a synchronous
  `useStaticFonts` when `typeof window === 'undefined'`, so the font registers during the server
  render and the icons ship in the HTML. On native it changes nothing the icons were not already
  doing for themselves. Icons now also paint before hydration instead of popping in.
- **`expo-font` is imported without being declared in `apps/host/package.json`.** It is a peer of
  `@expo/vector-icons` and hoisted at the root, so it resolves; declaring it is what should happen,
  but pnpm 12 refuses (`Broken lockfile: missing snapshot for expo-font@14.0.12` — the lockfile
  only holds peer-suffixed keys for it) and the only way through is a full re-resolve of the
  lockfile, which is not a thing to do to a working install on the last ticket. Add it with
  `expo install expo-font` the next time the lockfile is regenerated for another reason.
- **How the mismatch was found, since the production error is minified to a number.**
  `npx expo export --platform web --dev --output-dir dist-dev` builds the same static export with
  readable React errors and LogBox; the dev build names the mismatching element and prints the
  server/client diff. Worth remembering — the minified #418 says nothing about which element.
- **Two console warnings are left, both from react-navigation and neither ours.**
  `@react-navigation/elements`'s `ResourceSavingView` passes `pointerEvents` as a prop on web
  (`props.pointerEvents is deprecated`), and its `Screen` sets `aria-hidden={!focused}` on the
  outgoing screen while the button that was just pressed still holds focus, which Chrome reports
  as *"Blocked aria-hidden on an element because its descendant retained focus"*. The
  `pointerEvents` one is `__DEV__`-only and does not appear in the production export at all; the
  `aria-hidden` one does, and fixing it means the library moving to `inert`. The app's own code
  has neither — ticket 02 already moved `pointerEvents` into `style`.
- **Chrome's Issues panel reports "a form field element should have an id or name attribute"** for
  every `TextInput`. react-native-web does not emit `name`, and it is an autofill hint, not an
  error or an unsupported-prop warning. Left alone rather than threading an `id` through the
  shared field primitives on the last ticket.
- **Static export, `serve`, and dynamic routes.** `npx serve apps/host/dist` serves each route's
  own prerender, which is the point of `web.output: "static"`. `serve --single` must not be used:
  it rewrites everything to `index.html`, so every route client-renders out of Home's prerender.
  The cost of not using it is that `/cleaner/[id]`, `/project/[id]` and `/search/[id]` export as
  literal `[id].html` and 404 on a plain file server — no `_expo/routes.json` is emitted for a
  host to read. In-app navigation reaches all three; deep-linking one needs a host rewrite.
  Recorded in the README.
- **No `.web.tsx` file was needed.** The whole app — six tabs, both wizards, both detail screens,
  every dialog and dropdown — runs on the shared source. The earlier tickets had already paid for
  this: `boxShadow` over `shadow*`, `style.pointerEvents` over the prop, absolutely positioned
  overlays over `Alert`/`Modal`, `md:` breakpoint classes over `useWindowDimensions`, and no
  gesture handler anywhere.
- **Verified by hand in Chrome over `expo export --platform web` on port 8123.** All six tabs at
  420px and at 1280px; `/projects`, `/properties`, `/marketplace`, `/payments`, `/more`,
  `/property/new`, `/project/new` and `/search/new` all deep-linked directly; the sidebar flips on
  a live resize with no reload; the property form and the cleaner-search wizard both drive with
  mouse and keyboard (Tab moves field to field, typing lands, dropdowns expand and select); and
  the full demo flow runs — a fourth property registered through the form, a manual project
  created against it that lands back on Home in the Projects card, a search posted for it that
  opens on three bids, and a bid card that opens Ramona's profile.
- **One Detox flake seen, and it is a race in the spec, not in the app.**
  `projects › loads the day sections behind skeleton rows` failed once out of three full runs
  (`Timed out while waiting for expectation: TOEXIST WITH MATCHER(id == "projects.skeleton")`).
  It is the one test that launches unsynchronized to watch a skeleton, and Home has already called
  `useProjects.load()` by the time it taps the Projects tab — so whether a skeleton is still on
  screen is a race between the tab tap and the 600–1200ms mock delay, decided by how fast the
  simulator boots that run. Re-ran the file (5/5) and the whole suite (43/43) green. If it bites
  again, the durable fix is for the spec to reach Projects by deep link rather than through Home.

## Review — fixes applied

A two-axis review (standards + spec) of the whole PoC. Five findings acted on; three deliberately
left alone. Nothing here changed a layout, a token or a copy string.

- **The Jest seam had grown to cover screens, and ADR-0001 puts screens behind Detox.**
  `properties.test.tsx` imported `app/(tabs)/properties`; `projects.test.tsx` imported
  `app/(tabs)/projects`, `app/project/[id]` and `app/project/new`. The duplicated
  `jest.mock('expo-router')` and safe-area mocks in both files are the tell: a test that has to
  fake the router is testing a route, and ticket 08 had already written the convention down — "the
  screen itself has no unit test; `MoreMenu` does". Several of the assertions were also
  one-for-one copies of the Detox spec beside them, which the ADR forbids at either seam.
  **Eleven tests deleted**, each covered by a spec that runs on the device: the skeleton-then-content
  pair by `properties.e2e.ts` "loads the list behind skeleton cards" and `projects.e2e.ts` "loads
  the day sections behind skeleton rows", the empty state by `seed.e2e.ts`, the New Property entry
  by `properties.e2e.ts` "registers a fourth property", the calendar chrome by `projects.e2e.ts`
  "opens on the calendar", the row tap and both project-detail tests by "opens project detail from
  a row", the `+` dialog and its Cancel by "opens the automatic-vs-manual dialog from `+`", and the
  New Manual Project route by "creates a manual project against a registered property". The suite
  went 86 → 76, which is the point.
  What stayed is what the ADR names: the wizards, the expanders, the dismissible cards, `MoreMenu`,
  and every store and mock-resolver test. Two tests moved rather than died — the picker test now
  drives `useProperties` directly, keeping the ADR's own example ("adding a property … becomes
  available to the project form's picker") at the store seam where it belongs, and
  `ManualProjectDialog` got the one test its "don't show this again" tick deserves, since no Detox
  spec ticks it and a checkbox gating a dismissal is the ADR's own example of an in-seam component.
- **More had no loading state, and `useSession` had no consumer.** The tab read `currentUser`
  synchronously out of `@sweep/mocks` while the store that resolves the same user through the
  600–1200ms delay sat unused. More consumes the store now and skeletons the name and email, like
  every other screen.
  **`load()` moved out of `app/_layout.tsx` into the screen.** Firing it at boot is what let the
  store go unnoticed, and it also makes the loading state unobservable: the user is resolved long
  before the tab bar can be tapped, so the skeleton would never be on screen for a human or for
  Detox. Every other screen loads its own data on mount, and `once()` keeps it to one fetch per
  session either way. `more.e2e.ts` gained the unsynchronized-launch spec the other screens use.
- **One load guard, not three.** Five stores repeated `set({loading:true}) → await fetch → set(...)`
  behind three different answers — `loaded || loading`, a delegation to `reload`, and the
  module-level in-flight promise. Only the third is documented (05 above) and only the third
  survives the bug that produced it: a `loading` flag lets the second caller return *before* the
  first has settled, so a seed landing after a `post()` wipes the just-appended row.
  `src/stores/once.ts` is that guard, factored once and applied to properties, projects,
  marketplace, payments and notifications — **and to `useSession`**, which is the same shape and
  would otherwise have been the one store left answering differently.
  Two things stay outside it, deliberately: `useProjects.reload()`, which exists to re-fetch and is
  what the calendar's refresh icon calls, and the `loaded` flags, which are not guards — screens
  read them to tell "empty" from "not loaded yet", and `/project/[id]` and `/search/[id]` redirect
  on them. `resetSeeding()` became `resetLoads()`: one call clears every store's in-flight request,
  and the store test that pinned the original bug is untouched.
- **Four duplications closed.** The "how this works" info row was written twice, in
  `NewSearchWizard` and in `CleanerProfile`, where the comment admitted it — now one
  `HowItWorksRow`, taking the title and the chevron colour each reference sampled for itself, and
  owning its own dismissal so the profile loses a piece of state too. The clock format
  `toLocaleTimeString('en-US', …)` was in three files — now `timeLabel` in `@sweep/ui`, beside
  `DateTimeStamp`, its main caller. `NewPropertyForm`'s `onSave` re-declared twelve fields that are
  already `NewProperty`. And `flush` was copied into three test files; it is `@/testing/flush`.
- **`expo-font` is filed, not fixed** — `.scratch/sweep-hosts-poc/issues/11-declare-expo-font.md`.
  It is imported by `app/_layout.tsx` and resolves as a hoisted peer of `@expo/vector-icons`, but
  adding it needs a full lockfile re-resolve (10 above), which is not a thing to do to a working
  install for one line. It rides the next regeneration.

**Left alone, on purpose:**

- **gluestack-ui v2 is still absent from the app.** It is a real gap against the PRD's stack, but
  retrofitting a component library through every screen is a decision, not a review fix.
- **The "Get $100 credit" pill still hides with the promo card.** Evidenced off screenshots `01`
  and `02` (02 above); the reviewer's finding is answered by the screenshot.
- **`PaymentsHeader` and `MarketplaceHeader` are still two files.** 07 and 05 both recorded why:
  `HeaderBand` is the teal band and centres nothing, and neither header has yet been wanted by a
  third screen. **Superseded by the polish pass**: Payments became a pushed screen and made it the
  fourth, so `MarketplaceHeader` was promoted to `src/navigation/ScreenHeader.tsx` and
  `PaymentsHeader` was deleted.

**Verified on the device, not only in the browser.** `pnpm test` 76 passed across 20 suites;
`pnpm lint` and `pnpm typecheck` (4/4) green; seeded `pnpm e2e:test` **44 passed across 9 suites**
— the 43 that were green before, plus More's new loading spec; and the seed-off pass,
`EXPO_PUBLIC_SEED=false ./scripts/e2e-test.sh e2e/seed.e2e.ts`, still 6/6.

## Polish pass — the eleven changes, and what they overrode

Worked from `.scratch/sweep-hosts-polish/issues/01-polish-pass.md`. Three items overrode the PRD
outright; those lines in `poc/PRD.md` were rewritten rather than left to contradict the code.

- **Every tab carries its label now**, the active one teal and the rest `inkMuted` grey. The PRD
  had inactive tabs muted teal with no label, and `navigation.e2e.ts` asserted "only the active one
  carries its label". Both changed. This is also what broke `more.e2e.ts` on the first device run:
  `by.text('Properties')` started matching the tab label as well as the More menu row, so that
  assertion is now scoped `withAncestor(by.id('more.menu'))`. Worth remembering — every bare
  `by.text` matcher in the suite now competes with five permanent tab labels.
- **Five tabs.** Payments left the bar for a dollar icon in Home's header, so it is a pushed screen
  and wears the shared white header. That made it the fourth screen wanting the shape
  `MarketplaceHeader` had, which is exactly the promotion trigger that component's own comment
  named: it is now `src/navigation/ScreenHeader.tsx`, and `PaymentsHeader` is gone. Ticket 07's
  measured 30px title / 30px icons go with it — a pushed screen wears 18px and 26px like the rest.
- **The mock delay is a flat 500ms**, not the PRD's random 600–1200ms. One line in `resolve.ts`,
  since every mock resolves through it. `MIN_DELAY_MS` and `MAX_DELAY_MS` are both 500 rather than
  renamed, because roughly twenty store and mock tests advance fake timers by one of them.

Three more worth recording:

- **Pull-to-refresh needed a store change, not a `RefreshControl`.** Every `load` sits behind
  `once()`, which answers from the in-flight promise — the gesture would have been a silent no-op
  after the first fetch. Every store now has the shape `useProjects` already had: `reload` does the
  work, `load` is `once(reload)`. The keep-what-was-added-this-session merge that projects,
  properties and marketplace each had a private copy of is now `stores/merge.ts`.
- **The provider tiles skip Skip's confirmation.** Airbnb, Vrbo, Booking.com and TripAdvisor all
  lead where Skip leads, but go straight there: Skip's dialog warns that you cannot accept a
  Marketplace bid *until you sync a calendar*, which is a non-sequitur immediately after picking a
  provider.
- **`Property.image` is a key, not an emoji and not a path.** `src/properties/images.ts` maps it to
  a bundled photograph, so `packages/mocks` keeps no `require()` for Metro to resolve. The three
  photographs are CC0, downloaded into `assets/properties/` at 480px, credited in the README.

### Review fixes

The two-axis review of this branch found one real bug and several tidy-ups:

- **The loading dialog was not held for its second.** The wizard started a 1000ms promise, awaited
  `onSubmit`, then awaited the promise — but `onSubmit` is what navigates, so the screen was gone
  at ~500ms and the remaining wait delayed nothing anybody saw. The wait now lives in
  `app/search/new.tsx` beside the navigation: `Promise.all([post(input), delay(SEARCHING_MS)])`.
  The lesson is general — a minimum-display wait has to sit where the unmount is, not after it.
- **`useRefreshControl` is no longer called inside JSX.** It was `refreshControl={useRefreshControl(…)}`
  on six screens, which is correct today because each has a single unconditional return, but three
  of those screens already branch on `loading` inside the scroll view. The day one of those branches
  moves outward the hook goes conditional and the screen throws on hook order, and
  `eslint-plugin-react-hooks` would not catch it — the call is still lexically inside the component.
  Each screen now declares `const refreshControl = useRefreshControl(…)` at the top.
- **`resolve()` no longer computes a random offset between two equal bounds**, and the test that
  mocked `Math.random` to prove the dead branch stayed dead is gone with it.
- `projects.refresh` was on both the header button and the `RefreshControl`; the gesture is now
  `projects.pull-refresh`.
- `openPayments` and `dayKey` were copied across specs; they live in `e2e/support.ts` now.

## Polish round two — photo upload, Home layout, slower skeletons

Worked from `.scratch/sweep-hosts-polish/issues/02-polish-round-two.md`.

- **An uploaded photo travels inside the property as a `data:` URI.** `expo-image-picker` returns
  base64 directly (`base64: true`), which is what the request asked for and also the only thing
  that works on both targets: there is no server and no file store, and on web the picker's asset
  URI is a blob that dies with the page. `Property.image` therefore holds one of two things now — a
  key into the bundled seed photographs, or a `data:` URI — and `propertyImage()` branches on the
  prefix. The picker downscales hard (`quality: 0.4`) because the whole image is held as text.
- **`expo-image-picker` is a native module, so the dev client needed rebuilding.** The running
  build failed with `Cannot find native module 'ExponentImagePicker'` until `pnpm e2e:build` ran
  again. Its config plugin is in `app.json` with a `photosPermission` string: iOS crashes on the
  permission request without one. Anything that adds native code from here needs the same rebuild
  before the simulator sees it.
- **Skeletons run for a second, once per store per session.** `MIN_DELAY_MS`/`MAX_DELAY_MS` are
  both 1000 now. The "only the first time a tab opens" half needed no code: `once()` already holds
  the first load's promise, so a second visit to a tab has its data. Pull-to-refresh is the
  deliberate exception.
- **The card shadow was too faint, and that is what "no shadow" meant — the page was never
  wrong.** First attempt greyed Home's page and widened its insets to 16px. Both were wrong, and
  decoding the reference screenshot said so: between the cards it samples `#FFFFFF`, and a card's
  left edge sits ~8pt in. Ticket 02's original sampling stands. What is actually different is the
  shadow: straight down from a card's bottom edge the reference darkens to ~205/255 and fades out
  over ~8.5pt, where ours was `0.10` alpha over an 8px blur — invisible against white. The token
  is now `0px 2px 10px rgba(43, 52, 80, 0.38)` — landed by decoding our own screenshot the same
  way and comparing: 0.20 reached only 229/255, 0.38 reaches 206 against the reference's 205,
  over the same ~8.3pt. Home is white with 8px insets again. The
  14px between cards is measured too (~13.6pt) and stays.

  Worth remembering: the screenshot is 924px wide for a 393pt screen, so **2.35 px per point**.
  Every measurement above is a decode of the PNG, not an eyeball.
- **The Quality center card is gone from Home.** Its unit test was doing a second job — guarding
  the `@sweep/ui` hook surface, because a duplicate React under `packages/ui` gives it its own
  copy of the hooks and every one of them throws. That guard now renders `Spinner` directly rather
  than going through a card that no longer exists.

### The cleaner work gallery

- **One shared set of six interiors for every cleaner.** The request allowed it and the alternative
  is eighteen photographs to make the same point. `workPhoto(index)` wraps, so a cleaner with more
  tiles than there are photographs still fills its grid. `cleaner.workPhotos` keeps its emoji: it
  is what sets each grid's *length*, and changing the seed would have rippled into ticket 05's
  tests for no visible gain.
- **The gallery is an overlay, not a `Modal`.** DECISIONS 03 recorded that `Modal` renders nothing
  under jest-expo; a modal here would be untestable at the component seam, which is where swipe,
  arrows and close actually live. Same call `ConfirmDialog` made.
- **The arrows disappear at each end** rather than sitting inert — an inert arrow reads as a bug.
  The counter (`2 / 6`) is what the Detox spec asserts, since it is the one piece of the gallery's
  state that is visible as text.

## Notifications and Messages

- **`read` and `kind` are fields on `Notification`, not a second store.** Unread is what Home's
  bell badges, so it has to be state the list can change; a parallel set of read ids would have
  been a second source of truth for one boolean. `unreadCount(notifications)` is exported beside
  the store rather than derived in Home, so the badge and the row tint agree by construction.
- **A refresh does not un-read the list.** The mock always resolves the seed unread, so
  `reload` carries the read ids over the fetch. Without it, marking all read and then pulling to
  refresh on Home brought the badge straight back — a bug the store test now pins.
- **The invitation notification is a `handshake`, not an `alert`.** The ticket left the third
  row's icon open. A team joining up reads like a bid being agreed, and the alert triangle is
  worth keeping for the one row that is actually a warning: the unassigned project.
- **The notification rows are inert, chevron and all.** The reference draws a chevron on every
  row, but there is nowhere in the PoC for any of them to go. They render as shown and do
  nothing — the same call `BidCard`'s chat button and the Payments filter made.
- **Messages reads `useMarketplace`; a conversation *is* a bid.** No message store exists,
  nothing ever sends, and every reference state is "No messages yet." — so a store for it would
  hold nothing. The chat is addressed by **bid id**, like `/cleaner/[id]`, because the whole
  `Cleaner` rides on the `Bid` and the search supplies the property alias.
- **With no bids, Messages shows the Marketplace's own empty state.** The ticket asked for its
  wording; `EmptySearches` *is* that wording, so it is rendered rather than transcribed. Its
  "Find Your Next Cleaner" button sits above the two pinned ones, which reads fine because both
  routes go to the same place.
- **"Bid Details" pushes the cleaner detail rather than sitting inert.** The ticket allowed
  either. That screen is the bid's details, it is addressed by the same id, and the route
  already exists — inert would have been more code to do less.
- **The bid strip's price and expiry are two points down from the reference.** The reference
  sets that row in a narrower typeface than the system one; at matching sizes "$100.00 per
  project" and "Bid expires in: 2 days" do not both fit across 390pt — the price wrapped, which
  pushed the rules card below the fold, and forcing one line clipped the expiry instead. 17px
  and 15px fit. This is the same reference-vs-system-font gap DECISIONS records elsewhere.
- **`$100.00` has cents here, and now so does everywhere else.** The ticket allowed matching the
  reference "if it is free". It was cheaper than free: `PaymentList` and `CleanerProfile` had
  each written the same `toLocaleString` line, so the third caller became `usd` in `@sweep/ui`
  and the other two now import it. `relativeLabel` came out of `SearchCard`'s `createdLabel` the
  same way — the notifications stamp needed "3 hours ago" without the "Created " in front.
- **`PinnedFooter` clears the home indicator.** Messages' two buttons, the chat's "I agree" and
  its composer are all pinned to the bottom of a **pushed** screen, which has no tab bar to hold
  the indicator off. First render put "Invite Teammates" underneath it. One component now does
  what `TabBar` was already doing, in the three places that need it.
- **The chat agreement is component state, deliberately.** Per-conversation and in-memory is
  what the ticket asked for, so `ChatBody`'s `useState` *is* the feature: leaving the screen and
  coming back may show the rules again, and nothing persists.
- **Messages pushes outside `(tabs)`, so its tab bar does not show.** The reference keeps it.
  Following the `/payments` precedent, as the ticket directed; on the simulator it looks right.

### Review fixes

The two-axis review caught one real bug and five smaller things:

- **Messages showed the Marketplace empty state while the searches were still loading.** The
  screen read `searches` but not `loaded`, so a cold open rendered the full "Find a New Cleaner"
  illustration for the mock's 600–1200ms and then swapped to the bid rows. An empty store is
  "not yet", not "no bids". `MessageList` now takes `loading` and renders skeleton rows, and the
  Detox spec asserts the skeleton *and* that the empty state is absent behind it — which is the
  assertion that would have caught this in the first place.
- **The borrowed empty state no longer ships its own CTA.** Rendering `EmptySearches` whole put a
  live "Find Your Next Cleaner" → `/search/new` on Messages, a third navigation the ticket did
  not ask for next to its two pinned buttons. `onFindCleaner` is now optional; Messages passes
  none and gets the wording without the button.
- **The Detox scroll matcher went back to `by.text`.** Two call sites scrolled `whileElement`
  toward `by.id('home.notifications-card')` — a container packed with content, which never
  reaches the 75% threshold. It passed, but it is the exact shape DECISIONS 02 recorded as a
  flake, so it scrolls to a notification's text instead.
- **The empty `<View testID="…unread" />` is gone.** It existed only so a test could assert the
  mint tint, and ADR-0001 keeps layout out of both seams. The behaviour worth pinning is that
  the badge empties, which the store test and the Detox round trip already cover.
- **`await flush()` after every `fireEvent`**, per DECISIONS 03 — the rule is written blanket,
  and four presses were relying on asserting a spy rather than a re-render.
- Smaller: `RULES[].body` is a `ReactNode` rather than a string-or-tuple union, which deletes the
  branch in `Rule`; `CleanerAvatar` is exported from `MessageList` rather than written twice
  byte-for-byte; `PinnedFooter` lost a `testID` prop no call site passed; the composer assertions
  use RNTL's `toHaveProp` rather than reaching into `.props`.

Not changed, deliberately: the `usd`/`relativeLabel` extractions touch `PaymentList`,
`CleanerProfile` and `SearchCard`, which the spec axis flagged as reach. They replace three and
two existing copies of the same line rather than adding a fourth, and the alternative was a
private formatter on a screen whose sibling already had one.

### Type scale, measured off the references

A follow-up pass after testing on the simulator. The chat screens were sized by eye and came out
consistently ~15% large; the type is now decoded from the reference PNGs rather than guessed.

**Method.** Both the references (1170×2532) and our simulator shots (1179×2556) are 3×, so glyph
pixels compare directly. For each line, the **cap height of the same first capital** is measured in
both and the ratio applied to the size we set — cap height is what the eye reads as "text size",
and unlike an ink-run it does not move with which glyphs happen to fall in the crop. Wrapped body
copy is checked on **line pitch** instead. `poc/screenshots/17` is a downscaled JPEG (768 wide), so
every reading there is normalised by 1170/768 **and** sanity-checked against an unchanged shared
`Button` label as a control — that control reads 1.06 rather than 1.00, which is the noise floor
for that screenshot and why only differences past ~1.5pt were acted on there.

`IMG_0032`/`IMG_0033` after the change: every ratio lands 0.94–1.02, and the rule body and info
line match the reference's 38px ink over a 60px pitch exactly.

- **The chat's own scale**: header name 19→17, "Last seen" 17→15, property alias 19→17, price
  17→15, expiry label and value 15→14, card heading 24→20, rule titles 19→17, rule bodies
  17→14/20, the info line 17→14/20, the orange card's title 24→20 and its body 17→16/24, "Set up
  my account" 19→16, the composer 17→16. Icons came down with them (26→24, 30→26, 22→20, 20→18).
- **The rule bodies are grey, not ink.** Sampling the reference's glyph cores: headings and
  labels are #334465 (our `ink`), but the rule bodies are #707070 and "Last seen" is #999999 —
  two distinct greys, which map onto `slate` and `inkMuted`. Ours had both at `ink`.
- **The orange card's body is deliberately larger than the rule bodies** — 44px of ink per line
  against the rules' 38 — so it is 16px where they are 14px.
- **Button labels were already right.** "Bid Details" and "I agree" both measure 1.00 against the
  reference, because they come from the shared `Button` (16px), which an earlier ticket measured.
  That is the tell: everything hand-sized was large, everything measured was correct.

**Cleaner detail** (`poc/screenshots/17`), reached from the chat's "Bid Details": name 19→17,
info rows 17→16, the rating line 15→14, "Reviews" 19→17, "is also a Rental Handy Pro" 17→14, and
`HowItWorksRow`'s title 17→14 — which is what made "How Adding a Cleaner to My Team Works" wrap to
two lines where the reference fits it on one. That row is shared with the search wizard's step 1,
which moves with it.

**Left alone, deliberately:** `ScreenHeader`'s 18px title and `SectionHeader`'s 19px. Both are
shared primitives — the header by six pushed screens, the section title by Home's cards — and the
evidence does not support changing them: `IMG_0031` measures the header at 17.6, i.e. the 18 it
already is, and the three references disagree with each other by more than the gap. A global type
pass is its own ticket, not a side effect of this one.

**Also:** the notifications search grew a clear button, `close-circle` at 20px in `inkMuted`, the
same control the Properties search uses. It appears as soon as anything is typed, because this
search filters as you type rather than on submit. Its Detox spec caught a real bug on the way in —
without `keyboardShouldPersistTaps="handled"` on the screen's `ScrollView`, the first tap while
the keyboard is up is spent dismissing it and the button never fires.

### The app-wide type sweep

Three new reference screenshots landed in `poc/screenshots/4/` and prompted a sweep. Method as
before: normalise the reference to 1170-space, then compare ink bounding boxes of the *same*
string, with a control string whose size is already known to calibrate the reference's own
downscale. What the sweep found, screen by screen:

- **Projects.** "Sep 26" is regular weight in the reference, not bold, and 0.72 the height —
  26px bold became 19px regular. Month title 22→17, weekdays 17→13, day numbers 22→16, section
  labels 17→14, header icons 30/26→24/22.
- **The calendar's project card is a different component from Home's row.** The reference gives
  it alias, Start/End lines, the project id and a chip strip, with a mint bar down the left; Home
  keeps the compact avatar row. `ProjectRow`'s docstring claimed they were one card "so they do
  not drift" — the reference says they were never the same card. `ProjectCard` is the new one.
- **Project detail.** Everything down a step or two (26→22 title, 26→20 times, 19→15 pills and
  detail rows, 17→13 time labels), icons with them. The times card is square where it meets the
  mint band and rounds ~3px at the bottom — measured by walking the reference's corner pixel by
  pixel, which gave a 4–5px arc against our 8px radius. The Cleaning band is `mintBand`, not
  `primaryMuted`. "Still Unassigned" takes the warning triangle, not a filled circle.
- **Dialogs.** The Automatic-vs-Manual dialog was a third too large: 26→19 title, 20→16 body and
  buttons, leading 30→24. `ConfirmDialog` had the same shape and got the same treatment.
- **Marketplace searches.** The card's "Created …" line runs the full width beneath the alias row
  rather than indented beside it — the shape Home's Cleaner Search card already had. Alias 20→18,
  created 15→14, "Search Summary" 17→16, house icon 44→48.
- **More.** Only the name was out: 28→24. The email and the menu rows already measured right.
- **New Manual Project.** Uniformly ~0.82: title 22→18, Cancel 20→16, section labels 17→14, rows
  19→16.
- **Bids list.** Only the segmented tabs were out, 17→15; the header and the bid cards measure
  right.

**Measured and left alone**, because the evidence says they are already correct: `ScreenHeader`'s
18px title (`IMG_0031` and reference 17 both land on it), the Properties list (its title measures
1.05 — if anything ours is a hair small), `Button`, `Checkbox` and the payment rows. The pattern
across the whole sweep is the same one the chat screens showed: **type that was set by eye is
large, type that was measured against a reference is right.**

**Not swept:** the cleaner-search wizard, the Congrats screen, the property forms and the
marketplace empty state. They were not in the report and were left rather than adjusted blind.
