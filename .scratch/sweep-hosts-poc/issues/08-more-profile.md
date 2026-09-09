# 08: More (profile)

**What to build:** The More tab shows the profile screen from screenshot `23`: the teal header with
help on the left and settings and logout on the right, the avatar with its edit badge, the hardcoded
name and email, and the white card of ten menu rows each with its icon. The footer has the
"Check for updates" link and the version label.

Every menu row renders but does nothing on tap, except Properties, which routes to the Properties
tab.

**Blocked by:** 01

**Status:** done

- [x] The screen matches screenshot `23`
- [x] All ten menu rows render with their icons; the version label reads `v1.44.3`
- [x] Every row is inert except Properties, which navigates to the Properties tab
- [ ] `more.e2e.ts` passes
