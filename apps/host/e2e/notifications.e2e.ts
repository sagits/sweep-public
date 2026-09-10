import { by, device, element, expect, waitFor } from 'detox';

import { openHome } from './support';

/** Containers assert existence; only text is scored for visibility. See DECISIONS.md. */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

const gone = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).not.toExist().withTimeout(timeout);

/**
 * Home's Notifications card sits below the fold, and a tap needs it on screen first. The scroll
 * target is a `by.text` matcher, not the card's id: DECISIONS 02 — a container packed with
 * content never reaches Detox's 75% visibility threshold, so `whileElement` would scroll past
 * it forever. Text nodes are leaves and score cleanly.
 */
const scrolledToText = (text: string) =>
  waitFor(element(by.text(text)))
    .toBeVisible()
    .whileElement(by.id('home.scroll'))
    .scroll(300, 'down');

/** The unassigned-project notification, from `packages/mocks/src/notifications.ts`. */
const UNASSIGNED = 'Your project at Lake house is still unassigned. It is due in 24 hours';

/** The newest seeded notification — the lowest card on Home, so scrolling to it lands there. */
const FIRST_NOTIFICATION =
  'New bid to clean Beach apartment, Los Angeles #22, Los Angeles. It will expire in 48 hours';

describe('notifications', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await openHome();
  });

  it('opens from the bell in Home\'s header', async () => {
    await exists('home.bell');
    await element(by.id('home.bell')).tap();

    await exists('screen.notifications');
    await expect(element(by.id('notifications.title'))).toHaveText('Notifications');
    await expect(element(by.text('Notifications')).atIndex(0)).toBeVisible();
    await exists('notifications.settings');
    await exists('notifications.search');
  });

  it("opens from anywhere on Home's Notifications card", async () => {
    // The card is the last thing on Home, well below the fold — Detox will not tap what it
    // cannot see, so scroll a row of its text into view first.
    await scrolledToText(FIRST_NOTIFICATION);
    await element(by.id('home.notifications-card')).tap();

    await exists('screen.notifications');

    // …and from the card's "See all", which leads to the same screen.
    await element(by.id('notifications.header.back')).tap();
    await scrolledToText(FIRST_NOTIFICATION);
    await element(by.id('home.notifications-see-all')).tap();

    await exists('screen.notifications');
  });

  it('lists the seeded notifications and filters them on the search field', async () => {
    await element(by.id('home.bell')).tap();
    await exists('notifications.list');

    await exists('notifications.row.notification-1');
    await exists('notifications.row.notification-2');
    await exists('notifications.row.notification-3');
    await expect(element(by.text(UNASSIGNED))).toBeVisible();

    await element(by.id('notifications.search')).typeText('unassigned');

    await exists('notifications.row.notification-2');
    await gone('notifications.row.notification-1');
    await gone('notifications.row.notification-3');
  });

  it('mounts the list as skeletons, then resolves it into rows', async () => {
    // Detox waits out the mock delay while synchronized, so the skeleton is only observable
    // from an unsynchronized launch — the same trick home.e2e.ts and payments.e2e.ts use.
    await device.launchApp({
      delete: true,
      newInstance: true,
      launchArgs: { detoxEnableSynchronization: 0 },
    });
    await openHome();
    await element(by.id('home.bell')).tap();

    await exists('notifications.skeleton', 20000);
    await gone('notifications.skeleton');

    await device.enableSynchronization();

    await exists('notifications.list');
    await exists('notifications.row.notification-1');
  });

  it('empties the bell badge from "Mark all as read"', async () => {
    // Three unread notifications, so the badge is on the bell to begin with.
    await exists('home.bell-badge');
    await element(by.id('home.bell')).tap();

    await exists('notifications.row.notification-1');
    await element(by.id('notifications.mark-all-read')).tap();

    await element(by.id('notifications.header.back')).tap();
    await gone('home.bell-badge');
  });
});
