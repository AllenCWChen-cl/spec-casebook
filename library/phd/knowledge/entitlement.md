# Entitlement

## KP-012 Android has one paid mode: VIP = Pro = paid user
- kind: rule · platform: android · use: analysis, run, ebug · tags: entitlement, vip · authority: team
- source: PHD domain confirmed-rules.md K36b (user, 2026-10-16) · aka: K36b, K36

VIP, Pro and 「paid user」 in any PHD Android spec name the same Android VIP mode, not tiers; a naming difference is
never an undefined entitlement. Prices and the out-of-credits path still come from each feature's spec.

## KP-013 iOS has two paid modes: Pro and Pro+
- kind: rule · platform: ios · use: analysis, run, ebug · tags: entitlement, pro · authority: team
- source: PHD domain confirmed-rules.md K36b (user, 2026-10-16) · aka: K36b

Pro and Pro+ are distinct modes on iOS; never apply them to Android.

## KP-014 AI Exposure is paid-only
- kind: rule · platform: android · tags: entitlement, ai-exposure, iap · authority: team
- source: PHD domain confirmed-rules.md K36c (user, 2026-10-16) · aka: K36c

Free user taps the entry → 「Upgrade to VIP」 dialog → Upgrade opens IAP (no Try Before Buy). Paid user → 「Try it」
dialog → Try it opens the feature screen (not Generate). No purchase needs to be completed; prices unchanged.

## KP-015 Mine refreshes entitlement after buying Premium
- kind: rule · platform: android · tags: entitlement, mine, premium · authority: spec
- source: PHD domain confirmed-rules.md K36e (PHA262026-0217) · aka: K36e

After buying Premium, Mine's entitlement styling updates when the user returns to it.

## KP-016 A one-time free trial is consumed at once
- kind: rule · platform: both · tags: entitlement, trial, cta · authority: spec
- source: PHD domain confirmed-rules.md K31 (PHA262026-0252, -0429, PHI262606-0078) · aka: K31

After the free use, returning shows the paid Generate, never 「1 Free Trial」 again; on entry the CTA never flashes
the paid price before showing Free Trial. Seen on AI Hairstyle, AI Expand (Android) and iOS Creative Studio.
