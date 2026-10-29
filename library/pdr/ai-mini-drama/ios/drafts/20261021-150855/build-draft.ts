// Build draft 20261021-150855: approved table v1 (291 rows) + the 2026-10-21 analysis upgrade
// (coverage passes, standing inputs, value check; user approved 2026-10-21). Re-runnable; overwrites draft.csv,
// requirements.md and phases.json in this folder.
//   node library/pdr/ai-mini-drama/ios/drafts/20261021-150855/build-draft.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const IOS = join(HERE, '..', '..');
const SPEC = join(IOS, '..', 'specs', '2026-10-19', 'extracted');
const DS = 'https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=';
type Row = Record<string, string>;

const approved: Row[] = readTable(join(IOS, 'cases.csv'));
const oldReq = readFileSync(join(IOS, 'requirements.md'), 'utf8').trimEnd();
let nextR = Math.max(...[...oldReq.matchAll(/\bR-(\d{3,})\b/g)].map(m => +m[1])) + 1;
let nextTc = Math.max(...approved.map(r => +r.ID.slice(3))) + 1;

const reqLines: Record<string, string[]> = {};
function req(section: string, src: string, text: string) {
  const id = `R-${String(nextR++).padStart(3, '0')}`;
  (reqLines[section] ??= []).push(`- ${id} [${src}] ${text}`);
  return id;
}

// ---------- existing rows: keep, modify or remove ----------
const rows: Row[] = approved.map(r => ({ ...r, Change: 'unchanged', 'Change Reason': '' }));
const get = (id: string) => rows.find(r => r.ID === id)!;
function modify(id: string, reason: string, f: (r: Row) => void) { const r = get(id); f(r); r.Change = 'modified'; r['Change Reason'] = reason; }

const tc211 = get('TC-211');
tc211.Change = 'removed';
tc211['Change Reason'] = 'Value check: same check as TC-126 (AI Suggestion leaves Gender, Ethnicity and Age unset); its ticket note moves to TC-126';
modify('TC-126', 'Value check: TC-211 merged here (same check)', r => {
  r.Notes = `${r.Notes}; Regression DRI261896P0031 (Assigned, AIAgent): AI Suggestion leaves required character attributes empty — merged from TC-211`;
});
modify('TC-066', 'Design first: the app and the Design frame show the Location image beside the scene image with no label (P1 report); the row held the PM layout', r => {
  r['Expected Result'] = 'Nothing happens (not enlarged, no regenerate option); the Location image sits beside the main scene image as in the Design frame, with no 「Location」 label';
  r.Notes = `PM (pm-update-6) draws a labelled 「Location」 row under the main image; Design wins. ${r.Notes}`;
});
const STOP_NO_REFUND = 'Credit Details keeps the charge for the stopped work with no refund row (a user Stop is not refunded)';
for (const id of ['TC-153', 'TC-154', 'TC-155', 'TC-156', 'TC-157']) modify(id, 'Job-state pass: add the credit check for a user Stop (PM §13.6)', r => {
  r['Expected Result'] = `${r['Expected Result']}; ${STOP_NO_REFUND}`;
});
modify('TC-100', 'Build note TR261006-0055 (REQ-021): also when a row above the screen is rebuilt', r => {
  r.Action = 'Wait for a new assistant message, then for a card above the screen to be rebuilt (e.g. a storyboard image update)';
});
modify('TC-107', 'Persistence pass: downloading without editing is also not a modification (PM Bug 0015)', r => {
  r.Action = 'Open an older drama, scroll, play and download without editing, return';
});
modify('TC-287', 'Request REQ-011: every way to finish editing', r => {
  r.Action = 'Finish editing each way without closing the keyboard first: Done, Generate, tap outside, Cancel, Return';
});
modify('TC-065', 'Build note TR261006-0055 (REQ-021): script glyph clipping', r => {
  r['Expected Result'] = `${r['Expected Result']}; the first and last script lines show complete characters (nothing clipped)`;
});

// ---------- new rows ----------
type New = { sec: string; pre: string; act: string; exp: string; prio: string; ref: string; notes?: string; pass: string; needs?: string[] };
const add: New[] = [];
const A = (n: New) => add.push(n);

