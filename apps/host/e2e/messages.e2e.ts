import { by, device, element, expect, waitFor } from 'detox';

import { openHome } from './support';

/** Containers assert existence; only text is scored for visibility. See DECISIONS.md. */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

const gone = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).not.toExist().withTimeout(timeout);

/** Ramona's bid on the first seeded search — the row this suite opens the chat from. */
const FIRST_BID = 'bid-search-1-cleaner-ramona';

const openMessages = async () => {
  await exists('home.messages');
  await element(by.id('home.messages')).tap();
  await exists('screen.messages');
};

describe('messages', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await openHome();
  });

  it("opens from the messages icon in Home's header", async () => {
    await openMessages();

    await expect(element(by.id('messages.title'))).toHaveText('Messages');
    await expect(element(by.text('Messages')).atIndex(0)).toBeVisible();
    await exists('messages.search');
  });

  it('lists a pending bid per cleaner over its two pinned buttons', async () => {
    await openMessages();

    await exists(`messages.row.${FIRST_BID}`);
    await expect(element(by.text('Ramona')).atIndex(0)).toBeVisible();
    await expect(element(by.text('Bid Pending')).atIndex(0)).toBeVisible();
    await expect(element(by.text('No messages yet.')).atIndex(0)).toBeVisible();

    await expect(element(by.text('Find a Cleaner in the Marketplace'))).toBeVisible();
    await expect(element(by.text('Invite Teammates'))).toBeVisible();
  });

  it('mounts the list as skeletons, then resolves it into rows', async () => {
    // Detox waits out the mock delay while synchronized, so the skeleton is only observable
    // from an unsynchronized launch — the same trick home.e2e.ts and payments.e2e.ts use.
    // This is also what pins the empty state back: an empty store is "not yet", not "no bids".
    await device.launchApp({
      delete: true,
      newInstance: true,
      launchArgs: { detoxEnableSynchronization: 0 },
    });
    await openHome();
    await element(by.id('home.messages')).tap();

    await exists('messages.skeleton', 20000);
    await gone('marketplace.empty');
    await gone('messages.skeleton');

    await device.enableSynchronization();

    await exists('messages.list');
    await exists(`messages.row.${FIRST_BID}`);
  });

  it('opens the Marketplace from the pinned button', async () => {
    await openMessages();
    await element(by.id('messages.find-cleaner')).tap();

    await exists('screen.marketplace');
  });

  it('opens the chat from a row, and agrees into the composer', async () => {
    await openMessages();
    await element(by.id(`messages.row.${FIRST_BID}`)).tap();

    await exists('screen.chat');
    await expect(element(by.text('Ramona')).atIndex(0)).toBeVisible();
    await expect(element(by.text('Last seen Yesterday, 11:36 PM'))).toBeVisible();
    await expect(element(by.text('Beach apartment')).atIndex(0)).toBeVisible();
    await expect(element(by.text('$100.00 per project'))).toBeVisible();
    await expect(element(by.text('Bid expires in:'))).toBeVisible();
    await exists('chat.bid-details');

    // The chat rules, up until the host agrees to them.
    await expect(element(by.text('How to use our chat'))).toBeVisible();
    await gone('chat.composer');

    await element(by.id('chat.agree')).tap();

    await expect(element(by.text('Finish setting up your account'))).toBeVisible();
    await exists('chat.setup-account');
    await exists('chat.composer');
    await gone('chat.agree');

    // The header and the bid strip are unchanged between the two states.
    await expect(element(by.text('Last seen Yesterday, 11:36 PM'))).toBeVisible();
    await expect(element(by.text('$100.00 per project'))).toBeVisible();
  });
});
