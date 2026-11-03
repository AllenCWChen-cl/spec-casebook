# Domain knowledge for phd/ai-background (android), for analysis

## rule

### KP-012 Android has one paid mode: VIP = Pro = paid user (android, authority team, unverified)
VIP, Pro and 「paid user」 in any PHD Android spec name the same Android VIP mode, not tiers; a naming difference is
never an undefined entitlement. Prices and the out-of-credits path still come from each feature's spec.

### KP-014 AI Exposure is paid-only (android, authority team, unverified)
Free user taps the entry → 「Upgrade to VIP」 dialog → Upgrade opens IAP (no Try Before Buy). Paid user → 「Try it」
dialog → Try it opens the feature screen (not Generate). No purchase needs to be completed; prices unchanged.

### KP-015 Mine refreshes entitlement after buying Premium (android, authority spec, unverified)
After buying Premium, Mine's entitlement styling updates when the user returns to it.

### KP-016 A one-time free trial is consumed at once (authority spec, unverified)
After the free use, returning shows the paid Generate, never 「1 Free Trial」 again; on entry the CTA never flashes
the paid price before showing Free Trial. Seen on AI Hairstyle, AI Expand (Android) and iOS Creative Studio.

### KP-017 Credit Detail lists every AI use with feature name and amounts (android, authority team, unverified)
After the Generate flow of any credit-using AI feature ends, Buy Credit › Detail (top right) lists the use under the
right feature name with the credits deducted and any refunded, amounts correct. Check the Detail entry, not only the
balance; a refund is required only when one happens.

### KP-018 Credit Auto Pass keeps its own name in the Detail (android, authority spec, unverified)
Credit Auto Pass shows its own name in the credit detail, never 「Yearly Credit Bonus」 (server-side copy).

### KP-019 A burst of Generate taps charges once (android, authority spec, unverified)
Once the first Generate is accepted, further taps are blocked until the job takes over, including the gap before the
loading indicator appears: one charge, one result (seen on AI Expand).

### KP-020 Blue credit button opens Buy Credit (android, authority team, unverified)
AI features show a blue button holding the current credit balance and a [+]; tapping it opens the Buy Credit page.
The balance shown must match the account's.

### KP-021 Premium chat quota is higher, not unlimited (android, authority spec, unverified)
Premium chat copy promises a higher chat quota under normal server conditions, never 「unlimited」. No fixed number is
the rule (30 appeared once): do not assert one.

### KP-024 Finished AI images save to their feature tab (android, authority team, unverified)
Every credit-deducting AI feature that finishes an image Generate saves the result to My AI Artwork automatically,
under that feature's own tab. Images only (not video, failed or unfinished jobs); tab names and order are not set here.

### KP-025 AI Exposure results go to Recent and the AI Exposure tab (android, authority team, unverified)
A finished Generate is saved to My AI Artwork › Recent and › AI Exposure whether or not [V] brings it back to
Adjustment; no jump to Artwork is required. Artwork entry: Launcher › AI Photos › My Artwork (top right). Not
extended to other features.

### KP-026 History button opens the feature's Artwork tab (android, authority team, unverified)
Some AI features have a History button (a sheet of paper with a clock at its bottom right); tapping it opens My AI
Artwork with that feature's own tab selected. Only where the spec draws the button.

### KP-027 New features' works reach Recent (android, authority spec, unverified)
A new feature's works appear in Recent when the feature is meant to (Headshot V3 fix).

### KP-028 Empty Artwork filter shows Nothing yet (android, authority spec, unverified)
An Artwork filter with no matching item shows 「Nothing yet」 (e.g. Group Shot with videos only, Photo filter).

### KP-029 Long-task tiles and completion notifications (android, authority spec, unverified)
Processing tiles of long tasks show the source thumbnail. Long video jobs (Cinematic Reel Creator, Group Shot video)
send a completion notification whose title, message and deep link open the right page.

### KP-030 Saved output matches the last preview (android, authority spec, unverified)
The saved file matches the preview the user last saw (e.g. Collage pinch-zoom).

### KP-032 Features opened from Edit Room get the edited image (android, authority spec, unverified)
Opening a feature from Edit Room carries the current edited image, not the original file (Cinematic Reel Creator,
AI Headshot).

### KP-033 Banners and deep links preselect the linked style (android, authority spec, unverified)
A banner or deep link opens the feature with the linked style, type and category selected and the style scrolled
into view.