// Pass 2: states per job
const rLoc = req('Job states', 'PM:pm-update-6', 'When only the main scene image failed, Edit/Retry regenerates only the main image, reuses the Location image and charges one image.');
A({ sec: 'Storyboard', pre: 'A scene whose main image failed while its Location image succeeded (Pink › Trip image moderation; record the switch)', act: 'Tap Edit on the main image\'s error card, then Regenerate', exp: 'Only the main image regenerates; the Location image stays as it was; the price is one image (◆6)', prio: 'P2', ref: rLoc, notes: 'If the fixture fails both images, record Blocked (test-data); TC-070 covers both failed', pass: 'job states' });
const rUpdPart = req('Job states', 'PM:pm-update-3 J5', 'A chat image update that partly fails keeps the successful images; failed ones are refunded and marked 「!」 with 「1 image couldn\'t be updated. Your credits have been refunded. Tap Edit to try again, or tell me what to change.」 and Edit.');
A({ sec: 'Storyboard', pre: 'Storyboard finished; ask Iris to update two scene images, one of which will fail (Pink › Trip image moderation)', act: 'Tap Generate on the 「Update storyboard images」 card and wait', exp: 'The successful image updates; the failed scene shows 「!」 and 「1 image couldn\'t be updated. Your credits have been refunded. Tap Edit to try again, or tell me what to change.」 with Edit; Credit Details shows the refund', prio: 'P2', ref: rUpdPart, pass: 'job states' });
const rUpdLeave = req('Job states', 'PM:pm-update-3 J4', 'Leaving while a chat image update is generating shows 「Stop and lose your credits?」 (short task, no refund).');
A({ sec: 'Storyboard', pre: 'Chat image update generating (skeletons shown)', act: 'Tap Back', exp: '「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」 with Leave anyway / Keep Generating', prio: 'P2', ref: rUpdLeave, pass: 'job states' });
const rSbFail = req('Job states', 'DS:ds-storyboard 1012 update', 'When the whole storyboard fails: 「Something went wrong on my end.」 and 「ⓘ Storyboard couldn\'t be created. Try creating your storyboard again.」 with Try again.');
A({ sec: 'Storyboard', pre: 'Storyboard generation will fail (Pink › Fail turn on the storyboard turn; record the switch)', act: 'Tap Generate on 「Create storyboard」 and wait', exp: '「Something went wrong on my end.」 and 「ⓘ Storyboard couldn\'t be created. Try creating your storyboard again.」 with Try again; Try again generates the storyboard', prio: 'P2', ref: rSbFail, notes: 'Re-check any failure with every fault switch Off (team preference)', pass: 'job states' });
const rRegenFail = req('Job states', 'PM:pm-1002-update §13.8', 'A failed video regeneration keeps the old version and uses the chat partial-failure copy.');
A({ sec: 'Video errors', pre: 'Finished video; a scene video regeneration that will fail (Pink › Inject failure status, that beat)', act: 'Wait for the regeneration to end', exp: 'The old version stays and plays; the chat shows 「{n} scenes couldn\'t be generated. Your credits have been refunded. Tap Edit to regenerate, or tell me what to change.」', prio: 'P2', ref: rRegenFail, pass: 'job states', needs: ['video'] });
const rUpdated = req('Job states', 'PM:pm-1002-update §13.8', '「Your video has been updated.」 disappears after the video is played or the chat is left.');
A({ sec: 'Video', pre: 'Scene video regenerated; 「Your video has been updated.」 shown under the card', act: 'Play the video; on a second regenerated drama, leave the chat and come back', exp: 'The message disappears once playback starts, and after leaving and returning', prio: 'P3', ref: rUpdated, pass: 'job states', needs: ['video'] });
const rCapRetry = req('Job states', 'PM:pm-update-5 §13.13', 'If the caption retry fails again, the error and Try again return; the video still has no captions.');
A({ sec: 'Captions', pre: '「Captions couldn\'t be added. Try again」 shown; the retry will fail again', act: 'Tap Try again and wait', exp: '「Adding captions…」, then 「Captions couldn\'t be added. Try again」 with Try again comes back; the video still has no captions', prio: 'P3', ref: rCapRetry, notes: 'No known fault switch makes speech-to-text fail; Blocked (observability) without one', pass: 'job states', needs: ['video', 'stt-failure'] });
const rStt = req('Job states', 'PM:pm-error-handling', 'A storyboard STT failure shows 「ⓘ Storyboard preview unavailable. Try again to generate the preview.」 with Retry.');
A({ sec: 'Storyboard Preview', pre: 'Storyboard narration speech-to-text fails', act: 'Look at the Storyboard Preview card, then tap Retry', exp: '「ⓘ Storyboard preview unavailable. Try again to generate the preview.」 with Retry; Retry builds the preview', prio: 'P3', ref: rStt, notes: 'TC-078 is the TTS failure. No known fault switch makes STT fail; Blocked (observability) without one', pass: 'job states', needs: ['stt-failure'] });
const rOffCard = req('Job states', 'PM:pm-update-5 §5 (10/6)', 'Tapping an action card button with no network shows the toast 「You\'re offline. Check your connection and try again.」; nothing is sent or charged and the card stays.');
A({ sec: 'Storyboard', pre: '「Create storyboard」 card shown; Wi-Fi off and no cellular (Appium confirmed on USB first)', act: 'Tap Generate', exp: 'Toast 「You\'re offline. Check your connection and try again.」; nothing is sent or charged; the card stays', prio: 'P2', ref: rOffCard, notes: 'Real network loss (REQ-020); turn Wi-Fi back on right after', pass: 'job states' });
const rOffResume = req('Job states', 'PM:pm-0930-updates §5', 'If the network drops while a generation runs, it resumes by itself after the network returns; the format card is not shown again.');
A({ sec: 'Story outline', pre: 'Outline generating; Wi-Fi turned off mid-generation (Appium confirmed on USB first)', act: 'Turn Wi-Fi back on and wait', exp: 'Generation resumes by itself and the outline arrives; the format card is not shown again', prio: 'P2', ref: rOffResume, notes: 'Real network loss (REQ-020). Build note TR261006-0055 OUTLINE-NO-FORMAT-RETURN', pass: 'job states' });
const rThink = req('Job states', 'PM:pm-0930-updates §3.2', 'Leaving while the storyboard price is calculated (「Thinking…」) shows no dialog.');
A({ sec: 'Storyboard', pre: 'Generate tapped on 「Create storyboard」; 「Thinking...」 (pricing) shown', act: 'Tap Back', exp: 'No dialog; the chat closes', prio: 'P3', ref: rThink, pass: 'job states' });
const rNotifyYes = req('Job states', 'PM:pm-0930-updates', 'On the first 「Yes, create video」 the pre-prompt offers Notify me (then the iOS permission dialog) and Not now (never shown again).');
A({ sec: 'Video', pre: 'Fresh install (part of this case): uninstall PowerDirector, reinstall the build under test, restore Developer Server, sign in, set the tier, turn on Log stage timings and Write Log; then a drama at the video settings card', act: 'Tap Generate Video, then 「Notify me」', exp: 'The iOS notification permission dialog appears', prio: 'P2', ref: rNotifyYes, notes: 'Own fresh install', pass: 'job states' });
A({ sec: 'Video', pre: 'Fresh install (part of this case): uninstall PowerDirector, reinstall the build under test, restore Developer Server, sign in, set the tier, turn on Log stage timings and Write Log; then a drama at the video settings card', act: 'Tap Generate Video, tap 「Not now」, then start another video', exp: 'The pre-prompt does not appear for the second video', prio: 'P3', ref: rNotifyYes, notes: 'Own fresh install', pass: 'job states' });
const rToastFail = req('Job states', 'PM:pm-update-5 #4 (10/8)', 'The in-app toast and the push come once, only when the whole video is done; a partial or total failure, or a 6xxx auto-retry in progress, sends none.');
A({ sec: 'Video', pre: 'Video generating with one scene set to fail (Pink › Inject failure status); user on another page of the app', act: 'Wait until the video ends', exp: 'No 「Good news!」 toast appears', prio: 'P2', ref: rToastFail, pass: 'job states', needs: ['video'] });
const rToastBtns = req('Job states', 'PM:pm-0930-updates §6.2', 'The task-completed toast offers Close (keeps the current page) and View (opens History).');
A({ sec: 'Video', pre: '「Good news! Your "{Drama title}" is ready.」 toast shown on another page', act: 'Tap 「Close」; on the next finished video tap 「View」', exp: 'Close dismisses the toast and keeps the current page; View opens History', prio: 'P3', ref: rToastBtns, pass: 'job states', needs: ['video'] });
const rPush = req('Job states', 'PM:pm-0930-updates §6.3', 'In the background a finished video sends one push 「Your drama is ready」/「"{Drama title}" is done. Tap to watch it.」; tapping it opens that chat at the video card.');
A({ sec: 'Video', pre: 'Notifications allowed; video generating; app sent to the background', act: 'Wait for the video to finish, then tap the push', exp: 'One push 「Your drama is ready」/「"{Drama title}" is done. Tap to watch it.」; tapping it opens that chat at the video card', prio: 'P2', ref: rPush, pass: 'job states', needs: ['video'] });
const rRenameNote = req('Job states', 'PM:pm-update-4 Bug 0016 §6.4', 'After a rename, the History card, the toast and the push use the new name.');
A({ sec: 'History', pre: 'Drama renamed in History while its video is generating', act: 'Wait for the video to finish on another page, then for a second one with the app in the background', exp: 'The toast and the push use the new name', prio: 'P3', ref: rRenameNote, pass: 'job states', needs: ['video'] });
const rHint = req('Job states', 'PM:pm-1002-update §13.1', 'The 「Tap to choose a look for {name}」 hint disappears when any slot is tapped and is not shown once every character is set.');
A({ sec: 'Characters', pre: 'Change Characters with the hint 「Tap to choose a look for {name}」 showing', act: 'Tap a different slot than the one the hint points to', exp: 'The hint disappears', prio: 'P3', ref: rHint, pass: 'job states' });
A({ sec: 'Characters', pre: 'Every cast slot already has a look', act: 'Open Change Characters and change one look', exp: 'No 「Tap to choose a look for…」 hint appears', prio: 'P3', ref: rHint, pass: 'job states' });
const rFullEdit = req('Persistence', 'PM:pm-1002-update §13.2', 'Returning from Full Edit keeps the chat position the user left.');
A({ sec: 'Chat behaviour', pre: 'Finished video; chat scrolled up to an earlier card', act: 'Open Full Edit, then come back to the chat', exp: 'The chat is at the same position as before', prio: 'P3', ref: rFullEdit, notes: 'TC-101/102 cover History and Change Characters', pass: 'persistence', needs: ['video'] });

