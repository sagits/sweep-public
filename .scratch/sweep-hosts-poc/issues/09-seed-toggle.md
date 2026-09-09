# 09: Seed toggle and empty states

**What to build:** A dev toggle (`SEED=false`) that boots the app with no seeded content, so every
empty state in the app is reachable and demoable. With the seed on, the app opens with three
properties, three projects and three open searches; with it off, every list shows the empty state
its ticket implemented.

The empty states themselves already exist — this ticket adds the switch, sweeps them for
correctness against their screenshots, and locks the behaviour down with a test.

**Blocked by:** 02, 03, 04, 05

**Status:** done

- [x] On a clean launch with the seed on: three properties, three projects, three open searches
- [x] With the seed off, every list renders its empty state — Home's Projects and Notifications cards, Properties, Projects, Marketplace and Payments
- [x] Home's "Search for New Cleaners" card replaces the "Cleaner Search (N)" card when no searches exist
- [x] Toggling the seed requires no code edit
- [x] `seed.e2e.ts` passes both ways — verified after merge: 6/6 seeded, 6/6 with the seed off.
      Run it as `pnpm --filter @sweep/host e2e:test e2e/seed.e2e.ts` and
      `EXPO_PUBLIC_SEED=false pnpm --filter @sweep/host e2e:test e2e/seed.e2e.ts`
      (the root `pnpm e2e:test` passes the path to turbo, which reads it as a task name)
- [x] The toggle is built test-first per ADR-0001: seed on produces the seeded counts, seed off produces empty stores
