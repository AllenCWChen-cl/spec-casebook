# Domain knowledge for pdr/ai-mini-drama (ios), for analysis

## rule

### KF-007 Stage order and the free outline (ios, authority observed, unverified)
One chat per drama: format card → 「Thinking…」 → Story Outline & Characters Result (beats in 【】 + Possible
Characters) in about 35–40 s for 0 credits → characters → Create storyboard (paid) → 「Choose your video settings」 →
「Here's your drama.」.

### KF-008 Format card (ios, authority observed, unverified)
Shown at once after the first prompt: 「What format would you like for your video?」 with 「1. Video language」
(English default, Spanish, French, German, Japanese, Korean, Chinese) and 「2. Captions」 (「Yes, include captions」
default / 「No captions」), single-select; no aspect-ratio question. CTA 「Generate」 since 189482 (「Continue」 before,
DRI261893-0011). The user bubble then reads 「1. Video language: X / 2. Captions: Y」.

### KF-009 Prompt bar limits (ios, authority observed, unverified)
Placeholder 「Enter your idea to create drama」; Send is disabled when empty or whitespace-only and a double tap posts
one bubble. 1000-character cap, pasted text truncated: on 189631 inline 「You've reached the 1,000-character limit.
1000/1000」 (earlier builds toasted 「You've reached the maximum length」).

### KF-010 Inspiration chips need focus (ios, authority observed, unverified)
「✦ Surprise me」 and two inspiration chips appear only once the prompt field is focused (matches the Design Default
frame, keyboard up). The Surprise-me pool is small: repeats within 3 taps.

### KF-011 Leave guard before an outline (ios, authority observed, unverified)
Back before an outline exists (prompt only, or during 「Thinking…」) → 「Leave this chat? / Your story outline isn't
ready yet, so this chat won't be saved.」 Leave anyway / Stay; such chats are not saved. It also fires on a blank chat,
while a template chat without outline leaves with no guard (DRI261894P0043). Leaving during storyboard or video
generation has no guard.

### KF-012 Stop on a paid stage confirms (ios, authority observed, unverified)
Stop ■ during storyboard or video asks 「Stop generating?」 (「If you leave now…」) with a no-refund warning
(2026-10-08; on 189399 Stop was immediate, uncharged, and re-issued the settings card). Stop during the free
「Thinking…」 stage has no confirmation.

### KF-013 Video settings and prices (ios, authority observed, unverified)
「Choose your video settings」: Seedance 2.0 (「Best for cinematic…」) or Seedance 2.0 Mini (「Best for speed, value,
and quick draft」), and optional Video length. About 4 credits/s on 2.0 and 2/s on Mini (2.0 30 s ◆120 on 189631).
A video takes about 8 min; the pill charges on completion, the ledger stamps the start.

### KF-014 Result page (ios, authority observed, unverified)
「Here's your drama.」 card (Play, Download) → result page with a clip filmstrip, Full Edit (timeline editor) and
Export Full Video (standard Produce sheet, project 「Project MM-DD(n)」). Captions are burned in karaoke-style. ↓ on
the result page saves only the selected clip with 「Saved to Photos」 (DRI261895P0006).

### KF-015 Chat revisions at any stage (ios, authority observed, unverified)
The chat accepts revisions at every stage (「Add a new character」, 「Please create the full episode.」, a costume
change) and they reach the video. A script change offers 「Script updated! Regenerate the storyboard to match?」.

### KF-019 Choose Character page (ios, authority observed, unverified)
Per-character tabs, 「Choose for X」, a filter (My characters only, Gender, Ethnicity, Age 0–100) that resets per tab,
and a grid of presets plus 「Mine」. ✕ → 「Leave without finishing? / If you leave now, your picks won't be saved.」 With
3+ characters the chat's 「Add New」 slot is off-screen with no scroll hint.

### KF-020 Create my character form (ios, authority observed, unverified)
Reference photo optional; description 0/1000 with an inline message at the cap (0/8000 on 189399; Design says 8000);
AI Suggestion fills only the role line; Gender*, Ethnicity*, Age* (0 accepted, above 100 clamped to 100 silently).
Generate ◆4, about 30 s, ✕ disabled meanwhile; result offers Download and 「Save to library」, which also saves the
sheet to Photos with a 「Saved to Photos」 toast.

### KF-021 Reference photo checks (ios, authority observed, unverified)
A reference with several people → 「More than one person detected」 (also on the app's own turnaround sheet). The
reference face wins over the Ethnicity input, while the tag still shows the input.

### KF-022 Finish your characters sheet (ios, authority observed, unverified)
✓ with characters unset → 「Finish your characters」 (「N character(s) isn't/aren't set yet / Add a look to
continue.」) with Generate / Generate all at ◆4 each. The text stays after the looks are made (DRI261894P0012).

### KF-027 Storyboard result (ios, authority observed, unverified)
「The characters look great! Ready to create the storyboard?」 → 「Create storyboard ◆N」 (25–34 seen), about 60–90 s →
「Here's your storyboard」 (View more opens a read-only scene viewer) and Storyboard Preview, a narrated slideshow
(「See your story as pictures with a voice telling it. The real video comes next.」).

### KF-028 Failed storyboard scenes (ios, authority observed, unverified)
A failed scene shows 「Couldn't create image」 + Edit (189482; earlier a dead 「Regenerate」 label); the scene editor is
0/1000 and regenerates one scene at a time, Edit greyed while another runs. With a scene missing the Preview reads
「Storyboard preview unavailable. Complete the image generation above first to view the preview.」, yet video
generation stays offered (DRI261894P0017).

### KF-030 Failed clips in a full video (ios, authority observed, unverified)
Failed clips show 「2 clips couldn't be generated.」 with Fix Clips and per-clip 「Couldn't create clip / Edit」;
Regenerate Clip costs ◆60, one at a time, and each failed clip is refunded (+60). Full Edit and Export stay disabled
until fixed. Seedance `error_code=4000` failures are upstream.

### KF-032 Resume and parallel dramas (ios, authority observed, unverified)
A force-quit mid-storyboard or mid-video re-attaches and finishes after relaunch; two dramas can storyboard in
parallel; a triple-tapped Generate starts one job. 14 scenes and a 210-s full video were generated on request.

### KF-037 History list (ios, authority observed, unverified)
Empty state 「No dramas yet / Start a story with AI. Every drama you create will be saved here.」; first visit shows
the ⓘ tooltip 「To keep the file lightweight, we kept only the generated story outline, images and videos.」, which an
outside tap does not close (DRI261893-0013). Card: title = template name or an AI title, thumbnail = Scene 1 image
(clapperboard if it failed), time and order = last activity (189482), size, ⋮ Rename / Delete. 「Manage」 and a
「New Chat」 FAB.

### KF-038 Rename and delete (ios, authority observed, unverified)
Delete asks 「Delete this drama? / "<name>" and its videos will be permanently deleted.」 (189482). Rename is a
prefilled iOS alert; an empty or whitespace name keeps OK enabled and does nothing (DRI261893-0016). Manage has
checkboxes, 「Select All」/「Deselect All」 and Delete disabled at 0.

### KF-039 Reopening a drama (ios, authority observed, unverified)
Reopen restores outline, characters, storyboard, video and the latest offer card, but not the user's bubbles. Back
from a History-opened chat returns to History. Dramas do not appear in the Project tab.

### KF-042 Free daily chat limit (ios, authority observed, unverified)
Free users get 10 chats a day, counted app-side; once used, Generate shows 「Daily Free Chat Limit Reached」 with only
「Upgrade to Premium」 (no ✕, DRI261894P0022). The paid-tier dialog is 「Today's AI Chats Are Used Up」 /
「Continue Tomorrow」. Earlier runs the same day use up the quota unless Unlimited daily chat is on.

### KP-007 A failed generation refunds its credits (authority team, unverified)
A failed item costs nothing net; a partial failure costs only the items that succeeded. A missing or wrong refund is
a defect with its own eBug, even when the failure itself is already filed.

### KP-013 Launcher View more destinations (ios, authority observed, unverified)
What's Trending 「View more」 opens Template › For You; AI-Powered Creation 「View more」 opens the AI Magic tab (as the
Design says). Meme Dance Creator 「View more」 also opens the unfiltered Template › For You, which no spec settles
(ISS-LAU-04, a PM question). Recent Projects 「View more」 opens the Project tab, even when it is empty.

### KP-014 Hero banner changes per launch, not by timer (ios, authority observed, unverified)
The hero banner does not auto-rotate and has no page dots; Design 8/E F04 rotates it by app launch count (1st launch
1st banner, 2nd launch 2nd…). Seen static on warm resume; rotation over cold launches is not yet verified.

### KP-019 Repeated taps open one page (ios, authority observed, unverified)
A fast double tap on 「New Project」 opens one Add Media, and a rapid triple tap on a Mine row pushes exactly one page.
A doubled page or duplicated stack after fast taps is a defect.

### KP-025 Bell badge clears on entry (ios, authority observed, unverified)
The bell carries a red dot that clears as soon as the Notification page opens, even if no entry is expanded. The list
has no per-entry unread mark and no 「mark all read」 (ISS-LAU-09, ISS-MP-16). The 2026-09-04 note of "no badge" is
superseded by the 2026-09-16 recheck.

### KP-035 Sign In validation (ios, authority observed, unverified)
User Sign in › Sign In (Email/Password, Sign Up, Forgot Password, Google / Facebook / Apple): an empty submit shows
「Please enter your Email.」 and 「Please enter your password.」, a bad address 「Please enter a valid email address.」;
fields and errors are cleared on re-entry.

### KP-040 Pro content applies without a gate (ios, authority observed, unverified)
On Free, Pro-marked content (e.g. Effects › Mosaic & Blur › Add Mosaic) applies and stays editable; the only signals
are a dismissible corner badge 「Pro Only / Upgrade Now」 and the 「PowerDirector」 watermark on the preview. The
badge opens the paywall on the Pro+ tab, Yearly (MX-03-03, DRI261893-0036).

### KP-044 Purchase returns to the interrupted screen (ios, authority observed, unverified)
After 「You're all set / Your purchase was successful.」 the app returns to the exact screen it left, edits and
selection kept, with the Pro Only badge and the watermark gone, no restart. Backing out of the paywall (cancel or
failure) also keeps the edit state. Treat both as no-regression baselines.

### KP-045 An owned tier hides its tab (ios, authority observed, unverified)
With Pro owned, the paywall drops the 「Pro | Pro+」 tab bar, shows one 「PowerDirector Pro+」 title and the CTA
reads 「Upgrade」, from every entry. The trial is per Apple ID: once used, both tabs offer 「Continue」 and no trial.

### KP-051 Leaving the editor saves silently (ios, authority observed, unverified)
Leaving with ⌂ saves the project without a prompt; it reopens from the Project tab (ratio, duration, size shown) with
every edit, filters included. A demo project from Mine › Demo Videos is the exception (KP-033).

### KP-056 Task list states (ios, authority observed, unverified)
In a tool's task list a finished item still downloading shows a placeholder, 「Downloading.」 and a progress bar and
no 「View」; once downloaded it shows its thumbnail and 「View」 (CineStory F15/F16). The list settles by itself.

## decision

### KP-063 Credit packs priced in USD in the app, local currency on the store sheet (ios)
The app lists credit packs in USD while the App Store sheet shows NT$. Ruled Not A Bug: no row asserts matching
currencies and a run finding of it is not filed.

## risk

### KF-023 Cast size and who gets cast (ios, unverified)
The cast is capped at 5 (Design says 10): extra requested characters are dropped or swapped (DRI261894P0037), and
Confirm with a dropped one rewrites the outline and user-required details (ISS-MD-63). Pets that drive the story are
not cast (DRI261895P0004); a non-human character still needs a human Ethnicity (DRI261896P0017). 「Add New」 invents
a person in no scene (DRI261895P0005). Vary cast size (5/6/7), animals and Add New.

### KF-024 Generate all fails partway or in the background (ios, unverified)
「Generate all」 may make only some looks, leaving blank slots with no error (DRI261894P0006). Backgrounding after the
jobs are dispatched lost charged portraits and hung the retry with ✕ disabled (DRI261893-0126, fixed in 189596).
Test foreground and background-after-dispatch.

### KF-025 Mine duplicates on Confirm (ios, unverified)
Every Confirm re-saved every assigned character into 「Mine」 (DRI261894P0018). Count 「Mine」 before and after
Confirm. Deleting a 「Mine」 look does not touch dramas using it (2026-10-13).

### KF-026 Template library looks in revisions (ios, unverified)
A chat revision touching a template's pre-assigned library character failed (`character-edit` could not stat the CMS
image URL), shown only as 「Server is busy…」 and partly charged (DRI261896P0019); user-created looks passed. Revise
both kinds.

