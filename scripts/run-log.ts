// Record and summarise case results for an on-device run of a table.
// Usage:
//   node scripts/run-log.ts <run dir> init <table csv> [--phase <phases.json> <P1>]
//                                                                  copy the case list (or one phase of it) into results.csv
//                                                                  and start <run dir>/run-state.md
//   node scripts/run-log.ts <run dir> checkpoint "<state>"         append a timestamped checkpoint to run-state.md
//   node scripts/run-log.ts <run dir> next                         where to resume: segment, next case, last checkpoint
//   node scripts/run-log.ts <run dir> time [--idle 15]             test time vs idle time (gaps over --idle minutes with no
//                                                                  activity, e.g. a usage-limit wait), per segment and case
//   node scripts/run-log.ts <run dir> set <ID> <Result> "<what happened>" [--as <disposition>] [evidence files...]
//   node scripts/run-log.ts <run dir> summary                      counts by result and disposition, then the open cases
//   node scripts/run-log.ts <run dir> gate <need> pass|fail "<evidence>"
//                                                                  record a phase preflight (e.g. video). fail: every Not run
//                                                                  case that needs it becomes Blocked (defect) "Gate <need>
//                                                                  failed …" and joins the retest queue
//   node scripts/run-log.ts <run dir> retest                       cases Blocked by a gate (and listed upstream), to re-run
// phases.json may tag cases: top-level "needs": { "<case>": ["video" | "purchase" | …] } and "unavailable":
// { "<need>": "<why this run can't provide it>" }. `init` records cases needing an unavailable fixture as Blocked
// (test-data, or the disposition a reason starts with, e.g. "observability: …") right away, so nobody walks to them; a merged phase lists "origin": { "<case>": "P2" } for the report.
// Results: Pass, Fail, Blocked, Inconclusive, Not run.
// Dispositions (required for Fail and Blocked, optional otherwise):
//   defect          the build misses or breaks applicable required behavior (Fail; missing behavior is a Fail, not Blocked)
//   spec-addition   behavior seen at runtime that no spec covers; ask PM/Design to add it
//   question        the spec covers it but its meaning is unclear; queued and asked only after the full run
//   observability   the claim can't be observed or forced with current controls; ask RD for a diagnostic/fixture
//   test-data       a fixture, account state or device setting this run can't provide
// Inconclusive means the evidence is incomplete: it goes to the recovery queue and is re-run, never counted as a pass.
// results.csv columns: ID, Segment, Section, Action, Expected Result, Result, Disposition, Actual, Evidence, Recorded At
// A segment (phases.json) is the unit of work between context resets: finish it, `checkpoint`, then continue in a
// fresh context that starts with `next`. The checkpoint text must hold everything the next context needs that the
// files don't: Pink toggles currently on, tier, the drama/chat in use and its stage, credit balance, last log pull.
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readRecords, writeRecords } from './lib/csv.ts';

const COLS = ['ID', 'Phase', 'Segment', 'Needs', 'Section', 'Action', 'Expected Result', 'Result', 'Disposition', 'Actual', 'Evidence', 'Recorded At'];
const RESULTS = ['Pass', 'Fail', 'Blocked', 'Inconclusive', 'Not run'];
const DISPOSITIONS = ['defect', 'spec-addition', 'question', 'observability', 'test-data'];
const [runDir, cmd, ...rest] = process.argv.slice(2);
if (!runDir || !cmd) { console.error('Usage: node scripts/run-log.ts <run dir> init|set|summary|checkpoint|next|time|gate|retest ...'); process.exit(2); }
const file = join(runDir, 'results.csv');
const STATE = join(runDir, 'run-state.md');
const load = () => readRecords(readFileSync(file, 'utf8'));
const stampAct = (what: string) => { try { appendFileSync(join(runDir, 'activity.log'), `${new Date().toISOString()} run-log ${what}\n`); } catch {} };
const save = (rows: Record<string, string>[]) => writeFileSync(file, writeRecords(COLS, rows));