### KP-034 Discover tip bubble lifecycle (android, authority spec, unverified)
The bubble disappears for the session once Discover is opened, shows again on later launches until 「Use this
template」 is tapped once, then never again. Seen-tutorial, entered-feature and completed-key-action are three
different onboarding states.

### KP-035 AI Replace: reference image or prompt enables Next (android, authority spec, unverified)
With source and mask done, a reference image or a prompt enables the next step; with a reference image the prompt is
optional.

### KP-036 A custom prompt reaches the generator (android, authority spec, unverified)
Input, request and result agree (AI Hairstyle field `user_prompt`), not just that the box takes text.

### KP-037 AI Try-On: no face check on clothing or pets (android, authority spec, unverified)
A clothing reference without a face is accepted. Pet types never run the person check: a dog photo must not report
「No face」.

### KP-038 AI Group Shot photo picking (android, authority spec, unverified)
The first pick is multi-select and Next enables once the template's photo count is picked; changing photos later from
the Photo Picker replaces one at a time. Check slot order and removal. (2026-08-24 update replaces 「always re-pick two」.)

### KP-039 Agent job finished in background shows on return (android, authority spec, unverified)
An Agent job running when the app goes to background shows its result after returning to foreground. The
「thinking」 timing is still open (see the open question on Agent thinking in background).

### KP-040 Crop tabs keep one consistent state (android, authority spec, unverified)
Across Crop & Rotate, Perspective and AI Expand tabs, rotation, preview, crop frame, ratio and tool state stay
consistent; re-entering a tab shows the current image. A ratio stays selected only while the frame keeps it (Rotate /
Flip that resets the frame clears it).

### KP-041 Undo, Redo and Reset (android, authority spec, unverified)
Undo steps back one record; Redo enables only when a redo record exists. Reset's base is the image first shown on
entering the transform screen: enabled only when the preview differs, stays on the current tab, restores image and
options to defaults, and is itself an undo record.

### KP-042 Restored state restores highlight and transform together (android, authority spec, unverified)
Restoring a state restores the button highlight and the real transform together (AI Expand ratio pill and preview;
initial Custom mode drives Reset enablement).

### KP-043 Video Editing template titles keep their look (android, authority spec, unverified)
Cancel, Undo or opacity changes never wash a template title to white / no preset.

### KP-044 Video Editing panels: X discards, V commits (android, authority spec, unverified)
X discards everything changed in the panel; V commits; the two must differ. Not every video panel was rechecked.

### KP-045 Audio Range Select close target (android, authority spec, unverified)
Video Editing › Audio Range Select: closing returns to the audio panel when a track exists, else to the picker; X and
system Back behave the same.

### KP-046 Try-On / Hairstyle Back keeps the style (android, authority spec, unverified)
Back after generating keeps the previous style and any reusable reference image; importing a photo does not reset
the category to All. Create More keeping the whole session is an open question.

### KP-047 Masks survive returning from Artwork or Store (android, authority spec, unverified)
AI Replace returning from Artwork to edit the mask shows the red mask; VHS / Glitch returning from Store keep a
working mask.

### KP-048 Arabic may keep Western digits (android, authority spec, unverified)
Arabic UI may show digits 0–9 (Quick Actions sliders align with iOS, `Locale.US`, decided 2026-05). Do not fail
Arabic for Western digits.

### KP-049 Localised strings keep their placeholders (android, authority spec, unverified)
Translations keep the platform's placeholders, types and argument count (`%1$s` on Android); a wrong placeholder
crashes the screen.

### KP-050 RTL mirrors layout, not only text (android, authority spec, unverified)
Bubbles point at the real button; prompt text leaves room for its buttons; slider drag matches the effect (Skin Tone,
AI Relight); lists and toolbars stay in bounds and scroll (Blender, Mosaic); measured views keep a size (ID Photo);
text and icons stay centred.

## decision

### KP-051 AI Group Shot accepts pets: no face check (android)
Group Shot supports people or pets; face detection was skipped on purpose. No blocking dialog for a
photo with no person.

### KP-052 Character Motion Swap shows plain Generate until ready (android)
While content or selection is not ready the button shows just 「Generate」. Do not expect 「--」 or a fixed price while
the video length is unknown.

### KP-053 Group Shot Create a Video has no extra confirmation (android)
Artwork › 「Create a Video」 looks like Generate and shows the credits; PM skipped a confirmation dialog.