### KF-029 Scene revisions through chat (ios, unverified)
After 「Script updated! Regenerate the storyboard…」 the next video was only the revised scene (DRI261895P0007); two
chained revisions redrew only the last scene (ISS-MD-64); the new storyboard was written into the earlier message
(DRI261896P0013) and the old Preview said videos were generating (DRI261896P0014). Vary one vs two revisions, before
and after a storyboard exists (DRI261894P0014).

### KF-031 Backgrounding during generation (ios, unverified)
When iOS background time expires (about +27 s) the turn is detached (log 「backgrounded while generating … destroying
host」, 「turn abandoned, still running in the engine」); the job finishes server-side and shows only on a later reopen,
meanwhile a live 「Generate」 card is shown (DRI261894P0020). Plain Back and reopen keeps the live turn. Vary
background vs Back.

### KF-034 A failed turn can dead-end the chat (ios, unverified)
After a failed turn the template and character-revision paths showed no card, retry or progress
(DRI261894P0036); the free-form path shows 「Something went wrong… Try again」. Server errors reach the user as a 2-s
「Server is busy. Please try again later.」 toast or raw `agent_tool_dispatch… error_code=4000`: read `[AIDrama Toast]`.

### KF-035 Template plus video language (ios, unverified)
「The Beer Heir」 failed only in Japanese (server executors missing; DRI261895P0003) while other templates worked in
Japanese. Status lines also switch to the video language in an English UI (DRI261894P0015). Vary the video language
per template.

