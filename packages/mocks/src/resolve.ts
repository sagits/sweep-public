/**
 * Every mock module resolves through here, so the artificial delay the PRD asks for
 * lives in one place and swapping in a real API later is a one-file change.
 *
 * Flat 1000ms, not the PRD's random 600–1200ms window. A fixed delay is what makes the Detox
 * specs that observe a skeleton deterministic. Min and max are kept as separate names because
 * every store and mock test advances its fake timers by one of them.
 *
 * This fires once per store per session: `once()` holds the first load's promise, so the
 * skeletons are what you see the first time you open a tab and never again — until a
 * pull-to-refresh, which deliberately runs the fetch and its skeletons afresh.
 */
export const MIN_DELAY_MS = 1000;
export const MAX_DELAY_MS = 1000;

export function resolve<T>(value: T): Promise<T> {
  return new Promise((done) => {
    setTimeout(() => done(value), MIN_DELAY_MS);
  });
}
