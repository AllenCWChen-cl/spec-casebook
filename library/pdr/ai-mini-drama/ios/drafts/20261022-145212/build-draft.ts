// Build draft 20261022-145212 on the same spec set (2026-10-21-2), from the approved v7 table.
// The user (2026-10-22, REQ-032): the casebook's own analysis must find the spec rules the spec agent found, so this
// draft runs the new analysis steps on the current spec and adds what they find:
// - Reading the spec step 9, annotation trace: 475 blocks traced by six subagents (trace-parts/*.json, merged into
//   annotation-trace.json); 66 blocks stated rules no requirement covered → R-267 – R-305 below.
// - Coverage pass 9 (hidden clauses) and pass 10 (variants): the two grids, which also found R-050, R-063, R-084 and
//   R-266 rows missing.
// Rows: new ones go right after the row they extend; old rows are modified where the new rule is checked on the same
// screen (user, 2026-10-22: inserting between earlier rows and modifying old rows is fine). The 10/22 rows TC-356 –
// TC-369 move next to the rows they belong with. Run order: phase P9 (round 3) collects every row not run yet and every
// row whose check changed, by journey stage; P5 – P8 now run inside it.
// Re-runnable: node library/pdr/ai-mini-drama/ios/drafts/20261022-145212/build-draft.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const IOS = join(HERE, '..', '..');
const DRAFT = '20261022-145212';
type Row = Record<string, string>;
const approved: Row[] = readTable(join(IOS, 'cases.csv'));
if (approved.length !== 368) throw new Error(`expected v7 with 368 rows, found ${approved.length}`);
let rows: Row[] = approved.map(r => ({ ...r, Change: 'unchanged', 'Change Reason': '' }));
const byId = () => new Map(rows.map(r => [r.ID, r]));
const WHY = 'Annotation trace (REQ-032)';
const WHY9 = 'Coverage pass 9, hidden clauses (REQ-032)';
const WHY10 = 'Coverage pass 10, variants (REQ-032)';

