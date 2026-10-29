// Update draft for AI Mini Drama Android: approved v1 (462 rows) → draft 20261027-171228, same spec set (2026-10-21-2).
// User, 2026-10-27 (REQ-046): pull the repo's new rules and redo the Android analysis so the table is up to date with
// the newest spec, then save it and run it on the Xperia. What changes the table (skill: step 3, standing inputs):
// - Figma frames newer than the PDF (Reading the spec, step 8): figma-findings.json, rows written below by hand;
// - run findings of the partial round A1 (standing input 5): run-findings.json from the review of results.csv and
//   observations.md, applied as written there;
// - tickets (standing input 2): the eCL pull of 2026-10-27 17:15 has 3 new open Android tickets and 2 closed ones;
// - the new rules of fa6cffd (REQ-036 / REQ-037): no spec agent cross-check in the analysis, so rows it added keep
//   their place but cite the coverage pass that states their rule; ledger IDs of the Android entries renumbered
//   (REQ-036 → REQ-042, REQ-037 → REQ-043) after the merge.
// Re-runnable: node library/ai-mini-drama/android/drafts/20261027-171228/build-draft.ts
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const AND = join(HERE, '..', '..');
const DRAFT = '20261027-171228';
const PREV = join(AND, 'drafts', '20261027-142629');
type Row = Record<string, string>;

const approved: Row[] = readTable(join(AND, 'cases.csv'));
if (approved.length !== 462) throw new Error(`expected v1 with 462 rows, found ${approved.length}`);
let rows: Row[] = approved.map(r => ({ ...r, Change: 'unchanged', 'Change Reason': '' }));
const byId = () => new Map(rows.map(r => [r.ID, r]));
const get = (id: string) => { const r = byId().get(id); if (!r) throw new Error(`missing ${id}`); return r; };
const modify = (id: string, why: string, f: (r: Row) => void) => {
  const r = get(id); const before = JSON.stringify(r); f(r);
  if (JSON.stringify(r) !== before) { if (r.Change === 'unchanged') r.Change = 'modified'; r['Change Reason'] = [r['Change Reason'], why].filter(Boolean).join('; '); }
};
let next = Math.max(...approved.map(r => +r.ID.slice(3))) + 1;
const NEW: string[] = [];
const add = (after: string, r: Omit<Row, 'ID' | 'Change' | 'Change Reason'>, why: string) => {
  const id = `TC-${next++}`;
  const i = rows.findIndex(x => x.ID === after); if (i < 0) throw new Error(`anchor ${after} missing`);
  let j = i + 1; while (j < rows.length && NEW.includes(rows[j].ID) && rows[j].Change === 'new') j++;
  rows.splice(j, 0, { ID: id, ...r, Change: 'new', 'Change Reason': why } as Row); NEW.push(id); return id;
};
const needs: Record<string, string[]> = {};

// ---------- ledger renumbering after the merge with fa6cffd ----------
const REN: Record<string, string> = { 'REQ-036': 'REQ-042', 'REQ-037': 'REQ-043' };
for (const r of rows) for (const c of ['Precondition', 'Action', 'Expected Result', 'Notes'] as const)
  if (/REQ-03[67]\b/.test(r[c])) modify(r.ID, 'Ledger IDs renumbered after the merge (REQ-036 → REQ-042, REQ-037 → REQ-043)', x => { x[c] = x[c].replace(/REQ-03[67]\b/g, m => REN[m]); });

// ---------- rows the spec agent cross-check had added: cite the pass that states the rule (REQ-036 / REQ-037) ----------
const PASS: Record<string, string> = {
  'TC-402': 'Coverage pass 3 (discard on close: every button of the dialog and every way to close)',
  'TC-403': 'Coverage pass 8 (sheet exits × states)',
  'TC-404': 'Coverage pass 1 (the confirming edge of a dialog)',
  'TC-405': 'Coverage pass 2 (each job\'s own start/loading state)',
};
for (const [id, pass] of Object.entries(PASS)) modify(id, 'Source note: the rule comes from the coverage pass, not the spec agent (REQ-036)', r => {
  r.Notes = r.Notes.replace(/Spec agent [^;.]*(?:\([^)]*\))?\.?/g, '').replace(/^[;\s.]+|[;\s]+$/g, '');
  r.Notes = [pass, r.Notes].filter(Boolean).join('. ');
});

