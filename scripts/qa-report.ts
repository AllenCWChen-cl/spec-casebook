// QA Report (QR) for a Testing Request: turns a verification run's verdicts into the exact text of an IF3 Standard
// Report, an evidence ZIP and a review page. Nothing here touches ECL; filing is the qa-report skill's browser step.
//
//   node scripts/qa-report.ts check  <qr-draft.json>   validate the draft (exit 1 on errors)
//   node scripts/qa-report.ts text   <qr-draft.json>   print every form field exactly as it will be filled
//   node scripts/qa-report.ts pack   <qr-draft.json>   build <TR>_<version>_evidence.zip next to the draft
//   node scripts/qa-report.ts render <qr-draft.json>   write qr-review.html next to the draft
//
// Image and log paths in the draft are relative to the draft's folder.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, basename, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

// Only OK and Fail go on a QR; a bug not fully verified is Hold: left off the report and left alone (user, 2026-11-03).
type Result = 'OK' | 'Fail' | 'Hold';
type Row = {
  bug: string; title: string; creator?: string; severity?: string; result: Result;
  summary: string;             // one line for the Details list
  observed?: string;           // Fail: what the build does (one or two sentences)
  expected?: string;           // Fail: what the eBug expects
  note?: string;               // OK: optional qualifier (e.g. the scenario can no longer be triggered); Hold: why
  reason?: string;             // full override of the generated Reason (avoid; it skips the format)
  images: string[]; logs?: string[];
};
type Draft = {
  tr: string; product: string; tester: string; template: string; testingDate: string;
  version: string; build: string; buildDay: string; os: string; osLanguage?: string;
  shortDescription?: string; testResult?: string;
  env: { device: string; server: string; account: string; testedBy: string; install: string; scope: string };
  observations?: string[];
  rows: Row[];
  // url: the ECL download link the QR form's upload section gives the ZIP (filled after the upload, before Create)
  evidence?: { file: string; sha256: string; files: number; url?: string };
};

const RESULTS: Result[] = ['OK', 'Fail', 'Hold'];
const FOLDER: Record<Result, string> = { OK: 'OK', Fail: 'Fail', Hold: '' };

const load = (p: string): Draft => JSON.parse(readFileSync(p, 'utf8'));
const full = (d: Draft) => `${d.version}.${d.build}`;
const on = (d: Draft) => `with build (v${full(d)}) on ${d.env.device}`;
const filed = (d: Draft) => d.rows.filter(r => r.result !== 'Hold');
const count = (d: Draft, r: Result) => d.rows.filter(x => x.result === r).length;

export function testResult(d: Draft): string {
  if (d.testResult) return d.testResult;
  const parts = [`OK=${count(d, 'OK')}`, `Fail=${count(d, 'Fail')}`];
  return `${d.product.includes('iOS') ? 'PDR-i' : 'PDR-A'} - Bug verification [${parts.join(', ')}]`;
}

export function shortDescription(d: Draft): string {
  return d.shortDescription ?? `${full(d)} - Bug verify report (${d.tester})`;
}

export function reason(d: Draft, r: Row): string {
  if (r.reason) return r.reason;
  const ev = `Evidence: ${d.evidence?.url ?? '{{ZIP_URL}}'}\nFolder: ${FOLDER[r.result]}/${r.bug}/ (unzip and open index.html)`;
  if (r.result === 'OK') return [`Verified OK ${on(d)}`, ...(r.note ? [`Note: ${r.note}`] : [])].join('\n');
  return `Verify Fail ${on(d)}\n\nResult:\n${r.observed}\n\nExpected Result:\n${r.expected}\n\n${ev}`;
}

