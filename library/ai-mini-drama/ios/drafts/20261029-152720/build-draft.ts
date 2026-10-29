// REQ-059 (user, 2026-10-29): the MX ③ charging sheet's original prices are the default; the promotion (first-time
// discount) price is held until the user says it applies. Builds draft.csv and requirements.md of this draft from the
// approved table of its platform (iOS v10 / Android v5). The same file sits in the iOS and the Android draft; the
// platform comes from the folder. Idempotent: rebuilds both files from the approved sources.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readRecords, writeRecords } from '../../../../../scripts/lib/csv.ts';

const HERE = import.meta.dirname;
const PLATFORM = join(HERE, '../..');
const ios = PLATFORM.endsWith('ios');

// iOS ids and their Android counterparts (REQ-057 port, Android draft 20261029-143528)
const ID: Record<string, string> = ios ? {} : {
  'R-463': 'R-479', 'R-464': 'R-480', 'R-465': 'R-481', 'R-450': 'R-466', 'Q-32': 'Q-A18', 'Q-33': 'Q-A19',
  'TC-421': 'TC-545', 'TC-422': 'TC-546', 'TC-423': 'TC-547', 'TC-424': 'TC-544', 'TC-425': 'TC-548', 'TC-426': 'TC-549', 'TC-427': 'TC-550',
};
const id = (s: string) => s.replace(/\b(?:R|Q|TC)-[A-Z]?\d+\b/g, m => ID[m] ?? m);
const PRO = ios ? 'Tier Pro or Pro+' : "Tier Pro (the signed-in account's own PowerDirector Pro subscription; Android 16.8 has no tier switch)";
const LOG = ios ? 'Log stage timings ON' : 'logcat capture running (device-android.ts logcat start)';
const BOOK = ios ? 'the log books it under' : 'logcat books it under action_id=';
const SHEET = 'Original price from the MX ③ charging sheet 「AI Mini Drama CMS」 › 「Action ID (not on CMS)」 (2026-10-20); original prices are the default and the promotion price is held until the user says it applies (user 2026-10-29, REQ-059).';
const WHY = 'REQ-059: original (sheet) prices by default; the promotion price is held';
const HELD = 'n/a (held until the user says the promotion applies, REQ-059)';
const SCENE = "the scene's length × the drama model's rate (13 per second Seedance 2.0, 4 Seedance 2.0 Mini, 6 Seedance 2.5; a 15 s scene → ◆195 / ◆60 / ◆90)";