// Pass 3: fields × rules
const rLimit = req('Fields', 'PM:pm-update-3 §13.11; DS:ds-storyboard, ds-video (967/1000)', 'The 1,000-character limit applies to every description input, including the scene image and scene video descriptions: red 「1000/1000」, extra input ignored, pasted text cut, 「You\'ve reached the 1,000-character limit.」; deleting below 1,000 clears both.');
for (const [sec, field, needs] of [['Storyboard', 'Scene description editor open (Edit on a failed scene)', [] as string[]], ['Video errors', 'Scene-video description editor open (Edit on a failed clip)', ['video']]] as const) {
  A({ sec, pre: field, act: 'Type to the limit, then paste more text', exp: 'Text stops at 1,000 characters; counter shows red 「1000/1000」; 「You\'ve reached the 1,000-character limit.」', prio: 'P3', ref: rLimit, pass: 'fields', needs: [...needs] });
  A({ sec, pre: `${field}, text at 1,000 with the limit message`, act: 'Delete one character', exp: 'The counter is no longer red and the message disappears', prio: 'P3', ref: rLimit, pass: 'fields', needs: [...needs] });
}
const rSections = req('Fields', 'PM:pm-error-handling; DS:ds-video', 'The scene-video description is plain editable text in sections 「Cinematic Style」, 「Scene」, 「Motion」, 「Camera」 (headings kept, one paragraph each) with the regenerate button priced by the model used.');
A({ sec: 'Video errors', pre: 'Scene-video description editor open (Edit on a failed clip)', act: 'Read the description and the button', exp: 'Plain editable text in four sections with their headings 「Cinematic Style」, 「Scene」, 「Motion」, 「Camera」, one paragraph each; 「Regenerate scene ◆30」 below', prio: 'P3', ref: rSections, notes: 'PM labels the button 「Regenerate Video ◆30」; Design wins', pass: 'fields', needs: ['video'] });
const rOneRef = req('Fields', 'PM:pm-main-flow', 'A character takes one reference photo; choosing another replaces it.');
A({ sec: 'Make your character', pre: 'Create my character with a reference photo added', act: 'Tap Reference again and pick a different photo', exp: 'The new photo replaces the old one; only one reference photo is shown', prio: 'P3', ref: rOneRef, pass: 'fields' });

