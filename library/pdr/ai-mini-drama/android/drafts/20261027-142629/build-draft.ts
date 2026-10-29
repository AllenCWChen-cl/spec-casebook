// Build the first AI Mini Drama Android draft (user, 2026-10-27, REQ-042) on spec set 2026-10-21-2.
// Skill step 0: the second platform's draft may start from the first platform's rows, adjusted for the platform
// differences the spec states. It starts from the newest iOS analysis, draft ios/20261022-145212 (392 rows, R-001 –
// R-305, annotation trace, passes 1 – 10), and adapts it:
// - Android differences the spec states: system back is a chat exit (Design 1016 ①, PM 0930), Android back closes the
//   character result like X (PM 10/21 §13.23), Export says 「Saved to Gallery.」 (PM 10/20), the paid tier with 100
//   chats is "Android Premium" (MX version A), Google Play billing, Android's notification permission.
// - Android test setup: the debug controls found on the Xperia replace the iOS Pink menu (ANDROID below).
// - iOS-only inputs leave: REQ-021 build checks (iOS TR RD note). iOS ticket rows stay as cross-platform leads
//   (rule 10: the same symptom on Android is a related ticket); Android tickets come in with the eCL pull (REQ-012).
// - REQ-022 (Android problem report, 16.8.0) leads and the spec agent's Android cases (standing input 6) add rows.
// Every row is Change = new (a new table). Re-runnable: node library/pdr/ai-mini-drama/android/drafts/20261027-142629/build-draft.ts
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFT_COLUMNS, readTable, writeTable } from '../../../../../../scripts/lib/library.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const DRAFT = '20261027-142629';
const IOS_DRAFT = join(HERE, '..', '..', '..', 'ios', 'drafts', '20261022-145212');
type Row = Record<string, string>;

// ---------- Android setup facts (from the Xperia, scripts/device-android.ts setup on 2026-10-27) ----------
const ANDROID = JSON.parse(readFileSync(join(HERE, 'android-facts.json'), 'utf8')) as {
  debug: string;                       // how a row names the debug fault switches, e.g. "Debug › [z] AI Mini Drama › "
  faultSwitches: boolean;              // false → fault-injection rows are parked (needs: fault-injection)
  tierPath: string | null;             // how a row sets the tier, e.g. "Debug › IAP › Status › "; null → parked
  paidTier: string;                    // the in-app name of the paid tier with 100 chats (MX: "Android Premium")
  midTier: string | null;              // a 30-chat tier like iOS Pro, or null when Android has none
  language: string;                    // how a row sets the app language
  install: string;                     // how a fresh-install case reinstalls the build under test
  android: string;                     // Android version on the test phone
};

const src: Row[] = readTable(join(IOS_DRAFT, 'draft.csv')).filter(r => r.Change !== 'removed');
if (src.length !== 392) throw new Error(`expected 392 active iOS rows, found ${src.length}`);

// ---------- rows ----------
const DROP = new Set(['TC-329', 'TC-330', 'TC-331']);           // REQ-021 build checks: iOS TR261006-0055 RD note
const dropped = src.filter(r => DROP.has(r.ID));
let rows: Row[] = src.filter(r => !DROP.has(r.ID)).map(r => {
  const o: Row = {};
  for (const c of DRAFT_COLUMNS) o[c] = r[c] ?? '';
  o.Change = 'new'; o['Change Reason'] = '';
  return o;
});
const byId = () => new Map(rows.map(r => [r.ID, r]));
const parked: Record<string, string[]> = {};
const park = (id: string, need: string) => { (parked[id] ??= []).includes(need) || parked[id].push(need); };

const sub = (s: string) => {
  let t = s;
  // Tier switch first (it is a Pink path too), then the fault switches: iOS Pink menu → the Android debug controls.
  t = t.replace(/Pink › IAP › Status › /g, ANDROID.tierPath ?? 'subscription of the test account: ');
  t = t.replace(/Pink(?: ›|:) /g, ANDROID.debug);
  t = t.replace(/\(fault injection\)/g, '(fault injection, Android debug controls)');
  // Platform strings the spec gives per platform (PM 10/20 §Export; Android back; Gallery).
  t = t.replace(/「Saved to Photos\.」/g, '「Saved to Gallery.」').replace(/is in Photos/g, 'is in the Gallery')
    .replace(/in Photos\b/g, 'in the Gallery').replace(/iOS Settings › PowerDirector › Language/g, ANDROID.language)
    .replace(/The iOS notification permission dialog appears/g, `On Android 13 and later the system notification permission dialog appears; on Android 12 and earlier none appears (the test phone runs Android ${ANDROID.android}): record which`)
    .replace(/Swipe the app away/g, 'Swipe the app away in Recents');
  // iOS ticket references in core rows are leads on Android (rule 10).
  t = t.replace(/Regression (DRI\w+) \(([^)]*)\)/g, 'iOS ticket $1 ($2), a lead on Android');
  t = t.replace(/;? ?runs in segment P\d+-\w+/g, '').replace(/Own fresh install\. *$/, 'Own fresh install');
  return t;
};
for (const r of rows) for (const c of ['Precondition', 'Action', 'Expected Result', 'Notes']) r[c] = sub(r[c]);

