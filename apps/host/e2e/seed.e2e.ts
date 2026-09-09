import { by, device, element, expect, waitFor } from 'detox';

/**
 * The seed toggle, swept across every list that has an empty state.
 *
 * This one spec passes both ways and is the only one that does — the rest of the suite asserts
 * the seeded app. Run it twice:
 *
 *   pnpm e2e:test e2e/seed.e2e.ts                         # seeded
 *   EXPO_PUBLIC_SEED=false pnpm e2e:test e2e/seed.e2e.ts  # empty
 *
 * `scripts/e2e-test.sh` starts Metro itself, so the variable reaches the bundle and this runner
 * from the same shell. In a dev bundle babel-preset-expo turns the read into a live reference to
 * `expo/virtual/env`, so no cache clearing is needed between the two runs.
 */
const SEEDED = process.env.EXPO_PUBLIC_SEED !== 'false';

/** Containers assert existence; only text is scored for visibility. See DECISIONS.md. */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

const gone = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).not.toExist().withTimeout(timeout);

const text = (value: string) => expect(element(by.text(value))).toBeVisible();

const scrolledTo = (value: string, scroll: string) =>
  waitFor(element(by.text(value)))
    .toBeVisible()
    .whileElement(by.id(scroll))
    .scroll(300, 'down');

const openTab = async (tab: string) => {
  await waitFor(element(by.id(tab))).toBeVisible().withTimeout(30000);
  await element(by.id(tab)).tap();
};

/** Payments has no tab: the dollar icon in Home's header is the way in. */
const openPayments = async () => {
  await openTab('tabs.home');
  await waitFor(element(by.id('home.payments'))).toBeVisible().withTimeout(30000);
  await element(by.id('home.payments')).tap();
};

/** The same key `src/projects/days.ts` builds, so today's section can be addressed by testID. */
const todayKey = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

describe(`seed toggle (EXPO_PUBLIC_SEED=${SEEDED ? 'on' : 'false'})`, () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
  });

  it('opens Home on the seeded cards, or on every card\'s empty state', async () => {
    await exists('screen.home', 30000);
    await gone('home.projects-skeleton', 20000);
    await gone('home.notifications-skeleton');
    await gone('home.cleaner-search-skeleton');

    if (SEEDED) {
      // Three open searches, so the Cleaner Search card holds the top slot.
      await exists('home.cleaner-search-card');
      await gone('home.search-cleaners-card');
      await text('Cleaner Search (3)');
      await exists('home.cleaner-search.search-1');
      await exists('home.cleaner-search.search-2');
      await exists('home.cleaner-search.search-3');

      // Three notifications, so the bell carries its badge.
      await exists('home.bell-badge');

      await exists('home.project.38261465');
      await exists('home.notification.notification-1');
      await gone('home.projects-empty');
      await gone('home.notifications-empty');
    } else {
      // No searches: the "Search for New Cleaners" prompt takes the Cleaner Search card's place.
      await exists('home.search-cleaners-card');
      await gone('home.cleaner-search-card');
      await text('Search for New Cleaners');
      await text('Search on our Marketplace for local, reliable cleaners');

      // Nothing to count, so the bell badge is gone — see DECISIONS.md, ticket 02.
      await gone('home.bell-badge');

      await exists('home.projects-empty');
      await exists('home.notifications-empty');
      await scrolledTo('There are no projects right now.', 'home.scroll');
      await scrolledTo('There are no notifications right now.', 'home.scroll');
    }
  });

  it('lists three properties, or the Properties empty card', async () => {
    await openTab('tabs.properties');
    await exists('screen.properties');
    await gone('properties.skeleton', 20000);

    if (SEEDED) {
      await text('You have 3 properties');
      await exists('properties.card.property-1');
      await exists('properties.card.property-2');
      await exists('properties.card.property-3');
      await gone('properties.empty');
    } else {
      await text('You have 0 properties');
      await exists('properties.empty');
      await text("You don't have any properties yet.");
      await gone('properties.card.property-1');
    }
  });

  it('fills the calendar with three projects, or leaves its day sections empty', async () => {
    await openTab('tabs.projects');
    await exists('screen.projects');
    await gone('projects.skeleton', 20000);

    // Screenshot `04` is a calendar of empty days: the sections render either way.
    await exists(`projects.section.${todayKey()}`);

    if (SEEDED) {
      await exists('projects.row.38261465');
    } else {
      await gone('projects.row.38261465');
      await gone('projects.row.38261466');
      await gone('projects.row.38261467');
    }
  });

  it('lists three open searches, or the Marketplace handshake empty state', async () => {
    await openTab('tabs.marketplace');
    await exists('screen.marketplace');
    await gone('marketplace.skeleton', 20000);

    if (SEEDED) {
      await text('You currently have 3 open searches.');
      await exists('marketplace.search.search-1');
      await gone('marketplace.empty');
    } else {
      await exists('marketplace.empty');
      await text('Find a New Cleaner on the Sweep Marketplace');
      await exists('marketplace.find-cleaner');
      await gone('marketplace.count');
    }
  });

  it('lists paid rows, or screenshot 22 folder empty state', async () => {
    await openPayments();
    await exists('screen.payments');
    await gone('payments.skeleton', 20000);

    if (SEEDED) {
      await exists('payments.list');
      await exists('payments.row.payment-1');
      await gone('payments.empty');
    } else {
      await exists('payments.empty');
      await exists('payments.empty-folder');
      await text("You don't have any payment history yet.");
      await gone('payments.list');
    }
  });

  it('leaves the Payments filter icon inert either way', async () => {
    await openPayments();
    await exists('payments.filter');

    await element(by.id('payments.filter')).tap();

    // It used to clear the history to reach the empty state; the seed toggle owns that now.
    if (SEEDED) {
      await exists('payments.list', 20000);
      await exists('payments.row.payment-1');
    } else {
      await exists('payments.empty', 20000);
    }
  });
});
