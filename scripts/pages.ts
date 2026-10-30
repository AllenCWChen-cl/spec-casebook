// One server for all four live pages of a feature and platform: Cases (the review page), Progress (the run plan),
// Results (every run's cases with screenshots and reasons) and Coverage, each under its own path with a tab bar on top, so one command (and one
// address, also over the LAN) opens them all and they link to each other (a row on Cases opens /coverage/#case=TC-012;
// a case on Coverage opens /cases/#TC-012).
// Usage: node scripts/pages.ts <product>/<feature> <ios|android> [--draft <id>] [--plan <RUN-PLAN.md>] [--plan-draft <id>] [--port 4386] [--lan]
//   --draft       the draft to review (and to show on the coverage page); without it, the approved table
//   --plan        the run plan; default the newest runs/RUN-PLAN-*.md
//   --plan-draft  the draft whose phases.json the plan uses; default the newest draft that has one
// No restart needed after changes: a change under scripts/ restarts the four pages (a new run plan or draft is picked
// up then too), and a change under library/<product>/<feature>/ tells open pages to reload (Cases only offers a Reload button,
// so unsaved review edits are never lost). Only a change to this file itself needs Ctrl+C and a new start.
// Each page runs as its own server (review.ts, plan-page.ts --serve, results-page.ts --serve, coverage-page.ts --serve) on a loopback port,
// and this one forwards to it, adding the tab bar. --lan binds this server to 0.0.0.0 (no auth: anyone on the network
// can read the pages); the children stay on 127.0.0.1. Review Save is only accepted from this computer.
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readdirSync, watch } from 'node:fs';
import { createServer, request } from 'node:http';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { arg, assertIds, draftsDir, readManifest, tableDir } from './lib/library.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const draft = arg('draft'), lan = process.argv.includes('--lan');
const table = tableDir(feature, platform);
const newest = (dir: string, test: (name: string) => boolean) => existsSync(dir) ? readdirSync(dir).filter(test).sort().at(-1) : undefined;
// the plan and its draft are looked up again whenever the pages restart, so a new RUN-PLAN or draft shows up
const planOf = () => ({ md: arg('plan') ?? (n => n && join(table, 'runs', n))(newest(join(table, 'runs'), n => /^RUN-PLAN-.*\.md$/.test(n))),
  draft: arg('plan-draft') ?? newest(draftsDir(feature, platform), n => existsSync(join(draftsDir(feature, platform), n, 'phases.json'))) });
let plan = planOf();
const script = (name: string) => join(import.meta.dirname, name);
const withDraft = draft ? ['--draft', draft] : [];

type Page = { id: string; path: string; label: string; zh: string; argv: string[] | null; why?: string; port?: number; proc?: ChildProcess; error?: string; restarting?: boolean };
const reviewOf = draft ? ` · draft ${draft}` : ` · v${readManifest(feature, platform)?.version ?? '?'}`;
const pages: Page[] = [
  { id: 'review', path: 'cases', label: `Cases${reviewOf}`, zh: `案例${reviewOf.replace('draft', '草稿')}`,
    argv: [script('review.ts'), feature, platform, ...withDraft, '--port', '4487'] },
  { id: 'plan', path: 'progress', label: 'Progress', zh: '進度', argv: null,
    why: `No run plan: needs a runs/RUN-PLAN-*.md and a draft with phases.json (or --plan and --plan-draft).` },
  { id: 'results', path: 'results', label: 'Results', zh: '結果', argv: [script('results-page.ts'), feature, platform, '--serve', '4492'] },
  { id: 'coverage', path: 'coverage', label: 'Coverage', zh: '覆蓋率', argv: [script('coverage-page.ts'), feature, platform, ...withDraft, '--serve', '4491'] },
];

const planArgv = () => plan.md && plan.draft ? [script('plan-page.ts'), feature, platform, plan.draft, plan.md, '--serve', '4490'] : null;

