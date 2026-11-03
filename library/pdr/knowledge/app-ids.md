# Accessibility ids

## KP-009 Android accessibility ids are content-descs
- kind: fact · platform: android · use: run · tags: ids
- source: run-android.md (team, 2026-10-27)

PowerDirector's Android accessibility ids are content-descs starting `[AID]` (e.g. `[AID]IAP_Back`); match them with
`lbl`, not `id`. Don't rely on `[AID]…_Server` to tell the server: the Launcher's top-bar colour does (KP-005).
