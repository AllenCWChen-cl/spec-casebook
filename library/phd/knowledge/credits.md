# Credits

## KP-017 Credit Detail lists every AI use with feature name and amounts
- kind: rule · platform: android · use: analysis, run, ebug · tags: credits, detail, refund · authority: team
- source: PHD domain confirmed-rules.md K36a (user, 2026-10-15) · aka: K36a

After the Generate flow of any credit-using AI feature ends, Buy Credit › Detail (top right) lists the use under the
right feature name with the credits deducted and any refunded, amounts correct. Check the Detail entry, not only the
balance; a refund is required only when one happens.

## KP-018 Credit Auto Pass keeps its own name in the Detail
- kind: rule · platform: android · tags: credits, detail, credit-auto-pass · authority: spec
- source: PHD domain confirmed-rules.md K36d (PHA262026-0199) · aka: K36d

Credit Auto Pass shows its own name in the credit detail, never 「Yearly Credit Bonus」 (server-side copy).

## KP-019 A burst of Generate taps charges once
- kind: rule · platform: android · tags: credits, generate, rapid-tap · authority: spec
- source: PHD domain confirmed-rules.md K30 (PHA262026-0418) · aka: K30

Once the first Generate is accepted, further taps are blocked until the job takes over, including the gap before the
loading indicator appears: one charge, one result (seen on AI Expand).

## KP-020 Blue credit button opens Buy Credit
- kind: rule · platform: android · use: analysis, run, ebug · tags: credits, credit-button · authority: team
- source: PHD domain confirmed-rules.md K75 (user, 2026-11-03) · aka: K75

AI features show a blue button holding the current credit balance and a [+]; tapping it opens the Buy Credit page.
The balance shown must match the account's.

## KP-021 Premium chat quota is higher, not unlimited
- kind: rule · platform: android · tags: premium, agent, copy · authority: spec
- source: PHD domain confirmed-rules.md / decisions.md K44 (PHA262026-0351) · aka: K44

Premium chat copy promises a higher chat quota under normal server conditions, never 「unlimited」. No fixed number is
the rule (30 appeared once): do not assert one.

## KP-022 Credit costs seen on iOS 20.15
- kind: fact · platform: ios · tags: credits, price
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

AI Removal (generative) 5, AI Replace (Describe text) 2, AI Creative Studio (GPT-Image-2) 6, AI Try-On 3 (badge), as
charged to a VIP account. Version-bound.

## KP-023 AI Enhance badge says 5 but VIP is charged 0
- kind: quirk · platform: ios · tags: credits, price, vip, ai-enhance
- source: PHDi exploration editor-navigation-map.md ISS-01 (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

The displayed price does not always equal the actual charge for VIP: match the ledger, not the badge.