export function details(d: Draft): string {
  const L = 'abcdefghijklmnopqrstuvwxyz';
  const blocks: string[] = [];
  const add = (s: string) => blocks.push(`${L[blocks.length]}. ${s}`);
  add(`Device: ${d.env.device}`);
  add(`Build: ${full(d)} (${d.tr}), ${d.env.install}`);
  add(`Server: ${d.env.server}`);
  add(`Account: ${d.env.account}`);
  add(`Tested by: ${d.env.testedBy}`);
  add(`Scope: ${d.env.scope}`);
  for (const [res, label] of [['OK', 'OK'], ['Fail', 'FAIL']] as [Result, string][]) {
    const rows = d.rows.filter(r => r.result === res);
    const k = L[blocks.length];
    add(`${label} (${rows.length})` + rows.map((r, i) => `\n${k}${i + 1}. ${r.bug} - ${r.summary}`).join(''));
  }
  if (d.observations?.length) {
    const k = L[blocks.length];
    add(`Other observations, not filed (${d.observations.length})` + d.observations.map((o, i) => `\n${k}${i + 1}. ${o}`).join(''));
  }
  add(`Evidence: ${d.evidence?.url ?? '{{ZIP_URL}}'}\nOne folder per eBug under OK/ and Fail/; unzip and open index.html.`);
  return blocks.join('\n\n');
}