### KF-041 No consume confirmation; debit may differ from the button (ios, unverified)
Every spend charges on the first tap with no 「Consume credits?」 dialog (MX/Design want one; DRI261893-0130). Debits
ran 1 below the button (◆4 → −3, ◆25 → −24), not explained. A rejected (moderated) character keeps a 1-credit voice
charge (DRI261894P0023). Compare each button with its `[AIDrama Permission]` line.

### KF-043 Free tier and Full Edit export (ios, unverified)
On Free, Full Edit › Export is blocked as premium 「Auto Captions」 for the drama's own captions, while the result
page's Export Full Video passes (DRI261896P0015). Export both ways on Free with captions on.

### KP-016 Scrolling up does not collapse the Launcher as designed (ios, unverified)
ISS-LAU-01 (High): Design 8/E F04/F14/F23 collapse the banner and small shortcuts on scroll and show an expand CTA;
the build only pins the big shortcuts, the small-shortcut tiles slide under them cut in half and no expand CTA
exists. Vary scroll depth and scroll-back when testing anything on the Launcher.

### KP-017 Small-shortcut grid cannot be paged (ios, unverified)
ISS-LAU-12 (Medium): the page indicator shows two pages but no gesture reaches the second; the tiles themselves respond
and the What's Trending row scrolls. A tool only on page 2 can't be opened from Home: use AI Magic, and check the
page-2 tiles by hand.

