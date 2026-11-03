// Design page (figma skill, references/conformance.md): every Design screen with how the app compares to it, so the
// design check reads like the other casebook pages. One card per screen, filtered by status and board; a card opens
// the Figma screen and the app screenshot side by side with each difference boxed on both and listed with its verdict.
// Usage: node scripts/design-page.ts <product>/<feature> <ios|android> [--out <file.html>]
//        node scripts/design-page.ts <product>/<feature> <ios|android> --serve [port] [--lan]
// Reads <table>/design/plan.json and, per run folder, design/compare.json and design/findings.json (design.ts plan,
// check, settle and decide); the newest run that captured a screen is the one shown. A screen is
//   differs      a settled `bug`                       question     a verdict the two passes split on, or `question`
//   unreviewed   measured, candidates not settled yet  matches      measured, nothing left but `ok` / info
//   not captured reached by a row, no capture yet       no route / excluded   from the plan
// Images: the Figma side is figma-source's crop when this machine has it, else the committed board screenshot cropped
// in the browser; the app side is the run's screenshots/design/<id>.png on the computer that ran it, else the compact
// copy committed with the run (design/captures/<id>.webp), so every computer that pulled the repo shows both sides.
// Decisions (Figma Agent parity, 2026-11-03): each open question takes Bug / OK / N/A and each bug an eBug tick; the
// choices stay in the browser (localStorage) and Copy decisions puts them on the clipboard for the chat, where the
// agent writes them into findings.json (`decided`) and drafts the ticked eBugs, like the review page's Copy decisions.
// --serve (default port 4493) rebuilds on every request; scripts/pages.ts serves it as /design/.
import { existsSync, openSync, readdirSync, readFileSync, readSync, closeSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { join, relative } from 'node:path';
import { ROOT, arg, assertIds, featureDir, readManifest, tableDir } from './lib/library.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const table = tableDir(feature, platform), fdir = featureDir(feature), runsDir = join(table, 'runs');
const si = process.argv.indexOf('--serve'), serve = si >= 0, lan = process.argv.includes('--lan');
const title = readManifest(feature, platform)?.title ?? feature;
const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const pngWidth = (p: string) => { const b = Buffer.alloc(24), fd = openSync(p, 'r'); readSync(fd, b, 0, 24, 0); closeSync(fd); return b.readUInt32BE(16); };

function buildData(link: (abs: string) => string) {
  const planFile = join(table, 'design', 'plan.json');
  if (!existsSync(planFile)) return { feature, title, platform, missing: true };
  const plan = read(planFile);
  const out = join(fdir, 'specs', plan.spec_set, 'extracted', 'figma-source', 'design', 'out');
  // the newest measure per screen over every run folder
  const seen = new Map<string, any>();
  for (const d of existsSync(runsDir) ? readdirSync(runsDir).filter(d => statSync(join(runsDir, d)).isDirectory()).sort() : []) {
    const cf = join(runsDir, d, 'design', 'compare.json');
    if (!existsSync(cf)) continue;
    const ff = join(runsDir, d, 'design', 'findings.json'), found = existsSync(ff) ? read(ff).screens : null;
    for (const s of read(cf).screens) if ((seen.get(s.id)?.captured_at ?? '') <= s.captured_at) seen.set(s.id, { ...s, run: d, settled: !!found, verdicts: found?.[s.id] ?? {} });
  }
  const widths = new Map<string, number>();
  const screens = plan.screens.map((s: any) => {
    const crop = join(out, 'crops', s.board.replace(/[:;]/g, '-'), `${s.id.replace(/[:;]/g, '-')}.png`);
    let figma: any = null;
    if (existsSync(crop)) figma = { src: link(crop) };
    else if (s.board_png && s.board_box && existsSync(join(fdir, s.board_png))) {
      const p = join(fdir, s.board_png);
      if (!widths.has(p)) widths.set(p, pngWidth(p));
      const k = widths.get(p)! / s.board_box[2];
      figma = { src: link(p), iw: widths.get(p), crop: [(s.abs[0] - s.board_box[0]) * k, (s.abs[1] - s.board_box[1]) * k, s.abs[2] * k, s.abs[3] * k] };
    }
    const m = seen.get(s.id);
    let status = s.status === 'routed' ? 'not-captured' : s.status, items: any[] = [];
    if (m) {
      items = m.candidates.map((c: any) => ({ ...c, ...(m.verdicts[c.id] ?? {}), verdict: m.verdicts[c.id]?.verdict ?? (m.settled ? (c.severity === 'info' ? 'info' : 'ok') : c.severity === 'info' ? 'info' : 'unreviewed') }));
      for (const [id, v] of Object.entries<any>(m.verdicts)) if (!items.some(i => i.id === id)) items.push({ id, kind: id.split(':')[0], ...v });
      status = items.some(i => i.verdict === 'bug') ? 'differs' : items.some(i => i.verdict === 'question') ? 'question' : items.some(i => i.verdict === 'unreviewed') ? 'unreviewed' : 'matches';
    }
    // the run's own screenshot on the computer that ran it, else the compact copy committed with the run
    const img = (rel: string) => { const full = join(runsDir, m.run, rel), shared = join(runsDir, m.run, 'design', 'captures', rel.split('/').pop()!.replace(/\.png$/, '.webp'));
      return existsSync(full) ? link(full) : existsSync(shared) ? link(shared) : null; };
    const app = m ? img(m.png) : null;
    return { id: s.id, name: s.name, board: s.board_name, status, why: s.why ?? '', gap: !!s.gap, route: s.route ?? null, alternatives: s.alternatives ?? [], figma, app,
      run: m?.run ?? '', captured_at: m?.captured_at ?? '', build: m?.build ?? '', note: m?.note ?? '', arrival: m?.arrival ?? null, recheck: m?.recheck ?? null,
      parts: (m?.parts ?? []).map((p: string) => img(p)).filter(Boolean),
      settled: !!m?.settled, win: m?.win ?? null, k: m?.k ?? null, fit: m?.fit ?? null, w: s.abs[2], h: s.abs[3], items };
  });
  return { feature, title, platform, built_at: new Date().toISOString(), spec_set: plan.spec_set, file: plan.file?.key ?? plan.file?.fileKey ?? '', screens };
}

const page = (data: unknown) => readFileSync(join(import.meta.dirname, 'design-page.tpl'), 'utf8')
  .replaceAll('__TITLE__', `${title} Design check`).replace('__DATA__', () => JSON.stringify(data).replace(/</g, '\\u003c'));

if (serve) {
  const portArg = /^\d+$/.test(process.argv[si + 1] ?? '') ? Number(process.argv[si + 1]) : 4493;
  const server = createServer((req, res) => {
    try {
      const url = req.url ?? '/';
      if (url === '/' || url.startsWith('/?')) {
        const html = page(buildData(abs => `files/${encodeURI(relative(ROOT, abs).split('\\').join('/'))}`));
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(html); return;
      }
      // images under this feature's folder only
      const f = url.match(/^\/files\/([^?#]+)/);
      if (f) {
        const p = join(ROOT, decodeURIComponent(f[1]));
        if (/\.(png|webp)$/i.test(p) && relative(fdir, p).split(/[\\/]/)[0] !== '..' && existsSync(p)) {
          res.writeHead(200, { 'content-type': /webp$/i.test(p) ? 'image/webp' : 'image/png', 'cache-control': 'max-age=300' }); res.end(readFileSync(p)); return; }
      }
      res.writeHead(404); res.end('Not found');
    } catch (e: any) { res.writeHead(500, { 'content-type': 'text/plain' }); res.end(String(e?.message ?? e)); }
  });
  let port = portArg; const host = lan ? '0.0.0.0' : '127.0.0.1';
  server.on('error', (e: any) => { if (e.code === 'EADDRINUSE' && port < portArg + 10) { port++; server.listen(port, host); } else throw e; });
  server.on('listening', () => {
    console.log(`Design (live): http://127.0.0.1:${port}/  — Ctrl+C to stop`);
    if (!lan) return;
    for (const ifs of Object.values(networkInterfaces())) for (const i of ifs ?? []) if (i.family === 'IPv4' && !i.internal) console.log(`  LAN: http://${i.address}:${port}/`);
    console.log('  Warning: --lan has no auth; anyone on this network can read the page.');
  });
  server.listen(port, host);
} else {
  const out = arg('out') ?? join(table, 'design', 'design.html');
  const data: any = buildData(abs => encodeURI(relative(join(out, '..'), abs).split('\\').join('/')));
  writeFileSync(out, page(data));
  console.log(`${relative(ROOT, out)}: ${data.missing ? 'no design/plan.json yet' : `${data.screens.length} screens`}`);
}
