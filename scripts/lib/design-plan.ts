// Design check plan (figma skill, references/conformance.md): one entry per Design screen that figma-source read,
// with the casebook row that reaches it on the phone. The casebook analysis already traced every flow arrow and every
// control to rows, so no separate navigation plan is written: a screen is reached by
//   on      a row that presses a control drawn on this screen (inventory.json controls → control-trace.json press)
//   arrow   a row that walks a flow arrow ending on this screen (inventory.json arrows → requirements.md → rows)
// Shared controls (back, close, tab bar) sit on dozens of screens, so a row pressing one says little about which screen
// it was on: each way gets a `fit` — high for an arrow into the screen or a control on at most 3 screens, mid up to 10,
// low beyond. The baseline is the row with the best fit, then the best latest result (Pass, then Fail, then anything
// else), then the earliest in the journey (phases.json segment order); up to four others are kept as alternatives. On
// a low fit the row only reaches the area: the runner brings about the state the screen's name shows (a failure, an
// empty list) the way the row's Precondition does for its own state.
// On its own (user, 2026-11-03): with no casebook table, or for a screen no row reaches, the route is the shortest
// path along the Design's own flow arrows (figma-source out/arrows.json) from a screen no arrow leads into (`how:
// figma`, `steps`: each screen and the control pressed on it). When the feature has a casebook table, such a screen is
// also marked `gap`: a Design screen the table has no row for, which the analysis answers (reading-the-spec / analysis
// passes), not the design check. A screen no arrow reaches takes the path of the nearest reached screen on its board
// (`fit: variant`: a state drawn beside it). A screen with none of these is `no-route`.
// Reads specs/<set>/extracted/figma-source/design/out/ (screens.json and the board files; rebuilt by figma-source.ts
// merge), extracted/inventory.json, arrows.json and figma/shots.json, the table's cases.csv, requirements.md and
// control-trace.json, the newest phases.json and every runs/*/results.csv. Writes <table>/design/plan.json (committed).
// The plan is built again whenever one of those inputs is newer than it (planFresh), keeping its skip list.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { readRecords } from './csv.ts';
import { arrowRequirement, requirementRows, tcList } from './coverage.ts';
import { draftsDir, featureDir, readTable, tableDir, writeJson } from './library.ts';
import { listSpecSets } from './specs.ts';

const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
export const planPath = (feature: string, platform: string) => join(tableDir(feature, platform), 'design', 'plan.json');

// the newest spec set with a figma-source Design read (its committed responses; out/ is rebuilt from them)
export function designSet(feature: string) {
  const specs = join(featureDir(feature), 'specs'), src = (s: string) => join(specs, s, 'extracted', 'figma-source', 'design');
  return [...listSpecSets(feature)].reverse().map(s => s.folder).find(s => existsSync(join(src(s), 'out', 'screens.json'))
    || (existsSync(join(src(s), 'responses')) && readdirSync(join(src(s), 'responses')).some(f => f.startsWith('chunk-'))));
}

// A computer that pulled the repo has the responses and the shared board images but no out/: rebuild it (merge, then
// crop), with no Figma call. Also when the responses are newer than out/ (someone else read a changed board).
export function ensureSource(feature: string, set: string, quiet = false) {
  const dir = join(featureDir(feature), 'specs', set, 'extracted', 'figma-source', 'design'), out = join(dir, 'out', 'screens.json');
  const resp = join(dir, 'responses');
  const newest = existsSync(resp) ? Math.max(0, ...readdirSync(resp).map(f => statSync(join(resp, f)).mtimeMs)) : 0;
  if (existsSync(out) && statSync(out).mtimeMs >= newest) return;
  for (const step of ['merge', 'crop']) {
    const r = spawnSync(process.execPath, [join(import.meta.dirname, '..', 'figma-source.ts'), feature, set, step, 'design'], { encoding: 'utf8' });
    if (!quiet) console.log(`(figma-source ${step}: ${(r.stdout || r.stderr).trim().split('\n').at(-1)})`);
    if (r.status !== 0 && step === 'merge') throw new Error(`figma-source merge failed: ${(r.stderr || r.stdout).trim()}`);
  }
}