// Pass 5: persistence
const rTitle = req('Persistence', 'PM:pm-update-4 Bug 0014', 'The History name is the drama title and follows title changes; a user Rename wins over later title changes.');
A({ sec: 'History', pre: 'Drama never renamed', act: 'Ask Iris in the chat to change the story title, then open History', exp: 'The card shows the new drama title', prio: 'P3', ref: rTitle, pass: 'persistence' });
A({ sec: 'History', pre: 'Drama renamed by the user in History', act: 'Ask Iris in the chat to change the story title, then open History', exp: 'The card keeps the name the user gave it', prio: 'P3', ref: rTitle, pass: 'persistence' });
const rThumb = req('Persistence', 'DS:ds-recent-task', 'The History thumbnail is the first storyboard frame once a storyboard exists; before that, the default thumbnail.');
A({ sec: 'History', pre: 'Drama saved at the outline stage (no storyboard yet)', act: 'Open History', exp: 'Its card shows the default thumbnail', prio: 'P3', ref: rThumb, notes: 'TC-106 covers the storyboard frame', pass: 'persistence' });
const rNext = req('Persistence', 'DS:ds-video', 'After the full video, 「Ready for the next episode?」 offers 「Create Next Episode」, which starts the next episode of this drama.');
A({ sec: 'Video', pre: 'Full video finished; 「Ready for the next episode?」 shown', act: 'Tap 「Create Next Episode」', exp: 'A new episode starts from this drama\'s story (record what opens); the first drama stays in History unchanged', prio: 'P2', ref: rNext, notes: 'The destination is not drawn in Design; older PM frames start a new outline and keep episode 1. If it differs, disposition question', pass: 'persistence', needs: ['video'] });
const rCont = req('Persistence', 'Req: REQ-011', 'After the user stops a generation, the story can be continued from the last saved stage in the same chat.');
A({ sec: 'Interruption', pre: 'Outline or chat revision stopped with Stop', act: 'Send a message asking Iris to continue the story', exp: 'The story continues from the last saved stage; nothing already made is lost', prio: 'P3', ref: rCont, notes: 'Colleague direction; the spec is silent. If it cannot continue, disposition spec-addition', pass: 'persistence' });

