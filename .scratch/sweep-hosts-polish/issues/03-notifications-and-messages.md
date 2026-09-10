# 03: Notifications and Messages screens, reached from Home

**What to build:** The two screens behind Home's header icons, plus the chat behind a message row.
Four reference screenshots in `poc/screenshots/3/`.

**Blocked by:** None — 01 and 02 are done.

**Status:** done

## The request, verbatim

> add a ticket to show the notifications screen when tapping on notification icon on home screen
> navigation bar and when tapping on any area of notification card on home screen. On the same
> ticket also show the messages screen when pressing on messages icon no home navigation bar. image
> IMG_0032 appears when you press on a message on message screen and when you press its cta, it
> shows IMG_0033.

## Entry points

`src/home/HomeHeader.tsx` has `home.bell` and `home.messages` as decorative `Pressable`s today;
give them `onPress` the way `home.payments` already has one. `NotificationsCard` needs the whole
card pressable, not just its `home.notifications-see-all` action — both routes lead to the same
screen.

## Acceptance criteria

- [x] `home.bell`, any part of `home.notifications-card` (including `home.notifications-see-all`),
      and `home.messages` navigate to `/notifications`, `/notifications` and `/messages`
- [x] **Notifications** (`IMG_0030.PNG`): pushed screen wearing `ScreenHeader` — back chevron,
      "Notifications", a gear on the right (inert, like the Payments filter). Below it a grey
      rounded search field, "Search notifications", that filters the list on `message`; then a
      teal check + "Mark all as read" row; then the rows
- [x] A notification row is: a teal rounded-square icon tile, the message, a relative stamp
      ("3 hours ago"), a chevron, hairline separators. Unread rows sit on a mint tint, read rows on
      white. The row itself is inert — the chevron is decoration, there is nowhere to go
- [x] Unread is real state: `Notification` gains `read: boolean`, `useNotifications` gains
      `markAllRead()`, and Home's bell badge counts **unread** rather than all notifications. Seed
      the three existing notifications unread
- [x] The two icons come from a `kind: 'alert' | 'bid'` field on `Notification` —
      `alert-outline` for the unassigned-project row, `handshake` for the bid row. Pick either for
      the invitation row and say which
- [x] **Messages** (`IMG_0031.PNG`): `ScreenHeader` — back chevron, "Messages", an inert magnifier.
      One row per bid across every open search: square avatar (the cleaner's `photo` emoji, as
      elsewhere), bold name, teal "Bid Pending", and "No messages yet." underneath. No new store —
      read `useMarketplace`, and show the marketplace empty state's wording if there are no bids