// Tiers (MX version A): iOS Free 10 / Pro 30 / Pro+ 100; Android Free 10 / Premium 100 ("Pro+ (and Android Premium)").
const PAID = ANDROID.paidTier;
for (const r of rows) for (const c of ['Precondition', 'Action', 'Expected Result', 'Notes'])
  r[c] = r[c].replace(/Pro\+/g, PAID);
if (!ANDROID.midTier) {
  // No 30-chat tier on Android: the iOS Pro rows have no variant to run (Q-A2 asks PM to confirm).
  for (const id of ['TC-216', 'TC-367', 'TC-392']) rows = rows.filter(r => r.ID !== id);
}

// iOS ticket rows: cross-platform leads.
for (const r of rows) if (r.Section === 'Regression') {
  r.Section = 'Regression (iOS leads)';
  r['Spec Ref'] = 'R-141, R-310';
  r.Precondition = r.Precondition.replace(/^Build under test; steps and evidence in (DRI\w+)/, 'Android build under test; steps and evidence in iOS ticket $1');
  r.Notes = `${r.Notes}; iOS ticket, rechecked on Android as a lead (rule 10: a failure is a new Android ticket related to it)`;
}

// Fresh install on Android.
for (const r of rows) r.Precondition = r.Precondition.replace(/uninstall PowerDirector, reinstall the build under test/g, `uninstall PowerDirector, ${ANDROID.install}`);

// Parking: rows that need what the Android setup cannot give.
if (!ANDROID.faultSwitches) for (const r of rows) if (/fault injection|Android debug controls|record the switch/.test(r.Precondition + r.Notes)) park(r.ID, 'fault-injection');
// No debug tier switch: rows that need a paid tier wait for a paid test account.
if (!ANDROID.tierPath) for (const r of rows) if (new RegExp(`\\b[Tt]ier (${PAID}|Pro)\\b|\\b(${PAID}|Pro) account|Tier Pro or`).test(r.Precondition)) park(r.ID, 'paid-tier');

// ---------- new Android rows (R-306 – ) ----------
const NEW: { after: string; row: Row }[] = [];
let next = 394;
const add = (after: string, r: Omit<Row, 'ID' | 'Change' | 'Change Reason'>) => {
  const id = `TC-${next++}`; NEW.push({ after, row: { ID: id, ...r, Change: 'new', 'Change Reason': '' } }); return id;
};
const SB = 'System back (Android back gesture or button)';
const T: Record<string, string> = {};
T.empty = add('TC-381', { Section: 'Format card', Precondition: 'Empty chat', Action: 'Use system back (Android back gesture or button) on an empty chat; open a new chat, type an idea without sending and use system back; open a new chat, send an idea and use system back at the format card; open History', 'Expected Result': 'Each system back returns to the AI Mini Drama landing page with no dialog; History has none of these chats', Priority: 'P2', 'Spec Ref': 'R-288, R-306', Notes: 'Design 1016 ①: ← and system back are the same exit' });
T.outline = add('TC-025', { Section: 'Story outline', Precondition: 'Outline generating', Action: SB, 'Expected Result': '「Leave this chat?」/「Your story outline isn\'t ready yet, so this chat won\'t be saved.」 with 「Leave anyway」 and 「Stay」; Stay closes the dialog and the outline keeps generating', Priority: 'P1', 'Spec Ref': 'R-022, R-306', Notes: 'PM 0930 lists system back with Back, New chat and History; REQ-022 lead (Android report #14)' });
T.outlineLeave = add(T.outline, { Section: 'Story outline', Precondition: 'Outline generating; 「Leave this chat?」 opened with system back', Action: 'Tap 「Leave anyway」', 'Expected Result': 'The AI Mini Drama landing page opens; the chat is not in History', Priority: 'P2', 'Spec Ref': 'R-022, R-306', Notes: '' });
T.saved = add('TC-029', { Section: 'Story outline', Precondition: 'Outline finished, nothing generating', Action: `${SB}, then reopen the drama from History`, 'Expected Result': 'No dialog on leaving; the landing page opens; the drama is in History and reopens at the outline step', Priority: 'P2', 'Spec Ref': 'R-025, R-306', Notes: '' });
T.storyboard = add('TC-061', { Section: 'Storyboard', Precondition: 'Storyboard generating', Action: SB, 'Expected Result': '「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」 with 「Leave anyway」 and 「Keep Generating」; Keep Generating closes the dialog and generation continues', Priority: 'P1', 'Spec Ref': 'R-051, R-307', Notes: 'PM 0930: system back during a short generation; REQ-022 lead (Android report #22)' });
T.storyboardLeave = add(T.storyboard, { Section: 'Storyboard', Precondition: 'Storyboard generating; 「Stop and lose your credits?」 opened with system back; credit pill read', Action: 'Tap 「Leave anyway」, then reopen the drama from History', 'Expected Result': 'The landing page opens; the storyboard stopped and the credits are not refunded (Credit Details has no refund row); History reopens at the 「Create storyboard」 offer', Priority: 'P2', 'Spec Ref': 'R-051, R-307', Notes: '' });
T.video = add('TC-082', { Section: 'Video', Precondition: 'Video generating', Action: SB, 'Expected Result': 'Toast 「We\'ll keep making your video. Find it in History.」; no stop dialog; the landing page opens, the video keeps generating and its History card shows 「processing..」', Priority: 'P1', 'Spec Ref': 'R-071, R-073, R-308', Notes: '' });
T.charResult = add('TC-342', { Section: 'Make your character', Precondition: 'Generated character shown', Action: SB, 'Expected Result': 'Same as X: 「Discard this character?」/「It won\'t be saved, and the credits you spent won\'t be refunded.」 with 「Keep」 and a red 「Discard」', Priority: 'P2', 'Spec Ref': 'R-248, R-293', Notes: 'PM 10/21 §13.23 names Android back. PM-only: no Design frame yet (Design 2026-10-19)' });

