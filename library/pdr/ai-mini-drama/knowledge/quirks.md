# Quirks

## KF-005 Drags on the description box open its editor
- kind: quirk · platform: android · use: run, ebug · tags: input, drag
- source: run-android.md › Drags taken as taps (2026-10-30, REQ-066)

`drag` and `adb input swipe` reach the description box as a tap and open its editor instead of scrolling. Use
`fingerdrag` for text that scrolls inside its own box, and retry with it before filing a 「drag does X」 bug.
