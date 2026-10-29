// Update draft for AI Mini Drama Android: approved v2 (471 rows) → draft 20261028-164930, same spec set (2026-10-21-2).
// User, 2026-10-28 ("Update it here"): bring the Android table up to the new upstream analysis rules (ab68e97 … 526191d):
// - REQ-038 / REQ-040: the Figma inventory (extracted/inventory.json) and the control trace (coverage pass 11);
// - REQ-039 (table, both): every tappable element is pressed by some row, inputs are also dismissed;
// - the inventory added 12 flow arrows to arrows.json (Storyboard error frames, 1016_Chat navigation), each needs a
//   requirement and a row or a "Walked by".
// The iOS draft ios/drafts/20261028-121259 is the worked example: its requirements R-306 – R-331 are mirrored here as
// R-326 – R-351 (Android's own R-306 – R-325 are taken), and its row changes are applied to the same Android rows (the
// Android table keeps the iOS IDs up to TC-405; Android-only rows are TC-406 – TC-518). Android has system back as an
// exit, so the new rows that leave a page also use it where the page can be left.
// Extended 2026-10-28 (user decisions, same day):
// - REQ-050 (answers Q-A4): the Design's iPhone frames count for Android (scripts/inventory.ts), so the Android control
//   trace has the same 146 groups as iOS; the 125 new groups are traced here with the Android rows that do the iOS
//   draft's presses (ios/drafts/20261028-121259/control-trace.json; Android IDs equal the iOS ones below TC-394, the iOS
//   draft's new TC-394 – TC-400 are Android TC-519 – TC-525, and iOS-only TC-180 / TC-191 / TC-216 have no Android row).
// - REQ-051: system Back on every page, sheet, dialog, popup, picker, editor and viewer (skill pass 8 「Android system
//   Back」): R-352 – R-356, the `### System back` list, 8 new rows and the system-back step added to the rows already on
//   those screens.
// The user saved this draft as v3 at 17:10 (before the extension); the builder therefore starts from v2 in history/
// (history/v2.csv, history/v2-requirements.md), so a re-save keeps version 3 and the Change column stays v2 → draft.
// Re-runnable: node library/pdr/ai-mini-drama/android/drafts/20261028-164930/build-draft.ts
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const AND = join(HERE, '..', '..');
const FEAT = join(AND, '..');
const DRAFT = '20261028-164930';
const PREV = join(AND, 'drafts', '20261027-171228');          // the draft v2 was saved from
const IOS = join(FEAT, 'ios', 'drafts', '20261028-121259');   // worked example of this update
type Row = Record<string, string>;

const approved: Row[] = readTable(join(AND, 'history', 'v2.csv'));   // v2; cases.csv is v3, saved from this draft
if (approved.length !== 471) throw new Error(`expected v2 with 471 rows, found ${approved.length}`);
let rows: Row[] = approved.map(r => ({ ...r, Change: 'unchanged', 'Change Reason': '' }));
const get = (id: string) => { const r = rows.find(x => x.ID === id); if (!r) throw new Error(`missing ${id}`); return r; };
const modify = (id: string, why: string, f: (r: Row) => void) => {
  const r = get(id); const before = JSON.stringify(r); f(r);
  if (JSON.stringify(r) === before) throw new Error(`${id}: no change`);
  if (r.Change === 'unchanged') r.Change = 'modified';
  r['Change Reason'] = [r['Change Reason'], why].filter(Boolean).join('; ');
};
let next = Math.max(...approved.map(r => +r.ID.slice(3))) + 1;
const NEW: string[] = [];
const add = (after: string, r: Omit<Row, 'ID' | 'Change' | 'Change Reason'>, why: string) => {
  const id = `TC-${next++}`;
  const i = rows.findIndex(x => x.ID === after); if (i < 0) throw new Error(`anchor ${after} missing`);
  let j = i + 1; while (j < rows.length && NEW.includes(rows[j].ID)) j++;
  rows.splice(j, 0, { ID: id, ...r, Change: 'new', 'Change Reason': why } as Row); NEW.push(id); return id;
};
const needs: Record<string, string[]> = {};
const ref = (r: Row, ...ids: string[]) => { r['Spec Ref'] = [r['Spec Ref'], ...ids.filter(x => !r['Spec Ref'].match(new RegExp(`\\b${x}\\b`)))].join(', '); };
const note = (r: Row, n: string) => { r.Notes = [r.Notes, n].filter(Boolean).join('; '); };
const ARROW = (n: string, rid: string) => `New Figma flow arrow ${n} (${rid}, Figma inventory, REQ-039)`;
const SB = 'system back (Android back gesture or button)';

// ---------- 1. the 12 inventory arrows (R-326 – R-337) ----------
// Rows for the four arrows no row walked yet (iOS TC-394 – TC-397); the other eight are walked by existing rows.
const backLeave = add('TC-028', { Section: 'Story outline', Precondition: 'Outline generating for a new idea', Action: 'Tap Back (←), then 「Leave anyway」', 'Expected Result': 'The chat closes and the AI Mini Drama home page opens (「Hi, I\'m your AI Drama Assistant」, 「Create Your Drama」, 「Start from a template」)', Priority: 'P2', 'Spec Ref': 'R-329, R-261', Notes: 'System back to the same page: TC-396' }, ARROW('4877-33087', 'R-329'));
// TC-358 opens My Credits from the pill; the My Credits buttons (R-341) follow it, then the other two Leave anyway exits.
const myCredits = add('TC-358', { Section: 'Credits and limits', Precondition: 'Free tier; My Credits opened from the chat\'s credit pill (after TC-358, or the pill at any later stage)', Action: `Tap 「Buy More」, then go back with ${SB}; tap 「Subscribe Now」, then go back with system back without subscribing; tap 「Claim」; finally leave My Credits with system back`, 'Expected Result': '「Buy More」 opens the credit purchase page; 「Subscribe Now」 opens the subscription page; system back returns to My Credits each time; 「Claim」 adds today\'s complimentary credits to the balance and cannot be used again until 24 hours later; the last system back leaves My Credits', Priority: 'P2', 'Spec Ref': 'R-341', Notes: 'No purchase or subscription (user rule). Android names the paid tier as the app shows it (MX: Pro+ / Android Premium, R-103)' }, 'REQ-039: presses the My Credits buttons');
const histLeave = add('TC-358', { Section: 'Story outline', Precondition: 'Outline generating for a new idea', Action: 'Tap History, then 「Leave anyway」', 'Expected Result': 'The chat closes and Recent Task opens; no entry for this idea is listed', Priority: 'P2', 'Spec Ref': 'R-327, R-261', Notes: '' }, ARROW('4877-33081', 'R-327'));
const newLeave = add('TC-358', { Section: 'Story outline', Precondition: 'Outline generating for a new idea', Action: 'Tap New chat, then 「Leave anyway」', 'Expected Result': 'The chat closes and a new empty chat opens (「Hi, I\'m your AI Drama Assistant」, 「Surprise me」, idea suggestions, empty composer); the abandoned idea is not in History', Priority: 'P2', 'Spec Ref': 'R-328, R-261', Notes: '' }, ARROW('4877-33083', 'R-328'));
const regen = add('TC-071', { Section: 'Storyboard', Precondition: 'A scene whose Location and scene images both failed; 「Regenerate Image」 ◆12 tapped in its scene detail (after TC-070)', Action: 'Stay on the scene detail until the generation ends', 'Expected Result': 'The skeletons are replaced by the new Location and scene images side by side; the 「Couldn\'t create image」 card and 「Edit」 are gone; the title and full script stay', Priority: 'P2', 'Spec Ref': 'R-326, R-059, R-060', Notes: 'Needs a scene with both images failed: a natural failure, else a fault switch once the Android build has one (REQ-047; record the switch)' }, ARROW('4299-168964', 'R-326'));
needs[regen] = ['fault-injection'];