// the plan as it stands, built again first when an input changed since (or when there is none)
export function planFresh(feature: string, platform: string, quiet = false) {
  const p = planPath(feature, platform), table = tableDir(feature, platform);
  const old = existsSync(p) ? read(p) : null, set = designSet(feature) ?? old?.spec_set;
  if (set) ensureSource(feature, set, quiet);
  const ex = set && join(featureDir(feature), 'specs', set, 'extracted');
  const inputs = [join(table, 'cases.csv'), join(table, 'requirements.md'), join(table, 'control-trace.json'),
    ...(ex ? [join(ex, 'figma-source', 'design', 'out', 'screens.json'), join(ex, 'inventory.json')] : [])].filter(existsSync);
  const stale = !old || old.spec_set !== set || inputs.some(f => statSync(f).mtimeMs > Date.parse(old.built_at));
  if (!stale) return old;
  const plan = buildPlan(feature, platform, { set, skip: old?.skip, skipReason: old?.skip_reason });
  if (!quiet) console.log(`(plan built again: ${old ? 'its inputs changed' : 'there was none'}) ${summary(plan)}`);
  return plan;
}

export const summary = (plan: any) => {
  const fits = ['high', 'mid', 'low'].map(f => `${plan.screens.filter((e: any) => e.route?.fit === f).length} ${f}`).join(' / ');
  return `${plan.counts.screens} screens, ${plan.counts.routed - (plan.counts.figma_paths ?? 0)} reached by ${Object.keys(plan.by_case).length} rows (fit ${fits}), ` +
    `${plan.counts.figma_paths ?? 0} by Design arrows only${plan.casebook ? ` (${plan.counts.gaps} gaps in the table)` : ' (no casebook table)'}, ${plan.counts.no_route} no route, ${plan.counts.excluded} excluded`;
};

