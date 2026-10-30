// Round A6 (user, 2026-10-29, REQ-060): a fresh full run of table v4 — every active row, by journey stage, in segments of
// at most 40 (skill: Rounds). Stages come from the full A4 run; rows new in v4 take the stage the planned round gave them.
// Rows keep the file order of cases.csv. A5 never ran, so it is merged into A6. Idempotent: replaces A6 and makes it current.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = import.meta.dirname;
const phasesFile = join(HERE, 'phases.json');
const p = JSON.parse(readFileSync(phasesFile, 'utf8'));
const csv = readFileSync(join(HERE, '../../cases.csv'), 'utf8');
const ids = [...csv.matchAll(/^(TC-\d+),/gm)].map(m => m[1]);

const stage: Record<string, string> = {}, origin: Record<string, string> = {}, names: Record<string, string> = {};
const a4 = p.phases.find((x: any) => x.id === 'A4');
for (const s of a4.segments) {
  const k = s.id.split('-')[1].slice(0, 1);
  names[k] ??= s.name.replace(/ \(\d\/\d\)$/, '');
  for (const c of s.cases) { stage[c] = k; origin[c] = 'A4'; }
}
for (const s of p.planned_round.segments) {
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
    id: n > 1 ? `A6-${k}${i + 1}` : `A6-${k}`,
    name: n > 1 ? `${names[k]} (${i + 1}/${n})` : names[k],
    cases: cs.slice(i * size, (i + 1) * size),
  });
}

p.phases = p.phases.filter((x: any) => x.id !== 'A6');
p.phases.find((x: any) => x.id === 'A5').merged_into = 'A6';
p.phases.push({
  id: 'A6', name: 'Android round 6: fresh full run of table v4 (REQ-060)', round: true,
  note: `Every active row of table v4 (${ids.length}), by journey stage (REQ-033); templates before the fresh-install cases. origin: A4 = last run in the full A4 run, A5 = new in v4 (never run). Signed in to the user's test account (REQ-045, REQ-047); A1–A4 results are kept as earlier runs.`,
  origin, segments,
});
p.current = ['A6'];
writeFileSync(phasesFile, JSON.stringify(p, null, 1) + '\n');
console.log(`A6: ${ids.length} cases`); for (const s of segments) console.log(`  ${s.id} ${s.cases.length} ${s.name}`);
