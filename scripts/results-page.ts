// Results page (user, 2026-10-28): every run's cases with their result, the reason behind it (Actual, the blocked note),
// the expected result and the screenshots recorded as evidence, so a run reads without opening its folder. The run plan
// shows where a run stands; this page shows what each case found.
// Usage: node scripts/results-page.ts <feature> <platform> [--out <file.html>]
//        node scripts/results-page.ts <feature> <platform> --serve [port] [--lan]
// Reads runs/*/results.csv (the latest record per case in each run folder), each folder's run-state.md (phase, build)
// and blocked-reasons.json, and the table's cases.csv (Precondition, Priority). --serve (default port 4492) rebuilds on
// every request and sends the screenshots as files/<path under the repo>; scripts/pages.ts serves it as /results/.
// Without --serve: runs/results.html, with the screenshots linked relative to it (open it from the runs folder).
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { join, relative } from 'node:path';
import { readRecords } from './lib/csv.ts';
import { ROOT, arg, assertIds, readManifest, readTable, tableDir } from './lib/library.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const table = tableDir(feature, platform), runsDir = join(table, 'runs');
const si = process.argv.indexOf('--serve'), serve = si >= 0, lan = process.argv.includes('--lan');
const IMG = /\.(png|jpe?g)$/i;
const title = readManifest(feature, platform)?.title ?? feature;

function buildData(link: (abs: string) => string) {
  const cases = existsSync(join(table, 'cases.csv')) ? readTable(join(table, 'cases.csv')) : [];
  const row = new Map(cases.map(r => [r.ID, r]));
  const runs: any[] = [];
  for (const d of existsSync(runsDir) ? readdirSync(runsDir).filter(d => statSync(join(runsDir, d)).isDirectory()).sort() : []) {
    const dir = join(runsDir, d), rc = join(dir, 'results.csv');
    if (!existsSync(rc)) continue;
    const state = existsSync(join(dir, 'run-state.md')) ? readFileSync(join(dir, 'run-state.md'), 'utf8') : '';
    const blocked = existsSync(join(dir, 'blocked-reasons.json')) ? JSON.parse(readFileSync(join(dir, 'blocked-reasons.json'), 'utf8')) : {};
    const latest = new Map<string, any>();
    for (const r of readRecords(readFileSync(rc, 'utf8'))) {
      const at = Date.parse(r['Recorded At']) || 0, id = r.ID;
      if (!id || (latest.get(id)?.t ?? -1) > at) continue;
      // Evidence lists files relative to the run folder, separated by spaces; anything else in it is kept as a note
      const ev = (r.Evidence ?? '').split(/\s+/).filter(Boolean);
      const shots = ev.filter(e => IMG.test(e) && existsSync(join(dir, e))).map(e => ({ src: link(join(dir, e)), name: e.split('/').pop() }));
      const other = ev.filter(e => !IMG.test(e) || !existsSync(join(dir, e)));
      const t = row.get(id);
      latest.set(id, { id, t: at, at: r['Recorded At'] ?? '', phase: r.Phase ?? '', seg: r.Segment ?? '', needs: r.Needs ?? '', section: r.Section || t?.Section || '',
        pre: t?.Precondition ?? '', prio: t?.Priority ?? '', action: r.Action || t?.Action || '', expected: r['Expected Result'] || t?.['Expected Result'] || '',
        result: r.Result || 'Not run', disp: r.Disposition ?? '', actual: r.Actual ?? '', why: blocked[id]?.note ?? '', group: blocked[id]?.group ?? '',
        shots, files: other });
    }
    if (!latest.size) continue;
    const list = [...latest.values()].sort((a, b) => a.seg.localeCompare(b.seg, 'en', { numeric: true }) || a.id.localeCompare(b.id, 'en', { numeric: true }));
    const times = list.map(c => c.t).filter(Boolean);
    runs.push({ id: d, phase: state.match(/^# Run state — (P\d+)/m)?.[1] ?? '', build: state.match(/\b[A-Z][A-Za-z]+(?: iOS)? (\d+\.\d+\.\d+ \(\d+\))/)?.[1] ?? '',
      report: existsSync(join(dir, 'report.md')), first: times.length ? new Date(Math.min(...times)).toISOString() : '', last: times.length ? new Date(Math.max(...times)).toISOString() : '',
      cases: list.map(({ t, ...c }) => c) });
  }
  return { feature, title, platform, built_at: new Date().toISOString(), runs: runs.reverse() };
}

const page = (data: unknown) => readFileSync(join(import.meta.dirname, 'results-page.tpl'), 'utf8')
  .replaceAll('__TITLE__', `${title} Results`).replace('__DATA__', () => JSON.stringify(data).replace(/</g, '\\u003c'));

if (serve) {
  const portArg = /^\d+$/.test(process.argv[si + 1] ?? '') ? Number(process.argv[si + 1]) : 4492;
  const server = createServer((req, res) => {
    try {
      const url = req.url ?? '/';
      if (url === '/' || url.startsWith('/?')) {
        const html = page(buildData(abs => `files/${encodeURI(relative(ROOT, abs).split('\\').join('/'))}`));
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(html); return;
      }
      // screenshots: images under this table's runs folder only
      const f = url.match(/^\/files\/([^?#]+)/);
      if (f) {
        const p = join(ROOT, decodeURIComponent(f[1]));
        if (IMG.test(p) && relative(runsDir, p).split(/[\\/]/)[0] !== '..' && existsSync(p)) {
          res.writeHead(200, { 'content-type': /png$/i.test(p) ? 'image/png' : 'image/jpeg', 'cache-control': 'max-age=300' }); res.end(readFileSync(p)); return; }
      }
      res.writeHead(404); res.end('Not found');
    } catch (e: any) { res.writeHead(500, { 'content-type': 'text/plain' }); res.end(String(e?.message ?? e)); }
  });
  let port = portArg; const host = lan ? '0.0.0.0' : '127.0.0.1';
  server.on('error', (e: any) => { if (e.code === 'EADDRINUSE' && port < portArg + 10) { port++; server.listen(port, host); } else throw e; });
  server.on('listening', () => {
    console.log(`Results (live): http://127.0.0.1:${port}/  — Ctrl+C to stop`);
    if (!lan) return;
    for (const ifs of Object.values(networkInterfaces())) for (const i of ifs ?? []) if (i.family === 'IPv4' && !i.internal) console.log(`  LAN: http://${i.address}:${port}/`);
    console.log('  Warning: --lan has no auth; anyone on this network can read the page.');
  });
  server.listen(port, host);
} else {
  const out = arg('out') ?? join(runsDir, 'results.html');
  const data = buildData(abs => encodeURI(relative(join(out, '..'), abs).split('\\').join('/')));
  writeFileSync(out, page(data));
  console.log(`${out}: ${data.runs.length} runs, ${data.runs.reduce((n, r) => n + r.cases.length, 0)} case records`);
}