// ---------- requirements ----------
let req = readFileSync(join(IOS, 'requirements.md'), 'utf8').trimEnd();
const maxR = Math.max(...[...req.matchAll(/\bR-(\d{3,})\b/g)].map(m => +m[1]));
if (maxR !== 266) throw new Error(`expected R-266 as the highest v7 requirement, found R-${maxR}`);
const swap = (re: RegExp, s: string) => { if (!re.test(req)) throw new Error(`missing ${re}`); req = req.replace(re, s); };
const NEWREQ: [string, string][] = [
  ['R-267', '[DS:ds-characters; Req: REQ-032] In Choose Character a cast slot with no look yet shows the default placeholder image.'],
  ['R-268', '[DS:ds-characters; Req: REQ-032] 「AI Suggestion」 fills the description and settings for the cast character being created (the {name} in 「Tell us what {name} looks like」), not a generic character.'],
  ['R-269', '[DS:ds-characters; Req: REQ-032] After 「Save to library」 the character is applied to the slot at once, and its library thumbnail carries a 「Mine」 tag at the lower left (the PM mockups show 「My character」; Design wins).'],
  ['R-270', '[DS:ds-characters; Req: REQ-032] Tapping the description text itself, not only the expand icon, opens the full-screen description editor.'],
  ['R-271', '[DS:ds-characters; Req: REQ-032] After 「Got it」 on a character failure, Choose Character opens with the failed character\'s slot selected; characters that succeeded are applied.'],
  ['R-272', '[DS:ds-characters; Req: REQ-032] Dragging an Age slider handle in the Filter panel shows its current value above the handle.'],
  ['R-273', '[DS:ds-home-custom-chat; Req: REQ-032] With the keyboard open, the input box of a new chat and of a chat with content grows with the text up to its maximum height; longer text scrolls inside the box.'],
  ['R-274', '[DS:ds-main-flow; Req: REQ-032] Scrolling up to earlier messages shows the ↓ button at the bottom right of the chat.'],
  ['R-275', '[DS:ds-video 「點擊 Preview 暫停」; Req: REQ-032] In the scene-video player, tapping the playing video pauses it and shows the play button over the frame.'],
  ['R-276', '[DS:ds-video; Req: REQ-032] When the drama has failed scenes, the chat\'s 「Here\'s your drama.」 video card hides its download icon.'],
  ['R-277', '[MX:mx-a-left ① version A; Req: REQ-032] A Pro user\'s 31st send of the day shows the 「Daily Free Chat Limit Reached」 dialog (the Pro mockup titles it 「Free Chat Limit Reached」), whose 「Upgrade to Premium」 opens the subscription page; 「Today\'s AI Chats Are Used Up」 is for Pro+ only (R-103).'],
  ['R-278', '[PM:pm-1002-update; Req: REQ-032] When some scenes fail, the chat\'s failure message is red text with an 「Edit」 button that opens Full Edit on the first failed scene.'],
  ['R-279', '[PM:pm-1002-update; Req: REQ-032] Tapping 「Generate」 on an action card removes the card without adding a user bubble; the reply appears with a skeleton and the credit pill updates once the credits are charged.'],
  ['R-280', '[PM:pm-1002-update (frame marked 新增); Req: REQ-032] While a scene image regenerates in scene detail, X asks 「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」 with Leave anyway / Keep Generating.'],
  ['R-281', '[PM:pm-1002-update; Req: REQ-032] While the video regenerates, tapping its download icon shows the toast 「Your video is still updating. Try again when it\'s done.」'],
  ['R-282', '[PM:pm-1002-update; Req: REQ-032] The Storyboard Preview arrives together with the storyboard; it has no generating state of its own.'],
  ['R-283', '[PM:pm-1002-update; Req: REQ-032] While a video regenerates, the preview stays and the line under its card reads 「Updating 1 scene... Your video will refresh when it\'s done.」 (the number of scenes being updated).'],
  ['R-284', '[PM:pm-error-handling; Req: REQ-032] 5xxx scene-image and scene-video failure cards show the refund text and an 「Edit」 button.'],
  ['R-285', '[PM:pm-error-handling, pm-1002-update; Req: REQ-032] 3 hours after a 6xxx upload failure the card reads 「We couldn\'t finish this video. Your credits have been refunded. Edit the description and try again.」 with 「Edit」, and Credit Details shows the credits returned.'],
  ['R-286', '[PM:pm-update-5, pm-error-handling; Req: REQ-032] A failure shown in a 9:16 preview (a scene image in scene detail, a scene video in Full Edit) stays inside the frame: icon, title, description and button stacked and centred, text wrapped to the frame width with 12 px side margins.'],
  ['R-287', '[PM:pm-main-flow; Req: REQ-032] The two inspiration chips are the first two strings of the 10-string pool; 「Surprise me」 picks only from the other strings.'],
  ['R-288', '[PM:pm-main-flow; Req: REQ-032] Back before an outline starts (empty input, an idea typed but not sent, or the format card shown) returns to the AI Mini Drama landing page and saves nothing to History.'],
  ['R-289', '[PM:pm-main-flow 「img: poster 劇照」; Req: REQ-032] Each landing-page template thumbnail is the template\'s poster still.'],
  ['R-290', '[PM:pm-main-flow; Req: REQ-032] On the video result page, tapping a scene thumbnail moves the player to that scene.'],
  ['R-291', '[PM:pm-main-flow; Req: REQ-032] While Make your character is generating, tapping the dark area outside the sheet asks 「Stop and lose your credits?」, as X does.'],
  ['R-292', '[PM:pm-main-flow; Req: REQ-032] The reference-photo checks (no person, several people, public figure) run when Generate is tapped, not when the photo is added.'],
  ['R-293', '[PM:pm-update-11 §13.23 (10/21); Req: REQ-032] 「Discard this character?」 reads 「It won\'t be saved, and the credits you spent won\'t be refunded.」 with 「Keep」 and a red 「Discard」.'],
  ['R-294', '[PM:pm-update-3; Req: REQ-032] After 「Couldn\'t create some images」 is closed, 「{n} characters aren\'t set yet」 lists the failed characters marked 「!」; tapping one opens Character Library on it to regenerate or pick a look, and the story cannot continue until every character is set.'],
  ['R-295', '[PM:pm-update-3; Req: REQ-032] While a chat storyboard-image update runs, only the changed scenes and the Storyboard Preview show skeletons; the other scenes show normally.'],
  ['R-296', '[PM:pm-update-4; Req: REQ-032] Swiping the app away while the outline is still generating saves nothing: no History entry for that chat.'],
  ['R-297', '[PM:pm-update-5 (10/6); Req: REQ-032] Sending a chat message with no network shows the toast 「You\'re offline. Check your connection and try again.」 instead of an AI message; the message does not go out and nothing is charged.'],
  ['R-298', '[PM:pm-update-5 #4 (10/8); Req: REQ-032] When a 6xxx auto-retry succeeds and every scene is done, the done toast and push come once at that point.'],
  ['R-299', '[PM:pm-update-6 (10/14); Req: REQ-032] In scene detail the Location thumbnail shows a skeleton while generating, the location image on success (before the main image finishes) and a pink icon with 「Location • Failed」 on failure; the main image keeps its width.'],
  ['R-300', '[PM:pm-update-6 (10/14); Req: REQ-032] When the location and the main image both fail, the main image shows its error card and the Location thumbnail its failure icon; Edit regenerates both and charges 2 images.'],
  ['R-301', '[PM:pm-update-7 (10/16); Req: REQ-032] When Iris asks which character to change, the user can type the answer instead of tapping a chip; the new Story Outline & Characters card updates the outline text as well as the images.'],
  ['R-302', '[PM:pm-update-8 (10/16); Req: REQ-032] The video model control is titled 「Model • Seedance」 and Best carries no 「NEW」 tag.'],
  ['R-303', '[PM:pm-update-9 (10/16); Req: REQ-032] Send Feedback fills the e-mail only for a signed-in user, and the task ID is sent with the report without showing on the form.'],
  ['R-304', '[PM:pm-update-9 (10/16); Req: REQ-032] 「Send Feedback」 is the blue primary button beside 「Close」 in the timeout dialog.'],
  ['R-305', '[PM:pm-update-9 (10/16); Req: REQ-032] When Finish your characters completes it shows 「Your characters are ready」/「Tap Confirm to continue.」 instead of 「0 characters still need a look」.'],
];
swap(/^(- R-048 .*)$/m, '$1 — Replaced 2026-10-22 (REQ-032): PM 10/21 §13.23 (R-248, R-293), only Save to library saves; the annotation trace found the old text still here. NOT TESTABLE: replaced');
swap(/^(- R-089 .*)$/m, '$1 — Changed 2026-10-22 (REQ-032): PM 10/20 §13.2 ① — the chat always opens at the bottom (newest message) after Character Library, Full Edit or History.');
swap(/^(- R-173 .*)$/m, '$1 — Changed 2026-10-22 (REQ-032): PM 10/20 §13.2 ① — the chat opens at the bottom (newest message).');
swap(/^(- R-103 .*)$/m, '$1 — Changed 2026-10-22 (REQ-032): MX version A gives this dialog to Pro+ only; Pro gets the Free dialog (R-277).');
swap(/^(- R-165 .*)$/m, '$1 — Changed 2026-10-22 (REQ-032): PM 10/6 (pm-update-5) is newer than §5 of 09/30: the chat shows Try again instead of resuming by itself.');
swap(/^(- Q-17 .*)$/m, '$1\n- Q-18 PM main flow note 「day 1 只有 US & JP」 beside the template grid: are templates limited to the US and JP stores on day 1? Affects R-289 and the template rows (REQ-032).');
swap(/^(\| Scene image and Location \|(?:[^|]*\|){6})[^|]*\|/m, '$1 TC-378 |');
swap(/^(\| REQ-031 .*)$/m, '$1\n| REQ-032 The analysis finds spec rules itself (2026-10-22) | R-267 – R-305 (annotation trace, passes 9 and 10) |');

