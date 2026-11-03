# Triage

## KP-107 Network error, disabled Generate, wrong saved file
- kind: howto · platform: android · use: run, ebug · tags: triage, network, generate, save
- source: PHD domain triage.md (PHA262026-0295, -0319, -0284, -0331, -0404, -0457)

Network error on a good network → deleted temp image, preset rejected without a prompt, Agent `final_state`. Generate
disabled with all inputs → mode / GUID, Duo leftovers, sub-tab selection. Preview right but file wrong → latest
transform, full-resolution stack, real source buffer.

## KP-108 Lifecycle, content and device symptoms
- kind: howto · platform: android · use: run, ebug · tags: triage, lifecycle, cms, fold
- source: PHD domain triage.md (PHA262026-0310, -0321, -0340, -0315, -0365, -0298, -0303, -0324, -0326)

Nothing updates after foreground → Activity re-created, native agent alive, event collection waiting. New icon
missing → built-in and CMS both updated, cache key, eTag, view reuse. New language crashes → placeholder, re-created
Activity, fragment attachment. Broken only on Fold → available height, bottom constraints, scrolling, hit targets.

## KP-109 Save jumps back, double charge, missing work
- kind: howto · platform: android · use: run, ebug · tags: triage, save, credits, artwork
- source: PHD domain triage.md (PHA262026-0401, -0418, -0194, -0436, -0459, -0363)

Save jumps to the previous page → a native crash first (R8, audio module). Charged twice → taps before the loading
indicator (KP-019). Work missing from Artwork → job class, feature tab mapping, filter empty state (KP-088, KP-024).

## KP-110 The build, not the PR
- kind: howto · platform: android · use: run, ebug · tags: triage, build
- source: PHD domain triage.md K72 (PHA262026-0385, -0401, -0414, -0424, -0329, -0332) · aka: K72

「The fix is merged」 is not 「the build has it」: check the tested build's modules and assets. Past causes: R8 /
ProGuard (ID Photo), missing `libCLAudFxMgr.so` (Trim › Continue in several video features), eModule versions
(Artwork Add Text), Muse / Venus asset names (Hairstyle, Motion Swap import).

## KP-111 Stage is not Production
- kind: howto · platform: android · use: run, ebug · tags: triage, server, stage
- source: PHD domain triage.md K60 (PHA262026-0419, -0297, -0314, -0218) · aka: K60

Stage capacity, timing and bonuses prove nothing for Production: Motion Swap stuck processing was a Stage resource
limit (Closed 「Unable to fix」); a subscription bonus right on Stage was wrong on Production.

## KP-112 Reading an old ticket
- kind: howto · platform: both · use: analysis, ebug · tags: triage, ebug
- source: PHD domain triage.md (PHA262026-0385, -0321, -0312, -0297)

Read the latest discussion, RD root cause and last QA recheck before the original Expected Result. Closed needs its
close reason; Propose Won't Fix is not permanent; RDResolved has no QA close yet. A fix's regression covers the
original path and the scope RD names.
