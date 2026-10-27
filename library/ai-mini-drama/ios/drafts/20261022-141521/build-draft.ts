// Build draft 20261022-141521 on the same spec set (2026-10-21-2), from the approved v6 table.
// Manager feedback (2026-10-22, REQ-031): every spec agent case the casebook does not cover is added when it is derived
// from the spec files. `node scripts/spec-agent-gaps.ts ai-mini-drama ios --draft 20261022-141521` listed 31 gaps
// (spec agent 250ad306 against mapping 20261022c): 6 from the spec files (added here), 18 exploratory charters from a
// user coverage request and 7 RD build-note points (not from the spec; one is already covered by TC-344).
// This script writes the rows, requirements, phases, the decisions in spec-agent-gaps.json and update-plan.md.
// Re-runnable: node library/ai-mini-drama/ios/drafts/20261022-141521/build-draft.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const IOS = join(HERE, '..', '..');
type Row = Record<string, string>;
const approved: Row[] = readTable(join(IOS, 'cases.csv'));
const rows: Row[] = approved.map(r => ({ ...r, Change: 'unchanged', 'Change Reason': '' }));

let out = readFileSync(join(IOS, 'requirements.md'), 'utf8').trimEnd();
const maxR = Math.max(...[...out.matchAll(/\bR-(\d{3,})\b/g)].map(m => +m[1]));
if (maxR !== 264) throw new Error(`expected R-264 as the highest v6 requirement, found R-${maxR}`);
const R = { crop: 'R-265', remote: 'R-266' };
const newReq = [
  `- ${R.crop} [PM:pm-main-flow (Make your character, note beside the reference photo: 「只送 crop 後的圖」); Req: REQ-031] Only the cropped reference image is sent for character generation: what the Crop step cut away is not part of the image the character is generated from.`,
  `- ${R.remote} [MX ① Free chat times, PDRM MX.pdf version A (Firebase); Req: REQ-031] Each tier's daily chat allowance comes from Firebase Remote Config: when the configured allowance changes, the limit dialog appears on the send after the new allowance.`,
];

let nextTc = Math.max(...approved.map(r => +r.ID.slice(3))) + 1;
if (nextTc !== 364) throw new Error(`expected TC-364 as the next case, got TC-${nextTc}`);
const SA = (id: string) => `Spec agent ${id} (REQ-031)`;
const add = [
  { key: 'noStt', sa: '1012-PM-CAPTIONS-NO-STT', sec: 'Captions', pre: 'Drama created with 「No captions」; Log stage timings ON', act: 'Generate the full video; when it finishes, pull the logs and read this video\'s tool calls', exp: 'The video has no captions, and the log shows no speech-to-text (STT) call for it', prio: 'P3', ref: 'R-086', notes: 'PM §13.13 (10/6): 「user 選 No captions 時不跑STT」. TC-097 checks the video; this row checks STT did not run. If no log line marks STT on a captioned video either, record Blocked (observability) and ask RD which line does', needs: ['video'] },
  { key: 'retrySeg', sa: '1012-PM-CAPTION-RETRY-SEGMENTS', sec: 'Captions', pre: 'Captions failed on some segments only (「Captions couldn\'t be added. Try again」); Log stage timings ON', act: 'Tap Try again; when the captions appear, pull the logs and compare the STT calls before and after the retry', exp: 'The retry sends only the segments that failed to STT again; the captions appear all at once when every segment has succeeded', prio: 'P3', ref: 'R-087', notes: 'PM §13.13 (10/6): 「只重跑失敗的段落，全部成功才把字幕一次放上去」. No fault switch makes STT fail (TC-298) → Blocked (observability) until RD gives a fixture', needs: ['video', 'stt-failure'] },
  { key: 'crop', sa: '1012-PM-CROP-UPLOAD', sec: 'Make your character', pre: 'Make your character open; a reference photo with an easily recognized object near one edge', act: 'Add the photo, crop the edge object away in Crop and tap ✓, then Generate; afterwards pull the logs and open the stored reference image (ai-mini-drama-reference-photos)', exp: 'The reference image used for the character shows only the cropped area: the cropped-away object is not in it', prio: 'P2', ref: R.crop, notes: 'PM main flow note 「只送 crop 後的圖」 (missed by the first reading; confirmed by a render 2026-10-22). If the pulled logs hold no reference image, record Blocked (observability) and ask RD for the uploaded image', needs: [] },
  { key: 'pro', sa: 'MX-PRO-SEND-DEBIT-001', sec: 'Credits and limits', pre: 'Tier Pro (Pink › IAP › Status › Pro); remaining chats known (finite allowance)', act: 'Open a template, then send one typed message, then tap one task button (e.g. Generate)', exp: 'Each of the three uses exactly one of the Pro daily chats (allowance 30)', prio: 'P2', ref: 'R-142', notes: 'MX ① version A. TC-218 runs the same check on any tier; each tier gets its own row (REQ-031). 9999 Developer Server limit → Blocked (chat-count)', needs: ['chat-count'] },
  { key: 'proPlus', sa: 'MX-PROPLUS-SEND-DEBIT-001', sec: 'Credits and limits', pre: 'Tier Pro+ (Pink › IAP › Status › Pro+); remaining chats known (finite allowance)', act: 'Open a template, then send one typed message, then tap one task button (e.g. Generate)', exp: 'Each of the three uses exactly one of the Pro+ daily chats (allowance 100)', prio: 'P2', ref: 'R-142', notes: 'MX ① version A. TC-218 runs the same check on any tier; each tier gets its own row (REQ-031). 9999 Developer Server limit → Blocked (chat-count)', needs: ['chat-count'] },
  { key: 'remote', sa: 'FIXTURE-0924-S002-B016', sec: 'Credits and limits', pre: 'RD has changed the Firebase Remote Config daily chat allowance for the tier under test (e.g. Free → 3); app relaunched', act: 'Send chats until the limit dialog appears, counting each send', exp: 'The limit dialog appears on the send after the new allowance (the 4th for 3), not at the spec default (11th)', prio: 'P3', ref: R.remote, notes: 'MX ① version A: allowance is remote-configured (Firebase). The spec does not say when a change takes effect, so relaunch first. Needs RD to change Remote Config → Blocked (remote-config)', needs: ['remote-config'] },
];
const ids: Record<string, string> = {};
const needs: Record<string, string[]> = {};
for (const n of add) {
  const id = `TC-${String(nextTc++).padStart(3, '0')}`;
  ids[n.key] = id;
  if (n.needs.length) needs[id] = n.needs;
  rows.push({ ID: id, Section: n.sec, Precondition: n.pre, Action: n.act, 'Expected Result': n.exp, Priority: n.prio, 'Spec Ref': n.ref, Notes: `${n.notes}. ${SA(n.sa)}`, Change: 'new', 'Change Reason': `Spec agent case derived from the spec files, left out before as low value (manager, REQ-031)` });
}

