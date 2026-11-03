// Design check (figma skill, references/conformance.md): one command for every step after the Figma read.
// Usage: node scripts/design.ts <product>/<feature> <ios|android> <command> …
//   plan [--skip <board or screen ids> --skip-reason "<why>"]
//                     build design/plan.json (lib/design-plan.ts): each Design screen with the row that reaches it.
//                     Every other command builds it again first when the table, the traces or the Figma read changed.
//   screens [TC-…]    the screens a row reaches, to capture while it runs (id, name, fit); without a row, every
//                     routed screen in journey order with its row or Design path (what a design pass walks)
//   check <run dir> [--screen <id,…>] [--recheck <earlier run>] [--build <version (build)>]
//                     measure every new capture (below) and draw its sheet
//   settle <run dir>  merge the two review passes into design/findings.json
//   decide [file]     apply a pasted Design-tab "Copy decisions" block (from the file, or stdin) to the runs' findings
//   ebugs <run dir>   write design/ebug-findings.md: the settled bugs ticked for filing (all bugs with --all), each with
//                     its row's steps, Figma vs app, the Figma link and the sheet, for spec-casebook references/ebugs.md
//   status [run dir]  where the design check stands and the next step (default: the newest run with captures)
// Run dirs may be given as a folder name under <table>/runs/.
//
// check: for every screen in <run dir>/design/captures.jsonl (device.ts design; the newest whole-screen capture per
// screen and the scrolled parts taken after it), compares the Figma screen (figma-source out/<board>.json, every
// visible node inside it) with the app's page source and screenshot, and writes <run dir>/design/compare.json
// (committed) with one candidate per difference:
//   state     under 40 % of the frame's short texts were found: the capture may be another state           major
//   copy      a Figma text whose closest app text differs (normalised: case, quotes, spacing, numbers)    major
//   missing   a Figma text with no app text near it; long sample text (> 60 characters) is `sample`, info  major
//   truncated the app text ends in an ellipsis Figma does not have, or runs past the screen edge           major
//   lines     the app text takes more (or fewer) lines than Figma: wrapping                                minor
//   position  a matched text more than 4 pt from where Figma puts it, after the projection below          minor
//   colour    a filled shape (button, chip, card) ΔE > 12 from its Figma fill, or a text ΔE > 18          minor
//   control   an unlabelled control of the inventory (icon) with no tappable app element where it is drawn major
//   extra     short app text (≤ 40 characters) Figma does not draw on the screen                            info
// Scrolled parts (device.ts design <id> --part 2…) add their texts to copy / missing / extra only.
// Projection: Figma's frame width maps to the phone's window width (one scale for x and y); texts in the upper half
// are measured from the top and those in the lower half from the bottom, each half shifted by the median offset of its
// exactly matched texts (safe areas and status bars differ by phone), so a position candidate is a residual after that
// fit. A half with under 2 anchors, or anchors spread over 6 pt, measures no positions. System chrome (status bar,
// home indicator, keyboard instances) is left out. Candidate ids are `<kind>:<node>` (`extra:<text>`), so they stay
// the same when the check runs again and on the next build.
// Not measured (the reviewers look at the sheet): icons' drawing, images, font weight and size, radius, shadow, borders.
// Each screen also gets screenshots/design/<id>-sheet.png (local): the Figma crop and the app screenshot side by side at
// the same width with every candidate numbered on both, the one image a reviewer reads per screen.
// --recheck <earlier run>: each bug settled there on a screen measured now is `fixed` (its candidate is gone), `still`
// or `check` (a visual item: the reviewers look again); kept in compare.json per screen, shown on the Design tab.
// The build comes from the run's run-state.md (or --build).
// settle: the same verdict on both passes stands; any disagreement, or an item one pass skipped, becomes `question`;
// a user decision already in findings.json is kept.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { normLabel } from './lib/coverage.ts';
import { planFresh, buildPlan, summary } from './lib/design-plan.ts';
import { ROOT, arg, assertIds, featureDir, readTable, tableDir, writeJson } from './lib/library.ts';

const [feature, platform, cmd, target] = process.argv.slice(2);
assertIds(feature, platform);
const table = tableDir(feature, platform), runsDir = join(table, 'runs');
const shown = (p: string) => p.startsWith(ROOT) ? p.slice(ROOT.length + 1) : p;
const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const runOf = (r: string) => existsSync(r) ? r : join(runsDir, r);
const KINDS = ['state', 'copy', 'missing', 'truncated', 'lines', 'position', 'colour', 'control', 'extra', 'sample'];
const USAGE = 'Usage: node scripts/design.ts <product>/<feature> <ios|android> plan | screens <TC-…> | check <run dir> | settle <run dir> | decide [file] | ebugs <run dir> | status [run dir]';
// the newest run folder holding design captures
const newestRun = () => existsSync(runsDir) ? readdirSync(runsDir).filter(d => existsSync(join(runsDir, d, 'design', 'captures.jsonl'))).sort().at(-1) : undefined;
const needsRun = ['check', 'settle', 'ebugs'].includes(cmd);
if (needsRun && !target) { console.error(USAGE); process.exit(2); }
const runDir = needsRun ? runOf(target) : cmd === 'status' ? runOf(target ?? newestRun() ?? '') : '';
const designDir = join(runDir, 'design');
// Shared captures (user, 2026-11-03): the full screenshot and page source stay local (screenshots/design/), and check
// commits a compact copy beside the results (design/captures/<id>.webp, 750 px wide, and <id>.xml), so a computer that
// pulls the run can check again, draw the sheets, review and show the Design tab without the phone's files.
const sharedOf = (local: string, ext: string) => join(designDir, 'captures', basename(local).replace(/\.(png|xml)$/, ext));
const imageOf = (rel: string) => existsSync(join(runDir, rel)) ? join(runDir, rel) : sharedOf(rel, '.webp');
const sourceOf = (rel: string) => existsSync(join(runDir, rel)) ? join(runDir, rel) : sharedOf(rel, '.xml');