// ---------- rows: modifications ----------
type Mod = { P?: string; A?: string; E?: string; addE?: string; refs?: string; setRefs?: string; notes?: string; why: string };
const MODS: Record<string, Mod> = {
  'TC-003': { addE: '; each template thumbnail is the template\'s poster still', refs: 'R-289', notes: 'Q-18: are templates US and JP only on day 1?', why: WHY },
  'TC-033': { addE: '; slots with no look yet show the default placeholder image', refs: 'R-267', notes: 'Design draws the library tag as 「Mine」 (R-269); record which tag shows', why: WHY },
  'TC-043': { E: '「Couldn\'t create image」/「We couldn\'t create this character. Your credits have been refunded. Try again.」 with 「Got it」; Got it opens Choose Character with the failed character\'s slot selected, and characters that succeeded are applied', refs: 'R-271', why: WHY },
  'TC-052': { A: 'Add a photo with three people, check that no warning shows yet, then tap Generate', E: 'No warning when the photo is added; after Generate 「More than one person detected」/「For the best result, use a photo with just one person.」 with 「Generate anyway」 and 「Use another photo」', refs: 'R-292', why: WHY },
  'TC-057': { setRefs: 'R-248, R-293', why: `${WHY}: R-048 was replaced by PM 10/21 §13.23` },
  'TC-060': { addE: '; Mine › Credits › Details books it as Text to Image rows (2 credits per image) and a Text to Speech row that add up to that price', why: WHY9 },
  'TC-064': { addE: '; the Storyboard Preview card arrives with the storyboard, with no generating state of its own', refs: 'R-282', why: WHY },
  'TC-067': { addE: '; the error content stays inside the 9:16 frame, text wrapped to its width', refs: 'R-286', why: WHY },
  'TC-068': { E: '「Couldn\'t create image」/「Your credits have been refunded. The service is busy - try again later.」 with 「Edit」 and no ⓘ', refs: 'R-284', why: WHY },
  'TC-074': { A: 'Play the Storyboard Preview; then pull the logs', addE: '; the log shows a new TextToSpeech call after the image update', why: WHY9 },
  'TC-091': { addE: '; the 「Here\'s your drama.」 video card has no download icon', refs: 'R-276', why: WHY },
  'TC-096': { A: 'Play the old version, tap its download icon and look for Export', E: 'The old version plays; tapping download shows the toast 「Your video is still updating. Try again when it\'s done.」; Export is unavailable; when done 「Your video has been updated.」 shows', refs: 'R-281', why: WHY },
  'TC-118': { P: 'Pro+ account at the daily chat limit (Pink: Show Paid quota dialog)', notes: 'MX version A: Pro gets the Free dialog instead (TC-216, R-277)', why: WHY },
  'TC-126': { E: 'The description and Gender, Ethnicity and Age are filled in for the character named in 「Tell us what {name} looks like」, so Generate becomes available', refs: 'R-268', why: WHY },
  'TC-133': { E: 'The character is applied to the cast slot at once and saved to the library, where its thumbnail shows a 「Mine」 tag at the lower left', refs: 'R-269', notes: 'PM mockups show 「My character」; Design wins', why: WHY },
  'TC-144': { E: 'The existing video stays and the line under its card reads 「Updating 1 scene... Your video will refresh when it\'s done.」', refs: 'R-283', why: WHY },
  'TC-216': { A: 'Send chats until the allowance is used up, then tap 「Upgrade to Premium」', E: 'The 31st chat shows the Premium limit dialog 「Daily Free Chat Limit Reached」 (the Pro mockup titles it 「Free Chat Limit Reached」) with Upgrade to Premium, not 「Today\'s AI Chats Are Used Up」; Upgrade to Premium opens the subscription page; record the count and the title', refs: 'R-277', why: WHY },
  'TC-032': { E: '「You\'re offline. Check your connection and try again.」 is shown; nothing is sent (no request in the log) and no credits are charged (Credit Details)', why: WHY9 },
  'TC-300': { E: 'Toast 「You\'re offline. Check your connection and try again.」; nothing is sent (no request in the log) or charged (Credit Details); the card stays', why: WHY9 },
  'TC-301': { E: 'The chat shows Try again instead of resuming by itself; after the network returns, Try again brings the outline; the format card is not shown again', notes: 'PM 10/6 (pm-update-5) is newer than the 09/30 auto-resume (R-165, REQ-032)', why: `${WHY}: PM 10/6 replaces the auto-resume` },
  'TC-335': { addE: '; Send Feedback is the blue primary button', refs: 'R-304', why: WHY },
  'TC-336': { addE: '; no task ID field is shown', refs: 'R-303', notes: 'The signed-out branch (no e-mail) is not run: the test account is signed in', why: WHY },
  'TC-349': { addE: ' (the outline text is updated as well)', refs: 'R-301', why: WHY },
  'TC-362': { addE: '; in Full Edit the error text stays inside the preview frame, wrapped to its width', refs: 'R-286', why: WHY },
  'TC-363': { E: 'The clip card shows 「Couldn\'t create video」 with the refund text and 「Edit」, and no ⓘ; no dialog opens', refs: 'R-284', why: WHY },
  'TC-369': { P: 'Tier Free; RD has changed the Firebase Remote Config daily chat allowance for Free (e.g. to 3); app relaunched', E: 'The limit dialog appears on the 4th send (allowance 3), not at the spec default (11th)', why: WHY10 },
  'TC-079': { refs: 'R-302', why: WHY },
  'TC-041': { refs: 'R-305', why: WHY },
};
const ids0 = byId();
for (const [id, m] of Object.entries(MODS)) {
  const r = ids0.get(id); if (!r) throw new Error(`no ${id}`);
  if (m.P) r.Precondition = m.P;
  if (m.A) r.Action = m.A;
  if (m.E) r['Expected Result'] = m.E;
  if (m.addE) r['Expected Result'] += m.addE;
  if (m.setRefs) r['Spec Ref'] = m.setRefs;
  if (m.refs) r['Spec Ref'] = [r['Spec Ref'], m.refs].filter(Boolean).join(', ');
  if (m.notes) r.Notes = [r.Notes, m.notes].filter(Boolean).join('. ');
  Object.assign(r, { Change: 'modified', 'Change Reason': m.why });
}

