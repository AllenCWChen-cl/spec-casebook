// Round A7 (user, 2026-10-29, REQ-061): a fresh full run of table v6 — every active row, by journey stage, in segments of
// at most 40 (skill: Rounds). A6 (the full run of table v4, stopped mid-A6-c1 to take v6) is copied in from draft
// 20261029-093927 as an earlier run. Stages come from A6; rows new since v4 take the stage the v5 draft's round A5 gave
// them. Rows keep the file order of cases.csv. A5 never ran, so it is merged into A7. Idempotent: rebuilds from the v5
// draft's phases.json and the v4 draft's A6.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = import.meta.dirname;
const p = JSON.parse(readFileSync(join(HERE, '../20261029-143528/phases.json'), 'utf8'));
const v4 = JSON.parse(readFileSync(join(HERE, '../20261029-093927/phases.json'), 'utf8'));
const a6 = v4.phases.find((x: any) => x.id === 'A6');
if (!a6) throw new Error('v4 draft has no A6');
const csv = readFileSync(join(HERE, '../../cases.csv'), 'utf8');
const ids = [...csv.matchAll(/^(TC-\d+),/gm)].map(m => m[1]);

const stage: Record<string, string> = {}, origin: Record<string, string> = {}, names: Record<string, string> = {};
for (const s of a6.segments) {
  const k = s.id.split('-')[1].slice(0, 1);
  names[k] ??= s.name.replace(/ \(\d\/\d\)$/, '');
  for (const c of s.cases) { stage[c] = k; origin[c] = 'A6'; }
}
for (const s of p.phases.find((x: any) => x.id === 'A5').segments) {
  const k = s.id.split('-')[1].slice(0, 1);
  for (const c of s.cases) if (!stage[c]) { stage[c] = k; origin[c] = 'A5'; }
}
const missing = ids.filter(c => !stage[c]);
if (missing.length) throw new Error(`no stage for ${missing.join(' ')}`);

const MAX = 40;
const segments: { id: string; name: string; cases: string[] }[] = [];
for (const k of Object.keys(names).sort()) {
  const cs = ids.filter(c => stage[c] === k);
  if (!cs.length) continue;
  const n = Math.ceil(cs.length / MAX), size = Math.ceil(cs.length / n);
  for (let i = 0; i < n; i++) segments.push({
    id: n > 1 ? `A7-${k}${i + 1}` : `A7-${k}`,
    name: n > 1 ? `${names[k]} (${i + 1}/${n})` : names[k],
    cases: cs.slice(i * size, (i + 1) * size),
  });
}

p.draft = '20261029-152721';
p.phases = p.phases.filter((x: any) => x.id !== 'A6' && x.id !== 'A7');
p.phases.find((x: any) => x.id === 'A5').merged_into = 'A7';
p.phases.push({ ...a6, note: `${a6.note} Stopped by the user mid-A6-c1 (2026-10-29 ~16:00) to take table v6. Defined in draft 20261029-093927; copied here so this draft's plan shows it as an earlier run.` });
p.phases.push({
  id: 'A7', name: 'Android round 7: fresh full run of table v6 (REQ-061)', round: true,
  note: `Every active row of table v6 (${ids.length}), by journey stage (REQ-033); templates before the fresh-install cases. Prices are the MX charging sheet's original prices (REQ-059); TC-231 is removed (promotion price held). origin: A6 = in the stopped A6 run, A5 = new since v4 (never run). Signed in to the user's test account (REQ-045, REQ-047); A1–A6 results are kept as earlier runs.`,
  origin, segments,
});
p.current = ['A7'];
writeFileSync(join(HERE, 'phases.json'), JSON.stringify(p, null, 1) + '\n');
console.log(`A7: ${ids.length} cases`); for (const s of segments) console.log(`  ${s.id} ${s.cases.length} ${s.name}`);