// Rows the spec agent cross-check found missing (standing input 6; decisions in spec-agent-gaps.json).
T.discardButtons = add('TC-055', { Section: 'Make your character', Precondition: '「Discard this character?」/「What you\'ve entered won\'t be saved.」 shown after X with a description, Gender, Ethnicity, Age and a reference photo entered', Action: 'Tap 「Keep editing」; tap X again, tap 「Keep editing」; use system back, then tap 「Discard」', 'Expected Result': 'Keep editing closes the dialog and the form keeps every input; system back shows the same dialog as X; Discard closes Make your character and no character is saved to Mine or applied to the slot', Priority: 'P2', 'Spec Ref': 'R-047, R-306', Notes: 'Spec agent 1021-CHAR-DISCARD-KEEP / -LEAVE (Android)' });
T.multiExits = add('TC-337', { Section: 'Characters', Precondition: 'Finish your characters generating two characters (「Creating 2 characters...」)', Action: 'Tap 「Cancel」, then 「Keep Generating」; tap X, then 「Keep Generating」; tap X again, then 「Leave anyway」', 'Expected Result': 'Cancel and X stay enabled and each asks 「Stop and lose your credits?」/「This is still generating. If you leave now, it\'ll stop and the credits you\'ve spent won\'t be refunded.」 with Leave anyway / Keep Generating; Keep Generating keeps both generating; Leave anyway stops the unfinished character, keeps a finished one, and Credit Details shows no refund', Priority: 'P2', 'Spec Ref': 'R-247', Notes: 'Spec agent 1021-CHAR-MULTIPLE-CANCEL-KEEP / -X-KEEP / -X-LEAVE (Android)' });
T.deleteConfirm = add('TC-112', { Section: 'History', Precondition: 'History with three test dramas made for this case (never delete other dramas on the shared account)', Action: 'Tap ⋮ › Delete on one of them, then 「Delete」; then Manage, select the other two, tap Delete and confirm in 「Delete 2 dramas?」', 'Expected Result': 'Each confirmed delete closes the dialog and removes exactly those cards from History; the remaining cards keep their order, time and size', Priority: 'P2', 'Spec Ref': 'R-096, R-097', Notes: 'Spec agent PM-RECENT-DELETE-001; TC-111 / TC-112 stop at the dialog' });
T.videoStatus = add('TC-081', { Section: 'Video', Precondition: 'Video settings card shown; notification pre-prompt already answered', Action: 'Tap Generate Video and watch the chat until the result arrives', 'Expected Result': 'The chat shows 「I\'ll create a video - give me a moment...」 and an in-progress video state (never a blank chat) until 「Here\'s your drama.」 with the video card replaces it', Priority: 'P2', 'Spec Ref': 'R-311', Notes: 'Spec agent PM-VIDEO-GENERATING-001. Rides on a video the run generates anyway' });


// REQ-022: the Android problem report (16.8.0) as regression leads; groups as reconciled by the spec agent on 10/19.
const LEADS: [string, string[]][] = [
  ['#1, #4, #27, #38, #39, S3 storyboard regeneration, editing, layout, More ideas+', ['TC-065', 'TC-070', 'TC-138']],
  ['#2 template storyboard moderation', ['TC-067']],
  ['#3, S2 scene failure count and refund', ['TC-091', 'TC-150']],
  ['#5, #24, #25, #26, #42 AI Suggestion, age, Others, ethnicity order, description length', ['TC-047', 'TC-126']],
  ['#6, S1 card numbering across the format Continue', ['TC-020', 'TC-021', 'TC-022']],
  ['#7 leave warning', ['TC-025']],
  ['#8, #20, #28, #31, #40, #43, #49, #51, S6 tier, price and chat-limit timing', ['TC-080', 'TC-117', 'TC-215', 'TC-217']],
  ['#14, #22, #33 system back, leaving a storyboard, Create Your Drama session', ['TC-011', T.outline, T.storyboard, T.storyboardLeave]],
  ['#15, #23, #37, S7 offline Continue, outline failure, idea kept', ['TC-030', 'TC-032', 'TC-300']],
  ['#16, #18, #32 saving to the phone and its confirmation', ['TC-089', 'TC-090', 'TC-343']],
  ['#17, #19, #21, #48 preview playback, captions in the download', ['TC-097', 'TC-143', 'TC-375']],
  ['#29 done notifications', ['TC-085', 'TC-303', 'TC-307']],
  ['#30 chat revision and the outline', ['TC-045', 'TC-046']],
  ['#34 template names', ['TC-010']],
  ['#36, #44, S5 long-dialogue scene failure, fix and export gating', ['TC-091', 'TC-092', 'TC-093', 'TC-149']],
  ['#41 microphone', ['TC-011']],
  ['#45 Storyboard Preview TTS failure', ['TC-078']],
  ['#46, #47 History names and order', ['TC-106', 'TC-318']],
  ['#50 first-use free tries', ['TC-114']],
];
// Build checks (standing input 3): RD Note of TR261021-0082, the build under test (tickets/TR261021-0082-rd-note.md).
T.french = add('TC-277', { Section: 'Text', Precondition: 'The phone\'s system language set to French (Français) by the user (Android 12 has no per-app language)', Action: 'Visit every AI Mini Drama page, dialog, toast and state', 'Expected Result': 'Every string is French: no English left, no spelling, grammar or punctuation errors, no truncated text', Priority: 'P3', 'Spec Ref': 'R-149, R-313', Notes: 'Build check TR261021-0082 RD Note: 「check French and Japanese UI」 (Japanese is TC-277). Retire after it passes on two builds' });
park(T.french, 'app-language');

