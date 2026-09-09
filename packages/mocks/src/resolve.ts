/**
 * Every mock module resolves through here, so the artificial delay the PRD asks for
 * lives in one place and swapping in a real API later is a one-file change.
 */
export const MIN_DELAY_MS = 600;
export const MAX_DELAY_MS = 1200;

export function resolve<T>(value: T): Promise<T> {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((done) => {
    setTimeout(() => done(value), delay);
  });
}