// ---------- rows: placement ----------
// Insert `id` right after `anchor`; several rows placed after one anchor keep their order.
const lastAfter: Record<string, string> = {};
const place = (row: Row, anchor: string) => {
  rows = rows.filter(r => r.ID !== row.ID);
  const after = lastAfter[anchor] ?? anchor;
  const i = rows.findIndex(r => r.ID === after);
  if (i < 0) throw new Error(`anchor ${after} not found`);
  const a = rows.find(r => r.ID === anchor)!;
  if (a.Section !== row.Section) throw new Error(`${row.ID} (${row.Section}) placed after ${anchor} (${a.Section})`);
  rows.splice(i + 1, 0, row); lastAfter[anchor] = row.ID;
};
// The 10/22 rows go next to the rows they belong with (they were appended at their sections' ends).
const MOVES: [string, string][] = [['TC-356', 'TC-114'], ['TC-357', 'TC-028'], ['TC-358', 'TC-028'], ['TC-360', 'TC-029'], ['TC-359', 'TC-062'],
  ['TC-361', 'TC-082'], ['TC-362', 'TC-092'], ['TC-363', 'TC-092'], ['TC-364', 'TC-097'], ['TC-365', 'TC-098'], ['TC-366', 'TC-131'],
  ['TC-367', 'TC-218'], ['TC-368', 'TC-218'], ['TC-369', 'TC-218']];
for (const [id, anchor] of MOVES) place(byId().get(id)!, anchor);
const moved = MOVES.map(m => m[0]);

const lastOfSection = (s: string) => [...rows].reverse().find(r => r.Section === s)!.ID;
type N = { after: string; sec: string; pre: string; act: string; exp: string; prio: string; ref: string; notes?: string; needs?: string[]; why?: string };
const NEW: N[] = [
  { after: 'TC-122', sec: 'Make your character', pre: 'Create my character with some description text', act: 'Tap the description text (not the expand icon)', exp: 'The full-screen description editor opens with the same text', prio: 'P3', ref: 'R-270' },
  { after: 'TC-036', sec: 'Characters', pre: 'Change Characters › Filter open', act: 'Drag an Age slider handle', exp: 'The handle\'s current value (e.g. 「26」) shows above it while dragging', prio: 'P3', ref: 'R-272' },
  { after: 'TC-018', sec: 'Idea input', pre: 'Empty chat, keyboard open', act: 'Type until the text passes the input box\'s maximum height', exp: 'The box grows with the text up to its maximum height; further text scrolls inside the box and covers no other control', prio: 'P3', ref: 'R-273' },
  { after: 'TC-018', sec: 'Idea input', pre: 'Chat with an outline, keyboard open', act: 'Type until the text passes the input box\'s maximum height', exp: 'The box grows with the text up to its maximum height; further text scrolls inside the box and covers no other control', prio: 'P3', ref: 'R-273' },
  { after: 'TC-100', sec: 'Chat behaviour', pre: 'Chat several screens long, at the bottom', act: 'Scroll up to earlier messages, then tap ↓', exp: '↓ shows at the bottom right while scrolled up; tapping it scrolls to the newest message and hides it', prio: 'P3', ref: 'R-274, R-088' },
  { after: 'TC-143', sec: 'Video', pre: 'Scene-video player playing', act: 'Tap the playing video', exp: 'Playback pauses and the play button shows over the frame', prio: 'P2', ref: 'R-275', needs: ['video'], notes: 'Design ds-video note 「點擊 Preview 暫停」. The spec agent retired TR-VIDEO-TAP-PAUSE-001 as not in the spec (0c7f7e2c); the Design states it' },
  { after: 'TC-091', sec: 'Video errors', pre: 'Video with failed scenes', act: 'Tap 「Edit」 in the chat\'s failure message', exp: 'The failure message is red text with 「Edit」; Edit opens Full Edit on the first failed scene', prio: 'P2', ref: 'R-278', needs: ['video'], notes: 'Needs a failed scene video (Pink › Inject failure status; record the switch)' },
  { after: 'TC-060', sec: 'Storyboard', pre: '「Create storyboard」 card shown; credit pill read', act: 'Tap Generate', exp: 'The card disappears and no user bubble is added; the reply appears with a skeleton; the credit pill drops by the price once the credits are charged', prio: 'P2', ref: 'R-279' },
  { after: 'TC-070', sec: 'Storyboard', pre: 'Scene image regenerating in scene detail (after TC-070)', act: 'Tap X, then 「Keep Generating」; tap X again, then 「Leave anyway」', exp: 'Each X shows 「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」 with Leave anyway / Keep Generating; Keep Generating continues; Leave anyway stops it with no refund in Credit Details', prio: 'P2', ref: 'R-280', notes: 'PM 1002 frame marked 新增; the Job states grid had "no Stop" for this job' },
  { after: 'TC-095', sec: 'Video errors', pre: 'Video upload failed with 6xxx more than 3 hours ago (leave the drama after TC-095 and come back later in the run)', act: 'Reopen the drama, read the video card, then open Mine › Credits › Details', exp: '「We couldn\'t finish this video. Your credits have been refunded. Edit the description and try again.」 with 「Edit」; Credit Details shows the refund row', prio: 'P2', ref: 'R-285, R-084', needs: ['video'], notes: 'Needs fault injection (6xxx); the 3-hour wait rides on the rest of the run', why: `${WHY} and ${WHY9}` },
  { after: 'TC-014', sec: 'Idea input', pre: 'Empty chat; the two inspiration chips noted', act: 'Tap 「Surprise me」 five times, clearing the input each time', exp: 'No pick is one of the two chips\' strings', prio: 'P3', ref: 'R-287', notes: 'Pool of 10 (R-014)' },
  { after: 'lastOf:Format card', sec: 'Format card', pre: 'Empty chat', act: 'Type an idea without sending and tap Back; open a new chat, send an idea and tap Back at the format card; open History', exp: 'Each Back returns to the AI Mini Drama landing page with no dialog; History has no entry for either chat', prio: 'P2', ref: 'R-288' },
  { after: 'TC-088', sec: 'Video', pre: 'Finished video, result page open', act: 'Tap the third scene\'s thumbnail', exp: 'The player moves to that scene', prio: 'P3', ref: 'R-290', needs: ['video'] },
  { after: 'TC-334', sec: 'Make your character', pre: 'Character generating', act: 'Tap the dark area outside the sheet, then 「Keep Generating」', exp: '「Stop and lose your credits?」 appears as it does for X; Keep Generating closes it and the character finishes', prio: 'P2', ref: 'R-291' },
  { after: 'TC-042', sec: 'Characters', pre: 'Some characters failed (TC-042); 「Couldn\'t create some images」 shown', act: 'Close the dialog, tap a failed 「!」 character, then try to continue the story', exp: '「{n} characters aren\'t set yet」 lists the failed characters with 「!」; the tap opens Character Library on that character (regenerate or pick a look); the story cannot continue until every character is set', prio: 'P2', ref: 'R-294', notes: 'Needs fault injection (Pink › Trip image moderation; record the switch)' },
  { after: 'TC-072', sec: 'Storyboard', pre: 'The 「Create storyboard」 card from TC-072 shown', act: 'Tap Generate and watch the storyboard', exp: 'Only the changed scene and the Storyboard Preview show skeletons; the other scenes stay as they were', prio: 'P2', ref: 'R-295' },
  { after: 'TC-028', sec: 'Story outline', pre: 'Outline generating for a new idea', act: 'Swipe the app away, reopen it and open History', exp: 'No History entry for that idea', prio: 'P2', ref: 'R-296' },
  { after: 'TC-032', sec: 'Story outline', pre: 'Outline finished; Wi-Fi off and no cellular (Appium confirmed on USB first)', act: 'Send a chat message', exp: 'Toast 「You\'re offline. Check your connection and try again.」 instead of an AI message; nothing is sent (no request in the log) and nothing is charged', prio: 'P2', ref: 'R-297', notes: 'Real network loss (REQ-020); turn Wi-Fi back on right after' },
  { after: 'TC-305', sec: 'Video', pre: 'Video generating with one scene set to fail with 6xxx and auto-retry (Pink › Inject failure status; record the switch); user on another page', act: 'Wait until the retry succeeds and every scene is done', exp: 'One 「Good news!」 toast (and push) comes when the whole video is done, none earlier', prio: 'P3', ref: 'R-298', needs: ['video'], notes: 'If no switch gives an auto-retried 6xxx, record Blocked (observability)' },
  { after: 'TC-066', sec: 'Storyboard', pre: 'Storyboard generating; a scene with a Location', act: 'Open that scene\'s detail while it generates and watch the Location thumbnail', exp: 'The Location thumbnail shows a skeleton, then the location image before the main image finishes; the main image keeps its width', prio: 'P3', ref: 'R-299', notes: 'PM 10/14 board 6; TC-066 notes the Design draws no 「Location」 label' },
  { after: 'TC-066', sec: 'Storyboard', pre: 'A scene whose location and main image both failed (Pink › Trip image moderation; record the switch)', act: 'Open the scene detail', exp: 'The main image shows its error card; the Location thumbnail shows the pink failure icon with 「Location • Failed」; Edit offers regenerating both for 2 images (TC-070)', prio: 'P2', ref: 'R-300, R-299' },
  { after: 'TC-348', sec: 'Characters', pre: 'Iris asked 「Which character would you like to change?」 with chips', act: 'Type the character\'s name and send it instead of tapping a chip', exp: 'Iris takes the typed answer as it would a chip and offers the 「Update characters」 card', prio: 'P3', ref: 'R-301' },
  { after: 'TC-369', sec: 'Credits and limits', pre: 'Tier Pro; RD has changed the Remote Config daily chat allowance for Pro (e.g. to 3); app relaunched', act: 'Send chats until the limit dialog appears, counting each send', exp: 'The limit dialog appears on the 4th send (allowance 3), not the 31st', prio: 'P3', ref: 'R-266', needs: ['remote-config'], why: WHY10 },
  { after: 'TC-369', sec: 'Credits and limits', pre: 'Tier Pro+; RD has changed the Remote Config daily chat allowance for Pro+ (e.g. to 3); app relaunched', act: 'Send chats until the limit dialog appears, counting each send', exp: 'The limit dialog appears on the 4th send (allowance 3), not the 101st', prio: 'P3', ref: 'R-266', needs: ['remote-config'], why: WHY10 },
];
let nextTc = 370;
const needs: Record<string, string[]> = {};
const newIds: string[] = [];
for (const n of NEW) {
  const id = `TC-${nextTc++}`;
  newIds.push(id);
  if (n.needs?.length) needs[id] = n.needs;
  const anchor = n.after.startsWith('lastOf:') ? lastOfSection(n.after.slice(7)) : n.after;
  place({ ID: id, Section: n.sec, Precondition: n.pre, Action: n.act, 'Expected Result': n.exp, Priority: n.prio, 'Spec Ref': n.ref, Notes: n.notes ?? '', Change: 'new', 'Change Reason': n.why ?? WHY }, anchor);
}
const newReqText = NEWREQ.map(([id, t]) => `- ${id} ${t}`).join('\n');

