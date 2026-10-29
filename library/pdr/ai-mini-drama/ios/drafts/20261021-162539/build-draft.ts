// Build draft 20261021-162539: approved table v2 (330 rows) updated to AI Mini Drama - PM Spec 20261021.pdf
// (16:04 download, spec set specs/2026-10-21-2; Design and MX unchanged). PM-only rule (REQ-024): anything the PM
// states that the Design does not draw becomes rows now. Where the new PM contradicts what the Design draws
// (three video models, charged character change in chat) the Design still wins (Q-15, Q-16).
// Re-runnable; overwrites draft.csv, requirements.md and phases.json in this folder.
//   node library/pdr/ai-mini-drama/ios/drafts/20261021-162539/build-draft.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const IOS = join(HERE, '..', '..');
type Row = Record<string, string>;
const approved: Row[] = readTable(join(IOS, 'cases.csv'));
const oldReq = readFileSync(join(IOS, 'requirements.md'), 'utf8').trimEnd();
let nextR = Math.max(...[...oldReq.matchAll(/\bR-(\d{3,})\b/g)].map(m => +m[1])) + 1;
let nextTc = Math.max(...approved.map(r => +r.ID.slice(3))) + 1;
const newReq: string[] = [];
const req = (src: string, text: string) => { const id = `R-${String(nextR++).padStart(3, '0')}`; newReq.push(`- ${id} [${src}; Req: REQ-025] ${text}`); return id; };
const PMONLY = 'PM-only: no Design frame yet (Design 2026-10-19)';

// ---------- modified rows ----------
const rows: Row[] = approved.map(r => ({ ...r, Change: 'unchanged', 'Change Reason': '' }));
const get = (id: string) => rows.find(r => r.ID === id)!;
function modify(id: string, reason: string, f: (r: Row) => void) { const r = get(id); f(r); r.Change = 'modified'; r['Change Reason'] = reason; }
const note = (r: Row, n: string) => { r.Notes = r.Notes ? `${n}; ${r.Notes}` : n; };

