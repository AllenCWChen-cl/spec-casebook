// Round A4 (user, 2026-10-28, REQ-054): a full run of table v3 — every active row, by journey stage, in segments of
// at most 40 (skill: Rounds). Stages come from the A1 / A2 / A3 segments; rows keep the file order of cases.csv.
// Idempotent: replaces A4 in phases.json, marks A3 merged into it and makes A4 current.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = import.meta.dirname;
const phasesFile = join(HERE, 'phases.json');
const p = JSON.parse(readFileSync(phasesFile, 'utf8'));
const csv = readFileSync(join(HERE, '../../cases.csv'), 'utf8');
const ids = [...csv.matchAll(/^(TC-\d+),/gm)].map(m => m[1]);

const stage: Record<string, string> = {}, origin: Record<string, string> = {}, names: Record<string, string> = {};
for (const id of ['A1', 'A2', 'A3']) {
  const ph = p.phases.find((x: any) => x.id === id);
  for (const s of ph.segments) {
    const k = s.id.split('-')[1].slice(0, 1);
    names[k] ??= s.name.replace(/ \(\d\/\d\)$/, '');
    for (const c of s.cases) { stage[c] = k; origin[c] = id; }
  }
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
    id: n > 1 ? `A4-${k}${i + 1}` : `A4-${k}`,
    name: n > 1 ? `${names[k]} (${i + 1}/${n})` : names[k],
    cases: cs.slice(i * size, (i + 1) * size),
  });
}

p.phases = p.phases.filter((x: any) => x.id !== 'A4');
p.phases.find((x: any) => x.id === 'A3').merged_into = 'A4';
p.phases.push({
  id: 'A4', name: 'Android round 4: full run of table v3 (REQ-054)', round: true,
  note: `Every active row of table v3 (${ids.length}), by journey stage (REQ-033); templates before the fresh-install cases. Signed in to the user's test account (REQ-045, REQ-047); A1–A3 results are kept as earlier runs.`,
  origin, segments,
});
p.current = ['A4'];
writeFileSync(phasesFile, JSON.stringify(p, null, 1) + '\n');
console.log(`A4: ${ids.length} cases`); for (const s of segments) console.log(`  ${s.id} ${s.cases.length} ${s.name}`);