// Pass 6: MX
const rFirstUse = req('MX', 'MX:mx-b-mid (version A)', 'A user\'s first AI Mini Drama use grants feature free-use credits once (1,000, TBD in MX), spendable only on its character, storyboard and video generation; own credits are charged after they run out.');
A({ sec: 'Credits and limits', pre: 'An account that has never used AI Mini Drama', act: 'Create a character, a storyboard and a video, then try a credit feature outside AI Mini Drama', exp: 'Free-use credits are granted once and pay for the three AI Mini Drama steps; they are not offered elsewhere; after they run out own credits are charged', prio: 'P2', ref: rFirstUse, pass: 'MX', needs: ['new-account'] });
const rLock = req('MX', 'MX:mx-b-mid (version A)', 'During first-time free use the generation model is fixed (images ChatGPT-2, video Seedance 2.0 1080p, TBD) and cannot be chosen.');
A({ sec: 'Credits and limits', pre: 'An account in its first-time free use', act: 'Open the image generation step and the video settings card', exp: 'The model is preset and cannot be changed', prio: 'P2', ref: rLock, pass: 'MX', needs: ['new-account'] });

// Standing input: request ledger
const rCrash = req('Requests', 'Req: REQ-001', 'Normal button sequences during a chat reply never crash or restart the app.');
A({ sec: 'Chat behaviour', pre: 'Chat with a reply being generated', act: 'Run each: (1) Send, then Stop while it replies; (2) Stop, edit the input, Send, Stop; (3) Stop, Back, reopen the chat from History; (4) Back while it replies, return, Stop', exp: 'The app never crashes or restarts; the chat is usable after each sequence', prio: 'P2', ref: rCrash, pass: 'requests' });
const rThumbs = req('Requests', 'Req: REQ-003', 'Selecting a built-in character template leaves the other template thumbnails steady.');
A({ sec: 'Characters', pre: 'Change Characters open on the built-in character templates', act: 'Tap several templates one after another', exp: 'The other thumbnails stay visible; none blanks or flickers while another is selected', prio: 'P3', ref: rThumbs, notes: 'Record the screen (Appium) to catch a short blank', pass: 'requests' });
const rPopup = req('Requests', 'Req: REQ-007', 'The History info bubble points at the ⓘ button and stays fully on screen.');
A({ sec: 'History', pre: 'History open', act: 'Tap the ⓘ button', exp: 'The info bubble opens with its arrow pointing at the ⓘ button and stays fully on screen', prio: 'P3', ref: rPopup, notes: 'TC-105 covers the text and the outside tap', pass: 'requests' });
const rIcons = req('Requests', 'Req: REQ-008; DS:ds-template-detail', 'Each template category header shows its own icon as in Design.');
A({ sec: 'Templates', pre: 'More page open', act: 'Look at each category header', exp: 'Each category shows its own icon as in Design, not one icon repeated', prio: 'P3', ref: rIcons, pass: 'requests' });

// Standing input: build notes (RD Note on the Testing Request)
const rBuildRegen = req('Build checks', 'Build: TR261006-0055 RD Note (189463); Req: REQ-021', 'Asking to regenerate a fully set cast shows a priced Create characters offer that completes.');
A({ sec: 'Build checks', pre: 'Every character in the cast has a look', act: 'Ask Iris to regenerate all the characters, answer any question, then tap Generate', exp: 'A priced 「Create characters」 offer appears (not an empty picker); Generate completes with new looks, charged once', prio: 'P2', ref: rBuildRegen, notes: 'Retire after it passes on two builds', pass: 'build notes' });
const rBuildCap = req('Build checks', 'Build: TR261006-0055 RD Note (189463); Req: REQ-021', 'A caption failure no longer marks scene details or blocks scene-video playback.');
A({ sec: 'Build checks', pre: 'Video whose captions failed', act: 'Open a scene\'s details and play its scene video', exp: 'No missing-caption marker or caption error card in scene details; the scene video plays with no error overlay', prio: 'P3', ref: rBuildCap, notes: 'Retire after it passes on two builds', pass: 'build notes', needs: ['video', 'stt-failure'] });
const rBuildDl = req('Build checks', 'Build: TR261006-0055 RD Note (189463); Req: REQ-021', 'A failed download leaves its busy state and can be retried.');
A({ sec: 'Build checks', pre: 'Video finished; Appium confirmed on USB', act: 'Tap download, turn Wi-Fi off before it finishes, turn it back on, then tap download again', exp: 'The first attempt ends its spinner with an error; the second shows the spinner, then 「Saved to your device.」', prio: 'P3', ref: rBuildDl, notes: 'Real network loss (REQ-020). Retire after it passes on two builds', pass: 'build notes', needs: ['video'] });