// ---------- 2. controls the table did not press yet (REQ-039; iOS R-318 – R-331 → R-338 – R-351) ----------
const W = (what: string) => `REQ-039: ${what}`;
modify('TC-008', W('also presses ▶ and the volume icon'), r => {
  r.Action = 'Tap the video; tap ▶; then tap the volume icon twice';
  r['Expected Result'] = 'The first tap pauses the video (pause & volume off state); ▶ resumes playback; each tap on the volume icon switches the sound off and back on, and the icon follows (volume off / volume on)';
  ref(r, 'R-339');
});
modify('TC-019', W('also presses More ideas +'), r => {
  r.Action = 'Look above the input, then tap 「More ideas +」';
  r['Expected Result'] = '「More ideas +」 chip is shown; tapping it offers more story ideas for the input (record what appears, Q-19)';
  ref(r, 'R-338');
});
modify('TC-118', W('also presses Continue Tomorrow'), r => {
  r.Action = 'Send a message, then tap 「Continue Tomorrow」';
  r['Expected Result'] += '; 「Continue Tomorrow」 closes the dialog and returns to the chat, and the message is not sent';
  ref(r, 'R-340');
});
modify('TC-138', W('also presses the scene thumbnail'), r => {
  r.Action = 'Tap a scene card\'s thumbnail; close the scene; then tap the card\'s text (not View more)';
  r['Expected Result'] = 'Each tap opens the scene detail on that scene';
});
modify('TC-036', W('also presses a chip\'s × and the applied-state filter icon'), r => {
  r.Action += '; tap × on the Gender chip; then tap the filter icon';
  r['Expected Result'] += ' and the filter icon shows a check mark; × removes that filter and its chip and the list widens; the filter icon reopens the Filter panel with the remaining choice still selected';
  ref(r, 'R-344');
});
modify('TC-041', W('also presses Confirm'), r => {
  r.Action = 'Tap 「Generate all」, wait, then tap 「Confirm」';
  r['Expected Result'] += '; 「Confirm」 closes the sheet and returns to the chat with the completed cast';
  ref(r, 'R-222');
});
modify('TC-066', W('also taps the main scene image'), r => {
  r.Action = 'Tap the Location thumbnail, then the main scene image';
  r['Expected Result'] = r['Expected Result'].replace(/^Nothing happens/, 'Nothing happens for either tap');
  ref(r, 'R-349');
});
modify('TC-067', W('also presses the terms-of-service link'), r => {
  r.Action = 'Open the scene and tap ⓘ; in the dialog tap 「terms of service」, come back with system back and tap 「Got it」';
  r['Expected Result'] += '; 「terms of service」 in the dialog opens the terms of service, system back returns to the dialog and 「Got it」 closes it';
});
modify('TC-075', W('also presses pause and the scrubber'), r => {
  r.Action = 'Look at the Storyboard Preview card, then play it; tap ⏸, tap ▶ again, then drag the scrubber to about the middle; then leave the player with system back';
  r['Expected Result'] += '; the player shows X, ⏸, a scrubber and the time (e.g. 「00:40/01:30」); ⏸ pauses and ▶ resumes the slideshow; dragging the scrubber jumps to that point and the time follows; system back closes the player like X';
  ref(r, 'R-348');
});
modify('TC-106', W('also presses New Chat'), r => {
  r.Action = 'Read a card, then tap 「New Chat」';
  r['Expected Result'] += '; 「New Chat」 at the bottom right opens a new empty chat';
  ref(r, 'R-350');
});
modify('TC-119', W('also ticks My characters only'), r => {
  r.Action = 'Tick 「My characters only」, then tap 「Clear」';
  r['Expected Result'] = 'The tick shows on 「My characters only」; Clear returns every filter to its default: no Gender or Ethnicity selected, Age 1–100, My characters only off';
  ref(r, 'R-031');
});
modify('TC-127', W('also confirms with ✓ and edits the filled Age (the input\'s dismiss)'), r => {
  r.Action = 'Tap the Age field, type 24 and tap ✓; then tap the filled Age field, change it to 30 and tap ✓';
  r['Expected Result'] = 'A numeric keypad opens for Age (1–100) with an input bar (placeholder 「1-100」) and ✓; ✓ closes the keypad and Age shows 24; the filled field reopens the keypad with 24 and ✓ saves 30';
  ref(r, 'R-343');
  note(r, 'Android: if the app shows the system number keyboard instead of the Design\'s keypad bar, confirm with its Done key and record what it shows');
});
modify('TC-135', W('also presses ⋯, Download, Report and ⓧ'), r => {
  r.Action = 'Tap the enlarge icon on a character; open ⋯ and tap 「Download」; open ⋯ again, tap 「Report」 and leave the report flow with system back without sending; then tap ⓧ';
  r['Expected Result'] = 'An enlarged preview of that character opens; ⋯ lists 「Download」 and 「Report」 (plus 「Delete」 for your own character); Download saves the character image to the phone\'s Gallery (record any toast); Report opens the report flow and system back returns to the preview; ⓧ closes the preview back to the library';
  ref(r, 'R-345');
});
modify('TC-225', W('also presses a credit pack and the two links'), r => {
  r.Action = 'Look at the charge card, then tap Buy Credit; on 「Top up your credits」 tap the 500 pack, then 「Terms of Use」 and system back, then 「Privacy Policy」 and system back (do not buy)';
  r['Expected Result'] += '; tapping a pack selects it instead (one pack selected at a time); 「Terms of Use」 and 「Privacy Policy」 open those pages and system back returns to the panel';
  ref(r, 'R-342');
});
modify('TC-310', W('opens the picker through the ⟳ switch icon'), r => {
  r.Action = 'Tap the ⟳ switch icon on a character in the outline card and change that look';
  r['Expected Result'] = 'The ⟳ icon opens 「Choose Character」 on that character; no 「Tap to choose a look for…」 hint appears';
  ref(r, 'R-346');
});
const mic = add('TC-011', { Section: 'Idea input', Precondition: 'Empty chat (after TC-011)', Action: 'Tap the mic button without speaking; then tap it again (or its cancel control) to stop', 'Expected Result': 'Voice input starts: a listening state shows (on first use Android first asks for microphone access; allow it); stopping it leaves the input empty and the composer ready for typing', Priority: 'P3', 'Spec Ref': 'R-011, R-351', Notes: 'Presses the mic without needing speech; the dictation itself needs spoken input (voice)' }, W('presses the mic without needing speech'));
const media = add('TC-128', { Section: 'Make your character', Precondition: 'Select Media open from Reference (after TC-128)', Action: `Tap 「Photo」; tap 「Recents ▾」 and close the album list with ${SB}; tap a stock-source tab (e.g. getty images | iStock) and go back to 「Recents」; tap the enlarge icon on a photo and close the preview with system back; tap the sliders icon beside 「Photo」 and close it with system back; tap the camera icon and leave the camera with system back`, 'Expected Result': '「Photo」 stays the selected media type; 「Recents ▾」 opens the album list; the stock tab shows that source\'s photos; the enlarge icon opens a full-size preview of that photo; the sliders icon opens the picker\'s options (record what it shows); the camera icon opens the camera; each system back closes only the layer on top (album list, preview, options, camera) back to Select Media', Priority: 'P3', 'Spec Ref': 'R-347, R-353', Notes: 'The Design draws the iOS picker; on Android press the same controls of PowerDirector\'s media picker and record any that it lacks. TC-129 then picks the photo from the same screen' }, W('presses the Select Media controls'));