// Insert each new row right after the row it extends (REQ-033); chains follow the row added before them.
for (const { after, row } of NEW) {
  const i = rows.findIndex(r => r.ID === after);
  if (i < 0) throw new Error(`anchor ${after} missing for ${row.ID}`);
  rows.splice(i + 1, 0, row);
}

// ---------- Android tickets (REQ-012, rule 3): eCL pull of 2026-10-27, tickets/android-tickets-20261027.json ----------
// Decided in tickets/decisions-*.json: fold into the row that already checks it, or a recheck row next to the row it
// belongs with. An iOS lead row with the same symptom gives way to the Android ticket (replaced[] maps it).
type Dec = { bug: string; kind: 'fold' | 'row'; row?: string; note?: string; after?: string; section?: string; precondition?: string;
  action?: string; expected?: string; priority?: string; spec_ref?: string; notes?: string; needs?: string[]; ios_lead?: string };
const decs: Dec[] = [1, 2, 3].flatMap(n => { try { return JSON.parse(readFileSync(join(HERE, 'tickets', `decisions-${n}.json`), 'utf8')); } catch { return []; } })
  .sort((a: Dec, b: Dec) => a.bug.localeCompare(b.bug));
const tickets = JSON.parse(readFileSync(join(HERE, 'tickets', 'android-tickets-20261027.json'), 'utf8')) as { BugCode: string }[];
const replaced: Record<string, string> = {};
const ticketRows: string[] = [], folded: string[] = [];
const ticketAfter: Record<string, string> = {};
const conflicts: string[] = [];   // ticket rows whose Expect Result the spec contradicts (rule 3: the spec wins)
// Ticket rows first, so a ticket that folds into another ticket's new row ("<BugCode> (new row)") finds it.
const bugRow: Record<string, string> = {};
decs.sort((a, b) => +(a.kind === 'fold') - +(b.kind === 'fold') || a.bug.localeCompare(b.bug));
for (const d of decs) {
  let target: string;
  if (d.kind === 'row' && /spec differs/i.test(d.notes ?? '')) {
    // REQ-043 (2): the spec contradicts the ticket's expectation, so the ticket goes into the neighbouring row's Notes.
    const r = byId().get(d.after!); if (!r) throw new Error(`${d.bug}: anchor ${d.after} missing`);
    r.Notes = [r.Notes, `${d.notes} — the ticket expects 「${d.expected!.slice(0, 160)}${d.expected!.length > 160 ? '…' : ''}」; the spec governs this row (REQ-043)`].filter(Boolean).join('; ');
    conflicts.push(`${d.bug} → ${d.after}`); folded.push(d.bug);
    continue;
  }
  if (d.kind === 'fold') {
    const ref = /DRA\w+/.test(d.row!) ? bugRow[d.row!.match(/DRA\w+/)![0]] : d.row!;
    const r = byId().get(ref); if (!r) throw new Error(`${d.bug}: fold target ${d.row} missing`);
    r.Notes = [r.Notes, d.note].filter(Boolean).join('; ');
    target = r.ID; folded.push(d.bug);
  } else {
    const i = rows.findIndex(r => r.ID === d.after); if (i < 0) throw new Error(`${d.bug}: anchor ${d.after} missing`);
    let j = i + 1; while (j < rows.length && ticketRows.includes(rows[j].ID)) j++;   // after earlier ticket rows on the same anchor
    const spec = d.spec_ref?.includes('R-141') ? d.spec_ref : `${d.spec_ref ?? ''}, R-141`.replace(/^, /, '');
    target = `TC-${next++}`;
    rows.splice(j, 0, { ID: target, Section: d.section!, Precondition: d.precondition!, Action: d.action!, 'Expected Result': d.expected!,
      Priority: d.priority!, 'Spec Ref': spec, Notes: d.notes!, Change: 'new', 'Change Reason': '' });
    ticketRows.push(target); ticketAfter[target] = d.after!; bugRow[d.bug] = target;
    for (const n of d.needs ?? []) park(target, n);
  }
  if (d.ios_lead && byId().get(d.ios_lead)?.Section === 'Regression (iOS leads)') {
    const lead = byId().get(d.ios_lead)!;
    const tr = byId().get(target)!;
    tr.Notes = `${tr.Notes}; same symptom as iOS ticket ${lead.Notes.match(/DRI\w+/)?.[0] ?? lead.ID} (was ${lead.ID})`;
    rows = rows.filter(r => r.ID !== lead.ID); replaced[lead.ID] = target;
  }
}
// REQ-043 (1): no iOS-only cases in the Android table: the iOS ticket leads left after the Android tickets go.
const iosLeadsDeleted = rows.filter(r => r.Section === 'Regression (iOS leads)').map(r => r.ID);
rows = rows.filter(r => r.Section !== 'Regression (iOS leads)');
const untriaged = tickets.filter(t => !decs.some(d => d.bug === t.BugCode)).map(t => t.BugCode);

