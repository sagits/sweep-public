# 06: Cleaner detail

**What to build:** Tapping a bid opens that cleaner's full profile, matching screenshots `17`–`20`.
It is a read-only screen: the chat button, Accept Bid and Reject Bid all render exactly as shown and
do nothing on tap.

Delivers the header with the property alias, the pinned summary row (photo, name, Super Cleaner
pill, rating, expiry, teal circular chat button), the pinned Rental Handy Pro row, then the
scrolling body: the "How Adding a Cleaner to My Team Works" info row, the Information card, the
Message from Cleaner with its quote glyph and Show/Hide expander, Badges, the Reviews row, the
Rental Handy Pro section, and the 3-column grid of before/after work photos. The sticky footer holds
the bordered price card with its "More" expander, the teal Accept button and the red-outlined Reject
button.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] The screen matches screenshots `17`–`20` in structure, spacing, type scale, colors, icons and copy
- [ ] Every section renders for each of the three seeded cleaners, with their own ratings, prices and copy
- [ ] The Show/Hide expander on the cleaner's message works, and so does the price card's "More" expander
- [ ] Chat, Accept Bid and Reject Bid are present and tapping them changes nothing
- [ ] `cleaner-detail.e2e.ts` passes
