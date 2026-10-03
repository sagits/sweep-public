# Sweep Hosts — Universal App PoC

## Tech Stack

- **Expo** (latest SDK) + **Expo Router** (file-based routing, typed routes)
- **TypeScript** (strict)
- **gluestack-ui v2** + **NativeWind** — universal components, responsive breakpoints
- **Zustand** — all app state (properties, projects, cleaner searches, bids)
- **React Native Web** — same source ships to the browser
- **Turborepo** monorepo (pnpm workspaces)
- **Detox** — end-to-end tests, one suite per feature
- Mock data only. No backend, no API calls, no auth. Every async operation is a `setTimeout`

**Build targets**
- Simulator: `pnpm dev` → iOS and Android
- Web: `pnpm build:web` → static `dist/`, deployable to Vercel
- `app.json`: `web.bundler = "metro"`, `web.output = "static"`

### Monorepo structure

One app today, room for the cleaner app tomorrow. The split exists so a second app can be added later and reuse everything under `packages/`.

```
apps/
  host/                 # the Sweep Hosts app (this PoC)
packages/
  ui/                   # gluestack theme, tokens, shared components
  mocks/                # mock data + delayed async resolvers
  types/                # shared domain types (Property, Project, Cleaner, Bid)
  config/               # shared tsconfig, eslint, tailwind/nativewind preset
```

Anything not specific to the host role goes in `packages/`. Screens, host-only navigation and host-only stores stay in `apps/host/`. Turbo pipelines: `dev`, `build`, `build:web`, `lint`, `typecheck`, `e2e:build`, `e2e:test`.

---

## Overview

**Sweep Hosts** is a visual clone of the Turno Hosts iOS app, rebuilt under its own name. Turno ships two apps, a host app and a cleaner app; this is the **host** app. A host registers a property, creates a cleaning project for it, posts a search to the Marketplace, receives bids from cleaners, and reviews each cleaner's profile.

The goal is a portfolio demo, not a product. It must match the reference screenshots closely, run in the iOS simulator, and run in a browser from the same source with no separate web layout.

**No sign in / sign up.** The app boots straight into the logged-in state with a hardcoded user (Renato Probst, renatopprobst@gmail.com).

### Naming

The product is **Sweep Hosts**, shortened to **Sweep** in the UI. Nothing anywhere carries the Turno name or logo.

| Where | Value |
|---|---|
| Repo / root package | `sweep-hosts` |
| `app.json` → `name` | `Sweep Hosts` |
| `app.json` → `slug` | `sweep-hosts` |
| Bundle id / package | `com.renatoprobst.sweephosts` |
| Header wordmark | `Sweep` |
| Web `<title>` | `Sweep Hosts` |

Turno is named only in the README, in one paragraph stating that this is an architecture and UI study inspired by the Turno Hosts app, built for a portfolio, with no affiliation or endorsement. Screenshot filenames may keep their descriptive names; they are reference material, not shipped assets.

### Layout fidelity

Match the reference screenshots exactly: spacing, type scale, colors, icons, copy, empty states. Where a control is disproportionately expensive to replicate (a native date-time picker, a Google Places autocomplete, a multi-step wizard input), ship a simplified version — but build it out of the same design system so it still reads as the same app. Never fall back to unstyled defaults.

### Seed data

The app boots with content already in it, so nobody has to register anything to see the product. On first launch the stores are seeded with:

- **3 properties**, each with its own alias, address, bedroom/bed/bathroom counts, unit size and image
- **1 project per property** (3 total), spread across the next few days on the calendar so the Projects list is not all on one day. Vary the status: one unassigned, one assigned to a cleaner, one scheduled further out
- **1 open Marketplace search per property** (3 total), each with its own bids. At least one search carries the three seeded cleaners (Ramona, Jairo, Aurea) so the bid list and cleaner detail have something to show