// ---------- 3. system Back on every screen the feature opens (REQ-051, R-352 – R-356) ----------
// Rows already on a screen get the system-back step (REQ-033); screens no row reaches get a new row after the row that
// reaches them. Expected: what the screen's own ← / X / Cancel / collapse does; on a dialog, its non-destructive answer
// (Q-A5); with the keyboard or keypad open, only that closes first; where the spec gives no rule, the row records (Q-A6).
const B = (what: string) => `REQ-051: system back ${what}`;
const step = (r: Row, a: string, e: string, ...refs: string[]) => { r.Action += `; ${a}`; r['Expected Result'] += `; ${e}`; ref(r, ...refs); };
const swapIn = (r: Row, col: string, from: string, to: string) => { if (!r[col].includes(from)) throw new Error(`${r.ID} ${col}: missing "${from}"`); r[col] = r[col].replace(from, to); };
// pages and viewers (R-352)
modify('TC-001', B('on the landing page'), r => step(r, `then use ${SB}`, 'system back returns to the Launcher (Home), like the landing page\'s ←', 'R-352'));
modify('TC-006', B('on the All-categories page'), r => step(r, 'then use system back', 'system back returns to the AI Mini Drama landing page, like the page\'s header back', 'R-352'));
modify('TC-007', B('on Template detail'), r => step(r, 'then leave the detail page with system back', 'system back returns to the landing page like the header back, and the template video stops (no sound keeps playing)', 'R-352'));
modify('TC-065', B('on the scene detail'), r => step(r, 'then leave the scene detail with system back', 'system back closes the scene detail back to the chat, like X', 'R-352'));
modify('TC-506', B('on the video result page'), r => {
  r.Action = 'Open the result page and compare the player with the clip strip; go back with system back and open it again';
  r['Expected Result'] = 'System back closes the result page back to the chat, like its ‹; the player and the selected clip in the strip are the same clip each time';
  ref(r, 'R-352');
});
modify('TC-150', B('on the Fix scenes view'), r => step(r, 'then use system back', 'system back closes it back to the page it was opened from (record which), like its back control', 'R-352'));
modify('TC-088', B('in Full Edit'), r => {
  r.Action = 'Open the result and tap Full Edit, then go back with system back and tap Export Full Video';
  r['Expected Result'] = 'Full Edit shows one clip per scene; system back leaves Full Edit like its ← (record whether the result page or the chat opens; the chat opens at the bottom, R-173); Export Full Video produces one flattened video';
  ref(r, 'R-352');
});
modify('TC-327', B('on the History ⓘ bubble and on History'), r => {
  r.Action = 'Tap the ⓘ button; use system back; then use system back again';
  r['Expected Result'] += '; the first system back closes only the bubble (record what it does, Q-A6) and the second leaves History like its ‹, back to the page History was opened from';
  ref(r, 'R-352', 'R-356');
});
modify('TC-336', B('on the feedback form'), r => step(r, 'then leave the form with system back without sending', 'system back leaves the form without sending it (record which page it returns to)', 'R-352'));
modify('TC-215', B('on the subscription page (also presses Upgrade to Premium, REQ-050)'), r => step(r, 'then tap 「Upgrade to Premium」 and leave the subscription page with system back without subscribing', '「Upgrade to Premium」 opens the subscription page and system back returns to the chat without subscribing (record whether the limit dialog shows again)', 'R-352'));
modify('TC-226', B('on the subscription page'), r => step(r, 'leave the subscription page with system back without subscribing', 'system back returns to the chat without subscribing and the card stays', 'R-352'));
// sheets, pickers and editors (R-353), keyboards (R-354)
modify('TC-018', B('closes the keyboard'), r => {
  r.Action = `Dismiss the keyboard with ${SB}`;
  r['Expected Result'] = 'System back closes only the keyboard and the chat stays open; the input keeps its text and collapses to at most 3 lines';
  ref(r, 'R-354');
});
modify('TC-287', B('closes the keyboard'), r => {
  r.Action = r.Action.replace('Cancel, Return', `Cancel, Return, ${SB}`);
  r['Expected Result'] += '; system back closes only the keyboard and Make your character stays open with the text';
  ref(r, 'R-354');
});
modify('TC-039', B('on the Finish your characters sheet and its ⓘ tip'), r => step(r, 'tap ⓘ beside the title and use system back; then use system back again', 'system back with the ⓘ tip shown closes only the tip (record what it does, Q-A6); the next system back closes the sheet back to Choose Character like its X, the slots unchanged', 'R-353', 'R-356'));
modify('TC-056', B('on the empty Make your character'), r => {
  r.Action = 'Tap X; open Make your character again, leave it empty and use system back';
  r['Expected Result'] = 'Each closes directly without a dialog';
  ref(r, 'R-353');
});
modify('TC-127', B('closes the Age keypad'), r => step(r, 'tap the Age field again, type 31 and use system back', 'system back closes only the keypad and the form stays open; record whether Age shows 30 or 31 (Q-A6)', 'R-354', 'R-356'));
modify('TC-128', B('on Select Media'), r => {
  r.Action = 'Tap 「Reference (optional)」; use system back; tap 「Reference (optional)」 again';
  r['Expected Result'] = 'Select Media opens to pick a reference photo; system back closes it back to Create my character with no reference added, like Select Media\'s ‹; the second tap opens it again';
  ref(r, 'R-353');
});
modify('TC-412', B('on the media-permission notice (the row\'s 「Back」 is system back)'), r => {
  r.Action = r.Action.replace('then Back and the top-left arrow', `then ${SB} and the top-left arrow`);
  ref(r, 'R-353');
});
modify('TC-135', B('on the ⋯ menu and the enlarged preview'), r => {
  r.Action = 'Tap the enlarge icon on a character; open ⋯ and close the menu with system back; open ⋯ and tap 「Download」; open ⋯ again, tap 「Report」 and leave the report flow with system back without sending; then tap ⓧ; open the preview again and close it with system back';
  r['Expected Result'] += '; system back on the ⋯ menu closes only the menu, and on the preview closes it back to the library like ⓧ';
  ref(r, 'R-353', 'R-355');
});
modify('TC-225', B('on the credit panel'), r => {
  swapIn(r, 'Action', '(do not buy)', '(do not buy); finally close the panel with system back');
  r['Expected Result'] += '; the last system back closes 「Top up your credits」 like its X, nothing is bought and the card stays';
  ref(r, 'R-353');
});
// dialogs, menus and popups (R-355; the non-destructive answer, Q-A5)
modify('TC-395', B('on 「Leave this chat?」'), r => {
  r.Action = `${SB}; with the dialog shown use system back again; then open it once more with system back and tap 「Stay」`;
  r['Expected Result'] += '; system back on the dialog closes it like 「Stay」 (the chat stays and the outline keeps generating), never like 「Leave anyway」';
  ref(r, 'R-355');
});
modify('TC-398', B('on 「Leave while we\'re preparing?」'), r => {
  r.Action = `${SB}; with the dialog shown use system back again; then open it once more with system back and tap 「Stay」`;
  r['Expected Result'] += '; system back on the dialog closes it like 「Stay」 and preparing goes on';
  ref(r, 'R-355');
});
modify('TC-516', B('on the video 「Leave while we\'re preparing?」'), r => {
  swapIn(r, 'Action', `Use ${SB}, then 「Stay」`, `Use ${SB}, then system back again on the dialog`);
  swapIn(r, 'Expected Result', '; Stay keeps preparing', '; system back on the dialog closes it like Stay and Stay keeps preparing');
  ref(r, 'R-355');
});
modify('TC-431', B('on 「Stop and lose your credits?」'), r => step(r, 'use system back again, then system back on the dialog', 'system back on the dialog closes it like 「Keep Generating」 and the character keeps generating', 'R-355'));
modify('TC-403', B('on Finish your characters while generating, and on its dialog'), r => {
  swapIn(r, 'Action', 'then 「Keep Generating」; tap X,', `then 「Keep Generating」; use ${SB}, then system back again on the dialog; tap X,`);
  swapIn(r, 'Expected Result', 'Cancel and X stay enabled', 'Cancel, X and system back stay enabled');
  swapIn(r, 'Expected Result', 'Keep Generating keeps both generating', 'system back on the dialog closes it like Keep Generating; Keep Generating keeps both generating');
  ref(r, 'R-353', 'R-355');
});
modify('TC-378', B('in the scene detail while an image regenerates, and on its dialog'), r => {
  swapIn(r, 'Action', 'then 「Keep Generating」; tap X again', `then 「Keep Generating」; use ${SB}, then system back again on the dialog; tap X again`);
  swapIn(r, 'Expected Result', 'Each X shows', 'Each X and system back shows');
  r['Expected Result'] += '; system back on the dialog closes it like Keep Generating';
  ref(r, 'R-353', 'R-355');
});
modify('TC-402', B('on 「Discard this character?」 (input entered)'), r => {
  swapIn(r, 'Action', 'use system back, then tap 「Discard」', 'use system back, then system back again on the dialog; use system back once more, then tap 「Discard」');
  swapIn(r, 'Expected Result', 'system back shows the same dialog as X;', 'system back shows the same dialog as X, and system back on the dialog closes it like Keep editing with every input kept;');
  ref(r, 'R-355');
});
modify('TC-401', B('on 「Discard this character?」 (generated)'), r => step(r, 'with the dialog shown use system back again', 'system back on the dialog closes it like 「Keep」 and the result stays', 'R-355'));
modify('TC-335', B('on the timeout dialog'), r => {
  r.Action = 'Wait for the dialog, use system back and record what it does; if the dialog is still shown, tap 「Close」';
  swapIn(r, 'Expected Result', '; Close returns', '; system back closes it like Close (Q-A5); Close returns');
  ref(r, 'R-355');
});
modify('TC-058', B('on 「Delete this character?」'), r => step(r, 'use system back on the dialog', 'system back closes the dialog like Cancel and the character stays in the library', 'R-355'));
modify('TC-059', B('on the library character menu'), r => step(r, 'then close it with system back', 'system back closes only the menu and the library stays', 'R-355'));
modify('TC-384', B('on 「Couldn\'t create some images」'), r => {
  swapIn(r, 'Action', 'Close the dialog,', `Close the dialog with ${SB},`);
  r['Expected Result'] = `System back closes 「Couldn't create some images」 like its button; ${r['Expected Result']}`;
  ref(r, 'R-355');
});
modify('TC-220', B('on the daily limit dialog'), r => {
  r.Action = 'Send again, then close the dialog with system back';
  r['Expected Result'] = 'The limit dialog appears again on every send; system back closes it like X: the chat stays open and the unsent text stays in the input';
  ref(r, 'R-355');
});
modify('TC-118', B('on the paid-tier limit dialog'), r => step(r, 'send again and close the dialog with system back', 'system back closes it like 「Continue Tomorrow」', 'R-355'));
modify('TC-067', B('on the ⓘ dialog'), r => step(r, 'tap ⓘ again and close the dialog with system back', 'system back closes the ⓘ dialog like 「Got it」', 'R-355'));
modify('TC-362', B('on the clip ⓘ dialog'), r => step(r, 'close the dialog with system back', 'system back closes the dialog like 「Got it」', 'R-355'));
modify('TC-112', B('on 「Delete {n} dramas?」 and in Manage mode'), r => step(r, 'use system back on the dialog, then system back again in Manage mode', 'system back closes 「Delete 3 dramas?」 like Cancel (nothing is deleted), then leaves Manage mode like Cancel', 'R-355'));
modify('TC-304', B('on the notification pre-prompt'), r => {
  r.Action = 'Tap Generate Video; on the pre-prompt use system back and record what it does; if the pre-prompt is still shown tap 「Not now」; then start another video';
  r['Expected Result'] = 'System back closes the pre-prompt without opening the notification permission dialog (record whether it counts as 「Not now」, Q-A6); the pre-prompt does not appear for the second video';
  ref(r, 'R-355', 'R-356');
});
// screens no row reached with system back: new rows right after the row that reaches them (REQ-033)
const sbPicker = add('TC-038', { Section: 'Characters', Precondition: 'Choose Character open with a new unsaved pick', Action: `Use ${SB}; with 「Leave without finishing?」 shown use system back again; open the filter, select Female and use system back; then use system back once more and tap 「Leave」; reopen Choose Character, change nothing and use system back`, 'Expected Result': 'System back shows the same 「Leave without finishing?」 dialog as X; system back on the dialog closes it like 「Keep choosing」 and the pick stays; system back on the Filter panel closes it like its X and Female is not applied; 「Leave」 closes Choose Character without saving the pick; with nothing changed, system back closes Choose Character straight back to the chat, like X', Priority: 'P2', 'Spec Ref': 'R-032, R-031, R-353, R-355', Notes: '' }, B('on Choose Character, its leave dialog and the Filter panel'));
const sbReady = add('TC-121', { Section: 'Characters', Precondition: 'Finish your characters showing newly generated looks (「Your characters are ready」), on a second Generate all after TC-121', Action: `Use ${SB}`, 'Expected Result': 'Same as X (TC-121): the sheet closes back to Choose Character and the generated looks are not applied to the slots', Priority: 'P3', 'Spec Ref': 'R-106, R-305, R-353', Notes: 'Costs a second Generate all (◆6 per look)' }, B('on Finish your characters when the looks are ready'));
const sbEditor = add('TC-124', { Section: 'Make your character', Precondition: 'Expanded description editor open with edited text, keyboard up', Action: `Use ${SB}; then use system back again`, 'Expected Result': 'The first system back closes only the keyboard and the editor stays open; the second closes the editor back to Create my character like the collapse icon (TC-123) and keeps the edited text', Priority: 'P3', 'Spec Ref': 'R-108, R-353, R-354', Notes: '' }, B('in the full-screen description editor'));
const sbCrop = add('TC-131', { Section: 'Make your character', Precondition: 'Create my character with the reference from TC-131; Reference tapped again and another photo picked, so Crop is open', Action: `Use ${SB}`, 'Expected Result': 'Crop closes like its X: the new photo is not applied and Create my character keeps the earlier reference (record whether Select Media or Create my character shows)', Priority: 'P3', 'Spec Ref': 'R-114, R-176, R-353', Notes: '' }, B('on Crop'));
const sbScene = add('TC-140', { Section: 'Storyboard', Precondition: 'Failed scene description editor open with edited text, keyboard up (Edit on a failed scene)', Action: `Use ${SB}; then use system back again`, 'Expected Result': 'The first system back closes only the keyboard and the editor stays open; the second closes the editor like the collapse icon (TC-140): back to the regeneration offer with the edited text', Priority: 'P3', 'Spec Ref': 'R-125, R-353, R-354', Notes: 'Needs a failed scene image, as TC-140' }, B('in the scene description editor'));
const sbClip = add('TC-148', { Section: 'Video errors', Precondition: 'Failed scene-video editor open with edited text, keyboard up (Edit on a failed clip)', Action: `Use ${SB}; then use system back again`, 'Expected Result': 'The first system back closes only the keyboard and the editor stays open; the second closes the editor like the collapse icon (TC-147): back to the regeneration offer with the edited text', Priority: 'P3', 'Spec Ref': 'R-132, R-353, R-354', Notes: 'Needs a failed scene clip, as TC-148' }, B('in the scene-video description editor'));
const sbHistory = add('TC-111', { Section: 'History', Precondition: 'History with a drama', Action: `Tap ⋮ and close the menu with ${SB}; tap ⋮ › Delete and use system back on 「Delete this drama?」; tap ⋮ › Rename, change the name and use system back twice`, 'Expected Result': 'System back closes the ⋮ menu alone; on 「Delete this drama?」 it acts like Cancel and the drama stays; in Rename the first system back closes only the keyboard and the second closes the dialog like Cancel, keeping the old name', Priority: 'P2', 'Spec Ref': 'R-093, R-095, R-096, R-354, R-355', Notes: '' }, B('on the History ⋮ menu, the delete dialog and Rename'));
const sbExport = add('TC-343', { Section: 'Video', Precondition: 'Full video finished', Action: 'Tap 「Export Full Video」; if an export sheet or settings page opens, leave it with system back (Android back gesture or button); tap 「Export Full Video」 again and let the export finish; if a done page opens, leave it with system back', 'Expected Result': 'System back closes an export sheet without exporting and the result page is unchanged; a done page closes back to the result page and the video is in the Gallery once. The spec draws neither page (PM 10/22: the export runs on the result page with a spinner, R-324): record what the build shows (Q-A6)', Priority: 'P3', 'Spec Ref': 'R-324, R-352, R-356', Notes: 'Android ticket DRA262610P0219 (TC-343): the build opens an export sheet' }, B('on the export sheet and done page the Android build shows'));
// a new row needs what the row it extends needs (phases.json `needs`, filled below)
const inherit: Record<string, string> = { [sbPicker]: 'TC-038', [sbReady]: 'TC-121', [sbEditor]: 'TC-124', [sbCrop]: 'TC-131', [sbScene]: 'TC-140', [sbClip]: 'TC-148', [sbHistory]: 'TC-111', [sbExport]: 'TC-343' };

