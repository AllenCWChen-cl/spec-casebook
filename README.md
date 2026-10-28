# PDR Spec Casebook

A workspace for turning CyberLink **PowerDirector Mobile** feature specs (PM, Design and MX files, usually huge
Figma-export PDFs) into a plain, reviewed **test-case table**: one row per check, each with an **Action** and an
**Expected Result**, like the SFT/BFT checklists. A person reviews the table in the browser and saves it; the saved
table becomes that feature's **correct answer** for one platform (iOS or Android).

The same workspace then runs the table on the real QA iPhone through Appium, records every case, and drafts and files
eBugs for the failures, always waiting for a person to sign off before anything reaches ECL.

Two things matter most: a **complete, thorough analysis** of the spec files, which finds every rule on its own, and
an **on-device run that doesn't drain tokens**. Completeness comes from refining how the spec is read and analyzed:
when a run, a reviewer or RD shows a missed rule, the analysis step that skipped it is fixed for every future spec.
The table is never built by covering another tool's cases; a comparison with the spec agent is a report made only on
request.

You drive it in plain language through an AI coding agent (Claude Code or Codex). The agent follows the skills in
this repository; the TypeScript scripts in `scripts/` do the mechanical parts (reading the spec, checking the table,
serving the review page, driving the phone, logging results).

The repository is self-contained: everything a table, a run or a filing needs is in it, and it needs no other
QA repository. It is deliberately simpler than the spec-contract runner: the output is one CSV per feature and platform that a tester
can read without the spec, not contract catalogs and claim files.

---

## Contents

