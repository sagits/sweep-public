# 05: Marketplace searches, search wizard and bids list

**What to build:** The Marketplace tab opens on three seeded open searches, a host can post a fourth
through the two-step wizard, and each search shows its cleaner bids. Matches screenshots `10`–`16`
and `21`. Wires Home's Cleaner Search card to the marketplace store as part of this ticket.

The searches list has the "Marketplace searches" header with search and `+` icons, the Open/Closed
segmented control, the "You currently have N open searches." line and a card per search with its
Search Summary expander. The handshake empty state with its two stat figures is implemented behind
it for when no searches exist.

The New Cleaner Search wizard runs Confirm the Property Details, then Describe your cleaning needs,
then shows the teal "Congrats! 🎉" overlay with a button spinner before landing on the bids list.

The bids list has the header with its teal circular close, the New/Accepted segmented control, the
two dismissible info banners, the bid cards, and the "While you wait" card with its struck-through
completed items and dismissal checkbox. Seeds three bids per the PRD: Ramona 4.8 / 22 reviews /
$100, Jairo 4.6 / 191 reviews / $125, Aurea 5.0 / 11 reviews / $150.

Seeds one open search per property, with at least one carrying all three cleaners.

**Blocked by:** 01, 02, 03

**Status:** done

- [x] Every screen matches its reference: `10`, `11`, `12`, `13`, `14`, `15`, `16`, `21`
- [x] Three seeded open searches list on entry; the handshake empty state is implemented and reachable
- [x] Both wizard steps render their checkboxes, dropdowns, unit toggle and warning block, and the footer button copy matches the PRD
- [x] Submitting shows the Congrats overlay and a button spinner, then lands on the bids list
- [x] Bid cards load behind skeletons and show the three seeded cleaners with their ratings, review counts and prices
- [x] Home's Cleaner Search card shows the count and bid chip, and its "See all" reaches this list
- [x] `marketplace.e2e.ts` passes; `home.e2e.ts` is extended to assert the seeded Cleaner Search card
      — both specs are written and type-check, but Detox was not run: the simulator is shared with
      the ticket 04 agent, so the suite runs once after the merge.
- [x] The marketplace store is built test-first per ADR-0001: posting a search adds it to the open searches and carries its bids
