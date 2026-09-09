/** Every guard handed out, so a test can clear them all in one call. */
const resets: (() => void)[] = [];

/**
 * The one load guard every store shares (DECISIONS 05): the first caller starts the fetch, every
 * caller after it awaits that same request, and once it has settled the store never fetches
 * again for the session.
 *
 * A `loading` flag alone is not enough, and this is not theoretical: a second caller saw the
 * flag, returned immediately, and the seed landing afterwards overwrote the row it had appended
 * in between. Deep-linking the cleaner-search wizard did exactly that. Awaiting the shared
 * promise is what makes `post()` — and any other write that has to land on top of the seed —
 * safe.
 *
 * A screen that deliberately re-fetches (the calendar's refresh icon) calls the store's own
 * `reload`, which is not behind this.
 */
export function once(load: () => Promise<void>): () => Promise<void> {
  let inFlight: Promise<void> | null = null;
  resets.push(() => {
    inFlight = null;
  });
  return () => (inFlight ??= load());
}

/** Tests reset store state; the in-flight request has to go with it. */
export const resetLoads = () => resets.forEach((reset) => reset());
