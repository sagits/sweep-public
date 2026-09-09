import { MAX_DELAY_MS, MIN_DELAY_MS } from './resolve';
import { fetchNotifications, seededNotifications } from './notifications';

describe('fetchNotifications', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('seeds the three notifications Home opens with, newest first', () => {
    expect(seededNotifications).toHaveLength(3);

    const timestamps = seededNotifications.map((item) => Date.parse(item.at));
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
    expect(seededNotifications.every((item) => item.message.length > 0)).toBe(true);
  });

  it('holds the list back until the mock delay has passed, so the skeleton is observable', async () => {
    let settled = false;
    void fetchNotifications().then(() => {
      settled = true;
    });

    jest.advanceTimersByTime(MIN_DELAY_MS - 1);
    await Promise.resolve();
    expect(settled).toBe(false);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await Promise.resolve();
    expect(settled).toBe(true);
  });

  it('resolves the seeded notifications', async () => {
    const pending = fetchNotifications();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await expect(pending).resolves.toEqual(seededNotifications);
  });
});