const newIds: string[] = [];
for (const n of add) {
  const id = `TC-${String(nextTc++).padStart(3, '0')}`;
  newIds.push(id);
  rows.push({ ID: id, Section: n.sec, Precondition: n.pre, Action: n.act, 'Expected Result': n.exp, Priority: n.prio, 'Spec Ref': n.ref,
    Notes: n.notes ?? '', Change: 'new', 'Change Reason': `Added 2026-10-21 by the ${n.pass} ${n.pass === 'requests' || n.pass === 'build notes' ? 'input' : 'pass'}` });
}

// ---------- flow arrows (pass 1): every Design arrow has a requirement and a row that walks it ----------
const arrows: { arrow: string; node: string; edge: string; expected: string }[] = JSON.parse(readFileSync(join(SPEC, 'arrows.json'), 'utf8')).arrows;
const TEMPLATE = 'TC-236 (and every template journey row; Blocked by REQ-019)';
const WALKED: Record<string, string> = {
  '2778-129128': 'TC-002', '2778-129129': 'TC-001', '2778-129130': 'TC-011', '2778-129131': 'TC-013', '2778-129132': 'TC-020',
  '2778-129133': 'TC-022', '2778-129134': 'TC-009', '2778-129135': 'TC-033', '2778-129136': 'TC-044', '2778-129137': 'TC-060',
  '2778-129138': TEMPLATE, '2778-129139': 'TC-081', '2778-129140': TEMPLATE, '2778-129141': 'TC-087', '2778-129142': 'TC-024',
  '2778-129143': 'TC-024', '2778-129145': TEMPLATE, '2778-129147': TEMPLATE, '2778-129148': TEMPLATE, '2778-129149': 'TC-087',
  '2778-129150': 'TC-033', '2778-129151': 'TC-075', '2778-129152': 'TC-075', '2778-129153': 'TC-086', '2778-129155': 'TC-086',
  '2811-105836': 'TC-036', '2811-90143': 'TC-033', '2811-90146': 'TC-041', '2811-90151': 'TC-033', '2811-90152': 'TC-039',
  '2811-90153': 'TC-037', '2811-90153-KEEP-CHOOSING': 'TC-038', '2811-90214': 'TC-041', '2811-90215': 'TC-041', '2811-90583': 'TC-047',
  '2811-90590': 'TC-132', '2811-97718': 'TC-036', '2811-97719': 'TC-036', '2820-113561': 'TC-065', '2820-113562': 'TC-075',
  '2820-113563': 'TC-138', '2820-115457': 'TC-087', '2820-115458': 'TC-087', '2820-123493': 'TC-111', '2820-123494': 'TC-029',
  '2820-123495': 'TC-113', '2820-125869': 'TC-116', '2824-132729': 'TC-018', '2837-147745-PINCH': 'TC-130', '3142-70052': 'TC-140',
  '3142-70054': 'TC-070', '3167-119744': 'TC-043', '3172-101673': 'TC-092', '3172-101674': 'TC-092', '4078-177644': 'TC-098',
};
const arrowLines: string[] = [];
for (const a of arrows) {
  const listed = a.arrow === a.node && oldReq.includes(`flow arrow ${a.node} `);
  if (listed) continue;
  const by = WALKED[a.arrow];
  if (!by) throw new Error(`Arrow ${a.arrow} has no requirement and no walking row`);
  const id = `R-${String(nextR++).padStart(3, '0')}`;
  arrowLines.push(`- ${id} [DS: flow arrow ${a.arrow} ${DS}${a.node}] ${a.edge}: ${a.expected} Walked by: ${by}.`);
}