### KP-026 Try Now back lands on Home (ios, unverified)
ISS-PDRI-N02 (Medium): 「Try Now」 into an in-app page, then ‹, lands on Home instead of the Notification list, losing
the open rows. Returning from Safari with 「◀ PowerDirector」 keeps them. The same back-stack gap shows on the AI result
page (KP-058); check back from every in-app deep link.

### KP-046 Cancel and failure look the same (ios, unverified)
ISS-IAP-01 (High): a deliberate cancel and a failed payment both show 「Subscription / Request Canceled」 with no
reason or retry, and OK closes the whole paywall. Waiting minutes at the payment prompt also ends there. Vary cancel,
failure and timeout; Restore Purchase's cancel shows the same dialog.

### KP-054 Project thumbnails and empty projects (ios, unverified)
The project list can show a broken-media placeholder (film icon and 「?」) for a valid project (ISS-PRJ-01). Unconfirmed:
a 0:00 project opened into an empty editor and then vanished from the list, as if 0-duration projects are cleaned up.
Check project lists after AI results and empty projects.

### KP-059 Banner View opens before the media is ready (ios, unverified)
ISS-ATC-01/02 (High): the banner's 「View」 is offered before the result has downloaded and opens a black result
(00:00/00:00, no loader); the same item from the task list after download plays fine. 「Add to Timeline」 there is a
silent no-op (ISS-ATC-03: the duration reading does not change). Vary: tap the banner's View at once.

