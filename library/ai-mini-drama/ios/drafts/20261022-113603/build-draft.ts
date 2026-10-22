// Build draft 20261022-113603 on the same spec set (2026-10-21-2).
// Base: approved v4 (history/v4.csv, 354 rows). v5 was saved from a stale review page of draft 20261021-162539 and
// undid the 2026-10-22 answers (REQ-028); the user asked to rebuild from v4 (2026-10-22), so TC-051 returns to its v4
// text and TC-354 / TC-355 come back. On top of v4, the changes from the 2026-10-22 spec agent comparison:
// - REQ-029: Design 1016 frames found only in Figma (not in the Design PDF). Leave dialogs follow PM 10/21; the
//   Design adds the credit-pill exit and each exit's landing page; 「Free • {n} left」 replaces the older MX frame.
// - The scene-video 4xxx / 5xxx rules of the PM error board, which the earlier analysis missed.
// - REQ-030: the new "Exit × stage" and "Error classes" grids in requirements.md.
// Change marks are against the approved table (v5). Re-runnable:
//   node library/ai-mini-drama/ios/drafts/20261022-113603/build-draft.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const IOS = join(HERE, '..', '..');
type Row = Record<string, string>;
const v4: Row[] = readTable(join(IOS, 'history', 'v4.csv'));
const approved: Row[] = readTable(join(IOS, 'cases.csv'));
const A = new Map(approved.map(r => [r.ID, r]));
const FIELDS = ['Section', 'Precondition', 'Action', 'Expected Result', 'Priority', 'Spec Ref', 'Notes'];
const RESTORE = 'Restored from v4: v5 was saved from a stale review page and undid the 2026-10-22 answers (REQ-028)';

const rows: Row[] = v4.map(r => {
  const a = A.get(r.ID);
  if (!a) return { ...r, Change: 'new', 'Change Reason': RESTORE };
  const same = FIELDS.every(f => (a[f] ?? '') === (r[f] ?? ''));
  return { ...r, Change: same ? 'unchanged' : 'modified', 'Change Reason': same ? '' : RESTORE };
});

let out = readFileSync(join(IOS, 'history', 'v4-requirements.md'), 'utf8').trimEnd();
const maxR = Math.max(...[...out.matchAll(/\bR-(\d{3,})\b/g)].map(m => +m[1]));
if (maxR !== 256) throw new Error(`expected R-256 as the highest v4 requirement, found R-${maxR}`);
const R = {
  v4xx: 'R-257', v5xx: 'R-258', freeLeft: 'R-259', freeUsed: 'R-260',
  exitOutline: 'R-261', exitShort: 'R-262', exitSaved: 'R-263', exitVideo: 'R-264',
};
const NAV = 'DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages)';
const newReq = [
  `- ${R.v4xx} [PM:pm-error-handling Video (4xxx), 10/13 update; Req: REQ-030] A scene video that fails with 4xxx shows 「Couldn't create video ⓘ」 with the refund text; ⓘ opens 「Couldn't generate this video」/「Your credits have been refunded. The description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit the description to try again.」 with Got it.`,
  `- ${R.v5xx} [PM:pm-error-handling Video (5xxx), 10/13 update; Req: REQ-030] A scene video that fails with 5xxx shows 「Couldn't create video」 with the refund text and no ⓘ, and opens no dialog.`,
  `- ${R.freeLeft} [DS:figma 1016_support free trial 4847:34277; Req: REQ-029] While free storyboard tries remain, the Create storyboard card shows the price struck through (◆15) and 「Free • {n} left」, {n} = tries left. Replaces R-099's older MX-board wording.`,
  `- ${R.freeUsed} [DS:figma 1016_support free trial 4847:34277; Req: REQ-029] Once the free tries are used up, the card shows only the price (◆15): no strikethrough, no 「Free」.`,
  `- ${R.exitOutline} [PM:pm-main-flow §3.2/§3.3, Bug 0018; ${NAV}; Req: REQ-029] While the outline is generating, every top exit (Back, History, New chat, credit pill) shows 「Leave this chat?」/「Your story outline isn't ready yet, so this chat won't be saved.」 with Leave anyway / Stay; Stay keeps the chat; Leave anyway saves nothing and opens the exit's page (home, Recent Task, a new room, My Credits).`,
  `- ${R.exitShort} [PM:pm-1002-update §13.6, pm-update-4; ${NAV}; Req: REQ-029] During a short job (storyboard, chat image update, character update), every top exit shows 「Stop and lose your credits?」/「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」 with Leave anyway / Keep Generating; Leave anyway stops the job and opens the exit's page.`,
  `- ${R.exitSaved} [PM:pm-main-flow Bug 0012; ${NAV}; Req: REQ-029] A chat already saved to History with nothing generating leaves through any top exit with no dialog and opens the exit's page.`,
  `- ${R.exitVideo} [PM:pm-update-4 (10/13 video leave); ${NAV}; Req: REQ-029] During video generation every top exit leaves with no dialog, shows 「We'll keep making your video. Find it in History.」 and opens the exit's page; the video keeps generating.`,
];