if (cmd === 'plan') {
  const skip = arg('skip')?.split(',').filter(Boolean);
  const old = existsSync(join(table, 'design', 'plan.json')) ? read(join(table, 'design', 'plan.json')) : null;
  const plan = buildPlan(feature, platform, { skip: skip ?? old?.skip, skipReason: arg('skip-reason') ?? old?.skip_reason ?? undefined });
  console.log(`${shown(join(table, 'design', 'plan.json'))}: ${summary(plan)}`);
  for (const e of plan.screens.filter((e: any) => e.status === 'no-route').slice(0, 15)) console.log(`  no route: ${e.id} ${e.name} (${e.board_name}) — ${e.why}`);
} else if (cmd === 'screens' && !target) {
  // every routed screen in journey order: what a design pass walks (rows first, then the Design-arrow paths)
  const plan = planFresh(feature, platform);
  for (const s of plan.screens.filter((x: any) => x.status === 'routed'))
    console.log(`${s.id}  ${s.name} (${s.board_name}) · ${s.route.case ? `${s.route.case}, fit ${s.route.fit}` : `Design ${s.route.fit}: ${s.route.action}`}${s.gap ? ' · gap in the table' : ''}`);
} else if (cmd === 'screens') {
  const plan = planFresh(feature, platform);
  for (const id of plan.by_case[target ?? ''] ?? []) {
    const s = plan.screens.find((x: any) => x.id === id);
    console.log(`${s.id}  ${s.name} (${s.board_name}) · fit ${s.route.fit}${s.route.fit === 'low' ? ': bring about the state its name says' : ''}`);
  }
  if (!plan.by_case[target ?? '']) console.log(`${target}: no Design screen to capture`);
} else if (cmd === 'check') measure();
else if (cmd === 'settle') settle();
else if (cmd === 'decide') decide();
else if (cmd === 'ebugs') ebugs();
else if (cmd === 'status') status();
else { console.error(USAGE); process.exit(2); }

type Box = [number, number, number, number];
type Cand = { id: string; kind: string; severity: string; figma?: any; app?: any; delta?: any; note?: string };

