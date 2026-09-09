/**
 * The dev seed switch, in one place for every mock list.
 *
 * `EXPO_PUBLIC_SEED=false` boots the app with nothing in it, so every list renders the empty
 * state its ticket built. Any other value — including none — seeds normally.
 *
 * Read per call rather than once at module load: in a dev bundle babel-preset-expo rewrites
 * `process.env.EXPO_PUBLIC_*` into a reference to `expo/virtual/env` (which *is* `process.env`),
 * so a per-call read is a live read and the tests can drive both branches without reloading
 * modules. A production `expo export` inlines the literal, and a constant fold makes it free.
 *
 * `process` is declared locally rather than pulling `@types/node` into a package that needs
 * nothing else from Node.
 */
declare const process: { env: Record<string, string | undefined> };

export const seedEnabled = (): boolean => process.env.EXPO_PUBLIC_SEED !== 'false';

/** The seeded rows, or none of them. Every `fetch*` in this package resolves through here. */
export const seeded = <T>(rows: T[]): T[] => (seedEnabled() ? rows : []);
