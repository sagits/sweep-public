import { MAX_DELAY_MS, MIN_DELAY_MS, resolve } from './resolve';

describe('resolve', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('stays pending until at least the minimum mock delay, so loading states are observable', async () => {
    let settled = false;
    void resolve('ok').then(() => {
      settled = true;
    });

    jest.advanceTimersByTime(MIN_DELAY_MS - 1);
    await Promise.resolve();

    expect(settled).toBe(false);
  });

  it('resolves with the value it was given once the maximum delay has passed', async () => {
    const pending = resolve('ok');

    jest.advanceTimersByTime(MAX_DELAY_MS);

    await expect(pending).resolves.toBe('ok');
  });
});