modify('TC-034', 'PM §13.1: the hint shows once per user (first use of AI Mini Drama)', r => {
  r.Precondition = 'First AI Mini Drama use on this account (fresh install or new account); Change Characters open, nothing set';
  note(r, 'The hint shows once per user (PM §13.1); TC-346 checks it does not come back');
});
modify('TC-041', 'PM 10/16 (pm-update-9): generating title, time hint and done copy', r => {
  r['Expected Result'] = '「Creating {n} characters...」 with 「This usually takes about 1 minute.」, then 「Your characters are ready」/「Tap Confirm to continue.」 with 「Confirm」';
});
modify('TC-057', 'PM 10/21 §13.23: X on the character result asks to discard; only Save to library saves', r => {
  r.Action = 'Tap X on the generated character';
  r['Expected Result'] = '「Discard this character?」/「It won\'t be saved, and the credits you spent won\'t be refunded.」 with 「Keep」 and 「Discard」 (red)';
  note(r, 'Was: X also saved the character (main-flow note "confirm or tap X 都會存"), replaced 10/21; DRI261896P0037');
});
modify('TC-134', 'PM 10/21 §13.23: X now asks first; Discard keeps the character out of Mine', r => {
  r.Action = 'Tap X, then 「Discard」 in the dialog';
  r['Expected Result'] = 'The result closes; the character is not applied to the cast slot and is not saved to Mine';
  note(r, 'PM 10/21 adds the Discard dialog (§13.23)');
});
modify('TC-072', 'PM 10/20 (pm-update-3): the chat image update card reads Create storyboard', r => {
  r['Expected Result'] = 'Iris replies with a 「Create storyboard」 card with the price (2 credits per image) and Generate';
  note(r, 'PM 10/20: the card reads Create storyboard for script and image changes alike; DRI261895P0025 asked for the old "Update storyboard images" label');
});
modify('TC-073', 'PM 10/20: the card is now labelled Create storyboard', r => { r.Precondition = '「Create storyboard」 card shown after asking Iris to update a scene image'; });
modify('TC-293', 'PM 10/20: the card is now labelled Create storyboard', r => { r.Action = 'Tap Generate on the 「Create storyboard」 card and wait'; });
const BOTTOM = 'The chat opens at the bottom (newest message)';
for (const [id, from] of [['TC-101', 'History'], ['TC-102', 'Character Library'], ['TC-311', 'Full Edit']] as const) modify(id, `PM 10/20 §13.2: coming back from ${from} lands at the bottom`, r => {
  r['Expected Result'] = BOTTOM;
  note(r, 'PM 10/20 §13.2 replaced "keeps the position the user left"');
});
// User 2026-10-22 (REQ-026): Q-15 and Q-16 use the PM version (the app will follow it soon); Q-17 the new §13.2 rule.
const NEWER = 'PM 10/16 is newer than the Design frame, which still shows the old version; user 2026-10-22 (REQ-026): test the PM version';
modify('TC-079', 'Q-15 decided: PM 10/16 three video models (REQ-026)', r => {
  r['Expected Result'] = '「Choose your video settings」 with 「Model • Seedance」 and a Best / Standard / Fast control (no NEW tag on Best); with Best selected the subtitle reads 「Seedance 2.5 • Sharper motion and richer detail」; Video length Preview • 30 sec / Full Video; Generate Video with its price';
  r.Notes = `${NEWER} (Design draws Seedance 2.0 / 2.0 Mini). Default model TBD (the PM mock shows Best); record which is selected`;
});
modify('TC-080', 'Q-15 decided: PM 10/16 prices per model (6 / 4 / 2 credits per second)', r => {
  r.Action = 'Switch Best, Standard and Fast with Preview • 30 sec, then with Full Video';
  r['Expected Result'] = 'Preview • 30 sec costs ◆180 (Best), ◆120 (Standard), ◆60 (Fast); Full Video costs 6 / 4 / 2 credits per second of its length (◆540 / ◆360 / ◆180 for 90 sec); the price updates at once';
  r.Notes = `${NEWER}. Credit numbers are binding`;
});
modify('TC-045', 'Q-16 decided: PM 10/16 charged character change in chat (REQ-026)', r => {
  r.Action = 'Ask in chat to change one character\'s look clearly (e.g. 「Make The Manager a woman in her 40s」)';
  r['Expected Result'] = 'No question first; 「Ready to update your characters?」 with the card 「Update characters • 1 character • ◆{price} • Generate」, the price being one character generation';
  r.Notes = `${NEWER} (Design 1014 draws 「Character looks aren't updated automatically…」)`;
});
modify('TC-046', 'Q-16/Q-17 decided: old cards keep their images and lose the switch icon; only the newest action card shows', r => {
  r['Expected Result'] = 'The older Story Outline & Characters card has no switch icons and keeps its old images; only the newest action card is shown';
  r.Notes = 'PM 10/16 board 7 and PM 10/20 §13.2 ③ (new results never write back into earlier messages; user 2026-10-22, Q-17)';
});
modify('TC-073', 'Q-17 decided: new results come as a new message; the earlier card is not changed (PM 10/20 §13.2 ③)', r => {
  r['Expected Result'] = 'Card disappears; a new storyboard card appears at the bottom with skeletons on the changed scene and preview, then the new image; the earlier storyboard card above stays as it was';
});
for (const id of ['TC-035', 'TC-309']) modify(id, 'PM §13.1: needs a first-use account to see the hint', r => { note(r, 'Needs the hint, which shows once per user (first use): run with TC-034'); });