- [How it fits together](#how-it-fits-together)
- [Key concepts](#key-concepts)
- [Rules that apply to every table and run](#rules-that-apply-to-every-table-and-run)
- [Setup](#setup)
- [Using the casebook](#using-the-casebook)
  - [Building or updating a table](#building-or-updating-a-table)
  - [Running a table on the phone](#running-a-table-on-the-phone)
  - [Filing eBugs](#filing-ebugs)
  - [Live pages](#live-pages)
- [Repository layout](#repository-layout)
  - [Inside a feature folder](#inside-a-feature-folder)
- [Features in this repository](#features-in-this-repository)
- [Skills](#skills)
- [Scripts](#scripts)
- [What is not committed](#what-is-not-committed)
- [Contributing](#contributing)
- [Further reading](#further-reading)

---

## How it fits together

```mermaid
flowchart LR
    A[Spec files<br/>PM / Design / MX PDFs] --> B[Fingerprint<br/>new · same · changed]
    B --> C[Read the spec<br/>render + OCR every board]
    C --> D[Coverage passes<br/>+ standing inputs]
    D --> E[Value check]
    E --> F[Draft table<br/>+ requirements + update plan]
    F --> G[Review page<br/>edit · keep · delete]
    G -->|Save| H[Approved table<br/>cases.csv vN]
    H --> I[On-device run<br/>phases · segments · logs]
    I --> J[eBug drafts<br/>+ review page]
    I --> P[Coverage page<br/>controls · arrows · tap proof]
    J -. after sign-off .-> K[Filed in ECL<br/>read back]
    I -. gaps and findings .-> D
```

| Stage | What happens | Main output |
| --- | --- | --- |
| **Fingerprint** | The spec files are hashed and compared with the approved table: `NEW`, `SAME` (offer to reuse it) or `CHANGED` (update plan). | JSON on screen |
| **Read the spec** | Each spec set is copied into the feature's library. Every board of the Figma PDF is rendered to tiles and OCR'd (English, Traditional Chinese, Japanese), then read board by board. The Design Figma file is also read directly: every screen, dialog, tappable control and flow arrow, reviewed on sheets before use. | `specs/<date>/extracted/`, `inventory.json` |
| **Coverage passes** | Eleven passes find what a board-by-board reading skips: flow arrows, states of every generation job, field rules, numbers, persistence, MX flows, PM-only features, exits × stages, hidden clauses, variants, and every control (each one pressed by a row, every input dismissed). | `requirements.md` sections, `control-trace.json` |
| **Standing inputs** | Re-applied on every draft: the request ledger, open and resolved eBugs, RD build notes on the Testing Request, the template roster and earlier run findings. | `requests.md`, regression rows |
| **Value check** | Merges duplicates, drops checks with no expected result or nothing visible in the app, retires passed one-build checks, parks rows that need an unavailable fixture. | `update-plan.md` → "Not added" |
| **Review** | A local page shows every row with its change against the approved table. You edit, keep or delete rows and save. | `cases.csv`, `history/vN.csv` |
| **Run** | The table runs in phases and segments on the QA iPhone; every case is recorded with evidence, app logs and credit-ledger reads. | `runs/<date>-<phase>/` |
| **eBugs** | Failed cases become eBug drafts, deduplicated against ECL, shown on a review page, and filed only after your sign-off. | `ebugs/<date>/` |
| **Coverage** | The Figma boards with every control and flow arrow marked pressed, blocked, planned or excluded, with the tap screenshots as proof. | `coverage.html` (live page) |

## Key concepts

| Term | Meaning |
| --- | --- |
| **Feature / platform** | A feature ID in kebab-case (`ai-mini-drama`) and a platform (`ios`, `android`). Each pair has its own table, reviewed and approved separately. |
| **Spec set** | The group of spec files received together, stored as `library/<feature>/specs/<date>/` with names, sizes and SHA-256 in `spec-set.json`. The same files again reuse the folder. |
| **Board** | One titled frame group on a Figma-export page (Main flow, Error Handling, each dated update board). Boards are listed in `boards.json` and read one at a time. |
| **Requirement** | One testable statement from the spec, `R-001`, with its source tag (`[PM:<board>]`, `[DS:<board>]`, `[MX:<board>]`, a flow-arrow node, a ledger entry or a build note). |
| **Case (row)** | `TC-001`: Section, Precondition, Action, Expected Result, Priority, Spec Ref, Notes. IDs are never reused or renumbered. |
| **Approved table** | `cases.csv`, the feature's correct answer. Changed only through the review page's Save or an explicit request. Each save is a new version. |
| **Draft** | A proposed change: `draft.csv` with a `Change` column (`new`, `modified`, `removed`, `unchanged`), `requirements.md`, `update-plan.md` and the script that built it. |
| **Request ledger** | `library/<feature>/requests.md`: every request from you, a colleague, a reviewer or RD, numbered `REQ-001`… and re-applied on every draft. |
| **Control group** | A tappable element of the Design, counted once: the same button on many screens is one group, and a choice list (chips, cards) is one group that any one choice covers. `control-trace.json` names the rows that press each group, or why it is excluded. |
| **Job-state grid** | A table in `requirements.md` listing, for every generation job, which rows check its start, success, failure, retry, Stop, leave-and-return, wait and done notice. |
| **Phase / segment** | A run is split into phases (P1 core, P23 regression and flows, P4 templates, …) and each phase into segments of 10–40 cases, one clean agent context per segment. |
| **Result / disposition** | Pass, Fail, Blocked, Inconclusive or Not run. Every Fail and Blocked carries a disposition: `defect`, `spec-addition`, `question`, `observability` or `test-data`. |

## Rules that apply to every table and run

The full list is in [`AGENTS.md`](AGENTS.md) (team preferences) and the casebook skill. The ones that shape every
table:

- **Design and PM disagree → the newer one wins.** Dated update boards and frame labels decide. When the dates can't
  tell, the row starts from the Design spec, is marked "check on device", and is decided after the app is checked.
  The MX spec sits between Design and PM.
- **PM-only features are cases.** Anything the PM spec states that the Design spec doesn't draw yet becomes rows now,
  marked "PM-only: no Design frame yet", and is updated when the Design spec draws it.
- **Credit numbers in the spec are binding.** A different price is a Fail, not a mock value.
- **Every request goes in the ledger** the same session it is made, and `check.ts` fails a draft that leaves one
  uncited.
- **The repo stays independent** of the exploration-test folder, the spec agent and other QA tools.
- **Table rows are written in English;** UI strings are quoted exactly as the spec shows them.

And every run on the phone:

- **Appium + XCUITest + WebDriverAgent on the real QA iPhone.** No simulator.
- **No purchases**, sandbox included, unless you approve one for the run. Never type a password.
- **Fault switches** in the Pink debug menu: 「Fail turn」 fails a chat turn; 「Inject failure status」 only affects a
  video beat once filming starts; Trip image moderation fails character and scene images. Bugs found with a switch on
  are re-checked with every switch off.
- **Wi-Fi** may be turned off for offline cases once the phone is confirmed on a USB cable; restore it right after.
- **Nothing is filed in ECL without your sign-off** on the eBug review page, and existing tickets are never commented
  on, reopened or rejected.

## Setup

### 1. Clone

```bash
git clone git@github.com:ethan-hsu-cl/spec-casebook.git
```

On Windows, clone with line-ending conversion off, so the CRLF tables and LF scripts are committed back as they are
(otherwise every `cases.csv` you save shows up as a whole-file change):

```bash
git clone -c core.autocrlf=false git@github.com:ethan-hsu-cl/spec-casebook.git
```

### 2. Install

You need **Node 22.18 or newer** (it runs the TypeScript scripts directly), **Git** and **Python 3** for the eBug
scripts. The full workflow needs **macOS**; Windows covers everything except reading new spec PDFs and iPhone runs:

| Step | macOS | Windows |
| --- | --- | --- |
| Tables: `status`, `fingerprint`, `add-spec`, `new-draft`, `check`, `review`, `export`, `annotations`, `spec-agent-gaps` | ✓ | ✓ |
| Rendering spec frames (`render-region.ts`, `render-tiles.ts`) | ✓ | ✓ |
| Reading a new spec set (`spec-boards.ts`: OCR through Apple's Vision framework and `swift`) | ✓ | ✗ (run it on a Mac and pull the committed `extracted/` text) |
| Run log, log slicing, run plan page (`run-log.ts`, `log-slice.ts`, `plan-page.ts`) | ✓ | ✓ |
| Control inventory, review sheets, control trace, coverage page (`inventory.ts`, `inventory-sheets.ts`, `controls.ts`, `coverage-page.ts`) | ✓ | ✓ |
| iPhone runs (`device.ts`, `app-setup.ts`: XCUITest, `xcrun`, `ditto`) | ✓ | ✗ |
| Android runs | see [Phone (Android)](#4b-phone-android) | see [Phone (Android)](#4b-phone-android) |
| eBug drafts, format check, filing | ✓ | ✓ |

```bash
npm install
```

The eBug scripts use Python's standard library, except the evidence sheets (`make_filing_sheets.py`), which need
Pillow. Install it in a local venv (git-ignored):

```bash
python3 -m venv .venv
```

```bash
.venv/bin/pip install -r requirements.txt
```

On Windows: `py -3 -m venv .venv`, then `.venv\Scripts\pip install -r requirements.txt`.

If the npm cache errors, add `--cache /tmp/npm-cache` (Windows: `--cache %TEMP%\npm-cache`). PDF rendering uses
MuPDF's WebAssembly build (`mupdf` on npm, AGPL); macOS's own renderer draws these large Figma pages blank.

**Windows notes**

- Install Node from <https://nodejs.org> (LTS, 22.18 or newer), Git for Windows (Claude Code on Windows uses its Git
  Bash) and Python 3 from <https://python.org> or `winget install Python.Python.3.12`.
- Run the commands from the repository root in PowerShell or Git Bash; `node scripts\status.ts` and
  `node scripts/status.ts` both work.
- Python is usually `python` or `py -3`, not `python3`; use that wherever the skills write `python3`.
- `~` in these docs is your user folder (`%USERPROFILE%`, e.g. `C:\Users\<you>`).

### 3. Check it works

```bash
node scripts/status.ts
```

It lists every approved table and open draft.

### 4. Phone (iPhone, only for on-device runs)

macOS only. The scripts drive the real QA iPhone through Appium's XCUITest driver; Appium builds and launches
WebDriverAgent (WDA) on the phone with Xcode. The scripts reuse a live session and never stop Appium or WDA.

One-time setup on the Mac:

1. Install **Xcode** from the App Store, open it once to finish installing its components, and sign in under
   Xcode › Settings › Accounts with an Apple ID in the team that signs WDA (the QA team, `LR55RBG94F`, by default).
2. Install Appium and its iOS driver:

   ```bash
   npm install -g appium
   ```

   ```bash
   appium driver install xcuitest
   ```

3. On the iPhone: install the QA build of PowerDirector from TestFlight; connect it by USB and tap **Trust** on the
   phone; turn on Settings › Privacy & Security › **Developer Mode** (the phone restarts) and then Settings ›
   Developer › **Enable UI Automation**; set Settings › Display & Brightness › Auto-Lock to **Never** for runs.
4. Start Appium in its own terminal and leave it running (port 4723):

   ```bash
   appium --relaxed-security
   ```

5. Set the variables below and run `node scripts/device.ts <run dir> start`. The first start builds WDA (a few
   minutes). When it fails with an untrusted-certificate BLOCKER, open Settings › General › VPN & Device Management ›
   the Developer App certificate › **Trust** on the phone, then start again.

Then set up what the phone itself needs for the table you run: the build, the shared QA account and the photos the
upload cases pick, listed in `library/<feature>/<platform>/fixtures.md` (none of it can be committed).

After that, every segment begins with `device.ts <run dir> restart`. Never uninstall WDA from the phone: the phone
then forgets its trust in the certificate (step 5 again).

Set these in your shell before the first `device.ts start` of a run (the run folder then remembers the UDID in
`.udid`):

| Variable | What it is | Default |
| --- | --- | --- |
| `PDR_UDID` | Your phone's UDID (`xcrun xctrace list devices`); or pass it to `device.ts start <udid>` | none, required |
| `PDR_WDA_TEAM` | Apple team ID that signs your WebDriverAgent | `LR55RBG94F` |
| `PDR_WDA_BUNDLE` | Bundle ID of your WebDriverAgentRunner | `com.cyberlinkqa1-4.WebDriverAgentRunner` |

The defaults are the team's QA signing account; set the two WDA values only if you signed WebDriverAgent under
another account, or WebDriverAgent will not start.

```bash
export PDR_UDID=<your phone UDID> PDR_WDA_TEAM=<team ID> PDR_WDA_BUNDLE=<bundle ID>
```

### 4b. Phone (Android)

Android runs use `scripts/device-android.ts` (Appium + UiAutomator2) with the same commands as `device.ts`. One-time
setup on the Mac (no shell-profile changes needed; the script has these defaults):

```bash
brew install --cask android-platform-tools android-commandlinetools
brew install openjdk@17                      # keg-only JDK; the temurin cask needs sudo
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ANDROID_HOME=$HOME/Library/Android/sdk
yes | sdkmanager --sdk_root=$ANDROID_HOME --licenses
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "build-tools;35.0.0"
appium driver install uiautomator2
```

On the phone (the user does these; they are system settings): Developer options › **USB debugging** on, accept
「Allow USB debugging?」 with *Always allow from this computer*, a screen lock of None or Swipe (a PIN lock stops the
script with BLOCKER), and **Stay awake** on (Developer options) or Screen timeout at its longest for a run. Check with
`adb devices -l` (state `device`, not `unauthorized`).

`device-android.ts start` starts its own Appium server on port 4724 (log `~/Library/Logs/appium-android-4724.log`)
when none answers, so the iOS servers on 4723/4725 are never restarted. UiAutomator2 installs its server apps on the
phone and relaxes the hidden-API policy while a session is open (restored when the session ends).

| Variable | What it is | Default |
| --- | --- | --- |
| `PDR_SERIAL` | adb serial (`adb devices -l`); or pass it to `device-android.ts start <serial>` | the only adb device |
| `PDR_ANDROID_PACKAGE` | PowerDirector's package | `com.cyberlink.powerdirector.DRA140225_01` |
| `APPIUM_ANDROID_URL` | Android Appium server | `http://127.0.0.1:4724` |
| `ANDROID_HOME`, `JAVA_HOME` | SDK and JDK for that server | `~/Library/Android/sdk`, Homebrew `openjdk@17` |


On Windows (no Homebrew), the same pieces come from these sources; the phone side needs:

- A QA build of PowerDirector on the Android phone, with Developer options › **USB debugging** on and the computer
  allowed when the phone asks.
- **Android SDK Platform-Tools** (`adb`): from Android Studio's SDK Manager, or `winget install Google.PlatformTools`
  (Windows) / `brew install --cask android-platform-tools` (macOS). `adb devices` must list the phone as `device`.
- For Appium-driven runs: **Java 17** (`JAVA_HOME` set), `ANDROID_HOME` pointing at the SDK folder, and Appium with
  the UiAutomator2 driver:

```bash
npm install -g appium
```

```bash
appium driver install uiautomator2
```

```bash
appium --relaxed-security
```

Set an environment variable for the session in PowerShell with `$env:NAME = "value"`, in Git Bash or macOS with
`export NAME=value`.

### 5. Figma (for spec analyses)

Each analysis lists the Figma file's dated frames, because PDF exports can lag behind it, and reads the Design file's
screens, controls and flow arrows for the control inventory. Connect Figma to your agent through Figma's MCP server
(Claude Code: add the Figma connector or MCP server; Codex: add it under `mcp_servers`). This is an online service,
not another repository; what it reads is saved in the feature folder (`extracted/figma-frames.json`,
`figma-inventory-*.json`, board notes).

| Figma file | Sign in as | Why |
| --- | --- | --- |
| Design spec | `qa-dm@cyberlink.com` | Dev seat: enough MCP calls for the inventory |
| PM spec | `qa1@cyberlink.com` | `qa-dm` has only a View seat in PM Workspace, which allows very few MCP calls |

The agent checks the account (`whoami`) before a read. Figma MCP calls are rationed per seat, so the inventory reads
a whole group of boards per call, never one element at a time.

### 6. ECL (only for eBug filing)

Store your personal ECL API token in `~/.ecl_token` (from <https://ecl.cyberlink.com/sso/mgm/tokenPage>); on Windows
that is `%USERPROFILE%\.ecl_token`. It is used for duplicate searches, IF3 filing and reading tickets back. Keep it
out of the repository.

### 7. Open the folder in your agent

Open this folder in **Claude Code** (skills load from `.claude/skills/`) or **Codex** (`.codex/skills/`). No global
skill copies are needed.

## Using the casebook

Typical requests:

| You want to… | Say something like… |
| --- | --- |
| Make a new table | "Make the iOS test cases for AI Mini Drama from these spec files" (attach the PDFs) |
| Update for a new spec | "Here's the newest PM spec" (attach it) |
| Reuse an approved table | Give the same spec files; the agent tells you the approved version and asks |
| Add a check or rule | "Add a check for …", "From now on …" (it goes in the request ledger) |
| Answer the open questions | "Q-12: use the newer one" — answers become ledger entries and row changes |
| Run the table | "Run the AI Mini Drama table on the phone, phase by phase" |
| Continue a run | "Continue the run" (it resumes from `run-log.ts next` and the last checkpoint) |
| Draft and file eBugs | "Draft the eBugs for P23", then sign off on the review page and "file them" |
| See what is covered | "Open the coverage page", "Serve the coverage page on the network" |
| Compare with another tool | "Compare the casebook with the spec agent" |

### Building or updating a table

1. **Fingerprint** the files against the approved table.
2. **Read the spec.** The files are copied into `specs/<date>/`; an overview render is used to list the boards in
   `boards.json`; `spec-boards.ts` renders and OCRs every board. Reading a 230 MB PM file takes about 45–75 minutes,
   so it runs in the background. Design and MX files that didn't change reuse their extracted text.
3. **Write `board-notes.md`** for the spec set, then the requirements: the eleven coverage passes, the standing
   inputs, and for an update a board-by-board comparison with the previous set.
   The **control inventory** comes from the Design Figma file: `scripts/figma/inventory.js` reads screens, dialogs,
   tappable controls and flow arrows one board group per call, `inventory.ts` merges them, `inventory-sheets.ts` cuts
   every screen with its boxes drawn for review, and the review's fixes go in `inventory-overrides.json`
   (`inventory-overrides.ts`). `controls.ts` then lists every control group for the draft, to be traced to the rows
   that press it.
4. **Trace**: `annotations.ts` lists every annotation block on the boards, and each is traced to the requirements
   that state it; the hidden-clause and variant grids make sure server-side clauses and per-tier rules get their own
   rows.
5. **Value check**, then the draft (`draft.csv`), usually built by a `build-draft.ts` kept in the draft folder.
6. **`check.ts`** must pass: every row traces to a requirement, every Design flow arrow has a requirement and a row
   that walks it, every control group has a row that presses it (inputs also one that dismisses them), every open
   ledger entry is cited, and the job-state grid has no empty cell.
7. **Review**: `review.ts` serves `http://127.0.0.1:4387/` (or the next free port). Edit rows, Keep or Delete,
   add cases, then **Save as approved table**. The previous version moves to `history/`.
8. **Comparison report (only on request)**: "Compare the casebook with the spec agent" builds
   `comparisons/<date>_casebook-vs-spec-agent.html` (coverage both ways, the cases only the casebook has). It is
   never part of an analysis and adds no rows.

### Running a table on the phone

- The draft's `phases.json` splits the table into phases and segments, tags cases with what they need (`video`,
  `purchase`, `new-account`, …) and lists the needs this run can't meet; those cases are recorded Blocked up front.
- Each segment runs in a clean agent context; the chat you talk to only orchestrates and never asks between
  segments. A live run plan (`plan-page.ts --serve`, `http://127.0.0.1:4390/`) shows every case, checkpoint, time and
  token use as the run goes.
- Before the first test action: Log stage timings and Write Log on, build and server checked, tier set. When a phase
  needs video, one preview generation runs first as a gate; if it fails, video cases are recorded Blocked instead of
  spending six minutes each.
- After every segment the app logs are pulled and sliced per case (`log-slice.ts`), and every failure's credit charge
  and refund are checked against Credit Details.
- Every press through `device.ts` is logged to `taps.jsonl` with the element hit and a small screenshot taken just
  before it; `device.ts <run dir> case TC-…` names the case running. The coverage page matches each tap to a Figma
  control (label, accessibility id, icon name, position) and shows the screenshot as proof.
- Everything for a run stays in its own folder: `results.csv`, `run-state.md`, `observations.md`, `report.md`,
  `taps.jsonl`, screenshots, logs and ledger reads.

### Filing eBugs

Failed cases that share a defect become one draft entry, with numbered one-action Repro steps, a Spec Link to the
Figma node, at least one image and the log excerpt when a log shows the cause. The batch is deduplicated against ECL,
checked by `check_ebug_format.py`, and shown on an HTML review page. Filing waits for your decisions there (severity,
owner, TR, account). After filing, every ticket is read back and recorded in `filed_bugcodes.json`.

### Live pages

One command serves all three pages on one address, with tabs to switch between them:

```bash
node scripts/pages.ts ai-mini-drama ios --lan
```

It opens `http://127.0.0.1:4386/` (`/review/`, `/plan/`, `/coverage/`) and, with `--lan`, prints the LAN address
to share. `--draft <id>` reviews a draft (and shows it on the coverage page); the run plan defaults to the newest
`runs/RUN-PLAN-*.md` and the newest draft with a `phases.json` (`--plan`, `--plan-draft` pick others). Save on the
review page works only on the computer running the server; colleagues on the network can read, edit in their
browser and Copy.

The pages link to each other. Each review row has **Spec →**, which opens the coverage page on that case: its
requirements, the spec boards they come from (Design boards from Figma; PM and MX spec regions as boards of their
own), and the controls and flow arrows it presses, highlighted on the board. **Plan →** opens the run plan on the
segment that runs the case, with its latest result. On the coverage page, a case ID opens that case's view, and
**review →** / **plan →** open it on the other pages; each case on the run plan links to **review →** and
**spec →**. Type a case ID (or just `12`) in the Case box,
or open `/coverage/#case=TC-012`.

Each page can also run on its own, a small server started from the repository root. They read the files on every request (the
coverage page at most every 30 s), so they show new results without a restart. Add `--lan` to open one from other
computers on the same network; it prints the LAN address (for example `http://192.168.x.x:4391/`). There is no
login: anyone on that network with the address can read the page. The first time, macOS may ask to allow incoming
connections for `node`.

| Page | Command | Address |
| --- | --- | --- |
| All three, with tabs | `node scripts/pages.ts ai-mini-drama ios [--draft <id>] [--lan]` | `http://127.0.0.1:4386/` |
| Review a draft or the approved table | `node scripts/review.ts ai-mini-drama ios [--draft <id>] [--lan]` | `http://127.0.0.1:4387/` |
| Run plan (phases, cases, time, tokens) | `node scripts/plan-page.ts ai-mini-drama ios <draft> <run plan .md> --serve [port] [--lan]` | `http://127.0.0.1:4390/` |
| Coverage (controls, arrows, tap proof; English / 繁體中文) | `node scripts/coverage-page.ts ai-mini-drama ios [--draft <id>] --serve [port] [--lan]` | `http://127.0.0.1:4391/` |

Each takes the next free port when its default is busy. Stop a server with Ctrl+C in its terminal. A review server
should not be left running for a draft that is already saved: saving from it again overwrites that version.

Without `--serve`, `coverage-page.ts` writes `library/<feature>/<platform>/coverage.html`, a single file with the
board images embedded that opens anywhere (local only, not committed); its case IDs link to `cases.html` beside it,
and `cases.html` links back. `--render` draws the board images from the Design PDF, and the PM and MX spec regions
from their PDFs, first (a few minutes per board); `--runs <folders>` limits it to one run, to see whether that run pressed
everything.

## Repository layout

```text
.
├── AGENTS.md                 # Rules for agents, incl. the team preferences (read first)
├── CLAUDE.md                 # Points Claude Code at AGENTS.md
├── INVESTIGATE.md            # Ideas to investigate, not implemented (e.g. several phones at once)
├── .claude/skills/           # Skills for Claude Code
├── .codex/skills/            # The same skills for Codex (kept identical)
├── scripts/                  # TypeScript tools (spec reading, checks, review page, phone, run log)
│   └── lib/                  # Shared helpers (CSV, library paths, spec sets, export)
├── templates/                # Review page template
└── library/
    └── <feature>/            # One folder per feature (see below)
```

### Inside a feature folder

Using `library/ai-mini-drama/` as the example:

| Path | Purpose |
| --- | --- |
| `README.md` | Generated index: approved tables, versions, spec sets received |
| `requests.md` | Request ledger (`REQ-001`…), re-applied on every draft |
| `spec-agent.json`, `spec-agent/<platform>.json` | Spec agent settings and the committed snapshot of its cases, for comparison reports on request |
| `ios/fixtures.md` | What the phone needs for a run: build, account, photos for the upload cases, settings |
| `specs/<date>/` | One spec set: `spec-set.json` (committed), the original files (local only), `extracted/` |
| `specs/<date>/extracted/` | `boards.json`, `boards/<id>.md` (OCR text per board), `board-notes.md`, `arrows.json` (Design flow arrows), comparison notes |
| `specs/<date>/extracted/figma-inventory-*.json` | Raw Figma inventory, one file per board group (screens, dialogs, controls, arrows) |
| `specs/<date>/extracted/inventory.json` | The merged inventory with control groups (`inventory.ts`) |
| `specs/<date>/extracted/inventory-overrides.json`, `inventory-review-*.json` | The review findings (missed controls, boxes that are not tappable, hidden copies) and their merged fixes |
| `ios/control-trace.json` | Every control group and the rows that press it (inputs: and dismiss it), or why it is excluded |
| `ios/cases.csv` | The approved table, the source of truth |
| `ios/cases.xlsx`, `ios/cases.html` | Generated views for reading and sharing |
| `ios/requirements.md` | Requirements with sources, open questions, job-state grid and ledger coverage |
| `ios/manifest.json` | Version, approval time, spec set and checksums, history |
| `ios/history/` | Earlier approved versions (`vN.csv`, `vN-requirements.md`) |
| `ios/drafts/<id>/` | Each draft: `draft.csv`, `requirements.md`, `update-plan.md`, `phases.json`, `build-draft.ts` |
| `ios/runs/` | Run plans and one folder per phase run (`results.csv`, reports, observations, ledger reads) |
| `ios/ebugs/<date>/` | eBug drafts, review page, dedupe and filing records, log excerpts |
| `ios/recipes/` | Saved device command sequences (`*.steps`) reused across runs |
| `ios/comparisons/` | Comparisons with other tools (e.g. the spec agent) |

## Features in this repository

| Feature | Platform | Approved | Cases | Spec set | Runs and eBugs |
| --- | --- | --- | --- | --- | --- |
| `ai-mini-drama` | iOS | v8, 2026-10-28 | 399 | `specs/2026-10-21-2` (PM 10/21, Design and MX 10/19; Design Figma read 10/28) | Runs 10/16–10/22 incl. the P9 full run; 59 eBugs filed in five batches; 146 control groups traced |
| `ai-mini-drama` | Android | not started | — | — | Android leads are in the request ledger (REQ-022) |

## Skills

| Skill | Use |
| --- | --- |
| `pdr-spec-casebook` | Spec → reviewed table, updates, reuse; coverage passes, standing inputs, value check; on-device runs |
| `ebug-draft-generator` | eBug drafts from failed cases (casebook overlay first) |
| `ebug-tr-filer` | Dedupe, format check, review page, filing through the IF3 API, read-back (needs `~/.ecl_token`) |

Each skill exists for Claude Code (`.claude/skills/`) and Codex (`.codex/skills/`); keep both copies identical.

## Scripts

All scripts run from the repository root with `node scripts/<name>.ts`.

| Script | What it does |
| --- | --- |
| `status.ts` | Lists every approved table and open draft |
| `fingerprint.ts <feature> <platform> <files…>` | Compares spec files with the approved table: NEW, SAME or CHANGED |
| `add-spec.ts <feature> <files…>` | Copies a spec set into `library/<feature>/specs/<date>/` |
| `new-draft.ts <feature> <platform> --title "<Name>" <files…>` | Starts a draft and records its spec set |
| `render-region.ts <pdf> <out.png> [x y w h]` | Renders part of a huge Figma page to look at a frame |
| `render-tiles.ts <pdf> <out dir> [x y w h]` | Renders a region as a grid of readable tiles |
| `spec-boards.ts <feature> <spec-set> [--file] [--jobs 3]` | Renders and OCRs every board in `boards.json` (uses `ocr-tiles.swift`) |
| `annotations.ts <feature> <platform> --draft <id>` | Groups every board's annotations into blocks to trace to requirements (`annotation-trace.json`) |
| `spec-agent-gaps.ts <feature> <platform> --draft <id>` | Comparison report data (on request): spec agent cases the table doesn't cover, with their source, from the snapshot in `library/<feature>/spec-agent/` (`--refresh` updates it from a local spec agent clone, read with git only) |
| `check.ts <feature> <platform> [--draft <id>]` | Validates a table or draft, incl. arrows, controls, ledger, annotation trace and grids |
| `figma/inventory.js` | Figma plugin script the agent runs through Figma MCP (`use_figma`), one call per board group: screens, dialogs, controls, flow arrows |
| `inventory.ts <feature> <spec-set> [--sync-arrows]` | Merges the Figma inventory, groups the controls, applies the review overrides; `--sync-arrows` adds missed arrows to `arrows.json` |
| `inventory-sheets.ts <feature> <spec-set> [--board …]` | Cuts every screen out of the Design PDF (or a saved Figma screenshot) with its control boxes drawn, for review |
| `inventory-overrides.ts <feature> <spec-set>` | Merges the review findings into `inventory-overrides.json` (each review file once) |
| `controls.ts <feature> <platform> [--draft <id>]` | Writes `control-trace.json`: every control group and the rows that press it |
| `coverage-page.ts <feature> <platform> [--draft <id>] [--serve [port] [--lan]]` | The coverage page: boards with controls and arrows marked, tap proof, what is planned or blocked |
| `pages.ts <feature> <platform> [--draft <id>] [--plan <md>] [--plan-draft <id>] [--lan]` | Serves review, run plan and coverage on one address with tabs and links between them |
| `review.ts <feature> <platform> [--draft <id>] [--lan]` | Serves the review page and saves the approved table (Save from this computer only) |
| `export.ts <feature> <platform>` | Rebuilds `cases.xlsx` / `cases.html` from `cases.csv` |
| `device.ts <run dir> <command>` | Appium client for the QA iPhone: screenshots, taps (each logged to `taps.jsonl`), `case`, `scrollto`, `waitfor`, `pink`, recipes, logs, ledger |
| `device-android.ts <run dir> <command>` | The same for the QA Android phone (UiAutomator2, pixel coordinates), plus `back`, `wifi`, `build`, `logcat`, `pull-logs` |
| `app-setup.ts <run dir> <command>` | Build check, reinstall from TestFlight, first launch, Developer Server, fresh install, log pulls |
| `run-log.ts <run dir> <command>` | Records results and dispositions, phases, gate, retest queue, checkpoints, time summary |
| `log-slice.ts <run dir> <pull dir>` | Cuts a log pull into per-case excerpts (failures, toasts, charges, stage timings) |
| `plan-page.ts <feature> <platform> <draft> <plan.md> [--serve [port] [--lan]]` | Builds or serves the live run plan |
| `token-usage.ts`, `usage-log.ts` | Claude token use and plan-usage snapshots for run reports |
| `ebug-defaults.ts <feature> <platform>` | Filing defaults (creator, TR, source tag) from the newest filed batch |

`npm run <name>` shortcuts exist for the common ones (`status`, `check`, `review`, `export`, `fingerprint`,
`add-spec`, `new-draft`, `spec-boards`, `render-tiles`, `render-region`, `ebug-defaults`, `coverage`).

## What is not committed

`.gitignore` keeps these on the machine that produced them:

- **Spec originals** (the large PDFs) and rendered board tiles. Each spec set's `spec-set.json` (names, sizes,
  SHA-256), the extracted text and the notes are committed.
- **All images and videos**: run screenshots (with the on-screen text dumps saved next to them), eBug attachments and
  renders. Results, reports and eBug drafts keep the file names that point at them. The eBug review pages are
  committed with their images embedded.
- **Coverage and review images**: `coverage.html` (it embeds the board renders), the board renders in
  `extracted/coverage/`, the review sheets in `extracted/inventory-sheets/` and the Figma screenshots in
  `extracted/figma/`. The inventory, overrides, reviews and control traces are committed, so the page can be rebuilt.
- **Pulled app logs, Appium session files and full eBug logs** (they can hold tokens). The checked log excerpts
  attached to eBugs are committed.
- `node_modules/`, Python caches and patch leftovers.

## Contributing

- Write new scripts in TypeScript (`node` runs them directly).
- Change a skill in both `.claude/skills/` and `.codex/skills/` and keep them identical.
- Add standing preferences to [`AGENTS.md`](AGENTS.md) › Team preferences (dated) and feature requests to the
  feature's `requests.md`, not to a personal agent memory.
- Never edit an approved `cases.csv` by hand without a request; go through a draft and the review page.
- Keep spec files only under `library/<feature>/specs/`.
- Before committing, check staged files for credentials and images.

## Further reading

- [`AGENTS.md`](AGENTS.md): repository rules and team preferences
- [`.claude/skills/pdr-spec-casebook/SKILL.md`](.claude/skills/pdr-spec-casebook/SKILL.md): the full workflow, coverage
  passes, run rules and file formats
- [`library/ai-mini-drama/requests.md`](library/ai-mini-drama/requests.md): an example request ledger
- [`library/ai-mini-drama/ios/runs/RUN-PLAN-20261019.md`](library/ai-mini-drama/ios/runs/RUN-PLAN-20261019.md): an example phased run plan
- [`INVESTIGATE.md`](INVESTIGATE.md): ideas not yet implemented