// ---------- grids (passes 9 and 10) ----------
const HIDDEN: [string, string, string, string][] = [
  ['R-018', 'after the first idea is sent (visible)', 'screen', 'TC-020'],
  ['R-028', 'nothing is sent and nothing is charged while offline', 'log (no request); Credit Details (no charge)', 'TC-032, TC-387'],
  ['R-040', '「Upload 1 reference photo」 (a visible control)', 'screen', 'TC-047'],
  ['R-050', 'the price is images (2 credits each) plus TTS', 'Credit Details rows: Text to Image, Text to Speech', 'TC-060'],
  ['R-063', 'regenerating images also regenerates the TTS', 'log: a new TextToSpeech call', 'TC-074'],
  ['R-067', 'a TTS failure and its refund', 'screen; Credit Details refund row', 'TC-078'],
  ['R-084', 'after 3 h the credits are refunded', 'the card 3 hours later; Credit Details refund row', 'TC-095, TC-379'],
  ['R-086', 'STT is not run with 「No captions」', 'log: no speech-to-text call', 'TC-364'],
  ['R-087', 'the retry reruns only the failed segments', 'log: STT calls before and after the retry', 'TC-365'],
  ['R-142', 'the allowance is remote-configured', 'RD changes Firebase Remote Config', 'TC-369, TC-392, TC-393'],
  ['R-145', 'the chat count is kept on the device', 'reinstall', 'TC-224'],
  ['R-163', 'an STT failure (copy)', 'screen', 'TC-299'],
  ['R-164', 'nothing is sent or charged while offline', 'log (no request); Credit Details (no charge)', 'TC-300'],
  ['R-265', 'only the cropped image is sent', 'the reference image a log pull brings back', 'TC-366'],
  ['R-266', 'the allowance comes from Firebase Remote Config', 'RD changes Remote Config', 'TC-369, TC-392, TC-393'],
  ['R-285', 'the 6xxx upload failure is refunded after 3 h', 'the card 3 hours later; Credit Details refund row', 'TC-379'],
  ['R-303', 'the task ID is sent with the report', 'the form shows no task ID (not submitted); the sent report needs RD', 'TC-336'],
];
const VARIANTS: [string, string, string][] = [
  ['R-068', 'Best', 'TC-079'], ['R-068', 'Standard', 'TC-347'], ['R-068', 'Fast', 'TC-347'],
  ['R-102', 'Free', 'TC-117'], ['R-102', 'Pro (same dialog, R-277)', 'TC-216'],
  ['R-103', 'Pro+', 'TC-118'], ['R-103', 'Pro (gets the Free dialog, R-277)', 'TC-216'], ['R-103', 'Free (R-102 dialog)', 'TC-117'],
  ['R-142', 'Free', 'TC-215, TC-218'], ['R-142', 'Pro', 'TC-216, TC-367'], ['R-142', 'Pro+', 'TC-217, TC-368'],
  ['R-149', 'ENU', 'TC-275'], ['R-149', 'CHT', 'TC-276'], ['R-149', 'JPN', 'TC-277'],
  ['R-253', 'Best', 'TC-079'], ['R-253', 'Standard', 'TC-347'], ['R-253', 'Fast', 'TC-347'],
  ['R-266', 'Free', 'TC-369'], ['R-266', 'Pro', 'TC-392'], ['R-266', 'Pro+', 'TC-393'],
  ['R-277', 'Pro', 'TC-216'], ['R-277', 'Pro+ (R-103 dialog instead)', 'TC-118'], ['R-277', 'Free (same dialog)', 'TC-117'], ['R-277', 'Upgrade to Premium (subscription page)', 'TC-216'],
];
req += `

## Added 2026-10-22 (3) — annotation trace and passes 9 and 10 (REQ-032)
The casebook's own analysis must find every rule in the spec files (REQ-032). Every annotation block of the current
boards is traced (\`annotation-trace.json\`, 475 blocks); the blocks no requirement fully stated gave R-267 – R-305.
R-048, R-089, R-103, R-165 and R-173 still held replaced rules and are changed above.
${newReqText}

### Hidden clauses
Coverage pass 9: a clause the screen does not show, how a tester observes it, and the rows that do.

| Requirement | Hidden clause | Observed through | Rows |
|---|---|---|---|
${HIDDEN.map(h => `| ${h.join(' | ')} |`).join('\n')}

### Variants
Coverage pass 10: one line per variant the spec names.

| Requirement | Variant | Rows |
|---|---|---|
${VARIANTS.map(v => `| ${v.join(' | ')} |`).join('\n')}
`;
writeFileSync(join(HERE, 'requirements.md'), req + '\n');
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