// ---------- new rows ----------
type New = { sec: string; pre: string; act: string; exp: string; prio: string; ref: string; notes?: string; needs?: string[] };
const add: New[] = [];
const rWait = req('PM:pm-update-9 (10/16)', 'While a character generates: 「This usually takes about 1 minute.」 under the attribute chips, X stays enabled and 「Cancel」 sits under the Generating button; Cancel or X asks 「Stop and lose your credits?」 (Leave anyway stops with no refund; Keep Generating continues).');
add.push({ sec: 'Make your character', pre: 'Valid Create my character form', act: 'Tap Generate and look at the generating screen', exp: '「This usually takes about 1 minute.」 under the attribute chips; X stays enabled; 「Cancel」 under the Generating button', prio: 'P2', ref: rWait, notes: PMONLY });
add.push({ sec: 'Make your character', pre: 'Character generating', act: 'Tap 「Cancel」, then 「Leave anyway」', exp: '「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」; Leave anyway stops it; Credit Details keeps the charge with no refund row', prio: 'P2', ref: rWait, notes: PMONLY });
add.push({ sec: 'Make your character', pre: 'Character generating', act: 'Tap X, then 「Keep Generating」', exp: 'The same dialog appears; Keep Generating closes it and the character finishes', prio: 'P3', ref: rWait, notes: PMONLY });
const rTimeout = req('PM:pm-update-9 (10/16 定案)', 'After 5 minutes a character generation shows 「We couldn\'t create your character」/「This is taking longer than expected. Send us feedback and our support team will check your credits.」 with Close (back to the form, input kept) and Send Feedback (AI Issues tab, prefilled feature, issue text with the time, prompt and e-mail).');
add.push({ sec: 'Make your character', pre: 'Character generation still running after 5 minutes', act: 'Wait for the dialog, then tap 「Close」', exp: '「We couldn\'t create your character」/「This is taking longer than expected. Send us feedback and our support team will check your credits.」 with Close / Send Feedback; Close returns to Make your character with the description and settings kept', prio: 'P2', ref: rTimeout, notes: PMONLY, needs: ['slow-generation'] });
add.push({ sec: 'Make your character', pre: 'Timeout dialog shown', act: 'Tap 「Send Feedback」 and read the form (do not submit)', exp: 'Feedback opens on 「AI Issues」 with AI Feature Name 「AI Mini Drama • Character generation」, the issue 「My character took too long to generate and didn\'t finish, but my credits were used. Please help me check. Time: {date & time}」, the description as the prompt, and the e-mail filled in', prio: 'P3', ref: rTimeout, notes: PMONLY, needs: ['slow-generation'] });
const rMulti = req('PM:pm-update-9 (10/16)', 'Finish your characters while generating shows 「Creating {n} characters...」 and the time hint, X and Cancel ask 「Stop and lose your credits?」 (Leave anyway stops the unfinished characters and keeps finished ones, no refund), and after 5 minutes 「We couldn\'t create your characters」 with Send Feedback naming {n} characters.');
add.push({ sec: 'Characters', pre: 'Finish your characters with two characters generating, one already done', act: 'Tap 「Cancel」, then 「Leave anyway」', exp: '「Stop and lose your credits?」 appears; the finished character is kept, the unfinished one stops; no refund for it in Credit Details', prio: 'P2', ref: rMulti, notes: `${PMONLY}. TC-041 covers the generating title and done copy` });
add.push({ sec: 'Characters', pre: 'Finish your characters still generating after 5 minutes', act: 'Wait for the dialog, then tap 「Send Feedback」 (do not submit)', exp: '「We couldn\'t create your characters」 with Close / Send Feedback; the feedback issue names the number of characters', prio: 'P3', ref: rMulti, notes: PMONLY, needs: ['slow-generation'] });
const rDiscard = req('PM:pm-update-11 §13.23 (10/21)', 'On the character result only Save to library saves to Mine; X, Android back or swipe down asks 「Discard this character?」 (Discard closes, not saved, the slot keeps what it had; Keep stays); the page\'s Discard button closes with no dialog.');
add.push({ sec: 'Make your character', pre: 'Slot already had a look; a new character generated for it', act: 'Tap X, then 「Discard」', exp: 'The result closes; the slot keeps its previous look; the new character is not in Mine', prio: 'P3', ref: rDiscard, notes: `${PMONLY}. TC-134 covers an empty slot` });
add.push({ sec: 'Make your character', pre: '「Discard this character?」 shown', act: 'Tap 「Keep」', exp: 'The dialog closes and the generated character stays on screen', prio: 'P3', ref: rDiscard, notes: PMONLY });
add.push({ sec: 'Make your character', pre: 'Generated character shown', act: 'Tap the page\'s 「Discard」 button', exp: 'The result closes at once with no dialog; the character is not saved to Mine or applied', prio: 'P2', ref: rDiscard, notes: PMONLY });
add.push({ sec: 'Make your character', pre: 'Generated character shown', act: 'Swipe the result down', exp: 'Same as X: 「Discard this character?」 appears', prio: 'P3', ref: rDiscard, notes: PMONLY });
const rExport = req('PM:pm-update-10 (10/20)', 'Export Full Video saves to the photo library; the button shows loading with no dialog; when done the toast reads 「Saved to Photos.」 on iOS.');
add.push({ sec: 'Video', pre: 'Full video finished', act: 'Tap 「Export Full Video」 and wait', exp: 'The button shows loading (no dialog); toast 「Saved to Photos.」; the flattened video is in Photos', prio: 'P2', ref: rExport, notes: PMONLY, needs: ['video'] });
const rSend = req('PM:pm-1002-update §13.2 (10/20)', 'After the user sends, the message is scrolled to the top and the reply generates below without the view following it; ↓ appears when the reply runs past the screen and scrolls smoothly to the bottom.');
add.push({ sec: 'Chat behaviour', pre: 'Chat with several messages', act: 'Send a message and watch while the reply generates', exp: 'The sent message moves to the top of the screen; the reply generates below without the view following it; ↓ appears when it runs past the screen and tapping it scrolls smoothly to the bottom', prio: 'P2', ref: rSend });
const rLen = req('PM:pm-main-flow', 'The Full Video length on the video settings card is 15 s × the number of scenes (90 s for 6 scenes).');
add.push({ sec: 'Video', pre: 'Storyboard finished; count its scenes', act: 'Read 「Full Video」 on the video settings card', exp: 'The length is 15 s × the number of scenes (e.g. 90 sec for 6 scenes, 120 sec for 8)', prio: 'P3', ref: rLen, notes: 'Design frames show 90 sec and 120 sec as examples; answers Q-13' });
const rOnce = req('PM:pm-1002-update §13.1', 'The 「Tap to choose a look for {name}」 hint shows once per user, on the first use of AI Mini Drama.');
add.push({ sec: 'Characters', pre: 'Account that already saw the 「Tap to choose a look for {name}」 hint in an earlier drama', act: 'Start a new drama and pick a look for the first character', exp: 'No hint appears', prio: 'P3', ref: rOnce });

