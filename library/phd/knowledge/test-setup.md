# Round-start setup

## KP-104 A round starts as a free user with 0 credits
- kind: howto · platform: both · use: run · tags: setup, account, credits
- source: PHD domain test-setup.md (user, 2026-10-16; the source labels it K36) · aka: K36

Check once per round, before its first case and separately for each platform's round: free user and balance 0. Do
not redo it per case, nor when the round's plan later switches the subscription or buys test credits.

## KP-105 Resetting the account through the debug dialog
- kind: howto · platform: both · use: run · tags: setup, debug, account
- source: PHD domain test-setup.md (user, 2026-10-16)

Edit Room › Settings › About: tap the backdoor button under [<] until the debug dialog opens. Turn 「set to
subscriber」 off, reset UUID and member token each with the 「rest」 button in its own row, tap OK, close and reopen
the app (never clear app data). Check again; if it cannot be confirmed, record the setup Blocked `--as test-data`.

## KP-106 The account reset is setup, not a row
- kind: howto · platform: both · use: run · tags: setup, privacy
- source: PHD domain test-setup.md (user, 2026-10-16)

Never a table row or a per-case cleanup, never a mid-round recovery after works, spends or a pending payment. Keep
before / after screenshots and a log line; mask UUID and member token. Change no other debug option. On the QA
iPhone it replaces reinstalling.
