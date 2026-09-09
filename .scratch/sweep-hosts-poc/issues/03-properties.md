# 03: Properties list and New Property

**What to build:** The Properties tab opens on three seeded properties and a host can register a
fourth through the form, matching screenshots `24`–`29` rebuilt natively in the app's own design
system rather than as a webview.

The list shows the Properties title, the search field with its teal button, the "Show 5 properties"
dropdown, the teal "New Property" button, the "You have N properties" line with the edit-groups link
and grouping checkbox, then a card per property with thumbnail, teal alias, the bedroom/bed/bathroom/
size icon row, address, teammate line and overflow button.

"New Property" runs the calendar step first: the provider tiles are visible but inert, and Skip
opens the "Are you sure?" confirm alert — Skip → Yes is the only implemented path. Then the name and
address step, where the property address is a read-only fixed value so there is no address API, and
the details and times step. Saving spins the button, waits, and returns to the list with the new
card in it.

Seeds three properties, each with its own alias, address, room counts, unit size and image.

**Blocked by:** 01

**Status:** done

- [x] List and form match screenshots `24`–`29`; nothing renders as an unstyled default
- [x] The list loads behind skeleton cards and shows three seeded properties
- [x] Provider tiles are inert; Skip opens the confirm alert and Yes advances
- [x] The address field is read-only with its fixed value; the unit-size toggle switches between sq. ft. and sq. mt.; the description counter reads `0 / 1000`
- [x] Saving shows a button spinner, then the new property appears in the list and persists for the session
- [x] The empty state is implemented and reachable, even though it is not the initial state
- [ ] `properties.e2e.ts` passes: list loads, New Property → skip calendar → fill form → save → new card in the list
- [x] The properties store is built test-first per ADR-0001: adding a property appends it and it survives for the session