if (cmd === 'init') {
  mkdirSync(runDir, { recursive: true });
  if (existsSync(file)) { console.error(`${file} exists; not overwriting.`); process.exit(1); }
  let cases = readRecords(readFileSync(rest[0], 'utf8')).filter(r => r.Change !== 'removed');
  const seg: Record<string, string> = {}; let phaseName = 'all cases';
  let needs: Record<string, string[]> = {}, unavailable: Record<string, string> = {}, origin: Record<string, string> = {}, phaseId = '';
  const pi = rest.indexOf('--phase');
  if (pi >= 0) {
    const all = JSON.parse(readFileSync(rest[pi + 1], 'utf8'));
    needs = all.needs ?? {}; unavailable = all.unavailable ?? {};
    const ph = all.phases.find((p: any) => p.id === rest[pi + 2]);
    if (!ph) throw new Error(`No phase ${rest[pi + 2]} in ${rest[pi + 1]}`);
    if (ph.skip) { console.error(`Phase ${ph.id} is marked skip: ${ph.skip}`); process.exit(3); }
    if (ph.hold && !process.env.CASEBOOK_RELEASE_HOLD) { console.error(`Phase ${ph.id} is on hold: ${ph.hold}`); process.exit(4); }
    if (ph.merged_into) { console.error(`Phase ${ph.id} runs inside ${ph.merged_into}; init that phase instead.`); process.exit(5); }
    phaseName = `${ph.id} ${ph.name}`; phaseId = ph.id; origin = ph.origin ?? {};
    for (const sg of ph.segments) for (const id of sg.cases) seg[id] = sg.id;
    const order = ph.segments.flatMap((sg: any) => sg.cases);
    cases = order.map((id: string) => cases.find(c => c.ID === id)!).filter(Boolean);
  }
  writeFileSync(STATE, `# Run state — ${phaseName}\n\nTable: ${rest[0]}\nStarted: ${new Date().toISOString()}\n\n` +
    `## Environment\n(build, server, device, tier, credit balance, Pink toggles, Log stage timings, Write Log)\n\n## Checkpoints\n`);
  const now = new Date().toISOString(); let pre = 0;
  save(cases.map(c => {
    const nd = needs[c.ID] ?? []; const miss = nd.filter(n => unavailable[n]);
    const row = { ID: c.ID, Phase: origin[c.ID] ?? phaseId, Segment: seg[c.ID] ?? '', Needs: nd.join(' '), Section: c.Section, Action: c.Action, 'Expected Result': c['Expected Result'], Result: 'Not run', Disposition: '', Actual: '', Evidence: '', 'Recorded At': '' };
    // A reason may start with its disposition ("observability: no fault switch…"); the default is test-data.
    const as = miss.map(n => unavailable[n].match(/^([a-z-]+):\s/)?.[1]).find(d => d && DISPOSITIONS.includes(d)) ?? 'test-data';
    if (miss.length) { pre++; Object.assign(row, { Result: 'Blocked', Disposition: as, Actual: `Not run by policy: needs ${miss.map(n => `${n} (${unavailable[n]})`).join('; ')}`, 'Recorded At': now }); }
    return row;
  }));
  console.log(`${cases.length} cases → ${file}${pre ? `; ${pre} recorded Blocked up front because they need an unavailable fixture` : ''}`);
} else if (cmd === 'set') {
  const args = [...rest];
  const ai = args.indexOf('--as');
  const disposition = ai >= 0 ? args.splice(ai, 2)[1] : '';
  const [id, result, actual, ...evidence] = args;
  if (!RESULTS.includes(result)) throw new Error(`Result must be one of ${RESULTS.join(', ')}`);
  if (disposition && !DISPOSITIONS.includes(disposition)) throw new Error(`--as must be one of ${DISPOSITIONS.join(', ')}`);
  if ((result === 'Fail' || result === 'Blocked') && !disposition) throw new Error(`${result} needs --as <${DISPOSITIONS.join('|')}>`);
  const rows = load(); const r = rows.find(x => x.ID === id);
  if (!r) throw new Error(`No case ${id} in ${file}`);
  Object.assign(r, { Result: result, Disposition: disposition, Actual: actual ?? '', Evidence: evidence.join(' '), 'Recorded At': new Date().toISOString() });
  save(rows); stampAct(`set ${id} ${result}`); console.log(`${id}: ${result}${disposition ? ` (${disposition})` : ''}`);
} else if (cmd === 'summary') {
  const rows = load(); const c: Record<string, number> = {}; const d: Record<string, number> = {};
  for (const r of rows) { c[r.Result] = (c[r.Result] ?? 0) + 1; if (r.Disposition) d[r.Disposition] = (d[r.Disposition] ?? 0) + 1; }
  console.log(JSON.stringify(c));
  if (Object.keys(d).length) console.log(JSON.stringify({ dispositions: d }));
  for (const r of rows.filter(r => ['Fail', 'Blocked', 'Inconclusive'].includes(r.Result)))
    console.log(`${r.Result.padEnd(12)} ${(r.Disposition || '-').padEnd(13)} ${r.ID} ${r.Actual}`);
} else if (cmd === 'checkpoint') {
  const rows = load(); const c: Record<string, number> = {};
  for (const r of rows) c[r.Result] = (c[r.Result] ?? 0) + 1;
  const open = rows.find(r => r.Result === 'Not run' || r.Result === 'Inconclusive');
  appendFileSync(STATE, `\n### ${new Date().toISOString()}${open ? ` · next ${open.ID} (${open.Segment || '-'})` : ' · all recorded'}\n` +
    `${JSON.stringify(c)}\n\n${rest.join(' ')}\n`);
  console.log(`checkpoint written to ${STATE}`);
} else if (cmd === 'next') {
  const rows = load(); const c: Record<string, number> = {};
  for (const r of rows) c[r.Result] = (c[r.Result] ?? 0) + 1;
  const pending = rows.filter(r => r.Result === 'Not run');
  const recover = rows.filter(r => r.Result === 'Inconclusive');
  console.log(JSON.stringify(c));
  if (existsSync(STATE)) { const st = readFileSync(STATE, 'utf8'); const i = st.lastIndexOf('\n### '); console.log('\nLast checkpoint:' + (i >= 0 ? st.slice(i) : ' none')); }
  if (pending.length) {
    const n = pending[0]; const segLeft = pending.filter(r => r.Segment === n.Segment).length;
    console.log(`\nNext: ${n.ID} in segment ${n.Segment || '-'} (${segLeft} left in it, ${pending.length} left in this run)\n  ${n.Section}: ${n.Action}\n  Expected: ${n['Expected Result']}`);
  } else console.log('\nNo Not run cases left.');
  if (recover.length) console.log(`Recovery queue (Inconclusive): ${recover.map(r => r.ID).join(', ')}`);
} else if (cmd === 'time') {
  // Activity points: activity.log lines, results' Recorded At, and evidence file times (screenshots, logs, ledger).
  const idleMin = Number(rest[rest.indexOf('--idle') + 1]) || 15;
  const pts: number[] = [];
  const act = join(runDir, 'activity.log');
  if (existsSync(act)) for (const l of readFileSync(act, 'utf8').split('\n')) { const t = Date.parse(l.split(' ')[0]); if (t) pts.push(t); }
  const rows = load();
  for (const r of rows) { const t = Date.parse(r['Recorded At']); if (t) pts.push(t); }
  const walk = (d: string): string[] => existsSync(d) ? readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; }) : [];
  for (const sub of ['screenshots', 'ledger']) for (const f of walk(join(runDir, sub))) pts.push(statSync(f).mtimeMs);
  for (const f of existsSync(join(runDir, 'logs')) ? readdirSync(join(runDir, 'logs')) : []) pts.push(statSync(join(runDir, 'logs', f)).mtimeMs);
  pts.sort((a, b) => a - b);
  if (pts.length < 2) { console.log('Not enough activity yet.'); }
  else {
    const cap = idleMin * 60_000; let active = 0; const idle: [number, number][] = [];
    for (let i = 1; i < pts.length; i++) { const g = pts[i] - pts[i - 1]; if (g <= cap) active += g; else idle.push([pts[i - 1], pts[i]]); }
    const hm = (ms: number) => `${Math.floor(ms / 3_600_000)}h ${String(Math.round(ms / 60_000) % 60).padStart(2, '0')}m`;
    const activeBetween = (a: number, b: number) => { let s = 0; for (let i = 1; i < pts.length; i++) { if (pts[i] <= a || pts[i - 1] >= b) continue; const lo = Math.max(pts[i - 1], a), hi = Math.min(pts[i], b); const g = pts[i] - pts[i - 1]; if (g <= cap) s += hi - lo; } return s; };
    console.log(`wall ${hm(pts.at(-1)! - pts[0])} (${new Date(pts[0]).toISOString()} → ${new Date(pts.at(-1)!).toISOString()})`);
    console.log(`test time ${hm(active)} · idle ${hm(idle.reduce((s, [a, b]) => s + b - a, 0))} in ${idle.length} gap(s) over ${idleMin} min`);
    for (const [a, b] of idle) console.log(`  idle ${new Date(a).toISOString()} → ${new Date(b).toISOString()} (${hm(b - a)})`);
    const done = rows.filter(r => Date.parse(r['Recorded At'])).sort((a, b) => Date.parse(a['Recorded At']) - Date.parse(b['Recorded At']));
    const seg: Record<string, number> = {}; let prev = pts[0];
    const per: string[] = [];
    for (const r of done) { const t = Date.parse(r['Recorded At']); const a = activeBetween(prev, t); seg[r.Segment || '-'] = (seg[r.Segment || '-'] ?? 0) + a; per.push(`  ${r.ID} ${(r.Segment || '-').padEnd(5)} ${hm(a)}`); prev = t; }
    console.log('per segment (test time up to each recorded case):'); for (const [k, v] of Object.entries(seg)) console.log(`  ${k.padEnd(5)} ${hm(v)}`);
    if (rest.includes('--cases')) { console.log('per case:'); per.forEach(l => console.log(l)); }
  }
} else if (cmd === 'gate') {
  // A phase preflight, e.g. one Seedance 2.0 preview before any video case. Recorded in run-state.md either way.
  const [need, verdict, ...ev] = rest; const evidence = ev.join(' ');
  if (!need || !['pass', 'fail'].includes(verdict)) throw new Error('gate <need> pass|fail "<evidence>"');
  const rows = load(); const now = new Date().toISOString(); const hit: string[] = [];
  if (verdict === 'fail') for (const r of rows) if (r.Result === 'Not run' && (r.Needs ?? '').split(' ').includes(need)) {
    Object.assign(r, { Result: 'Blocked', Disposition: 'defect', Actual: `Gate ${need} failed ${now.slice(0, 16)}Z: ${evidence} — retest queue`, 'Recorded At': now }); hit.push(r.ID);
  }
  save(rows); stampAct(`gate ${need} ${verdict}`);
  appendFileSync(STATE, `\n### ${now} · gate ${need} ${verdict}\n${hit.length ? `Blocked: ${hit.join(', ')}` : 'no cases changed'}\n\n${evidence}\n`);
  console.log(`gate ${need}: ${verdict}${hit.length ? ` — ${hit.length} cases Blocked: ${hit.join(', ')}` : ''}`);
} else if (cmd === 'retest') {
  const rows = load().filter(r => r.Result === 'Blocked' && /^Gate \S+ failed|upstream|video failure|retest/i.test(r.Actual));
  console.log(rows.length ? rows.map(r => `${r.ID} ${(r.Segment || '-').padEnd(5)} ${r.Actual.slice(0, 140)}`).join('\n') : 'No gate-blocked cases.');
} else { console.error(`Unknown command ${cmd}`); process.exit(2); }
