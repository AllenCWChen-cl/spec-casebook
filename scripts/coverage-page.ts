// Coverage page (REQ-038): the Figma boards with every tappable control and flow arrow marked by whether a run pressed
// or walked it, with the counts on top and the tap screenshots as proof.
// Usage: node scripts/coverage-page.ts <feature> <ios|android> [--draft <id>] [--runs <run dir name,…>] [--render] [--scale 0.45] [--out <file.html>] [--link]
//        node scripts/coverage-page.ts <feature> <ios|android> [--draft <id>] [--runs …] --serve [port] [--lan]
// Reads specs/<set>/extracted/inventory.json (scripts/inventory.ts), <table>/control-trace.json (scripts/controls.ts),
// cases.csv and requirements.md of the approved table, and every run folder under <table>/runs with a results.csv
// (or only --runs): the latest result per case, and taps.jsonl (device.ts tap log).
// A control group (one button however many screens show it, or one choice list) is
//   pressed (proof)  a tap in taps.jsonl was matched to it (scored on app id, label, icon/id words, position, element
//                    type and the case running: lib/coverage.ts matchTaps); also when no row names it yet
//   pressed (row)    one of its pressing rows ran (Pass, Fail or Inconclusive) but no tap log proves the press
//   blocked / not run / no row / n/a
// An input is also dismissed when the keyboard was hidden (hidekb, Done, return) in the same case after the press, or
// one of its dismissing rows ran. A flow arrow is walked when a row of its requirement ran (proof: its source control
// was pressed in that row).
// --render draws the board images from the Design PDF (no Figma call) into specs/<set>/extracted/coverage/ (local only).
// --serve [port] [--lan] keeps the page up (default http://127.0.0.1:4391/), rebuilt from the files at most every 30 s
// so new run results and taps show up; --lan binds 0.0.0.0 so other computers on the network can open it (no auth:
// anyone on the LAN can read it).
// Default output: library/<feature>/<platform>/coverage.html, self-contained (board images and the best three tap
// screenshots per control embedded; local only, git-ignored like the renders). --link writes relative links instead.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { networkInterfaces, tmpdir } from 'node:os';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { ROOT, arg, assertIds, draftsDir, featureDir, readManifest, readTable, tableDir } from './lib/library.ts';
import { arrowRequirement, matchTaps, requirementRows, tcList, type MatchGroup, type TapMatch } from './lib/coverage.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
if (process.argv.includes('--serve')) await serveMode();
// Serve mode: build the static page in a child process (this script without --serve) when the copy is over 30 s old.
async function serveMode(): Promise<never> {
  const argv = process.argv.slice(2), si = argv.indexOf('--serve');
  const portArg = /^\d+$/.test(argv[si + 1] ?? '') ? Number(argv[si + 1]) : 4391, lan = argv.includes('--lan');
  const child = argv.filter((a, i) => a !== '--serve' && a !== '--lan' && !(i === si + 1 && /^\d+$/.test(a)) && a !== '--render');
  const cache = join(tmpdir(), `coverage-${feature}-${platform}-${process.pid}.html`);
  let builtAt = 0, html = '';
  const build = () => {
    if (Date.now() - builtAt < 30_000 && html) return html;
    const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'coverage-page.ts'), ...child, '--out', cache], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr || r.stdout);
    builtAt = Date.now(); html = readFileSync(cache, 'utf8'); return html;
  };
  build();
  const server = createServer((req, res) => {
    try {
      if (req.url === '/' || req.url?.startsWith('/?')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(build()); return; }
      res.writeHead(404); res.end('Not found');
    } catch (e: any) { res.writeHead(500, { 'content-type': 'text/plain' }); res.end(String(e?.message ?? e)); }
  });
  let port = portArg; const host = lan ? '0.0.0.0' : '127.0.0.1';
  server.on('error', (e: any) => { if (e.code === 'EADDRINUSE' && port < portArg + 10) { port++; server.listen(port, host); } else throw e; });
  server.on('listening', () => {
    console.log(`Coverage (live): http://127.0.0.1:${port}/  — Ctrl+C to stop`);
    if (!lan) return;
    for (const ifs of Object.values(networkInterfaces())) for (const i of ifs ?? []) if (i.family === 'IPv4' && !i.internal) console.log(`  LAN: http://${i.address}:${port}/`);
    console.log('  Warning: --lan has no auth; anyone on this network can read the page.');
  });
  server.listen(port, host);
  return new Promise<never>(() => {});
}
const table = tableDir(feature, platform);
const manifest = readManifest(feature, platform)!;
// --draft <id>: the draft's rows, requirements and control trace (run results still come from <table>/runs)
const draftId = arg('draft');
const src = draftId ? join(draftsDir(feature, platform), draftId) : table;
const specFolder: string = draftId ? JSON.parse(readFileSync(join(src, 'spec.json'), 'utf8')).spec_folder : manifest.spec_folder;
const specDir = join(featureDir(feature), specFolder);
const ex = join(specDir, 'extracted');
const inv = JSON.parse(readFileSync(join(ex, 'inventory.json'), 'utf8'));
const tracePath = join(src, 'control-trace.json');
if (!existsSync(tracePath)) { console.error(`No ${tracePath}: run node scripts/controls.ts ${feature} ${platform}${draftId ? ` --draft ${draftId}` : ''}`); process.exit(1); }
const trace = JSON.parse(readFileSync(tracePath, 'utf8')).entries as any[];
const rows = readTable(join(src, draftId ? 'draft.csv' : 'cases.csv')).filter(r => r.Change !== 'removed');
const req = existsSync(join(src, 'requirements.md')) ? readFileSync(join(src, 'requirements.md'), 'utf8') : '';
const out = arg('out') ?? join(table, 'coverage.html');
const rel = (p: string) => relative(dirname(out), p).split('\\').join('/');
// images go inside the page (data URIs) so it shows the boards wherever it is opened, including the app's file pane
// as a snapshot; --link keeps relative links instead (smaller page, needs the files next to it)
const link = process.argv.includes('--link');
const embed = (p: string) => link ? rel(p) : `data:image/${p.endsWith('.png') ? 'png' : 'jpeg'};base64,${readFileSync(p).toString('base64')}`;

