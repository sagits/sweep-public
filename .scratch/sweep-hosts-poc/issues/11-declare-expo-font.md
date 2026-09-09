# 11: Declare `expo-font` in `apps/host/package.json`

**What to build:** `apps/host/app/_layout.tsx` imports `useFonts` from `expo-font`, but
`expo-font` is not in `apps/host/package.json`. It resolves today only because it is a peer of
`@expo/vector-icons` and pnpm's `nodeLinker: hoisted` puts it at the root of the workspace's
`node_modules`. That is an undeclared dependency: nothing pins its version, and it disappears the
day `@expo/vector-icons` stops depending on it or the hoisting layout changes. The import is not
optional — without it every icon prerenders empty in the static web export and React reports a
hydration mismatch on load (DECISIONS 10).

The fix is one line: `expo install expo-font` in `apps/host`.

**Why this is deferred, not done now:** pnpm 12 refuses to add it against the current lockfile —
`Broken lockfile: missing snapshot for expo-font@14.0.12`, because the lockfile holds only
peer-suffixed keys for it. The only way through is a full re-resolve of `pnpm-lock.yaml`, which
re-resolves every other package in the workspace at the same time. Doing that to a working install
— one that took an Expo SDK downgrade to reach (DECISIONS 01) and that the whole Detox suite runs
against — for one undeclared peer is a bad trade on its own. It should ride the next lockfile
regeneration, whatever prompts that: an SDK bump, a dependency upgrade, or a fresh install.

**Blocked by:** the next `pnpm-lock.yaml` regeneration

**Status:** ready-for-agent

- [ ] `expo-font` is a declared dependency of `@sweep/host`, at the version Expo SDK 54 pins
- [ ] `pnpm install` is clean and `pnpm-lock.yaml` resolves without `--force`
- [ ] `pnpm test`, `pnpm lint` and `pnpm typecheck` are green
- [ ] `pnpm build:web` still prerenders icons into the exported HTML — grep an exported file for a
      MaterialCommunityIcons glyph rather than an empty `<div>` — and the browser console shows no
      hydration error
- [ ] `pnpm e2e:test` is green, since the lockfile re-resolve touches every other package too