## question

### KF-044 Scene cap (ios)
14 scenes were generated on request; an older Design frame says 「最多 10 Scenes」 and the live Design is silent. PM to
confirm the cap.

### KF-045 Aspect ratio (ios)
The Design main flow and the build ask no aspect ratio, but Design Choose Character, Recent Task and MX bubbles show
「Aspect ratio: 9:16」. PM to confirm.

### KF-046 Which look is bound after leaving Choose Character (ios)
After 「Leave without finishing」 and a later pick, the Characters Result showed one look while storyboard and video
used the earlier reference-photo look. RD to say which is bound.

### KF-047 One look change billing every character (ios)
One look change after a storyboard charged ◆16 (four images and voices) on a template drama, but ◆4 on a free-form
one. Trigger unknown.

### KF-048 Untested paths (ios)
Not exercised: insufficient credits (MX 「Not enough credits to generate.」), first-time free script (「Free trial
active: Create the script for 0 Credits」), a completion notification for a background video (none seen), the
microphone, and what 「Listen to character intro」 changes.

### KP-028 No Design for the notification centre
No Design sheet covers the notification centre. Open for PM/Design: what 「Try Now」 may open (external sites, a mark
or confirmation), per-entry unread state, multi-open accordions, refresh frequency and paging.

### KP-037 VIP or Pro+
The top tier is called 「VIP」 on the Mine card and in Design F13 but 「Pro+」 on the My Cloud storage badge, the
paywall and Design F14/F17 (which also draw the subscribed bottom tab as 「Pro+」; the build keeps 「Mine」). Whether
they are one tier is for PM (ISS-MP-25); don't file the mix as a defect meanwhile.

### KP-049 Trial credits and trial state (ios)
The paywall promises 「Receive 35 credits during free trial」 (Pro) and 150 (Pro+) but the ledger shows only the +50
monthly bonus (ISS-IAP-02); the sandbox Apple form shows no trial or renewal date. After subscribing Pro, Mine still
shows 「Try Pro+ 7 days for free」 and 「Claim offer」: the Design has no state for a Pro user in trial. PM rules,
on a production build with a fresh Apple ID.

### KP-061 Completion and error states the specs leave open
CineStory F17 says inform users 「when the task is done」 without saying server-done or downloaded. The banner button
is 「View」 in CineStory F02 and 「View Result」 in Video Object Removal F116 (the build says View). The F15 error
states 「Retry」 and 「View Details」 were never reached.

## howto

### KF-001 Which Pink switch fails what (ios, unverified)
Pink › ☰ › `[z] AI Mini Drama`: 「Fail turn」 fails an LLM chat turn (outline, cast confirm, storyboard offer);
「Inject failure status」 only applies to a video beat once filming starts. Name the switch in every Repro step that
uses one, and re-check any bug found with injection on with every fault switch Off (or the correct one).

### KP-004 Switching the tier on iOS (ios, unverified)
Launcher › Pink › ☰ › `[0] IAP` › 「status」: Follow account / Free / Pro / Pro+; it defaults to 「System (lock button
in debug mode)」 and returns to it on relaunch unless set again. Verify the tier in Mine and restore the
previous value after the tier group. No purchase or extra account is needed.

## quirk

### KP-027 Try Now may leave the app (ios, unverified)
Identical 「Try Now」 links open either an in-app page (a template) or Safari (a YouTube video) with no external-link
mark or warning (ISS-PDRI-N03). Only 2 of about 12 were sampled.

### KP-033 Demo Videos open a throw-away project (ios, unverified)
Tapping a Demo Videos card body opens that tool live on sample media (「Try Now」 is a separate target). Applying a
preset there costs 0 credits. Its ✕ lands in the full editor with the demo as a project; leaving with ⌂ returns to
Mine without a save prompt and the project is not kept in the Project tab (ISS-MP-12, ISS-MP-14).