### KP-054 AI Enhance Try First result cannot be applied (android)
Do not expect every trial preview to be savable, nor other features' free-generation semantics for it.

### KP-055 Leaving AI Agent needs no warning dialog (android)
Normal exit; a hint bubble on the History button guides users back.

### KP-056 Arabic translation is decided per string (android)
Translated after PM asked: Blur, Conceal, Presets, Launcher shortcuts, Edit Room feature names. Kept English: Camera
ON/OFF, HD / Ultra HD, some Premium / AI Denoise / AI Deblur / ISO labels. No 「all proper nouns stay English」.

### KP-057 Interstitial localisation is phased (android)
Phase 1 covers the main languages; others stay English for now. Missing MEX / THA / ARA / VIT is not a defect while
Phase 1 holds, nor 「never translated」.

### KP-058 Collage search tags are English for now (android)
Switched to English after a Stage data move broke Arabic / Vietnamese search (to protect iOS GM). Transitional: do
not assert 「local-language search is not supported」.

### KP-059 AI quality issues are open, not rules (android)
AI Enhance adding people, AI Headshot cropping the head or keeping the background, AI Face Swap lower resolution, AI
Replace mask residue ≈ 3 % (Postponed). File only with evidence on the tested build.

### KP-060 AI Enhance waiting time is a limit (android)
≈ 48 s average was accepted; the fix improved the waiting cursor (iOS mentions ≈ 1 min). Judge the waiting UI, not
a duration.

### KP-061 Daily Bonus limits are not fixed (android)
Stage allows up to 3 products per member per day; a UUID used 3 times a day can still log in. No firm limit.

### KP-062 Group Shot result BGM may differ from the preview (android)
Handled by CMS `audio_setting_toServer=none`; vendor mode under review.

### KP-063 Share targets depend on region and installs (android)
TikTok share to a store item unavailable in the region is still open; Discover author links open the Instagram
profile from CMS `social_media_link`. No 「shown in every country」 default.

### KP-064 Prompt length limits are per feature and model (android)
Values at the time: AI Replace 500 characters (20.13; was wrongly 101); AI Creative Studio 5000 (20.13, set in code
while XML capped 600); Image to Video Pixverse V6 `promptCharLimit` 2000 characters.

### KP-065 AI Try-On custom prompt price (android)
Custom prompt cost 3 credits on 20.13, not 6. Version-bound; depends on the real mode.

### KP-066 Video length rounds up to whole seconds (android)
AI Video Try-On / Character Motion Swap display length with `ceil()` to match billing. Not 「always round down」:
check Trim time, UI and price at the boundary.

### KP-067 Image to Video no longer has Duo (android)
Duo was removed; templates from Discover default to Single.

### KP-068 1600 px is a repro condition, not a cap (android)
The large-photo path (long edge > 1600 px, full-resolution stack) was the ticket's repro condition, not a general
resolution limit.

### KP-069 Undo granularity on 20.17 (android)
Tab switch and Reset make records; button actions do, except Perspective selection-only changes; Crop / Perspective
sliders record on finger-up with a changed value.

### KP-070 Stage timings are not an SLA (android)
AI Expand took 1 min 48 s on Stage vs ≈ 17 s on Production; an RTDN account hold of 「76320 days」 = 53 × 1440 Stage
time scale. Not values to assert.

## risk

### KP-071 PHD regression matrix (android, unverified)
Vary the entry, first use vs re-entry (cold start, tutorial shown / skipped, Create More), the AI input (preset,
prompt, reference, person, pet), lifecycle (background while thinking / generating, re-creation), geometry (large,
very wide, Crop → Save), operations (X, V, Back, Undo, Redo, Reset, rapid taps), entitlement, Artwork filters, locale,
device, Stage / Production and CMS state.

### KP-072 Every entry is its own path (android, unverified)
Each entry brings its own photo, style, category, tutorial state and back path: AI Replace lost its top toolbar only
via Edit Room → Artwork → Edit Room.

### KP-073 Photo identity drives picker re-selection (android, unverified)
Edit Room images with id 0 / -1 were not ticked in the Photo Picker (AI Agent, Group Shot): check id mapping.

### KP-074 Tutorials and cold start change init order (android, unverified)
Try-On with 「Don't show again」 put a pet style in the wrong tab; Creative Studio cold-started from a deep link
crashed before data loaded. Cover tutorial shown, skipped, cold start and data loaded.