function measure() {
  const plan = planFresh(feature, platform);
  const ex = join(featureDir(feature), 'specs', plan.spec_set, 'extracted'), out = join(ex, 'figma-source', 'design', 'out');
  const inv = existsSync(join(ex, 'inventory.json')) ? read(join(ex, 'inventory.json')) : { controls: [] };
  const only = new Set((arg('screen') ?? '').split(',').filter(Boolean));
  const capFile = join(designDir, 'captures.jsonl');
  if (!existsSync(capFile)) { console.error(`${capFile}: no captures yet (device.ts <run dir> design <screen id>).`); process.exit(1); }
  // the newest whole-screen capture per screen, plus the scrolled parts taken after it
  const caps = new Map<string, any>(), parts = new Map<string, any[]>();
  for (const l of readFileSync(capFile, 'utf8').split('\n').filter(Boolean)) {
    const c = JSON.parse(l); if (only.size && !only.has(c.screen)) continue;
    if (c.part > 1) { if (caps.has(c.screen)) parts.get(c.screen)!.push(c); } else { caps.set(c.screen, c); parts.set(c.screen, []); }
  }
  const prev = existsSync(join(designDir, 'compare.json')) ? read(join(designDir, 'compare.json')).screens.filter((s: any) => !caps.has(s.id)) : [];
  const state = existsSync(join(runDir, 'run-state.md')) ? readFileSync(join(runDir, 'run-state.md'), 'utf8') : '';
  const build = state.match(/\b[A-Z][A-Za-z]+(?: iOS| Android)? (\d+\.\d+\.\d+ \(\d+\))/)?.[1] ?? arg('build') ?? '';
  const old = arg('recheck'), oldDir = old && (existsSync(old) ? old : join(table, 'runs', old));
  const oldFindings = oldDir && existsSync(join(oldDir, 'design', 'findings.json')) ? read(join(oldDir, 'design', 'findings.json')).screens : null;
  if (old && !oldFindings) { console.error(`--recheck ${old}: no design/findings.json there.`); process.exit(1); }
  const boards = new Map<string, any[]>();
  const nodesOf = (board: string) => {
    if (!boards.has(board)) { const f = join(out, `${board.replace(/[:;]/g, '-')}.json`);
      if (!existsSync(f)) { console.error(`${f} missing: run figma-source.ts merge design first.`); process.exit(1); }
      boards.set(board, read(f).nodes); }
    return boards.get(board)!;
  };
  const results: any[] = [], samples: any[] = [], sheets: any[] = [], shares: any[] = [];
  for (const cap of caps.values()) {
    const scr = plan.screens.find((s: any) => s.id === cap.screen);
    if (!scr) { console.error(`  ${cap.screen}: not in design/plan.json, skipped`); continue; }
    const controlNodes = new Set<string>(inv.controls.filter((c: any) => c.screens?.includes(scr.inventory_screen ?? scr.id) && !c.label).map((c: any) => c.node));
    const fig = figmaScreen(nodesOf(scr.board), scr, controlNodes);
    for (const c of [cap, ...parts.get(cap.screen)!]) {
      if (!existsSync(sourceOf(c.xml)) || !existsSync(imageOf(c.png))) { console.error(`  ${c.screen}: its capture is on another computer (no ${c.xml} or shared copy), skipped`); continue; }
      if (existsSync(join(runDir, c.xml))) { mkdirSync(join(designDir, 'captures'), { recursive: true }); copyFileSync(join(runDir, c.xml), sharedOf(c.xml, '.xml')); }
      if (existsSync(join(runDir, c.png)) && (!existsSync(sharedOf(c.png, '.webp')) || statSync(sharedOf(c.png, '.webp')).mtimeMs < statSync(join(runDir, c.png)).mtimeMs)) shares.push({ src: join(runDir, c.png), dst: sharedOf(c.png, '.webp') });
    }
    if (!existsSync(sourceOf(cap.xml)) || !existsSync(imageOf(cap.png))) continue;
    const els = appElements(readFileSync(sourceOf(cap.xml), 'utf8'));
    const [Wf, Hf] = [scr.abs[2], scr.abs[3]], k = Wf / cap.win.w, Ha = cap.win.h * k;
    const toFig = (b: Box): Box => [b[0] * k, b[1] * k, b[2] * k, b[3] * k];
    const cands: Cand[] = [], used = new Set<number>();
    const FAR: Box = [0, 1e6, 0, 0];
    // texts of the scrolled parts count for copy and missing only: their positions are not the frame's
    const appT = [...els.filter(e => e.text).map(a => ({ ...a, f: toFig(a.box), n: normLabel(a.text), part: 1 })),
      ...parts.get(cap.screen)!.flatMap(p => appElements(existsSync(sourceOf(p.xml)) ? readFileSync(sourceOf(p.xml), 'utf8') : '').filter(e => e.text).map(a => ({ ...a, f: FAR, n: normLabel(a.text), part: p.part })))];
    // pair texts: exact, then containment, then the most similar (copy), else missing
    const pairs: { t: any; a: any; how: string }[] = [];
    for (const t of fig.texts) {
      const n = normLabel(t.text), near = (a: any) => Math.hypot(a.f[0] - t.box[0], a.f[1] - t.box[1]);
      const pick = (f: (a: any) => boolean) => appT.map((a, i) => ({ a, i })).filter(({ a, i }) => !used.has(i) && f(a)).sort((x, y) => near(x.a) - near(y.a))[0];
      let hit = pick(a => a.n === n), how = 'exact';
      if (!hit && n.length >= 6) { hit = pick(a => a.n.length >= 6 && (a.n.includes(n) || n.includes(a.n))); how = 'part'; }
      if (!hit) { const best = appT.map((a, i) => ({ a, i, r: ratio(a.n, n) })).filter(x => !used.has(x.i) && x.r >= 0.7).sort((x, y) => y.r - x.r)[0];
        if (best) { hit = best; how = 'copy'; } }
      if (!hit) { const sample = t.text.length > 60;
        cands.push({ id: `${sample ? 'sample' : 'missing'}:${t.node}`, kind: sample ? 'sample' : 'missing', severity: sample ? 'info' : 'major', figma: { node: t.node, text: t.text, box: r1(t.box) } }); continue; }
      used.add(hit.i); pairs.push({ t, a: hit.a, how });
      const appBox = hit.a.part > 1 ? undefined : r1(hit.a.f);
      if (how === 'copy' || (how === 'part' && hit.a.n !== n)) cands.push({ id: `copy:${t.node}`, kind: 'copy', severity: how === 'copy' ? 'major' : 'minor', note: how === 'part' ? 'one text contains the other' : undefined, figma: { node: t.node, text: t.text, box: r1(t.box) }, app: { text: hit.a.text, box: appBox } });
      // cut short: the app ends in an ellipsis Figma does not have, or runs past the window's edge
      if (/(…|\.\.\.)$/.test(hit.a.text) && !/(…|\.\.\.)$/.test(t.text)) cands.push({ id: `truncated:${t.node}`, kind: 'truncated', severity: 'major', figma: { node: t.node, text: t.text, box: r1(t.box) }, app: { text: hit.a.text, box: appBox } });
      else if (hit.a.part === 1 && (hit.a.f[0] < -1 || hit.a.f[0] + hit.a.f[2] > Wf + 1)) cands.push({ id: `truncated:${t.node}`, kind: 'truncated', severity: 'major', note: 'runs past the screen edge', figma: { node: t.node, text: t.text, box: r1(t.box) }, app: { text: hit.a.text, box: appBox } });
    }
    // arrival: a capture matching under 40 % of the frame's short texts is probably another state (Figma Agent's
    // arrival assertion); every candidate of it is then in doubt, which the reviewers settle (n/a or a real gap)
    const short = fig.texts.filter(t => t.text.length <= 60).length, hits = pairs.filter(p => p.how !== 'copy' && p.t.text.length <= 60).length;
    const arrival = { matched: hits, of: short, ok: short < 3 || hits / short >= 0.4 };
    if (!arrival.ok) cands.unshift({ id: `state:${scr.id}`, kind: 'state', severity: 'major', note: `only ${hits} of ${short} Figma texts found: the capture may not be this frame's state` });
    // projection: each half shifted by the median offset of its exact pairs; a half with fewer than 2 anchors, or whose
    // anchors disagree by more than 6 pt (median absolute deviation), measures no positions (the Figma Agent refuses a
    // projection whose residual is over 6 px)
    const base = pairs.filter(p => p.a.part === 1);
    const half = (b: number[]) => b[1] + b[3] / 2 < Hf / 2 ? 'top' : 'bottom';
    const dyOf = (p: any) => half(p.t.box) === 'top' ? p.a.f[1] - p.t.box[1] : (Ha - p.a.f[1] - p.a.f[3]) - (Hf - p.t.box[1] - p.t.box[3]);
    const fit: Record<string, { dy: number; anchors: number; spread: number; ok: boolean }> = {};
    for (const h of ['top', 'bottom']) {
      const d = base.filter(p => p.how === 'exact' && half(p.t.box) === h).map(dyOf).sort((a, b) => a - b), med = d.length ? d[Math.floor(d.length / 2)] : 0;
      const dev = d.map(x => Math.abs(x - med)).sort((a, b) => a - b), spread = dev.length ? dev[Math.floor(dev.length / 2)] : 0;
      fit[h] = { dy: r1n(med), anchors: d.length, spread: r1n(spread), ok: d.length >= 2 && spread <= 6 };
    }
    for (const p of base.filter(p => p.how === 'exact')) {
      const ax = p.t.align === 'CENTER' ? [p.t.box[0] + p.t.box[2] / 2, p.a.f[0] + p.a.f[2] / 2] : p.t.align === 'RIGHT' ? [p.t.box[0] + p.t.box[2], p.a.f[0] + p.a.f[2]] : [p.t.box[0], p.a.f[0]];
      const dx = ax[1] - ax[0], dy = dyOf(p) - fit[half(p.t.box)].dy;
      if (fit[half(p.t.box)].ok && (Math.abs(dx) > 4 || Math.abs(dy) > 4))
        cands.push({ id: `position:${p.t.node}`, kind: 'position', severity: 'minor', figma: { node: p.t.node, text: p.t.text, box: r1(p.t.box) }, app: { text: p.a.text, box: r1(p.a.f) }, delta: { x: r1n(dx), y: r1n(dy) } });
      const lh = p.t.line_height || p.t.size * 1.2;
      if (lh > 0 && p.t.auto_resize !== 'TRUNCATE') {
        const fl = Math.max(1, Math.round(p.t.box[3] / lh)), al = Math.max(1, Math.round(p.a.f[3] / lh));
        if (fl !== al) cands.push({ id: `lines:${p.t.node}`, kind: 'lines', severity: 'minor', figma: { node: p.t.node, text: p.t.text, box: r1(p.t.box), lines: fl }, app: { box: r1(p.a.f), lines: al } });
      }
    }
    const figNorm = new Set(fig.texts.map(t => normLabel(t.text)));
    appT.forEach((a, i) => { if (!used.has(i) && a.text.length <= 40 && !figNorm.has(a.n) && a.n.replace(/[#\W_]/g, ''))
      cands.push({ id: `extra:${a.n}`, kind: 'extra', severity: 'info', app: { text: a.text, box: a.part > 1 ? undefined : r1(a.f) } }); });
    // Figma box → window units through its half's fit (screenshot pixels in python)
    const toApp = (b: number[]): Box => { const y = half(b) === 'top' ? b[1] + fit.top.dy : Ha - (Hf - b[1] - b[3]) - fit.bottom.dy - b[3]; return [b[0] / k, y / k, b[2] / k, b[3] / k]; };
    // controls without a label (icons: close, back, more): some app element must sit where Figma draws them
    for (const c of fig.controls) {
      const a = toApp(c.box), cx = a[0] + a[2] / 2, cy = a[1] + a[3] / 2;
      const hit = els.some(e => e.box[2] * e.box[3] < cap.win.w * cap.win.h * 0.5 && cx >= e.box[0] - 6 && cx <= e.box[0] + e.box[2] + 6 && cy >= e.box[1] - 6 && cy <= e.box[1] + e.box[3] + 6 && e.actionable);
      if (!hit) cands.push({ id: `control:${c.node}`, kind: 'control', severity: 'major', note: 'no tappable app element where Figma draws this control', figma: { node: c.node, name: c.name, box: r1(c.box) } });
    }
    for (const f of fig.fills) samples.push({ kind: 'fill', screen: scr.id, node: f.node, name: f.name, color: f.color, figBox: f.box, box: toApp(f.box) });
    for (const p of base.filter(p => p.how === 'exact' && p.t.color)) samples.push({ kind: 'text', screen: scr.id, node: p.t.node, name: p.t.text, color: p.t.color, figBox: p.t.box, box: p.a.box });
    // recheck: the bugs settled on an earlier build, still measured here or gone
    let recheck: any = null;
    if (oldFindings?.[scr.id]) {
      const now = new Set(cands.map(c => c.id));
      recheck = { run: basename(oldDir!), items: Object.entries<any>(oldFindings[scr.id]).filter(([, v]) => v.verdict === 'bug')
        .map(([id, v]) => ({ id, note: v.note ?? '', now: id.startsWith('visual:') ? 'check' : now.has(id) ? 'still' : 'fixed' })) };
    }
    results.push({ id: scr.id, name: scr.name, board: scr.board, board_name: scr.board_name, case: cap.case || scr.route?.case || '', captured_at: cap.t, png: cap.png,
      parts: parts.get(cap.screen)!.map(p => p.png), note: cap.note || '', build, win: cap.win, k: r3(k), fw: Wf, arrival, fit,
      counts: { figma_texts: fig.texts.length, app_texts: appT.length, matched: pairs.length, shapes: fig.fills.length, controls: fig.controls.length }, candidates: cands, recheck });
    sheets.push({ screen: scr.id, png: imageOf(cap.png), sheet: join(runDir, cap.png.replace(/\.png$/, '-sheet.png')), figma: figmaCrop(scr, out), win: cap.win, k, fw: Wf });
  }
  // one python call samples every shape (median of a 3-pt band inside its edge) and every text (the pixels farthest
  // from its background), and draws the sheets
  const py = python({ shares, samples: samples.map(s => ({ ...s, png: imageOf(caps.get(s.screen).png), win: caps.get(s.screen).win })), sheets: sheets.map(s => ({ ...s, cands: results.find(r => r.id === s.screen).candidates })) });
  for (const [i, s] of samples.entries()) {
    const got = py.colours?.[i]; if (!got) continue;
    const d = deltaE(s.color, got), r = results.find(r => r.id === s.screen);
    // anti-aliased glyphs never reach the full colour, so texts get more room
    if (d > (s.kind === 'text' ? 18 : 12) && !r.candidates.some((c: Cand) => c.id === `colour:${s.node}`))
      r.candidates.push({ id: `colour:${s.node}`, kind: 'colour', severity: 'minor', note: s.kind === 'text' ? 'text colour' : undefined, figma: { node: s.node, name: s.name, color: s.color, box: r1(s.figBox) }, app: { color: got }, delta: { dE: Math.round(d) } });
  }
  const all = [...prev, ...results].sort((a, b) => plan.screens.findIndex((s: any) => s.id === a.id) - plan.screens.findIndex((s: any) => s.id === b.id));
  writeJson(join(designDir, 'compare.json'), { built_at: new Date().toISOString(), spec_set: plan.spec_set, platform, build, recheck_of: old ? basename(oldDir!) : undefined, screens: all });
  const n = (kind: string) => results.reduce((t, r) => t + r.candidates.filter((c: Cand) => c.kind === kind).length, 0);
  console.log(`${shown(join(designDir, 'compare.json'))}: ${results.length} screens measured (${all.length} in the file); ` +
    KINDS.map(k => `${n(k)} ${k}`).join(', '));
  const doubt = results.filter(r => !r.arrival.ok); if (doubt.length) console.log(`  arrival in doubt (another state?): ${doubt.map(r => `${r.id} ${r.name}`).join(', ')}`);
  if (old) { const it = results.flatMap(r => r.recheck?.items ?? []); console.log(`  recheck of ${basename(oldDir!)}: ${['fixed', 'still', 'check'].map(s => `${it.filter(i => i.now === s).length} ${s}`).join(', ')}`); }
  if (py.sheets?.length) console.log(`sheets: ${py.sheets.length} in ${shown(join(runDir, 'screenshots', 'design'))}/`);
  if (py.shared) console.log(`shared: ${py.shared} capture(s) in ${shown(join(designDir, 'captures'))}/ (commit them with the run)`);
}

// Every visible node inside the screen frame, relative to it; system chrome instances are skipped with their insides.
// controls: the inventory's unlabelled controls on this screen (by node id), checked for presence.
function figmaScreen(nodes: any[], scr: any, controlNodes: Set<string>) {
  const kids = new Map<string, any[]>();
  for (const n of nodes) { if (!kids.has(n.parent)) kids.set(n.parent, []); kids.get(n.parent)!.push(n); }
  const texts: any[] = [], fills: any[] = [], controls: any[] = [];
  const CHROME = /status ?bar|home ?indicator|keyboard/i;
  const walk = (id: string) => {
    for (const n of kids.get(id) ?? []) {
      if (n.hidden || (n.drawn ?? 1) < 0.2 || (n.opacity ?? 1) < 0.05 || CHROME.test(`${n.name} ${n.component?.name ?? ''} ${n.component?.set ?? ''}`)) continue;
      const box: Box = [n.abs[0] - scr.abs[0], n.abs[1] - scr.abs[1], n.abs[2], n.abs[3]];
      if (box[0] >= scr.abs[2] || box[1] >= scr.abs[3] || box[0] + box[2] <= 0 || box[1] + box[3] <= 0) continue;
      if (controlNodes.has(n.id)) controls.push({ node: n.id, name: n.name, box });
      if (n.type === 'TEXT' && n.text?.characters?.trim()) {
        const run = n.text.runs?.[0] ?? {}, solid = n.text.runs?.length === 1 ? run.fills?.filter((f: any) => f.type === 'SOLID') : null;
        texts.push({ node: n.id, text: n.text.characters.trim(), box, align: n.text.align?.[0] ?? 'LEFT', auto_resize: n.text.auto_resize, size: run.font_size,
          line_height: typeof run.line_height === 'number' ? run.line_height : 0, color: solid?.length === 1 && /ff$/i.test(solid[0].color) ? solid[0].color.slice(0, 7) : null });
      } else if (/^(FRAME|INSTANCE|RECTANGLE|COMPONENT)$/.test(n.type) && box[2] >= 40 && box[3] >= 24 && box[2] * box[3] < 0.4 * scr.abs[2] * scr.abs[3]
        && (n.radius || /btn|button|cta|chip|tag|card/i.test(n.name))) {
        const f = (n.fills ?? []).filter((x: any) => x.type === 'SOLID' && x.color && !x.color.endsWith('00')).at(-1);
        if (f && /ff$/i.test(f.color)) fills.push({ node: n.id, name: n.name, color: f.color.slice(0, 7), box });
      }
      walk(n.id);
    }
  };
  walk(scr.id);
  return { texts, fills: fills.slice(0, 40), controls };
}

// Elements of an XCUITest or UiAutomator2 page source in window units: their text (if any) and whether they can be
// tapped (buttons, cells, switches, clickable views), for the control presence check.
function appElements(xml: string) {
  const dec = (t: string) => t.replace(/&#10;/g, '\n').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const out: { type: string; text: string; box: Box; actionable: boolean }[] = [];
  for (const m of xml.matchAll(/<([\w.]+)\s([^>]*?)\/?>/g)) {
    const at: Record<string, string> = {};
    for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) at[a[1]] = dec(a[2]);
    if (at.visible === 'false' || at.displayed === 'false') continue;
    let box: Box | null = null;
    if (at.bounds) { const b = at.bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/); if (b) box = [+b[1], +b[2], +b[3] - +b[1], +b[4] - +b[2]]; }
    else if (at.x !== undefined) box = [+at.x, +at.y, +at.width, +at.height];
    const type = at.type ?? at.class ?? m[1];
    const text = (/StaticText|TextView|TextField|Button|Cell|Link/.test(type) ? (at.label || at.value || at.text || at['content-desc'] || '') : (at.text || '')).trim();
    if (!box || box[2] <= 0 || box[3] <= 0) continue;
    const actionable = /Button|Cell|Switch|Link|Image|TextField|SearchField|Tab/.test(type) || at.clickable === 'true';
    out.push({ type, text, box, actionable });
  }
  // a button's label repeated by the text inside it: keep the inner text only
  return out.map((o, i) => o.text && out.some((p, j) => j !== i && p.text === o.text && p.box[2] * p.box[3] < o.box[2] * o.box[3] && p.box[0] >= o.box[0] && p.box[1] >= o.box[1]) ? { ...o, text: '' } : o);
}

// the Figma side of a sheet: figma-source's crop when this machine has it, else the committed board screenshot
function figmaCrop(scr: any, out: string) {
  const crop = join(out, 'crops', scr.board.replace(/[:;]/g, '-'), `${scr.id.replace(/[:;]/g, '-')}.png`);
  if (existsSync(crop)) return { png: crop, box: null };
  const png = scr.board_png && join(featureDir(feature), scr.board_png);
  return png && existsSync(png) && scr.board_box ? { png, box: [scr.abs[0] - scr.board_box[0], scr.abs[1] - scr.board_box[1], scr.abs[2], scr.abs[3]], board_w: scr.board_box[2] } : null;
}

function python(input: unknown): any {
  const code = String.raw`
import json, sys
from statistics import median
from PIL import Image, ImageDraw, ImageFont
try: FONT = ImageFont.load_default(size=24)
except Exception: FONT = ImageFont.load_default()
job = json.load(sys.stdin); res = {"colours": [], "sheets": [], "shared": 0}; imgs = {}
import os
for sh in job.get("shares", []):
    im = Image.open(sh["src"]).convert("RGB"); w = 750; os.makedirs(os.path.dirname(sh["dst"]), exist_ok=True)
    im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(sh["dst"], "WEBP", quality=78, method=6); res["shared"] += 1
def img(p):
    if p not in imgs: imgs[p] = Image.open(p).convert("RGB")
    return imgs[p]
def dist(a, b): return sum((a[i] - b[i]) ** 2 for i in range(3))
for s in job["samples"]:
    try:
        im = img(s["png"]); r = im.width / s["win"]["w"]; x, y, w, h = [v * r for v in s["box"]]; b = 3 * r
        if s["kind"] == "text":
            # background: the box's edge pixels; text: the 3 % of pixels farthest from it (glyph cores, not their anti-aliased edges)
            box = im.crop((int(x), int(y), int(x + w), int(y + h))); px = list(box.getdata())
            if len(px) < 20: res["colours"].append(None); continue
            edge = [box.getpixel((i, j)) for i in range(box.width) for j in (0, box.height - 1)] + [box.getpixel((i, j)) for j in range(box.height) for i in (0, box.width - 1)]
            bg = tuple(median(c[i] for c in edge) for i in range(3)); far = sorted(px, key=lambda c: -dist(c, bg))[:max(5, len(px) * 3 // 100)]
            res["colours"].append("#%02x%02x%02x" % tuple(int(median(c[i] for c in far)) for i in range(3))); continue
        px = []
        for yy in range(int(y + b / 2), int(y + h - b / 2), max(1, int(h / 30))):
            for xx in (int(x + b / 2), int(x + w - b / 2)):
                if 0 <= xx < im.width and 0 <= yy < im.height: px.append(im.getpixel((xx, yy)))
        for xx in range(int(x + b / 2), int(x + w - b / 2), max(1, int(w / 30))):
            for yy in (int(y + b / 2), int(y + h - b / 2)):
                if 0 <= xx < im.width and 0 <= yy < im.height: px.append(im.getpixel((xx, yy)))
        res["colours"].append("#%02x%02x%02x" % tuple(int(median(c[i] for c in px)) for i in range(3)) if px else None)
    except Exception: res["colours"].append(None)
COL = {"major": (220, 50, 50), "minor": (230, 150, 20), "info": (90, 120, 200), "cosmetic": (150, 150, 150)}
for sh in job["sheets"]:
    W = 750; app = img(sh["png"]); ar = W / app.width; appS = app.resize((W, int(app.height * ar)))
    fig = None
    if sh["figma"]:
        f = Image.open(sh["figma"]["png"]).convert("RGB")
        if sh["figma"]["box"]:
            s = f.width / sh["figma"]["board_w"]; bx = sh["figma"]["box"]; f = f.crop((int(bx[0] * s), int(bx[1] * s), int((bx[0] + bx[2]) * s), int((bx[1] + bx[3]) * s)))
        fig = f.resize((W, int(f.height * W / f.width)))
    H = max(appS.height, fig.height if fig else 0); out = Image.new("RGB", (W * 2 + 20, H), "white")
    if fig: out.paste(fig, (0, 0))
    out.paste(appS, (W + 20, 0)); d = ImageDraw.Draw(out)
    fs = (fig.width / sh["fw"]) if fig else 2; asc = W / (sh["win"]["w"] * sh["k"])
    for i, c in enumerate([c for c in sh["cands"] if c["kind"] not in ("sample", "extra")], 1):
        col = COL.get(c["severity"], (0, 0, 0))
        for side, sc, ox in (("figma", fs, 0), ("app", asc, W + 20)):
            bx = (c.get(side) or {}).get("box")
            if not bx or (side == "figma" and not fig): continue
            x, y, w, h = [v * sc for v in bx]; d.rectangle((ox + x, y, ox + x + w, y + h), outline=col, width=3)
            tx, ty = ox + x, max(0, y - 30); d.rectangle((tx, ty, tx + 16 + 14 * len(str(i)), ty + 28), fill=col); d.text((tx + 7, ty + 1), str(i), fill="white", font=FONT)
    p = sh["sheet"]; os.makedirs(os.path.dirname(p), exist_ok=True); out.save(p); res["sheets"].append(p)
print(json.dumps(res))`;
  const r = spawnSync('python3', ['-I', '-c', code], { input: JSON.stringify(input), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) { console.error(`python3 (Pillow) failed: ${r.stderr.trim().split('\n').slice(-3).join(' ')}`); return {}; }
  return JSON.parse(r.stdout);
}

function status() {
  const plan = planFresh(feature, platform);
  if (!runDir || !existsSync(designDir)) {
    console.log(`Design check: ${summary(plan)}; no run has captures yet.\n  next: capture during a run (\`design.ts … screens <TC-…>\` lists what each row reaches)`); return; }
  const capFile = join(designDir, 'captures.jsonl'), cmpFile = join(designDir, 'compare.json'), fFile = join(designDir, 'findings.json');
  const caps = existsSync(capFile) ? readFileSync(capFile, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
  const captured = new Set(caps.map(c => c.screen));
  const cmp = existsSync(cmpFile) ? read(cmpFile) : null, measured = new Set((cmp?.screens ?? []).map((s: any) => s.id));
  const found = existsSync(fFile) ? read(fFile) : null;
  const routed = plan.screens.filter((s: any) => s.status === 'routed'), left = routed.filter((s: any) => !captured.has(s.id));
  const at = (n: string) => existsSync(join(designDir, `${n}.json`)) ? statSync(join(designDir, `${n}.json`)).mtimeMs : 0;
  const verdicts = Object.values<any>(found?.screens ?? {}).flatMap(v => Object.values<any>(v));
  const open = verdicts.filter(v => v.verdict === 'question' && !v.decided).length, bugs = verdicts.filter(v => v.verdict === 'bug');
  const run = basename(runDir);
  console.log(`Design check of ${run}: ${captured.size} of ${routed.length} routed screens captured (${plan.counts.no_route} no route), ${measured.size} measured, ` +
    (found ? `settled: ${bugs.length} bugs (${bugs.filter(v => v.ebug).length} ticked for eBugs), ${open} open questions` : 'not settled'));
  const unmeasured = [...captured].filter(s => !measured.has(s) || caps.filter(c => c.screen === s).at(-1).t > (cmp?.built_at ?? ''));
  const rows = new Map<string, number>(); for (const s of left) { const k = s.route.case || 'Design paths'; rows.set(k, (rows.get(k) ?? 0) + 1); }
  if (left.length) console.log(`  not captured: ${left.length} screens on ${rows.size} rows, e.g. ${[...rows].slice(0, 8).map(([c, n]) => `${c} (${n})`).join(', ')}`);
  const reviewed = cmp && at('builder') > Date.parse(cmp.built_at) && at('reviewer') > Date.parse(cmp.built_at);
  const next = unmeasured.length ? `check ${unmeasured.length} new capture(s): design.ts … check ${run}`
    : measured.size && !reviewed ? 'the two review passes over the sheets (conformance.md step 4), then settle'
    : reviewed && at('findings') < Math.max(at('builder'), at('reviewer')) ? `design.ts … settle ${run}`
    : open ? 'the user answers the questions on the Design tab and pastes Copy decisions (design.ts … decide)'
    : bugs.some(v => v.ebug) && !existsSync(join(designDir, 'ebug-findings.md')) ? `design.ts … ebugs ${run}, then the eBug drafts (spec-casebook references/ebugs.md)`
    : left.length ? 'capture the remaining screens during the next rounds (design.ts … screens <TC-…>)' : 'done';
  console.log(`  next: ${next}`);
}

function settle() {
  const cmp = read(join(designDir, 'compare.json'));
  const pass = (n: string) => { const p = join(designDir, `${n}.json`); if (!existsSync(p)) { console.error(`${p} missing: run the ${n} pass first (conformance.md step 4).`); process.exit(1); } return read(p); };
  const b = pass('builder'), r = pass('reviewer');
  const before = existsSync(join(designDir, 'findings.json')) ? read(join(designDir, 'findings.json')).screens : {};
  const hash = (o: unknown) => createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 12);
  const screens: Record<string, Record<string, any>> = {};
  let agree = 0, ask = 0, kept = 0;
  for (const s of cmp.screens) {
    const bs = b.screens?.[s.id] ?? {}, rs = r.screens?.[s.id] ?? {};
    // every candidate is answered: one neither pass judged is a question too (info kinds only when a pass named them)
    const ids = new Set([...s.candidates.filter((c: Cand) => c.severity !== 'info').map((c: Cand) => c.id), ...Object.keys(bs), ...Object.keys(rs)]);
    for (const id of ids) {
      const x = bs[id], y = rs[id], prev = before[s.id]?.[id];
      if (prev?.decided) { (screens[s.id] ??= {})[id] = prev; kept++; continue; }
      const same = x && y && x.verdict === y.verdict;
      const where = { kind: x?.kind ?? y?.kind, figma: x?.figma ?? y?.figma, app: x?.app ?? y?.app };
      (screens[s.id] ??= {})[id] = same ? { ...where, verdict: x.verdict, severity: x.severity ?? y.severity, note: x.note, reviewer: y.note }
        : { ...where, verdict: 'question', severity: x?.severity ?? y?.severity, note: x?.note ?? '', reviewer: y?.note ?? '', split: `builder ${x?.verdict ?? 'skipped'} · reviewer ${y?.verdict ?? 'skipped'}` };
      same ? agree++ : ask++;
    }
  }
  writeJson(join(designDir, 'findings.json'), { settled_at: new Date().toISOString(), builder: hash(b), reviewer: hash(r), screens });
  console.log(`${shown(join(designDir, 'findings.json'))}: ${agree} agreed, ${ask} questions for the user${kept ? `, ${kept} user decisions kept` : ''}`);
}

// The Design tab's Copy decisions block: `DESIGN DECISIONS <feature> <platform>`, then `<run> <screen> <id>: bug|ok|n/a|eBug`.
function decide() {
  const text = readFileSync(target && existsSync(target) ? target : 0, 'utf8');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const head = lines.findIndex(l => l.startsWith('DESIGN DECISIONS'));
  if (head < 0) { console.error('No "DESIGN DECISIONS" block in the input.'); process.exit(1); }
  const [, , f, p] = lines[head].split(/\s+/);
  if (f !== feature || p !== platform) { console.error(`The block is for ${f} ${p}, not ${feature} ${platform}.`); process.exit(1); }
  const day = new Date().toISOString().slice(0, 10), files = new Map<string, any>();
  let n = 0;
  for (const l of lines.slice(head + 1)) {
    const m = l.match(/^(\S+) (\S+) (\S+): (bug|ok|n\/a|eBug)$/);
    if (!m) { console.error(`  skipped: ${l}`); continue; }
    const [, run, scr, id, v] = m, fp = join(runOf(run), 'design', 'findings.json');
    if (!files.has(fp)) files.set(fp, existsSync(fp) ? read(fp) : { settled_at: null, screens: {} });
    const cmp = existsSync(join(runOf(run), 'design', 'compare.json')) ? read(join(runOf(run), 'design', 'compare.json')) : { screens: [] };
    const cand = cmp.screens.find((s: any) => s.id === scr)?.candidates.find((c: Cand) => c.id === id);
    const item = ((files.get(fp).screens[scr] ??= {})[id] ??= { kind: cand?.kind, figma: cand?.figma, app: cand?.app, severity: cand?.severity, verdict: 'unreviewed' });
    if (v === 'eBug') item.ebug = true; else { item.verdict = v; if (v !== 'bug') delete item.ebug; }
    item.decided = `user ${day}`; n++;
  }
  for (const [fp, data] of files) writeJson(fp, data);
  console.log(`${n} decision(s) written to ${[...files.keys()].map(shown).join(', ')}`);
}

// The settled bugs to file, one block each, in the shape spec-casebook's eBug drafting reads.
function ebugs() {
  const plan = planFresh(feature, platform, true);
  const cmp = read(join(designDir, 'compare.json')), found = read(join(designDir, 'findings.json')).screens;
  const all = process.argv.includes('--all'), key = plan.file?.fileKey ?? plan.file?.key ?? '';
  const out: string[] = [`# Design check bugs — ${basename(runDir)}`, '', `Build ${cmp.build || '(not recorded)'} · ${feature} · ${platform}. Drafted through spec-casebook references/ebugs.md: [UI], owner RD (Doc for copy), never [UX].`, ''];
  let n = 0;
  for (const s of cmp.screens) for (const [id, v] of Object.entries<any>(found[s.id] ?? {})) {
    if (v.verdict !== 'bug' || (!all && !v.ebug)) continue;
    const c = s.candidates.find((x: Cand) => x.id === id) ?? { kind: v.kind ?? id.split(':')[0], figma: v.figma, app: v.app };
    const route = plan.screens.find((x: any) => x.id === s.id)?.route, row = route?.case && existsSync(join(table, 'cases.csv')) ? readTable(join(table, 'cases.csv')).find(r => r.ID === route.case) : undefined;
    const what = (o: any) => o?.text ? `「${o.text}」` : o?.color ? o.color : o?.name ?? '';
    n++;
    out.push(`## ${n}. ${s.name} — ${c.kind}${v.severity ? ` (${v.severity})` : ''}`, '',
      `- Screen: ${s.name} (${s.board_name}), Figma ${s.id}${key ? ` — https://www.figma.com/design/${key}?node-id=${encodeURIComponent(s.id.replace(':', '-'))}` : ''}`,
      route?.how === 'figma' && !s.case ? `- Reached by the Design's arrows: ${route.action}` : `- Reached by: ${s.case || route?.case || '?'}${row ? ` — Precondition: ${row.Precondition || '–'}; Action: ${row.Action}` : ''}`,
      `- Figma: ${what(c.figma)}`, `- App: ${what(c.app)}${c.delta ? ` (${Object.entries(c.delta).map(([a, b]) => `${a} ${b}`).join(', ')})` : ''}`,
      `- Verdict: ${v.note ?? ''}${v.reviewer && v.reviewer !== v.note ? ` / ${v.reviewer}` : ''}${v.decided ? ` (${v.decided})` : ''}`,
      `- Image: ${s.png.replace(/\.png$/, '-sheet.png')} (Figma left, app right)`, `- Finding id: ${s.id} ${id}`, '');
  }
  writeFileSync(join(designDir, 'ebug-findings.md'), out.join('\n'));
  console.log(`${shown(join(designDir, 'ebug-findings.md'))}: ${n} bug(s)${all ? '' : ' ticked for eBugs'}`);
}

function ratio(a: string, b: string) {
  if (!a || !b) return 0;
  const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return 1 - prev[n] / Math.max(m, n);
}
function deltaE(a: string, b: string) {
  const lab = (h: string) => { const [r, g, bl] = [1, 3, 5].map(i => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92; });
    const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    const [x, y, z] = [(r * 0.4124 + g * 0.3576 + bl * 0.1805) / 0.95047, r * 0.2126 + g * 0.7152 + bl * 0.0722, (r * 0.0193 + g * 0.1192 + bl * 0.9505) / 1.08883].map(f);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)]; };
  const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}
function r1n(n: number) { return Math.round(n * 10) / 10; }
function r1(b: number[]) { return b.map(r1n); }
function r3(n: number) { return Math.round(n * 1000) / 1000; }