// ---------- annotation trace: NEW lines resolved ----------
const TRACE: Record<string, string> = {
  'ds-characters@1416,12499': 'R-105, R-267', 'ds-characters@1890,13995': 'R-111, R-268', 'ds-characters@5220,14006': 'R-118, R-269',
  'ds-characters@1579,15623': 'R-107, R-270', 'ds-characters@4238,16851': 'R-241, R-036, R-271', 'ds-characters@2034,17713': 'R-226, R-272',
  'ds-home-custom-chat@6031,7356': 'R-016, R-273', 'ds-home-custom-chat@8618,7356': 'R-016, R-273', 'ds-main-flow@6648,3797': 'R-088, R-274',
  'ds-video@2888,26088': 'R-128, R-275', 'ds-video@3679,26116': 'R-080, R-082, R-276',
  'mx-a-left@3007,3686': 'R-142, R-102, R-277', 'mx-a-left@912,4879': 'R-142, R-102, R-277', 'mx-a-left@400,4880': 'R-142, R-102, R-277',
  'pm-1002-update@18354,15170': 'R-080, R-278', 'pm-1002-update@18620,15251': 'R-080, R-278', 'pm-1002-update@16633,15229': 'R-279',
  'pm-1002-update@17721,15229': 'R-051, R-280', 'pm-1002-update@19948,16124': 'R-085, R-129, R-281', 'pm-1002-update@15069,16140': 'R-089, R-173, R-250, R-088',
  'pm-1002-update@17733,16152': 'R-053, R-282', 'pm-1002-update@20378,16297': 'R-085, R-129, R-283',
  'pm-error-handling@11989,6981': 'R-057, R-258, R-284', 'pm-error-handling@11187,6983': 'R-057, R-258, R-284', 'pm-error-handling@13429,6983': 'R-057, R-258, R-284',
  'pm-error-handling@11324,7455': 'R-084, R-285', 'pm-error-handling@14671,9769': 'R-056, R-286', 'pm-error-handling@14870,9769': 'R-056, R-286',
  'pm-error-handling@14616,14118': 'R-257, R-258, R-286', 'pm-error-handling@14882,14118': 'R-257, R-258, R-286',
  'pm-main-flow@2021,8488': 'R-012, R-014, R-287', 'pm-main-flow@1576,9395': 'R-024, R-288', 'pm-main-flow@2158,10002': 'R-003, R-004, R-011, R-289, Q-18',
  'pm-main-flow@8223,11560': 'R-077, R-082, R-290', 'pm-main-flow@5540,12737': 'R-245, R-291', 'pm-main-flow@5038,13588': 'R-044, R-045, R-046, R-292',
  'pm-update-11@15369,32683': 'R-248, R-293',
  'pm-update-3@15402,18261': 'R-035, R-294', 'pm-update-3@15877,18261': 'R-035, R-294', 'pm-update-3@14453,18743': 'R-035, R-294', 'pm-update-3@15109,18801': 'R-035, R-294',
  'pm-update-3@18547,18261': 'R-061, R-062, R-295', 'pm-update-3@18075,19329': 'R-061, R-062, R-295', 'pm-update-3@18620,19347': 'R-061, R-062, R-295',
  'pm-update-4@14927,20682': 'R-024, R-025, R-296', 'pm-update-5@14451,21825': 'R-028, R-164, R-297', 'pm-update-5@14927,22062': 'R-165',
  'pm-update-5@14539,22929': 'R-028, R-164, R-165, R-297', 'pm-update-5@20730,22119': 'R-168, R-074, R-298',
  'pm-update-5@19773,21960': 'R-286', 'pm-update-5@20227,21961': 'R-286', 'pm-update-5@20573,22044': 'R-286', 'pm-update-5@20060,22929': 'R-286', 'pm-update-5@19871,22932': 'R-286',
  'pm-update-6@15062,24824': 'R-059, R-300', 'pm-update-6@15540,24824': 'R-059, R-300', 'pm-update-6@16960,24843': 'R-055, R-299', 'pm-update-6@17440,24898': 'R-055, R-156, R-059, R-299',
  'pm-update-7@14453,26361': 'R-254', 'pm-update-7@15402,26361': 'R-254', 'pm-update-7@16354,26440': 'R-254, R-039, R-301',
  'pm-update-8@15888,27688': 'R-253, R-302', 'pm-update-9@15878,28825': 'R-246, R-303', 'pm-update-9@16354,28923': 'R-246, R-247, R-303, R-304, R-305',
  'pm-update-9@16516,29210': 'R-246, R-304', 'pm-update-9@15878,29803': 'R-247, R-305',
};
const tracePath = join(HERE, 'annotation-trace.json');
const trace = JSON.parse(readFileSync(tracePath, 'utf8'));
for (const b of trace.blocks) {
  if (TRACE[b.id]) b.trace = TRACE[b.id];
  else if (b.trace.startsWith('NEW')) throw new Error(`unresolved NEW trace ${b.id}`);
}
writeFileSync(tracePath, JSON.stringify(trace, null, 1) + '\n');

