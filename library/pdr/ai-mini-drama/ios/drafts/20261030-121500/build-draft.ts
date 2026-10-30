// REQ-061 (user, 2026-10-30): PM §13.25 (10/29 board 4784:70878, Figma only): one clip regenerates at a time. While a
// clip regenerates, every other scene's 「Regenerate Clip」 is 40% opacity but tappable and shows a toast; nothing is
// sent or charged and the edited prompt is kept; the button is back to normal once the clip ends. Builds draft.csv and
// requirements.md of this draft from the approved table of its platform (iOS v11 / Android v6). The same file sits in
// the iOS and the Android draft; the platform comes from the folder. Idempotent: rebuilds both files from the approved
// sources.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readRecords, writeRecords } from '../../../../../../scripts/lib/csv.ts';

const HERE = import.meta.dirname;
const PLATFORM = join(HERE, '../..');
const ios = PLATFORM.endsWith('ios');

const RID = ios ? 'R-466' : 'R-482';
const [A, B, C] = ios ? ['TC-428', 'TC-429', 'TC-430'] : ['TC-437', 'TC-551', 'TC-552'];
const FAIL = ios ? 'Pink › Inject failure status' : 'fault switch (iOS Pink; none on Android 16.8) › Inject failure status';
const SPEC = 'PM §13.25 (Figma 4784:70878, 10/29 update, Figma only; board-notes 「PM — 10/29 Regenerate Clip one at a time」).';
const WHY = 'REQ-061: PM §13.25 (10/29): one clip regenerates at a time';
const TOAST = '「Another clip is regenerating. Try again when it\'s done.」';
const BLOCKED = `the button is drawn at about 40% opacity but still responds (not disabled); tapping it shows the toast ${TOAST}; nothing is sent (that clip shows no generating state), no credits are charged (credit pill and Mine › Credits › Details unchanged) and its edited description is kept`;

type Row = Record<string, string>;
const COLS = ['ID', 'Section', 'Precondition', 'Action', 'Expected Result', 'Priority', 'Spec Ref', 'Notes', 'Change', 'Change Reason'];
const second: Row = {
  ID: A, Section: 'Video errors',
  Precondition: `Finished video with two failed clips (${FAIL} on two scenes, then the switch Off; record the switch); Fix scenes open`,
  Action: 'Edit failed clip A › Done › Regenerate Clip; while clip A regenerates, Edit failed clip B, change its description, tap Done; read clip B\'s 「Regenerate Clip」 and the credit pill, then tap 「Regenerate Clip」',
  'Expected Result': `While clip A regenerates, clip B's 「Regenerate Clip」: ${BLOCKED}`,
  Priority: 'P2', 'Spec Ref': `${RID}, R-134`, Notes: SPEC,
};
const after: Row = {
  ID: B, Section: 'Video errors',
  Precondition: `Clip A regenerating and clip B's edited description kept after the toast (${A})`,
  Action: `Wait until clip A's regeneration ends, then tap clip B's 「Regenerate Clip」; repeat once with clip A's regeneration failing (${FAIL} on clip A's scene; record the switch)`,
  'Expected Result': 'As soon as clip A ends, succeeded or failed, clip B\'s 「Regenerate Clip」 is back at full opacity; tapping it starts clip B\'s regeneration with the edited description and charges it once',
  Priority: 'P2', 'Spec Ref': RID, Notes: SPEC,
};
const editor: Row = {
  ID: C, Section: 'Video errors',
  Precondition: 'Finished video; one scene video regenerating, started from its scene editor (as TC-144)',
  Action: 'Open another scene\'s editor (scene edit page), change its description, then tap its regenerate button',
  'Expected Result': `The other scene's regenerate button: ${BLOCKED}`,
  Priority: 'P2', 'Spec Ref': `${RID}, R-081`, Notes: `${SPEC} The rule covers every single-clip regenerate entry (Fix Scene › Edit and the scene edit page).`,
};
const NEW_REASON = { [B]: `${WHY}: the button is back to normal when the regenerating clip ends, success or failure (${RID})`,
  [C]: `${WHY}: the scene edit page entry is blocked the same way (${RID})` };