type Row = Record<string, string>;
const edits: Record<string, (r: Row) => Partial<Row>> = {
  'TC-045': r => ({ 'Expected Result': r['Expected Result'].replace('the price being one character generation', 'the price being one character generation (◆6)'),
    'Change Reason': `${WHY}: one character costs ◆6 (R-254)` }),
  'TC-060': r => ({ 'Expected Result': r['Expected Result'].replace('(2 credits per image)', '(6 credits per scene image)'),
    Notes: `${SHEET} ${r.Notes}`.trim(), 'Change Reason': `${WHY}: storyboard images cost 6 per scene, not 2 (R-050)` }),
  'TC-072': r => ({ 'Expected Result': r['Expected Result'].replace('(2 credits per image)', '(6 credits per image)'),
    'Change Reason': `${WHY}: an updated storyboard image costs 6, the sheet's price for first generation and regenerate alike (R-061)` }),
  'TC-080': () => ({ 'Expected Result': 'Preview • 30 sec costs ◆180 (Best), ◆390 (Standard), ◆120 (Fast); Full Video costs 6 / 13 / 4 credits per second of its length (◆540 / ◆1170 / ◆360 for 90 sec); the price updates at once',
    'Change Reason': `${WHY}: Seedance 2.0 costs 13 and 2.0 Mini 4 per second (2.5 keeps PM 10/16's 6, the sheet has no 2.5 row); whole-video prices recomputed (R-069)` }),
  'TC-092': r => ({ 'Expected Result': r['Expected Result'].replace('Regenerate scene ◆30', `Regenerate scene priced at ${SCENE}`),
    'Change Reason': `${WHY}: the regenerate price follows the scene's length and the per-second rate; ◆30 is the Design mock (R-081)` }),
  'TC-316': r => ({ 'Expected Result': r['Expected Result'].replace('「Regenerate scene ◆30」 below', `「Regenerate scene ◆{price}」 below, {price} = ${SCENE}`),
    'Change Reason': `${WHY}: the regenerate price follows the scene's length and the per-second rate (R-175, R-081)` }),
  'TC-114': r => ({ 'Expected Result': r['Expected Result'].replace('The price ◆15 is struck through', 'The storyboard price (◆6 per scene image plus the Text to Speech part, as TC-060; Design draws ◆15) is struck through'),
    'Change Reason': `${WHY}: the struck-through storyboard price is 6 per scene image plus TTS (R-259)` }),
  'TC-356': r => ({ 'Expected Result': r['Expected Result'].replace('(e.g. ◆15)', '(◆6 per scene image plus Text to Speech, as TC-060)'),
    'Change Reason': `${WHY}: the storyboard price is 6 per scene image plus TTS (R-260)` }),
  'TC-229': () => ({ 'Expected Result': 'Full (original) prices of the charging sheet: ◆6 per character image, ◆6 per storyboard scene image (plus Text to Speech), 13 credits per second for Seedance 2.0 and 4 for Seedance 2.0 Mini (6 for Seedance 2.5, PM 10/16); no credit discount shown',
    Notes: SHEET, 'Change Reason': `${WHY}: the full prices are now numbers (R-147, R-040, R-050, R-069)` }),
  'TC-424': r => ({ 'Expected Result': id(`The character charge is booked under \`genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_normal\` (${ios ? 'log `action_id`' : 'logcat `action_id`'}); its \`total_credit\` is ◆6 × the number of images, the amount Mine › Credits › Details shows for it`),
    Notes: `${SHEET} ${r.Notes.replace(/^MX ③ linked sheet action ids \(REQ-057\)\. ?/, '')}`, 'Change Reason': `${WHY}: the row names the _normal id only and the original price (R-465)` }),
  'TC-421': () => ({ Precondition: `${PRO}; characters done; ${LOG}`,
    Action: ios ? 'Tap Generate on the 「Create storyboard」 card; then pull the logs' : 'Tap Generate on the 「Create storyboard」 card; then pull the logs (device-android.ts pull-logs) and read the charge line in logcat',
    'Expected Result': `The card prices the storyboard at 6 credits per scene image (plus Text to Speech, as TC-060) and that amount is charged (Mine › Credits › Details); ${BOOK} \`genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_normal\``,
    'Spec Ref': id('R-465, R-050'), Notes: `${SHEET} Was the discount row of the TC-231 session (REQ-057).`,
    'Change Reason': `${WHY}: the storyboard row checks the original price and the _normal id outside the promotion (R-050, R-465)` }),
  'TC-422': () => ({ Precondition: `${PRO}; storyboard done; video settings card shown; ${LOG}`,
    'Expected Result': `The card prices the video at 13 credits per second (Preview · 30 sec → ◆390) and that amount is charged (Mine › Credits › Details); ${BOOK} \`genvideo_1_sec_bytedance_seedance2.0std_enable_1080p_aiminidrama_normal\``,
    'Spec Ref': id('R-465, R-069'), Notes: `${SHEET} Was the discount row of the TC-231 session (REQ-057).`,
    'Change Reason': `${WHY}: Seedance 2.0 at 13 per second under the _normal id (R-069, R-465)` }),
  'TC-423': () => ({ Precondition: `${PRO}; storyboard done; video settings card shown; ${LOG}`,
    'Expected Result': `The card prices the video at 4 credits per second (Preview · 30 sec → ◆120) and that amount is charged (Mine › Credits › Details); ${BOOK} \`genvideo_1_sec_bytedance_seedance2.0mini_enable_720p_aiminidrama_normal\``,
    'Spec Ref': id('R-465, R-069'), Notes: `${SHEET} Was the discount row of the TC-231 session (REQ-057).`,
    'Change Reason': `${WHY}: Seedance 2.0 Mini at 4 per second under the _normal id (R-069, R-465)` }),
  'TC-425': () => ({ Precondition: `${PRO}; characters generated; ${LOG}`,
    'Expected Result': `The 「Update characters」 card shows ◆6 per character and that amount is charged (Mine › Credits › Details); ${BOOK} \`genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_normal\``,
    'Spec Ref': id('R-465, R-254'), Notes: `${SHEET} Was the no-discount regenerate row of the TC-231 session (REQ-057).`,
    'Change Reason': `${WHY}: a character regenerate costs the original ◆6 under the _normal id (R-254, R-465)` }),
  'TC-426': () => ({ Precondition: `${PRO}; storyboard done; ${LOG}`,
    'Expected Result': `「Regenerate Image」 shows ◆6 (as TC-070) and that amount is charged (Mine › Credits › Details); ${BOOK} \`genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_normal\``,
    'Spec Ref': id('R-465, R-059'), Notes: `${SHEET} Was the no-discount regenerate row of the TC-231 session (REQ-057).`,
    'Change Reason': `${WHY}: a scene image regenerate costs the original ◆6 under the _normal id (R-059, R-465)` }),
  'TC-427': () => ({ Precondition: `${PRO}; scene videos done; ${LOG}`,
    'Expected Result': `The regeneration shows and charges ${SCENE}, and Mine › Credits › Details shows that amount; ${BOOK} the model's \`genvideo_1_sec_bytedance_seedance2.0<std|mini>_enable_<1080p|720p>_aiminidrama_normal\` id`,
    'Spec Ref': id('R-465, R-081'), Notes: `${SHEET} Was the no-discount regenerate row of the TC-231 session (REQ-057).`,
    'Change Reason': `${WHY}: a scene video regenerate costs its length × the original per-second rate under the _normal id (R-081, R-465)` }),
};
// the promotion rows: no row may expect the discount price while it is held
const parked: Record<string, string> = {
  'TC-231': id('REQ-059: parked: the promotion (first-time discount) price is held until the user says it applies; restore this row then (R-463 held)'),
};