### KP-075 Refactors move navigation (android, unverified)
AI Replace became its own Activity and an old notification path via Edit Room showed black: re-walk notification and
deep-link paths after a feature moves.

### KP-076 Selection state leaks across features (android, unverified)
After AI Replace uploaded a reference, Text Bubble / Text / Sticker added it as Add Photo: 「after using another
feature」 is its own precondition.

### KP-077 Inspirations obey the model too (android, unverified)
Official inspirations were too long or hit content checks; one truncated by an old model looked user-edited
(「Use Another Inspiration」).

### KP-078 Sub-types keep their own selection (android, unverified)
AI Hairstyle My Style shared one GUID across Photos / Prompts; a preloaded inactive tab overwrote the selection, so
Generate was wrongly disabled or enabled.

### KP-079 Video features share Trim and take different media (android, unverified)
Motion Swap and Video Try-On take a photo and a video (guides must name the right one); AI Anime Video, Video Try-On,
Motion Swap and Cinematic Reel Creator share Trim / Continue, so one missing module breaks all four.

### KP-080 Image and mask must align (android, unverified)
AI Removal failed on 2560×909: the scaled mask rounded to another ratio. Vary very wide images and edge masks.

### KP-081 Price follows the real mode (android, unverified)
Prompt vs reference image must be told apart before action and style ids are picked: check the price per mode.

### KP-082 Large photos have two stacks (android, unverified)
Crop / Perspective committed only the thumbnail stack, so Save used the uncropped original: chain geometry →
Adjustment → Save and check the file.

### KP-083 Back must find real resources (android, unverified)
Create More from Artwork deleted the original's video; Try-On deleted the reference, then showed Network error on redo.

### KP-084 Temporary mask is not the output (android, unverified)
A visible mask while editing is required; residue in the result is a quality issue. Judge them separately.

### KP-085 IAP visibility needs the whole entitlement (android, unverified)
The shop entry and new-user offer bubble used different checks; the shared subscribe dialog (AI Expand, Image to
Video, Hair Volume) crashed from AI Expand → Credits → Subscribe.

### KP-086 Agent turns: completion is not success, and once only (android, unverified)
A session holds history and jobs; a turn is one send and its replies. `final_state=block`, error 0 and no outputs
showed only a generic error; a native agent initialised twice wrote `turn_complete` twice (duplicate replies).

### KP-087 Agent foreground resume (android, unverified)
History load waited on a destroyed native agent and blocked events: vary background while thinking and generating.

### KP-088 Work type is not job type (android, unverified)
Long-task images filtered as error packs hid Headshot images; Headshot V3 became a short task to reach Recent.

### KP-089 Taps right after opening a pack (android, unverified)
Taps within 800 ms of opening a pack were swallowed; fixed with a wait indicator.

### KP-090 Display size is not resolution (android, unverified)
512×512 Image to Video works looked tiny (fit mode); Face Swap resolution is separate. Check the file's pixels.

### KP-091 Mute state survives template switches (android, unverified)
Group Shot mute state must survive template switches and MediaPlayer re-creation.

### KP-092 Generated is not saved (android, unverified)
Group Shot 「returning to Recent」 after Save was a native audio crash: check the file exists and opens.

### KP-093 Built-in and CMS both supply content (android, unverified)
CMS supplies banners, names, translations, templates, categories, style GUIDs, inspirations, samples, audio settings,
tags and navigation, and the app has built-in copies (AI Agent icons needed both): vary light / dark, first launch
offline.

### KP-094 Language and content version (android, unverified)
APIs carry lang and contentVer / metaDataVer; a new-tag fix needed a new tag GUID and an eTag reset. Vary a language
switch with a warm cache.

### KP-096 Collage search indexes must agree (android, unverified)
Metadatas (tags), contents and indexdocs must agree per language.

