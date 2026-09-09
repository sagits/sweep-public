# 10: Web verification pass

**What to build:** Proof that the web target actually runs, not just that it compiles. Build the
static output, serve it locally, open it in a browser and drive it by hand, then fix whatever that
surfaces. Web-specific problems are expected: shadows, `pointerEvents`, gesture handlers and fixed
positioning are the usual offenders.

Platform files are a last resort — use them only where a native module has no web equivalent, never
to build a second web layout. Every one that ends up existing is recorded in the README with the
reason it was needed.

**Blocked by:** 01, 02, 03, 04, 05, 06, 07, 08, 09

**Status:** done

- [x] `pnpm build:web` is clean and the served output renders Home with the seeded data, not a blank page or an error boundary
- [x] All six tabs navigate, and loading `/projects` directly renders the Projects screen rather than a 404
- [x] The cleaner search wizard and the property form are usable with a mouse and keyboard
- [x] At desktop width the tab bar is the left sidebar and content is centered
- [x] The browser console is free of errors and of React Native Web warnings about unsupported props
- [x] Every `.web.tsx` file that exists is listed in the README with its reason
- [x] The full demo flow works in the browser: add a property → create a manual project → run a cleaner search → see three bids → open a cleaner's profile