const rows = readRecords(readFileSync(join(PLATFORM, 'cases.csv'), 'utf8').replace(/^﻿/, ''));
const byId = new Map(Object.keys(edits).map(k => [id(k), edits[k]]));
const out = rows.map(r => {
  const e = byId.get(r.ID);
  if (parked[r.ID]) return { ...r, Change: 'removed', 'Change Reason': parked[r.ID] };
  if (!e) return { ...r, Change: 'unchanged', 'Change Reason': '' };
  const ch = e(r);
  return { ...r, ...ch, Change: 'modified', 'Change Reason': id(ch['Change Reason'] ?? WHY) };
});
writeFileSync(join(HERE, 'draft.csv'), writeRecords(['ID', 'Section', 'Precondition', 'Action', 'Expected Result', 'Priority', 'Spec Ref', 'Notes', 'Change', 'Change Reason'], out));

// requirements.md: same IDs, the new prices, the held promotion, Q-32 answered, Q-33 reworded
let req = readFileSync(join(PLATFORM, 'requirements.md'), 'utf8');
const line = (rid: string, f: (l: string) => string) => {
  const re = new RegExp(`^- ${id(rid)}\\b.*$`, 'm');
  if (!re.test(req)) throw new Error(`no ${id(rid)}`);
  req = req.replace(re, l => f(l));
};
const grid = (rid: string, f: (cells: string[]) => string[] | null) => {
  req = req.replace(new RegExp(`^\\| ${id(rid)} \\|.*\\|$`, 'gm'), l => { const c = f(l.split('|').slice(1, -1).map(x => x.trim())); return c ? `| ${c.join(' | ')} |` : l; });
};
const CH = ' — Changed 2026-10-29 (REQ-059):';
line('R-040', l => `${l}${CH} Generate ◆6 (the charging sheet's original price per character image, with or without a reference photo).`);
line('R-050', l => `${l}${CH} 6 credits per scene image (charging sheet) plus TTS.`);
line('R-061', l => `${l}${CH} 6 credits per image (the sheet's price for first generation and regenerate alike).`);
line('R-069', l => `${l}${CH} 6 / 13 / 4 credits per second for Seedance 2.5 / 2.0 (1080p) / 2.0 Mini (720p): 2.0 and Mini from the charging sheet, 2.5 keeps PM 10/16 (the sheet has no 2.5 row, ${id('Q-33')}); Preview • 30 sec ◆180 / ◆390 / ◆120, Full Video 90 sec ◆540 / ◆1170 / ◆360.`);
line('R-081', l => `${l}${CH} Regenerate scene costs the scene's length × the model's per-second rate (R-069); ◆30 is the Design mock.`);
line('R-254', l => `${l}${CH} one character costs ◆6.`);
line('R-259', l => `${l}${CH} the price is 6 per scene image plus the Text to Speech part (R-050); ◆15 is the Design mock.`);
line('R-260', l => `${l}${CH} the price is 6 per scene image plus the Text to Speech part (R-050); ◆15 is the Design mock.`);
line('R-450', l => l.replace('2 credits per image', '6 credits per image, REQ-059'));
line('R-147', l => `${l} — 2026-10-29 (REQ-059): the discount price is held until the user says the promotion applies; every row expects the original price.`);
line('R-463', l => `${l} HELD (REQ-059, 2026-10-29): the promotion price is not in use until the user says it applies; NOT TESTABLE until then, no row expects it.`);
line('R-464', l => `${l} HELD (REQ-059, 2026-10-29): this rule only matters inside the promotion, held with it; NOT TESTABLE until then.`);
// the MX ② arrow 「subscription completed → Generate at the discounted price」 was walked by TC-231, now parked
line(ios ? 'R-379' : 'R-395', l => l.replace(/ Walked by: TC-231\.$/, ' HELD (REQ-059, 2026-10-29): the discounted price is held until the user says the promotion applies; NOT TESTABLE until then (its row TC-231 is parked).'));
line('R-465', l => `${l}${CH} rows check the \`…_aiminidrama_normal\` ids only; the \`_discount\` ids are held with the promotion.`);
line('Q-32', l => `${l} **Answered 2026-10-29 (user, REQ-059):** "by default the original price should be the correct option … Unless I specified in the future that the promotion price is applied use the original price." Rows use the sheet's original prices (R-040, R-050, R-061, R-069, R-081, R-254, R-259, R-260).`);
line('Q-33', () => `- ${id('Q-33')} (MX mx-a-right ③ Credit Charging Table, linked sheet; REQ-057, reworded 2026-10-29 for REQ-059) The sheet has no Seedance 2.5 row. Does Seedance 2.5 (Best) have a price in the charging sheet? Until it does, 2.5 keeps PM 10/16's 6 credits per second (R-069).`);
grid('R-050', c => c[1].includes('2 credits each') ? [c[0], c[1].replace('(2 credits each)', '(6 credits each, REQ-059)'), c[2], c[3]] : null);
grid('R-463', c => c.length === 4 ? [c[0], c[1], c[2], HELD] : [c[0], c[1], HELD]);
grid('R-464', c => c.length === 4 ? [c[0], c[1], c[2], HELD] : [c[0], c[1], HELD]);
const NORMAL = id('TC-424, TC-421, TC-422, TC-423, TC-425, TC-426, TC-427');
grid('R-465', c => c.length === 4 ? [c[0], 'charges are booked under `…_aiminidrama_normal` (the `_discount` ids are held with the promotion, REQ-059)', c[2], NORMAL]
  : /discount/.test(c[1]) ? [c[0], c[1], HELD] : [c[0], c[1], NORMAL]);
