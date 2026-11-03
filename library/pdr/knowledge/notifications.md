# Notification centre

## KP-024 Notification page
- kind: fact · platform: ios · use: analysis, run · tags: notification
- source: exploration KB home-notification.md (short blind run 2026-09-04, Developer Server, VIP; rechecked 2026-09-16, 16.7.5 build 188977)

The bell (Launcher top right, also on Mine) pushes 「Notification」: about a dozen dated marketing entries, newest
first. Each row is an accordion (date, title with emoji, chevron) opening to body text and a 「Try Now」 link; several
can be open at once, and all are collapsed again on re-entry.

## KP-025 Bell badge clears on entry
- kind: rule · platform: ios · use: analysis, run · tags: notification, badge · authority: observed
- source: exploration KB launcher-home.md (2026-09-16, 16.7.5 build 188977); exploration KB home-notification.md; exploration KB mine-page.md (2026-09-01)

The bell carries a red dot that clears as soon as the Notification page opens, even if no entry is expanded. The list
has no per-entry unread mark and no 「mark all read」 (ISS-LAU-09, ISS-MP-16). The 2026-09-04 note of "no badge" is
superseded by the 2026-09-16 recheck.

## KP-026 Try Now back lands on Home
- kind: risk · platform: ios · use: analysis, run · tags: notification, navigation, deeplink
- source: exploration KB home-notification.md (2026-09-04, 2/2)

ISS-PDRI-N02 (Medium): 「Try Now」 into an in-app page, then ‹, lands on Home instead of the Notification list, losing
the open rows. Returning from Safari with 「◀ PowerDirector」 keeps them. The same back-stack gap shows on the AI result
page (KP-058); check back from every in-app deep link.

## KP-027 Try Now may leave the app
- kind: quirk · platform: ios · use: analysis, run · tags: notification, deeplink
- source: exploration KB home-notification.md (2026-09-04)

Identical 「Try Now」 links open either an in-app page (a template) or Safari (a YouTube video) with no external-link
mark or warning (ISS-PDRI-N03). Only 2 of about 12 were sampled.

## KP-028 No Design for the notification centre
- kind: question · platform: both · use: analysis · tags: notification, design
- source: exploration KB home-notification.md (2026-09-04, Figma index searched)

No Design sheet covers the notification centre. Open for PM/Design: what 「Try Now」 may open (external sites, a mark
or confirmation), per-entry unread state, multi-open accordions, refresh frequency and paging.
