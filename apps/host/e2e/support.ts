import { by, element, waitFor } from 'detox';

/**
 * Helpers shared by more than one spec. Containers assert existence, not visibility: Detox
 * scores a view's visible area over everything drawn on top of it, its own children included.
 * See DECISIONS.md.
 */

/** Home, settled — the way in to Payments, Notifications and Messages, none of which has a tab. */
export const openHome = async () => {
  await waitFor(element(by.id('tabs.home'))).toExist().withTimeout(30000);
  await element(by.id('tabs.home')).tap();
  await waitFor(element(by.id('home.header'))).toExist().withTimeout(30000);
};

/** Payments has no tab of its own — the dollar icon in Home's header is the way in. */
export const openPayments = async () => {
  await openHome();
  await waitFor(element(by.id('home.payments'))).toExist().withTimeout(30000);
  await element(by.id('home.payments')).tap();
};

/** The section key `src/projects/days.ts` builds, for a day `offset` days from today. */
export const dayKey = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};