Home therefore opens populated: Cleaner Search (3), three project rows, and notifications. The user can still add a fourth property, project or search through the normal flows, and everything they create is appended to the seeded data.

Empty states stay implemented for every list — they are just not the initial state. They should be reachable by clearing the seed (a dev toggle, or a `SEED=false` flag) so they can still be demoed and tested.

### Loading states

Every screen shows a loading state before content. Mock modules resolve after an artificial delay of **500ms** (originally a random 600–1200ms window; the polish pass fixed it flat so every skeleton shows for the same half second and the Detox specs stop racing a random number). Use **skeleton placeholders** for lists and cards, and **spinners** for full-screen loads and button actions. The real app leans on a teal starburst spinner and full-screen "Loading…" headers — reproduce that feel. This is central to the demo, not an afterthought.

---

## Reference screenshots

**The app must be built to match these screenshots.** They are the specification for layout, not inspiration: every screen below is expected to reproduce its reference in structure, spacing, type scale, colors, icons and copy. Each feature in the Features section lists the screenshot numbers it maps to (for example `→ 14`, `15`, `16`), and those numbers are the source of truth for how that screen looks. Where the PRD text and a screenshot disagree, follow the screenshot and flag the conflict.

In `screenshots/`, numbered in flow order. Screens `24`–`29` are prefixed `webview-` because in the real app they live in an embedded webview (a different visual language — a web header with hamburger and avatar). **In this PoC those become native screens** in the app's own design system.

`screenshots/legacy-appstore-2019/` holds old App Store shots under the previous "TurnoverBnB" branding. Reference only for screens not covered above; the current design wins on any conflict.

---

## Design

- Primary teal **`#37D3B1`**, used for the header band, primary buttons and links (this line first said "around `#22C99C` / `#00C1AF`"; decoding screenshot `03` shows one flat `#37D3B1`, and the screenshot wins)
- Dark navy text (~`#2B3450`), light gray page background (~`#F1F2F6`), white cards with soft shadows and ~8px radius
- Rounded, friendly sans-serif; generous line height
- Destructive actions in red outline ("Reject Bid")
- Light theme only

---

## Navigation