### KP-097 Background and Activity re-creation are separate tests (android, unverified)
Motion Swap lost its model list after re-creation (Don't keep activities); a language change destroys the Activity
(IAP on a detached fragment crashed).

### KP-098 System Back on every screen (android, unverified)
SDK 36 Predictive Back broke onBackPressed paths (Blur Tool black, Edit Room exiting to Launcher).

### KP-099 Edge-to-edge and keyboard (android, unverified)
On Android 15 the AI Agent prompt sat under the keyboard, and a keyboard listener stopped the Image to Video model list
scrolling.

### KP-100 Foldables unfolded (android, unverified)
Fold7 unfolded: prompt boxes, bottom sheets, Task Center, Credits pack and Mosaic preview had height or reach problems.

### KP-101 Long strings (android, unverified)
NLD, IND, PLK, ESP, PTB, RUS: check readability and reach (padding, centring, scrolling, toolbar tabs), not just that a
translation exists.

### KP-102 View reuse and async loads (android, unverified)
A reused cell showed the wrong AI Agent icon; a Camera filter crashed on a null template name. Wrong visuals are not
always wrong CMS data.

### KP-103 Mixpanel by feature and entry (android, unverified)
`Monetize_Subscription_Appear` carries `feature=ai_video_try_on` / `ai_enhance_advanced`; Artwork single Save must
send the real item. Single and multi-select download are both paths.

## question

### KP-113 Create More keeps inputs? (android)
UX proposal to keep source and category (Try-On, Image to Video), NewCreated. Not the same as Back keeping the style.

### KP-114 Open UX proposals with no decision (android)
Repeated 「Custom」 names in AI Background; what belongs in Mine; whether Edit Room shows lock / crown / credits up
front; no clear 「saved」 confirmation; a whole-collage preview; whether switching stock tabs clears the search text;
the order of AI Photos features.

### KP-115 Retry CTA after Undo (android)
Shows 「Retry 2 credits」 that does nothing; final meaning not decided.

### KP-116 RTDN notification conditions (android)
Cancelling an annual free trial, or one of two subscriptions: no formal decision.

### KP-117 AI Exposure Artwork tab ticket (android)
The ticket expects its own tab (NewCreated); the user's later rule (Recent + AI Exposure tab) already states it.

### KP-118 Agent thinking in background (android)
Returns with Network error; Assigned, not covered by the closed foreground-resume fix.

### KP-119 Language switch refresh (android)
Banners and Image to Video samples not updating after switching language.

### KP-120 ID Photo cutout cancel (android)
Eraser X changes the cutout background; Assigned, no root cause.

### KP-121 Device and emulator sightings (android)
Camera frame missing, ID Photo black after cancelling Makeup, Reshape stuck after purchase, LDPlayer video formats and
Agent replies: one-device or emulator sightings, not general rules.

## howto

### KP-112 Reading an old ticket (unverified)
Read the latest discussion, RD root cause and last QA recheck before the original Expected Result. Closed needs its
close reason; Propose Won't Fix is not permanent; RDResolved has no QA close yet. A fix's regression covers the
original path and the scope RD names.

## term

### KP-001 PHD feature areas (android)
Home and discovery (Launcher, AI Photos, AI Videos, Discover, Mine), photo editing (Edit Room), portrait, photo
generation (Creative Studio, Try-On, Hairstyle, Headshot, Face Swap, Group Shot), AI editing (Replace, Removal,
Expand, Enhance, Exposure), video (Image to Video, Video Try-On, Motion Swap, Cinematic Reel Creator), works and
business (My AI Artwork, Credits, Credit Auto Pass, IAP, Task Center, RTDN). Not a full catalogue.

### KP-002 Code names in code and logs (android)
「Creative Lab」 = AI Creative Studio; 「CineStory」 = Cinematic Reel Creator; 「AI Editor image ID」 = the Edit Room
source image id.

### KP-003 Image being edited (android)
The bitmap Edit Room has composed so far, not the original file URI.

### KP-004 Source image vs reference image (android)
Source = the photo being changed; reference = clothing or replacement content. Face checks for a person photo do not
apply to a clothing reference.

### KP-005 Template / Style (android)
Preset content and the chosen style: GUID, category and generation settings. Not the same as the custom-prompt or
reference-image modes on the same screen.

### KP-006 Inspiration (android)
A suggested prompt from the content service; still bound by the chosen model's length and content checks.

### KP-007 Task / Pack (android)
Implementation names for a generation job and a collection of works. Image vs video is not the same as short vs
long task.

### KP-008 My AI Artwork (android)
The library of jobs and results. Recent, the feature tab and the Photo / Video filter are separate dimensions.

### KP-009 Credits and subscription states (android)
Credits = balance and bonus sources; subscription = entitlements. Premium, Credit Auto Pass and a one-time free trial
are three different states.

### KP-010 Built-in vs CMS content (android)
Many icons, banners, templates and tags exist both in the app and on CMS; either can be the stale one.

<!-- knowledge hash: 0d3cee3c1185df3f -->