// ---------- write draft.csv ----------
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

// ---------- requirements ----------
let req = readFileSync(join(AND, 'history', 'v2-requirements.md'), 'utf8').trimEnd();
const swap = (re: RegExp, s: string) => { if (!re.test(req)) throw new Error(`missing ${re}`); req = req.replace(re, s); };
// iOS R-306 – R-331 → Android R-326 – R-351 (references inside those lines too), with the Android differences below.
const iosReq = readFileSync(join(IOS, 'requirements.md'), 'utf8').split('\n');
const shift = (s: string) => s.replace(/\bR-(3(?:0[6-9]|[12]\d|3[01]))\b/g, (_, n) => `R-${+n + 20}`);
const line = (iosId: string) => { const l = iosReq.find(x => x.startsWith(`- ${iosId} `)); if (!l) throw new Error(`iOS ${iosId} missing`); return shift(l); };
const A: Record<string, (l: string) => string> = {
  'R-312': l => l.replace(/ Walked by:/, ' Android\'s system back opens the same dialog (R-306; TC-395). Walked by:'),
  'R-316': l => l.replace(/ Walked by:/, ' The same 「Leave anyway」 opened by system back lands on the AI Mini Drama home page (R-306, TC-396). Walked by:'),
  'R-321': l => l.replace(/opens the Pro\+ subscription page\./, 'opens the subscription page (Android names the paid tier as MX version A does, R-103). Pages opened from My Credits are left with ← or Android system back.'),
  'R-323': l => l + ' Android: when the app shows the system number keyboard instead of the Design\'s keypad bar, its Done key confirms (recorded on TC-127).',
  'R-325': l => l.replace('saves the character image to the device', 'saves the character image to the phone\'s Gallery') + ' Android system back leaves the report flow back to the preview.',
  'R-326': l => l.replace('opens Change Characters on that character (R-038', 'opens the character picker (Design title 「Choose Character」 / 「Choose for {name}」) on that character (R-038'),
  'R-327': l => l + ' On Android the same controls of PowerDirector\'s media picker are pressed; system back closes a preview opened from it.',
  'R-328': l => l + ' On Android, system back closes the player like X.',
  'R-331': l => l.replace(/, a dictation into the input \(DRI261895P0002\)/, ', a dictation into the input').replace(/\.$/, '; on first use Android asks for microphone access.'),
};
const ids = Array.from({ length: 26 }, (_, i) => `R-${306 + i}`);
const out = (i: string) => (A[i] ?? (x => x))(line(i));
const arrowsNew = ['R-306', 'R-307', 'R-308', 'R-309'].map(out);
const arrowsWalked = ['R-310', 'R-311', 'R-312', 'R-313', 'R-314', 'R-315', 'R-316', 'R-317'].map(out);
const controls = ids.slice(12).map(out);
for (const [k, f] of Object.entries(A)) if (f(line(k)) === line(k)) throw new Error(`Android edit of ${k} did not apply`);

// Q-19 (shared with iOS) after Q-18.
swap(/(\n- Q-18 [^\n]*)/, `$1\n- Q-19 「More ideas +」 above the composer: no Design frame, arrow or PM note says what a tap shows (more inspiration chips, a filled input, a new suggestion message?). TC-019 records what appears (R-338, REQ-039).`);
// Exit × stage: the three outline-stage exits now each have a Leave anyway row.
swap(/\| Outline generating \| TC-025, TC-027, TC-028 \| TC-395, TC-396 \| TC-026, TC-027 \| TC-357 \| TC-357, TC-358 \|/,
  `| Outline generating | TC-025, TC-027, TC-028, ${backLeave} | TC-395, TC-396 | TC-026, TC-027, ${histLeave} | TC-357, ${newLeave} | TC-357, TC-358 |`);