// ---------- requirements ----------
let req = readFileSync(join(IOS_DRAFT, 'requirements.md'), 'utf8').trimEnd();
const swap = (re: RegExp, s: string | ((m: string) => string)) => {
  if (!re.test(req)) throw new Error(`missing ${re}`);
  req = req.replace(re, s as any);
};
swap(/^# AI Mini Drama — requirements \(ios\)/, '# AI Mini Drama — requirements (android)');
swap(/(\nSource tags: [^\n]*)/, `$1\nAndroid (2026-10-27, REQ-042): built from the iOS analysis of the same spec set (draft ios/20261022-145212); the Android differences the spec states are marked 「Android:」 and the Android rules are under "Added 2026-10-27 — Android".`);
const midName = ANDROID.midTier;
swap(/(- R-103 [^\n]*)/, `$1 Android: MX version A gives it to 「Pro+ (and Android Premium)」, so the Android paid tier ${PAID} gets this dialog.`);
swap(/(- R-141 )\[Rule 3: regression list \(ECL query 2026-10-19\)\] Every open or resolved-not-closed AI Mini Drama iOS eBug/,
  '$1[Rule 3: regression list; Req: REQ-012, REQ-043] Android: every open or resolved-not-closed AI Mini Drama Android eBug (eCL pull 2026-10-27, tickets/) is rechecked each run; iOS tickets are not (REQ-043), and a ticket the spec contradicts is kept in the Notes of the row that checks the spec. Each');
swap(/(- R-142 [^\n]*)/, `$1 Android: Free 10 and ${PAID} 100${midName ? `, ${midName} 30` : ' (MX names no 30-chat tier for Android; Q-A2)'}.`);
swap(/(- R-149 [^\n]*)/, `$1 Android: the app language is set through ${ANDROID.language.replace(/^through /, '')}.`);
swap(/\(then the iOS permission dialog\)/, '(then the system notification permission dialog: Android 13 and later)');
swap(/when done the toast reads 「Saved to Photos\.」 on iOS\./, 'when done the toast reads 「Saved to Gallery.」 on Android (PM 10/20: iOS 「Saved to Photos.」 / Android 「Saved to Gallery.」).');
for (const id of ['R-187', 'R-188', 'R-189']) swap(new RegExp(`(- ${id} [^\\n]*)`), `$1 — NOT TESTABLE: iOS build note (REQ-021 is iOS only; the Android TR's RD note replaces it, standing input 3)`);
if (!midName) swap(/(- R-277 [^\n]*)/, '$1 — NOT TESTABLE: Android has no Pro (30-chat) tier; its Free dialog is R-102 and its paid dialog R-103 (Q-A2)');

// Exit × stage with the Android system back (coverage pass 8 names it).
swap(/### Exit × stage\n[\s\S]*?(?=\n### Error classes)/, `### Exit × stage
Every top exit in every stage (coverage pass 8, REQ-030), with Android's system back (Design 1016 ①, PM 0930). Cells
name the rows, or n/a with the reason.

| Stage | Back | System back | History | New chat | Credit pill |
|---|---|---|---|---|---|
| Empty chat | TC-381 | ${T.empty} | n/a (spec silent) | n/a (spec silent) | n/a (spec silent) |
| Outline generating | TC-025, TC-027, TC-028 | ${T.outline}, ${T.outlineLeave} | TC-026, TC-027 | TC-357 | TC-357, TC-358 |
| Outline saved, nothing generating | TC-029 | ${T.saved} | TC-360 | TC-360 | TC-360 |
| Character generating (Make your character) | n/a (sheet: X and Cancel, TC-333, TC-334) | n/a (sheet; Q-A1) | n/a (sheet covers the chat) | n/a (sheet covers the chat) | n/a (sheet covers the chat) |
| Storyboard generating | TC-061, TC-063 | ${T.storyboard}, ${T.storyboardLeave} | TC-359 | TC-359 | TC-359 |
| Chat image update generating | TC-294 | n/a (same short-job dialog as ${T.storyboard}) | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) |
| Character update generating | TC-351 | n/a (same short-job dialog as ${T.storyboard}) | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) |
| Video generating | TC-082, TC-083 | ${T.video} | TC-361 | TC-361 | TC-361 |
`);

// Variants and hidden clauses follow the Android tiers.
const v = (r: string, variant: string, rowsTxt: string) => `| ${r} | ${variant} | ${rowsTxt} |`;
const tierLines = [
  v('R-102', 'Free', 'TC-117'),
  v('R-102', `${PAID} (R-103 dialog instead)`, 'TC-118'),
  v('R-103', PAID, 'TC-118'),
  v('R-103', 'Free (R-102 dialog)', 'TC-117'),
  v('R-142', 'Free', 'TC-215, TC-218'),
  v('R-142', PAID, 'TC-217, TC-368'),
  ...(midName ? [v('R-142', midName, 'TC-216, TC-367')] : [v('R-142', 'Pro (30, iOS only)', 'n/a (no such tier on Android; Q-A2)')]),
  v('R-266', 'Free', 'TC-369'),
  v('R-266', PAID, 'TC-393'),
  ...(midName ? [v('R-266', midName, 'TC-392')] : [v('R-266', 'Pro (30, iOS only)', 'n/a (no such tier on Android; Q-A2)')]),
];
tierLines.splice(3, 0, v('R-103', 'Pro+ (the iOS name; Android Premium per MX)', 'TC-118'), v('R-103', 'Pro (30, iOS only)', 'n/a (no such tier on Android; Q-A2)'));
swap(/(### Variants\n[\s\S]*?\|---\|---\|---\|\n)([\s\S]*?)(?=\n#|$)/, (_m: string, head: string, body: string) =>
  `${head}${tierLines.join('\n')}\n${body.split('\n').filter(l => !/^\| R-(102|103|142|266|277) \|/.test(l)).join('\n')}`);
if (!midName) req = req.replace(/TC-369, TC-392, TC-393/g, 'TC-369, TC-393');

// Job states: the download failure / retry cells named the iOS build check TC-331 (R-189); the spec states no download failure.
req = req.replace(/TC-331/g, 'n/a (spec silent; iOS build note R-189 only)');
// Request ledger: REQ-021 is iOS only; REQ-022 is the Android report.
swap(/\| REQ-021 RD build notes, TR261006-0055 \|[^\n]*/, '| REQ-021 RD build notes, TR261006-0055 (iOS only) | n/a on Android: R-187, R-188, R-189 not testable; their checks stay folded into TC-065, TC-100 |');
swap(/(\| REQ-012 regression rows \| R-141)/, '$1 (Android tickets, eCL pull 2026-10-27) |\n| REQ-043 Android review answers (2026-10-27) | R-141 (Android tickets only; spec-contradicted tickets in Notes), R-142 (paid-tier rows Blocked until a paid account)');

// ---------- Android requirements ----------
const ANDROID_REQ = `

