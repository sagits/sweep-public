# Sweep Hosts — polish pass, as requested

Captured verbatim from the request on 2026-09-09, so the original wording survives any
rewriting into tickets. The ticket is `issues/01-polish-pass.md`.

- make the unselected tab items icon and text color grey (find a grey from the app color tokens)
- change the more tab icon for a profile icon
- add skeleton loaders to home, projects, marketplace, payments, properties. Show them for 0.5sec
- add pull to refresh to all tabs
- there is a congrats screen that is shown when you create a bid to find a cleaner, replace it with
  an alert dialog with a loading spinner that will show for 1 sec and them go to the screen showing
  the cleaners available. make it similar to this one but without the button and a loading spinner
  in place of the icon. text can be loading and subtitle "Searching for cleaners"
- on projects tab, on the days list below the week days, if a day has no scheduled cleanings, show
  a empty line below date (so it dont look like a lot of dates one below the other without any
  separation). keep the same horizontal padding on the line as the dates that have cards
- payment history screen has strange font size on navigation bar title and strange navigation bar
  icon sizes. Make it match the rest of the app
- find real house images to use as placeholder images for the properties, download the images to
  the project
- when adding a property, make the air bnb and other providers buttons clicable, but they will all
  lead to the same screen as the skip button (manual registering
- remove payment toolbar button, add an dollar sign icon on home screen navigation bar icons that
  will open the payment history screen
- edit the necessary tests for the features above or if you cant edit an existing test, add tests
  for the features above

## Follow-up on the loading dialog

> i mean something like this for the loading dialog: [`loading-dialog-reference.png`] (a loading
> spinner instead of the icon, no button, make it follow the apps design system and colors

The reference is a generic React Native custom alert: a centred white rounded card over a dimmed
scrim, a large circular icon at the top, a line of text, then a full-width button. Take the shape,
not the colours — the blue and red in it are not ours.