// The Launcher's other tools are out of scope as on iOS (REQ-050 brings their groups into the Android trace as n/a).
const NOT_IN_SCOPE = iosReq.find(l => l.startsWith('Not in scope (control trace n/a)')) ?? (() => { throw new Error('iOS Not in scope note missing'); })();
// System Back (REQ-051): the rules and one line per screen [screen, own way out, what system back must do, rows or n/a].
const SYSBACK_REQ = [
  '- R-352 [Req: REQ-051; DS:figma 1016_Chat navigation 4858:34930; PM:figma 10/22 export 4418:2] On Android, system Back on an AI Mini Drama page or full-screen viewer does what the page\'s own back control (← / ‹ / X) does: the landing page returns to the Launcher; the All-categories page and Template detail return to the page they were opened from (the template video stops); the scene detail, the Storyboard Preview player, the video result page, the Fix scenes view and Full Edit close back to the chat or result page; History, My Credits and the pages opened from them go back one page; the feedback, purchase and subscription pages close without sending, buying or subscribing. The chat itself follows R-306 – R-308, R-318 and R-321 (Exit × stage).',
  '- R-353 [Req: REQ-051; PM:pm-update-11 §13.23 (Android back on the character result)] On Android, system Back on a sheet, picker or editor does what its X / Cancel / ‹ / collapse does: where X asks first (Choose Character with an unsaved pick, Make your character with input or generating, Finish your characters generating, the generated character, a scene image regenerating) it opens the same dialog; otherwise it closes the sheet (Choose Character, the Filter panel, Finish your characters, the empty Make your character, Select Media, Crop, the enlarged character preview, the credit panel) without applying anything, and a full-screen description editor closes like its collapse icon, keeping the text. A layer opened inside a sheet (album list, photo preview, picker options, camera, report flow, menu) closes alone.',
  '- R-354 [Req: REQ-051] On Android, while the keyboard or the Age keypad is open, the first system Back closes only the keyboard or keypad: the text stays and the screen stays open (chat composer, character description, full-screen editors, scene and scene-video descriptions, Rename).',
  '- R-355 [Req: REQ-051] On Android, system Back on a dialog, menu or popup closes it like its non-destructive answer, never the destructive one: 「Leave this chat?」 and 「Leave while we\'re preparing?」 → Stay; 「Stop and lose your credits?」 → Keep Generating; 「Leave without finishing?」 → Keep choosing; 「Discard this character?」 → Keep editing / Keep; delete dialogs → Cancel; failure and ⓘ dialogs → Got it; the timeout dialog → Close; the chat limit dialogs → X / Continue Tomorrow; Manage mode → Cancel; the ⋮ / ⋯ menus close without choosing. The spec states no Back rule for dialogs (Q-A5).',
  '- R-356 [Req: REQ-051] Where the spec draws no close control and no Back rule (the History ⓘ bubble, the Finish your characters ⓘ tip, a typed but unconfirmed Age, the notification pre-prompt, the export sheet and done page the Android build shows), the row records what system Back does; it must not lose saved work or start a charge, a purchase or a permission request (Q-A6).',
];
const SYSBACK: string[][] = [
  ['Launcher (PowerDirector Home)', '—', '—', 'n/a (PowerDirector\'s Launcher, only the entry to the feature (R-001); not an AI Mini Drama screen)'],
  ['AI Mini Drama landing page', 'header ← (R-003)', 'like ←: back to the Launcher', 'TC-001'],
  ['All-categories page (More)', 'header back', 'like back: the landing page', 'TC-006'],
  ['Template detail', 'header back', 'like back; the template video stops', 'TC-007'],
  ['Chat, every stage (empty, format card, outline generating / failed / saved, storyboard and video stages ① / ②)', '←, History, New chat, credit pill (Design 1016)', 'as ← in that stage (R-306 – R-308, R-318, R-321); Exit × stage, System back column', 'TC-394, TC-395, TC-396, TC-452, TC-511, TC-397, TC-398, TC-399, TC-516, TC-400'],
  ['Chat composer, keyboard open', 'tap outside', 'closes only the keyboard; the text and the chat stay (R-354)', 'TC-018'],
  ['「Leave this chat?」', 'Stay / Leave anyway', 'like Stay', 'TC-395'],
  ['「Leave while we\'re preparing?」 (storyboard and video bodies)', 'Stay / Leave anyway', 'like Stay', 'TC-398, TC-516'],
  ['「Stop and lose your credits?」 (Make your character, Finish your characters, scene image regenerating)', 'Keep Generating / Leave anyway', 'like Keep Generating', 'TC-431, TC-403, TC-378'],
  ['Choose Character (cast picker, Character Library), an unsaved pick', 'X → 「Leave without finishing?」 (TC-037)', 'the same dialog', sbPicker],
  ['Choose Character, nothing changed', 'X', 'like X: back to the chat', sbPicker],
  ['「Leave without finishing?」', 'Keep choosing / Leave', 'like Keep choosing', sbPicker],
  ['Filter panel', 'X / ✓', 'like X: choices not applied with ✓ are dropped', sbPicker],
  ['Character slot hint 「Tap to choose a look for {name}」', 'tap a slot, or 5 s (R-030)', '—', 'n/a (a coach mark shown once per user, on first use (R-252); TC-034 / TC-035 spend that one showing; system Back acts on Choose Character beneath)'],
  ['Finish your characters (「{n} characters aren\'t set yet」)', 'X', 'like X: back to Choose Character', 'TC-039'],
  ['Finish your characters ⓘ tip', 'none drawn', 'record (R-356, Q-A6); expected to close only the tip', 'TC-039'],
  ['Finish your characters, generating', 'X / Cancel → 「Stop and lose your credits?」', 'the same dialog', 'TC-403'],
  ['Finish your characters, done (「Your characters are ready」)', 'X (R-106) / Confirm', 'like X: the looks are not applied', sbReady],
  ['Timeout dialog 「We couldn\'t create your character」', 'Close / Send Feedback', 'like Close', 'TC-335'],
  ['Timeout dialog 「We couldn\'t create your characters」', 'Close / Send Feedback', 'like Close', 'n/a (the same timeout dialog as TC-335 in its plural copy; both show only after a 5-minute generation, which no Android switch forces)'],
  ['Send Feedback form (timeout dialogs)', 'its back', 'leave without sending', 'TC-336'],
  ['Make your character, empty', 'X closes directly (R-047)', 'like X', 'TC-056'],
  ['Make your character with input', 'X → 「Discard this character?」 (Keep editing / Discard)', 'the same dialog', 'TC-402'],
  ['「Discard this character?」 (input entered)', 'Keep editing / Discard', 'like Keep editing', 'TC-402'],
  ['Make your character, keyboard open on the description', 'Done, tap outside', 'closes only the keyboard', 'TC-287'],
  ['Full-screen description editor', 'collapse / Done', 'keyboard first, then like collapse (text kept)', sbEditor],
  ['Age keypad', '✓', 'closes only the keypad; whether the typed value stays is recorded (Q-A6)', 'TC-127'],
  ['Make your character, generating', 'X / Cancel / outside tap → 「Stop and lose your credits?」', 'the same dialog', 'TC-431'],
  ['Generated character', 'X / swipe down → 「Discard this character?」 (R-248 names Android back)', 'the same dialog', 'TC-401'],
  ['「Discard this character?」 (generated)', 'Keep / Discard', 'like Keep', 'TC-401'],
  ['Select Media (reference picker)', '‹', 'like ‹: no reference added', 'TC-128'],
  ['Select Media layers: album list, photo preview, picker options, camera', 'their own close', 'closes only that layer', media],
  ['Media-permission notice (Android)', 'OK, top-left arrow', 'back to Create my character', 'TC-412'],
  ['Android system permission dialogs (photos, microphone, notifications)', 'Allow / Don\'t allow', '—', 'n/a (Android\'s own dialog, not drawn by the spec; its Back is the system\'s)'],
  ['Crop', 'X / ✓', 'like X: the photo is not applied', sbCrop],
  ['Enlarged character preview', 'ⓧ', 'like ⓧ', 'TC-135'],
  ['Preview ⋯ menu', 'none drawn', 'closes only the menu', 'TC-135'],
  ['Report flow (from the preview)', 'its back', 'back to the preview without sending', 'TC-135'],
  ['Library character ⋮ menu', 'none drawn', 'closes only the menu', 'TC-059'],
  ['「Delete this character?」', 'Cancel / Delete', 'like Cancel', 'TC-058'],
  ['Character failure dialogs 「Couldn\'t create some images」 / 「Couldn\'t create image」', 'Got it / close', 'like that button', 'TC-384'],
  ['「Top up your credits」 panel', 'X', 'like X: nothing bought', 'TC-225'],
  ['Terms of Use / Privacy Policy pages', 'back', 'back to the panel', 'TC-225'],
  ['My Credits, and the credit purchase and subscription pages opened from it', '←', 'back one page; nothing bought', myCredits],
  ['Subscription page from the limit dialog or the charge card', 'its close', 'back to the chat without subscribing', 'TC-215, TC-226'],
  ['「Daily Free Chat Limit Reached」', 'X / Upgrade to Premium', 'like X', 'TC-220'],
  ['「Today\'s AI Chats Are Used Up」', 'Continue Tomorrow', 'like Continue Tomorrow', 'TC-118'],
  ['Scene detail', 'X (R-054)', 'like X', 'TC-065'],
  ['ⓘ dialog 「Couldn\'t generate this image」', 'Got it', 'like Got it', 'TC-067'],
  ['Scene description editor (Edit on a failed scene)', 'collapse / Done', 'keyboard first, then like collapse (text kept)', sbScene],
  ['Scene detail while an image regenerates', 'X → 「Stop and lose your credits?」 (R-280)', 'the same dialog', 'TC-378'],
  ['Storyboard Preview player', 'X', 'like X', 'TC-075'],
  ['Video settings card', 'none (a card inside the chat)', '—', 'n/a (part of the chat, not a screen of its own; system Back there is the chat\'s: Exit × stage)'],
  ['Notification pre-prompt', 'Notify me / Not now', 'record; must not open the permission dialog (Q-A6)', 'TC-304'],
  ['Task-completed toast (Close / View)', 'Close', '—', 'n/a (a toast over another page, not modal; system Back acts on the page beneath it)'],
  ['Video result page / scene-video player', '‹ (R-077, R-128)', 'like ‹: back to the chat', 'TC-506'],
  ['Video result page while exporting', '← stays enabled (PM 10/22)', 'leaves; the export goes on', 'TC-517'],
  ['Export sheet / done page the Android build shows', 'none drawn (R-324)', 'the sheet closes without exporting, the done page goes back; record (Q-A6)', sbExport],
  ['Fix scenes view', 'its back', 'back to where it was opened', 'TC-150'],
  ['Scene-video description editor', 'collapse / Done', 'keyboard first, then like collapse (text kept)', sbClip],
  ['ⓘ dialog 「Couldn\'t generate this video」', 'Got it', 'like Got it', 'TC-362'],
  ['Full Edit (PowerDirector editor)', '←', 'leaves Full Edit', 'TC-088'],
  ['Full Edit\'s own export (Produce)', 'PowerDirector editor', '—', 'n/a (PowerDirector\'s editor export, outside AI Mini Drama; TC-423 only checks the drama\'s captions are not Pro-gated)'],
  ['History (Recent Task)', '‹', 'like ‹', 'TC-327'],
  ['History ⓘ bubble', 'none drawn', 'record (Q-A6); expected to close only the bubble', 'TC-327'],
  ['History first-visit hint', 'outside tap (R-092)', '—', 'n/a (shown once per install; TC-105 spends that one showing on the outside tap)'],
  ['「Find your video here in History.」 bubble', 'tap anywhere (R-072)', '—', 'n/a (shown once per install; TC-083 spends that one showing)'],
  ['History ⋮ menu', 'none drawn', 'closes only the menu', sbHistory],
  ['「Delete this drama?」', 'Cancel / Delete', 'like Cancel', sbHistory],
  ['Rename dialog', 'Cancel / OK', 'keyboard first, then like Cancel (old name kept)', sbHistory],
  ['Manage mode and 「Delete {n} dramas?」', 'Cancel', 'like Cancel', 'TC-112'],
  ['Mine › Credits › Details (opened by the refund rows)', '—', '—', 'n/a (PowerDirector\'s Mine pages, outside AI Mini Drama)'],
];
{
  const act = new Set(rows.filter(r => r.Change !== 'removed').map(r => r.ID));
  for (const l of SYSBACK) {
    if (l.length !== 4) throw new Error(`System back line ${l[0]}: 4 cells`);
    if (!l[3].startsWith('n/a (')) for (const id of l[3].match(/TC-\d+/g) ?? []) if (!act.has(id)) throw new Error(`System back ${l[0]}: ${id} not active`);
    const sb = (l[3].match(/TC-\d+/g) ?? []).filter(id => !/system back|System back/.test(`${get(id).Precondition} ${get(id).Action}`));
    if (!l[3].startsWith('n/a (') && sb.length) throw new Error(`System back ${l[0]}: ${sb.join(', ')} does not press system back`);
  }
}
// Request ledger coverage.
swap(/(\| REQ-046 [^\n]*\n)/, `$1| REQ-039 Every tappable element is pressed, inputs dismissed (2026-10-28) | control-trace.json (every Android control group pressed or n/a; inputs dismissed); R-326 – R-337 (Figma inventory flow arrows); R-338 – R-351 (controls) |\n| REQ-040 Grouped control totals, robust tap matching (2026-10-28) | control-trace.json (one entry per group); R-326 – R-337 |\n| REQ-049 Update the Android table for the 10/28 upstream rules (2026-10-28) | this draft: R-326 – R-351, control-trace.json, round A3 |\n| REQ-050 The Design's iPhone frames count for Android (2026-10-28; answers Q-A4) | control-trace.json: all 146 control groups pressed by Android rows or n/a (inventory.json rebuilt by scripts/inventory.ts; no ios_only_screens) |\n| REQ-051 System Back on every Android screen (2026-10-28) | R-352 – R-356; ### System back (one line per screen: ${SYSBACK.filter(l => !l[3].startsWith('n/a')).length} with rows, ${SYSBACK.filter(l => l[3].startsWith('n/a')).length} n/a); Q-A5, Q-A6 |\n`);


