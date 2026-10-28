// One server for all three live pages of a feature and platform: review, run plan and coverage, each under its own
// path with a tab bar on top, so one command (and one address, also over the LAN) opens them all and they link to each
// other (a review row opens /coverage/#case=TC-012; a case on the coverage page opens /review/#TC-012).
// Usage: node scripts/pages.ts <feature> <ios|android> [--draft <id>] [--plan <RUN-PLAN.md>] [--plan-draft <id>] [--port 4386] [--lan]
//   --draft       the draft to review (and to show on the coverage page); without it, the approved table
//   --plan        the run plan; default the newest runs/RUN-PLAN-*.md
//   --plan-draft  the draft whose phases.json the plan uses; default the newest draft that has one
// Each page runs as its own server (review.ts, plan-page.ts --serve, coverage-page.ts --serve) on a loopback port,
// and this one forwards to it, adding the tab bar. --lan binds this server to 0.0.0.0 (no auth: anyone on the network
// can read the pages); the children stay on 127.0.0.1. Review Save is only accepted from this computer.
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { arg, assertIds, draftsDir, readManifest, tableDir } from './lib/library.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const draft = arg('draft'), lan = process.argv.includes('--lan');
const table = tableDir(feature, platform);
const newest = (dir: string, test: (name: string) => boolean) => existsSync(dir) ? readdirSync(dir).filter(test).sort().at(-1) : undefined;
const planMd = arg('plan') ?? (n => n && join(table, 'runs', n))(newest(join(table, 'runs'), n => /^RUN-PLAN-.*\.md$/.test(n)));
const planDraft = arg('plan-draft') ?? newest(draftsDir(feature, platform), n => existsSync(join(draftsDir(feature, platform), n, 'phases.json')));
const script = (name: string) => join(import.meta.dirname, name);
const withDraft = draft ? ['--draft', draft] : [];

type Page = { id: string; label: string; argv: string[] | null; why?: string; port?: number; proc?: ChildProcess; error?: string };
const pages: Page[] = [
  { id: 'review', label: draft ? `Review · draft ${draft}` : `Review · v${readManifest(feature, platform)?.version ?? '?'}`,
    argv: [script('review.ts'), feature, platform, ...withDraft, '--port', '4487'] },
  { id: 'plan', label: 'Run plan', argv: planMd && planDraft ? [script('plan-page.ts'), feature, platform, planDraft, planMd, '--serve', '4490'] : null,
    why: `No run plan: needs a runs/RUN-PLAN-*.md and a draft with phases.json (or --plan and --plan-draft).` },
  { id: 'coverage', label: 'Coverage', argv: [script('coverage-page.ts'), feature, platform, ...withDraft, '--serve', '4491'] },
];