// ---------- phases: P9 round 3 by journey stage ----------
const phases = JSON.parse(readFileSync(join(IOS, 'drafts', '20261022-141521', 'phases.json'), 'utf8'));
phases.draft = DRAFT;
Object.assign(phases.needs, needs);
const home: Record<string, string> = {};
for (const ph of phases.phases) {
  if (ph.merged_into || ph.id === 'P23') continue;
  for (const s of ph.segments) for (const c of s.cases) home[c] ??= ph.id;
}
for (const ph of phases.phases.filter((p: any) => p.id === 'P23')) for (const s of ph.segments) for (const c of s.cases) home[c] ??= 'P23';
// User, 2026-10-22: the next run is a complete full run of every row, with token usage and actual execution time.
// Stage of a row: its P23 segment for regression / flow / text rows, else its section. Templates run last before the
// fresh-install cases (rule 6); their journeys stay Blocked (REQ-019).
const nd = (id: string) => phases.needs[id] ?? [];
const p23seg: Record<string, string> = {};
for (const ph of phases.phases.filter((p: any) => p.id === 'P23')) for (const s of ph.segments) for (const c of s.cases) p23seg[c] = s.id;
const STAGES: [string, string][] = [
  ['a', 'Entry, idea input, format card and story outline'], ['b', 'Characters and the cast picker'], ['c', 'Make your character'],
  ['d', 'Storyboard and Storyboard Preview'], ['e', 'Chat behaviour, History, text and languages'], ['f', 'Credits and limits (tier switching last; restore Follow account)'],
  ['g', 'Video, video errors and captions (after the video gate)'], ['h', 'Offline, interruption and waits (Wi-Fi off and on, USB confirmed)'],
  ['i', 'Templates (cards; journeys Blocked by REQ-019)'], ['j', 'Fresh install and new account (each case reinstalls itself)'],
];
const SECTION_STAGE: Record<string, string> = {
  'Entry and landing': 'a', 'Idea input': 'a', 'Format card': 'a', 'Story outline': 'a', Characters: 'b', 'Make your character': 'c',
  Storyboard: 'd', 'Storyboard Preview': 'd', 'Chat behaviour': 'e', History: 'e', Text: 'e', 'Build checks': 'e', Regression: 'e',
  'Credits and limits': 'f', Video: 'g', 'Video errors': 'g', Captions: 'g', Interruption: 'h', Waits: 'h', Templates: 'i',
};
const P23_STAGE: Record<string, string> = { 'P23-a': 'a', 'P23-b': 'b', 'P23-c': 'c', 'P23-d': 'd', 'P23-e': 'g', 'P23-f': 'e', 'P23-g': 'e' };
const stageOf = (r: Row) => {
  if (/^Fresh install/.test(r.Precondition) || nd(r.ID).includes('new-account')) return 'j';
  if (r.Section === 'Templates') return 'i';
  if (/Wi-Fi/.test(r.Precondition) || ['Interruption', 'Waits'].includes(r.Section)) return 'h';
  if (nd(r.ID).includes('video')) return 'g';
  return (p23seg[r.ID] && P23_STAGE[p23seg[r.ID]]) || SECTION_STAGE[r.Section] || 'e';
};
const byStage: Record<string, string[]> = Object.fromEntries(STAGES.map(s => [s[0], []]));
for (const r of rows) byStage[stageOf(r)].push(r.ID);
// Credits and limits: tier-switching rows last inside the stage, as in P1-g.
byStage.f.sort((a, b) => +/Tier |tier /.test(byId().get(a)!.Precondition) - +/Tier |tier /.test(byId().get(b)!.Precondition));
// A segment holds at most 40 cases; a larger stage is split in order (P9-g1, P9-g2, …).
const segments: { id: string; name: string; cases: string[] }[] = [];
for (const [k, name] of STAGES) {
  const cs = byStage[k]; if (!cs.length) continue;
  const parts = Math.ceil(cs.length / 40), size = Math.ceil(cs.length / parts);
  for (let i = 0; i < parts; i++) segments.push({ id: parts > 1 ? `P9-${k}${i + 1}` : `P9-${k}`, name: parts > 1 ? `${name} (${i + 1}/${parts})` : name, cases: cs.slice(i * size, (i + 1) * size) });
}
for (const p of phases.phases) if (['P5', 'P6', 'P7', 'P8'].includes(p.id)) p.merged_into = 'P9';
const changedSinceRun = rows.filter(r => r.Change === 'modified' && MODS[r.ID] && (MODS[r.ID].P || MODS[r.ID].A || MODS[r.ID].E || MODS[r.ID].addE)).map(r => r.ID);
phases.phases.push({
  id: 'P9', name: 'Round 3: complete full run (2026-10-22)', round: true,
  note: 'Every row of the table, by journey stage, so each drama is walked once (user, 2026-10-22: a complete full run with token usage and actual execution time). Origin = the phase a row came from (P9 = added on 2026-10-22). Preflight before P9-g: one template drama straight to a Seedance 2.0 preview, then run-log gate video pass|fail. TC-379 needs the 6xxx failure of TC-095 to be 3 hours old: start TC-095 early and come back. Templates run after everything but the fresh-install cases (rule 6).',
  origin: Object.fromEntries(rows.map(r => [r.ID, newIds.includes(r.ID) ? 'P9' : home[r.ID] ?? 'P9'])),
  segments,
});
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(phases, null, 1) + '\n');


