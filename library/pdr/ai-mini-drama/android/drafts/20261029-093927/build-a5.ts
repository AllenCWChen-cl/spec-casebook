// Round A5 (user, 2026-10-29, REQ-056): the round this draft planned as "A4" ran into the full A4 run of table v3
// (draft 20261028-164930, runs/2026-10-28-a4-full), which already ran every round-3 row. So this draft's round is A5 and
// keeps only the rows this draft adds or changes; A4 (the full run) is copied in from the v3 draft so the plan page
// shows it as an earlier run. Idempotent: rebuilds A4 and A5 from the v3 draft and this draft's planned round.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readRecords } from '../../../../../../scripts/lib/csv.ts';

const HERE = import.meta.dirname;
const phasesFile = join(HERE, 'phases.json');
const p = JSON.parse(readFileSync(phasesFile, 'utf8'));
const v3 = JSON.parse(readFileSync(join(HERE, '../20261028-164930/phases.json'), 'utf8'));
const fullA4 = v3.phases.find((x: any) => x.id === 'A4');
if (!fullA4 || fullA4.segments.reduce((a: number, s: any) => a + s.cases.length, 0) !== 486) throw new Error('v3 draft has no full A4');

// The planned round: "A4" before the first build, "A5" after it (its rows are a subset of the planned ones, so read the
// planned list from p.planned, saved on the first build).
const planned = p.planned_round ?? p.phases.find((x: any) => x.id === 'A4' && x.name.includes('20261029-093927'));
if (!planned) throw new Error('no planned round in phases.json');

const change: Record<string, string> = Object.fromEntries(
  readRecords(readFileSync(join(HERE, 'draft.csv'), 'utf8').replace(/^﻿/, '')).map(r => [r.ID, r.Change]));
const v3ids = new Set(fullA4.segments.flatMap((s: any) => s.cases));

const segments = planned.segments
  .map((s: any) => ({ id: s.id.replace(/^A4-/, 'A5-'), name: s.name, cases: s.cases.filter((c: string) => change[c] === 'new' || change[c] === 'modified') }))
  .filter((s: any) => s.cases.length);
const ids: string[] = segments.flatMap((s: any) => s.cases);
const origin = Object.fromEntries(ids.map(c => [c, change[c] === 'new' ? 'A5' : v3ids.has(c) ? 'A4' : planned.origin[c]]));

p.planned_round ??= planned;
p.phases = p.phases.filter((x: any) => x.id !== 'A4' && x.id !== 'A5');
p.phases.find((x: any) => x.id === 'A3').merged_into = 'A4';
p.phases.push({ ...fullA4, note: `${fullA4.note} Defined in draft 20261028-164930; copied here so this draft's plan shows it as an earlier run.` });
p.phases.push({
  id: 'A5', name: 'Android round 5: new and changed rows of draft 20261029-093927 (REQ-052, REQ-053, REQ-056)', round: true,
  note: `The ${ids.length} rows this draft adds (${ids.filter(c => change[c] === 'new').length}) or changes (${ids.filter(c => change[c] === 'modified').length}) (PM 10/22 frames, PM / MX flow arrows and PM / MX controls, REQ-052), each in the journey stage of the row it extends (REQ-033). The round-3 rows this draft leaves unchanged already ran in the full A4 run (REQ-054) and are not repeated. origin: A5 = new in this draft, A4 = a changed row last run in A4. TC-156 is removed. TC-518 is no longer parked: it reaches the export failure with Wi-Fi off (USB confirmed, Wi-Fi restored right after); if the export still saves offline, record it Blocked (observability: no fault switch on Android 16.8). Never buy or subscribe: TC-225 and TC-542 close the Google Play sheet. Signed in to the user's test account (REQ-045, REQ-047).`,
  origin, segments,
});
p.current = ['A5'];
writeFileSync(phasesFile, JSON.stringify(p, null, 1) + '\n');
console.log(`A5: ${ids.length} cases (planned ${planned.segments.reduce((a: number, s: any) => a + s.cases.length, 0)})`);
for (const s of segments) console.log(`  ${s.id} ${s.cases.length} ${s.name}`);
