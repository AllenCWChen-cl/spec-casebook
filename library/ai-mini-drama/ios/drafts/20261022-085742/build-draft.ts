// Build draft 20261022-085742: approved table v3 (352 rows) + the user's answers of 2026-10-22 (REQ-028):
// Q-12 — the newer source wins: the Design "Exceed word limit" frame (1005_Update) is newer than PM §13.11 (10/2) for
// the character description; Q-14 — add the 「Create video anyways」 check (PM E4). Same spec set (2026-10-21-2).
// Re-runnable; overwrites draft.csv, requirements.md and phases.json in this folder.
//   node library/ai-mini-drama/ios/drafts/20261022-085742/build-draft.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const IOS = join(HERE, '..', '..');
type Row = Record<string, string>;
const approved: Row[] = readTable(join(IOS, 'cases.csv'));
let out = readFileSync(join(IOS, 'requirements.md'), 'utf8').trimEnd();
let nextR = Math.max(...[...out.matchAll(/\bR-(\d{3,})\b/g)].map(m => +m[1])) + 1;
let nextTc = Math.max(...approved.map(r => +r.ID.slice(3))) + 1;
const newReq: string[] = [];
const req = (src: string, text: string) => { const id = `R-${String(nextR++).padStart(3, '0')}`; newReq.push(`- ${id} [${src}; Req: REQ-028] ${text}`); return id; };

const rows: Row[] = approved.map(r => ({ ...r, Change: 'unchanged', 'Change Reason': '' }));
const t051 = rows.find(r => r.ID === 'TC-051')!;
t051['Expected Result'] = 'All 1,050 characters are kept; the counter shows red 「1050/1000」 and 「You\'ve reached the 1,000-character limit.」 shows, in the field and in the expanded editor; Generate is disabled';
t051.Notes = 'Design 1005_Update "Exceed word limit" (newer than PM §13.11 of 10/2, which cut the text at 1,000); the idea, scene and scene-video inputs keep the PM rule (no newer Design frame)';
t051.Change = 'modified';
t051['Change Reason'] = 'Q-12 decided (user, 2026-10-22): the newer Design frame (10/05) wins over PM §13.11 (10/02)';

const rOver = req('DS:ds-characters 1005_Update "Exceed word limit"', 'The character description keeps text over 1,000 characters with a red count (e.g. 「1120/1000」) and 「You\'ve reached the 1,000-character limit.」 in the field and the expanded editor; Generate is disabled until the text is back under the limit.');
const rAnyway = req('PM:pm-1002-update E4, pm-error-handling', 'When the Storyboard Preview fails, its card shows 「Couldn\'t create the storyboard preview. Your credits have been refunded. Try again.」 with Retry ◆1, and a 「Create video anyways」 button sits below the card.');
const add = [
  { sec: 'Make your character', pre: 'Character description over 1,000 characters (TC-051), required fields set', act: 'Delete text until it is under 1,000 characters', exp: 'The counter is no longer red, the limit message disappears and Generate becomes available', prio: 'P2', ref: rOver, notes: 'Recovery as in PM §13.11; the Design frame shows only the over-limit state' },
  { sec: 'Storyboard Preview', pre: 'Storyboard finished but its preview failed (as in TC-078)', act: 'Look under the Storyboard Preview card, then tap 「Create video anyways」', exp: 'A 「Create video anyways」 button sits below the failed preview card and its Retry ◆1; tapping it goes on to the video without a preview (record what opens, e.g. 「Choose your video settings」)', prio: 'P2', ref: rAnyway, notes: 'PM E4 frame; where the button leads is not drawn. The failure copy is checked in TC-078' },
];
const newIds = add.map(n => {
  const id = `TC-${String(nextTc++).padStart(3, '0')}`;
  rows.push({ ID: id, Section: n.sec, Precondition: n.pre, Action: n.act, 'Expected Result': n.exp, Priority: n.prio, 'Spec Ref': n.ref, Notes: n.notes, Change: 'new', 'Change Reason': 'User answers of 2026-10-22 (Q-12, Q-14)' });
  return id;
});

const swap = (re: RegExp, s: string) => { if (!re.test(out)) throw new Error(`missing ${re}`); out = out.replace(re, s); };
swap(/^- Q-12 .*$/m, `- Q-12 Decided 2026-10-22 (user, REQ-028): the newer source wins. The Design "Exceed word limit" frame (1005_Update) is newer than PM §13.11 (10/2): the character description keeps text over 1,000, shows the red count and message, and disables Generate (TC-051, ${newIds[0]}). The idea, scene and scene-video inputs keep §13.11 (no newer Design frame).`);
swap(/^- Q-14 .*$/m, `- Q-14 Closed 2026-10-22 (REQ-028): only the PM E4 frame exists — a failed Storyboard Preview offers 「Create video anyways」 (${newIds[1]}). The opposing rule came from an older PM this casebook never received.`);
swap(/^- (R-043 .*)$/m, `- $1 — Changed 2026-10-22 (REQ-028): over-limit text is kept and Generate disabled (see ${rOver}).`);
swap(/^(\| REQ-026 .*)$/m, `$1\n| REQ-028 decisions Q-12, Q-14 (2026-10-22) | ${rOver}, ${rAnyway}; row TC-051 |`);
swap(/^(\| Storyboard Preview \|[^|]*\|[^|]*\|[^|]*)\|/m, `$1, ${newIds[1]} |`);
out += `\n\n## Added 2026-10-22 — answers to Q-12 and Q-14\n${newReq.join('\n')}\n`;
writeFileSync(join(HERE, 'requirements.md'), out);
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

const phases = JSON.parse(readFileSync(join(IOS, 'drafts', '20261021-162539', 'phases.json'), 'utf8'));
phases.draft = '20261022-085742';
const p6 = phases.phases.find((p: { id: string }) => p.id === 'P6');
p6.segments.find((s: { id: string }) => s.id === 'P6-a').cases.push(newIds[0]);
p6.segments.find((s: { id: string }) => s.id === 'P6-b').cases.push(newIds[1]);
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(phases, null, 1) + '\n');
writeFileSync(join(HERE, 'update-plan.md'), `# Update plan — ai-mini-drama / ios: approved v3 → draft 20261022-085742

## Spec files
- Unchanged (spec set specs/2026-10-21-2).

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-043 | changed | PM §13.11: text cut at 1,000 | Design 1005 "Exceed word limit" (newer): text kept, Generate disabled |
| ${rOver}, ${rAnyway} | new | — | Over-limit recovery; Create video anyways (PM E4) |
| Q-12, Q-14 | decided / closed | open | answered 2026-10-22 (REQ-028) |

## Case changes
- New (2): ${newIds[0]} delete back under 1,000 → Generate available · ${newIds[1]} failed Storyboard Preview offers 「Create video anyways」
- Modified (1): TC-051 keeps all 1,050 characters, red 「1050/1000」, Generate disabled
- Removed: none · Unchanged: ${approved.length - 1}

## Run setup
- ${newIds[0]} joins P6-a, ${newIds[1]} joins P6-b.

## Questions for you
- None open.
`);
console.log(JSON.stringify({ rows: rows.length, newIds, rOver, rAnyway }));
