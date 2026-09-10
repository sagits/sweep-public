/**
 * "$100.00" — every price and amount in the app. The payment list, the cleaner profile and the
 * chat's bid strip each had their own copy of this line before.
 */
export const usd = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