// start each child and read its address from the line it prints (it takes the next free port when one is busy)
function start(p: Page) {
  p.error = undefined; p.restarting = false;
  if (p.id === 'plan') p.argv = planArgv();
  if (!p.argv) { p.error = p.why; return Promise.resolve(); }
  return new Promise<void>(done => {
    const proc = spawn(process.execPath, p.argv!, { stdio: ['ignore', 'pipe', 'pipe'] });
    p.proc = proc;
    let err = '';
    proc.stdout!.on('data', b => { const m = String(b).match(/http:\/\/127\.0\.0\.1:(\d+)\//); if (m && !p.port) { p.port = +m[1]; done(); } });
    proc.stderr!.on('data', b => { err += b; process.stderr.write(`[${p.id}] ${b}`); });
    proc.on('exit', code => { if (p.restarting) return; if (!p.port) { p.error = `${p.label} did not start (exit ${code}): ${err.trim().split('\n').slice(-3).join(' ')}`; done(); } else { p.port = undefined; p.error = `${p.label} stopped (exit ${code}).`; } });
  });
}
await Promise.all(pages.map(start));
const stop = () => { for (const p of pages) p.proc?.kill(); };
// stop a page and start it again (its script, or the plan it shows, changed); the old one is gone before the new one
// binds, so it usually keeps its port
const restart = async (p: Page) => {
  const proc = p.proc;
  p.restarting = true; p.port = undefined; p.proc = undefined;
  if (proc && proc.exitCode === null) await new Promise(r => { proc.once('exit', r); proc.kill(); });
  await start(p);
};

// Live updates (user, 2026-10-29). `stamp` changes whenever what a page shows may have changed; the tab bar polls
// /__stamp and reloads the page (Cases: shows a Reload button instead).
let stamp = Date.now();
const debounce = (ms: number, f: (names: string[]) => void) => { let t: NodeJS.Timeout | undefined, names: string[] = [];
  return (_: string, name: string | null) => { if (name) names.push(name); clearTimeout(t); t = setTimeout(() => { const n = names; names = []; f(n); }, ms); }; };
watch(import.meta.dirname, { recursive: true }, debounce(400, async names => {
  if (names.every(n => n === 'pages.ts')) { console.log('scripts/pages.ts changed: Ctrl+C and start it again to use the new version.'); return; }
  console.log(`scripts changed (${[...new Set(names)].slice(0, 3).join(', ')}): restarting the pages`);
  plan = planOf();
  await Promise.all(pages.map(restart));
  stamp = Date.now();
}));
const featureDir = join(import.meta.dirname, '..', 'library', feature);
if (existsSync(featureDir)) watch(featureDir, { recursive: true }, debounce(1500, async () => {
  const next = planOf(), plg = pages.find(p => p.id === 'plan')!;
  if (next.md !== plan.md || next.draft !== plan.draft) { plan = next; console.log(`run plan now ${plan.md ?? 'none'} (draft ${plan.draft ?? 'none'})`); await restart(plg); }
  stamp = Date.now();
}));
process.on('exit', stop);
for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) process.once(s, () => process.exit(0));

// The tab bar goes in right after <body>; window.CASEBOOK tells each page where the others are, so they can link, and
// which language to show. The bar is the same on every page and holds the one language switch (user, 2026-10-28):
// the choice is kept per browser (localStorage casebook-lang) and sent to the page as a `casebook-lang` event, so the
// pages drop their own switches when served here (their static .html files keep them).
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const tx = (en: string, zh: string) => `<span data-en="${esc(en)}" data-zh="${esc(zh)}">${esc(en)}</span>`;
const tabBar = (current: string) => {
  const links = Object.fromEntries(pages.filter(p => p.port).map(p => [p.id, `/${p.path}/`]));
  return `<style>
.cb-tabs{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;padding:6px 12px;background:#1d2733;color:#c9d3dd;font:500 13px/1.4 system-ui,-apple-system,"Segoe UI","PingFang TC",sans-serif;border-bottom:1px solid #2f3b4a;box-sizing:border-box}
.cb-tabs b{font-weight:650;color:#fff;margin-right:8px}
.cb-tabs a,.cb-tabs span.off{padding:4px 12px;border-radius:6px;color:#c9d3dd;text-decoration:none}
.cb-tabs a:hover{background:#2c3a4a;color:#fff}
.cb-tabs a[aria-current="page"]{background:#3d6fd9;color:#fff}
.cb-tabs span.off{opacity:.45;cursor:not-allowed}
.cb-tabs .cb-note{margin-left:auto;font-size:12px;opacity:.7}
.cb-tabs .cb-lang{display:inline-flex;border:1px solid #3a4a5c;border-radius:6px;overflow:hidden;margin-left:8px}
.cb-tabs .cb-lang button{font-family:inherit;font-size:12px;font-weight:600;line-height:1;border:0;background:transparent;color:#c9d3dd;padding:5px 10px;cursor:pointer}
.cb-tabs .cb-lang button[aria-pressed="true"]{background:#3d6fd9;color:#fff}
.cb-tabs .cb-upd{font:inherit;font-size:12px;font-weight:600;border:0;border-radius:6px;background:#e0a526;color:#1d2733;padding:4px 10px;cursor:pointer;margin-left:8px}
.cb-tabs .cb-upd[hidden]{display:none}
@media print{.cb-tabs{display:none}}
</style><nav class="cb-tabs" aria-label="Casebook pages"><b>${esc(feature)} · ${platform === 'ios' ? 'iOS' : 'Android'}</b>${pages.map(p => p.port
    ? `<a href="/${p.path}/"${p.id === current ? ' aria-current="page"' : ''}>${tx(p.label, p.zh)}</a>`
    : `<span class="off" title="${esc(p.error ?? '')}">${tx(p.label, p.zh)}</span>`).join('')}<button type="button" class="cb-upd" hidden>${current === 'review' ? tx('Files changed · Reload (unsaved edits are lost)', '檔案已更新 · 重新載入（未儲存的修改會遺失）') : tx('Updated · Reload', '已更新 · 重新載入')}</button><span class="cb-note">${lan ? tx('Shared on the network', '已在區域網路分享') : tx('This computer only', '僅限本機')}</span><span class="cb-lang" role="group" aria-label="Language"><button type="button" data-l="en">English</button><button type="button" data-l="zh">中文</button></span></nav>
<script>(()=>{let l='en';try{if(localStorage.getItem('casebook-lang')==='zh')l='zh'}catch(e){}
window.CASEBOOK=Object.assign(${JSON.stringify({ pages: links, current })},{lang:l});
const n=document.currentScript.previousElementSibling,b=getComputedStyle(document.body),t=parseFloat(b.paddingTop)||0;
// the pages pad their bodies differently: pull the bar over that padding so it spans the window the same way on each
n.style.margin=\`\${-t}px -\${b.paddingRight} \${t?18:0}px -\${b.paddingLeft}\`;
const show=v=>{n.querySelectorAll('[data-zh]').forEach(e=>e.textContent=e.dataset[v]);n.querySelectorAll('.cb-lang button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.l===v)))};
show(l);
// live updates: a newer /__stamp reloads Results and Progress once the user has been idle 15 s, and any page while
// its tab is hidden; Cases (unsaved edits) and Coverage (the open board) show the Reload button instead
const s0=${stamp},u=n.querySelector('.cb-upd');let idle=Date.now();u.onclick=()=>location.reload();
['pointerdown','keydown','wheel','input'].forEach(e=>addEventListener(e,()=>idle=Date.now(),{passive:true,capture:true}));
setInterval(async()=>{let v=0;try{v=+(await(await fetch('/__stamp',{cache:'no-store'})).text())}catch(e){return}if(!(v>s0))return;
if(document.hidden||(${JSON.stringify(current)}==='plan'||${JSON.stringify(current)}==='results')&&Date.now()-idle>15000)return location.reload();u.hidden=false},3000);
n.querySelectorAll('.cb-lang button').forEach(x=>x.onclick=()=>{const v=x.dataset.l;if(v===CASEBOOK.lang)return;CASEBOOK.lang=v;try{localStorage.setItem('casebook-lang',v)}catch(e){}show(v);dispatchEvent(new CustomEvent('casebook-lang',{detail:v}))});})();</script>`;
};
const notAvailable = (p: Page) => `<!doctype html><meta charset="utf-8"><title>${esc(p.label)}</title><body style="margin:0;font:15px system-ui;background:#f4f5f7">${tabBar(p.id)}<p style="padding:24px;max-width:80ch">${esc(p.error ?? 'Not available.')}</p></body>`;
const isLocal = (a = '') => a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';

const server = createServer((req, res) => {
  const url = req.url ?? '/';
  // the pages are Cases, Progress, Results and Coverage (user, 2026-10-28); /review/ and /plan/ links still work
  const old = url.match(/^\/(review|plan)(\/.*)?$/);
  if (old) { res.writeHead(301, { location: `/${old[1] === 'review' ? 'cases' : 'progress'}${old[2] ?? '/'}` }); res.end(); return; }
  if (url === '/__stamp') { res.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-store' }); res.end(String(stamp)); return; }
  const m = url.match(/^\/(cases|progress|results|coverage)(\/.*)?$/);
  if (!m) { res.writeHead(302, { location: '/cases/' }); res.end(); return; }
  const p = pages.find(x => x.path === m[1])!;
  if (!m[2]) { res.writeHead(301, { location: `/${p.path}/` }); res.end(); return; }
  if (!p.port) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(notAvailable(p)); return; }
  // the child sees every request as local, so the Save rule is enforced here
  if (req.method !== 'GET' && !isLocal(req.socket.remoteAddress)) {
    res.writeHead(403, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: 'Save works only on the computer running scripts/pages.ts.' })); return;
  }
  const fwd = request({ host: '127.0.0.1', port: p.port, path: m[2], method: req.method, headers: { ...req.headers, host: `127.0.0.1:${p.port}`, 'x-casebook-stamp': String(stamp) } }, up => {
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
  for (const p of pages) console.log(`  ${p.port ? `/${p.path}/`.padEnd(12) : '(off)'.padEnd(12)} ${p.label}${p.error ? ` — ${p.error}` : ''}`);
  if (!lan) return;
  // one address per network this computer is on (Wi-Fi and Ethernet are often different subnets): the other computer
  // opens the one on its own network; a self-assigned 169.254 address is no network
  for (const [name, ifs] of Object.entries(networkInterfaces())) for (const i of ifs ?? []) if (i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.254.'))
    console.log(`  LAN: http://${i.address}:${port}/`.padEnd(36) + ` (${name}, for computers on ${i.cidr ?? i.address})`);
  console.log('  Warning: --lan has no auth; anyone on this network can read the pages. Review Save is accepted from this computer only.');
});
server.listen(port, host);
