/**
 * Every mock module resolves through here, so the artificial delay the PRD asks for
 * lives in one place and swapping in a real API later is a one-file change.
 *
 * Flat 500ms, not the PRD's random 600–1200ms window: the polish pass asks for every skeleton to
 * show for half a second, and a fixed delay is also what makes the Detox specs that observe a
 * skeleton deterministic. Min and max are kept as separate names because every store and mock
 * test advances its fake timers by one of them.
 */
export const MIN_DELAY_MS = 500;
export const MAX_DELAY_MS = 500;

export function resolve<T>(value: T): Promise<T> {
  return new Promise((done) => {
    setTimeout(() => done(value), MIN_DELAY_MS);
  });
}