req += `

## Added 2026-10-28 — Figma inventory (REQ-038 / REQ-039)
The Figma inventory (\`extracted/inventory.json\`) found 12 flow arrows the 10/19 import did not hold: three on the Storyboard
board's Error frames and nine on the Figma-only 「1016_Chat navigation」 board (4858:34930). On 1016 the four 「Leave anyway」
arrows start at the same button; the exit that opened the dialog decides the landing page. Dialog copy and when it shows follow
PM 10/21 (REQ-029, R-261 – R-264); Android's system back is the same exit as ← (R-306). Mirrors the iOS draft 20261028-121259
(iOS R-306 – R-331 = Android R-326 – R-351).

### Flow arrows with new rows
${arrowsNew.join('\n')}

### Flow arrows walked by existing rows
${arrowsWalked.join('\n')}

### Controls (REQ-039)
Controls the Design draws that no existing rule described; each is pressed by the row named in \`control-trace.json\`. Since
REQ-050 the Design's iPhone frames count for Android too (\`scripts/inventory.ts\`), so the trace lists every control group of
the shared screens: the same 146 groups as iOS, each pressed by the Android row that does the iOS press, or n/a.

${controls.join('\n')}

${NOT_IN_SCOPE}

### Open questions (2026-10-28)
- Q-A4 The Design draws Android frames only for the AI Mini Drama home page and Template Detail (Google Pixel 2), so the
  inventory gave Android 21 control groups against 146 for iOS. Should the iOS phone frames count for Android too? —
  Answered 2026-10-28 (REQ-050): yes. \`scripts/inventory.ts\` counts an iPhone frame for Android unless
  \`inventory-overrides.json\` keeps the screen to iOS (\`ios_only_screens\`: none needed, no screen of this set is
  Apple-only); \`control-trace.json\` now traces all 146 groups with Android rows.

## Added 2026-10-28 (2) — Android system Back on every screen (REQ-051)
Coverage pass 8, 「Android system Back」: system Back is an exit of every page, sheet, dialog, popup, picker, editor and
full-screen viewer the feature opens, not only of the chat. The spec states it for the chat (R-306 – R-308, R-318, R-321;
Exit × stage), the generated character (R-248) and the export (R-323); everywhere else system Back does what the screen's
own way out does (R-352 – R-355), and where the spec gives none the row records what it does (R-356).

${SYSBACK_REQ.join('\n')}

### System back
One line per screen (\`inventory.json\` screens and panels, plus the pages the PM spec names). Rows = the rows that press
system Back there; n/a with the reason.

| Screen | Own way out (spec) | System back must | Rows |
|---|---|---|---|
${SYSBACK.map(l => `| ${l.join(' | ')} |`).join('\n')}

### Open questions (2026-10-28, system Back)
- Q-A5 The spec states no system Back rule for dialogs, menus and keyboards. The rows expect it to act like the dialog's
  non-destructive answer (Stay, Keep Generating, Keep choosing, Keep editing, Keep, Cancel, Got it, Close, X, Continue
  Tomorrow) and never like the destructive one, and to close the keyboard or keypad before the screen (R-354, R-355).
  Confirm (PM).
- Q-A6 Screens with no drawn close control and no Back rule: the History ⓘ bubble (TC-327), the Finish your characters ⓘ
  tip (TC-039), a typed but unconfirmed Age (TC-127: kept or dropped?), the notification pre-prompt (TC-304: does Back count
  as 「Not now」, never shown again?) and the export sheet / done page the Android build shows although PM 10/22 draws none
  (${sbExport}). The rows record what system Back does (R-356). What should it do (PM)?
`;
writeFileSync(join(HERE, 'requirements.md'), req + '\n');
copyFileSync(join(PREV, 'annotation-trace.json'), join(HERE, 'annotation-trace.json'));

// ---------- run setup (phases.json): round A3 = only the new and changed rows (REQ-033) ----------
const prevPhases = JSON.parse(readFileSync(join(PREV, 'phases.json'), 'utf8'));
const [A1, A2] = ['A1', 'A2'].map(id => prevPhases.phases.find((p: any) => p.id === id));
const stage: Record<string, string> = {}, inA2 = new Set<string>();
for (const s of A1.segments) for (const c of s.cases) stage[c] = s.id.slice(3, 4);
for (const s of A2.segments) for (const c of s.cases) { stage[c] = s.id.slice(3, 4); inA2.add(c); }
const anchorOf = (id: string) => { const i = rows.findIndex(r => r.ID === id); for (let j = i - 1; j >= 0; j--) if (stage[rows[j].ID]) return rows[j].ID; throw new Error(`no stage for ${id}`); };
for (const r of rows) if (!stage[r.ID]) stage[r.ID] = stage[anchorOf(r.ID)];
const active = rows.filter(r => r.Change !== 'removed');
const inA3 = active.filter(r => r.Change === 'new' || r.Change === 'modified');
const names: Record<string, string> = {};
for (const s of [...A1.segments, ...A2.segments]) names[s.id.slice(3, 4)] ??= s.name.replace(/ \(\d\/\d\)$/, '');
const segments: { id: string; name: string; cases: string[] }[] = [];
for (const k of Object.keys(names)) {
  const cs = inA3.filter(r => stage[r.ID] === k).map(r => r.ID); if (!cs.length) continue;
  segments.push({ id: `A3-${k}`, name: names[k], cases: cs });
}
const allNeeds: Record<string, string[]> = {};
for (const r of active) { const n = [...(prevPhases.needs[r.ID] ?? []), ...(prevPhases.needs[inherit[r.ID]] ?? []), ...(needs[r.ID] ?? [])]; if (n.length) allNeeds[r.ID] = [...new Set(n)]; }
writeFileSync(join(HERE, 'phases.json'), JSON.stringify({
  draft: DRAFT, current: ['A3'], needs: allNeeds, unavailable: { ...prevPhases.unavailable },
  phases: [A1, A2, { id: 'A3', name: 'Android round 3: new and changed rows of draft 20261028-164930 (REQ-039, REQ-050, REQ-051)', round: true,
    note: `The ${inA3.length} rows this draft adds or changes (Figma inventory arrows and every-control presses, REQ-039 / REQ-050; system Back on every screen, REQ-051), in the journey stage of the row each one extends (REQ-033). Rows A1 / A2 already ran keep their results. Signed in to the user's test account (REQ-045, REQ-047).`,
    origin: Object.fromEntries(inA3.map(r => [r.ID, r.Change === 'new' ? 'A3' : inA2.has(r.ID) ? 'A2' : 'A1'])), segments }],
}, null, 1) + '\n');

