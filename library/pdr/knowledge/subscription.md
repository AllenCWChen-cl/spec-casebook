# Subscription and in-app purchase

## KP-039 Tiers and what is sold
- kind: fact · platform: ios · use: analysis, run · tags: subscription, tier, iap
- source: exploration KB subscription-iap.md (MX-03 run 2026-09-07, PDRM TestFlight sandbox, Free)

Pro and Pro+, each Monthly or Yearly, auto-renewing through StoreKit. Nothing is sold as a one-off item; credits are a
separate currency topped up with 「Buy More」. Subscriptions are not bound to a CyberLink account: Mine shows the tier,
and still offers 「User Sign in」, on a device that never signed in.

## KP-040 Pro content applies without a gate
- kind: rule · platform: ios · use: analysis, run · tags: subscription, tier, watermark · authority: observed
- source: exploration KB subscription-iap.md (MX-03 run 2026-09-07, PDRM TestFlight sandbox, Free)

On Free, Pro-marked content (e.g. Effects › Mosaic & Blur › Add Mosaic) applies and stays editable; the only signals
are a dismissible corner badge 「Pro Only / Upgrade Now」 and the 「PowerDirector」 watermark on the preview. The
badge opens the paywall on the Pro+ tab, Yearly (MX-03-03, DRI261893-0036).

## KP-042 Paywall plans and prices
- kind: fact · platform: ios · use: analysis · tags: subscription, paywall, price
- source: exploration KB subscription-iap.md (MX-03 run 2026-09-07, PDRM TestFlight sandbox, Free); exploration KB subscription-iap.md (re-verification 2026-09-29, 16.9.0 build 189315, Developer Server, Free)

Yearly is preselected on both tabs and badged 「Best Value」. Sandbox NT$ prices: Pro 220/month, 1,190/year; Pro+
590/month, 1,990/year (prices are store data: never assert them in a row). Choosing Monthly turns the CTA to
「Continue」 and drops the credits line and 「Auto-renewal for NT$…」 line (filed as an MX finding).

## KP-043 Monthly credits per tier
- kind: fact · platform: ios · use: analysis · tags: subscription, credits
- source: exploration KB subscription-iap.md (re-verification 2026-09-29, 16.9.0 build 189315, Developer Server, Free)

On 16.9.0 the paywall gives Pro 50 credits a month and Pro+ 500 (a 6000/year chip). The 2026-09-07 run and the Free
Mine card said Pro+ 300; the newer 500 is kept. Subscribing adds 「Monthly Credit Bonus (for Pro Subscribers) +50」 to
the ledger.

## KP-044 Purchase returns to the interrupted screen
- kind: rule · platform: ios · use: analysis, run · tags: subscription, entitlement · authority: observed
- source: exploration KB subscription-iap.md (MX-03 run 2026-09-07, PDRM TestFlight sandbox, Free)

After 「You're all set / Your purchase was successful.」 the app returns to the exact screen it left, edits and
selection kept, with the Pro Only badge and the watermark gone, no restart. Backing out of the paywall (cancel or
failure) also keeps the edit state. Treat both as no-regression baselines.

## KP-045 An owned tier hides its tab
- kind: rule · platform: ios · use: analysis, run · tags: subscription, paywall · authority: observed
- source: exploration KB subscription-iap.md (MX-03 run 2026-09-07, PDRM TestFlight sandbox, Free)

With Pro owned, the paywall drops the 「Pro | Pro+」 tab bar, shows one 「PowerDirector Pro+」 title and the CTA
reads 「Upgrade」, from every entry. The trial is per Apple ID: once used, both tabs offer 「Continue」 and no trial.

## KP-046 Cancel and failure look the same
- kind: risk · platform: ios · use: analysis, run, ebug · tags: subscription, paywall, error
- source: exploration KB subscription-iap.md (MX-03 run 2026-09-07, PDRM TestFlight sandbox, Free); exploration KB subscription-iap.md (re-verification 2026-09-29, 16.9.0 build 189315, Developer Server, Free)

ISS-IAP-01 (High): a deliberate cancel and a failed payment both show 「Subscription / Request Canceled」 with no
reason or retry, and OK closes the whole paywall. Waiting minutes at the payment prompt also ends there. Vary cancel,
failure and timeout; Restore Purchase's cancel shows the same dialog.

## KP-047 Restore Purchase lives only in the paywall footer
- kind: fact · platform: ios · use: analysis, run · tags: subscription, restore
- source: exploration KB subscription-iap.md (re-verification 2026-09-29, 16.9.0 build 189315, Developer Server, Free)

The only Restore Purchase entry is the paywall footer; Mine has no plan details, renewal date or Manage subscription
(ISS-MP-17). On 16.9.0 it shows a spinner, then Apple's password prompt (the agent never enters it, so the success
path is untested).

## KP-048 Compare plans sheet
- kind: fact · platform: ios · use: analysis · tags: subscription, paywall, credits
- source: exploration KB subscription-iap.md (re-verification 2026-09-29, 16.9.0 build 189315, Developer Server, Free)

17 rows, no price row, no Effects or Mosaic row, a header that does not stick and no purchase CTA; Free reads
「Credits Per Month 0」 although free users claim 5 a day (DRI261893-0038/0039/0040).

## KP-049 Trial credits and trial state
- kind: question · platform: ios · use: analysis · tags: subscription, trial, credits
- source: exploration KB subscription-iap.md (MX-03 run 2026-09-07, PDRM TestFlight sandbox, Free)

The paywall promises 「Receive 35 credits during free trial」 (Pro) and 150 (Pro+) but the ledger shows only the +50
monthly bonus (ISS-IAP-02); the sandbox Apple form shows no trial or renewal date. After subscribing Pro, Mine still
shows 「Try Pro+ 7 days for free」 and 「Claim offer」: the Design has no state for a Pro user in trial. PM rules,
on a production build with a fresh Apple ID.

## KP-063 Credit packs priced in USD in the app, local currency on the store sheet
- kind: decision · platform: ios · use: analysis, run, ebug · tags: credits, iap, currency
- source: exploration KB ai-mini-drama.md (NAB DRI251698-0014)

The app lists credit packs in USD while the App Store sheet shows NT$. Ruled Not A Bug: no row asserts matching
currencies and a run finding of it is not filed.

## KP-064 A sandbox purchase stops at the Apple Account password
- kind: fact · platform: ios · use: run · tags: iap, purchase
- source: exploration KB ai-mini-drama.md; run.md Setup tools (`topup`)

A sandbox or TestFlight purchase asks for the Apple Account password: the user types it, never the agent.