export function check(d: Draft, base: string): string[] {
  const e: string[] = [];
  for (const k of ['tr', 'product', 'tester', 'template', 'testingDate', 'version', 'build', 'buildDay', 'os'] as const)
    if (!d[k]) e.push(`missing ${k}`);
  if (!/^TR\d{6}-\d{4}$/.test(d.tr ?? '')) e.push(`TR code looks wrong: ${d.tr}`);
  const seen = new Set<string>();
  for (const r of d.rows) {
    const w = (m: string) => e.push(`${r.bug}: ${m}`);
    if (seen.has(r.bug)) w('listed twice'); seen.add(r.bug);
    if (!RESULTS.includes(r.result)) w(`result must be one of ${RESULTS.join(', ')}`);
    if (!r.summary) w('no summary line');
    if (r.result === 'Fail' && !(r.reason || (r.observed && r.expected))) w('Fail needs observed and expected');
    if (r.result === 'Hold' && !r.note) w('Hold needs a note saying what is left to verify');
    if (r.result !== 'Hold' && !r.images?.length) w('no evidence image');
    for (const f of [...(r.images ?? []), ...(r.logs ?? [])]) if (!existsSync(join(base, f))) w(`file not found: ${f}`);
    const text = reason(d, r);
    // ECL turns "name.zip" into a broken link and must never see local paths.
    if (/\.zip\b/i.test(text.replace(/https:\/\/\S+/g, ''))) w('Reason names a .zip file; ECL links it as a domain (use the download link)');
    if (/\/Users\/|[A-Z]:\\|screenshots\//.test(text)) w('Reason holds a local path');
    for (const line of [r.observed, r.expected]) if (line && line.length > 240) w('observed / expected over 240 characters; shorten');
  }
  if (!filed(d).length) e.push('no rows to report');
  if (d.evidence?.url && !/^https:\/\/ecl\.cyberlink\.com\/IF3\/Data\/Download\?o=/.test(d.evidence.url)) e.push(`evidence url is not an ECL download link: ${d.evidence.url}`);
  return e;
}

function printText(d: Draft) {
  const out = [
    ['Template', d.template], ['Short Description', shortDescription(d)], ['Test Result', testResult(d)],
    ['Testing Date', d.testingDate], ['Product Version', d.version], ['Build Day', d.buildDay], ['Build No.', d.build],
    ['Operation System', d.os], ...(d.osLanguage ? [['OS Language', d.osLanguage]] : []), ['Test Result Details', details(d)],
  ];
  if (!d.evidence?.url) console.log('!!! {{ZIP_URL}} unresolved: upload the ZIP in the form first and put its link in evidence.url\n');
  for (const [k, v] of out) console.log(`=== ${k}\n${v}\n`);
  for (const r of filed(d)) console.log(`=== ${r.bug}  [${r.result}]\n${reason(d, r)}\n`);
  const held = d.rows.filter(r => r.result === 'Hold');
  if (held.length) console.log(`=== Held, left unchanged on the form: ${held.map(r => r.bug).join(', ')}`);
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');

function pack(d: Draft, draftPath: string) {
  const base = dirname(draftPath);
  const name = `${d.tr}_${full(d)}_evidence`;
  const stage = join(base, '.qr-pack', name);
  rmSync(join(base, '.qr-pack'), { recursive: true, force: true });
  const manifest: { bug: string; result: Result; file: string; sha256: string }[] = [];
  for (const r of filed(d)) {
    const dir = join(stage, FOLDER[r.result], r.bug);
    mkdirSync(dir, { recursive: true });
    for (const f of [...r.images, ...(r.logs ?? [])]) {
      copyFileSync(join(base, f), join(dir, basename(f)));
      manifest.push({ bug: r.bug, result: r.result, file: `${FOLDER[r.result]}/${r.bug}/${basename(f)}`, sha256: sha(join(base, f)) });
    }
  }
  const cards = filed(d).map(r => `<section id="${r.bug}"><h2>${r.bug} <span class="${r.result}">${r.result}</span></h2><p>${esc(r.title)}</p>
<pre>${esc(reason(d, r))}</pre>${manifest.filter(m => m.bug === r.bug).map(m => /\.(png|jpe?g)$/i.test(m.file)
    ? `<figure><img src="${m.file}" alt="${esc(basename(m.file))}" loading="lazy"><figcaption>${esc(basename(m.file))}</figcaption></figure>`
    : `<p><a href="${m.file}">${esc(basename(m.file))}</a></p>`).join('')}</section>`).join('\n');
  writeFileSync(join(stage, 'index.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${d.tr} evidence</title><style>body{font:15px system-ui;margin:16px;max-width:1100px}nav a{margin-right:10px}section{border-top:1px solid #ccc;padding:8px 0}
img{max-height:520px;max-width:100%;border:1px solid #ddd}figure{display:inline-block;margin:6px}pre{white-space:pre-wrap;background:#f4f4f4;padding:8px}
.OK{color:#17803d}.Fail{color:#c62828}</style>
<h1>${d.tr} · ${full(d)} · ${esc(d.env.device)}</h1><nav>${filed(d).map(r => `<a href="#${r.bug}">${r.bug}</a>`).join('')}</nav>\n${cards}`);
  writeFileSync(join(stage, 'manifest.json'), JSON.stringify({ tr: d.tr, build: full(d), files: manifest }, null, 2));
  const zip = join(base, `${name}.zip`);
  rmSync(zip, { force: true });
  execFileSync('zip', ['-qrX', zip, '.'], { cwd: stage });
  rmSync(join(base, '.qr-pack'), { recursive: true, force: true });
  d.evidence = { file: basename(zip), sha256: sha(zip), files: manifest.length };
  writeFileSync(draftPath, JSON.stringify(d, null, 2) + '\n');
  console.log(`${zip}\n${manifest.length} files · sha256 ${d.evidence.sha256}`);
}

function render(d: Draft, draftPath: string) {
  const base = dirname(draftPath);
  const data = {
    tr: d.tr, build: full(d), tester: d.tester, template: d.template, shortDescription: shortDescription(d),
    testResult: testResult(d), details: details(d), evidence: d.evidence ?? null, errors: check(d, base),
    rows: d.rows.map(r => ({ ...r, reason: r.result === 'Hold' ? '' : reason(d, r) })),
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const html = readFileSync(join(import.meta.dirname, 'qa-report-page.tpl'), 'utf8')
    .replace('/*__DATA__*/null', json).replaceAll('__TITLE__', esc(`${d.tr} QA Report`));
  const out = join(base, 'qr-review.html');
  writeFileSync(out, html);
  console.log(out);
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  const [cmd, p] = process.argv.slice(2);
  if (!cmd || !p) { console.error('usage: qa-report.ts check|text|pack|render <qr-draft.json>'); process.exit(2); }
  const path = resolve(p), d = load(path);
  if (cmd === 'check') {
    const e = check(d, dirname(path));
    console.log(e.length ? e.map(x => `✗ ${x}`).join('\n') : `✓ ${filed(d).length} rows: ${testResult(d)}`);
    process.exit(e.length ? 1 : 0);
  } else if (cmd === 'text') printText(d);
  else if (cmd === 'pack') pack(d, path);
  else if (cmd === 'render') render(d, path);
  else { console.error(`unknown command ${cmd}`); process.exit(2); }
}
