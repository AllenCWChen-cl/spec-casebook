# AI Mini Drama blueprint pieces from logcat: DRA262610P0420 / DRA262610P0421

PowerDirector Mobile for Android 16.8.0 (2610212), TR261021-0082, Stage server, Sony Xperia 10 III / Android 12,
run A7 (2026-10-29/30). Pulled 2026-11-03 from the run's per-segment logcat captures.

## Why this is not blueprint.json

The app keeps each session's blueprint at
`/data/user/0/com.cyberlink.powerdirector.DRA140225_01/files/mini_drama/sessions/<session>/host_inputs/blueprint.json`.
On this build it cannot be copied off the phone: the package is not debuggable (`run-as` refused), it targets SDK 36
so `adb backup` leaves app data out, the phone is not rooted, and no copy exists under `/sdcard/Android/data/`.
Both sessions are gone from the phone: round A7-j reinstalled the app three times on 2026-10-30 (fresh-install cases),
and the app's History now starts at 2026/10/30 10:07 (checked 2026-11-03). The in-app debug-info export (REQ-068) can
no longer reach them, so the full file can only come from the server, by session id.

What logcat holds instead is put together below. Logcat cuts each line at about 4,100 characters, so long JSON
lines are incomplete; only objects that closed before the cut are in `characters.json` / `beats.json`.

## Files (one folder per eBug)

| File | What it is |
|---|---|
| `session-log.txt` | Every `MiniDrama` log line naming the session, across all A7 segments, with the segment name. Tokens dropped. |
| `tool-prompts.txt` | The prompts sent to image / video tools for the session: the `tool_dispatch args` prompt and the multi-line `[TOOL] <Tool> … prompt=` block (the multi-line one is complete). |
| `blueprint-prompt-heads.txt` | The plan step's prompt `{"blueprint":{…` unescaped: the top of the blueprint as sent, cut where logcat cut the line. |
| `characters.json` | Character objects (`asset_id`, age, look, wardrobe…) per asset, each distinct version with its time. |
| `beats.json` | Beat objects (cuts, script, dialogue, visual description) per beat, each distinct version with its time. |

## DRA262610P0420: session `261029_193738_69bb0cf5` (Hidden Identity)

- `characters.json` › `char_jenna_morales`: age "75" / "75 years old" in every version (19:39 → 00:49).
- `tool-prompts.txt`, 23:35:10 (segment A7-g2): the four full-episode `RefToVideo` prompts (the multi-line
  `[TOOL] RefToVideo` blocks). ACTIVE REFERENCES names Jenna at 75 in three of them ("@Image 1: JENNA, 75-year-old
  female…" / "75 years old…"); the third (23:35:10.078) describes her with no age. The second also says "JENNA's
  face, build, hair, and chef workwear remain fixed across all cuts". The blueprint never made her younger; the
  younger face came after the prompt (the video model or the reference image), possibly helped by the prompt that
  leaves her age out.

## DRA262610P0421: session `261029_171551_db193be2` (Trapped Together)

- `session-log.txt` 17:48:1x: `[USER] Please change the looks of two characters: make Tessa Shaw and Marcus Vance both
  look about 50 years old.`; the character step then writes Tessa (`char_af4c1a8a`) at 50.
- 17:49:11, after `AnswerUpdateCharacter`: `"asset_targets":["char_af4c1a8a","char_07b3446a","char_7e36790c"]`:
  Tessa Shaw, **Eli Vance** (`char_07b3446a`, 36, not asked for) and Marcus Vance (`char_7e36790c`, the maintenance
  technician, late thirties).
- `tool-prompts.txt` 17:49:59: three `TextToImage` prompts: Tessa "50-year-old", Eli "Reconcile and maintain … 36-year-old
  … Eli Vance" (no change asked, still generated and charged), Marcus "updated to reflect an age of 50 years old".

Made by `generators/blueprint_extract.py` (`python3 -I blueprint_extract.py`).
