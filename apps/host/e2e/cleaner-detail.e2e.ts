import { by, device, element, expect, waitFor } from 'detox';

/** The first seeded property, whose search carries all three cleaners. */
const ALIAS = 'Beach apartment';

/**
 * Containers assert existence, not visibility: Detox scores a view's visible area over everything
 * drawn on top of it, its own children included, so a packed container never reaches 75%.
 */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

const gone = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).not.toExist().withTimeout(timeout);

const text = (value: string) => expect(element(by.text(value))).toBeVisible();

const scrolledTo = (value: string) =>
  waitFor(element(by.text(value)))
    .toBeVisible()
    .whileElement(by.id('cleaner.scroll'))
    .scroll(300, 'down');

/** Marketplace tab → the first seeded search → one cleaner's bid card. */
const openCleaner = async (name: string) => {
  await waitFor(element(by.id('tabs.marketplace'))).toBeVisible().withTimeout(30000);
  await element(by.id('tabs.marketplace')).tap();
  await exists('marketplace.search.search-1');
  await element(by.id('marketplace.search.search-1.open')).tap();
  await exists(`bid-card.${name}`);
  await element(by.id(`bid-card.${name}.open`)).tap();
  await exists('screen.cleaner');
};

describe('cleaner detail', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
  });

  it('opens a bid on the cleaner’s profile, headed by the property alias', async () => {
    await openCleaner('ramona');

    await expect(element(by.id('cleaner.title'))).toHaveText(ALIAS);
    await exists('cleaner.chat');
    await exists('cleaner.handy-pro');
    await text('is also a Rental Handy Pro');
    await text('Ramona');
    await text('Super Cleaner');
    // The rating is printed twice — the summary row and the Reviews row — so it is matched by id.
    await expect(element(by.id('cleaner.rating'))).toHaveText('4.8');
    await text('(22 reviews)');
    await text('Expires in 2 days');
    await text('How Adding a Cleaner to My Team Works');
  });

  it('shows Ramona’s information, badges, reviews and work photos', async () => {
    await openCleaner('ramona');

    await exists('cleaner.information');
    await text('Completed Projects');
    await text('520');
    await text('Los Angeles, CA');
    await text('5 miles away');
    await text('July 2023');

    await scrolledTo('Badges');
    await text('Background Checked');
    await scrolledTo('Reviews');
    await scrolledTo('Rental Handy Pro');
    await text('Ramona can also work on general maintenance tasks if needed');
    await scrolledTo("Photos of Ramona's work");
    await exists('cleaner.photo.0');
    await exists('cleaner.photo.5');
  });

  it('renders Aurea without the Super Cleaner chip or the Rental Handy Pro rows', async () => {
    await openCleaner('aurea');

    await text('Aurea');
    await expect(element(by.id('cleaner.rating'))).toHaveText('5.0');
    await text('(11 reviews)');
    await gone('cleaner.handy-pro');
    await gone('cleaner.rental-handy-pro');
    await exists('cleaner.information');
    await text('96');
    await text('8 miles away');
    await scrolledTo("Photos of Aurea's work");
  });

  it('shows and hides the cleaner’s message', async () => {
    await openCleaner('jairo');

    await scrolledTo('Message from Cleaner');
    // The "Show"/"Hide" word is a nested `Text`, which Detox reads as part of the paragraph, so
    // the state is asserted on the pressable's label instead.
    await expect(element(by.id('cleaner.message'))).toHaveLabel('Show message');
    // Tapped near its top-left rather than at its centre: the paragraph is the tap target, and
    // it grows past the fold the moment it expands.
    await element(by.id('cleaner.message')).tap({ x: 30, y: 12 });
    await expect(element(by.id('cleaner.message'))).toHaveLabel('Hide message');
    await element(by.id('cleaner.message')).tap({ x: 30, y: 12 });
    await expect(element(by.id('cleaner.message'))).toHaveLabel('Show message');
  });

  it('expands the price card’s More, over an inert Accept and Reject', async () => {
    await openCleaner('jairo');

    await exists('cleaner.price');
    await expect(element(by.id('cleaner.price.amount'))).toHaveText('$125.00');
    await text('per Project + Fees');
    await text('Cleaner Bid');
    await gone('cleaner.price.breakdown');

    await element(by.id('cleaner.price.more')).tap();
    await exists('cleaner.price.breakdown');
    await text('Added at checkout');
    await text('Less');

    // Read-only: all three render and none of them navigates or changes anything.
    await element(by.id('cleaner.chat')).tap();
    await element(by.id('cleaner.accept')).tap();
    await element(by.id('cleaner.reject')).tap();
    await exists('screen.cleaner');
    await expect(element(by.id('cleaner.title'))).toHaveText(ALIAS);
  });

  it('dismisses the "How Adding a Cleaner to My Team Works" row and goes back to the bids', async () => {
    await openCleaner('ramona');

    await exists('cleaner.info');
    await element(by.id('cleaner.info-dismiss')).tap();
    await gone('cleaner.info');

    await element(by.id('cleaner.header.back')).tap();
    await expect(element(by.id('bids.title'))).toHaveText(ALIAS);
  });
});
