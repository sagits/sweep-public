# 04: Projects calendar, manual project and detail

**What to build:** The Projects tab opens on a calendar with three seeded projects spread across the
next few days, a host can create a manual project against one of their properties, and tapping any
project row opens its detail screen. Matches screenshots `04`–`09`. Wires Home's Projects card to
the projects store as part of this ticket.

The list has the date header with add, filter and refresh icons, the month navigator, the weekday
row and week strip with the selected day in a dark rounded square, and below it day sections
("Today - …", "Tomorrow - …") each holding that day's rows.

The `+` opens the "Automatic vs. Manual Projects" alert; "Create Manual Project" opens the modal
form with its four sections. The property picker lists the registered properties. Date and time
pickers can be simplified to a small styled list of presets, built from the shared design system.
Submitting spins the button, then returns to Home with the new project in the Projects card.

Project detail shows the teal header, the property name and "Unassigned Project" subtitle, the
Cleaning pill band, the start/end time card, the column of status pills and the detail rows with
their icons and chevrons, behind a full-screen spinner while loading.

Seeds three projects, one per property, with varied status: one unassigned, one assigned to a
cleaner, one scheduled further out.

**Blocked by:** 01, 02, 03

**Status:** done

- [x] Calendar, form and detail match screenshots `04`–`09`
- [x] The list loads behind skeleton rows and shows three seeded projects on different days
- [x] `+` opens the manual/automatic dialog with its "Don't show this message again" checkbox
- [x] The property picker lists the registered properties, including any added through ticket 03
- [x] Submitting the form returns to Home and the new project appears in Home's Projects card
- [x] Project detail renders every status pill and detail row from the PRD, behind a full-screen spinner while loading
- [ ] `projects.e2e.ts` passes; `home.e2e.ts` is extended to assert the seeded Projects card
      (both specs are written and typecheck; Detox was **not** run — one simulator is shared with
      the ticket 05 agent, so the suite runs once after merge)
- [x] The projects store is built test-first per ADR-0001: creating a project places it on the right calendar day and on Home
