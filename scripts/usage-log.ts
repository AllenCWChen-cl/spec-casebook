// Append one plan-usage snapshot (the app's usage card) to <runs dir>/usage.jsonl for the run-plan page.
// Usage: node scripts/usage-log.ts <runs dir> <fiveHourPct> <fiveHourResetsAt ISO> <weeklyPct> <weeklyResetsAt ISO> [note]
//        [--at <ISO>]   time of the reading (default now; use it to backfill a known reading)
//        [--seat N]     the account's seat size in Pro units (Team seat 6.25, Pro 1); stored as proMultiplier.
//                       Default: the value of the latest earlier snapshot (1 if there is none). Never guess it.
// Use "-" for a value the card did not show (e.g. a usage-limit stop with no reset time). The orchestrator calls this
// at each segment start and end; when the run switches account, log a row with all four values "-" and the new --seat
// at the switch time (an account marker). Anthropic reports plan limits only as percentUsed of the 5-hour and weekly
// windows, so plan-page.ts derives consumption from these snapshots: the sum of positive increments, where a changed
// resetsAt, a drop or a seat change starts a new window from 0, and a reading with no resetsAt after a 100% stop counts
// as a new window. Pro-% = plan-% × that snapshot's proMultiplier.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const ai = args.indexOf('--at'); const at = ai >= 0 ? args.splice(ai, 2)[1] : new Date().toISOString();
const sti = args.indexOf('--seat'); const seatArg = sti >= 0 ? args.splice(sti, 2)[1] : undefined;
const [runsDir, fh, fhr, wk, wkr, ...note] = args;
const usage = 'Usage: node scripts/usage-log.ts <runs dir> <fiveHourPct> <fiveHourResetsAt ISO> <weeklyPct> <weeklyResetsAt ISO> [note] [--at ISO] [--seat N]';
if (!runsDir || fh === undefined || fhr === undefined || wk === undefined || wkr === undefined) { console.error(usage); process.exit(2); }
if (!existsSync(runsDir)) { console.error(`No runs dir ${runsDir}`); process.exit(2); }
const pct = (v: string) => { if (v === '-' || v === '') return null; const n = Number(v.replace('%', '')); if (!Number.isFinite(n) || n < 0) throw new Error(`Bad percent ${v}`); return n; };
const iso = (v: string) => { if (v === '-' || v === '') return null; const t = Date.parse(v); if (!t) throw new Error(`Bad time ${v}`); return new Date(t).toISOString(); };
const when = iso(at)!;
const file = join(runsDir, 'usage.jsonl');
let seat = seatArg !== undefined ? Number(seatArg) : NaN;
if (seatArg !== undefined && !(seat > 0)) { console.error('--seat needs a number > 0'); process.exit(2); }
if (seatArg === undefined) {   // the latest earlier snapshot's value
  const prev = existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } })
    .filter(r => r.proMultiplier > 0 && Date.parse(r.at) <= Date.parse(when)).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).at(-1) : undefined;
  seat = prev?.proMultiplier ?? 1;
  if (!prev) console.warn('No earlier snapshot with a seat size: using --seat 1 (1× Pro). Pass --seat if that is wrong.');
}
const row = { at: when, fiveHourPct: pct(fh), fiveHourResetsAt: iso(fhr), weeklyPct: pct(wk), weeklyResetsAt: iso(wkr), proMultiplier: seat, note: note.join(' ') };
appendFileSync(file, JSON.stringify(row) + '\n');
console.log(`usage ${row.at} (${seat}× Pro seat): 5-hour ${row.fiveHourPct ?? '?'}% (resets ${row.fiveHourResetsAt ?? '?'}) · weekly ${row.weeklyPct ?? '?'}% (resets ${row.weeklyResetsAt ?? '?'})`);
