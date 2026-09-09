# 07: Payments

**What to build:** The Payments tab shows a populated Payment History list — cleaner name, property,
date, amount and a "Paid" status pill per row — under the header with its filter and search icons.
Matches screenshot `22`, except that the real app's empty state is replaced by content here. The
folder empty state stays implemented for when the list is cleared.

**Blocked by:** 01

**Status:** done

- [x] Header and rows match the design system; the list loads behind skeletons
- [x] Rows show cleaner, property, date, amount and a Paid pill
- [x] The empty state from screenshot `22` is implemented and reachable when the list is cleared
- [x] `payments.e2e.ts` passes