const swap = (re: RegExp, s: string) => { if (!re.test(out)) throw new Error(`missing ${re}`); out = out.replace(re, s); };
swap(/^(\| REQ-029 .*)$/m, `$1\n| REQ-031 Spec agent cases derived from the spec are added (manager, 2026-10-22) | ${R.crop}, ${R.remote}; rows ${Object.values(ids).join(', ')} |`);
// Job states: the caption retry gains the segment check; Create my character gains the crop check.
swap(/^(\| Captions \|[^|]*\|[^|]*\|[^|]*\|[^|]*)\|/m, `$1, ${ids.retrySeg} |`);
swap(/^(\| Create my character \|[^|]*\|[^|]*)\|/m, `$1, ${ids.crop} |`);
out += `

## Added 2026-10-22 (2) — spec agent cases derived from the spec (REQ-031)
The spec agent cross-check (\`spec-agent-gaps.json\` in this draft) found six cases from the spec files that the table
did not have; the earlier comparison had left them out as low value. Per the manager (REQ-031) they are rows now.
${ids.noStt} and ${ids.retrySeg} check R-086 / R-087 through the app log, ${ids.pro} and ${ids.proPlus} give R-142 a row per tier.
${newReq.join('\n')}
`;
writeFileSync(join(HERE, 'requirements.md'), out + '\n');
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

const phases = JSON.parse(readFileSync(join(IOS, 'drafts', '20261022-113603', 'phases.json'), 'utf8'));
phases.draft = '20261022-141521';
Object.assign(phases.needs, needs);
phases.unavailable['remote-config'] = 'test-data: changing the Firebase Remote Config daily chat allowance needs RD; the Developer Server limit is 9999';
phases.phases.push({
  id: 'P8', name: 'Spec agent cases from the spec (2026-10-22, REQ-031)',
  note: 'Rows added from the spec agent cross-check; most are parked (chat-count, remote-config, stt-failure).',
  segments: [
    { id: 'P8-a', name: 'Crop reference and per-tier chat use (no video)', cases: [ids.crop, ids.pro, ids.proPlus, ids.remote] },
    { id: 'P8-b', name: 'Captions through the log (video)', cases: [ids.noStt, ids.retrySeg] },
  ],
});
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(phases, null, 1) + '\n');

