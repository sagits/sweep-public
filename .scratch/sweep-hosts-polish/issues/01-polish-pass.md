# 01: Polish pass — navigation, loading, and the property/search flows

**What to build:** Eleven small changes across the shipped PoC, requested after seeing it run. They
are independent of each other; work them in any order that keeps the suite green. The verbatim
request is in `../FEATURES.md` — read it if any criterion below reads ambiguously.

**Blocked by:** None — the `sweep-hosts-poc` branch is merged and green (86 unit tests, Detox 43/43
seeded and 6/6 seed-off).

**Status:** ready-for-agent

## Three of these override the PRD

The PRD and the original tickets are no longer the authority on these points; this ticket is. Each
needs its spec line, its Detox assertion and `DECISIONS.md` updated to match, not worked around:

1. **Inactive tabs get labels.** PRD Navigation says "inactive tabs are muted teal with no label",
   and `navigation.e2e.ts` asserts "only the active one carries its label". Now every tab carries
   its label; the unselected ones are grey.
2. **Five tabs, not six.** PRD Navigation and ticket 01 both specify six. Payments leaves the tab
   bar and is reached from Home instead.
3. **Skeletons show for 0.5s.** PRD "Loading states" specifies a 600–1200ms mock delay. The
   skeleton window is now a flat 500ms. Decide deliberately whether `MIN_DELAY_MS`/`MAX_DELAY_MS`
   in `packages/mocks/src/resolve.ts` change or whether only the skeleton timing does, and record
   which — `DECISIONS.md` documents a Detox spec that observes a skeleton by launching
   unsynchronized, and it depends on this timing.

## Acceptance criteria

- [ ] Unselected tab icons **and** labels render in the app's grey — use `inkMuted` (`#8A90A2`)
      from `packages/ui/tokens.js` unless a better-matching token already exists; do not introduce
      a new hex. The active tab stays teal. `apps/host/src/navigation/TabBar.tsx:38` currently
      picks `primaryMuted` and renders the label only when focused
- [ ] The More tab uses a profile icon (a person, not three dots)
- [ ] Home, Projects, Marketplace, Payments and Properties each show skeleton placeholders while
      their store loads, for **0.5s**, using the existing `Skeleton` from `@sweep/ui`. Screens that
      already have skeletons keep them — this is about coverage and timing being uniform, not about
      re-inventing them
- [ ] Every tab supports pull-to-refresh, and refreshing genuinely re-runs that screen's store load
      rather than faking a delay
- [ ] The Congrats overlay after posting a cleaner search is replaced by a **centred alert dialog
      over a dimmed scrim**, shaped like `../loading-dialog-reference.png`: a white rounded card
      in the middle of the screen, a large element centred at the top, text beneath it. Take the
      *shape* from that reference, not its colours — it is a generic React Native alert and its
      blue/red are not ours. Ours is: `Spinner` (teal, `@sweep/ui`) where the reference puts the
      circular icon, title "Loading", subtitle "Searching for cleaners", and **no button at all**
      — the card ends after the subtitle. Card radius, shadow, type scale and ink colour come from
      the design system like every other surface. It shows for 1s, then navigates to that search's
      bids screen. It replaces the Congrats overlay of `poc/screenshots/13-cleaner-search-congrats.jpg`,
      so that screenshot no longer describes this flow
- [ ] On the Projects tab, a day with no scheduled cleanings renders an empty line beneath its date
      so consecutive empty dates are visually separated. The line carries the same horizontal
      padding as a date that has cards
- [ ] The Payments header's title font size and icon sizes match the other screens' headers.
      `DECISIONS.md` §07 records that this screen was deliberately given the app's largest type
      (title 30px, empty sentence 36px/44px) measured off screenshot 22 — that decision is being
      reversed here, so update it rather than leaving the file contradicting the code
- [ ] The three seeded properties use real house photographs, downloaded into the repo (not hotlinked).
      Use permissively licensed images (Unsplash/Pexels or similar), keep them small, and record the
      source and licence for each in the README
- [ ] In New Property, the Airbnb and other provider tiles are tappable and all lead to the same
      manual-registration screen the Skip button leads to. They are currently inert by ticket 03's
      design
- [ ] Payments is removed from the tab bar; a dollar-sign icon in Home's header opens the Payment
      History screen. The screen itself stays reachable and unchanged otherwise
- [ ] Tests updated, not deleted: every behaviour above is covered. Prefer editing the existing test
      that owns the behaviour; add a new one only where no existing test fits. Per
      `docs/adr/0001-testing-seams-tdd-and-detox.md`, store and mock-resolver behaviour goes to
      Jest, screen behaviour to Detox
- [ ] `pnpm test`, `pnpm lint`, `pnpm typecheck` green; Detox seeded suite green; seed-off pass
      (`cd apps/host && EXPO_PUBLIC_SEED=false ./scripts/e2e-test.sh e2e/seed.e2e.ts`) still 6/6