// ---------- tickets (eCL pull 2026-10-27 17:15) ----------
modify('TC-030', 'Ticket DRA262610P0102 closed', r => { r.Notes = r.Notes.split(/;\s*/).filter(p => !p.includes('DRA262610P0102')).join('; '); });
modify('TC-455', 'Ticket DRA262610P0191 closed: the regression row retires (rule 3)', r => { r.Change = 'removed'; });
add('TC-079', { Section: 'Video', Precondition: 'A drama at 「Choose your video settings」, the card scrolled into view', Action: 'Tap Best, then Standard, then Fast', 'Expected Result': 'Each tap only updates the card (selection and price); the chat stays where it is, with no jump to the outline or storyboard and back', Priority: 'P3', 'Spec Ref': 'R-068, R-141', Notes: 'Android ticket DRA262610P0296 (NewCreated, UI)' }, 'New Android ticket DRA262610P0296 (rule 3)');
add('TC-506', { Section: 'Video', Precondition: 'A finished drama with 6 clips open on 「Here\'s your drama.」', Action: 'Tap play and let the drama play to the end, watching the clip strip during clips 5 and 6', 'Expected Result': 'The strip scrolls with playback so the clip that is playing is always visible and highlighted', Priority: 'P3', 'Spec Ref': 'R-290, R-141', Notes: 'Android ticket DRA262610P0297 (NewCreated, UI)' }, 'New Android ticket DRA262610P0297 (rule 3)');
needs[NEW.at(-1)!] = ['video'];
modify('TC-103', 'New Android ticket DRA262610P0299 kept in Notes: the spec contradicts its expectation (REQ-043)', r => {
  r.Notes = [r.Notes, 'Android ticket DRA262610P0299 (NewCreated, UX) expects a swapped actor to keep the Create storyboard card with no new assistant turn; the spec draws 「Characters updated! Regenerate the storyboard to match?」 after a character change, so the spec governs this row (REQ-043)'].filter(Boolean).join('; ');
});

