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

  it('seeds every notification unread, so the bell badge opens at three', () => {
    expect(seededNotifications.map((item) => item.read)).toEqual([false, false, false]);
  });

  it('tags the unassigned project as an alert and the two team rows as handshakes', () => {
    const kindOf = (fragment: string) =>
      seededNotifications.find((item) => item.message.includes(fragment))?.kind;

    expect(kindOf('is still unassigned')).toBe('alert');
    expect(kindOf('New bid to clean')).toBe('bid');
    // The invitation row could read either way; it is a handshake, like the bid.
    expect(kindOf('accepted your invitation')).toBe('bid');
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