Bottom tab bar, **5 tabs**: Home, Projects, Marketplace, Properties, More. (Originally 6: the polish pass took Payments off the bar and put it behind a dollar icon in Home's header.)

> The real app has 5 tabs (Home, Projects, Marketplace, Payments, More) and reaches Properties through the More menu. This PoC promotes **Properties** to its own tab.

- Icons: house, calendar, handshake, building, profile (the polish pass dropped the credit-card tab and swapped More's three dots for a profile icon)
- Every tab carries its label: the active one is teal, the rest grey (`inkMuted`). (Originally: active teal with a label, inactive muted teal with no label — changed by the polish pass.)
- On web at the `md` breakpoint and above, the tab bar becomes a left sidebar and content is centered with a max width

---

## Features

### Home  → `01`, `02`, `03`

Teal header: "Sweep" wordmark, a blue "Get $100 credit" pill, a bell with badge count, a messages icon.

Stacked cards over the header band:
- **Search for New Cleaners** — title + "Search on our Marketplace for local, reliable cleaners". Navigates to Marketplace
- Once at least one search exists, this card is replaced by **Cleaner Search (N)** with a "See all" link, a search row (house icon, property alias, "Created a minute ago", chevron), a teal "N Bids" chip, and a "Find new cleaners" button
- **Invite Current Teammates** — title + subtitle. Does nothing
- **Invite a Host and get $100 in Credits** — blue promo card with a megaphone, body copy, a white "Get $100 Credit" button and a "Don't show this anymore" checkbox. Dismissible
- **Projects** — "See all" link. Empty: "There are no projects right now." Populated: rows with avatar placeholder, cleaner name or "Unassigned", property alias, date and time on the right. Tapping a row opens Project detail
- **Notifications** — "See all". Empty: "There are no notifications right now." Populated: message text on the left, date and time on the right
- **Quality center** — card that stays in a spinner state

### Projects → `04`, `05`, `06`, `07`, `08`, `09`

**List (calendar)**
- Header: date label on the left, then add (+), filter, and refresh icons
- Month navigator: `‹ September 2026 ›`
- Weekday row Sun–Sat, then the week's day numbers; selected day in a dark rounded square; a drag handle below to expand into month view
- Below it a scrolling list of day sections ("Today - Wed, Sep 9 2026", "Tomorrow - Thu, Sep 10 2026", "Fri, Sep 11 2026", …), each holding that day's project rows
- Skeleton rows while loading

**Add project**
- The + opens an alert: **"Automatic vs. Manual Projects"** with body copy, a teal "Create Manual Project" action, "Cancel", and a "Don't show this message again" checkbox

**New Manual Project** (modal, "Cancel" left, title centered)
- *Project and Property*: Select Project Type (→ Cleaning), Select property (→ picker over registered properties), Project Name (optional, default "Manual Project")
- *Payment*: Price radio group — "Teammate rate for the property" / "Custom Price"
- *Project Details*: Frequency (→ Single), Start date & time, End Date & Time, "Guest arrives same day" toggle
- *About the Cleaning*: "Restrict to specific teammates" toggle, Checklist row (→ Default Checklist)
- Sticky footer: "Visible" toggle + teal "Add manual project" button
- Date and time pickers can be simplified to a small styled list of preset options
- Submitting shows a spinner in the button, waits, then returns to Home with the new project in the Projects card

**Project detail** → `09`
- Teal header: back, "Project #38261465", overflow (…)
- Property name, "Unassigned Project" subtitle
- A light teal band with a "Cleaning" pill
- White card: Start time / End time, each with time above and date below
- A column of status pills: "Manual Project" (star), "Still Unassigned - Due 24h" (warning), "Visible to teammates" (eye), "No available teammates for this project" (alert)
- Detail rows with icons and chevrons: Project History ("Project created"), address, Property Problems (0), Checklist (0/26 done), Inventory (0), Project name, Private Notes
- Full-screen spinner under a teal "Project #…" header while loading

### Marketplace → `10`, `11`, `12`, `13`, `14`, `15`, `16`, `21`

**Empty state**
- Header "Marketplace searches" with search and + icons
- Segmented control: Open / Closed
- Handshake illustration, "Find a New Cleaner on the Sweep Marketplace", body copy, two stats side by side ("55,000+ Cleaners Globally", "4.8M+ Cleaning Projects Completed"), teal "Find Your Next Cleaner" button

**Searches list** → `21`
- Same header and segmented control
- "You currently have 1 open search." then a card per search: house icon, property alias, "Created a minute ago", and a "Search Summary" expander

**New Cleaner Search** (wizard, back arrow + progress bar)
1. **Confirm the Property Details** → `11` — an info row "How the Sweep Marketplace works" with a "Don't show this message again" checkbox, then read-only Property Address, "I can't find my address" checkbox, Unit #, and dropdowns for Bedrooms / Beds / Bathrooms, Unit Size with a sq. ft. / sq. mt. segmented toggle. Footer button "Next: Describe your cleaning needs"
2. **Describe your cleaning needs** → `12` — a textarea with placeholder "Explain how you want the cleaning to be done on your property.", a checked "Save this text for future notes" checkbox, and a gray warning block about not including personal information. Footer button "Find cleaners"
3. Submitting shows a **teal "Congrats! 🎉" overlay** → `13` and a spinner in the button, then lands on the bids list

**Cleaner bids** → `14`, `15`, `16`
- Header: back, property alias, a teal circular close (X)
- Segmented control: "New cleaner bids" / "Accepted bids"
- Two dismissible info banners: "You don't have a payment method!" and "To add a calendar, select your booking platform"
- Bid cards: square photo, name, teal "Super Cleaner" pill, an "is also a Rental Handy Pro" line with a tools icon, star rating + score + review count, "$100 per project", "Chat to confirm availability", chevron. A footer strip with "Expires in 2 days" and a purple background-check shield
- Seed with three: **Ramona** 4.8 / 22 reviews / $100, **Jairo** 4.6 / 191 reviews / $125, **Aurea** 5.0 / 11 reviews / $150
- Below the list, a **"While you wait"** card: body copy plus a checklist where done items are checked and struck through (Take a tour ✓, Request a Demo, Link your Airbnb/PMS, Add a payment method, Add a checklist to your property ✓), and a "Don't show this card again" checkbox
- Skeleton cards while loading

**Cleaner detail** → `17`, `18`, `19`, `20`
- Header: back, property alias
- A pinned summary row: photo, name, "Super Cleaner" pill, star + rating + review count, clock + "Expires in 2 days", and a **teal circular chat button** on the right
- A pinned "is also a Rental Handy Pro" row with chevron
- Scrolling body: "How Adding a Cleaner to My Team Works" info row; **Information** card (Completed Projects, Location, Distance, Member Since); **Message from Cleaner** with a quote glyph and a Show/Hide expander; **Badges** (purple shield, "Background Checked"); **Reviews** row with rating and chevron; **Rental Handy Pro** section; **Photos of {name}'s work** — a 3-column grid of before/after thumbnails
- Sticky footer: a bordered price card ("$100.00", "per Project + Fees", "Cleaner Bid", a "More ⌄" expander), then a teal **"Accept Bid and Add to My Team"** button and a red-outlined **"Reject Bid"** button
- **The chat, Accept and Reject buttons render exactly as shown but do nothing on tap.**

### Payments → `22`

- Header "Payment History" with filter and search icons
- The real app shows an empty state ("You don't have any payment history yet." with a folder illustration). **This PoC ships it populated instead** — a short list of completed payments with cleaner name, property, date, amount and a status pill ("Paid"). Keep the empty state implemented for when the list is cleared

### Properties → `24`, `25`, `26`, `27`, `28`, `29`

In the real app this is a **webview** reached from the profile menu. **In this PoC it is a native tab**, rebuilt in the app's design system.

**List**
- Title "Properties" with a house icon
- A search field with a teal search button
- "Show 5 properties" dropdown
- Teal **"New Property"** button
- "You have N properties", an "Edit property groups" link, a "Show sub-units grouped" checkbox
- Property cards: house thumbnail, alias in teal, an icon row (bedrooms, beds, bathrooms, unit size), the address, a "Teammate: Add teammates" line, and an overflow (⋮) button
- Skeleton cards while loading

**New Property** (native form, replaces the webview wizard)
- Step 0 — **Reservations Calendar**: a grid of provider tiles (Airbnb, Vrbo/HomeAway, Booking.com, TripAdvisor) plus "Next" and "Skip". Choosing Skip opens the confirm alert **"Are you sure? — Keep in mind that you will not be able to accept a bid from a Marketplace teammate until you sync a calendar."** with Yes / No. **Only the manual path is implemented**: the provider tiles are visible but inert; Skip → Yes is the path forward
- Step 1 — **Name, address and details**: an "Adding Properties" info row; **Property Address — a read-only field with a fixed value** (`Los Angeles, CA 90001, USA`) so there is no address API; an "I can't find my address" checkbox; "Unit #, Building Name, etc"; "Alias"; "Currency" dropdown; a dashed "Tap to upload an image" tile (inert or local image picker)
- Step 2 — **Details and times**: Bedroom(s), Bed(s), Bathroom(s) dropdowns; Unit Size with a sq. ft. / sq. mt. toggle and an "I don't know the Unit Size" checkbox; Checkout time and Check-in time; Property Description with a `0 / 1000` counter
- Footer: teal **"Save Property"** and a "‹ Back" link
- Saving shows a spinner in the button, then returns to the list with the new property in it

### More (profile) → `23`

- Teal header: help (?) on the left, settings gear and logout icon on the right
- Avatar with an edit badge, name, email
- A white card of menu rows, each with an icon: Properties, Property Problems, Quality center, Checklists, Inventories, My Teammates, My co-hosts, Guest Checkout Feedback, Guest Center, Host Services
- Footer: "Check for updates" link and a version label (`v1.44.3`)
- **Every menu row renders but does nothing on tap**, except Properties, which can route to the Properties tab

---

## End-to-end tests (Detox)

Every feature ships with a Detox suite. Detox drives the native build only — the web target is verified by a clean `build:web`, not by Detox.

- Detox needs a native project, so it runs against a dev client. Use **Continuous Native Generation**: do not commit `ios/` or `android/` — `pnpm e2e:build` runs `expo prebuild --clean` and builds the dev client on demand, and `.gitignore` keeps the generated folders out of the repo
- Keep the app free of custom native modules so the JS bundle still runs in Expo Go. Detox's native setup lives only in the generated dev-client build and must not leak into what gets distributed
- Add `testID` to every element a test touches. Name them by screen and role: `home.cleaner-search-card`, `projects.add-button`, `property-form.save`, `bid-card.ramona`, `cleaner-detail.accept-bid`
- The artificial 500ms delay makes loading states testable: assert the skeleton or spinner is visible, then `waitFor` the loaded content. Do not add arbitrary sleeps
- Each spec starts from a clean app launch (`device.launchApp({ delete: true })`) and builds its own state through the UI

One spec per feature, in `apps/host/e2e/`:

| Spec | Covers |
|---|---|
| `navigation.e2e.ts` | All 5 tabs render and switch; every tab labelled, active tab styling; Payments reached from Home |
| `seed.e2e.ts` | On a clean launch: 3 properties, 3 projects, 3 open searches; with the seed disabled, every list shows its empty state |
| `home.e2e.ts` | Seeded Cleaner Search / Projects / Notifications cards; promo card dismissal; skeletons on mount |
| `properties.e2e.ts` | List loads; New Property → skip calendar (confirm alert) → fill form → save → new card appears in the list |
| `projects.e2e.ts` | Calendar renders; + opens the manual/automatic dialog; New Manual Project form → submit → project shows on Home; open Project detail and assert its pills and rows |
| `marketplace.e2e.ts` | Three open searches listed → cleaner search wizard both steps → Congrats overlay → a fourth search → three bid cards with the seeded names and prices |
| `cleaner-detail.e2e.ts` | Open a bid → all sections render → Accept, Reject and chat are present and tapping them changes nothing |
| `payments.e2e.ts` | Payment History list renders with paid rows |
| `more.e2e.ts` | Profile header, all ten menu rows, version label; rows are inert except Properties |

## Development environment

The machine this runs on is already provisioned. Do not re-install or upgrade any of it.

| Tool | Version | Note |
|---|---|---|
| Xcode | 16.4 | License accepted |
| CocoaPods | 1.16.2 | Prints a harmless UTF-8 warning |
| Node | 22.22.2 | via nvm |
| pnpm | 12.3.4 | via corepack |
| applesimutils | 0.9.12 | Required by Detox for iOS |
| watchman | installed | |

**iOS only.** There is no Android SDK and no `ANDROID_HOME` on this machine. Leave Android out of `.detoxrc.js` entirely — the Android APK for distribution is built by EAS in the cloud and needs nothing locally.

**The only available simulator is `iPhone 16`.** Use that exact device name in `.detoxrc.js`. Do not assume an iPhone 15 Pro or 17 Pro exists; verify with `xcrun simctl list devices available` before writing the config.

### Working autonomously

This PRD is handed to an agent that builds the whole thing in one pass. There is nobody available to answer questions mid-build.

- **Do not ask questions.** Where the PRD leaves something open, pick the sensible default, note the choice in a `DECISIONS.md` at the repo root, and keep going
- **Never run a native build in the foreground.** `expo prebuild` and the Detox dev-client build take 10–20 minutes and will hit the shell timeout. Run them in the background and poll the log. A timeout is not a build failure — check the log before concluding anything
- **Close the loop per feature**, not at the end: implement the feature → run its Detox spec → fix → only then move to the next one. `e2e:build` only needs to re-run when something native changes; `e2e:test` runs every time
- If a step genuinely cannot proceed, finish every other feature first and report what was left out and why

## Running it

**Everything runs locally. Do not use EAS, and never run a command that requires logging in to an Expo, Apple or Google account.** If a step seems to need one, it is the wrong step.

| What | Command | Notes |
|---|---|---|
| App in the iOS simulator | `pnpm dev` | Metro + simulator |
| Detox dev client | `pnpm e2e:build` | Local `xcodebuild`, simulator SDK. Unsigned, so no Apple account |
| Detox suites | `pnpm e2e:test` | Against the dev client above |
| Web build | `pnpm build:web` | Static `dist/` |
| Web smoke check | `npx serve dist` | Verify it actually runs in a browser |

The dev client exists only to run Detox. Nothing is published from this repo.

### Web verification (final step)

A clean `pnpm build:web` is not proof the web target works — it only proves it compiled. Once every feature is done, build the web output, serve it locally and open it in a browser:

- Home renders with the seeded data (3 searches, 3 projects), not a blank page or an error boundary
- All 5 tabs navigate, and deep links work (loading `/projects` directly must render the Projects screen, not a 404 — this is what `web.output: "static"` is for)
- The cleaner search wizard and the property form are usable with a mouse and keyboard
- At desktop width the tab bar becomes the left sidebar and content is centered
- The browser console is free of errors and of React Native Web warnings about unsupported props

Fix whatever this surfaces. Web-specific problems are expected here: shadows, `pointerEvents`, gesture handlers and fixed positioning are the usual offenders. Record every `.web.tsx` file that ends up existing, and why, in the README.

Deployment to Vercel is done manually afterwards and is not part of this build. An Android APK would need EAS and is out of scope too. Keep the app free of custom native modules regardless — it is what keeps the Expo Go path open if the app is ever shared.

## Notes for the implementer

- Shared code goes in `packages/`, host-specific code in `apps/host/`. The test of whether something belongs in `packages/ui` or `packages/mocks`: would the cleaner app want it too?
- Prefer gluestack-ui primitives (`Box`, `VStack`, `HStack`, `Text`, `Button`, `Skeleton`, `Spinner`, `Actionsheet`, `AlertDialog`, `Checkbox`, `Switch`, `Select`) over raw React Native views, so the web output stays consistent
- Mock data lives in `packages/mocks`, exposed through async functions that resolve after a delay, so swapping in a real API later is a one-file change
- One Zustand store per domain (`useProperties`, `useProjects`, `useMarketplace`), each with its own `loading` flag driving the skeletons
- State persists in memory for the session. Creating a property, then a project, then a search must flow end to end and update Home
- Use `.web.tsx` platform files only where a native module has no web equivalent. Keep a running list of them for the README
- Use `useWindowDimensions` or NativeWind breakpoints for responsive layout. Do not build a second web layout
- The app must build clean for web (`pnpm build:web`) and pass its Detox suites before it is considered done

## Scope

**Build first:** tab navigation, Home, Properties (list + new property), Projects (calendar + new manual project + detail), Marketplace (empty → search wizard → bids list → cleaner detail).

**After that:** Payments, More, the promo and "While you wait" cards, and polish. Each feature lands with its Detox spec, not in a separate testing pass at the end.

The demo flow that has to work start to finish, on top of the seeded data: **add a property → create a manual project → run a cleaner search → see three bids → open a cleaner's profile.**
