# Fault switches

## KF-001 Which Pink switch fails what
- kind: howto · platform: ios · use: analysis, run, ebug · tags: pink, fault, failure
- source: AGENTS.md › Pink fault switches (2026-10-20; RD rejected DRA261896P0043 for the wrong switch)

Pink › ☰ › `[z] AI Mini Drama`: 「Fail turn」 fails an LLM chat turn (outline, cast confirm, storyboard offer);
「Inject failure status」 only applies to a video beat once filming starts. Name the switch in every Repro step that
uses one, and re-check any bug found with injection on with every fault switch Off (or the correct one).

## KF-002 Injected failure or the server's own
- kind: fact · platform: ios · use: run, ebug · tags: fault, logs
- source: AGENTS.md › Pink fault switches (2026-10-20)

An injected failure logs `AppTweaks injected <Tool> failure #N`; `status=tool_error` without it is the server's own
failure.

## KF-049 The rest of the Pink AI Mini Drama panel
- kind: howto · platform: ios · use: run · tags: pink, quota, fault
- source: exploration KB ai-mini-drama.md (2026-10-07…10-15, 16.9.0 189399–189631)

Besides the fault switches: 「Unlimited daily chat」, 「Show Free quota dialog」, 「Show Paid quota dialog」, 「Trip
image moderation」 (character generation is rejected), 「Fail every call」, the action rows 「Use up today's chats」 and
「Reset today's chats」, and 「Listen to character intro」. 「Use stage (demo)」 is gone since 189520. Set them back at
the end.

## KF-050 Fail every call alone fails little
- kind: quirk · platform: ios · use: run · tags: pink, fault
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

「Fail every call」 on its own did not fail calls wholesale (2 of 6 storyboard images failed while it was on). Use the
switch KF-001 names for the stage.