// TC-114: Design 1016 「Free • {n} left」 replaces the older MX-board wording.
const t114 = rows.find(r => r.ID === 'TC-114')!;
Object.assign(t114, {
  Precondition: 'Account still has free storyboard tries',
  Action: 'Look at the 「Create storyboard」 card; create one storyboard, then look at the next card',
  'Expected Result': 'The price ◆15 is struck through with 「Free • {n} left」, {n} = tries left; the next card shows one fewer',
  'Spec Ref': `R-099, ${R.freeLeft}`,
  Notes: 'Design 1016_support free trial (Figma 4847:34277), newer than the MX-board frame 「Free for your first 3 creations - {n} left.」; PM says nothing different (REQ-029). Needs an account with free tries → Blocked',
  Change: 'modified',
  'Change Reason': 'Figma-only Design 1016 frame found by the 2026-10-22 spec agent comparison (REQ-029)',
});

let nextTc = Math.max(...v4.map(r => +r.ID.slice(3))) + 1;
const CMP = 'Found by the 2026-10-22 spec agent comparison';
const add = [
  { sec: 'Credits and limits', pre: 'Free storyboard tries used up (the shared test account)', act: 'Look at the 「Create storyboard」 card', exp: 'Only the price shows (e.g. ◆15): no strikethrough and no 「Free」', prio: 'P3', ref: R.freeUsed, notes: 'Design 1016_support free trial (Figma 4847:34277)', why: `${CMP} (REQ-029, Figma-only Design frame)`, needs: [] },
  { sec: 'Story outline', pre: 'Outline generating', act: 'Tap New chat, then 「Stay」; tap the credit pill, then 「Stay」', exp: 'Each tap shows 「Leave this chat?」/「Your story outline isn\'t ready yet, so this chat won\'t be saved.」 with Leave anyway / Stay; Stay closes it, the chat stays and the outline still arrives', prio: 'P2', ref: R.exitOutline, notes: 'Exits from Design 1016_Chat navigation; dialog copy from PM 10/21, which is newer (REQ-029). TC-025 – TC-028 cover Back and History', why: `${CMP} (REQ-029)`, needs: [] },
  { sec: 'Story outline', pre: 'Outline generating for a new idea', act: 'Tap the credit pill, then 「Leave anyway」; then open History', exp: 'My Credits opens; History has no entry for this idea', prio: 'P2', ref: R.exitOutline, notes: 'Landing page from Design 1016_Chat navigation (REQ-029)', why: `${CMP} (REQ-029)`, needs: [] },
  { sec: 'Storyboard', pre: 'Storyboard generating', act: 'Tap History, then 「Keep Generating」; tap New chat, then 「Keep Generating」; tap the credit pill, then 「Leave anyway」', exp: 'Each tap shows 「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」 with Leave anyway / Keep Generating; Keep Generating keeps it running; Leave anyway stops it and opens My Credits', prio: 'P2', ref: R.exitShort, notes: 'PM 10/21 §13.6 governs the dialog; Design 1016 shows 「Leave this chat?」 but is older (REQ-029). TC-061 covers Back', why: `${CMP} (REQ-029)`, needs: [] },
  { sec: 'Story outline', pre: 'Outline finished, nothing generating', act: 'Tap History; reopen the drama; tap the credit pill; go back; tap New chat', exp: 'No dialog each time; History opens Recent Task with this drama listed, the credit pill opens My Credits, New chat opens a new empty chat', prio: 'P2', ref: R.exitSaved, notes: 'PM: saved chats leave with no dialog; Design 1016 shows 「Leave this chat?」 but is older (REQ-029). TC-029 covers Back', why: `${CMP} (REQ-029)`, needs: [] },
  { sec: 'Video', pre: 'Video generating', act: 'Tap History; reopen the drama; tap the credit pill; go back; tap New chat', exp: 'No dialog each time; 「We\'ll keep making your video. Find it in History.」 shows on leaving; Recent Task, My Credits and a new empty chat open in turn; the video keeps generating', prio: 'P2', ref: R.exitVideo, notes: 'PM governs; Design 1016 shows 「Leave this chat?」 but is older (REQ-029). TC-082 covers Back', why: `${CMP} (REQ-029)`, needs: ['video'] },
  { sec: 'Video errors', pre: 'One scene video fails with 4xxx (Pink › Inject failure status = moderation_blocked, that beat; record the switch)', act: 'Look at the failed clip, then tap ⓘ', exp: 'The clip card shows 「Couldn\'t create video ⓘ」 with the refund text; ⓘ opens 「Couldn\'t generate this video」/「Your credits have been refunded. The description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit the description to try again.」 with Got it', prio: 'P2', ref: R.v4xx, notes: 'PM error board, 10/13 update. Card text: the §13.7 copy table gives 「Couldn\'t create video. The description may not meet our terms of service. Your credits have been refunded. Edit the description and try again.」; record which one shows', why: `${CMP}: PM error-board rule the earlier analysis missed (REQ-030)`, needs: ['video'] },
  { sec: 'Video errors', pre: 'One scene video fails with 5xxx (Pink › Inject failure status = tool_error, that beat; record the switch)', act: 'Look at the failed clip and tap where ⓘ would be', exp: 'The clip card shows 「Couldn\'t create video」 with the refund text and no ⓘ; no dialog opens', prio: 'P2', ref: R.v5xx, notes: 'PM error board, 10/13 update (5xxx cards drop the ⓘ). §13.7 card text: 「Couldn\'t create video. Our service is busy right now. Your credits have been refunded. Try again later.」', why: `${CMP}: PM error-board rule the earlier analysis missed (REQ-030)`, needs: ['video'] },
];
const ids: Record<string, string> = {};
const needs: Record<string, string[]> = {};
for (const [i, n] of add.entries()) {
  const id = `TC-${String(nextTc++).padStart(3, '0')}`;
  ids[['used', 'oStay', 'oCredit', 'short', 'saved', 'video', 'v4xx', 'v5xx'][i]] = id;
  if (n.needs.length) needs[id] = n.needs;
  rows.push({ ID: id, Section: n.sec, Precondition: n.pre, Action: n.act, 'Expected Result': n.exp, Priority: n.prio, 'Spec Ref': n.ref, Notes: n.notes, Change: 'new', 'Change Reason': n.why });
}