// start each child and read its address from the line it prints (it takes the next free port when one is busy)
function start(p: Page) {
  if (!p.argv) { p.error = p.why; return Promise.resolve(); }
  return new Promise<void>(done => {
    const proc = spawn(process.execPath, p.argv!, { stdio: ['ignore', 'pipe', 'pipe'] });
    p.proc = proc;
    let err = '';
    proc.stdout!.on('data', b => { const m = String(b).match(/http:\/\/127\.0\.0\.1:(\d+)\//); if (m && !p.port) { p.port = +m[1]; done(); } });
    proc.stderr!.on('data', b => { err += b; process.stderr.write(`[${p.id}] ${b}`); });
    proc.on('exit', code => { if (!p.port) { p.error = `${p.label} did not start (exit ${code}): ${err.trim().split('\n').slice(-3).join(' ')}`; done(); } else { p.port = undefined; p.error = `${p.label} stopped (exit ${code}).`; } });
  });
}
await Promise.all(pages.map(start));
const stop = () => { for (const p of pages) p.proc?.kill(); };
process.on('exit', stop);
for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) process.once(s, () => process.exit(0));

// The tab bar goes in right after <body>; window.CASEBOOK tells each page where the others are, so they can link.
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const tabBar = (current: string) => {
  const links = Object.fromEntries(pages.filter(p => p.port).map(p => [p.id, `/${p.id}/`]));
  return `<style>
.cb-tabs{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;padding:6px 12px;background:#1d2733;color:#c9d3dd;font:500 13px/1.4 system-ui,-apple-system,"Segoe UI","PingFang TC",sans-serif;border-bottom:1px solid #2f3b4a}
.cb-tabs b{font-weight:650;color:#fff;margin-right:8px}
.cb-tabs a,.cb-tabs span.off{padding:4px 12px;border-radius:6px;color:#c9d3dd;text-decoration:none}
.cb-tabs a:hover{background:#2c3a4a;color:#fff}
.cb-tabs a[aria-current="page"]{background:#3d6fd9;color:#fff}
.cb-tabs span.off{opacity:.45;cursor:not-allowed}
.cb-tabs .cb-note{margin-left:auto;font-size:12px;opacity:.7}
@media print{.cb-tabs{display:none}}
${current === 'coverage' ? '/* the coverage page pads its body: the bar spans the full width above that padding */\nbody{padding-top:0!important}.cb-tabs{margin:0 calc(-1 * max(16px, 2vw)) 18px}' : ''}
</style><nav class="cb-tabs" aria-label="Casebook pages"><b>${esc(feature)} · ${platform === 'ios' ? 'iOS' : 'Android'}</b>${pages.map(p => p.port
    ? `<a href="/${p.id}/"${p.id === current ? ' aria-current="page"' : ''}>${esc(p.label)}</a>`
    : `<span class="off" title="${esc(p.error ?? '')}">${esc(p.label)}</span>`).join('')}<span class="cb-note">${lan ? 'Shared on the network' : 'This computer only'}</span></nav>
<script>window.CASEBOOK=${JSON.stringify({ pages: links, current })};</script>`;
};
const notAvailable = (p: Page) => `<!doctype html><meta charset="utf-8"><title>${esc(p.label)}</title><body style="margin:0;font:15px system-ui;background:#f4f5f7">${tabBar(p.id)}<p style="padding:24px;max-width:80ch">${esc(p.error ?? 'Not available.')}</p></body>`;
const isLocal = (a = '') => a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';

const server = createServer((req, res) => {
  const url = req.url ?? '/';
  const m = url.match(/^\/(review|plan|coverage)(\/.*)?$/);
  if (!m) { res.writeHead(302, { location: '/review/' }); res.end(); return; }
  const p = pages.find(x => x.id === m[1])!;
  if (!m[2]) { res.writeHead(301, { location: `/${p.id}/` }); res.end(); return; }
  if (!p.port) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(notAvailable(p)); return; }
  // the child sees every request as local, so the Save rule is enforced here
  if (req.method !== 'GET' && !isLocal(req.socket.remoteAddress)) {
    res.writeHead(403, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: 'Save works only on the computer running scripts/pages.ts.' })); return;
  }
  const fwd = request({ host: '127.0.0.1', port: p.port, path: m[2], method: req.method, headers: { ...req.headers, host: `127.0.0.1:${p.port}` } }, up => {
    const html = /text\/html/.test(String(up.headers['content-type']));
    if (!html) { res.writeHead(up.statusCode ?? 502, up.headers); up.pipe(res); return; }
    const chunks: Buffer[] = [];
    up.on('data', c => chunks.push(c));
    up.on('end', () => {
      let body = Buffer.concat(chunks).toString('utf8');
      // first thing in the body (the plan page is a fragment with no <body> tag: after its <style>)
      body = /<body[^>]*>/i.test(body) ? body.replace(/<body[^>]*>/i, b => b + tabBar(p.id)) : body.replace('</style>', b => b + tabBar(p.id));
      // a page opened from another computer cannot save: tell it so before it tries
      if (p.id === 'review' && !isLocal(req.socket.remoteAddress)) body = body.replace('"save":true', '"save":false');
      const headers = { ...up.headers }; delete headers['content-length'];
      res.writeHead(up.statusCode ?? 200, headers); res.end(body);
    });
  });
  fwd.on('error', e => { res.writeHead(502, { 'content-type': 'text/plain' }); res.end(`${p.label}: ${e.message}`); });
  req.pipe(fwd);
});
let port = Number(arg('port') ?? 4386); const host = lan ? '0.0.0.0' : '127.0.0.1';
server.on('error', (e: any) => { if (e.code === 'EADDRINUSE' && port < 4396) { port++; server.listen(port, host); } else throw e; });
server.on('listening', () => {
  console.log(`Casebook pages for ${feature} / ${platform}: http://127.0.0.1:${port}/  — Ctrl+C to stop`);
  for (const p of pages) console.log(`  ${p.port ? `/${p.id}/`.padEnd(12) : '(off)'.padEnd(12)} ${p.label}${p.error ? ` — ${p.error}` : ''}`);
  if (!lan) return;
  for (const ifs of Object.values(networkInterfaces())) for (const i of ifs ?? []) if (i.family === 'IPv4' && !i.internal) console.log(`  LAN: http://${i.address}:${port}/`);
  console.log('  Warning: --lan has no auth; anyone on this network can read the pages. Review Save is accepted from this computer only.');
});
server.listen(port, host);