## Added 2026-10-27 — Android (REQ-042, REQ-022)
The Android differences the spec states, found by reading every board note for 「Android」, 「system back」 and the
platform toasts, plus the user's Android problem report (REQ-022) as regression leads.
- R-306 [DS:figma 1016_Chat navigation 4858:34930; PM:pm-0930-updates] Android's system back is the same exit as the chat's ← in every stage: before an outline exists it returns to the landing page saving nothing (R-288), while the outline generates it asks 「Leave this chat?」 (R-022), and once saved it leaves with no dialog (R-025).
- R-307 [PM:pm-0930-updates] System back during a short generation (storyboard, character, chat update) asks 「Stop and lose your credits?」/「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」 with Leave anyway / Keep Generating, as Back does (R-051).
- R-308 [PM:pm-0930-updates, pm-main-flow (10/13)] System back during video generation shows the toast 「We'll keep making your video. Find it in History.」 with no stop dialog, and the video keeps generating (R-071).
- R-309 [Req: REQ-022] The Android problem report (PowerDirector 16.8.0, Redmi Note 8 Pro, Android 11) is rechecked as regression leads through the rows listed under "Request ledger coverage"; each lead is judged against the spec, not the report.
- R-311 [PM:pm-main-flow (video settings status); DS:ds-video] While the video generates the chat shows 「I'll create a video - give me a moment...」 and an in-progress state until 「Here's your drama.」 with the video card replaces it. Missed by the iOS analysis (coverage pass 2, the video job's start/loading cell); found by the spec agent cross-check on 2026-10-27.
- R-312 [Build: TR261021-0082 RD Note (16.8.0.2610212)] AI Mini Drama after the 2610171 tag: character setup, stop/retry, outline and chat, History and clip previews; create, reopen, continue and delete dramas. Walked by: TC-033, TC-334, TC-063, TC-023, TC-104, TC-404, TC-143.
- R-313 [Build: TR261021-0082 RD Note (16.8.0.2610212)] The French and Japanese AI Mini Drama UI are fully translated (Japanese: TC-277).
- R-314 [Build: TR261021-0082 RD Note (16.8.0.2610212)] Seedance 2.5 is supported (Best). Walked by: TC-079.

### Open questions (Android)
- Q-A1 Android back on the Make your character sheet while it generates: the spec names Android back only for the
  generated result (PM 10/21 §13.23: like X). Does it act like X / Cancel there (「Stop and lose your credits?」)?
- Q-A2 Android tiers: MX version A gives the 100-chat dialog to 「Pro+ (and Android Premium)」 and names no 30-chat tier
  for Android. Is there a Pro (30) tier on Android? (Rows follow the tiers the app's debug tier switch offers.)
`;
req += ANDROID_REQ;
writeFileSync(join(HERE, 'requirements.md'), req + '\n');
copyFileSync(join(IOS_DRAFT, 'annotation-trace.json'), join(HERE, 'annotation-trace.json'));

for (const id of ['TC-033', 'TC-334', 'TC-063', 'TC-023', 'TC-104', 'TC-404', 'TC-143', 'TC-079']) {
  const r = byId().get(id)!; r.Notes = [r.Notes, 'Build check TR261021-0082 RD Note (2610212)'].filter(Boolean).join('; ');
}
for (const [lead, ids] of LEADS) for (const id0 of ids) {
  const id = replaced[id0] ?? id0;
  const r = byId().get(id); if (!r) throw new Error(`REQ-022 lead row ${id} missing`);
  if (!r['Spec Ref'].includes('R-309')) r['Spec Ref'] += ', R-309';
  r.Notes = [r.Notes, `REQ-022 lead ${lead.split(' ').filter(w => /^#|^S\d/.test(w)).join(' ').replace(/,$/, '')} (Android report 16.8.0)`].filter(Boolean).join('; ');
}
req = req.replace(/\bTC-\d{3}\b/g, m => replaced[m] ?? m);
req = req.replace(/(\| REQ-021 RD build notes)/, `| REQ-022 Android problem report (16.8.0) as regression leads | R-309: ${LEADS.map(([l, ids]) => `${l.split(' ').filter(w => /^#|^S\d/.test(w)).join(' ').replace(/,$/, '')} → ${ids.join(', ')}`).join('; ')} |\n$1`);
writeFileSync(join(HERE, 'requirements.md'), req + '\n');
writeTable(join(HERE, 'draft.csv'), DRAFT_COLUMNS, rows);

// ---------- run setup (phases.json): one full run on the Xperia, by journey stage like iOS P9 ----------
const iosPhases = JSON.parse(readFileSync(join(IOS_DRAFT, 'phases.json'), 'utf8'));
const STAGES: [string, string][] = [
  ['a', 'Entry, idea input, format card and story outline'], ['b', 'Characters and the cast picker'], ['c', 'Make your character'],
  ['d', 'Storyboard and Storyboard Preview'], ['e', 'Chat behaviour, History, text, languages and iOS leads'],
  ['f', 'Credits and limits (tier switching last; restore the tier)'], ['g', 'Video, video errors and captions (after the video gate)'],
  ['h', 'Offline, interruption and waits (Wi-Fi off and on, USB confirmed)'], ['i', 'Templates (cards; journeys Blocked by REQ-019)'],
  ['j', 'Fresh install and new account (each case reinstalls itself)'],
];
const stage: Record<string, string> = {};
for (const s of iosPhases.phases.find((p: any) => p.id === 'P9').segments) for (const c of s.cases) stage[c] = s.id.slice(3, 4);
for (const { after, row } of NEW) stage[row.ID] = stage[after];
for (const [id, after] of Object.entries(ticketAfter)) stage[id] = stage[after];
const needs: Record<string, string[]> = {};
for (const r of rows) {
  const n = [...(iosPhases.needs[r.ID] ?? []), ...(parked[r.ID] ?? [])].map(x => x === 'launch-language' ? 'app-language' : x);
  if (n.length) needs[r.ID] = [...new Set(n)];
}
const byStage: Record<string, string[]> = Object.fromEntries(STAGES.map(s => [s[0], []]));
for (const r of rows) {
  if (!stage[r.ID]) throw new Error(`no stage for ${r.ID}`);
  byStage[stage[r.ID]].push(r.ID);
}
const segments: { id: string; name: string; cases: string[] }[] = [];
for (const [k, name] of STAGES) {
  const cs = byStage[k]; if (!cs.length) continue;
  const parts = Math.ceil(cs.length / 40), size = Math.ceil(cs.length / parts);
  for (let i = 0; i < parts; i++) segments.push({ id: parts > 1 ? `A1-${k}${i + 1}` : `A1-${k}`, name: parts > 1 ? `${name} (${i + 1}/${parts})` : name, cases: cs.slice(i * size, (i + 1) * size) });
}
const unavailable: Record<string, string> = { ...iosPhases.unavailable };
unavailable['low-balance'] = 'the shared test account holds ~20,000 credits and the Android debug controls have no balance override';
unavailable['stt-failure'] = 'observability: no fault switch makes speech-to-text fail; ask RD for a fixture (observability)';
unavailable['paid-tier'] = 'test-data: Android 16.8 has no debug tier switch; needs a test account with a Pro subscription (ask the user)';
unavailable['permission-reset'] = 'test-data: resetting PowerDirector\'s media permission is an Android system setting; ask the user before the run';
unavailable['tablet'] = 'test-data: the run phone (Xperia 10 III) is not a tablet';
unavailable['app-language'] = 'test-data: switching the app language needs an Android system setting (Settings › Apps › PowerDirector › Language); ask the user before the run';
if (!ANDROID.faultSwitches) unavailable['fault-injection'] = 'observability: Android 16.8 has no fault switches (iOS Pink); ask RD for a fixture or a debug build';
writeFileSync(join(HERE, 'phases.json'), JSON.stringify({
  draft: DRAFT, current: ['A1'], needs, unavailable,
  phases: [{
    id: 'A1', name: 'Android round 1: complete full run on the Xperia 10 III (REQ-042)', round: true,
    note: 'Every row of the approved Android table, by journey stage (as iOS P9), on the Sony Xperia 10 III through scripts/device-android.ts. Preflight before A1-g: one template drama straight to a Seedance 2.0 preview, then run-log gate video pass|fail. TC-379 needs the 6xxx failure of TC-095 to be 3 hours old: start TC-095 early and come back. Templates run after everything but the fresh-install cases (rule 6).',
    origin: Object.fromEntries(rows.map(r => [r.ID, 'A1'])),
    segments,
  }],
}, null, 1) + '\n');
writeFileSync(join(HERE, 'parked.json'), JSON.stringify(parked, null, 1) + '\n');
console.log(JSON.stringify({ rows: rows.length, dropped: dropped.map(r => r.ID), added: NEW.map(n => n.row.ID), parked: Object.keys(parked).length, T }));

// ---------- update-plan.md ----------
const gapsFile = JSON.parse(readFileSync(join(HERE, 'spec-agent-gaps.json'), 'utf8'));
const gaps = [...gapsFile.gaps].sort((a: any, b: any) => +(a.source.kind !== 'spec') - +(b.source.kind !== 'spec'));
const kindOf = (d: string) => d.match(/^(added|covered|older spec|pass 7|not from the spec|low value)/)?.[1] ?? '?';
const gapCounts = gaps.reduce((m: Record<string, number>, g: any) => { const k = kindOf(g.decision); m[k] = (m[k] ?? 0) + 1; return m; }, {});
const parkedCount = Object.keys(parked).length;
writeFileSync(join(HERE, 'update-plan.md'), `# Update plan — pdr/ai-mini-drama / android: new table → draft ${DRAFT}

## Spec files
- Spec set specs/2026-10-21-2 (Design, MX, PM Spec 20261021), the set of the iOS table. No new spec files: the board
  notes, flow arrows, Figma frames and annotation trace of that set are reused.

## How the table was built (REQ-042)
- Started from the newest iOS analysis (draft ios/20261022-145212: R-001 – R-305, 392 rows, annotation trace of 475
  blocks), as skill step 0 allows for a second platform, then adapted to what the spec states for Android.
- Android rules found by reading every board note for 「Android」, system back and the platform toasts: R-306 – R-308
  (system back in every chat stage; Design 1016 ① and PM 0930), R-248 (Android back on the character result),
  R-249 (「Saved to Gallery.」), R-103 / R-142 (「Pro+ (and Android Premium)」 gets the 100-chat dialog), R-167
  (Android 13 notification permission). The Exit × stage grid gains a System back column.
- Rows: ${rows.length} (Change = new). New for Android: ${NEW.map(n => n.row.ID).join(', ')}; Android tickets: ${ticketRows.length} rows,
  ${folded.length} folded into existing rows${untriaged.length ? `, ${untriaged.length} not decided yet (${untriaged.join(', ')})` : ''}.
- iOS ticket rows: deleted (REQ-043: no iOS-only cases); ${Object.keys(replaced).length} of them had an Android ticket with the same symptom (${Object.entries(replaced).map(([a, b]) => `${a} → ${b}`).join(', ')}), the other ${iosLeadsDeleted.length} are gone.
- Test setup on Android (android-facts.json): fault switches 「${ANDROID.debug.trim()}」, tier switch ${ANDROID.tierPath ?? 'none (tier rows parked)'}, paid tier 「${PAID}」${ANDROID.midTier ? `, mid tier 「${ANDROID.midTier}」` : ', no 30-chat tier'}, language ${ANDROID.language}, Android ${ANDROID.android}.

## Found by the analysis
- REQ-022 (Android report, 16.8.0): ${LEADS.length} lead groups mapped to rows (R-309, "Request ledger coverage").
- Spec agent cross-check found what the iOS analysis missed too: TC-402 (pass 3, discard buttons), TC-403 (pass 8, sheet
  exits), TC-404 (pass 1, confirmed Delete), TC-405 (pass 2, video loading state, R-311). The skill's passes are
  sharpened for these; the iOS table lacks the same four checks (follow-up for the iOS table).

## Not added (value check)
- TC-329, TC-330, TC-331 (REQ-021 build checks): iOS TR261006-0055 RD note. The Android build notes are those of
  TR261021-0082 (16.8.0.2610212, the build on the phone): R-312 – R-314, folded into existing rows plus ${T.french} (French UI).
${ANDROID.midTier ? '' : '- TC-216, TC-367, TC-392 (iOS Pro, 30 chats): MX names no such tier for Android (Q-A2).\n'}- Character-sheet system back while generating: spec silent (Q-A1).

## Parked (phases.json → unavailable; recorded Blocked at run start)
- ${parkedCount} rows parked by the Android setup; the iOS needs carry over (video gate, purchase, low-balance, new-account,
  chat-count, voice, full-generation, stt-failure, slow-generation, remote-config, app-language).

## PM-only rows
- Unchanged from the iOS table (the Design spec of this set is the same); each keeps 「PM-only: no Design frame yet」.

## Spec agent cross-check
Spec agent ${gapsFile.spec_agent.commit} (${gapsFile.spec_agent.cases} Android cases), no Android mapping yet; ${gaps.length} gaps:
${Object.entries(gapCounts).map(([k, v]) => `${k} ${v}`).join(', ')}. Every gap, spec gaps first:
${gaps.map((g: any) => `- ${g.id} [${g.source.kind}: ${g.source.ref}] ${g.claim.replace(/\s+/g, ' ').slice(0, 140)} → ${g.decision}`).join('\n')}

## Run setup (phases.json)
- Phase A1 "Android round 1: complete full run" (REQ-042): every row by journey stage, as iOS P9; segments of at most 40.

## Questions for PM
- Q-A1 System back on Make your character while it generates (spec names Android back only for the result).
- Q-A2 Is there a 30-chat Pro tier on Android?

## Decided by you (2026-10-27, REQ-043)
- iOS-only cases deleted: the iOS ticket rows (${iosLeadsDeleted.length} left after the Android tickets: ${iosLeadsDeleted.join(', ')}).
- ${conflicts.length} Android tickets the spec contradicts are in the Notes of the neighbouring row, not rows: ${conflicts.join(', ')}.
- Paid-tier (Pro) rows stay Blocked (paid-tier) until a paid test account is arranged.
`);