// ---------- run findings of round A1 (standing input 5) ----------
type Finding = { source: string; kind: 'new-row' | 'modify-row' | 'no-change'; row?: string; section?: string; precondition?: string; action?: string; expected?: string; priority?: string; spec_ref?: string; why: string; missed_by?: string; needs?: string[] };
const findings: Finding[] = existsSync(join(HERE, 'run-findings.json')) ? JSON.parse(readFileSync(join(HERE, 'run-findings.json'), 'utf8')) : [];
const addedByFinding: string[] = [], modifiedByFinding: string[] = [];
for (const f of findings) {
  if (f.kind === 'new-row') {
    const id = add(f.row!, { Section: f.section!, Precondition: f.precondition!, Action: f.action!, 'Expected Result': f.expected!, Priority: f.priority ?? 'P2', 'Spec Ref': f.spec_ref!, Notes: `Run A1 finding ${f.source}${f.missed_by && f.missed_by !== 'not a table gap' ? `; missed by ${f.missed_by}` : ''}` }, `Run finding ${f.source} (standing input 5)`);
    if (f.needs?.length) needs[id] = f.needs;
    addedByFinding.push(`${id} (${f.source})`);
  } else if (f.kind === 'modify-row') {
    if (get(f.row!).Change === 'removed') continue;
    // Fields the review wrote as an instruction ("(unchanged…)", "Replace X with Y") are applied below, not copied.
    const literal = (v?: string) => v && !/^\(unchanged|^Replace /.test(v) ? v : undefined;
    modify(f.row!, `Run finding ${f.source}: ${f.why}`, r => {
      const p = literal(f.precondition), a = literal(f.action), e = literal(f.expected);
      if (p) r.Precondition = p;
      if (a) r.Action = a;
      if (e) r['Expected Result'] = e;
      if (f.spec_ref) r['Spec Ref'] = [...new Set([...r['Spec Ref'].split(/,\s*/), ...f.spec_ref.split(/,\s*/)])].join(', ');
      if (/^Replace 'Debug controls/.test(f.precondition ?? '')) { r.Precondition = r.Precondition.replace(/Debug controls › /g, 'fault switch (iOS Pink; none on Android 16.8) › '); (needs[r.ID] ??= []).push('fault-injection'); }
    });
    modifiedByFinding.push(`${f.row} (${f.source})`);
  }
}

// The picker's title is the Design's 「Choose Character」 / 「Choose for {name}」 (run finding on TC-033; the PM mockup
// says 「Change Characters」, and Design wins: reading steps 4 and 6 took it from the PM).
for (const r of rows) for (const c of ['Precondition', 'Action', 'Expected Result'] as const)
  if (r[c].includes('Change Characters') && r.Change !== 'removed') modify(r.ID, 'Picker title is the Design\'s 「Choose Character」 (run finding on TC-033)', x => { x[c] = x[c].replace(/「Change Characters」/g, '「Choose Character」').replace(/Change Characters/g, 'Choose Character'); });

// ---------- Figma frames newer than the PDF (Reading the spec, step 8): two PM boards of 10/22 ----------
// PM 4422:2 「10/22 update：Storyboard／Video 分兩段，有 Generate 的都不提供暫停」 (§13.24) and PM 4418:2 「10/22 update：
// Export Full Video 匯出中各元件狀態」, read 2026-10-27 (board-notes 「PM — Figma only」). Newer than PM Spec 20261021, so
// they govern (pass 7); RD still has to confirm parts (PM Open questions #20), noted on each row.
const W24 = 'PM 10/22 §13.24 (Figma 4422:2), newer than PM 10/21; RD to confirm (PM Open questions #20)';
const PREP = 'Leave while we\'re preparing?';
const SB_BODY = '「Your storyboard will start soon. If you leave now, we\'ll have to prepare it again when you come back.」';
const V_BODY = '「Your video will start soon. If you leave now, we\'ll have to prepare it again when you come back.」';
const SB1 = 'Storyboard stage ①: 「Preparing your scenes…」 skeleton card shown (Iris writing the prompt, nothing charged yet)';
const V1 = 'Video stage ①: 「Advancing the mini drama production.」 skeleton card shown (nothing charged yet)';
const F24 = (r: Row, p: Partial<Row>) => { Object.assign(r, p); r.Notes = [r.Notes.replace(/;?\s*PM 10\/22 §13\.24[^;]*/g, ''), W24].filter(Boolean).join('; '); };
const WHY24 = 'PM 10/22 §13.24 (Figma only): storyboard and video run in two stages; the storyboard 「Stop and lose your credits?」 dialog is void';
modify('TC-377', WHY24, r => F24(r, { 'Expected Result': 'The card disappears and no user bubble is added; 「I\'ll create a storyboard - give me a moment...」 then the 「Preparing your scenes…」 skeleton card; the credit pill does not change until the card turns into 「Creating your storyboard…」, then drops by the price (one Credit Details charge)', 'Spec Ref': 'R-279, R-317, R-320' }));
add('TC-377', { Section: 'Storyboard', Precondition: 'Create storyboard tapped; storyboard in stage ① or ②', Action: 'Look at the input bar while the storyboard is prepared and created', 'Expected Result': 'No ■ stop or pause control anywhere in the chat; the input bar shows only the mic', Priority: 'P2', 'Spec Ref': 'R-315', Notes: `${W24}; the RD build had a ■ stop button, to be removed` }, WHY24);
modify('TC-061', WHY24, r => F24(r, { Precondition: SB1, 'Expected Result': `「${PREP}」/${SB_BODY} with 「Leave anyway」 (red) and 「Stay」; no 「Stop and lose your credits?」`, 'Spec Ref': 'R-318' }));
modify('TC-062', WHY24, r => F24(r, { Precondition: `「${PREP}」 shown in storyboard stage ①`, Action: 'Tap 「Stay」', 'Expected Result': 'The dialog closes; preparing goes on and the storyboard finishes', 'Spec Ref': 'R-318' }));
modify('TC-063', WHY24, r => F24(r, { Precondition: `${SB1}; credit pill read`, Action: 'Tap Back, 「Leave anyway」, then reopen the drama from History', 'Expected Result': 'Stage ① restarts by itself on return: no second Generate tap, and the storyboard is charged only once, when it reaches 「Creating your storyboard…」 (Credit Details: one charge, no charge for the interrupted ①)', 'Spec Ref': 'R-319' }));
modify('TC-398', WHY24, r => F24(r, { Precondition: SB1, 'Expected Result': `「${PREP}」/${SB_BODY} with 「Leave anyway」 (red) and 「Stay」; Stay closes the dialog and preparing goes on`, 'Spec Ref': 'R-306, R-318, R-309' }));
modify('TC-399', WHY24, r => F24(r, { Precondition: `${SB1}; 「${PREP}」 opened with system back; credit pill read`, 'Expected Result': 'The landing page opens; reopening the drama restarts stage ① by itself (no second Generate tap) and the storyboard is charged once, only at 「Creating your storyboard…」', 'Spec Ref': 'R-306, R-319, R-309' }));
modify('TC-359', WHY24, r => F24(r, { Precondition: SB1, Action: 'Tap History, then 「Stay」; tap New chat, then 「Stay」; tap the credit pill, then 「Leave anyway」', 'Expected Result': `Each tap shows 「${PREP}」/${SB_BODY} with Leave anyway / Stay; Stay keeps preparing; Leave anyway on the credit pill opens My Credits`, 'Spec Ref': 'R-262, R-318' }));
const sb2 = add('TC-359', { Section: 'Storyboard', Precondition: 'Storyboard stage ②: 「Creating your storyboard…」 card shown (charged)', Action: 'Tap Back; later reopen the drama from History', 'Expected Result': 'No dialog; toast 「We\'ll keep making your storyboard. Find it in History.」; the storyboard keeps generating and is there on return, charged once', Priority: 'P1', 'Spec Ref': 'R-320, R-321', Notes: W24 }, WHY24);
add(sb2, { Section: 'Storyboard', Precondition: 'Storyboard stage ②: 「Creating your storyboard…」 card shown', Action: 'Swipe PowerDirector away in Recents, wait a minute, open the app and the drama from History', 'Expected Result': 'The storyboard finished in the background: Storyboard Result and Storyboard Preview are there; charged once', Priority: 'P2', 'Spec Ref': 'R-321', Notes: W24 }, WHY24);
modify('TC-294', WHY24, r => F24(r, { Precondition: 'Chat storyboard update in stage ① (preparing; nothing charged yet)', 'Expected Result': `「${PREP}」/${SB_BODY} with Leave anyway (red) / Stay; no 「Stop and lose your credits?」`, 'Spec Ref': 'R-158, R-318' }));
// Video: stage ① is new, stage ② is what the rows already check.
modify('TC-405', WHY24, r => F24(r, { 'Expected Result': 'The video settings card turns in place into the skeleton card 「Advancing the mini drama production.」 after 「I\'ll create a video - give me a moment...」 (pill unchanged), then 「Making your video…」 (the pill drops by the price only now), until 「Here\'s your drama.」 with the video card replaces it', 'Spec Ref': 'R-311, R-316, R-320' }));
const v1 = add('TC-405', { Section: 'Video', Precondition: V1, Action: 'Tap Back, then 「Stay」; tap Back again, then 「Leave anyway」, then reopen the drama from History', 'Expected Result': `Each Back shows 「${PREP}」/${V_BODY} with 「Leave anyway」 (red) and 「Stay」; Stay keeps preparing; after Leave anyway, reopening restarts stage ① by itself with no second Generate tap and no extra charge`, Priority: 'P1', 'Spec Ref': 'R-318, R-319', Notes: W24 }, WHY24);
const v1b = add(v1, { Section: 'Video', Precondition: V1, Action: 'Use system back (Android back gesture or button), then 「Stay」; tap History, then 「Stay」; tap New chat, then 「Stay」; tap the credit pill, then 「Leave anyway」', 'Expected Result': `Each exit shows 「${PREP}」 with the video body; Stay keeps preparing; Leave anyway on the credit pill opens My Credits`, Priority: 'P2', 'Spec Ref': 'R-306, R-318', Notes: W24 }, WHY24);
for (const id of ['TC-082', 'TC-400', 'TC-361']) modify(id, WHY24, r => F24(r, { Precondition: r.Precondition.replace(/^Video generating/, 'Video stage ②: 「Making your video…」 card shown (charged)') }));
modify('TC-431', 'R-051 now holds only the character part of the leave dialog (PM 10/22 §13.24)', r => { if (!r['Spec Ref'].includes('R-051')) r['Spec Ref'] = `R-051, ${r['Spec Ref']}`; });
// Export Full Video in progress (PM 4418:2).
const WE = 'PM 10/22 export states (Figma 4418:2), newer than PM 10/20; RD to confirm background export';
const WHYE = 'PM 10/22 (Figma only): Export Full Video in-progress states, leaving and failure';
modify('TC-343', WHYE, r => { r['Expected Result'] = 'While exporting: a spinner in the middle of the preview, play button hidden, video paused; Full Edit, Export Full Video and the download icon disabled (40%); scene thumbnails still switch the preview. Done: everything restored, toast 「Saved to Gallery.」, the flattened video is in the Gallery'; r['Spec Ref'] = 'R-249, R-324, R-309'; r.Notes = [r.Notes, WE].filter(Boolean).join('; '); });
add('TC-343', { Section: 'Video', Precondition: 'Full video finished; Export Full Video just tapped (spinner in the preview)', Action: 'Use system back (Android back gesture or button), then wait on the AI Mini Drama landing page', 'Expected Result': 'Back works during the export; the export continues in the background and 「Saved to Gallery.」 shows on the page the user is on; the video is in the Gallery', Priority: 'P2', 'Spec Ref': 'R-323, R-306', Notes: `${WE}. If RD keeps the export in the foreground, Back shows 「Stop exporting?」/「Your video won't be saved.」 (Keep exporting / Stop) instead` }, WHYE);
const ef = add(NEW.at(-1)!, { Section: 'Video', Precondition: 'Full video finished; the export will fail (needs a failure fixture)', Action: 'Tap 「Export Full Video」', 'Expected Result': 'Toast 「Couldn\'t save your video. Try again.」; spinner gone, play button and every control restored; Export Full Video can be tapped again', Priority: 'P2', 'Spec Ref': 'R-325', Notes: WE }, WHYE);
needs[ef] = ['fault-injection'];
needs[v1] = ['video']; needs[v1b] = ['video'];

writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);
writeFileSync(join(HERE, 'build-out.json'), JSON.stringify({ NEW, addedByFinding, modifiedByFinding, needs }, null, 1) + '\n');
console.log(JSON.stringify({ rows: rows.length, active: rows.filter(r => r.Change !== 'removed').length, new: NEW.length,
  modified: rows.filter(r => r.Change === 'modified').length, removed: rows.filter(r => r.Change === 'removed').map(r => r.ID) }));

// ---------- requirements ----------
let req = readFileSync(join(AND, 'requirements.md'), 'utf8').trimEnd();
const swap = (re: RegExp, s: string | ((m: string, ...g: string[]) => string)) => { if (!re.test(req)) throw new Error(`missing ${re}`); req = req.replace(re, s as any); };
req = req.replace(/REQ-03[67]\b/g, m => REN[m]);
swap(/(- R-311 [^\n]*?)Missed by the iOS analysis \(coverage pass 2, the video job's start\/loading cell\); found by the spec agent cross-check on 2026-10-27\./,
  '$1Missed by the iOS analysis (coverage pass 2, the video job\'s start/loading cell; pass sharpened 2026-10-27). Changed 2026-10-27: PM 10/22 §13.24 adds the stage cards (R-316, R-320).');
const CH = (id: string, note: string) => swap(new RegExp(`(- ${id} [^\\n]*)`), `$1 — Changed 2026-10-27: ${note}`);
CH('R-051', 'for the storyboard the 「Stop and lose your credits?」 dialog is void (PM 10/22 §13.24): stage ① asks 「Leave while we\'re preparing?」 (R-318), stage ② shows a toast (R-321); characters keep this dialog.');
swap(/(- R-052 [^\n]*)/, '$1 — NOT TESTABLE: replaced 2026-10-27 by R-319 (PM 10/22 §13.24: an interrupted stage ① restarts by itself, charged once).');
CH('R-158', 'PM 10/22 §13.24 names the chat storyboard update among the two-stage jobs: stage ① asks 「Leave while we\'re preparing?」 (R-318), stage ② shows a toast (R-321).');
CH('R-262', 'for the storyboard and the chat storyboard update, PM 10/22 §13.24 replaces this dialog with 「Leave while we\'re preparing?」 in stage ① (R-318) and a toast in stage ② (R-321); the character update keeps it (Q-A3).');
CH('R-307', 'for the storyboard part, PM 10/22 §13.24 applies (R-318, R-321); characters keep this dialog.');
CH('R-249', 'PM 10/22 export board moves the loading into the preview and disables the controls (R-324).');
CH('R-279', 'PM 10/22 §13.24: the credits are charged only when stage ② starts (R-320).');
swap(/### Exit × stage\n[\s\S]*?(?=\n### Error classes)/, `### Exit × stage
Every top exit in every stage (coverage pass 8, REQ-030), with Android's system back (Design 1016 ①, PM 0930). PM 10/22
§13.24 splits the storyboard and the video into stage ① (preparing, a dialog) and stage ② (sent, a toast). Cells name
the rows, or n/a with the reason.

| Stage | Back | System back | History | New chat | Credit pill |
|---|---|---|---|---|---|
| Empty chat | TC-381 | TC-394 | n/a (spec silent) | n/a (spec silent) | n/a (spec silent) |
| Outline generating | TC-025, TC-027, TC-028 | TC-395, TC-396 | TC-026, TC-027 | TC-357 | TC-357, TC-358 |
| Outline saved, nothing generating | TC-029 | TC-397 | TC-360 | TC-360 | TC-360 |
| Character generating (Make your character) | n/a (sheet: X and Cancel, TC-333, TC-334) | n/a (sheet; Q-A1) | n/a (sheet covers the chat) | n/a (sheet covers the chat) | n/a (sheet covers the chat) |
| Storyboard stage ① (preparing) | TC-061, TC-062, TC-063 | TC-398, TC-399 | TC-359 | TC-359 | TC-359 |
| Storyboard stage ② (creating) | ${sb2} | n/a (same toast rule as ${sb2}, R-321) | n/a (same toast rule as ${sb2}, R-321) | n/a (same toast rule as ${sb2}, R-321) | n/a (same toast rule as ${sb2}, R-321) |
| Chat storyboard update, stage ① | TC-294 | n/a (same dialog as TC-398) | n/a (same dialog as TC-359) | n/a (same dialog as TC-359) | n/a (same dialog as TC-359) |
| Character update generating | TC-351 | n/a (same short-job dialog as TC-431; Q-A3) | n/a (same short-job dialog; Q-A3) | n/a (same short-job dialog; Q-A3) | n/a (same short-job dialog; Q-A3) |
| Video stage ① (preparing) | ${v1} | ${v1b} | ${v1b} | ${v1b} | ${v1b} |
| Video stage ② (making) | TC-082, TC-083 | TC-400 | TC-361 | TC-361 | TC-361 |
`);
req += `

## Added 2026-10-27 (2) — PM 10/22 boards found in Figma (REQ-046)
Reading the spec, step 8 (Figma frames newer than the PDF) found two PM boards dated 10/22 that the PM PDF of this set
(20261021) lacks: 「10/22 update：Storyboard／Video 分兩段，有 Generate 的都不提供暫停」 (§13.24, node 4422:2) and 「10/22
update：Export Full Video 匯出中各元件狀態」 (node 4418:2). Newer than PM 10/21, so they govern (pass 7); RD still has to
confirm the charge moment, the automatic restart of stage ① and background completion (PM Open questions #20).
- R-315 [PM:figma 10/22 §13.24 4422:2; Req: REQ-046] After a Generate (Create storyboard, Generate Video, a storyboard update in chat, a video regeneration) the chat has no pause or stop: the input bar shows no ■ stop, only the mic.
- R-316 [PM:figma 10/22 §13.24 4422:2] Video stage ①: after 「I'll create a video - give me a moment...」 the video settings card turns in place into the skeleton card 「Advancing the mini drama production.」; nothing is charged yet.
- R-317 [PM:figma 10/22 §13.24 4422:2] Storyboard stage ①: after 「I'll create a storyboard - give me a moment...」 the skeleton card 「Preparing your scenes…」 shows; nothing is charged yet.
- R-318 [PM:figma 10/22 §13.24 4422:2] In stage ① every exit (←, the credit pill, New chat, History, system back) asks 「Leave while we're preparing?」 with the video body 「Your video will start soon. If you leave now, we'll have to prepare it again when you come back.」 or the storyboard body 「Your storyboard will start soon. If you leave now, we'll have to prepare it again when you come back.」 and 「Leave anyway」 (red) / 「Stay」.
- R-319 [PM:figma 10/22 §13.24 4422:2] After Leave anyway, a swiped-away app or backgrounding in stage ①, returning to the chat restarts stage ① by itself: no second Generate tap and no extra charge.
- R-320 [PM:figma 10/22 §13.24 4422:2] Stage ② starts when the job is sent out and is charged only then; its card reads 「Making your video…」 / 「Creating your storyboard…」.
- R-321 [PM:figma 10/22 §13.24 4422:2] Leaving in stage ② shows no dialog, only the toast (storyboard: 「We'll keep making your storyboard. Find it in History.」; video: R-071); the job finishes even if the app is swiped away, and the result is there on return.
- R-322 [PM:figma 10/22 §13.24 4422:2] The storyboard's 「Stop and lose your credits?」 dialog is void (storyboard and storyboard update in chat); character generation keeps its dialog. Walked by: TC-061, TC-398.
- R-323 [PM:figma 10/22 export 4418:2] During Export Full Video, ← and Android system back stay enabled: leaving keeps the export running in the background and 「Saved to Gallery.」 shows on whatever page the user is on.
- R-324 [PM:figma 10/22 export 4418:2] While exporting: a spinner in the middle of the preview, play button hidden and the video paused; Full Edit, Export Full Video (label unchanged) and the preview's download icon disabled at 40% opacity; scene thumbnails stay tappable and only switch the preview; everything is restored when the export ends.
- R-325 [PM:figma 10/22 export 4418:2] A failed export shows the toast 「Couldn't save your video. Try again.」, restores everything and lets the user tap Export Full Video again.

### Open questions (2026-10-27)
- Q-A3 PM 10/22 §13.24 lists the two-stage jobs (storyboard, video, storyboard update in chat, video regeneration) and
  keeps the dialog for character generation; is the character update in chat (Update characters • Generate) a
  two-stage job too? TC-351 keeps 「Stop and lose your credits?」 until PM says.
`;
swap(/(\| REQ-043 [^\n]*\n)/, `$1| REQ-046 Android redo after the repo update (2026-10-27) | R-315 – R-325 (PM 10/22 boards in Figma) |\n`);
swap(/(### Hidden clauses\n[\s\S]*?\|---\|---\|---\|---\|\n)/, `$1| R-320 | charged only when stage ② starts | the credit pill and Credit Details before and after 「Creating your storyboard…」 / 「Making your video…」; logcat CreditSystemManager | TC-377, TC-405 |\n| R-319 | an interrupted stage ① costs nothing extra | Credit Details: one charge per job after the restart | TC-063, TC-399, ${v1} |\n`);
writeFileSync(join(HERE, 'requirements.md'), req + '\n');
copyFileSync(join(PREV, 'annotation-trace.json'), join(HERE, 'annotation-trace.json'));

// ---------- run setup (phases.json): round A2 ----------
// A2 runs every active row except the unchanged rows A1 already recorded as Pass or Fail (their results stand; A1 is
// an earlier run on the plan page). Changed and new rows run where their stage falls (REQ-033); A1's segment letter
// gives each row its stage, a new row takes its anchor's.
const prevPhases = JSON.parse(readFileSync(join(PREV, 'phases.json'), 'utf8'));
const A1 = prevPhases.phases.find((p: any) => p.id === 'A1');
const stage: Record<string, string> = {};
for (const s of A1.segments) for (const c of s.cases) stage[c] = s.id.slice(3, 4);
const anchorOf = (id: string) => { const i = rows.findIndex(r => r.ID === id); for (let j = i - 1; j >= 0; j--) if (stage[rows[j].ID]) return rows[j].ID; throw new Error(`no stage for ${id}`); };
for (const r of rows) if (!stage[r.ID]) stage[r.ID] = stage[anchorOf(r.ID)];
const a1 = readTable(join(AND, 'runs', '2026-10-27-a1-full', 'results.csv'));
const done = new Set(a1.filter(r => ['Pass', 'Fail'].includes(r.Result)).map(r => r.ID));
const active = rows.filter(r => r.Change !== 'removed');
const carried = active.filter(r => r.Change === 'unchanged' && done.has(r.ID)).map(r => r.ID);
const inA2 = active.filter(r => !carried.includes(r.ID));
const STAGES: [string, string][] = A1.segments.reduce((m: [string, string][], s: any) => { const k = s.id.slice(3, 4); if (!m.some(x => x[0] === k)) m.push([k, s.name.replace(/ \(\d\/\d\)$/, '')]); return m; }, []);
const segments: { id: string; name: string; cases: string[] }[] = [];
for (const [k, name] of STAGES) {
  const cs = inA2.filter(r => stage[r.ID] === k).map(r => r.ID); if (!cs.length) continue;
  const parts = Math.ceil(cs.length / 40), size = Math.ceil(cs.length / parts);
  for (let i = 0; i < parts; i++) segments.push({ id: parts > 1 ? `A2-${k}${i + 1}` : `A2-${k}`, name: parts > 1 ? `${name} (${i + 1}/${parts})` : name, cases: cs.slice(i * size, (i + 1) * size) });
}
const allNeeds: Record<string, string[]> = {};
for (const r of active) { const n = [...(prevPhases.needs[r.ID] ?? []), ...(needs[r.ID] ?? [])]; if (n.length) allNeeds[r.ID] = [...new Set(n)]; }
const unavailable = { ...prevPhases.unavailable };
A1.merged_into = 'A2';
writeFileSync(join(HERE, 'phases.json'), JSON.stringify({
  draft: DRAFT, current: ['A2'], needs: allNeeds, unavailable,
  phases: [{ ...A1, note: `${A1.note} Stopped by the user mid A1-b2 (2026-10-27 17:09) for the table update; its Pass / Fail results on unchanged rows stand.` },
    { id: 'A2', name: 'Android round 2: table v2 on the Xperia 10 III (REQ-046)', round: true,
      note: `Every active row of table v2 except the ${carried.length} unchanged rows A1 recorded as Pass or Fail, by journey stage; changed and new rows run where their stage falls. Signed in to the user's test account (REQ-045). Preflight before A2-g: one template drama straight to a Seedance 2.0 preview, then run-log gate video pass|fail.`,
      origin: Object.fromEntries(inA2.map(r => [r.ID, r.Change === 'new' ? 'A2' : 'A1'])), segments }],
}, null, 1) + '\n');