const swap = (re: RegExp, s: string) => { if (!re.test(out)) throw new Error(`missing ${re}`); out = out.replace(re, s); };
swap(/^- (R-099 .*)$/m, `- $1 — Changed 2026-10-22 (REQ-029): the Design 1016 frame shows 「Free • {n} left」 on the Create storyboard card (see ${R.freeLeft}, ${R.freeUsed}).`);
swap(/^(\| REQ-028 .*)$/m, `$1\n| REQ-029 Figma 1016 frames; PM 10/21 governs older Design frames (2026-10-22) | ${Object.values(R).filter(r => r !== R.v4xx && r !== R.v5xx).join(', ')}; row TC-114 |`);
// Job states: scene-video failure cell gains the 4xxx / 5xxx rows.
swap(/^(\| Scene video \(clip\) \|[^|]*\|[^|]*\|[^|]*)\|/m, `$1, ${ids.v4xx}, ${ids.v5xx} |`);
out += `

## Added 2026-10-22 — Figma 1016 frames and the spec agent comparison
Three Design frames dated 1016 are in Figma but not in the Design PDF of this set (\`specs/2026-10-21-2/extracted/figma-frames.json\`,
board-notes 「Design — Figma only」). They are older than PM Spec 20261021, so the PM governs where they differ (REQ-029).
${newReq.join('\n')}

### Exit × stage
Every top exit in every stage (coverage pass 8, REQ-030). iOS has no system back. Cells name the rows, or n/a with the reason.

| Stage | Back | History | New chat | Credit pill |
|---|---|---|---|---|
| Empty chat | TC-186 | n/a (spec silent) | TC-199 | n/a (spec silent) |
| Outline generating | TC-025, TC-027, TC-028 | TC-026, TC-027 | TC-200, ${ids.oStay} | ${ids.oStay}, ${ids.oCredit} |
| Outline saved, nothing generating | TC-029 | ${ids.saved} | ${ids.saved} | ${ids.saved} |
| Character generating (Make your character) | n/a (sheet: X and Cancel, TC-333, TC-334) | n/a (sheet covers the chat) | n/a (sheet covers the chat) | n/a (sheet covers the chat) |
| Storyboard generating | TC-061, TC-063 | ${ids.short} | ${ids.short} | ${ids.short} |
| Chat image update generating | TC-294 | n/a (same short-job dialog as ${ids.short}) | n/a (same short-job dialog as ${ids.short}) | n/a (same short-job dialog as ${ids.short}) |
| Character update generating | TC-351 | n/a (same short-job dialog as ${ids.short}) | n/a (same short-job dialog as ${ids.short}) | n/a (same short-job dialog as ${ids.short}) |
| Video generating | TC-082, TC-083 | ${ids.video} | ${ids.video} | ${ids.video} |

### Error classes
Each job's failure by class (coverage pass 2, REQ-030): card copy, ⓘ, dialog and refund.

| Job | 4xxx | 5xxx | 6xxx |
|---|---|---|---|
| Outline | TC-031 | TC-030 | n/a (spec silent) |
| Characters (Generate with AI) | TC-042 | TC-043 | n/a (spec silent) |
| Create my character | n/a (spec silent) | TC-137 | n/a (spec silent) |
| Storyboard image | TC-067 | TC-068 | n/a (spec silent) |
| Storyboard Preview | n/a (TTS / STT failures instead: TC-078, TC-299) | n/a (TTS / STT failures instead: TC-078, TC-299) | n/a (spec silent) |
| Scene video | ${ids.v4xx} | ${ids.v5xx} | TC-095 |
| Whole video | n/a (spec silent) | TC-094 | TC-095 |
`;
writeFileSync(join(HERE, 'requirements.md'), out + '\n');
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

