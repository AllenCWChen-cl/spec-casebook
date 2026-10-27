# AI Mini Drama (iOS) — what the phone needs before a run

The repository holds everything a run reads on the computer (table, `phases.json`, run plans, recipes, scripts). This
list is what has to be on the phone or the account instead, because it can't be committed: photos stay out of git,
and accounts and builds belong to the team. Set these up once per phone; earlier runs used the QA iPhone's own
library.

## App, build and account

- The QA build of PowerDirector under test, installed from TestFlight, with the Pink debug menu (QA builds only).
  The Testing Request (TR) for that build in ECL names the build number the run checks.
- Signed in with the team's shared QA test account (ask the team for it; never stored in this repo, never typed by
  the agent). It holds about 20,000 credits; `phases.json` → `unavailable` lists what this account can't provide
  (low balance, new account).
- Developer Server, Write Log and the tier are set by `app-setup.ts` at the start of a run (tier Pro+ by default).

## Photos in the library

| Photo | Used by | Notes |
| --- | --- | --- |
| A clear photo of one person, face visible | TC-049, TC-128 – TC-131, TC-137, TC-317 (two different ones) | Any non-famous person; a second photo for TC-317's replace step |
| A photo with three people | TC-052 | Faces large and unobstructed: an overhead photo with small faces was read as 「No person detected」 (O-8, 10/19) |
| A photo with no person (landscape, object) | TC-053 | |
| A photo of a well-known public figure | TC-054 | Any widely recognized celebrity photo |
| A distinctive photo, subject and orientation easy to tell | TC-283 | Checks the reference preview shows the photo picked |
| A photo with an easily recognized object near one edge | TC-366 | The crop removes it; the result must not show it |
| An AI-generated character sheet (front/side/back of one made-up character) | TC-332 setup | A generated look, not a real person (O-18, 10/22) |

The public-figure check can also block photos of non-famous people (O-16, 10/22); if a "one person" photo is
refused that way, use another.

## Phone settings

- Photos access for PowerDirector: Full Access (`first-launch` answers the prompt).
- Auto-Lock: Never during a run; Wi-Fi on (offline cases turn it off and back on over USB).
- Developer Mode and Settings › Developer › Enable UI Automation on; the WebDriverAgent certificate trusted (README,
  Setup step 4).
