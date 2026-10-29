// Android port of iOS draft 20261029-143013 (REQ-057: MX ③ Credit Charging Table, linked sheet).
// Builds draft.csv from the approved Android cases.csv (every row unchanged except TC-231, plus TC-544 – TC-550 placed
// after the row each extends, REQ-033) and phases.json from the approved draft's plan (rows added to the pending
// round A5, segment A5-f 「Credits and limits」). Idempotent: rebuilds both files from the approved sources.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readRecords, writeRecords } from '../../../../../scripts/lib/csv.ts';

const HERE = import.meta.dirname;
const PLATFORM = join(HERE, '../..');
const APPROVED_DRAFT = '20261029-093927';

const SHEET = 'Discount price from the MX ③ linked sheet 「AI Mini Drama CMS」 (2026-10-20), used only where no other source gives a number (user 2026-10-29, REQ-057).';
const PURCHASE = 'Needs a Google Play sandbox subscription (purchase) → Blocked (test-data) until allowed.';
const LOG = 'logcat capture running (device-android.ts logcat start)';
const PULL = 'then pull the logs (device-android.ts pull-logs) and read the charge line in logcat';
const SUB = 'Tier Free; subscribed (Google Play sandbox, license-tester account) from the limit dialog or a not-enough card in this AI Mini Drama session (the TC-231 discount session)';
const REASON_REGEN = 'REQ-057: a regenerate in the discounted session is charged the normal price';

type Row = Record<string, string>;
const row = (r: Omit<Row, 'Section' | 'Change'>): Row => ({ Section: 'Credits and limits', Change: 'new', ...r });

const modified: Record<string, Partial<Row>> = {
  'TC-231': {
    Precondition: `Tier Free; subscribe (Google Play sandbox, license-tester account) from the limit dialog or a not-enough card in this session; ${LOG}`,
    Action: `Continue the drama to the characters card, read its price, tap Generate; ${PULL}`,
    'Expected Result': 'The characters card prices each character image at 2 credits (◆2 × number of images) and that amount is charged (Mine › Credits › Details); logcat books the charge under `action_id=genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_discount` with `total_credit` equal to that amount',
    'Spec Ref': 'R-147, R-479, R-481',
    Notes: `${SHEET} Normal character price stays Design (the sheet says 6, the app showed ◆4 on Android 16.8, Q-A18). TC-545 – TC-547 check the other actions of the same session. ${PURCHASE}`,
    Change: 'modified',
    'Change Reason': 'REQ-057: the discounted price is now a number (2 per character image) and the discount action id is checked (R-479, R-481)',
  },
};

