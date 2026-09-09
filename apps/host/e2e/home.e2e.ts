import { by, device, element, expect, waitFor } from 'detox';

const SCROLL = 'home.scroll';

/** The first seeded notification, from `packages/mocks/src/notifications.ts`. */
const FIRST_NOTIFICATION =
  'New bid to clean Beach apartment, Los Angeles #22, Los Angeles. It will expire in 48 hours';

const visible = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toBeVisible().withTimeout(timeout);

/**
 * Existence rather than visibility. Detox scores a view's visible area over everything drawn on
 * top of it, its own children included, so a container packed with content never reaches the 75%
 * threshold. Containers assert existence; the text inside them asserts visibility.
 */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

const gone = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).not.toExist().withTimeout(timeout);

const scrolledToText = (text: string) =>
  waitFor(element(by.text(text)))
    .toBeVisible()
    .whileElement(by.id(SCROLL))
    .scroll(300, 'down');

describe('home', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await visible('home.wordmark', 30000);
  });

  it('renders the teal header and the static cards', async () => {
    await exists('home.header');
    await expect(element(by.id('home.wordmark'))).toHaveText('Sweep');
    await exists('home.credit-pill');
    await expect(element(by.text('Get $100 credit'))).toBeVisible();
    await exists('home.bell');
    await exists('home.messages');

    // The seed holds three open searches, so the "Search for New Cleaners" prompt is already
    // replaced by the Cleaner Search card — its own test is below.
    await exists('home.cleaner-search-card');
    await visible('home.invite-teammates-card');
    await expect(element(by.text('Invite Current Teammates'))).toBeVisible();
  });

  it('mounts the data cards as skeletons, then resolves them', async () => {
    // Detox waits out JS timers, and the mock delay is one — so the skeletons are already gone
    // by the time a synchronized launch hands control back. This is the one test that has to
    // watch the app load, so it drives the launch itself.
    await device.launchApp({
      delete: true,
      newInstance: true,
      launchArgs: { detoxEnableSynchronization: 0 },
    });

    await exists('home.projects-skeleton', 20000);
    await exists('home.notifications-skeleton');

    await gone('home.projects-skeleton');
    await gone('home.notifications-skeleton');

    await device.enableSynchronization();

    await visible('home.projects-empty');
    await expect(element(by.text('There are no projects right now.'))).toBeVisible();
    await exists('home.notification.notification-1');
    await scrolledToText(FIRST_NOTIFICATION);
    // The date-over-time stamp on the right of the row.
    await exists('home.notification.notification-1.stamp');
  });

  it('keeps the Quality center card in a spinner', async () => {
    await scrolledToText('Quality center');
    await exists('home.quality-center-card');
    await exists('home.quality-center-spinner');
  });

  it('dismisses the promo card, and its header pill, for the session', async () => {
    await exists('home.promo-card');
    await expect(element(by.text('Invite a Host and get $100 in Credits'))).toBeVisible();

    await scrolledToText("Don't show this anymore");
    await element(by.id('home.promo-dismiss')).tap();

    await gone('home.promo-card');
    await gone('home.credit-pill');

    // Still gone after leaving Home and coming back.
    await element(by.id('tabs.projects')).tap();
    await element(by.id('tabs.home')).tap();
    await gone('home.promo-card');
    await gone('home.credit-pill');
  });

  it('shows the seeded Cleaner Search card, with a bid chip per search', async () => {
    await exists('home.cleaner-search-card');
    await expect(element(by.text('Cleaner Search (3)'))).toBeVisible();

    // One row per seeded search: house icon, alias, "Created a minute ago", and its bid chip.
    await exists('home.cleaner-search.search-1');
    await expect(element(by.text('Beach apartment')).atIndex(0)).toBeVisible();
    await expect(element(by.text('Created a minute ago')).atIndex(0)).toBeVisible();
    await exists('home.cleaner-search.search-1.bids');
    await expect(element(by.text('3 Bids'))).toBeVisible();
    await exists('home.cleaner-search.search-2.bids');
    await expect(element(by.text('1 Bid'))).toBeVisible();
    await visible('home.find-new-cleaners');
  });

  it('opens the Marketplace from the Cleaner Search card\'s "See all"', async () => {
    await exists('home.cleaner-search-card');
    await element(by.id('home.cleaner-search-see-all')).tap();

    await exists('screen.marketplace');
  });

  it("opens a search's bids from its row on Home", async () => {
    await exists('home.cleaner-search.search-1');
    await element(by.id('home.cleaner-search.search-1')).tap();

    await exists('screen.bids');
    await expect(element(by.id('bids.title'))).toHaveText('Beach apartment');
  });
});