const phases = JSON.parse(readFileSync(join(IOS, 'drafts', '20261022-085742', 'phases.json'), 'utf8'));
phases.draft = '20261022-113603';
Object.assign(phases.needs, needs);
phases.phases.push({
  id: 'P7', name: 'Figma 1016 frames and error classes (2026-10-22)',
  note: 'Rows from the 2026-10-22 spec agent comparison; TC-114 keeps its phase.',
  segments: [
    { id: 'P7-a', name: 'Leave exits and free tries (no video)', cases: [ids.used, ids.oStay, ids.oCredit, ids.short, ids.saved] },
    { id: 'P7-b', name: 'Video: leave exits and 4xxx / 5xxx clips', cases: [ids.video, ids.v4xx, ids.v5xx] },
  ],
});
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(phases, null, 1) + '\n');

const restored = rows.filter(r => r['Change Reason'] === RESTORE).map(r => r.ID);
const newIds = Object.values(ids);
writeFileSync(join(HERE, 'update-plan.md'), `# Update plan — ai-mini-drama / ios: approved v5 → draft 20261022-113603

## Spec files
- Unchanged (spec set specs/2026-10-21-2). New: three Design frames dated 1016 that are in Figma but not in the Design
  PDF (\`extracted/figma-frames.json\`, board-notes 「Design — Figma only」), read through Figma MCP on 2026-10-22.

## Base
- v5 was saved from a stale review page (draft 20261021-162539) and undid the 2026-10-22 answers. Rebuilt from v4 at
  the user's request (2026-10-22): ${restored.join(', ')} restored.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-099 | changed | MX board 「Free for your first 3 creations - {n} left.」 | Design 1016 「Free • {n} left」 (${R.freeLeft}, ${R.freeUsed}) |
| ${R.v4xx}, ${R.v5xx} | new | — | Scene video 4xxx ⓘ dialog; 5xxx card without ⓘ (PM error board, missed before) |
| ${R.exitOutline} – ${R.exitVideo} | new | — | Every top exit per stage: PM dialogs, Design 1016 exits and landing pages |
| R-255, R-256 | restored | removed by v5 | Q-12 / Q-14 answers (REQ-028) |

## Case changes
- New (${newIds.length}): ${ids.used} free tries used up · ${ids.oStay} New chat / credit pill → Stay while the outline generates ·
  ${ids.oCredit} credit pill → Leave anyway → My Credits · ${ids.short} History / New chat / credit pill during the storyboard ·
  ${ids.saved} exits from a saved chat (no dialog) · ${ids.video} exits during the video (toast) · ${ids.v4xx} scene video 4xxx ·
  ${ids.v5xx} scene video 5xxx
- Restored from v4 (${restored.length}): ${restored.join(', ')}
- Modified (1): TC-114 「Free • {n} left」 (Design 1016)
- Removed: none · Unchanged: ${rows.filter(r => r.Change === 'unchanged').length}

## Not added (value check)
- Chat image update and character update: the History / New chat / credit-pill exits show the same short-job dialog as
  ${ids.short}; not repeated (Exit × stage grid).
- Design 1016 「Quality」 / 「Length」 labels on the video settings card: older than PM 10/21, which keeps 「Model •
  Seedance」 (R-253, REQ-026).

## Run setup (phases.json)
- New phase P7: P7-a ${[ids.used, ids.oStay, ids.oCredit, ids.short, ids.saved].join(', ')} (no video); P7-b ${[ids.video, ids.v4xx, ids.v5xx].join(', ')} (need a video).

## Questions for you
- None.
`);
console.log(JSON.stringify({ rows: rows.length, ids, restored, counts: rows.reduce((c: Record<string, number>, r) => (c[r.Change] = (c[r.Change] ?? 0) + 1, c), {}) }));