// Board images from the Design PDF (pdf point = figma point + offset), cached; a board the PDF lacks stays blank.
const imgDir = join(ex, 'coverage');
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// boards the PDF lacks (figma-frames.json: in_pdf false) get their image from Figma get_screenshot when quota allows,
// saved as the same <board>.jpg
const figmaOnly = new Set((existsSync(join(ex, 'figma-frames.json')) ? JSON.parse(readFileSync(join(ex, 'figma-frames.json'), 'utf8')).frames : [])
  .filter((fr: any) => fr.in_pdf === false).flatMap((fr: any) => [fr.node, fr.frame].filter(Boolean)));
const boards: any[] = [];
for (const [key, f] of Object.entries<any>(inv.files)) for (const [name, b] of Object.entries<any>(f.boards)) {
  const img = join(imgDir, `${slug(name)}.jpg`), pdfLacks = figmaOnly.has(b.id);
  // a saved Figma screenshot (extracted/figma/<board>.png) is current; the PDF can lag the Figma file
  const shotPng = join(ex, 'figma', `${slug(name)}.png`);
  if (process.argv.includes('--render') && existsSync(shotPng)) {
    mkdirSync(imgDir, { recursive: true });
    spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '75', '-Z', String(Math.round(Math.max(...b.box.slice(2)) * Number(arg('scale') ?? 0.45))), shotPng, '--out', img], { stdio: 'ignore' });
  } else if (process.argv.includes('--render') && f.pdf && !pdfLacks) {
    mkdirSync(imgDir, { recursive: true });
    const [x, y, w, h] = b.box, [dx, dy] = f.pdf.offset, scale = Number(arg('scale') ?? 0.45);
    const png = img.replace(/\.jpg$/, '.png');
    const r = spawnSync('node', [join(ROOT, 'scripts', 'render-region.ts'), join(specDir, f.pdf.name), png, String(x + dx), String(y + dy), String(w), String(h), '--max', String(Math.round(Math.max(w, h) * scale))], { stdio: 'inherit' });
    if (r.status === 0) { spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', png, '--out', img], { stdio: 'ignore' }); try { unlinkSync(png); } catch {} }
  }
  boards.push({ name, file: key, id: b.id, box: b.box, img: existsSync(img) ? embed(img) : '', note: existsSync(img) ? '' : pdfLacks ? `Figma-only board: save a Figma get_screenshot of node ${b.id} as ${relative(ROOT, img)}` : '' });
}