req = req.replace(/(^\| REQ-057 [^\n]*\n)/m, `$1| REQ-059 original prices by default, the promotion price held (2026-10-29) | ${id('R-040, R-050, R-061, R-069, R-081, R-147, R-254, R-259, R-260, R-463, R-464, R-465; Q-32, Q-33')} |\n`);
req = req.trimEnd() + `

## Added 2026-10-29 (2) — original prices by default (REQ-059)
User, 2026-10-29: "by default the "original" price should be the correct option, the special price I haven't received
information when it is going to be used. Unless I specified in the future that the promotion price is applied use the
original price." This replaces the REQ-057 rule that normal prices stay PM 10/16 / Design. Normal prices now come from
the MX ③ charging sheet (\`specs/2026-10-21-2/extracted/mx-charging-table.md\`), for first generation and regenerate
alike: character 6 per image, storyboard 6 per scene image, Seedance 2.0 (1080p) 13 per second, Seedance 2.0 Mini
(720p) 4 per second; Seedance 2.5 keeps PM 10/16's 6 per second (no sheet row, ${id('Q-33')}). Changed in place, IDs
kept: R-040, R-050, R-061, R-069, R-081, R-254, R-259, R-260, ${id('R-450')}, ${id('R-465')}. Held: ${id('R-463')} (discount prices) and
${id('R-464')} (no discount on regenerate, which only matters inside the promotion), with the R-147 discount price; TC-231
is parked (removed) and the other REQ-057 discount rows now check the original price and the \`_normal\` ids.
${id('Q-32')} is answered.
`;
writeFileSync(join(HERE, 'requirements.md'), req);
console.log(JSON.stringify({ platform: ios ? 'ios' : 'android', modified: out.filter(r => r.Change === 'modified').map(r => r.ID), removed: out.filter(r => r.Change === 'removed').map(r => r.ID) }));