- [x] Two full-width teal buttons pinned under the list: "Find a Cleaner in the Marketplace" →
      `/marketplace`, and "Invite Teammates" (inert, like Home's invite card)
- [x] **Chat** (`IMG_0032.PNG`), from tapping a message row: a header of back chevron, avatar,
      cleaner name and "Last seen Yesterday, 11:36 PM"; a strip with a pin + the search's
      `propertyAlias`, a money icon + `$100.00 per project`, and "Bid expires in:" with the expiry
      in red; a full-width teal "Bid Details" button (inert, or straight to the cleaner detail —
      your call, record it)
- [x] Under that, the "How to use our chat" card: "Ask questions" (teal check), "Don't share
      contact information" (red no-entry, "Terms of Service" underlined and inert), "Accept the
      cleaner's bid" (teal check), each with the reference's paragraph; then the blue info line
      "This chat is monitored by our Customer Support team for quality assurance."; then a
      full-width teal "I agree" at the bottom
- [x] Pressing "I agree" swaps the card for `IMG_0033.PNG`: an orange card, warning triangle +
      "Finish setting up your account", the reference's body copy, and a lighter-orange "Set up my
      account" button (inert). The composer appears at the bottom, disabled, placeholder "Please
      finish setting up your account to chat with this cleaner", grey send arrow. Header and bid
      strip are unchanged between the two states
- [x] The agreement is per-conversation and in-memory only — going back and in again may show it
      again; nothing persists
- [x] Tests per `docs/adr/0001`: TDD for the `useNotifications` unread/`markAllRead` change and the
      notification mock, RNTL for the three screens' render and press wiring, and Detox for the
      four navigations (bell → Notifications, card → Notifications, messages icon → Messages, row →
      chat → I agree → composer)

## Notes

- Nothing here is a chat. There is no message store, no sending, no thread — every reference state
  is either "No messages yet." or the account-setup block, so the composer never needs to work.
- The reference keeps the tab bar visible on Messages. Ours pushes outside `(tabs)`, like
  `/payments`, so the tab bar will not show. Follow the `/payments` precedent unless it looks
  wrong on the simulator.
- `Bid` has `expiresInDays`, not hours — print it with the same wording `BidCard` already uses
  rather than adding an hours field for one screen.
- `$100.00 per project` in the reference has cents; `BidCard` prints whole dollars. Match the
  reference on this screen only if it is free; otherwise reuse the existing formatter and say so.

## Comments

Implemented on `sweep-hosts-polish`. Every acceptance criterion is ticked; the calls the ticket
left open are recorded in `DECISIONS.md` under "Notifications and Messages".

The three open questions, answered:

- **The invitation row's icon** is `handshake` (`kind: 'bid'`) — a team joining up reads like a
  bid being agreed, and the alert triangle stays with the one row that is genuinely a warning.
- **"Bid Details"** pushes `/cleaner/[id]` rather than sitting inert: that screen *is* the bid's
  details, it is addressed by the same bid id, and the route already existed.
- **`$100.00 per project`** keeps the reference's cents. It was cheaper than free — `PaymentList`
  and `CleanerProfile` had each written the same formatter, so it became `usd` in `@sweep/ui` and
  all three now share it.

Two things the reference asked for that the implementation had to adjust:

- The bid strip's price is 17px and its expiry 15px, not 19/17. The reference sets that row in a
  narrower typeface than the system one; at matching sizes the two halves do not both fit across
  390pt — the price wrapped and pushed the rules card below the fold, and forcing one line
  clipped "2 days" off the right edge instead.
- The pinned buttons needed a bottom safe-area inset. A pushed screen has no tab bar to hold the
  home indicator off, and the first render put "Invite Teammates" underneath it. `PinnedFooter`
  in `@sweep/ui` now does what `TabBar` already did, for Messages' buttons, "I agree" and the
  composer.

Tests, per ADR-0001:

- TDD: the `read`/`kind` seed (`packages/mocks/src/notifications.test.ts`) and the store's
  `markAllRead` plus read-survives-reload (`src/stores/useNotifications.test.ts`).
- RNTL: `NotificationList` (filter, mark-all-read, unread tint, skeletons), `MessageList` (rows,
  press wiring, empty state) and `Chat` (header, bid strip, agree → composer).
- Detox: `e2e/notifications.e2e.ts` and `e2e/messages.e2e.ts` — 8 tests, all four navigations
  plus the mark-all-read round trip. Verified on the simulator against all four references.

### Review round

A two-axis review (standards + spec) ran against the finished diff. One real bug and five
smaller findings, all fixed; recorded under "### Review fixes" in `DECISIONS.md`.

The bug: **Messages showed the Marketplace empty state while the searches were still loading** —
the screen read `searches` but never `loaded`, so a cold open flashed the "Find a New Cleaner"
illustration for the mock's delay before the bid rows arrived. `MessageList` now takes `loading`
and renders skeletons, and both Detox specs gained the loading assertion ADR-0001 asks for
("skeleton or spinner visible, then `waitFor` the loaded content"), which is what would have
caught it.

Also fixed: the borrowed empty state no longer ships its own CTA (a third, undeclared
navigation — `onFindCleaner` is optional now); the Detox scroll matcher went back to `by.text`
per DECISIONS 02; the empty `.unread` node that existed only as a test hook is gone, along with
the layout assertion ADR-0001 excludes; `await flush()` follows every `fireEvent` per
DECISIONS 03.

Final state: Jest 114/114, Detox 58/58, `tsc` and `expo lint` clean, all four reference screens
checked on the simulator.