// ---------- job-state grid (pass 2) ----------
const GRID = `| Job | Start / loading | Success | Failure | Retry | Second failure | Partial success | Stop | Leave and return | Wait | Done notice |
|---|---|---|---|---|---|---|---|---|---|---|
| Outline | TC-023 | TC-024 | TC-030, TC-031, TC-032 | TC-030 | n/a (spec silent) | n/a | TC-153 | TC-025–TC-029, TC-159, TC-160, ${newIds[9]} | TC-169 | n/a |
| Characters (Generate all / with AI) | TC-041 | TC-041, TC-044 | TC-043 | TC-042 | n/a (spec silent) | TC-042 | TC-154 | TC-161, TC-162 | TC-170 | n/a |
| Create my character | TC-048, TC-049 | TC-132, TC-133 | TC-137 | TC-137 | n/a (spec silent) | n/a | TC-154 | TC-055, TC-056 | TC-170 | n/a |
| Chat revision | TC-045 | TC-045 | n/a (spec silent) | n/a (spec silent) | n/a | n/a | TC-155 | TC-163 | TC-171 | n/a |
| Storyboard | TC-060 | TC-064 | ${newIds[3]}, ${newIds[8]} | ${newIds[3]} | n/a (spec silent) | TC-077 | TC-156, TC-061, TC-062 | TC-063, TC-164, TC-165, ${newIds[10]} | TC-172 | n/a |
| Scene image and Location | TC-071 | TC-064, TC-065 | TC-067, TC-068, TC-069 | TC-070, TC-141 | n/a (spec silent) | ${newIds[0]} | n/a (no Stop) | n/a | n/a | n/a |
| Chat image update | TC-072, TC-073 | TC-073, TC-074 | ${newIds[1]} | ${newIds[1]} | n/a (spec silent) | ${newIds[1]} | ${newIds[2]} | ${newIds[2]} | n/a | n/a |
| Storyboard Preview | TC-075 | TC-075, TC-076 | TC-077, TC-078, ${newIds[7]} | TC-078, ${newIds[7]} | n/a (spec silent) | n/a | n/a | n/a | n/a | n/a |
| Scene video (clip) | TC-081 | TC-086 | TC-091, TC-092, TC-095 | TC-092, TC-149 | TC-092 | TC-091, TC-093 | TC-157 | TC-082, TC-144, TC-166 | TC-173 | n/a |
| Video regeneration | TC-096 | TC-096, TC-145, ${newIds[5]} | ${newIds[4]} | n/a (spec silent) | n/a | n/a | n/a | TC-144 | n/a | ${newIds[5]} |
| Full video | TC-081, TC-084 | TC-086, TC-087 | TC-094 | TC-094 | n/a (spec silent) | TC-091 | TC-157 | TC-082, TC-167 | TC-173 | TC-085, ${newIds.slice(11, 17).join(', ')} |
| Captions | TC-098 | TC-099 | TC-098 | TC-098, TC-151 | ${newIds[6]} | n/a (never partial: TC-098) | n/a | n/a | n/a | n/a |
| Download / export | TC-089 | TC-089, TC-090 | ${newIds[newIds.length - 1]} | ${newIds[newIds.length - 1]} | n/a | n/a | n/a | TC-168 | TC-174 | n/a |`;

// ---------- requirements.md ----------
const head = oldReq
  .replace(/^Spec: .*$/m, 'Spec: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama - PM spec.pdf (spec set specs/2026-10-19; board notes in specs/2026-10-19/extracted/board-notes.md, flow arrows in specs/2026-10-19/extracted/arrows.json)')
  .replace(/^Source tags: .*$/m, 'Source tags: [PM:<board>] / [DS:<board>] / [MX:<board>] = board id in specs/2026-10-19/extracted/boards/ (boards up to R-103 were read from the identical 2026-10-16 copies); [Req: REQ-…] = library/pdr/ai-mini-drama/requests.md; [Build: TR…] = RD Note on that Testing Request. Newest dated frame wins when frames disagree; Design > MX > PM.');