// Decisions on every gap of the cross-check (scripts/spec-agent-gaps.ts keeps them on a re-run).
const gapsPath = join(HERE, 'spec-agent-gaps.json');
const gapsFile = JSON.parse(readFileSync(gapsPath, 'utf8'));
const BUILD = 'not from the spec: RD build note of TR261006-0055 (189463), passed on 189463 and 189631, so retired as a build check (standing input 3)';
const decide: Record<string, string> = Object.fromEntries(add.map(n => [n.sa, `added ${ids[n.key]}`]));
Object.assign(decide, {
  'TR-SEND-SCROLL-BOTTOM-001': 'covered TC-344 (the spec agent rewrote it to PM 10/21 §13.2; the mapping still said low value)',
  'TR-DETAIL-DOWNLOAD-SPINNER-001': `${BUILD}; TC-089 checks the spinner on the video download, TC-331 the failure`,
  'TR-FORMAT-DIVIDER-001': BUILD,
  'TR-MANAGE-NO-SHIFT-001': BUILD,
  'TR-UNSET-CAST-PICKER-001': `${BUILD}; TC-033 and TC-039 check the unset-cast flow`,
  'TR-VIDEO-REPEATED-PAUSE-001': BUILD,
  'TR-VIDEO-TAP-PAUSE-001': BUILD,
});
for (const g of gapsFile.gaps) {
  if (decide[g.id]) g.decision = decide[g.id];
  else if (g.source.kind === 'request' && /^EXP-/.test(g.id)) g.decision = 'not from the spec: exploratory charter from the user\'s 2026-10-07 coverage-expansion request in the spec agent (no expected result); its branches are rows already';
  delete g.carried_from;
}
const undecided = gapsFile.gaps.filter((g: { decision: string }) => !g.decision).map((g: { id: string }) => g.id);
if (undecided.length) throw new Error(`gaps without a decision: ${undecided.join(', ')}`);
writeFileSync(gapsPath, JSON.stringify(gapsFile, null, 2) + '\n');

type G = { id: string; title: string; claim: string; source: { kind: string; ref: string }; decision: string };
const gaps: G[] = gapsFile.gaps;
const line = (g: G) => `- ${g.id} [${g.source.kind}: ${g.source.ref}] ${g.claim.length > 110 ? g.claim.slice(0, 107) + '…' : g.claim} → ${g.decision}`;
const exp = gaps.filter(g => /^EXP-/.test(g.id));
writeFileSync(join(HERE, 'update-plan.md'), `# Update plan — ai-mini-drama / ios: approved v6 → draft 20261022-141521

## Spec files
- Unchanged (spec set specs/2026-10-21-2). The PM main-flow note 「只送 crop 後的圖」 was missed by the first reading
  (low-confidence OCR); confirmed by a render and added to board-notes.

## Why this draft
- Manager feedback (2026-10-22, REQ-031): spec agent cases the casebook does not cover are added whenever they are
  derived from the spec files. The 10/22 comparison had left 31 out as "low value"; 6 of them come from the spec.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| ${R.crop} | new | — | Only the cropped reference image is sent (PM main flow) |
| ${R.remote} | new | — | The daily chat allowance follows Firebase Remote Config (MX ①) |

## Case changes
- New (${add.length}): ${add.map(n => `${ids[n.key]} ${n.sa}`).join(' · ')}
- Modified: none · Removed: none · Unchanged: ${approved.length}

## Not added (value check)
- None of the spec-derived gaps. The 25 other gaps are not from the spec files (see the cross-check below).

## Spec agent cross-check
Spec agent ${gapsFile.spec_agent.commit.slice(0, 8)} (${gapsFile.spec_agent.cases} iOS cases) against ${gapsFile.mapping}; ${gaps.length} cases not covered before this draft.
From the spec files (${gaps.filter(g => g.source.kind === 'spec').length}, all added):
${gaps.filter(g => g.source.kind === 'spec').map(line).join('\n')}
RD build notes (${gaps.filter(g => g.source.kind === 'build').length}):
${gaps.filter(g => g.source.kind === 'build').map(line).join('\n')}
User coverage request, exploratory charters (${exp.length}): not from the spec: no expected result, branches already rows.
${exp.map(g => `- ${g.id} ${g.title}`).join('\n')}

## Run setup (phases.json)
- New phase P8: P8-a ${[ids.crop, ids.pro, ids.proPlus, ids.remote].join(', ')} (no video); P8-b ${[ids.noStt, ids.retrySeg].join(', ')} (video).
- Parked: ${ids.pro}, ${ids.proPlus} (chat-count), ${ids.remote} (remote-config, new), ${ids.retrySeg} (stt-failure).

## Questions for you
- None.
`);
console.log(JSON.stringify({ rows: rows.length, ids, counts: rows.reduce((c: Record<string, number>, r) => (c[r.Change] = (c[r.Change] ?? 0) + 1, c), {}) }));