const rows = readRecords(readFileSync(join(PLATFORM, 'cases.csv'), 'utf8').replace(/^﻿/, ''));
const out: Row[] = [];
for (const r of rows) {
  if (!ios && r.ID === A) {
    // TC-437 asked for 「can be regenerated too, or a message explains why」; §13.25 answers it
    out.push({ ...r, ...second, Notes: `${SPEC} ${r.Notes}`.trim(), Change: 'modified',
      'Change Reason': `${WHY}: the second clip's Regenerate Clip is dimmed but tappable and shows a toast, no send, no charge, prompt kept (${RID})` });
  } else out.push({ ...r, Change: 'unchanged', 'Change Reason': '' });
  if (r.ID === (ios ? 'TC-149' : A)) {
    if (ios) out.push({ ...second, Change: 'new', 'Change Reason': `${WHY}: a second Regenerate Clip is dimmed but tappable and shows a toast, no send, no charge, prompt kept (${RID})` });
    out.push({ ...after, Change: 'new', 'Change Reason': NEW_REASON[B] }, { ...editor, Change: 'new', 'Change Reason': NEW_REASON[C] });
  }
}
if (out.length !== rows.length + (ios ? 3 : 2)) throw new Error('anchor row not found');
writeFileSync(join(HERE, 'draft.csv'), writeRecords(COLS, out));

let req = readFileSync(join(PLATFORM, 'requirements.md'), 'utf8');
// append one row to the end of the grid that follows a heading
const gridRow = (heading: string, row: string) => {
  const at = req.indexOf(`\n${heading}\n`);
  if (at < 0) throw new Error(`no ${heading}`);
  const m = /\n\|[^\n]*\|\n(?!\|)/g; m.lastIndex = req.indexOf('\n|---', at);
  const end = m.exec(req); if (!end) throw new Error(`no grid under ${heading}`);
  const cut = end.index + end[0].length;
  req = req.slice(0, cut) + `${row}\n` + req.slice(cut);
};
gridRow('### Hidden clauses', `| ${RID} | the blocked tap sends nothing, charges nothing and keeps the edited prompt | the clip shows no generating state; the credit pill and Mine › Credits › Details before and after; the description text | ${A}, ${C} |`);
gridRow('### Hidden clauses', `| ${RID} | the button is back to normal when the regenerating clip ends, also when it fails | the button's opacity and a tap after the clip ends | ${B} |`);
gridRow('### Variants', `| ${RID} | entry: Fix Scene › Edit | ${A} |`);
gridRow('### Variants', `| ${RID} | entry: scene edit page | ${C} |`);
gridRow('### Variants', `| ${RID} | the regenerating clip ends: success / failure | ${B} |`);
req = req.replace(/(^\| REQ-059 [^\n]*\n)/m, `$1${ios ? '' : '| REQ-060 new Android spec set specs/2026-10-27 (2026-10-27) | none here: built in its own open draft 20261027-161938 |\n'}| REQ-061 Regenerate Clip one at a time (PM §13.25, 2026-10-30) | ${RID} |\n`);
req = req.trimEnd() + `

## Added 2026-10-30 — Regenerate Clip one at a time (REQ-061)
\`figma-check.ts\` (2026-10-30) found a PM board no group covered: 「10/29 update — Regenerate Clip 一次只能跑一個（PDR-A 16.8.0
AI Agent bug）」 (4784:70878, Figma only, newer than PM Spec 20261021; group \`u1029\`, board-notes 「PM — 10/29 Regenerate
Clip one at a time」). Its ◆60 is a mock: the regenerate price stays the scene's length × the model's rate (R-081).

- ${RID} [PM: 10/29 update §13.25 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4784-70878; Req: REQ-061] Only one clip regenerates at a time. While a clip regenerates, every other scene's 「Regenerate Clip」 is drawn at 40% opacity but stays tappable (not disabled, so the user learns why); tapping it shows the toast ${TOAST}, sends nothing, charges nothing and keeps the prompt the user edited. When the regenerating clip ends (success or failure) the button is back to normal. Applies to every entry that regenerates a single clip (Fix Scene › Edit, the scene edit page). Walked by: ${A}, ${B}, ${C}.
`;
writeFileSync(join(HERE, 'requirements.md'), req);
