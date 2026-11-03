# Launcher (Home tab)

## KP-010 Launcher layout
- kind: fact · platform: ios · use: analysis, run · tags: launcher, layout
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

Top to bottom: a single hero banner with ☰ (left) and 🔔 (right) drawn over the image; big shortcuts New Project ·
Video Edit by Chat · Video Enhance (stay pinned when scrolling); 8 round small-shortcut tiles with HOT/NEW tags and a
two-part page indicator; rows What's Trending, Meme Dance Creator, AI-Powered Creation and Recent Projects, each with
「View more ›」. Bottom nav: Home · AI Magic · Template · Project · Mine.

## KP-011 Design 8/E is the leading Launcher sheet
- kind: fact · platform: both · use: analysis · tags: launcher, design
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

Of the Launcher Design sheets, 「Template Page - Launcher supports banner (TBD) (8_E)」 matches the build (three content
rows, five bottom tabs, 「View more」). Older sheets drawing 「See All」, four tabs or two rows are superseded: never
file against them. The big-shortcut list follows 8/E F14 (…Video Enhance), not F04 (…Cinematic Reel Creator).

## KP-012 Shortcut tiles come from the CMS
- kind: fact · platform: both · use: analysis, run · tags: launcher, cms
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

Which tools the Launcher's small shortcuts show (and in what order) is set on the CMS (Design: 「Shortcut on CMS」), up to
16 tiles over two pages. A tile list that differs from the Design is not a defect; reach a tool through AI Magic when
it is not on the first page.

## KP-013 Launcher View more destinations
- kind: rule · platform: ios · use: analysis, run · tags: launcher, navigation · authority: observed
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

What's Trending 「View more」 opens Template › For You; AI-Powered Creation 「View more」 opens the AI Magic tab (as the
Design says). Meme Dance Creator 「View more」 also opens the unfiltered Template › For You, which no spec settles
(ISS-LAU-04, a PM question). Recent Projects 「View more」 opens the Project tab, even when it is empty.

## KP-014 Hero banner changes per launch, not by timer
- kind: rule · platform: ios · use: analysis, run · tags: launcher, banner · authority: observed
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

The hero banner does not auto-rotate and has no page dots; Design 8/E F04 rotates it by app launch count (1st launch
1st banner, 2nd launch 2nd…). Seen static on warm resume; rotation over cold launches is not yet verified.

## KP-015 Home keeps its scroll position
- kind: rule · platform: ios · use: run · tags: launcher, navigation · authority: observed
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

Switching tabs and coming back, or leaving the editor with ⌂, returns to Home at the same scroll position. Tapping the
selected Home tab again does not scroll to the top (ISS-LAU-08): swipe down to reach the top.

## KP-016 Scrolling up does not collapse the Launcher as designed
- kind: risk · platform: ios · use: analysis, run · tags: launcher, scroll
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

ISS-LAU-01 (High): Design 8/E F04/F14/F23 collapse the banner and small shortcuts on scroll and show an expand CTA;
the build only pins the big shortcuts, the small-shortcut tiles slide under them cut in half and no expand CTA
exists. Vary scroll depth and scroll-back when testing anything on the Launcher.

## KP-017 Small-shortcut grid cannot be paged
- kind: risk · platform: ios · use: analysis, run · tags: launcher, shortcuts
- source: exploration KB launcher-home.md (text-to-image dive 2026-09-18, 16.7.5 build 188977)

ISS-LAU-12 (Medium): the page indicator shows two pages but no gesture reaches the second; the tiles themselves respond
and the What's Trending row scrolls. A tool only on page 2 can't be opened from Home: use AI Magic, and check the
page-2 tiles by hand.

## KP-018 Backing out of Add Media leaves an empty editor
- kind: quirk · platform: ios · use: run · tags: launcher, editor, project
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

New Project › Add Media › back does not return to Home: it stays in an empty editor (「Tap to insert media on main
track.」, 0:00/0:00, Export grey; ISS-LAU-06). A project abandoned with no media is not saved to Recent Projects.

## KP-019 Repeated taps open one page
- kind: rule · platform: ios · use: analysis, run · tags: navigation, debounce · authority: observed
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+); exploration KB mine-page.md (16.8.0 build 188407, 2026-09-01)

A fast double tap on 「New Project」 opens one Add Media, and a rapid triple tap on a Mine row pushes exactly one page.
A doubled page or duplicated stack after fast taps is a defect.

## KP-020 Home ☰ menu
- kind: fact · platform: ios · use: analysis, run · tags: launcher, menu, mine
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+); exploration KB mine-page.md (16.8.0 build 188407, 2026-09-01)

☰ pushes a full page: Tutorials & Tips · My Artwork · Produced Videos · Demo Videos · Notification; Settings:
Preferences · User Sign in; Information: Send Feedback · About · YouTube · Instagram. Preferences, About, Send
Feedback, Tutorials & Tips and Produced Videos are reachable only here, not from Mine (ISS-MP-18).

## KP-021 Project card menu
- kind: quirk · platform: ios · use: run · tags: launcher, project
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

A project card (Recent Projects, Project tab) shows date and time, ratio, duration, size and ⋮. ⋮ offers Rename and
Delete with no Cancel and Delete not styled destructive (ISS-LAU-05): close it by tapping the scrim, never by guessing
a row.

## KP-022 Home shows no credit balance
- kind: fact · platform: ios · use: run · tags: launcher, credits
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

Home is the only top-level tab with no credit pill (ISS-LAU-07); AI Magic, Template, Mine and every tool page show
one. Read the balance there.

## KP-023 Meme Dance Creator
- kind: term · platform: both · use: analysis, ebug · tags: launcher, naming
- source: exploration KB launcher-home.md (deep dive 2026-09-16, 16.7.5 build 188977, Developer Server, Pro+)

The Launcher's second row is 「Meme Dance Creator」 in the build. Design 8/E and the more-content-promotion sheet also
say 「Meme Dance Generator」; use the build's name and don't file the difference (a spec self-contradiction for PM).