### KP-034 My Cloud needs the corporate Wi-Fi (ios, unverified)
On 「17F_QA_Wifi_5G」 My Cloud shows 「Server is busy. Please try again later.」, may open and then eject back to Mine
after about 9 s, and shows the fallback 「0 KB of 1 GB used」. On 「CL-WiFi」 it loads every time (「Upload projects and
media to cloud.」, Project / Media tabs, 「0 KB of 100 GB used」). Recheck any cloud finding on CL-WiFi before writing it.

### KP-053 Editor edge cases seen (ios, unverified)
Split exactly on a clip boundary is a silent no-op (ISS-01). A text object near the end of the timeline extends the
project's duration (0:08 → 0:10) and deleting it reverts (ISS-06, intent unconfirmed). Undo reverts a transition to
the empty marker.

## fact

### KF-016 Templates (ios, authority observed, unverified)
20 templates in 5 categories (Workplace Romance, Fantasy & Destiny, Urban Romance, Family & Life, Animated Stories);
the landing shows 6, 「More >」 opens the categorised list. Preview autoplays with Mute and 「Make my version」. A
template chat posts the cover as the user bubble; its language set and pre-assigned library characters differ per
template.

### KP-010 Launcher layout (ios, unverified)
Top to bottom: a single hero banner with ☰ (left) and 🔔 (right) drawn over the image; big shortcuts New Project ·
Video Edit by Chat · Video Enhance (stay pinned when scrolling); 8 round small-shortcut tiles with HOT/NEW tags and a
two-part page indicator; rows What's Trending, Meme Dance Creator, AI-Powered Creation and Recent Projects, each with
「View more ›」. Bottom nav: Home · AI Magic · Template · Project · Mine.

### KP-011 Design 8/E is the leading Launcher sheet (unverified)
Of the Launcher Design sheets, 「Template Page - Launcher supports banner (TBD) (8_E)」 matches the build (three content
rows, five bottom tabs, 「View more」). Older sheets drawing 「See All」, four tabs or two rows are superseded: never
file against them. The big-shortcut list follows 8/E F14 (…Video Enhance), not F04 (…Cinematic Reel Creator).

### KP-012 Shortcut tiles come from the CMS (unverified)
Which tools the Launcher's small shortcuts show (and in what order) is set on the CMS (Design: 「Shortcut on CMS」), up to
16 tiles over two pages. A tile list that differs from the Design is not a defect; reach a tool through AI Magic when
it is not on the first page.

### KP-020 Home ☰ menu (ios, unverified)
☰ pushes a full page: Tutorials & Tips · My Artwork · Produced Videos · Demo Videos · Notification; Settings:
Preferences · User Sign in; Information: Send Feedback · About · YouTube · Instagram. Preferences, About, Send
Feedback, Tutorials & Tips and Produced Videos are reachable only here, not from Mine (ISS-MP-18).

### KP-024 Notification page (ios, unverified)
The bell (Launcher top right, also on Mine) pushes 「Notification」: about a dozen dated marketing entries, newest
first. Each row is an accordion (date, title with emoji, chevron) opening to body text and a 「Try Now」 link; several
can be open at once, and all are collapsed again on re-entry.

### KP-029 Mine on a paid account (ios, unverified)
No page title (ISS-MP-20) and no scrolling: the bell, an entitlement card (「VIP」 on VIP, 「Pro」 after subscribing
Pro) with a 「Credits N >」 row, rows My Artwork · My Cloud · Demo Videos · User Sign in, then 「Your VIP Features」 and
「More VIP Benefits」, both empty on 16.8.0 although Design F12/F13 fill them (ISS-MP-01/02).

### KP-030 Mine on a Free account (ios, unverified)
A top chip 「Try Pro+ 7 days for free」; a Free card 「Free」 · 「20+ Benefits >」 (「15+ Benefits」 before 16.9.0) ·
「Claim offer」 with four padlocked benefits (AI Storytelling, Video Object Removal, Video Enhance, Advanced Cutout);
My Credits with the Credits row, 「Buy More」, 「Expiring within 7 days: N credit」, the daily-claim block (KP-041) and a
「Join the Pro+!」 card with 「Subscribe Now」.

### KP-039 Tiers and what is sold (ios, unverified)
Pro and Pro+, each Monthly or Yearly, auto-renewing through StoreKit. Nothing is sold as a one-off item; credits are a
separate currency topped up with 「Buy More」. Subscriptions are not bound to a CyberLink account: Mine shows the tier,
and still offers 「User Sign in」, on a device that never signed in.