// ---------- control trace (coverage pass 11): controls.ts lists the 146 Android groups, then every one is traced here ----------
// TRACE: the 21 groups the inventory gave Android before REQ-050 (Pixel frames and the panels drawn once); TRACE50: the rest.
// Auto label hints were checked: most named rows that only mention the label, so every entry is set by hand.
execFileSync(process.execPath, [join(HERE, '..', '..', '..', '..', '..', '..', 'scripts', 'controls.ts'), 'pdr/ai-mini-drama', 'android', '--draft', DRAFT], { stdio: 'ignore' });
const TRACE: Record<string, string> = {
  'C-9dbaad': `${backLeave}, ${histLeave}, ${newLeave}, TC-358, TC-027, TC-357`, // Leave anyway / Stay (1016 leave dialogs)
  'K-dadcbe': 'TC-011, TC-425',                    // Create Your Drama
  'K-87581d': 'TC-357, TC-358',                    // credit pill (one group with the chat's pill)
  'K-6b5f6c': `TC-026, ${histLeave}`,              // History icon
  'K-1a478d': `TC-025, ${backLeave}`,              // ← (system back has no Figma control: TC-395, TC-396)
  'C-18263e': 'TC-007, TC-237',                    // landing template covers
  'K-8435fd': 'TC-006',                            // 「More」 (the label hint named rows that only mention "more")
  'K-a9408f': 'n/a: duplicate box: the › of the 「More ›」 link (K-8435fd, pressed by TC-006)',
  'K-c0ac9a': 'TC-041, TC-136',                    // Generate all
  'K-31c320': 'TC-225',                            // Buy Credit
  'C-232cfe': 'TC-038',                            // Leave / Keep choosing (the hint named the outline Leave anyway rows)
  'K-ab333a': 'TC-225',                            // credit packs
  'C-dc0d8b': 'TC-120',                            // cast slot tiles (one choice covers the set)
  'C-8157ce': 'TC-225',                            // Terms of Use / Privacy Policy
  'K-39d8e0': 'TC-327, TC-067',                    // ⓘ (one group with History's and the scene card's ⓘ)
  'K-2406cd': 'TC-037, TC-134, TC-121',            // ✕ on sheets and panels
  'K-76d4e8': 'TC-137, TC-067',                    // 「Got it」
  'K-1e3760': 'TC-067',                            // 「terms of service」 in the ⓘ dialog
  'K-d3aec5': 'TC-009, TC-235, TC-237',            // 「Make my version」
  'K-3ba776': 'TC-008',                            // template video player (the hint named the scene-video player row)
  'K-940021': 'TC-008',                            // template volume icon
};
// REQ-050: the iPhone-frame groups now counted for Android (125), traced with the Android rows that do the iOS draft's
// presses (ios/drafts/20261028-121259/control-trace.json, hand-checked there); each row was compared with its iOS row
// (same Action, or the same press in Android wording: TC-033, TC-036, TC-044, TC-067, TC-075, TC-135, TC-310, TC-343).
const LAUNCHER = 'n/a: Launcher control of another PowerDirector feature; the table tests the Launcher only as AI Mini Drama\'s entry (requirements.md, Controls (REQ-039), Not in scope)';
const TRACE50: Record<string, { press: string; dismiss?: string }> = {
  'K-acb774': { press: 'TC-060' }, // 1005_Chat · The characters look great! Ready to crea
  'K-c31c80': { press: 'TC-060, TC-379' }, // 1016_Chat navigation · Details
  'K-d1e307': { press: `${myCredits}` }, // 1016_Chat navigation · Subscribe Now
  'K-938d8f': { press: `${myCredits}` }, // 1016_Chat navigation · Buy More
  'K-b32fbc': { press: `${myCredits}` }, // 1016_Chat navigation · Claim
  'K-f327ac': { press: 'TC-041' }, // Choose Character · Confirm
  'K-6b314e': { press: 'TC-127' }, // Choose Character · btn_check
  'K-c174b4': { press: 'TC-133' }, // Choose Character · Save to library (iOS also TC-180, an iOS ticket row)
  'K-1b6c85': { press: 'TC-119' }, // Choose Character · checkbox
  'C-6b27da': { press: 'TC-048, TC-050' }, // Choose Character · choice of 3: 「Female」 「Male」 「Other」
  'C-afef34': { press: 'TC-048, TC-050' }, // Choose Character · choice of 4: 「Caucasian」 「Asian」 「African」 「Hispan
  'C-8cec01': { press: 'TC-036' }, // Choose Character · choice of 3: 「Female」 「Asian」 「Age: 0-28」
  'K-0e6cc8': { press: 'TC-128' }, // Choose Character · Reference (optional)
  'K-4ff85b': { press: 'TC-317' }, // Choose Character · imput_character
  'K-d301d1': { press: 'TC-127', dismiss: 'TC-127' }, // Choose Character · 1-100
  'K-68cdee': { press: 'TC-127', dismiss: 'TC-127' }, // Choose Character · 1-100
  'K-cbd30c': { press: 'TC-127', dismiss: 'TC-127' }, // Choose Character · 24
  'K-f2a9d2': { press: 'TC-310' }, // Choose Character · Regenerate character
  'K-aaab73': { press: 'TC-070, TC-124, TC-148, TC-287' }, // Choose Character · Done
  'K-076bc2': { press: 'TC-119' }, // Choose Character · Clear
  'C-14cbaa': { press: `${media}` }, // Choose Character · choice of 2: 「Photo」 「Adjust」
  'K-b862bc': { press: 'TC-317' }, // Choose Character · Replace photo
  'K-a2f9e8': { press: 'TC-048, TC-370', dismiss: 'TC-124, TC-287' }, // Choose Character · Character description
  'C-88ef55': { press: `${media}` }, // Choose Character · choice of 2: 「Recents」 「Stock source」
  'K-041929': { press: 'TC-371' }, // Choose Character · Age range
  'K-37e272': { press: `${media}` }, // Choose Character · round/ic_camera
  'K-327b3e': { press: `${media}` }, // Choose Character · round/ic_chevron_down
  'K-32eae1': { press: 'TC-135, TC-219' }, // Choose Character · round/ic_circle_xmark_filled
  'K-135b9c': { press: 'TC-123, TC-140, TC-147' }, // Choose Character · round/ic_collapse_text
  'K-5554e3': { press: 'TC-135' }, // Choose Character · round/ic_download
  'K-6b8e28': { press: 'TC-122' }, // Choose Character · round/ic_expand_text
  'K-3276bb': { press: 'TC-036' }, // Choose Character · round/ic_filter_check
  'K-aa0c0b': { press: `TC-135, ${media}` }, // Choose Character · round/ic_full screen
  'K-977013': { press: 'TC-067' }, // Choose Character · round/ic_info
  'K-ea3e9d': { press: 'TC-058, TC-135' }, // Choose Character · round/ic_more_filled
  'K-910afd': { press: 'TC-135' }, // Choose Character · round/ic_report
  'K-a01368': { press: 'TC-126' }, // Choose Character · round/ic_sparkle
  'K-509611': { press: 'TC-111' }, // Choose Character · round/ic_trash
  'C-0e27fb': { press: 'TC-129' }, // Choose Character · choice of 15
  'K-1ba96e': { press: 'TC-015, TC-020', dismiss: 'TC-018' }, // main flow · Enter your idea to create drama
  'K-8335b0': { press: 'TC-020', dismiss: 'TC-018' }, // main flow · Company policy strictly bans office roma
  'K-20ac46': { press: 'TC-019' }, // main flow · More ideas
  'C-91f18a': { press: `${LAUNCHER}` }, // main flow · choice of 3: 「USA Winner」 「Team ARG」 「USA Cam」
  'K-65b3b3': { press: `${LAUNCHER}` }, // main flow · New Project
  'K-fd1f9d': { press: 'TC-143' }, // main flow · btn_play
  'K-344d7d': { press: 'TC-321' }, // main flow · Create Next Episode
  'K-d0ef6a': { press: 'TC-022, TC-060, TC-236' }, // main flow · Generate
  'K-6316f3': { press: 'TC-081' }, // main flow · Generate Video
  'K-aca269': { press: 'TC-070' }, // main flow · Edit
  'K-c50645': { press: 'TC-065' }, // main flow · View more
  'C-9dc098': { press: 'TC-021' }, // main flow · choice of 7: 「English」 「Spanish」 「French」 「German」
  'C-8f89bd': { press: 'TC-021' }, // main flow · choice of 2: 「Yes, include captions」 「No captions」
  'C-41545b': { press: 'TC-013' }, // main flow · choice of 3: 「Surprise me」 「Company policy strictl
  'K-3f63ba': { press: 'TC-089' }, // main flow · download
  'K-776847': { press: 'n/a: decorative credit icon inside the price label of the action cards (no tap target of its own; the card is pressed through its Generate button)' }, // main flow · ic_credit
  'K-2f39a7': { press: 'TC-138' }, // main flow · imput_character
  'C-c09a5c': { press: 'TC-138' }, // main flow · choice of 8
  'C-ca9a4e': { press: 'TC-005, TC-060' }, // main flow · choice of 5: 「Home」 「AI Magic」 「Template」 「Project
  'K-faa068': { press: `${LAUNCHER}` }, // main flow · Try Pro+ 7 days for free
  'C-5b7483': { press: 'TC-047' }, // main flow · choice of 2: 「Create my character」 「Mine」
  'K-0634ff': { press: 'TC-326' }, // main flow · library_thumbnail
  'K-cc18ef': { press: 'TC-001' }, // main flow · AI Mini Drama
  'K-6a1033': { press: 'TC-080, TC-081' }, // main flow · Quality
  'K-50bbd0': { press: 'TC-236' }, // main flow · Looking good! Ready for the full video?
  'K-a4767d': { press: 'TC-080, TC-081' }, // main flow · Model
  'K-691c23': { press: 'TC-080' }, // main flow · Best
  'K-132905': { press: 'TC-357' }, // main flow · round/ic_add_chat
  'K-04c77a': { press: `${LAUNCHER}` }, // main flow · round/ic_ai_enhancement
  'K-81baa6': { press: 'TC-374' }, // main flow · round/ic_arrow_down
  'K-42c3dc': { press: 'TC-020' }, // main flow · round/ic_arrow_up
  'K-6c9344': { press: `${LAUNCHER}` }, // main flow · round/ic_auto_edit
  'K-937182': { press: 'TC-044, TC-131, TC-036' }, // main flow · round/ic_check
  'K-2ba92a': { press: 'TC-065' }, // main flow · round/ic_chevron_right
  'K-007183': { press: `${LAUNCHER}` }, // main flow · round/ic_cinematic_reel_creator
  'K-91724b': { press: 'TC-036' }, // main flow · round/ic_filter
  'K-9a06f5': { press: `${LAUNCHER}` }, // main flow · round/ic_image2video
  'K-27bb0a': { press: `${LAUNCHER}` }, // main flow · round/ic_menu
  'K-7cdb03': { press: `${LAUNCHER}` }, // main flow · round/ic_motion_swap
  'K-d917ad': { press: `${LAUNCHER}` }, // main flow · round/ic_notification_unread
  'K-0348af': { press: `${LAUNCHER}` }, // main flow · round/ic_speech_2_text
  'K-573d95': { press: `${LAUNCHER}` }, // main flow · round/ic_text2video
  'K-dac69d': { press: `${LAUNCHER}` }, // main flow · round/ic_video enhancer
  'K-fd68e2': { press: `${LAUNCHER}` }, // main flow · round/ic_video_edit_by_chat
  'K-30a28e': { press: `${mic}` }, // main flow · mic (iOS also TC-191, an iOS ticket row needing speech)
  'C-220076': { press: 'TC-138' }, // main flow · choice of 7: 「Scene 6 — The Price of Going ...」 「S
  'K-124b99': { press: 'TC-075' }, // main flow · Storyboard Preview_thumbnail
  'K-aa4593': { press: 'TC-080' }, // main flow · Preview · 30 sec
  'K-ca5690': { press: 'TC-080, TC-347' }, // main flow · Seedance 2.0
  'C-93c518': { press: 'TC-033' }, // main flow · choice of 3: 「Sophie」 「The Manager」 「HR」
  'K-cf4f2e': { press: 'n/a: the template cover inside the user\'s message bubble is message content; no Design frame, arrow or note gives it a tap action' }, // main flow · thumbnail_3v4
  'K-d9f246': { press: 'TC-143' }, // main flow · video
  'C-745d7c': { press: 'TC-143' }, // main flow · choice of 2
  'K-7b9560': { press: 'TC-215, TC-222' }, // MX · Upgrade to Premium (iOS TC-216 has no Android row; TC-215 presses it, TC-222 needs a purchase)
  'K-71866f': { press: 'TC-118' }, // MX · Continue Tomorrow
  'K-af2bec': { press: 'TC-152, TC-116' }, // MX · Buy Credits
  'K-1ed4be': { press: 'TC-106' }, // Recent Task · New Chat
  'K-9393b9': { press: 'TC-112' }, // Recent Task · Manage
  'K-b6864a': { press: 'TC-112' }, // Recent Task · Delete
  'C-fe9663': { press: 'TC-112' }, // Recent Task · choice of 2: 「Select All」 「Cancel」
  'C-5a0a33': { press: 'TC-108, TC-111' }, // Recent Task · choice of 2: 「Rename」 「Delete」
  'K-6441bd': { press: 'TC-113' }, // Recent Task · 2026/08/19 10:51 AM
  'K-9659da': { press: 'TC-108' }, // Recent Task · round/ic_edit_square
  'K-49df48': { press: 'TC-111' }, // Recent Task · round/ic_more_vertical_filled
  'K-2256b1': { press: 'TC-141' }, // Storyboard · Regenerate Image
  'K-a10885': { press: 'TC-092, TC-299' }, // Storyboard · Retry
  'K-ff1a1c': { press: 'TC-098' }, // Storyboard · Try again
  'K-404007': { press: 'TC-070, TC-312', dismiss: 'TC-070' }, // Storyboard · Scene description
  'K-af4631': { press: 'TC-075' }, // Storyboard · Preview scrubber
  'K-8b9605': { press: 'TC-065' }, // Storyboard · round/ic_chevron_left
  'K-1ff415': { press: 'TC-075' }, // Storyboard · round/ic_pause
  'K-a28dca': { press: 'TC-066' }, // Storyboard · scene
  'K-22b2d2': { press: 'n/a: container, not a control of its own: the error card\'s 「Edit」 (K-aca269, TC-070) and ⓘ (K-977013, TC-067) are traced, and the Design draws no tap on the card itself' }, // Storyboard · Couldn\'t create image
  'K-a990dd': { press: 'TC-066' }, // Storyboard · scene_media
  'K-9669fb': { press: 'n/a: duplicate of the main scene image K-a28dca (the same image in its failed 「Scene」 state, in the scene_media layer), pressed by TC-066' }, // Storyboard · Scene
  'K-55702f': { press: 'TC-066' }, // Storyboard · Location
  'C-93eb1e': { press: 'TC-033' }, // Storyboard · choice of 3: 「Sophie」 「The Manager」 「HR」
  'K-55f3b5': { press: 'TC-008' }, // Template Detail · btn_play
  'K-cf0dd5': { press: 'TC-008' }, // Template Detail · round/ic_volume_off
  'C-87bf0b': { press: 'TC-239, TC-261, TC-265, TC-269' }, // Template Detail · choice of 13: 「The New Guy\'s Secret」 「Forbidden O
  'K-c73a98': { press: 'TC-149' }, // video · Regenerate scene
  'K-c89bc1': { press: 'TC-150' }, // video · Fix scenes
  'C-65c45d': { press: 'TC-088, TC-311, TC-343' }, // video · choice of 2: 「Full Edit」 「Export Full Video」
  'K-a98301': { press: 'n/a: decorative red ! icon in front of the chat failure text (「{n} scenes couldn\'t be generated…」); the Design draws no tap action, the line\'s 「Edit」 / 「Fix scenes」 are traced' }, // video · round/ic_circle_exclamation
  'C-216993': { press: 'TC-382' }, // video · choice of 5
  'K-87ffd6': { press: 'TC-375' }, // video · video
};
const tracePath = join(HERE, 'control-trace.json');
const trace = JSON.parse(readFileSync(tracePath, 'utf8'));
for (const e of trace.entries) {
  const p = TRACE[e.group] ?? TRACE50[e.group]?.press; if (!p) throw new Error(`control ${e.group} has no trace in the builder`);
  Object.assign(e, { press: p, how: 'manual' });
  if (e.kind === 'input') { const d = TRACE50[e.group]?.dismiss; if (!d) throw new Error(`input ${e.group} has no dismiss in the builder`); e.dismiss = d; }
  delete e.carried_from;
}
const extra = [...Object.keys(TRACE), ...Object.keys(TRACE50)].filter(g => !trace.entries.some((e: any) => e.group === g));
const both = Object.keys(TRACE).filter(g => g in TRACE50);
if (both.length) throw new Error(`traced twice: ${both.join(', ')}`);
if (extra.length) throw new Error(`trace for groups not in the inventory: ${extra.join(', ')}`);
writeFileSync(tracePath, JSON.stringify(trace, null, 1) + '\n');

// ---------- build summary (update-plan.md is written by hand from it) ----------
const ch = (c: string) => rows.filter(r => r.Change === c).map(r => r.ID);
writeFileSync(join(HERE, 'build-out.json'), JSON.stringify({ NEW, modified: ch('modified'), needs, a3: segments.map(s => `${s.id}:${s.cases.join(' ')}`),
  rows: { backLeave, histLeave, newLeave, myCredits, regen, mic, media } }, null, 1) + '\n');
console.log(JSON.stringify({ rows: rows.length, active: active.length, new: NEW.length, modified: ch('modified').length, removed: ch('removed').length,
  unchanged: ch('unchanged').length, a3: segments.map(s => `${s.id}:${s.cases.length}`) }));