// ---------- update-plan.md ----------
const ch = (c: string) => rows.filter(r => r.Change === c);
writeFileSync(join(HERE, 'update-plan.md'), `# Update plan — ai-mini-drama / android: approved v1 → draft ${DRAFT}

## Spec files
- Unchanged: the spec set specs/2026-10-21-2 (Design, MX, PM Spec 20261021); no newer files were supplied.
- New: two PM boards dated 10/22 that are only in Figma (Reading the spec, step 8, run 2026-10-27): 「10/22 update：
  Storyboard／Video 分兩段，有 Generate 的都不提供暫停」 (§13.24, 4422:2) and 「10/22 update：Export Full Video 匯出中各元件狀態」
  (4418:2). The Design file has nothing newer than its 1016 frames.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-315 – R-325 | new | — | PM 10/22: two-stage storyboard / video (no stop, 「Leave while we're preparing?」 in stage ①, toast in stage ②, charge at stage ②, automatic restart) and the Export Full Video in-progress states, leaving and failure |
| R-051, R-158, R-262, R-307 | changed | 「Stop and lose your credits?」 for the storyboard and the chat storyboard update | stage ① dialog / stage ② toast; characters keep the dialog |
| R-052 | replaced | reopening stops at the storyboard offer and charges again | R-319: stage ① restarts by itself, charged once |
| R-249, R-279, R-311 | changed | loading on the button; charge on Generate; one status line | loading in the preview (R-324); charge at stage ② (R-320); the stage cards (R-316) |
| Q-A3 | new | — | is the character update in chat a two-stage job? |

## Case changes
- New (${NEW.length}): ${NEW.join(', ')}, each right after the row it extends
- Modified (${ch('modified').length}): ${ch('modified').map(r => `${r.ID}`).join(', ')} (reasons in Change Reason: PM 10/22 two-stage and export rows; ledger IDs renumbered after the merge; ticket notes; run findings)
- Removed (${ch('removed').length}): TC-455 (ticket DRA262610P0191 closed)
- Unchanged: ${ch('unchanged').length}

## Found by the analysis
- Reading the spec, step 8 (Figma newer than the PDF): the two PM 10/22 boards above → R-315 – R-325.
- Tickets (eCL pull 2026-10-27 17:15): 3 new open, 2 closed: DRA262610P0296 and P0297 new rows; P0299 in TC-103's Notes
  (the spec contradicts it, REQ-043); P0102 dropped from TC-030's Notes; TC-455 (P0191) retired.
- Run findings of round A1 (standing input 5): ${addedByFinding.length} new rows (${addedByFinding.join(', ') || 'none'}), ${modifiedByFinding.length} modified (${modifiedByFinding.join(', ') || 'none'}); details in run-findings.json.
- New rules of fa6cffd (REQ-036 / REQ-037): no spec agent comparison in the analysis; TC-402 – TC-405 now cite the coverage
  pass that states their rule. Android ledger entries renumbered REQ-042 – REQ-045 after the merge.
- Skill fixes for what the run showed the analysis missed (REQ-037): screen titles from the Design (reading step 4);
  retry results and premature "done" messages (pass 2); option lists (pass 3); random picks from a pool (pass 4); a
  failed job as an exit stage (pass 8); a second platform's draft checks every step against that platform's controls
  (step 0).

## Not added (value check)
- The iOS-only Photos permission prompt of the export board: Android has none stated.
- 「Stop exporting?」 / 「Your video won't be saved.」: only if RD can't export in the background; noted on the export row.

## PM-only rows
- Unchanged; the new PM 10/22 rows are PM-only too (the Design file draws neither board).

## Run setup (phases.json)
- Round A2 (REQ-046): ${inA2.length} rows in ${segments.length} segments (${segments.map(s => `${s.id} ${s.cases.length}`).join(', ')}).
  The ${carried.length} unchanged rows A1 already recorded as Pass or Fail keep those results. A1 is closed (merged into A2).

## Questions for PM
- Q-A1 System back on Make your character while it generates.
- Q-A2 Is there a 30-chat Pro tier on Android?
- Q-A3 Is the character update in chat a two-stage job (PM 10/22 §13.24)?

## Questions for you
- None.
`);
console.log(JSON.stringify({ a2: inA2.length, carried: carried.length, segments: segments.map(s => `${s.id}:${s.cases.length}`) }));
