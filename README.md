# Sweep Hosts

A universal (iOS + web) host app for short-term-rental cleaning: register a property, create a
cleaning project, post a search to the marketplace, review bids from cleaners. Mock data only —
no backend, no API, no auth.

This is an architecture and UI study inspired by a commercial turnover-cleaning app, built as a portfolio
piece. It is not affiliated with, endorsed by, or connected to that product in any way, and it carries
none of its name, logo or branding.

## Stack

Expo (SDK 54) + Expo Router · TypeScript · NativeWind · Zustand · React Native Web · Turborepo +
pnpm · Detox.

```
apps/
  host/        the Sweep Hosts app
packages/
  ui/          design tokens and shared components
  mocks/       mock data and delayed async resolvers
  types/       shared domain types
  config/      shared tsconfig, eslint, NativeWind preset
```

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

Everything runs locally — no EAS, no Expo/Apple/Google account. `ios/` and `android/` are generated
on demand by `pnpm e2e:build` (Continuous Native Generation) and are not committed.

**iOS only.** There is no Android SDK on the development machine, so `.detoxrc.js` has no Android
configuration. The only simulator configured is `iPhone 16`.

`pnpm e2e:build` additionally needs Xcode, CocoaPods and `cmake` (React Native's `hermes-engine`
podspec requires it). `pnpm test`, `pnpm typecheck` and `pnpm build:web` need none of them.

## Testing

Two seams, per [ADR-0001](docs/adr/0001-testing-seams-tdd-and-detox.md): stores and mock resolvers
are built test-first under Jest + React Native Testing Library; screens are covered by Detox specs
in `apps/host/e2e/`. Layout fidelity is checked against `poc/screenshots/` by eye — no snapshot tests.

## Platform-specific files

`.web.tsx` files are used only where a native module has no web equivalent. None exist yet.