const rModel = req('PM:pm-update-8 (10/16); Req: REQ-026', 'The video model control shows Best / Standard / Fast; the subtitle follows the choice: 「Seedance 2.5 • Sharper motion and richer detail」, 「Seedance 2.0 • Balanced quality for everyday stories」, 「Seedance 2.0 Mini • Quicker results, fewer credits」.');
add.push({ sec: 'Video', pre: 'Video settings card shown', act: 'Tap Standard, then Fast', exp: 'The subtitle changes to 「Seedance 2.0 • Balanced quality for everyday stories」, then 「Seedance 2.0 Mini • Quicker results, fewer credits」', prio: 'P3', ref: rModel, notes: 'PM 10/16 newer than Design (REQ-026)' });
const rChar = req('PM:pm-update-7 (10/16); Req: REQ-026', 'Changing a character in chat: Iris asks which character only when unclear (2–4 option chips); a priced 「Update characters」 card charges one character × count; Generate shows 「Working on it...」, then 「Here\'s your updated cast.」 with a new Story Outline & Characters card and 「Your characters\' looks are updated! Ready to create the storyboard?」 + Create storyboard; leaving asks 「Stop and lose your credits?」; failed characters are refunded (§13.10); after a storyboard the same flow ends with the storyboard offer.');
const CH = 'PM 10/16 newer than Design (REQ-026)';
add.push({ sec: 'Characters', pre: 'Cast set', act: 'Ask in chat 「Can you change one of the characters to look older?」', exp: '「Sure! Which character would you like to change?」 with 2–4 option chips; tapping a chip sends it as a message and the chips disappear', prio: 'P2', ref: rChar, notes: CH });
add.push({ sec: 'Characters', pre: '「Update characters • 1 character」 card shown (TC-045)', act: 'Tap Generate and wait', exp: 'The card disappears and Iris replies 「Working on it...」; then 「Here\'s your updated cast.」 with a new Story Outline & Characters card showing the new look, and 「Your characters\' looks are updated! Ready to create the storyboard?」 with Create storyboard; Credit Details shows the card price charged once', prio: 'P1', ref: rChar, notes: CH });
add.push({ sec: 'Characters', pre: 'Cast set', act: 'Ask in chat to change two characters\' looks', exp: 'The card reads 「Update characters • 2 characters」 and its price is twice one character generation', prio: 'P2', ref: rChar, notes: `${CH}. Credit numbers are binding` });
add.push({ sec: 'Characters', pre: 'Character update generating (「Working on it...」)', act: 'Tap Back', exp: '「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」 with Leave anyway / Keep Generating', prio: 'P2', ref: rChar, notes: CH });
add.push({ sec: 'Characters', pre: 'Storyboard already generated', act: 'Ask in chat to change a character\'s look, then tap Generate on the card', exp: 'Same flow; it ends with 「Your characters\' looks are updated! Ready to create the storyboard?」 and a priced Create storyboard card (a new storyboard is charged again)', prio: 'P2', ref: rChar, notes: CH });
add.push({ sec: 'Characters', pre: 'Character update for two characters, one will fail (Pink › Trip image moderation; record the switch)', act: 'Tap Generate and wait', exp: 'The successful character is updated; the failed one shows 「!」 and its credits are refunded, as in §13.10 (TC-042)', prio: 'P2', ref: rChar, notes: CH });