const ch = (c: string) => rows.filter(r => r.Change === c);
const traceKinds = trace.blocks.reduce((m: Record<string, number>, b: any) => { const k = (b.trace.match(/^(label|ui|older)/)?.[1]) ?? 'R / Q'; m[k] = (m[k] ?? 0) + 1; return m; }, {});
writeFileSync(join(HERE, 'update-plan.md'), `# Update plan — pdr/ai-mini-drama / ios: approved v7 → draft ${DRAFT}

## Spec files
- Unchanged (spec set specs/2026-10-21-2). New analysis steps run on it (REQ-032): the annotation trace (Reading the
  spec, step 9) and coverage passes 9 (hidden clauses) and 10 (variants).

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-267 – R-305 | new | — | Rules the annotation trace found unstated (list in requirements.md, "Added 2026-10-22 (3)") |
| R-048 | replaced | X also saves the character | PM 10/21 §13.23: only Save to library saves (R-248, R-293) |
| R-089, R-173 | changed | chat keeps the position the user left | PM 10/20 §13.2 ①: the chat opens at the bottom (rows already did) |
| R-103 | changed | paid users get 「Today's AI Chats Are Used Up」 | Pro+ only; Pro gets the Free dialog (MX version A, R-277) |
| R-165 | changed | generation resumes by itself after the network returns | PM 10/6: the chat shows Try again |
| Q-18 | new | — | Templates US and JP only on day 1? (PM main flow note) |

## Case changes
- New (${newIds.length}): ${newIds.join(', ')}, each placed right after the row it extends
- Modified (${ch('modified').length}): ${ch('modified').map(r => r.ID).join(', ')}
- Moved next to the rows they belong with: ${moved.join(', ')} (added on 10/22 at their sections' ends)
- Removed: none · Unchanged: ${ch('unchanged').length}

## Found by the analysis
- Annotation trace: ${trace.blocks.length} blocks (${Object.entries(traceKinds).map(([k, v]) => `${k} ${v}`).join(', ')}); 66 blocks stated rules no
  requirement fully covered → R-267 – R-305 → new rows ${newIds.filter(id => !['TC-392', 'TC-393'].includes(id)).join(', ')} and the modified rows above.
- The 6 cases the spec agent found on 10/22 are all found by the new steps: 「只送 crop 後的圖」 by the trace (pm-main-flow@4556,12304 → R-265);
  STT not run (R-086) and the caption retry (R-087) by pass 9; the Remote Config allowance (R-142, R-266) by pass 9; Pro and Pro+ chat use by
  pass 10 (R-142).
- Pass 9 hidden clauses: R-050 (charge breakdown, TC-060), R-063 (TTS log, TC-074), R-084 / R-285 (6xxx after 3 h, TC-379), offline rows now
  name the log and Credit Details (TC-032, TC-300).
- Pass 10 variants: R-266 per tier (TC-392 Pro, TC-393 Pro+; TC-369 is Free).
- Notable: the Design note 「點擊 Preview 暫停」 (TC-375) is the spec basis of TR-VIDEO-TAP-PAUSE-001, which the spec agent retired on 10/22 as
  not in the spec; it should be restored and re-sourced to Design ds-video.

## Not added (value check)
- The old §13.7 6xxx copy 「Something went wrong. Give it another try.」 still in R-081 (Design ds-video frame): kept; the PM error board
  does not contradict the Design frame.
- The signed-out Send Feedback branch (no e-mail, R-303): the test account is signed in; noted on TC-336.

## Spec agent cross-check
Spec agent ${'0c7f7e2c'} (426 iOS cases) against comparisons/20261022d_casebook-vs-spec-agent.mapping.json: 0 gaps. The backstop found nothing
the analysis missed. One case goes the other way: TR-VIDEO-TAP-PAUSE-001 (see above).

## Run setup (phases.json)
- Phase P9 "Round 3: complete full run" (user, 2026-10-22): all ${rows.length} rows by journey stage, ${segments.length} segments of 9 – 30 cases
  (${segments.map(s => `${s.id} ${s.cases.length}`).join(', ')}). P5 – P8 never ran and now run inside P9. P9 is a round phase: the live
  plan page shows only its own results, time and tokens.
- Rows whose check changed since they last ran: ${changedSinceRun.join(', ')}.
- New need: none beyond remote-config (TC-392, TC-393 parked with TC-369).

## Questions for PM
- Q-18 Templates US and JP only on day 1?

## Questions for you
- None.
`);
const count = (c: string) => rows.filter(r => r.Change === c).length;
console.log(JSON.stringify({ rows: rows.length, new: newIds, modified: count('modified'), unchanged: count('unchanged'), moved,
  changedSinceRun, p9: segments.map(s => `${s.id}:${s.cases.length}`), p9total: segments.reduce((n, s) => n + s.cases.length, 0) }));
