// Cut one log pull into per-case excerpts, using each case's time window from results.csv.
// Usage: node scripts/log-slice.ts <run dir> <pull dir> [ID ...]
//   <pull dir>: a folder written by `device.ts logs` / `app-setup.ts pull-logs` (holds the app's *.txt log files).
// Which log files and tags count comes from library/<product>/<feature>/feature.json (lib/feature-config.ts).
// A case's window runs from the previous recorded case's 「Recorded At」 to its own (the first case starts 30 min
// earlier). Log times are the phone's local time; this assumes the Mac and the phone share a time zone.
// Writes <pull dir>/by-case/<ID>.txt (failures, toasts, credit authorisations and refunds, stage timings) and prints
// one line per case: failures · toasts · credits authorised. Logs stay local (git-ignored); excerpts that go into a
// ticket must be checked for tokens first.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readRecords } from './lib/csv.ts';
import { configForRunDir } from './lib/feature-config.ts';

const [runDir, pullDir, ...only] = process.argv.slice(2);
if (!runDir || !pullDir) { console.error('Usage: node scripts/log-slice.ts <run dir> <pull dir> [ID ...]'); process.exit(2); }
const walk = (d: string): string[] => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const { logs } = configForRunDir(runDir);
const files = walk(pullDir).filter(f => logs.files.test(f));
if (!files.length) throw new Error(`No log files matching ${logs.files} under ${pullDir}`);

type L = { t: number; file: string; text: string };
const lines: L[] = [];
const re = /^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)[:.](\d{3})/;
for (const f of files) {
  const kind = f.match(logs.files)?.[1] ?? f;
  for (const text of readFileSync(f, 'utf8').split('\n')) {
    const m = text.match(re); if (!m) continue;
    const [, y, mo, d, h, mi, s, ms] = m.map(Number);
    lines.push({ t: new Date(y, mo - 1, d, h, mi, s, ms).getTime(), file: kind, text });
  }
}
lines.sort((a, b) => a.t - b.t);

const rows = readRecords(readFileSync(join(runDir, 'results.csv'), 'utf8'))
  .filter(r => Date.parse(r['Recorded At'])).sort((a, b) => Date.parse(a['Recorded At']) - Date.parse(b['Recorded At']));
const out = join(pullDir, 'by-case'); mkdirSync(out, { recursive: true });
const pick = (ls: L[], rx: RegExp) => ls.filter(l => rx.test(l.text));
let prev = rows.length ? Date.parse(rows[0]['Recorded At']) - 30 * 60_000 : 0;
console.log('case     result        fail toast credit  window');
for (const r of rows) {
  const end = Date.parse(r['Recorded At']); const start = prev; prev = end;
  if (only.length && !only.includes(r.ID)) continue;
  const win = lines.filter(l => l.t > start && l.t <= end);
  const fails = pick(win, logs.failure);
  const toasts = pick(win, logs.toast);
  const credit = pick(win, logs.credit);
  const perf = logs.timing ? pick(win, logs.timing) : [];
  const sum = credit.reduce((s, l) => s + Number(l.text.match(/authorized, credit=(\d+)/)?.[1] ?? 0), 0);
  const fmt = (ls: L[]) => ls.map(l => `  [${l.file}] ${l.text.slice(0, 400)}`).join('\n') || '  (none)';
  writeFileSync(join(out, `${r.ID}.txt`), `${r.ID} ${r.Result} — window ${new Date(start).toISOString()} → ${new Date(end).toISOString()}\n` +
    `${r.Action}\n\n## Failures (${fails.length})\n${fmt(fails)}\n\n## Toasts (${toasts.length})\n${fmt(toasts)}\n\n` +
    `## Credits (${credit.length}; authorised total ${sum})\n${fmt(credit)}\n\n## Stage timings (${perf.length} lines; last 40)\n${fmt(perf.slice(-40))}\n`);
  console.log(`${r.ID.padEnd(8)} ${r.Result.padEnd(12)} ${String(fails.length).padStart(5)} ${String(toasts.length).padStart(5)} ${String(sum).padStart(6)}  ${new Date(start).toISOString().slice(11, 19)}–${new Date(end).toISOString().slice(11, 19)}`);
}
console.log(`\nper-case excerpts → ${out}`);
if (existsSync(join(runDir, 'results.csv')) && !rows.length) console.log('No recorded cases yet.');
