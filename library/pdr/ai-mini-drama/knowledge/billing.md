# Credits in AI Mini Drama

## KF-040 What the ledger books
- kind: fact · platform: ios · use: run, ebug · tags: credits, ledger
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

The ledger has no 「AI Mini Drama」 row (DRI261894P0021): each image is 「Text to Image」 −3, each voice 「Text to
Speech」 −1, video 「AI Video Generator」 −N; a ◆4 character is one of each.

## KF-041 No consume confirmation; debit may differ from the button
- kind: risk · platform: ios · use: analysis, run · tags: credits
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399; 2026-10-15, 189631)

Every spend charges on the first tap with no 「Consume credits?」 dialog (MX/Design want one; DRI261893-0130). Debits
ran 1 below the button (◆4 → −3, ◆25 → −24), not explained. A rejected (moderated) character keeps a 1-credit voice
charge (DRI261894P0023). Compare each button with its `[AIDrama Permission]` line.

## KF-042 Free daily chat limit
- kind: rule · platform: ios · use: analysis, run · tags: quota, tier · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-08 MX, 16.9.0 189482)

Free users get 10 chats a day, counted app-side; once used, Generate shows 「Daily Free Chat Limit Reached」 with only
「Upgrade to Premium」 (no ✕, DRI261894P0022). The paid-tier dialog is 「Today's AI Chats Are Used Up」 /
「Continue Tomorrow」. Earlier runs the same day use up the quota unless Unlimited daily chat is on.

## KF-043 Free tier and Full Edit export
- kind: risk · platform: ios · use: analysis, run · tags: tier, export, captions
- source: exploration KB ai-mini-drama.md (2026-10-15 New User, 16.9.0 189631)

On Free, Full Edit › Export is blocked as premium 「Auto Captions」 for the drama's own captions, while the result
page's Export Full Video passes (DRI261896P0015). Export both ways on Free with captions on.
