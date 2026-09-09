import { by, device, element, expect, waitFor } from 'detox';

/** The seeded aliases, from `packages/mocks/src/properties.ts`. */
const FIRST_ALIAS = 'Beach apartment';
const SECOND_ALIAS = 'Lake house';

const visible = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toBeVisible().withTimeout(timeout);

/**
 * Containers assert existence, not visibility: Detox scores a view's visible area over everything
 * drawn on top of it, its own children included, so a packed container never reaches 75%.
 */
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

const openMarketplaceTab = async () => {
  await waitFor(element(by.id('tabs.marketplace'))).toBeVisible().withTimeout(30000);
  await element(by.id('tabs.marketplace')).tap();
};

describe('marketplace', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await openMarketplaceTab();
  });

  it('opens on the three seeded open searches', async () => {
    await expect(element(by.id('marketplace.title'))).toHaveText('Marketplace searches');
    await exists('marketplace.search');
    await exists('marketplace.new');
    await exists('marketplace.tabs.open');
    await exists('marketplace.tabs.closed');

    await waitFor(element(by.id('marketplace.count')))
      .toHaveText('You currently have 3 open searches.')
      .withTimeout(10000);
    await exists('marketplace.search.search-1');
    await exists('marketplace.search.search-2');
    await exists('marketplace.search.search-3');
    await text(FIRST_ALIAS);
    // One per seeded search, all created at boot.
    await expect(element(by.text('Created a minute ago')).atIndex(0)).toBeVisible();
  });

  it('loads the list behind skeleton cards', async () => {
    // Detox waits out JS timers, and the mock delay is one, so a synchronized launch never sees
    // a skeleton. This is the one test that watches the list load, so it drives its own launch.
    await device.launchApp({
      delete: true,
      newInstance: true,
      launchArgs: { detoxEnableSynchronization: 0 },
    });
    await openMarketplaceTab();

    await exists('marketplace.skeleton', 20000);
    await gone('marketplace.skeleton');

    await device.enableSynchronization();

    await text(FIRST_ALIAS);
  });

  it('expands a search summary in place', async () => {
    await exists('marketplace.search.search-1');
    await element(by.id('marketplace.search.search-1.summary')).tap();

    await exists('marketplace.search.search-1.summary.body');
    await text('Bedrooms');
  });

  it('shows the handshake empty state on the Closed tab — nothing here ever closes', async () => {
    await exists('marketplace.search.search-1');
    await element(by.id('marketplace.tabs.closed')).tap();

    await exists('marketplace.empty');
    await text('Find a New Cleaner on the Sweep Marketplace');
    await text('55,000+');
    await text('4.8M+');
    await visible('marketplace.find-cleaner');
  });

  it('lists a search’s bids, with the three seeded cleaners and their prices', async () => {
    await exists('marketplace.search.search-1');
    await element(by.id('marketplace.search.search-1.open')).tap();

    await expect(element(by.id('bids.title'))).toHaveText(FIRST_ALIAS);
    await exists('bids.close');
    await exists('bids.tabs.new-cleaner-bids');
    await exists('bids.tabs.accepted-bids');
    await text("You don't have a payment method!");
    await text('To add a calendar, select your booking platform');

    for (const [name, rating, reviews, price] of [
      ['Ramona', '4.8', '22 reviews', '$100'],
      ['Jairo', '4.6', '191 reviews', '$125'],
      ['Aurea', '5.0', '11 reviews', '$150'],
    ] as const) {
      await scrolledTo(name, 'bids.scroll');
      await text(rating);
      await text(reviews);
      await text(price);
    }

    await scrolledTo('While you wait', 'bids.scroll');
    await text('Take a tour');
    await scrolledTo('Add a checklist to your property', 'bids.scroll');
  });

  it('dismisses a bid-list banner and the While you wait card', async () => {
    await exists('marketplace.search.search-1');
    await element(by.id('marketplace.search.search-1.open')).tap();

    await exists('bids.banner.payment');
    await element(by.id('bids.banner.payment')).tap();
    await gone('bids.banner.payment');

    await scrolledTo("Don't show this card again", 'bids.scroll');
    await element(by.id('bids.while-you-wait.dismiss')).tap();
    await gone('bids.while-you-wait');
  });

  it('shows the empty Accepted bids tab', async () => {
    await exists('marketplace.search.search-1');
    await element(by.id('marketplace.search.search-1.open')).tap();

    await exists('bid-card.ramona');
    await element(by.id('bids.tabs.accepted-bids')).tap();

    await visible('bids.empty');
    await gone('bid-card.ramona');
  });

  it('posts a fourth search through the two-step wizard and lands on its bids', async () => {
    await element(by.id('marketplace.new')).tap();

    await exists('screen.new-search');
    await expect(element(by.id('search-form.step-title'))).toHaveText(
      'Confirm the Property Details'
    );
    await exists('search-form.info');
    await text('How the Sweep Marketplace works');
    await text("I can't find my address");
    await exists('search-form.progress');

    // Point the search at the second seeded property, so the fourth search is a new alias.
    await element(by.id('search-form.property')).tap();
    await element(by.id(`search-form.property.option.${SECOND_ALIAS}`)).tap();
    await expect(element(by.id('search-form.address'))).toHaveText('815 Lakeshore Dr, Big Bear Lake');

    await element(by.id('search-form.bedrooms')).tap();
    await element(by.id('search-form.bedrooms.option.4')).tap();
    await element(by.id('search-form.unit-size-toggle.second')).tap();

    await element(by.id('search-form.next')).tap();

    await expect(element(by.id('search-form.step-title'))).toHaveText(
      'Describe your cleaning needs'
    );
    await exists('search-form.notes');
    await exists('search-form.save-notes');
    await exists('search-form.warning');
    await element(by.id('search-form.notes')).typeText('Please pay attention to the balcony.');
    // The notes field is multiline, so the return key adds a newline rather than dismissing the
    // keyboard — and the keyboard covers the footer button. Tapping a non-touchable view inside
    // the scroll view (`keyboardShouldPersistTaps="handled"`) closes it.
    await element(by.id('search-form.warning')).tap();

    // The overlay and the button spinner are both up while the mock resolver is in flight, so
    // this leg runs unsynchronized — a synchronized tap would only hand back once it is over.
    await device.disableSynchronization();
    await element(by.id('search-form.submit')).tap();
    await exists('search-form.congrats', 5000);
    await text('Congrats!');
    await exists('search-form.submit.spinner');
    await device.enableSynchronization();

    // Landed on the new search's bids, with all three cleaners bidding.
    await expect(element(by.id('bids.title'))).toHaveText(SECOND_ALIAS);
    await exists('bid-card.ramona');
    await exists('bid-card.jairo');
    await exists('bid-card.aurea');

    // And back on the list it is the fourth open search.
    await element(by.id('bids.close')).tap();
    await waitFor(element(by.id('marketplace.count')))
      .toHaveText('You currently have 4 open searches.')
      .withTimeout(10000);
  });
});
