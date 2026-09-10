# 02: Polish round two — photo upload, Home layout, slower skeletons

**What to build:** Four changes asked for after testing round one on the simulator, plus one
correction from a reference screenshot.

**Blocked by:** 01

**Status:** done

## Acceptance criteria

- [x] The New Property form's "Tap to upload an image" tile actually picks a photo, on **both**
      mobile and web, and the picture is saved locally as base64 rather than uploaded anywhere.
      Expo does ship a picker — `expo-image-picker`, which covers iOS, Android and web (a file
      input on web) and can return base64 directly
- [x] The Quality center card is gone from Home
- [x] Skeleton loaders show for **1 second**, and only the first time each tab is opened
- [x] Home has 16px more padding above its first card, between it and the header band
- [x] From the reference screenshot: every card carries a visible shadow, and the horizontal
      spacing around the cards is larger

## Notes

- `expo-image-picker` is a **native module**, so the Detox dev client had to be rebuilt
  (`pnpm e2e:build`) before the picker worked on the simulator — the running build failed with
  `Cannot find native module 'ExponentImagePicker'` until then. The `expo-image-picker` config
  plugin is in `app.json` with a `photosPermission` string; iOS crashes on the permission request
  without one.
- "Only the first time each tab is opened" was already true before this ticket: `once()` holds the
  first load's promise per store, so a tab's skeletons appear once per session. Pull-to-refresh
  deliberately runs the fetch and its skeletons again.
- The shadow item was not a missing shadow. Ticket 02 sampled Home's page as white and recorded
  that its cards "separate by shadow alone" — a white card on a white page, so the shadow was
  invisible. Home now uses the same grey page as every other screen.
