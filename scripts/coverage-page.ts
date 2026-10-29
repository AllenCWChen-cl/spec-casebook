// Coverage page (REQ-038): the Figma boards with every tappable control and flow arrow marked by whether a run pressed
// or walked it, with the counts on top and the tap screenshots as proof.
// Usage: node scripts/coverage-page.ts <product>/<feature> <ios|android> [--draft <id>] [--runs <run dir name,…>] [--render] [--scale 0.45] [--out <file.html>] [--link]
//        node scripts/coverage-page.ts <product>/<feature> <ios|android> [--draft <id>] [--runs …] --serve [port] [--lan]
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
// --render draws the board images from the Design, PM and MX PDFs (no Figma call) into specs/<set>/extracted/coverage/
// (local only), each board grown to hold the screens that hang over its edge; <board>.json keeps the box drawn.
// --render-spec pm,mx limits --render to those specs (the PM page is large: ~20 s a board).
// --serve [port] [--lan] keeps the page up (default http://127.0.0.1:4391/), rebuilt from the files at most every 30 s
// so new run results and taps show up; --lan binds 0.0.0.0 so other computers on the network can open it (no auth:
// anyone on the LAN can read it). scripts/pages.ts serves it next to the review and plan pages, with links between them.
// Case view: #case=TC-012 (or the Case box) shows where a case comes from: its requirements with their spec boards,
// and the controls and arrows it presses or walks, highlighted on the board.
// Default output: library/<product>/<feature>/<platform>/coverage.html, self-contained (board images and the best three tap
// screenshots per control embedded; local only, git-ignored like the renders). --link writes relative links instead;
// --files (what --serve uses) links them as files/<path under the repo>, which the server sends.
// Spec regions (boards.json) of a PDF the Figma inventory does not cover (PM, MX) are boards too, image only (rendered
// by --render, capped at 3000 px), so a case whose requirement comes from the PM or MX spec still shows its board.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { networkInterfaces, tmpdir } from 'node:os';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { ROOT, arg, assertIds, draftsDir, featureDir, readManifest, readTable, tableDir } from './lib/library.ts';
import { LINK_STEP, linkBlocks } from './lib/links.ts';
import { arrowRequirement, matchTaps, requirementRows, tcList, type MatchGroup, type TapMatch } from './lib/coverage.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
if (process.argv.includes('--serve')) await serveMode();
// Serve mode: build the static page in a child process (this script without --serve) when the copy is over 30 s old,
// or at once when scripts/pages.ts says files changed (a new x-casebook-stamp header).
async function serveMode(): Promise<never> {
  const argv = process.argv.slice(2), si = argv.indexOf('--serve');
  const portArg = /^\d+$/.test(argv[si + 1] ?? '') ? Number(argv[si + 1]) : 4391, lan = argv.includes('--lan');
  const child = [...argv.filter((a, i) => a !== '--serve' && a !== '--lan' && !(i === si + 1 && /^\d+$/.test(a)) && a !== '--render'), '--files'];
  const cache = join(tmpdir(), `coverage-${feature.replace('/', '-')}-${platform}-${process.pid}.html`);
  let builtAt = 0, html = '', builtFor = '';
  const build = (stamp = builtFor) => {
    if (Date.now() - builtAt < 30_000 && html && stamp === builtFor) return html;
    builtFor = stamp;
    const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'coverage-page.ts'), ...child, '--out', cache], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr || r.stdout);
    builtAt = Date.now(); html = readFileSync(cache, 'utf8'); return html;
  };
  build();
  const server = createServer((req, res) => {
    try {
      if (req.url === '/' || req.url?.startsWith('/?')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(build(String(req.headers['x-casebook-stamp'] ?? builtFor))); return; }
      // board renders and tap screenshots (--files): images under library/ only
      const f = req.url?.match(/^\/files\/([^?#]+)/);
      if (f) {
        const p = join(ROOT, decodeURIComponent(f[1])), type = /\.png$/i.test(p) ? 'image/png' : /\.jpe?g$/i.test(p) ? 'image/jpeg' : '';
        if (type && relative(join(ROOT, 'library'), p).split(/[\\/]/)[0] !== '..' && existsSync(p)) {
          res.writeHead(200, { 'content-type': type, 'cache-control': 'max-age=300' }); res.end(readFileSync(p)); return; }
      }
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
const files = process.argv.includes('--files');
const rel = (p: string) => files ? `files/${encodeURI(relative(ROOT, p).split('\\').join('/'))}` : relative(dirname(out), p).split('\\').join('/');
// images go inside the page (data URIs) so it shows the boards wherever it is opened, including the app's file pane
// as a snapshot; --link keeps relative links instead (smaller page, needs the files next to it)
const link = process.argv.includes('--link');
const embed = (p: string) => link || files ? rel(p) : `data:image/${p.endsWith('.png') ? 'png' : 'jpeg'};base64,${readFileSync(p).toString('base64')}`;

// Board images from the spec PDFs (pdf point = figma point + offset), cached; a board the PDF lacks stays blank.
const imgDir = join(ex, 'coverage');
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// boards the PDF lacks (figma-frames.json: in_pdf false) get their image from Figma get_screenshot when quota allows,
// saved as the same <board>.jpg
const frames = existsSync(join(ex, 'figma-frames.json')) ? JSON.parse(readFileSync(join(ex, 'figma-frames.json'), 'utf8')) : {};
const figmaOnly = new Set((frames.frames ?? []).filter((fr: any) => fr.in_pdf === false).flatMap((fr: any) => [fr.node, fr.frame].filter(Boolean)));
// which spec each Figma file is (pm / design / mx): figma-frames.json names the file keys, else the PDF it lines up with
const specOfKey = new Map(Object.entries<any>(frames.files ?? {}).map(([role, f]) => [f.fileKey, role]));
const specOf = (key: string) => specOfKey.get(key) ?? (/\bMX\b/i.test(inv.files[key]?.pdf?.name ?? '') ? 'mx' : /\bPM\b/i.test(inv.files[key]?.pdf?.name ?? '') ? 'pm' : 'design');
const boards: any[] = [];
const union = (box: number[], more: number[][]) => {
  const x0 = Math.min(box[0], ...more.map(r => r[0])), y0 = Math.min(box[1], ...more.map(r => r[1]));
  return [x0, y0, Math.max(box[0] + box[2], ...more.map(r => r[0] + r[2])) - x0, Math.max(box[1] + box[3], ...more.map(r => r[1] + r[3])) - y0];
};
const regionsByPdf = existsSync(join(ex, 'boards.json')) ? JSON.parse(readFileSync(join(ex, 'boards.json'), 'utf8')) as Record<string, { id: string; title: string; region: number[] }[]> : {};
// The PM and MX Figma reads cut a large section into tiles (board id "<node>/<tile>", e.g. pm-main-flow-11 … -34) to
// stay in the Figma quota. The page joins them back: every tile inside one spec region (boards.json) becomes that
// region's board, so a section shows whole, with its title and notes, instead of a slice cut through text.
const boardOf = new Map<string, string>();
for (const f of Object.values<any>(inv.files)) {
  if (!f.pdf) continue;
  const [dx, dy] = f.pdf.offset;
  for (const r of regionsByPdf[f.pdf.name] ?? []) {
    const [rx, ry, rw, rh] = r.region;
    const tiles = Object.entries<any>(f.boards).filter(([name, b]) => b.id.includes('/') && !boardOf.has(name) && (() => { const [x, y, w, h] = b.box;
      const ox = Math.max(0, Math.min(x + dx + w, rx + rw) - Math.max(x + dx, rx)), oy = Math.max(0, Math.min(y + dy + h, ry + rh) - Math.max(y + dy, ry));
      return ox * oy >= 0.5 * w * h; })());
    if (tiles.length < 2) continue;
    for (const [name] of tiles) { boardOf.set(name, r.id); delete f.boards[name]; }
    const boxes = [[rx - dx, ry - dy, rw, rh], ...tiles.map(([, b]) => b.box)];
    f.boards[r.id] = { id: `${tiles[0][1].id.split('/')[0]}/${r.id}`, box: boxes.slice(1).reduce((u, b) => union(u, [b]), boxes[0]) };
  }
}
const sectionOf = (name: string) => boardOf.get(name) ?? name;
for (const s of inv.screens) s.board = sectionOf(s.board);
for (const a of inv.arrows) a.board = sectionOf(a.board);
for (const e of trace) { e.board = sectionOf(e.board); if (e.boards) e.boards = [...new Set(e.boards.map(sectionOf))]; }
// A board is shown with every screen it holds: the PM and MX boards are tiles of a large section (id "<node>/<tile>")
// and a screen can hang over the tile's edge, so the board box grows to hold them and the render follows it.
const screensOf = new Map<string, number[][]>();
for (const s of inv.screens) screensOf.set(s.board, [...screensOf.get(s.board) ?? [], s.box]);
// the box an image was drawn for sits next to it (<board>.json), so a render never gets stretched onto another box;
// an older render without one is taken as drawn for the board box
const imgBoxOf = (img: string, box: number[]) => { try { return JSON.parse(readFileSync(img.replace(/\.jpg$/, '.json'), 'utf8')).box; } catch { return box; } };
const saveImgBox = (img: string, box: number[]) => writeFileSync(img.replace(/\.jpg$/, '.json'), JSON.stringify({ box }));
// --render: PDF crops are queued per PDF and drawn after the loops, one PDF load each (render-region.ts --jobs)
const render = process.argv.includes('--render'), scale = Number(arg('scale') ?? 0.45), renderSpecs = arg('render-spec')?.split(',');
const jobs = new Map<string, { out: string; img: string; region: number[]; max: number; box: number[] }[]>();
const queue = (pdf: string, img: string, region: number[], box: number[]) => jobs.set(pdf, [...jobs.get(pdf) ?? [],
  { out: img.replace(/\.jpg$/, '.png'), img, region, box, max: Math.min(6000, Math.round(Math.max(region[2], region[3]) * scale)) }]);
for (const [key, f] of Object.entries<any>(inv.files)) for (const [name, b] of Object.entries<any>(f.boards)) {
  // Design boards keep their file names; PM and MX boards get the spec in front, apart from the region renders below
  const spec = specOf(key), img = join(imgDir, `${spec === 'design' ? '' : `${spec}-board-`}${slug(name)}.jpg`), pdfLacks = figmaOnly.has(b.id);
  const box = union(b.box, screensOf.get(name) ?? []);
  // a saved Figma screenshot (extracted/figma/<board>.png) is current; the PDF can lag the Figma file
  const shotPng = join(ex, 'figma', `${slug(name)}.png`);
  if (render && existsSync(shotPng)) {
    mkdirSync(imgDir, { recursive: true });
    spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '75', '-Z', String(Math.round(Math.max(...b.box.slice(2)) * scale)), shotPng, '--out', img], { stdio: 'ignore' });
    saveImgBox(img, b.box);
  } else if (render && f.pdf && !pdfLacks && (!renderSpecs || renderSpecs.includes(spec))) queue(join(specDir, f.pdf.name), img, [box[0] + f.pdf.offset[0], box[1] + f.pdf.offset[1], box[2], box[3]], box);
  boards.push({ name, file: key, spec, id: b.id, box, imgPath: img,
    note: pdfLacks ? `Figma-only board: save a Figma get_screenshot of node ${b.id} as ${relative(ROOT, img)}` : 'No render yet: run with --render' });
}
// Spec regions no Figma board lies in (the PM and MX PDFs): boards of their own in PDF points, image only.
const specOfPdf = (pdf: string) => /\bMX\b/i.test(pdf) ? 'mx' : /\bPM\b/i.test(pdf) ? 'pm' : 'design';
const SPEC_NAME: Record<string, string> = { design: 'Design', pm: 'PM', mx: 'MX' };
const regionOf = new Map<string, { id: string; title: string; spec: string; boards: string[] }>();
for (const [pdf, list] of Object.entries(regionsByPdf)) {
  const f = Object.values<any>(inv.files).find(f => f.pdf?.name === pdf);
  for (const r of list) {
    const [rx, ry, rw, rh] = r.region;
    // the Figma boards inside the region (pdf point = figma point + offset), or holding most of it (an MX board is
    // taller than the region drawn around its screens)
    const inside = !f ? [] : Object.entries<any>(f.boards).filter(([, b]) => { const [x, y, w, h] = b.box, X = x + f.pdf.offset[0], Y = y + f.pdf.offset[1];
      const ox = Math.max(0, Math.min(X + w, rx + rw) - Math.max(X, rx)), oy = Math.max(0, Math.min(Y + h, ry + rh) - Math.max(Y, ry));
      return ox * oy >= 0.5 * Math.min(w * h, rw * rh); }).map(([name]) => name);
    const spec = specOfPdf(pdf);
    if (!inside.length) {
      // region- in front: a PM or MX Figma board can carry the same name as a region
      const name = `${SPEC_NAME[spec]} · ${r.title}`, img = join(imgDir, `region-${r.id}.jpg`);
      if (render && existsSync(join(specDir, pdf)) && (!renderSpecs || renderSpecs.includes(spec))) queue(join(specDir, pdf), img, r.region, r.region);
      boards.push({ name, file: '', spec, id: r.id, region: r.id, box: r.region, imgPath: img, note: `No render yet: run with --render (draws ${r.id} from ${pdf})` });
      inside.push(name);
    }
    regionOf.set(r.id, { id: r.id, title: r.title, spec, boards: inside });
  }
}
for (const [pdf, list] of jobs) {
  mkdirSync(imgDir, { recursive: true });
  const jobsFile = join(tmpdir(), `coverage-jobs-${process.pid}.json`);
  writeFileSync(jobsFile, JSON.stringify(list.map(({ out, region, max }) => ({ out, region, max }))));
  spawnSync('node', [join(ROOT, 'scripts', 'render-region.ts'), pdf, '--jobs', jobsFile], { stdio: 'inherit' });
  unlinkSync(jobsFile);
  for (const j of list) if (existsSync(j.out)) { spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', j.out, '--out', j.img], { stdio: 'ignore' }); unlinkSync(j.out); saveImgBox(j.img, j.box); }
}
// PM and MX boards are named by the read (pm-update-11, mx-b-left: their Figma frames are unnamed "Frame 1430…"), so
// the page shows the spec region's title from boards.json instead; the name stays the key. Two boards in one region
// keep their name after the title.
const regionTitle = (b: any) => b.spec === 'design' || b.region ? '' : (r => r ? `${SPEC_NAME[b.spec]} · ${r.title}` : '')(
  regionOf.get(b.name) ?? [...regionOf.values()].find(r => r.boards.includes(b.name)));
const titled = boards.map(regionTitle);
for (const [i, b] of boards.entries()) if (titled[i]) b.title = titled.filter(x => x === titled[i]).length > 1 ? `${titled[i]} (${b.name})` : titled[i];
for (const b of boards) {
  const has = existsSync(b.imgPath);
  Object.assign(b, { img: has ? embed(b.imgPath) : '', img_box: has ? imgBoxOf(b.imgPath, b.box) : null, note: has ? '' : b.note });
  delete b.imgPath;
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
// a draft's new and modified rows are re-run in the next round: their earlier results describe the old row
if (draftId) for (const r of rows) if (r.Change === 'modified' || r.Change === 'new') result.delete(r.ID);
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
    node: members[0]?.node ?? '', file: members[0]?.file ?? '', spec: members[0]?.file ? specOf(members[0].file) : '', press, dismiss, app: e.app ?? [], how: e.how ?? '', na: /^n\/a:/.test(e.press) ? e.press : '',
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
  // an arrow arrows.json marks not_flow (a superseded version's arrow, an annotation pointer) is drawn as excluded
  const na = (edgeOf.get(a.id) as any)?.not_flow;
  const status = na && !rid ? 'na' : !rid ? 'none' : (assigned.get(src?.group) ?? []).some(h => rs.includes(h.tap.case)) ? 'proof' : rs.some(ran) ? 'ran'
    : rs.some(id => result.get(id)?.result === 'Blocked') ? 'blocked' : 'notrun';
  return { id: a.id, board: a.board, points: a.points, kind: a.kind, req: rid ?? '', rows: rs, status, fail: rs.some(id => result.get(id)?.result === 'Fail'),
    edge: (edgeOf.get(a.id) as any)?.edge ?? a.name, src: src?.group ?? '', na: na ?? '' };
});

// Spec notes (user, 2026-10-29): every annotation block of the draft's annotation-trace.json is marked on its board,
// so no board is left blank. A block traced to requirements takes the state of their rows; label / ui / older / Q-n
// blocks are excluded with their reason; an untraced block is missing. Block positions are PDF points of its board's
// PDF (boards.json), placed on the Figma board holding them (pdf point = figma point + offset) or on the region board.
const tracePathA = join(draftId ? src : join(draftsDir(feature, platform), manifest.draft ?? ''), 'annotation-trace.json');
const blocks: any[] = existsSync(tracePathA) ? JSON.parse(readFileSync(tracePathA, 'utf8')).blocks : [];
// a linked table's items (extracted/links.json) the draft has not traced yet are shown missing, never left off
// and every linked item carries its short label and place in the list (link_i), which the page draws as a table
const linkInfo = new Map(linkBlocks(ex).map(lb => [lb.id, lb]));
for (const lb of linkInfo.values()) if (!blocks.some(b => b.id === lb.id)) blocks.push(lb);
const pdfOfRegion = new Map(Object.entries(regionsByPdf).flatMap(([pdf, list]) => list.map(r => [r.id, pdf] as [string, string])));
const notes = blocks.flatMap(bk => {
  const pdf = pdfOfRegion.get(bk.board), key = Object.keys(inv.files).find(k => inv.files[k].pdf?.name === pdf);
  const off = key ? inv.files[key].pdf.offset : [0, 0], fx = bk.x - off[0], fy = bk.y - off[1];
  const at = (b: any, x: number, y: number) => x >= b.box[0] && x <= b.box[0] + b.box[2] && y >= b.box[1] && y <= b.box[1] + b.box[3];
  const b = boards.find(b => b.file === key && at(b, fx, fy)) ?? boards.find(b => b.region === bk.board);
  if (!b) return [];
  const [x, y] = b.region ? [bk.x, bk.y] : [fx, fy];
  const reqIds: string[] = /^R-/.test(bk.trace) ? bk.trace.match(/R-\d+/g) : [];
  // a linked-table variant names its own row ("R-463 (TC-231)"); other blocks take every row of their requirements
  const own = /^R-/.test(bk.trace) ? bk.trace.match(/\bTC-\d+\b/g) ?? [] : [];
  const rs = own.length ? [...new Set<string>(own)] : [...new Set(reqIds.flatMap(rid => reqRows(rid)))];
  const status = !bk.trace ? 'none' : !reqIds.length ? 'na' : rs.some(ran) ? 'ran' : rs.some(id => result.get(id)?.result === 'Blocked') ? 'blocked' : rs.length ? 'notrun' : 'none';
  return [{ id: bk.id, board: b.name, x, y, text: bk.text, trace: bk.trace, link: bk.link ?? '',
    ...(linkInfo.has(bk.id) ? (({ label, link_i, link_label }) => ({ label, link_i, link_label, link_at: [x, y - LINK_STEP * (link_i + 1)] }))(linkInfo.get(bk.id)!) : {}), reqs: reqIds, rows: rs, status, fail: rs.some(id => result.get(id)?.result === 'Fail') }];
});

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
// Where each case comes from (case view): the requirements its Spec Ref names, each with its source tags
// ([DS:ds-home-custom-chat], [PM:pm-main-flow §5], [MX:mx-b-mid]) resolved to the spec region and its boards (above).
const screenByNode = new Map<string, any>(inv.screens.map((s: any) => [s.id, s]));
// every arrow, including the annotation pointers and duplicates the counts leave out, so a requirement written for one
// still points at its board
const arrowById = new Map<string, any>(inv.arrows.map((a: any) => [a.id, a]));
const counted = new Set(arrows.map((a: any) => a.id));
const groupOfCtlId = new Map(trace.flatMap(e => e.controls.map((id: string) => [id, e.group])));
const reqLines = new Map(req.split('\n').map(l => l.match(/^- (R-\d{3,}) (.*)/)).filter(Boolean).map(m => [m![1], m![2]]));
const reqView = (rid: string) => {
  const line = reqLines.get(rid) ?? '';
  const tags = [...line.matchAll(/\[(DS|PM|MX):\s*([^\]]*)\]/g)];
  const src = tags.flatMap(([, kind, body]) => {
    const spec = kind === 'DS' ? 'design' : kind.toLowerCase();
    const ids = [...body.matchAll(/\b((?:ds|pm|mx)-[a-z0-9-]+)/g)].map(m => m[1]).filter(id => regionOf.has(id));
    if (ids.length) return ids.map(id => ({ ...regionOf.get(id)!, detail: body.replace(/;?\s*Req:.*$/, '').replace(id, '').trim() }));
    const arrow = body.match(/flow arrow (\S+)/)?.[1];
    if (arrow) { const a = arrowById.get(arrow), e: any = edgeOf.get(arrow);
      return [{ id: '', title: `flow arrow ${arrow}`, spec, boards: a ? [a.board] : [], detail: e?.edge ?? a?.name ?? '' }]; }
    const named = [...body.matchAll(/\b(\d+:\d+)\b/g)].map(m => screenByNode.get(m[1])).filter(Boolean);
    return [{ id: '', title: '', spec, boards: [...new Set(named.map((sc: any) => sc.board as string))], detail: body.replace(/https?:\S+/g, '').replace(/;?\s*Req:.*$/, '').trim() }];
  });
  return {
    text: line.replace(/^(\[[^\]]*\])+\s*/, '').slice(0, 320), src,
    // a control or screen the tag names outright: [DS: control K-ab333a …], [DS:figma 1016_support free trial 4847:34277]
    groups: [...new Set([...line.matchAll(/\b([KC]-[0-9a-f]{6})\b/g)].map(m => groupOfCtlId.get(m[1]) ?? (trace.some(e => e.group === m[1]) ? m[1] : '')).filter(Boolean))],
    screens: [...new Set([...line.matchAll(/\b(\d+:\d+)\b/g)].map(m => m[1]).filter(id => screenByNode.has(id)))],
    // other Figma nodes it names (a frame the inventory does not hold): linked to the Design file
    nodes: [...new Set([...line.matchAll(/\b(\d+:\d+)\b/g)].map(m => m[1]).filter(id => !screenByNode.has(id)))],
    // annotation pointers and duplicate arrows it is written for (not counted above, drawn in the case view)
    pointers: [...line.matchAll(/flow arrow (\S+)/g)].map(m => arrowById.get(m[1])).filter((a: any) => a && !counted.has(a.id)).map((a: any) => ({ board: a.board, points: a.points })),
  };
};
const refsOf = (r: Record<string, string>) => [...new Set((r['Spec Ref'] ?? '').match(/\bR-\d{3,}\b/g) ?? [])];
const reqs = Object.fromEntries([...new Set(rows.flatMap(refsOf))].filter(rid => reqLines.has(rid)).map(rid => [rid, reqView(rid)]));
const rowInfo = Object.fromEntries(rows.map(r => { const x = result.get(r.ID);
  return [r.ID, { action: r.Action, expected: r['Expected Result'], section: r.Section, refs: refsOf(r), ...(x ?? { result: 'Not run' }), ...(x?.result === 'Blocked' ? { reason: blockReason(x) } : {}) }]; }));
const data = {
  feature, platform, draft: draftId ?? null, title: manifest.title ?? feature, version: draftId ? `${manifest.version} + draft ${draftId}` : manifest.version, spec_folder: specFolder, built_at: new Date().toISOString(),
  runs: runNames, taps: taps.length, unmatched: unmatchedView, figma: Object.fromEntries(Object.entries<any>(inv.files).map(([k, f]) => [k, `https://www.figma.com/design/${k}/?node-id=`])),
  boards, screens: inv.screens.map((s: any) => ({ id: s.id, board: s.board, box: s.box, name: s.name, panel: !!s.panel, other: s.platform !== platform && s.platform !== 'any' })),
  groups, arrows, notes, rows: rowInfo, reqs,
};
const tpl = readFileSync(join(import.meta.dirname, 'coverage-page.tpl'), 'utf8');
writeFileSync(out, tpl.replaceAll('__TITLE__', `${data.title} Coverage`).replace('__DATA__', () => JSON.stringify(data).replace(/</g, '\\u003c')));
const count = (xs: any[]) => xs.reduce((m, x) => (m[x.status] = (m[x.status] ?? 0) + 1, m), {} as Record<string, number>);
console.log(JSON.stringify({ out, kb: Math.round(statSync(out).size / 1024), runs: runNames.length, taps: taps.length, images: boards.filter(b => b.img).length + '/' + boards.length,
  controls: count(groups), arrows: count(arrows), notes: `${notes.length}/${blocks.length}`, notes_by: count(notes) }, null, 1));
