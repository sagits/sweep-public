# ADR-0001: Two testing seams — TDD for state, Detox for screens

**Status:** Accepted
**Date:** 2026-09-09

## Context

The Sweep Hosts PoC (`poc/PRD.md`) ships one Detox e2e suite per feature and no unit-test layer.
`/implement` drives `/tdd` internally, and `/tdd` refuses to write a test at a seam that hasn't been
agreed up front. Without a standing answer, every ticket re-opens the same question in a fresh
context window, and the answers drift.

The two testing styles pull in opposite directions here:

- Red-green against Detox is impractically slow. Each cycle launches a simulator, and the PRD's
  artificial 600–1200ms delays sit inside every assertion.
- Most of this build is layout fidelity against reference screenshots. Spacing, type scale and copy
  have no behaviour to assert that isn't a snapshot of the implementation — `/tdd`'s tautological
  anti-pattern. Writing unit tests for them produces tests that break on every refactor and catch
  nothing.
- But the app is not all layout. The stores and mock resolvers carry real logic, and it is logic the
  demo depends on: creating a property must make it selectable in the project form, creating a
  project must surface it on Home, the seed toggle must empty every list.

## Decision

Two seams, each with one testing style. Both are pre-agreed for every ticket in
`.scratch/sweep-hosts-poc/`, so `/tdd` does not need to ask again.

**TDD seam — `packages/mocks` resolvers and the Zustand stores.** Test-first, red before green, one
vertical slice at a time. These run in-process with no simulator, so the loop stays fast. What gets
tested is behaviour through the store's public interface:

- adding a property appends it and it becomes available to the project form's picker
- creating a manual project places it on the right calendar day and on Home
- posting a search adds it to the open searches and carries its bids
- the seed toggle produces either the seeded counts or empty stores
- resolvers resolve after a delay, so the `loading` flag is observably true first

**Detox seam — screens.** Verified by the feature's e2e spec, written alongside the screen rather
than before it. The PRD's loop governs: implement the feature, run its spec, fix, then move on.
Specs assert structure, navigation and loading states — skeleton or spinner visible, then `waitFor`
the loaded content — not pixel values.

**Neither seam covers layout fidelity.** It is verified against the reference screenshots by eye.
No snapshot tests.

## Consequences

- A ticket is done when its Detox spec passes *and* the store logic it introduced has tests. Neither
  alone is enough.
- The runner is **Jest** (`jest-expo` preset) with **React Native Testing Library**, not Vitest.
  RNTL ships its own matchers, so no separate `jest-native` package. Jest must ignore `e2e/` or it
  will try to run the Detox specs, which only run under `pnpm e2e:test`. Two commands, two seams.
- RNTL widens the TDD seam slightly past stores: a component with real interaction behaviour — a
  Show/Hide expander, a dismissible card, a wizard advancing a step, a checkbox gating a button —
  can be driven test-first without a simulator. Test what the user can do, never what it looks like.
  Layout stays out of Jest entirely.
- Tests are written against store interfaces, so screens can be rebuilt to match a screenshot
  without touching them. That is the point of the split.
- `/tdd`'s "confirm the seams first" step is satisfied by this ADR. An implementing agent should
  cite it rather than re-asking.
- If a bug escapes to a Detox spec that a store test could have caught, the missing store test is
  the fix, not a broader e2e assertion.