const after: Record<string, Row[]> = {
  'TC-229': [row({
    ID: 'TC-544',
    Precondition: `Tier Pro (the signed-in account's own PowerDirector Pro subscription; Android 16.8 has no tier switch); ${LOG}`,
    Action: `Generate the characters of a new drama (Generate on the characters card), ${PULL}`,
    'Expected Result': 'logcat books the character charge under `action_id=genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_normal`, never under an `…_aiminidrama_discount` id; its `total_credit` equals the amount Mine › Credits › Details shows for it',
    Priority: 'P2', 'Spec Ref': 'R-481, R-147',
    Notes: 'MX ③ linked sheet action ids (REQ-057). Android 16.8 logcat (A2, 2026-10-27) booked video charges as `genvideo_1_sec_bytedance_seedance2.0std_none_480p_aiminidrama` with no _normal / _discount suffix; record what the build logs. Needs a Pro account (paid-tier), as TC-229.',
    'Change Reason': 'REQ-057: normal charges are booked under the _aiminidrama_normal action ids (R-481)',
  })],
  'TC-231': [
    row({
      ID: 'TC-545',
      Precondition: `${SUB}; characters done; ${LOG}`,
      Action: `Tap Generate on the 「Create storyboard」 card (first storyboard of this session); ${PULL}`,
      'Expected Result': 'The card prices the storyboard at 2 credits per scene (◆2 × number of scenes) and that amount is charged (Mine › Credits › Details); logcat books it under an `…_aiminidrama_discount` action_id with `total_credit` equal to that amount',
      Priority: 'P2', 'Spec Ref': 'R-479, R-481, R-147',
      Notes: `${SHEET} Normal storyboard price stays Design / PM (Q-A18). ${PURCHASE}`,
      'Change Reason': 'REQ-057: discount price per storyboard scene (R-479, pass 10 variant)',
    }),
    row({
      ID: 'TC-546',
      Precondition: `${SUB}; storyboard done; video settings card shown; ${LOG}`,
      Action: `Choose Standard (Seedance 2.0) and the Preview length, read the price, tap Generate; ${PULL}`,
      'Expected Result': 'The card prices the video at 2 credits per second (Preview · 30 sec → ◆60) and that amount is charged (Mine › Credits › Details); logcat books it under `action_id=genvideo_1_sec_bytedance_seedance2.0std_enable_1080p_aiminidrama_discount`',
      Priority: 'P2', 'Spec Ref': 'R-479, R-481, R-147',
      Notes: `${SHEET} Normal Seedance 2.0 price stays PM 10/16 (4 per second; the sheet says 13, Q-A18). ${PURCHASE}`,
      'Change Reason': 'REQ-057: discount price per second of Seedance 2.0 video (R-479, pass 10 variant)',
    }),
    row({
      ID: 'TC-547',
      Precondition: `${SUB}; storyboard done; video settings card shown; ${LOG}`,
      Action: `Choose Fast (Seedance 2.0 Mini) and the Preview length, read the price, tap Generate; ${PULL}`,
      'Expected Result': 'The card prices the video at 2 credits per second (Preview · 30 sec → ◆60) and that amount is charged (Mine › Credits › Details); logcat books it under `action_id=genvideo_1_sec_bytedance_seedance2.0mini_enable_720p_aiminidrama_discount`',
      Priority: 'P2', 'Spec Ref': 'R-479, R-481, R-147',
      Notes: `${SHEET} Normal Mini price stays PM 10/16 (2 per second; the sheet says 4, Q-A18). Seedance 2.5 has no discount price in the sheet (Q-A19). ${PURCHASE}`,
      'Change Reason': 'REQ-057: discount price per second of Seedance 2.0 Mini video (R-479, pass 10 variant)',
    }),
  ],
  'TC-233': [
    row({
      ID: 'TC-548',
      Precondition: `Discount session of TC-231: the characters were generated at the discounted price; ${LOG}`,
      Action: `Regenerate one character (ask in chat to change its look, then Generate on the 「Update characters」 card, as TC-045); ${PULL}`,
      'Expected Result': 'The 「Update characters」 card shows the normal character price (the price a Pro user sees, TC-229), not 2 per image, and that amount is charged (Mine › Credits › Details); logcat books it under an `…_aiminidrama_normal` action_id',
      Priority: 'P2', 'Spec Ref': 'R-480, R-481, R-147',
      Notes: `MX ③ linked sheet: no discount on regenerate (「-」), REQ-057. ${PURCHASE}`,
      'Change Reason': `${REASON_REGEN} (R-480, character)`,
    }),
    row({
      ID: 'TC-549',
      Precondition: `Discount session of TC-231: the storyboard was generated at the discounted price; ${LOG}`,
      Action: `Open a scene, tap Edit, change the description, tap Done and 「Regenerate Image」 (as TC-070); ${PULL}`,
      'Expected Result': '「Regenerate Image」 shows the normal price (◆6, as TC-070), not ◆2, and that amount is charged (Mine › Credits › Details); logcat books it under an `…_aiminidrama_normal` action_id',
      Priority: 'P2', 'Spec Ref': 'R-480, R-481, R-147',
      Notes: `MX ③ linked sheet: no discount on regenerate (「-」), REQ-057. ${PURCHASE}`,
      'Change Reason': `${REASON_REGEN} (R-480, storyboard scene)`,
    }),
    row({
      ID: 'TC-550',
      Precondition: `Discount session of TC-231: the scene videos were generated at the discounted price; ${LOG}`,
      Action: `Regenerate one scene video (Edit its description in the scene editor, then 「Regenerate Video」, as TC-144); ${PULL}`,
      'Expected Result': 'The regeneration shows and charges the normal per-second price of the drama\'s model (PM 10/16: 4 per second for Seedance 2.0, 2 for Mini), not 2 per second, and Mine › Credits › Details shows that amount; logcat books it under an `…_aiminidrama_normal` action_id',
      Priority: 'P2', 'Spec Ref': 'R-480, R-481, R-147',
      Notes: `MX ③ linked sheet: no discount on regenerate (「-」), REQ-057. With Mini the normal and the discount price are both 2 per second: then only the action_id tells them apart. ${PURCHASE}`,
      'Change Reason': `${REASON_REGEN} (R-480, video)`,
    }),
  ],
};

// draft.csv
const COLS = ['ID', 'Section', 'Precondition', 'Action', 'Expected Result', 'Priority', 'Spec Ref', 'Notes', 'Change', 'Change Reason'];
const approved = readRecords(readFileSync(join(PLATFORM, 'cases.csv'), 'utf8').replace(/^\uFEFF/, ''));
const out: Row[] = [];
for (const r of approved) {
  out.push({ ...r, Change: 'unchanged', 'Change Reason': '', ...(modified[r.ID] ?? {}) });
  for (const n of after[r.ID] ?? []) out.push(n);
}
writeFileSync(join(HERE, 'draft.csv'), writeRecords(COLS, out));

// phases.json: the pending round A5 gets this draft's rows in its 「Credits and limits」 segment, in table order.
const p = JSON.parse(readFileSync(join(PLATFORM, 'drafts', APPROVED_DRAFT, 'phases.json'), 'utf8'));
p.draft = HERE.split('/').pop();
const changed = out.filter(r => r.Change === 'new' || r.Change === 'modified').map(r => r.ID);
for (const id of changed) {
  if (id === 'TC-544') p.needs[id] = ['paid-tier'];
  else p.needs[id] = ['purchase'];
}
const a5 = p.phases.find((x: any) => x.id === 'A5');
const seg = a5.segments.find((s: any) => s.id === 'A5-f');
const order = out.map(r => r.ID);
seg.cases = [...new Set([...seg.cases, ...changed])].sort((a: string, b: string) => order.indexOf(a) - order.indexOf(b));
for (const id of changed) a5.origin[id] = modified[id] ? 'A4' : 'A5';
if (!a5.name.includes(p.draft)) {
  a5.name = `Android round 5: new and changed rows of drafts ${APPROVED_DRAFT} and ${p.draft} (REQ-052, REQ-053, REQ-056, REQ-057)`;
  a5.note += ` Draft ${p.draft} (REQ-057, MX ③ Credit Charging Table) adds ${changed.length} rows to A5-f: TC-231 (modified) and TC-545 – TC-550 need a Google Play sandbox subscription in the session (needs purchase, parked like TC-231); TC-544 needs a Pro account (needs paid-tier, like TC-229). Each reads the charge's action_id and total_credit in logcat after pull-logs.`;
}
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(p, null, 1) + '\n');
console.log(`draft.csv: ${out.length} rows (${changed.length} new or modified); A5-f: ${seg.cases.join(', ')}`);
