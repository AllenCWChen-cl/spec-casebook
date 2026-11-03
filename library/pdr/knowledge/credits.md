# Credits

## KP-007 A failed generation refunds its credits
- kind: rule · platform: both · use: analysis, run, ebug · tags: credits, refund · authority: team
- source: run.md step 8 (user, 2026-10-19)

A failed item costs nothing net; a partial failure costs only the items that succeeded. A missing or wrong refund is
a defect with its own eBug, even when the failure itself is already filed.

## KP-008 Reading the credits ledger
- kind: howto · platform: both · use: run · tags: credits, refund, ledger
- source: run.md step 8 (user, 2026-10-19)

Mine › Credits › Details lists charge rows by tool (Text to Image / Text to Speech / AI Video Generator) and a refund
row 「Generation failed, credits returned +N」. The account is shared: match rows by time and amount, never by balance
difference alone. The credit pill can be stale until the chat is left and reopened.

## KP-041 Daily free credits
- kind: fact · platform: ios · use: analysis, run · tags: credits, claim
- source: exploration KB mine-page.md (2026-09-07 PDRM TestFlight, and 2026-09-29, 16.9.0 build 189315, Free)

My Credits carries 「Complimentary daily credits / Claim once every 24 hours / Claim」; a claim gives 5 credits
(toast 「5 Credits Received · valid for 7 days」). Yet 「Expiring within 7 days」 stays 「0 credit」 after it
(ISS-MP-27, DRI261893-0042).