const newIds: string[] = [];
for (const n of add) {
  const id = `TC-${String(nextTc++).padStart(3, '0')}`;
  newIds.push(id);
  rows.push({ ID: id, Section: n.sec, Precondition: n.pre, Action: n.act, 'Expected Result': n.exp, Priority: n.prio, 'Spec Ref': n.ref, Notes: n.notes ?? '', Change: 'new', 'Change Reason': 'PM Spec 20261021' });
}
if (newIds[14] !== 'TC-346') throw new Error(`TC-034 note expects the once-only row to be TC-346, got ${newIds.at(-1)}`);

// ---------- requirements.md ----------
let out = oldReq
  .replace(/^Spec: .*$/m, 'Spec: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama - PM Spec 20261021.pdf (spec set specs/2026-10-21-2; board notes in specs/2026-10-21-2/extracted/board-notes.md, flow arrows in specs/2026-10-21-2/extracted/arrows.json)')
  .replace(/specs\/2026-10-19\/extracted\/boards\//, 'specs/2026-10-21-2/extracted/boards/');
const qs: [RegExp, string][] = [
  [/^- Q-6 .*$/m, '- Q-6 Withdrawn 2026-10-21: the manual outline editor is not in the 10/16, 10/19 or 10/21 PM spec (it came from older PM versions).'],
  [/^- Q-7 .*$/m, '- Q-7 Withdrawn 2026-10-21: the storyboard text/image-version editor and thumbnail refresh are not in the current PM spec.'],
  [/^- Q-8 .*$/m, '- Q-8 Withdrawn 2026-10-21: separate From Text / From Photo routes are not in the current PM spec.'],
  [/^- Q-9 .*$/m, '- Q-9 Withdrawn 2026-10-21: the aspect-ratio choice is not in the current PM spec.'],
  [/^- Q-10 .*$/m, '- Q-10 Withdrawn 2026-10-21: timeline reorder is not in the current PM spec.'],
  [/^- Q-11 .*$/m, '- Q-11 Withdrawn 2026-10-21: the inspiration replace dialog is not in the current PM spec.'],
  [/^- Q-13 .*$/m, '- Q-13 Answered by the PM main flow: Full Video length = 15 s × scenes (R-for TC-345).'],
];
for (const [re, s] of qs) { if (!re.test(out)) throw new Error(`missing ${re}`); out = out.replace(re, s); }
out = out.replace('(R-for TC-345)', `(${rLen}, TC-345)`);
out = out.replace(/^(- Q-14 .*)$/m, `$1
- Q-15 Decided 2026-10-22 (user): test the PM 10/16 three video models (Best / Standard / Fast = Seedance 2.5 / 2.0 / 2.0 Mini, 6 / 4 / 2 credits per second); the app will follow the PM. Default model still TBD.
- Q-16 Decided 2026-10-22 (user): test the PM 10/16 charged character change in chat (Update characters card → "Here's your updated cast.").
- Q-17 Decided 2026-10-22 (user): the PM 10/20 §13.2 ③ rule applies — new results come as a new message and earlier cards are not updated.`);
const LEDGER_ADD = `| REQ-024 PM-only features are cases | analysis rule (skill pass 7) |
| REQ-025 PM Spec 20261021 | ${newReq.map(l => l.match(/R-\d+/)![0]).join(', ')} |
| REQ-026 decisions Q-15 – Q-17 (2026-10-22) | ${rModel}, ${rChar}; rows TC-045, TC-046, TC-073, TC-079, TC-080 |`;
// requirement texts the decisions replace
const SUPERSEDED: Record<string, string> = {
  'R-038': 'Changed 2026-10-22 (REQ-026): a clear request shows the priced Update characters card instead (see ' + rChar + ').',
  'R-039': 'Changed 2026-10-22 (REQ-026): older cards keep their old images (PM 10/20 §13.2 ③).',
  'R-062': 'Changed 2026-10-22 (REQ-026): the earlier storyboard card is not updated; results come as a new message (PM 10/20 §13.2 ③).',
  'R-068': 'Changed 2026-10-22 (REQ-026): three models Best / Standard / Fast (PM 10/16, see ' + rModel + ').',
  'R-069': 'Changed 2026-10-22 (REQ-026): 6 / 4 / 2 credits per second for Seedance 2.5 / 2.0 / 2.0 Mini.',
};
for (const [id, t] of Object.entries(SUPERSEDED)) {
  const re = new RegExp(`^(- ${id} .*)$`, 'm'); if (!re.test(out)) throw new Error(`no ${id}`);
  out = out.replace(re, `$1 — ${t}`);
}
out = out.replace(/^(\| REQ-021 .*)$/m, `$1\n${LEDGER_ADD}`);
// job-state grid: new cells
const cell = (job: string, col: number, add: string) => {
  const re = new RegExp(`^\\| ${job.replace(/[()/]/g, m => `\\${m}`)} \\|.*$`, 'm');
  const line = out.match(re)?.[0]; if (!line) throw new Error(`no grid row ${job}`);
  const cells = line.split('|'); cells[col + 1] = ` ${cells[col + 1].trim().replace(/^n\/a.*$/, '')}${cells[col + 1].trim().match(/^n\/a/) ? '' : ', '}${add} `.replace(/^ , /, ' ');
  out = out.replace(line, cells.join('|'));
};
// columns: 1 start, 2 success, 3 failure, 4 retry, 5 second failure, 6 partial, 7 stop, 8 leave/return, 9 wait, 10 done
cell('Create my character', 1, newIds[0]); cell('Create my character', 3, newIds[3]); cell('Create my character', 7, `${newIds[1]}, ${newIds[2]}`); cell('Create my character', 9, newIds[0]);
cell('Characters (Generate all / with AI)', 3, newIds[6]); cell('Characters (Generate all / with AI)', 7, newIds[5]);
cell('Download / export', 2, newIds[11]);
cell('Chat revision', 3, newIds[21]); cell('Chat revision', 6, newIds[21]); cell('Chat revision', 7, newIds[19]); cell('Chat revision', 2, newIds[17]); cell("Chat revision", 1, newIds[16]);
out += `\n\n## Added 2026-10-21 — PM Spec 20261021 (16:04)\nPM-only rows carry 「${PMONLY}」 in Notes and change when the Design spec draws them (REQ-024).\n${newReq.join('\n')}\n`;
writeFileSync(join(HERE, 'requirements.md'), out);
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

// ---------- phases.json ----------
const phases = JSON.parse(readFileSync(join(IOS, 'drafts', '20261021-150855', 'phases.json'), 'utf8'));
phases.draft = '20261021-162539';
phases.unavailable['slow-generation'] = 'observability: no fault switch keeps a character generation running for 5 minutes; ask RD for a delay fixture';
add.forEach((n, i) => { if (n.needs?.length) phases.needs[newIds[i]] = n.needs; });
phases.phases.push({ id: 'P6', name: 'PM Spec 20261021', note: 'Rows added for the 10/21 PM spec; changed rows keep their phase.', segments: [
  { id: 'P6-a', name: 'Characters: wait, Cancel, timeout, Discard, hint once', cases: newIds.filter((_, i) => ['Make your character', 'Characters'].includes(add[i].sec)) },
  { id: 'P6-b', name: 'Chat scrolling and video', cases: newIds.filter((_, i) => !['Make your character', 'Characters'].includes(add[i].sec)) },
] });
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(phases, null, 1) + '\n');
const count = (c: string) => rows.filter(r => r.Change === c).length;
console.log(JSON.stringify({ rows: rows.length, new: count('new'), modified: count('modified'), removed: count('removed'), newIds: `${newIds[0]}–${newIds.at(-1)}`, reqs: newReq.length }, null, 1));