### KP-041 Daily free credits (ios, unverified)
My Credits carries 「Complimentary daily credits / Claim once every 24 hours / Claim」; a claim gives 5 credits
(toast 「5 Credits Received · valid for 7 days」). Yet 「Expiring within 7 days」 stays 「0 credit」 after it
(ISS-MP-27, DRI261893-0042).

### KP-042 Paywall plans and prices (ios, unverified)
Yearly is preselected on both tabs and badged 「Best Value」. Sandbox NT$ prices: Pro 220/month, 1,190/year; Pro+
590/month, 1,990/year (prices are store data: never assert them in a row). Choosing Monthly turns the CTA to
「Continue」 and drops the credits line and 「Auto-renewal for NT$…」 line (filed as an MX finding).

### KP-043 Monthly credits per tier (ios, unverified)
On 16.9.0 the paywall gives Pro 50 credits a month and Pro+ 500 (a 6000/year chip). The 2026-09-07 run and the Free
Mine card said Pro+ 300; the newer 500 is kept. Subscribing adds 「Monthly Credit Bonus (for Pro Subscribers) +50」 to
the ledger.

### KP-047 Restore Purchase lives only in the paywall footer (ios, unverified)
The only Restore Purchase entry is the paywall footer; Mine has no plan details, renewal date or Manage subscription
(ISS-MP-17). On 16.9.0 it shows a spinner, then Apple's password prompt (the agent never enters it, so the success
path is untested).

### KP-048 Compare plans sheet (ios, unverified)
17 rows, no price row, no Effects or Mosaic row, a header that does not stick and no purchase CTA; Free reads
「Credits Per Month 0」 although free users claim 5 a day (DRI261893-0038/0039/0040).

### KP-050 Editor controls (ios, unverified)
Header: ⌂ · undo · redo · ⋯ · Export, plus a trash icon while a clip is selected. Root toolbar: Audio · Text · Overlay
· Effects · Sticker · AI Magic · Aspect Ratio · more. Clip toolbar: Split · Video Edit by Chat · Volume · Audio Tool ·
Quick Actions · Object Removal · Speed · more. Aspect Ratio offers 16:9 / 9:16 / 1:1 / 21:9 / 4:5, set to the
project's ratio.

### KP-052 Export options; export costs no credits (ios, unverified)
Export offers Resolution 360p / 720p / 1080p / 4K, Bitrate Smaller / Standard / Better, Frame Rate 24 / 25 / 30 / 50 /
60 and a live size estimate, then a share screen (Shorts, YouTube, TikTok, IG Reels, Instagram, Upload to My Cloud).
Non-AI editing and export spend no credits.

### KP-055 Completion banner in the editor (ios, unverified)
When a background AI task ends, the editor shows 「Good news! Your <Task> task has been completed. Tap here to view your
results.」 with 「Close」 and 「View」, over the top of the preview. Banners queue: dealing with one shows the next
finished task. Close was not tested.

### KP-057 Result page (ios, unverified)
Before / After tabs where the tool has them (After selected), else one result; then a Share Video row, 「Add to
Timeline」 and 「You might also like」.

## term

### KF-006 The jobs the feature runs
Outline, characters, Create my character, chat revision, storyboard, scene image and Location, chat image update,
Storyboard Preview, scene video, video regeneration, full video, captions, download/export. These are the rows of the
Job states grid.

### KF-018 Preview video and full episode (ios)
The first video is a 15/30-s preview (or the chosen length); afterwards the chat offers 「Create the full episode
(N sec)」 (60–210 s seen). A full video can also be asked for directly in the chat.

### KP-023 Meme Dance Creator
The Launcher's second row is 「Meme Dance Creator」 in the build. Design 8/E and the more-content-promotion sheet also
say 「Meme Dance Generator」; use the build's name and don't file the difference (a spec self-contradiction for PM).

### KP-038 Advanced Cutout and AI Smart Cutout
One capability: the Mine Free card calls it 「Advanced Cutout」, the paywall's Compare plans 「AI Smart Cutout」.

<!-- knowledge hash: 40aaeb55b38e5c3c -->