export function buildPlan(feature: string, platform: string, opt: { set?: string; skip?: string[]; skipReason?: string } = {}): any {
  const specs = join(featureDir(feature), 'specs'), table = tableDir(feature, platform);
  const set = opt.set ?? designSet(feature);
  if (set) ensureSource(feature, set, true);
  if (!set) throw new Error('No spec set with figma-source/design/out/screens.json: read the Design boards first (figma skill, references/source.md), or run figma-source.ts merge.');
  const ex = join(specs, set, 'extracted'), out = join(ex, 'figma-source', 'design', 'out');
  const skip = new Set(opt.skip ?? []), skipReason = opt.skipReason ?? 'skipped';

  const frames = existsSync(join(ex, 'figma-frames.json')) ? read(join(ex, 'figma-frames.json')) : {};
  const inv = existsSync(join(ex, 'inventory.json')) ? read(join(ex, 'inventory.json')) : { screens: [], controls: [], arrows: [] };
  const edges = new Map<string, any>((existsSync(join(ex, 'arrows.json')) ? read(join(ex, 'arrows.json')).arrows : []).map((a: any) => [a.arrow, a]));
  const shots = existsSync(join(ex, 'figma', 'shots.json')) ? read(join(ex, 'figma', 'shots.json')) : {};
  const hasTable = existsSync(join(table, 'cases.csv'));
  const rows = hasTable ? readTable(join(table, 'cases.csv')) : [], row = new Map(rows.map(r => [r.ID, r]));
  const reqText = existsSync(join(table, 'requirements.md')) ? readFileSync(join(table, 'requirements.md'), 'utf8') : '';
  const reqRows = requirementRows(rows, reqText);
  const trace = existsSync(join(table, 'control-trace.json')) ? read(join(table, 'control-trace.json')).entries : [];
  const pressBy = new Map<string, string[]>(trace.map((e: any) => [e.group, tcList(e.press ?? '')]));

  // journey order: the newest phases.json, segment by segment
  const drafts = existsSync(draftsDir(feature, platform)) ? readdirSync(draftsDir(feature, platform)).sort().reverse() : [];
  const phasesFile = drafts.map(d => join(draftsDir(feature, platform), d, 'phases.json')).find(existsSync);
  const order = new Map<string, { i: number; seg: string }>();
  for (const ph of phasesFile ? read(phasesFile).phases : []) for (const sg of ph.segments ?? []) for (const c of sg.cases ?? [])
    if (!order.has(c)) order.set(c, { i: order.size, seg: sg.id });

  // latest result per case over every run folder
  const latest = new Map<string, { result: string; run: string; at: number }>();
  const runsDir = join(table, 'runs');
  for (const d of existsSync(runsDir) ? readdirSync(runsDir).filter(d => statSync(join(runsDir, d)).isDirectory()) : []) {
    const rc = join(runsDir, d, 'results.csv');
    if (!existsSync(rc)) continue;
    for (const r of readRecords(readFileSync(rc, 'utf8'))) {
      const at = Date.parse(r['Recorded At']) || 0;
      if (r.ID && (latest.get(r.ID)?.at ?? -1) <= at) latest.set(r.ID, { result: r.Result || 'Not run', run: d, at });
    }
  }

  // figma-source screens, matched to inventory screens by id, else by the largest overlap on the canvas
  const screens: any[] = read(join(out, 'screens.json'));
  const boards = new Map<string, any>();
  for (const s of screens) if (!boards.has(s.board)) {
    const f = join(out, `${s.board.replace(/[:;]/g, '-')}.json`);
    boards.set(s.board, existsSync(f) ? read(f).board : { id: s.board, name: s.board });
  }
  const overlap = (a: number[], b: number[]) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  const invScreen = (s: any) => inv.screens.find((x: any) => x.id === s.id)
    ?? inv.screens.filter((x: any) => x.box && overlap(x.box, s.abs) > 0.5 * s.abs[2] * s.abs[3]).sort((a: any, b: any) => overlap(b.box, s.abs) - overlap(a.box, s.abs))[0];

  // the Design's own flow arrows: the shortest path to each screen from an entry screen (no arrow leads into it)
  const names = new Map<string, string>(screens.map(s => [s.id, s.name]));
  const nodeName = (id: string, board: string) => { const f = join(out, `${board.replace(/[:;]/g, '-')}.json`);
    if (!nodeNames.has(board)) nodeNames.set(board, new Map(existsSync(f) ? read(f).nodes.map((n: any) => [n.id, n.text?.characters?.trim() || n.name]) : []));
    return nodeNames.get(board)!.get(id) ?? id; };
  const nodeNames = new Map<string, Map<string, string>>();
  const flows = (existsSync(join(out, 'arrows.json')) ? read(join(out, 'arrows.json')) : []).filter((a: any) => a.kind !== 'pointer' && a.from && a.to && a.from !== a.to && names.has(a.from) && names.has(a.to));
  const into = new Set(flows.map((a: any) => a.to)), path = new Map<string, any[]>();
  const queue = [...new Set(flows.map((a: any) => a.from).filter((f: string) => !into.has(f)))] as string[];
  for (const q of queue) path.set(q, []);
  while (queue.length) { const at = queue.shift()!;
    for (const a of flows.filter((a: any) => a.from === at && !path.has(a.to))) {
      path.set(a.to, [...path.get(at)!, { screen: names.get(at), control: a.control ? nodeName(a.control, a.board) : '(arrow without a control)', arrow: a.id }]); queue.push(a.to); } }
  // a screen no arrow reaches is usually a state drawn beside one that is (a failure, an empty list, a loading frame):
  // the nearest reached screen on the same board, then bring about the state its name says
  const variantOf = (s: any) => screens.filter(x => x.board === s.board && x.id !== s.id && path.has(x.id))
    .sort((a, b) => Math.hypot(a.abs[0] - s.abs[0], (a.abs[1] - s.abs[1]) * 2) - Math.hypot(b.abs[0] - s.abs[0], (b.abs[1] - s.abs[1]) * 2))[0];

  const groupScreens = new Map<string, Set<string>>();
  for (const c of inv.controls) for (const sc of c.screens ?? []) { if (!groupScreens.has(c.group)) groupScreens.set(c.group, new Set()); groupScreens.get(c.group)!.add(sc); }
  const fitOf = (n: number) => n <= 3 ? 2 : n <= 10 ? 1 : 0;
  const score = (tc: string) => ({ Pass: 3, Fail: 2, Inconclusive: 1 } as Record<string, number>)[latest.get(tc)?.result ?? ''] ?? 0;
  const active = new Set(rows.filter(r => r.Change !== 'removed').map(r => r.ID));
  const entries = screens.map(s => {
    const board = boards.get(s.board), ivs = invScreen(s), sid = ivs?.id ?? s.id;
    const png = Object.entries(shots).find(([, v]: any) => v.board === s.board)?.[0];
    const base = { id: s.id, name: s.name, board: s.board, board_name: board?.name ?? s.board, abs: s.abs, board_box: board?.box ?? null,
      board_png: png ? `specs/${set}/extracted/figma/${png}` : null, inventory_screen: ivs?.id ?? null };
    if (skip.has(s.board) || skip.has(s.id)) return { ...base, status: 'excluded', why: skipReason };
    const ways: { tc: string; how: string; via: string; edge?: string; fit: number }[] = [];
    for (const c of inv.controls.filter((c: any) => c.screens?.includes(sid)))
      for (const tc of pressBy.get(c.group) ?? []) if (active.has(tc)) ways.push({ tc, how: 'on', via: c.group, edge: c.label || c.name, fit: fitOf(groupScreens.get(c.group)?.size ?? 1) });
    for (const a of inv.arrows.filter((a: any) => a.to === sid && a.kind !== 'pointer')) {
      const r = arrowRequirement(reqText, a.id);
      for (const tc of r ? reqRows(r) : []) ways.push({ tc, how: 'arrow', via: a.id, edge: edges.get(a.id)?.edge, fit: 2 });
    }
    if (!ways.length) {
      const near = path.has(s.id) ? null : variantOf(s);
      const steps = path.get(s.id) ?? (near && [...path.get(near.id)!, { screen: near.name, control: `(bring about 「${s.name}」 here)`, variant_of: near.id }]);
      if (steps) return { ...base, status: 'routed', ...(hasTable ? { gap: true } : {}),
        route: { case: '', how: 'figma', fit: near ? 'variant' : steps.length ? 'path' : 'entry', steps, edge: steps.at(-1)?.control ?? '', segment: '', section: '', precondition: '', action: steps.length ? steps.map((x: any) => `${x.screen} › ${x.control}`).join(' › ') : 'the first screen of its flow', result: '', run: '' }, alternatives: [] };
      return { ...base, status: 'no-route', why: !hasTable ? 'no Design flow arrow leads to it' : ivs ? 'no row presses a control on it or walks an arrow into it, and no Design arrow leads to it' : 'not in inventory.json, and no Design arrow leads to it' };
    }
    const by = new Map<string, typeof ways[0]>();
    for (const w of ways) if (!by.has(w.tc) || w.fit > by.get(w.tc)!.fit) by.set(w.tc, w);
    const ranked = [...by.values()].sort((a, b) => b.fit - a.fit || score(b.tc) - score(a.tc)
      || (order.get(a.tc)?.i ?? 1e9) - (order.get(b.tc)?.i ?? 1e9) || a.tc.localeCompare(b.tc, 'en', { numeric: true }));
    const w = ranked[0], r = row.get(w.tc)!;
    return { ...base, status: 'routed',
      route: { case: w.tc, how: w.how, via: w.via, fit: ['low', 'mid', 'high'][w.fit], edge: w.edge ?? '', segment: order.get(w.tc)?.seg ?? '', section: r.Section,
        precondition: r.Precondition, action: r.Action, result: latest.get(w.tc)?.result ?? 'Not run', run: latest.get(w.tc)?.run ?? '' },
      alternatives: ranked.slice(1, 5).map(x => x.tc) };
  }).sort((a: any, b: any) => (order.get(a.route?.case)?.i ?? 1e9) - (order.get(b.route?.case)?.i ?? 1e9) || a.board_name.localeCompare(b.board_name) || a.abs[0] - b.abs[0] || a.abs[1] - b.abs[1]);

  const byCase: Record<string, string[]> = {};
  for (const e of entries as any[]) if (e.route?.case) (byCase[e.route.case] ??= []).push(e.id);
  const count = (st: string) => entries.filter((e: any) => e.status === st).length;
  const plan = { built_at: new Date().toISOString(), spec_set: set, file: frames.files?.design ?? null, phases: phasesFile?.slice(table.length + 1) ?? null,
    skip: [...skip], skip_reason: opt.skipReason ?? null,
    casebook: hasTable, counts: { screens: entries.length, routed: count('routed'), figma_paths: entries.filter((e: any) => e.route?.how === 'figma').length,
      gaps: entries.filter((e: any) => e.gap).length, no_route: count('no-route'), excluded: count('excluded') }, by_case: byCase, screens: entries };
  writeJson(planPath(feature, platform), plan);
  return plan;
}
