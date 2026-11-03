# Decisions: what not to assert

## KP-051 AI Group Shot accepts pets: no face check
- kind: decision · platform: android · use: analysis, run, ebug · tags: ai-group-shot, face-check
- source: PHD domain decisions.md K13 (PHA262026-0368, Propose Won't Fix) · aka: K13

Group Shot supports people or pets; face detection was skipped on purpose. No blocking dialog for a
photo with no person.

## KP-052 Character Motion Swap shows plain Generate until ready
- kind: decision · platform: android · use: analysis, run, ebug · tags: character-motion-swap, price, cta
- source: PHD domain decisions.md K34 (PHA262029-0001) · aka: K34

While content or selection is not ready the button shows just 「Generate」. Do not expect 「--」 or a fixed price while
the video length is unknown.

## KP-053 Group Shot Create a Video has no extra confirmation
- kind: decision · platform: android · use: analysis, run, ebug · tags: ai-group-shot, artwork, credits
- source: PHD domain decisions.md K35 (PHA262026-0369) · aka: K35

Artwork › 「Create a Video」 looks like Generate and shows the credits; PM skipped a confirmation dialog.

## KP-054 AI Enhance Try First result cannot be applied
- kind: decision · platform: android · use: analysis, run, ebug · tags: ai-enhance, trial
- source: PHD domain decisions.md K37 (PHA262026-0386, Won't Fix, review 2026-09-16) · aka: K37

Do not expect every trial preview to be savable, nor other features' free-generation semantics for it.

## KP-055 Leaving AI Agent needs no warning dialog
- kind: decision · platform: android · use: analysis, run, ebug · tags: agent, exit
- source: PHD domain decisions.md K43 (PHA262026-0320) · aka: K43

Normal exit; a hint bubble on the History button guides users back.

## KP-056 Arabic translation is decided per string
- kind: decision · platform: android · use: analysis, run, ebug · tags: locale, arabic
- source: PHD domain decisions.md K67 (PHA262026-0200 … -0229) · aka: K67

Translated after PM asked: Blur, Conceal, Presets, Launcher shortcuts, Edit Room feature names. Kept English: Camera
ON/OFF, HD / Ultra HD, some Premium / AI Denoise / AI Deblur / ISO labels. No 「all proper nouns stay English」.

## KP-057 Interstitial localisation is phased
- kind: decision · platform: android · use: analysis, run, ebug · tags: locale, interstitial
- source: PHD domain decisions.md K71 (PHA262026-0279, Postpone) · aka: K71

Phase 1 covers the main languages; others stay English for now. Missing MEX / THA / ARA / VIT is not a defect while
Phase 1 holds, nor 「never translated」.

## KP-058 Collage search tags are English for now
- kind: decision · platform: android · use: analysis, run, ebug · tags: collage, search, locale
- source: PHD domain decisions.md K59 (PHA262026-0266) · aka: K59

Switched to English after a Stage data move broke Arabic / Vietnamese search (to protect iOS GM). Transitional: do
not assert 「local-language search is not supported」.

## KP-059 AI quality issues are open, not rules
- kind: decision · platform: android · use: analysis, run, ebug · tags: quality, ai-enhance, ai-headshot
- source: PHD domain decisions.md K19 (PHA262026-0293, -0406, -0405, -0350, -0264) · aka: K19

AI Enhance adding people, AI Headshot cropping the head or keeping the background, AI Face Swap lower resolution, AI
Replace mask residue ≈ 3 % (Postponed). File only with evidence on the tested build.

## KP-060 AI Enhance waiting time is a limit
- kind: decision · platform: android · use: analysis, run, ebug · tags: ai-enhance, wait
- source: PHD domain decisions.md K61 (PHA262026-0294) · aka: K61

≈ 48 s average was accepted; the fix improved the waiting cursor (iOS mentions ≈ 1 min). Judge the waiting UI, not
a duration.

## KP-061 Daily Bonus limits are not fixed
- kind: decision · platform: android · use: analysis, run, ebug · tags: credits, daily-bonus
- source: PHD domain decisions.md K38 (PHA262026-0403, -0402, NAB) · aka: K38

Stage allows up to 3 products per member per day; a UUID used 3 times a day can still log in. No firm limit.

## KP-062 Group Shot result BGM may differ from the preview
- kind: decision · platform: android · use: analysis, run, ebug · tags: ai-group-shot, audio
- source: PHD domain decisions.md K52 (PHA262026-0380, -0381) · aka: K52

Handled by CMS `audio_setting_toServer=none`; vendor mode under review.

## KP-063 Share targets depend on region and installs
- kind: decision · platform: android · use: analysis, run, ebug · tags: share, discover
- source: PHD domain decisions.md K54 (PHA262026-0437 Assigned, -0248) · aka: K54

TikTok share to a store item unavailable in the region is still open; Discover author links open the Instagram
profile from CMS `social_media_link`. No 「shown in every country」 default.

## KP-064 Prompt length limits are per feature and model
- kind: decision · platform: android · use: analysis, run, ebug · tags: prompt, limits
- source: PHD domain decisions.md K09 (PHA262026-0198, -0257, -0396) · verified: 20.13 (AI Replace, 2026-05-15) · aka: K09

Values at the time: AI Replace 500 characters (20.13; was wrongly 101); AI Creative Studio 5000 (20.13, set in code
while XML capped 600); Image to Video Pixverse V6 `promptCharLimit` 2000 characters.

## KP-065 AI Try-On custom prompt price
- kind: decision · platform: android · use: analysis, run, ebug · tags: ai-try-on, price
- source: PHD domain decisions.md K32 (PHA262026-0271) · aka: K32

Custom prompt cost 3 credits on 20.13, not 6. Version-bound; depends on the real mode.

## KP-066 Video length rounds up to whole seconds
- kind: decision · platform: android · use: analysis, run, ebug · tags: video, price, trim
- source: PHD domain decisions.md K33 (PHA262029-0005) · aka: K33

AI Video Try-On / Character Motion Swap display length with `ceil()` to match billing. Not 「always round down」:
check Trim time, UI and price at the boundary.

## KP-067 Image to Video no longer has Duo
- kind: decision · platform: android · use: analysis, run, ebug · tags: image-to-video, discover
- source: PHD domain decisions.md K17 (PHA262026-0284) · aka: K17

Duo was removed; templates from Discover default to Single.

## KP-068 1600 px is a repro condition, not a cap
- kind: decision · platform: android · tags: large-photo, crop
- source: PHD domain decisions.md K23 (PHA262026-0457) · aka: K23

The large-photo path (long edge > 1600 px, full-resolution stack) was the ticket's repro condition, not a general
resolution limit.

## KP-069 Undo granularity on 20.17
- kind: decision · platform: android · tags: undo, crop, perspective
- source: PHD domain decisions.md K21 (PHA262026-0427) · aka: K21

Tab switch and Reset make records; button actions do, except Perspective selection-only changes; Crop / Perspective
sliders record on finger-up with a changed value.

## KP-070 Stage timings are not an SLA
- kind: decision · platform: android · use: analysis, run, ebug · tags: server, stage, wait
- source: PHD domain decisions.md / triage.md K60 (PHA262026-0419, -0314) · aka: K60

AI Expand took 1 min 48 s on Stage vs ≈ 17 s on Production; an RTDN account hold of 「76320 days」 = 53 × 1440 Stage
time scale. Not values to assert.