// Latest result per case and the tap log of each run.
const runsDir = join(table, 'runs');
const only = arg('runs')?.split(',').map(s => s.trim());
const runNames = existsSync(runsDir) ? readdirSync(runsDir).filter(d => existsSync(join(runsDir, d, 'results.csv')) && (!only || only.includes(d))).sort() : [];
const result = new Map<string, { result: string; run: string; at: string; actual: string; disp: string }>();
type Tap = { run: string; t: string; cmd: string; case: string; x?: number; y?: number; win?: string; el?: any; shot?: string };
const taps: Tap[] = [];
for (const run of runNames) {
  const recs = readTable(join(runsDir, run, 'results.csv'));
  for (const r of recs) {
    if (!r.ID || !r.Result || r.Result === 'Not run') continue;
    const at = r['Recorded At'] ?? '', prev = result.get(r.ID);
    if (!prev || at >= prev.at) result.set(r.ID, { result: r.Result, run, at, actual: (r.Actual ?? '').slice(0, 220), disp: r.Disposition ?? '' });
  }
  const tp = join(runsDir, run, 'taps.jsonl');
  if (!existsSync(tp)) continue;
  // a tap with no .case set belongs to the case recorded next in this run
  const ends = recs.filter(r => r['Recorded At']).map(r => ({ id: r.ID, at: r['Recorded At'] })).sort((a, b) => a.at.localeCompare(b.at));
  for (const line of readFileSync(tp, 'utf8').split('\n').filter(Boolean)) {
    try {
      const t = JSON.parse(line);
      const kase = t.case || ends.find(e => e.at >= t.t)?.id || '';
      const shotPath = t.shot ? join(runsDir, run, t.shot) : '';
      taps.push({ ...t, run, case: kase, shot: shotPath && existsSync(shotPath) ? shotPath : '' });
    } catch {}
  }
}
const ran = (id: string) => ['Pass', 'Fail', 'Inconclusive'].includes(result.get(id)?.result ?? '');

// Control groups: status from the pressing rows, proof from the taps (scored match, lib/coverage.ts).
const scr = new Map(inv.screens.map((s: any) => [s.id, s]));
const ctl = new Map(inv.controls.map((c: any) => [c.id, c]));
const pressOf = (e: any) => /^n\/a:/.test(e.press) ? [] : tcList(e.press ?? '');
const matchGroups: MatchGroup[] = trace.map(e => {
  const members = e.controls.map((id: string) => ctl.get(id)).filter(Boolean);
  return { group: e.group, kind: e.kind, name: e.name, labels: [...new Set(members.map((c: any) => c.label).filter(Boolean))] as string[], app: e.app ?? [], press: pressOf(e),
    members: members.flatMap((c: any) => [...new Set(c.screens.map((sid: string) => { const sc: any = scr.get(sid); return sc ? `${sc.box[2]}x${sc.box[3]}` : ''; }).filter(Boolean))]
      .map(sz => { const [sw, sh] = (sz as string).split('x').map(Number); return { box: c.box, sw, sh }; })) };
});
const { assigned, unmatched } = matchTaps(taps, matchGroups);
const DISMISS = /^(done|return|cancel|close|完成)$/i;
const tapView = (t: Tap, m?: TapMatch, inline = false) => ({ run: t.run, case: t.case, t: t.t, shot: t.shot ? (inline ? embed(t.shot) : rel(t.shot)) : '', x: t.x, y: t.y, win: t.win, el: t.el ? `${t.el.type} ${t.el.label || t.el.name}` : '',
  ...(m ? { score: m.score, why: m.why, outside_rows: m.outside_rows, ambiguous: m.ambiguous ?? '' } : {}) });
const groups = trace.map(e => {
  const press = pressOf(e), dismiss = tcList(e.dismiss ?? '');
  const members = e.controls.map((id: string) => ctl.get(id)).filter(Boolean);
  const hits = assigned.get(e.group) ?? [];
  // a keyboard closed later in the same case (hidekb, Done, return) dismisses the input
  const dismissed = e.kind === 'input' && (hits.some(({ tap }) => { const i = taps.indexOf(tap);
    return taps.slice(i + 1, i + 40).some(n => n.run === tap.run && n.case === tap.case && (n.cmd === 'hidekb' || DISMISS.test(n.el?.label || n.el?.name || ''))); })
    || dismiss.some(ran));
  const res = press.map(id => result.get(id)?.result ?? 'Not run');
  const status = /^n\/a:/.test(e.press) ? 'na' : hits.length ? 'proof' : !press.length ? 'none' : press.some(ran) ? 'ran'
    : res.some(r => r === 'Blocked') ? 'blocked' : 'notrun';
  const rects = members.flatMap((c: any) => c.screens.map((sid: string) => { const sc: any = scr.get(sid); return sc ? [sc.box[0] + c.box[0], sc.box[1] + c.box[1], c.box[2], c.box[3]] : null; }).filter(Boolean));
  return { group: e.group, kind: e.kind, board: e.board, boards: e.boards ?? [e.board], set: !!e.set, instances: e.instances ?? rects.length, name: e.name, label: e.label,
    node: members[0]?.node ?? '', file: members[0]?.file ?? '', press, dismiss, app: e.app ?? [], how: e.how ?? '', na: /^n\/a:/.test(e.press) ? e.press : '',
    status, norow: hits.length > 0 && !press.length, fail: res.includes('Fail'), dismissed: e.kind === 'input' ? dismissed : null,
    proof: hits.sort((a, b) => b.m.score - a.m.score).slice(0, 6).map(({ tap, m }, k) => tapView(tap, m, k < 3)), taps: hits.length, rects };
});
const groupName = new Map(groups.map(g => [g.group, `${g.name}${g.label ? ` ${g.label}` : ''}`]));
const unmatchedView = unmatched.map(u => ({ ...tapView(u.tap), best: u.tie ? `tie: ${u.tie}` : u.best ? groupName.get(u.best) ?? u.best : '', best_group: u.best ?? '', best_score: u.score }));