const NEW_Q = [
  '- Q-6 PM-only, no frame in the current Design: manual outline editor with save, discard and empty-text rules (PM F40–F47). Still planned? Rows follow your answer.',
  '- Q-7 PM-only: manual storyboard text and image-version editor, and 「Regenerate this thumbnail?」 after a text edit (PM F73, F106, F108). Still planned?',
  '- Q-8 PM-only: separate 「From Text」 / 「From Photo」 character creation routes (PM F85); Design has one combined form. Is the combined form final?',
  '- Q-9 PM-only: aspect-ratio choice on the format card (older Recent Task frame shows "2. Aspect ratio: 9:16"); the current format card has none. Dropped?',
  '- Q-10 PM-only: scene reordering in the Full Edit timeline (PM F68). Planned?',
  '- Q-11 PM-only: a Cancel / Use dialog when an inspiration would replace edited text (PM F20); the current rule appends (R-014). Dropped?',
  '- Q-12 Character description over the limit: Design (ds-characters) shows 「1120/1000」 with the limit message, i.e. text kept above 1,000; PM §13.11 cuts it at 1,000 (TC-051). Which is intended?',
  '- Q-13 Full-video length: Design shows 90 s and 120 s frames; older PM ties length to 15 s per scene. Is the full video 15 s × scene count?',
  '- Q-14 PM E4 offers 「Create video anyways」 when some storyboard scenes are missing; older PM blocks the video until every required image exists. Which applies?',
].join('\n');
const withQ = head.replace(/(\n## Open questions\n(?:- .*\n?)+)/, m => `${m.trimEnd()}\n${NEW_Q}\n`);
const LEDGER = `| Ledger entry | Requirements |
|---|---|
| REQ-001 crash sequences | ${rCrash} |
| REQ-002 waits, leave and return, Stop notice | R-138, R-139, R-140 |
| REQ-003 character templates (select, thumbnails) | R-141 (TC-176 regression), ${rThumbs} |
| REQ-004 page text ENU/CHT/JPN | R-149 |
| REQ-005 generated storyboard text | R-150 |
| REQ-006 English quote marks | R-150 |
| REQ-007 History info popup | ${rPopup} |
| REQ-008 template category icons | ${rIcons} |
| REQ-009 template name scan | R-010, R-148 |
| REQ-010 every template to a finished video | R-148 (journeys Blocked by REQ-019) |
| REQ-011 colleague directions | R-151, R-152, R-153, R-154, R-155, ${rCont} |
| REQ-012 regression rows | R-141 |
| REQ-021 RD build notes, TR261006-0055 | ${rBuildRegen}, ${rBuildCap}, ${rBuildDl}; folded into TC-065, TC-100 |`;
const out = `${withQ}

## Added 2026-10-21 — coverage passes and standing inputs
Skill sections "Coverage passes", "Standing inputs" and "Value check" (user approved 2026-10-21, REQ-018).
${Object.entries(reqLines).map(([s, l]) => `\n### ${s}\n${l.join('\n')}`).join('\n')}

### Flow arrows walked by existing rows
Every Design arrow in arrows.json is either cited by a row above (「flow arrow <node>」) or listed here with the row that walks it.
${arrowLines.join('\n')}

### Job states
Every cell names the rows that check it, or n/a when the spec defines nothing for that state.

${GRID}

### Request ledger coverage
${LEDGER}
`;
writeFileSync(join(HERE, 'requirements.md'), out);

// ---------- draft.csv ----------
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

// ---------- phases.json ----------
const oldPhases = JSON.parse(readFileSync(join(IOS, 'drafts', '20261019-094124', 'phases.json'), 'utf8'));
const phases = structuredClone(oldPhases);
phases.draft = '20261021-150855';
for (const p of phases.phases) for (const s of p.segments ?? []) s.cases = s.cases.filter((c: string) => c !== 'TC-211');
phases.needs['TC-211'] && delete phases.needs['TC-211'];
for (let n = 236; n <= 274; n += 2) phases.needs[`TC-${n}`] = [...new Set([...(phases.needs[`TC-${n}`] ?? []), 'full-generation'])];
phases.unavailable['full-generation'] = 'user 2026-10-21 (REQ-019): asked not to run this many full generations; template journeys stay Blocked';
phases.unavailable['stt-failure'] = 'observability: no Pink fault switch makes speech-to-text fail; ask RD for a fixture (observability)';
add.forEach((n, i) => { if (n.needs?.length) phases.needs[newIds[i]] = n.needs; });
const seg = (id: string, name: string, pick: (n: New, i: number) => boolean) => ({ id, name, cases: newIds.filter((_, i) => pick(add[i], i)) });
const isFresh = (n: New) => n.pre.startsWith('Fresh install');
const used = new Set<string>();
const take = (s: { cases: string[] }) => { s.cases = s.cases.filter(c => !used.has(c)); s.cases.forEach(c => used.add(c)); return s; };
phases.phases.push({
  id: 'P5', name: 'Added 2026-10-21',
  note: 'Rows from the 2026-10-21 analysis upgrade, ordered by journey stage; fresh-install and new-account rows last.',
  segments: [
    take(seg('P5-a', 'Outline, characters, chat and requests', n => ['Story outline', 'Characters', 'Make your character', 'Chat behaviour', 'Interruption', 'Templates'].includes(n.sec) && !n.needs?.length && !isFresh(n))),
    take(seg('P5-b', 'Storyboard and preview', n => ['Storyboard', 'Storyboard Preview'].includes(n.sec) && !isFresh(n))),
    take(seg('P5-c', 'Video, notifications, captions, build checks', n => !isFresh(n) && !(n.needs ?? []).includes('new-account') && ['Video', 'Video errors', 'Captions', 'Build checks', 'Chat behaviour'].includes(n.sec))),
    take(seg('P5-d', 'History', n => n.sec === 'History')),
    take(seg('P5-e', 'Fresh install and new account', n => isFresh(n) || (n.needs ?? []).includes('new-account'))),
  ],
});
const left = newIds.filter(c => !used.has(c));
if (left.length) throw new Error(`New rows without a segment: ${left.join(', ')}`);
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(phases, null, 1) + '\n');

const count = (c: string) => rows.filter(r => r.Change === c).length;
console.log(JSON.stringify({ rows: rows.length, active: rows.length - count('removed'), new: count('new'), modified: count('modified'), removed: count('removed'),
  newIds: `${newIds[0]}–${newIds.at(-1)}`, arrowRequirements: arrowLines.length, requirements: `up to R-${nextR - 1}` }, null, 1));
