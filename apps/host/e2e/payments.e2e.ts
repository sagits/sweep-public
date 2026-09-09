import { by, device, element, expect, waitFor } from 'detox';

/** Containers assert existence; only text is scored for visibility. See DECISIONS.md. */
const exists = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).toExist().withTimeout(timeout);

const gone = (id: string, timeout = 10000) =>
  waitFor(element(by.id(id))).not.toExist().withTimeout(timeout);

const openPayments = async () => {
  await waitFor(element(by.id('tabs.payments'))).toBeVisible().withTimeout(30000);
  await element(by.id('tabs.payments')).tap();
};

describe('payments', () => {
  beforeEach(async () => {
    await device.launchApp({ delete: true });
    await openPayments();
  });

  it('renders the Payment History header with its filter and search icons', async () => {
    await exists('screen.payments');
    await exists('payments.header');
    await expect(element(by.id('payments.title'))).toHaveText('Payment History');
    await expect(element(by.text('Payment History'))).toBeVisible();
    await exists('payments.filter');
    await exists('payments.search');
  });

  it('mounts the list as skeletons, then resolves it into paid rows', async () => {
    // Detox waits out the mock delay while synchronized, so the skeleton is only observable
    // from an unsynchronized launch — the same trick home.e2e.ts uses.
    await device.launchApp({
      delete: true,
      newInstance: true,
      launchArgs: { detoxEnableSynchronization: 0 },
    });
    await openPayments();

    await exists('payments.skeleton', 20000);
    await gone('payments.skeleton');

    await device.enableSynchronization();

    await exists('payments.list');
    await exists('payments.row.payment-1');
    await expect(element(by.text('Ramona')).atIndex(0)).toBeVisible();
    await expect(element(by.text('Beach apartment, Los Angeles #22')).atIndex(0)).toBeVisible();
    await expect(element(by.text('$100.00')).atIndex(0)).toBeVisible();
    await expect(element(by.text('Paid')).atIndex(0)).toBeVisible();
    // The date-over-time stamp on the right of the row.
    await exists('payments.row.payment-1.stamp');
  });
});