// Flow arrows: walked when a row of their requirement ran.
const reqRows = requirementRows(rows, req);
const listed = existsSync(join(ex, 'arrows.json')) ? JSON.parse(readFileSync(join(ex, 'arrows.json'), 'utf8')).arrows : [];
const edgeOf = new Map(listed.map((a: any) => [a.node, a]));
const groupOfCtl = new Map(groups.flatMap(g => trace.find(e => e.group === g.group).controls.map((id: string) => [id, g])));
const arrows = inv.arrows.filter((a: any) => !a.duplicate_of && a.kind !== 'pointer').map((a: any) => {
  const rid = arrowRequirement(req, a.id), rs = rid ? reqRows(rid) : [];
  const src: any = a.src ? groupOfCtl.get(a.src) : null;
  const status = !rid ? 'none' : (assigned.get(src?.group) ?? []).some(h => rs.includes(h.tap.case)) ? 'proof' : rs.some(ran) ? 'ran'
    : rs.some(id => result.get(id)?.result === 'Blocked') ? 'blocked' : 'notrun';
  return { id: a.id, board: a.board, points: a.points, kind: a.kind, req: rid ?? '', rows: rs, status, fail: rs.some(id => result.get(id)?.result === 'Fail'),
    edge: (edgeOf.get(a.id) as any)?.edge ?? a.name, src: src?.group ?? '' };
});

const usedRows = new Set([...groups.flatMap(g => [...g.press, ...g.dismiss]), ...arrows.flatMap((a: any) => a.rows)]);
// why a row is Blocked, in one line the page can group by (the run's Actual text names the cause)
const blockReason = (x: { actual: string; disp: string }) => {
  const a = x.actual;
  const known: [RegExp, string][] = [
    [/Gate video failed|No video ever started|video gate failed/i, 'Video never generated on that build (video gate failed)'],
    [/needs low-balance/i, 'Needs a low credit balance (the shared account holds ~20,000 credits)'],
    [/needs purchase/i, 'Purchases are not made in runs (user rule)'],
    [/needs voice/i, 'Needs speech, which Appium cannot give'],
    [/needs full-generation/i, 'Full template generations held back (REQ-019)'],
    [/stt-failure/i, 'No fixture makes speech-to-text fail (RD)'],
    [/hero banner|CMS/i, 'Banner content is CMS-driven and did not show'],
    [/Use up today's chats|daily chat/i, 'Daily-limit state for that tier could not be set up (test-data)'],
  ];
  return known.find(([re]) => re.test(a))?.[1] ?? `${x.disp ? `${x.disp}: ` : ''}${a.replace(/\s+/g, ' ').slice(0, 90)}`;
};
const rowInfo = Object.fromEntries(rows.filter(r => usedRows.has(r.ID)).map(r => { const x = result.get(r.ID);
  return [r.ID, { action: r.Action, expected: r['Expected Result'], section: r.Section, ...(x ?? { result: 'Not run' }), ...(x?.result === 'Blocked' ? { reason: blockReason(x) } : {}) }]; }));
const data = {
  feature, platform, title: manifest.title ?? feature, version: draftId ? `${manifest.version} + draft ${draftId}` : manifest.version, spec_folder: specFolder, built_at: new Date().toISOString(),
  runs: runNames, taps: taps.length, unmatched: unmatchedView, figma: Object.fromEntries(Object.entries<any>(inv.files).map(([k, f]) => [k, `https://www.figma.com/design/${k}/?node-id=`])),
  boards, screens: inv.screens.map((s: any) => ({ id: s.id, board: s.board, box: s.box, name: s.name, panel: !!s.panel, other: s.platform !== platform && s.platform !== 'any' })),
  groups, arrows, rows: rowInfo,
};
const tpl = readFileSync(join(import.meta.dirname, 'coverage-page.tpl'), 'utf8');
writeFileSync(out, tpl.replaceAll('__TITLE__', `${data.title} Coverage`).replace('__DATA__', () => JSON.stringify(data).replace(/</g, '\\u003c')));
const count = (xs: any[]) => xs.reduce((m, x) => (m[x.status] = (m[x.status] ?? 0) + 1, m), {} as Record<string, number>);
console.log(JSON.stringify({ out, kb: Math.round(statSync(out).size / 1024), runs: runNames.length, taps: taps.length, images: boards.filter(b => b.img).length + '/' + boards.length,
  controls: count(groups), arrows: count(arrows) }, null, 1));
