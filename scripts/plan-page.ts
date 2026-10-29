// Build the run-plan page: phases, segments and every case with its latest result, plus checkpoints and the run log.
// Usage: node scripts/plan-page.ts <product>/<feature> <platform> <draft id> <run plan .md> [--out <file.html>]
//        node scripts/plan-page.ts <product>/<feature> <platform> <draft id> <run plan .md> --serve [port] [--lan]
// --serve keeps a local page up (default http://127.0.0.1:4390/) that rebuilds from the files on every request and
// polls data.json every 10 s, so each `run-log.ts set` shows up live with no extra step from the worker.
// --lan binds 0.0.0.0 so other computers on the network can open it (no auth: anyone on the LAN can read it).
// Without --serve the page is static and self-contained (data inline, no fetch), for publishing as an artifact.
// Time and usage per phase and segment: wall / test / idle (gaps over 15 min) from each run folder's activity points
// (same as `run-log.ts time`); Claude tokens from this project's transcripts (token-usage.ts) inside the active spans;
// plan usage in % of a 1× Pro user's limits. Primary figure: "est. from token rate" = the row's weighted tokens (API
// price ratios: input 1, cache write 1.25, cache read 0.1, output 5) × a rate calibrated in
// runs/usage-calibration.json ({ basis: phase id, fiveHourPct, seat, source, weekPerFiveHour, basisWeightedTokens? }):
// basisWeightedTokens carries the basis phase's weighted tokens when it ran on another platform (Android borrows iOS P1). rate = fiveHourPct ×
// seat ÷ the basis phase's weighted tokens. Weekly (rough) = that × weekPerFiveHour, or, when null, × the weekly ÷
// 5-hour ratio of the latest seat's readings. Secondary: "account total (shared)" from runs/usage.jsonl snapshots
// (usage-log.ts): the account's increments during the active time. Each snapshot carries its account's seat size
// (proMultiplier, 1 Team seat = 6.25× Pro; a row without one inherits the previous row's, else 1); Pro-% = plan-% ×
// that value, and a seat change marks an account switch (no window spans it). Other users of a shared account are
// invisible to these transcripts, so the account figure is only an upper bound.
// The page leads with the current run and puts earlier runs (their phases and time / usage table) after it. Current =
// phases.json's "current" list when set, else the newest phase marked "round": true and every phase after it, else
// every phase (user, 2026-10-22: a new draft or plan starts at the top; earlier runs follow in the order they ran).
// Reads drafts/<draft>/phases.json, the approved cases.csv, every runs/*/results.csv (latest record per case wins),
// each run folder's run-state.md checkpoints, and the "## Log" list of the run plan. Default output:
// library/<product>/<feature>/<platform>/runs/plan.html. Re-run it whenever the run moves on.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { readRecords } from './lib/csv.ts';
import { addMsg, projectTranscripts, transcriptMessages, zero, type Msg, type U } from './token-usage.ts';

const args = process.argv.slice(2);
const oi = args.indexOf('--out'); const outArg = oi >= 0 ? args.splice(oi, 2)[1] : undefined;
const si = args.indexOf('--serve'); const serve = si >= 0;
const portArg = serve && /^\d+$/.test(args[si + 1] ?? '') ? Number(args.splice(si, 2)[1]) : (serve ? (args.splice(si, 1), 4390) : 0);
const li = args.indexOf('--lan'); const lan = li >= 0; if (lan) args.splice(li, 1);
const [feature, platform, draft, planPath] = args;
if (!feature || !platform || !draft || !planPath) { console.error('Usage: node scripts/plan-page.ts <product>/<feature> <platform> <draft id> <run plan .md> [--out f.html | --serve [port] [--lan]]'); process.exit(2); }
const ROOT = join(import.meta.dirname, '..');
const base = join(ROOT, 'library', feature, platform);
const runsDir = join(base, 'runs');

const IDLE = 15 * 60_000, H5 = 5 * 3_600_000, WEEK = 7 * 24 * 3_600_000;
type Span = { a: number; b: number; phase: string; seg: string };
// fiveHour / weekly: account increments during the active time (Pro-%); models: message count per model ID.
type Stat = { first: number; last: number; test: number; idle: number; gaps: number; tokens: U; models: Record<string, number>; fiveHour: number; weekly: number; covered: boolean; approx: boolean };
const newStat = (): Stat => ({ first: Infinity, last: -Infinity, test: 0, idle: 0, gaps: 0, tokens: zero(), models: {}, fiveHour: 0, weekly: 0, covered: false, approx: false });
// Price-ratio weight of a message: the proxy for how much plan usage it cost.
const W = { input: 1, cacheWrite: 1.25, cacheRead: 0.1, output: 5 };
const weight = (m: Msg | U) => m.input * W.input + m.cacheWrite * W.cacheWrite + m.cacheRead * W.cacheRead + m.output * W.output;
// Sorted messages plus prefix sums of their weights, rebuilt only when a file's size or mtime changed (token-usage.ts
// itself reads only the bytes appended since the last call).
type Series = { msgs: Msg[]; pre: Float64Array };
const seriesCache = new Map<string, { sig: string; s: Series }>();
function series(key: string, files: string[]): Series {
  const sig = files.map(f => { try { const x = statSync(f); return `${f}:${x.size}:${x.mtimeMs}`; } catch { return f; } }).join('|');
  const c = seriesCache.get(key); if (c && c.sig === sig) return c.s;
  const msgs = transcriptMessages(files), pre = new Float64Array(msgs.length + 1);
  msgs.forEach((m, i) => { pre[i + 1] = pre[i] + weight(m); });
  const s = { msgs, pre }; seriesCache.set(key, { sig, s }); return s;
}
const upper = (s: Series, t: number) => { let lo = 0, hi = s.msgs.length; while (lo < hi) { const m = (lo + hi) >> 1; if (s.msgs[m].t <= t) lo = m + 1; else hi = m; } return lo; };
const wsum = (s: Series, a: number, b: number) => b > a ? s.pre[upper(s, b)] - s.pre[upper(s, a)] : 0;   // weight of messages in (a, b]

// Activity points of a run folder, as `run-log.ts time` collects them; each gap of up to 15 min is an active span,
// labelled with the segment of the next recorded case (after the last one: "wrap-up").
function activity(dir: string, rows: Record<string, string>[], phase: string) {
  const pts: number[] = [];
  const act = join(dir, 'activity.log');
  if (existsSync(act)) for (const l of readFileSync(act, 'utf8').split('\n')) { const t = Date.parse(l.split(' ')[0]); if (t) pts.push(t); }
  for (const r of rows) { const t = Date.parse(r['Recorded At']); if (t) pts.push(t); }
  const walk = (d: string): string[] => existsSync(d) ? readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; }) : [];
  for (const sub of ['screenshots', 'ledger']) for (const f of walk(join(dir, sub))) pts.push(statSync(f).mtimeMs);
  for (const f of existsSync(join(dir, 'logs')) ? readdirSync(join(dir, 'logs')) : []) pts.push(statSync(join(dir, 'logs', f)).mtimeMs);
  pts.sort((a, b) => a - b);
  const recs = rows.map(r => ({ t: Date.parse(r['Recorded At']), seg: r.Segment || '-' })).filter(r => r.t).sort((a, b) => a.t - b.t);
  const spans: Span[] = [], idle: { a: number; b: number; seg: string }[] = [];
  let ri = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i]; if (b === a) continue;
    while (ri < recs.length && recs[ri].t < b) ri++;
    const seg = ri < recs.length ? recs[ri].seg : 'wrap-up';
    (b - a > IDLE ? idle : spans).push({ a, b, phase, seg } as Span);
  }
  return { first: pts[0], last: pts.at(-1), spans, idle };
}

// Plan-usage increments from the snapshots: positive steps of percentUsed within one window; a changed resetsAt,
// a drop, or (with no resetsAt) a reading after a 100% stop starts a new window from 0.
// A seat change between snapshots is an account switch: no window spans it, and an increment never reaches back past it.
// The first reading of the file, and the first after an account switch, is a baseline only: its value holds use from
// before the run (other work on a shared account), so it adds nothing (2026-10-27: the Android run's first reading,
// 14 % of a 6.25× seat, showed as 100 % of a Pro window).
type Snap = { at: string; fiveHourPct: number | null; fiveHourResetsAt: string | null; weeklyPct: number | null; weeklyResetsAt: string | null; proMultiplier: number; note?: string };
function increments(snaps: Snap[], key: 'fiveHour' | 'weekly', dur: number) {
  const out: { from: number; to: number; pct: number; mult: number; approx: boolean }[] = [];
  let prev: { t: number; pct: number; r?: number; mult: number } | undefined;
  let switchAt = -Infinity;
  for (let i = 0; i < snaps.length; i++) {
    const s = snaps[i];
    if (i && s.proMultiplier !== snaps[i - 1].proMultiplier) { switchAt = Date.parse(s.at); prev = undefined; }
    const pct = s[`${key}Pct`]; if (pct == null) continue;
    const t = Date.parse(s.at), r = s[`${key}ResetsAt`] ? Date.parse(s[`${key}ResetsAt`]!) : undefined;
    let same = false;
    if (prev) {
      if (r !== undefined && prev.r !== undefined) same = Math.abs(r - prev.r) < 120_000;
      else if (prev.r !== undefined) same = t < prev.r;
      else if (r !== undefined) same = prev.t > r - dur;
      else same = t - prev.t < dur && prev.pct < 100;
      if (pct < prev.pct) same = false;
    }
    const from = same ? prev!.t : Math.max(r !== undefined ? r - dur : t - dur, prev?.t ?? -Infinity, switchAt);
    const inc = same ? pct - prev!.pct : pct;
    if (inc > 0 && prev) out.push({ from, to: t, pct: inc, mult: s.proMultiplier, approx: /approx/i.test(s.note ?? '') || r === undefined });
    prev = { t, pct, r: r ?? (same ? prev!.r : undefined), mult: s.proMultiplier };
  }
  return out;
}

function buildData() {
  // Phases merged into another (P2 and P3 inside P23) are shown only through the phase that runs them.
  const phasesFile = JSON.parse(readFileSync(join(base, 'drafts', draft, 'phases.json'), 'utf8'));
  const phases = phasesFile.phases.filter((p: any) => !p.merged_into);
  const lastRound = phases.map((p: any, i: number) => p.round ? i : -1).filter((i: number) => i >= 0).at(-1);
  const currentIds = new Set<string>(phasesFile.current ?? (lastRound === undefined ? phases.map((p: any) => p.id) : phases.slice(lastRound).map((p: any) => p.id)));
  // Case text: the approved table, then the draft for rows it does not have yet (a run plan built before approval).
  const draftCsv = join(base, 'drafts', draft, 'draft.csv');
  const cases = Object.fromEntries([
    ...(existsSync(draftCsv) ? readRecords(readFileSync(draftCsv, 'utf8')).map(r => [r.ID, r] as const) : []),
    ...readRecords(readFileSync(join(base, 'cases.csv'), 'utf8')).map(r => [r.ID, r] as const),
  ]);
  const manifest = existsSync(join(base, 'manifest.json')) ? JSON.parse(readFileSync(join(base, 'manifest.json'), 'utf8')) : {};
  
  // Latest result per case across run folders, and which run folder a phase uses.
  const latest: Record<string, { result: string; disp: string; actual: string; at: number; run: string }> = {};
  // A round phase ("round": true, e.g. P9) re-runs rows that ran before; it shows only results from its own run folder.
  const byRun: Record<string, typeof latest> = {};
  const phaseRun: Record<string, string> = {};
  const checkpoints: { time: string; next: string; text: string; run: string }[] = [];
  const spans: Span[] = [], idles: { a: number; b: number; phase: string; seg: string }[] = [];
  const stat: Record<string, Stat> = {};   // keys: "<phase>" and "<phase>/<segment>"
  let build = '';
  for (const d of readdirSync(runsDir).filter(d => statSync(join(runsDir, d)).isDirectory()).sort()) {
    const rc = join(runsDir, d, 'results.csv'); if (!existsSync(rc)) continue;
    const state = existsSync(join(runsDir, d, 'run-state.md')) ? readFileSync(join(runsDir, d, 'run-state.md'), 'utf8') : '';
    const ph = state.match(/^# Run state — ([A-Z]+\d+)/m)?.[1]; if (ph) phaseRun[ph] = `runs/${d}/`;
    const b = (state.match(/\b[A-Z][A-Za-z]+(?: iOS)? (\d+\.\d+\.\d+ \(\d+\))/)?.[1] ?? state.match(/\b[A-Z][A-Za-z]+(?: Mobile)? for Android (\d+\.\d+\.\d+) \(versionCode (\d+)\)/)?.slice(1).join(" (").concat(")")); if (b) build = b;
    for (const m of state.matchAll(/^### (\S+)( · next (\S+) \(([^)]*)\)| · all recorded)?\n[^\n]*\n\n([\s\S]*?)(?=\n### |\s*$)/gm))
      checkpoints.push({ time: m[1].replace('T', ' ').slice(0, 16) + ' UTC', next: m[3] ? `${m[3]} (${m[4]})` : 'all recorded', text: m[5].trim().replace(/\s+/g, ' ').slice(0, 420) + (m[5].length > 420 ? '…' : ''), run: d });
    if (!ph) continue;   // older runs (before phases) don't count toward this plan
    const rows = readRecords(readFileSync(rc, 'utf8'));
    const act = activity(join(runsDir, d), rows, ph);
    spans.push(...act.spans); idles.push(...act.idle.map(g => ({ ...g, phase: ph })));
    if (act.first !== undefined) Object.assign(stat[ph] ??= newStat(), { first: act.first, last: act.last });
    for (const r of rows) {
      const at = Date.parse(r['Recorded At']) || 0;
      const rec = { result: r.Result || 'Not run', disp: r.Disposition || '', actual: r.Actual || '', at, run: d };
      if (!latest[r.ID] || at >= latest[r.ID].at) latest[r.ID] = rec;
      ((byRun[d] ??= {})[r.ID]) = rec;
    }
  }
  
  // Time and tokens per phase and segment.
  const files = projectTranscripts(ROOT), mine = series('project', files), msgs = mine.msgs;
  const st = (k: string) => stat[k] ??= newStat();
  for (const sp of spans) for (const s of [st(sp.phase), st(`${sp.phase}/${sp.seg}`)]) {
    s.test += sp.b - sp.a; s.first = Math.min(s.first, sp.a); s.last = Math.max(s.last, sp.b);
    for (let i = upper(mine, sp.a); i < msgs.length && msgs[i].t <= sp.b; i++) { addMsg(s.tokens, msgs[i]); if (!msgs[i].model.startsWith('<')) s.models[msgs[i].model] = (s.models[msgs[i].model] ?? 0) + 1; }
  }
  for (const g of idles) for (const s of [st(g.phase), st(`${g.phase}/${g.seg}`)]) { s.idle += g.b - g.a; s.gaps++; }
  // Plan usage, in Pro-% (plan-% × the snapshot's seat size). Account figure: each increment the run overlaps, split
  // between its phases (and segments) by their weighted tokens inside it (active time if none).
  const usageFile = join(runsDir, 'usage.jsonl');
  const snaps: Snap[] = existsSync(usageFile) ? readFileSync(usageFile, 'utf8').split('\n').filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } }).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)) : [];
  let seat = 1, seatAssumed = false;
  for (const s of snaps) if (s.proMultiplier > 0) seat = s.proMultiplier; else { s.proMultiplier = seat; seatAssumed = true; }
  const readings = snaps.filter(s => s.fiveHourPct != null || s.weeklyPct != null);
  const total = { fiveHour: 0, weekly: 0, outside5: 0, outsideW: 0, approx: false };
  const incs = { fiveHour: increments(snaps, 'fiveHour', H5), weekly: increments(snaps, 'weekly', WEEK) };
  for (const key of ['fiveHour', 'weekly'] as const) for (const inc of incs[key]) {
    const pro = inc.pct * inc.mult;
    total.approx ||= inc.approx;
    const ov = spans.map(sp => Math.max(0, Math.min(sp.b, inc.to) - Math.max(sp.a, inc.from)));
    if (!ov.some(Boolean)) { total[key === 'fiveHour' ? 'outside5' : 'outsideW'] += pro; continue; }
    const tw = spans.map((sp, i) => ov[i] ? wsum(mine, Math.max(sp.a, inc.from), Math.min(sp.b, inc.to)) : 0);
    const runW = tw.reduce((x, y) => x + y, 0), by = runW ? tw : ov, sum = by.reduce((x, y) => x + y, 0);
    total[key] += pro;
    spans.forEach((sp, i) => {
      if (!ov[i]) return;
      for (const s of [st(sp.phase), st(`${sp.phase}/${sp.seg}`)]) { s[key] += pro * by[i] / sum; s.covered = true; s.approx ||= inc.approx; }
    });
  }
  // Token-rate estimate. rate = the calibrated 5-hour Pro-% ÷ the basis phase's weighted tokens. Weekly ratio: the
  // calibration's weekPerFiveHour, else Σ Δweekly ÷ Σ Δ5-hour over consecutive readings of the latest seat that both
  // carry a 5-hour and a weekly value in the same windows (no reset in between). Paired readings only: a reading's
  // first value on a new account holds use from before it (10/22: 95% weekly from other work counted as a 1-second
  // increment made the ratio 1.70 instead of 0.19). The seat factor cancels: both are plan-% of one account.
  const calFile = join(runsDir, 'usage-calibration.json');
  const cal = existsSync(calFile) ? JSON.parse(readFileSync(calFile, 'utf8')) as { basis: string; fiveHourPct: number; seat?: number; source?: string; weekPerFiveHour?: number | null; basisWeightedTokens?: number } : null;
  const basisW = cal ? (stat[cal.basis] ? weight(stat[cal.basis].tokens) : cal.basisWeightedTokens ?? 0) : 0;
  const rate = cal && basisW ? cal.fiveHourPct * (cal.seat ?? 1) / basisW : null;
  let weekRatio: number | null = cal?.weekPerFiveHour ?? null, weekBasis: { seat: number; weekly: number; fiveHour: number; from: string; to: string } | null = null;
  const paired = readings.filter(s => s.fiveHourPct != null && s.weeklyPct != null);
  const close = (x?: string | null, y?: string | null) => !x || !y || Math.abs(Date.parse(x) - Date.parse(y)) < 120_000;
  for (const wSeat of [...new Set(paired.map(s => s.proMultiplier))].reverse()) {
    if (weekRatio != null) break;
    const ps = paired.filter(s => s.proMultiplier === wSeat);
    let wk = 0, fh = 0, a = Infinity, b = -Infinity;
    for (let i = 1; i < ps.length; i++) {
      const p = ps[i - 1], q = ps[i];
      const dW = q.weeklyPct! - p.weeklyPct!, d5 = q.fiveHourPct! - p.fiveHourPct!;
      if (dW < 0 || d5 < 0 || !close(p.fiveHourResetsAt, q.fiveHourResetsAt) || !close(p.weeklyResetsAt, q.weeklyResetsAt)) continue;
      wk += dW; fh += d5; a = Math.min(a, Date.parse(p.at)); b = Math.max(b, Date.parse(q.at));
    }
    if (fh > 0) { weekRatio = wk / fh; weekBasis = { seat: wSeat, weekly: wk * wSeat, fiveHour: fh * wSeat, from: new Date(a).toISOString(), to: new Date(b).toISOString() }; }
  }
  const est = (wt: number) => ({ est5: rate != null ? wt * rate : null, estW: rate != null && weekRatio != null ? wt * rate * weekRatio : null });
  for (const s of Object.values(stat)) if (readings.some(x => { const t = Date.parse(x.at); return t >= s.first && t <= s.last; })) s.covered = true;
  // Seat size(s) in force during a phase: the latest snapshot at or before its start, plus any inside it.
  const seatsIn = (s: Stat) => [...new Set(snaps.filter((x, i) => { const t = Date.parse(x.at); return (t > s.first && t <= s.last) || (t <= s.first && !(snaps[i + 1] && Date.parse(snaps[i + 1].at) <= s.first)); }).map(x => x.proMultiplier))];
  const pub = (s?: Stat) => s && Number.isFinite(s.first) ? { wall: s.last - s.first, test: s.test, idle: s.idle, gaps: s.gaps, tokens: s.tokens,
    wt: weight(s.tokens), ...est(weight(s.tokens)), models: s.models,
    fiveHour: s.covered ? s.fiveHour : null, weekly: s.covered ? s.weekly : null,
    seats: seatsIn(s), readings: s.covered, approx: s.approx, from: new Date(s.first).toISOString(), to: new Date(s.last).toISOString() } : null;
  const last = readings.at(-1);
  // Rounds: consecutive phases that ran on the same seat size (an account switch starts a new round).
  type Pub = NonNullable<ReturnType<typeof pub>>;
  const rounds: { phases: string[]; seats: number[]; s: Pub[] }[] = [];
  for (const p of phases) {
    const s = pub(stat[p.id]); if (!s) continue;
    const r = rounds.at(-1);
    if (r && r.seats.join() === s.seats.join()) { r.phases.push(p.id); r.s.push(s); } else rounds.push({ phases: [p.id], seats: s.seats, s: [s] });
  }
  const sumU = (xs: U[]) => xs.reduce((a, u) => ({ input: a.input + u.input, cacheWrite: a.cacheWrite + u.cacheWrite, cacheRead: a.cacheRead + u.cacheRead, output: a.output + u.output, messages: a.messages + u.messages }), zero());
  const add = (xs: (number | null)[]) => xs.some(x => x != null) ? xs.reduce<number>((a, x) => a + (x ?? 0), 0) : null;
  const roundOut = rounds.map((r, i) => {
    const tokens = sumU(r.s.map(x => x.tokens)), models: Record<string, number> = {};
    for (const x of r.s) for (const [m, n] of Object.entries(x.models)) models[m] = (models[m] ?? 0) + n;
    return { n: i + 1, phases: r.phases, seats: r.seats, wall: r.s.reduce((a, x) => a + x.wall, 0), test: r.s.reduce((a, x) => a + x.test, 0),
      idle: r.s.reduce((a, x) => a + x.idle, 0), gaps: r.s.reduce((a, x) => a + x.gaps, 0), tokens, wt: weight(tokens), ...est(weight(tokens)), models,
      fiveHour: add(r.s.map(x => x.fiveHour)), weekly: add(r.s.map(x => x.weekly)), readings: r.s.some(x => x.readings), approx: r.s.some(x => x.approx) };
  });
  const allTok = sumU(roundOut.map(r => r.tokens));

  // Why a case is Blocked, as a group key plus a short note: "need:<n>" (recorded Blocked up front by `init`),
  // "gate:<n>" (a failed gate such as the video preflight), "upstream" (an earlier case failed) or "other". A run
  // folder's blocked-reasons.json ({ "<case>": { "group"?: "need:chat-count", "label"?: "<own group>", "note"?: "…" } })
  // regroups cases the text can't place.
  const overrides: Record<string, Record<string, { group?: string; label?: string; note?: string }>> = {};
  const override = (run: string) => overrides[run] ??= (f => existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {})(join(runsDir, run, 'blocked-reasons.json'));
  const gist = (s: string) => { const m = s.match(/^.{20,}?(?=: | — |(?<!\d)\. |; )/); const g = m ? m[0] : s; return g.length > 160 ? g.slice(0, 159) + '…' : g; };
  const why = (id: string, l: { actual: string; run: string }) => {
    const o = override(l.run)[id] ?? {}, a = l.actual;
    const need = a.match(/^Not run by policy: needs ([\w-]+)/)?.[1];
    const gate = a.match(/\bgate (\w+) failed|\b(\w+) gate failed|^Needs a (video) in progress/i)?.slice(1).find(Boolean)?.toLowerCase();
    const group = o.label ? `label:${o.label}` : o.group ?? (need ? `need:${need}` : gate ? `gate:${gate}` : /^Upstream|\bUpstream TC-|\(TC-\d+\)/.test(a) ? 'upstream' : 'other');
    return { group, note: o.note ?? (group === 'upstream' || group === 'other' ? gist(a) : '') };
  };

  const plan = readFileSync(planPath, 'utf8');
  const log = (plan.split(/^## Log\s*$/m)[1] ?? '').split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2).replace(/\*\*/g, ''));
  const short = (s: string, n = 120) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const data = {
    feature: manifest.title ?? feature, version: manifest.version ?? '?', totalCases: Object.keys(cases).length,
    build: build || '?', unavailable: phasesFile.unavailable ?? {}, generated: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    phases: phases.map((p: any) => ({
      id: p.id, name: p.name, current: currentIds.has(p.id), note: p.note ?? '', skip: p.skip ?? '', hold: p.hold ?? '', runDir: phaseRun[p.id] ?? '', stats: pub(stat[p.id]),
      wrapUp: pub(stat[`${p.id}/wrap-up`]),
      segments: p.segments.map((s: any) => ({ id: s.id, name: s.name, stats: pub(stat[`${p.id}/${s.id}`]), cases: s.cases.map((id: string) => {
        const runName = (phaseRun[p.id] ?? '').replace(/^runs\/|\/$/g, '');
        const l = p.round ? byRun[runName]?.[id] : latest[id];
        return { id, origin: p.origin?.[id] ?? '', needs: (phasesFile.needs?.[id] ?? []).join(' '), section: cases[id]?.Section ?? '', action: short(cases[id]?.Action ?? ''), result: l?.result ?? 'Not run', disp: l?.disp ?? '', actual: short(l?.actual ?? '', 400),
          why: l?.result === 'Blocked' ? why(id, l) : undefined,
          at: l?.at ? new Date(l.at).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '' };
      }) })),
    })),
    usage: { snapshots: readings.length, markers: snaps.length - readings.length, seatAssumed, weights: W, approx: total.approx,
      fiveHour: total.fiveHour, weekly: total.weekly, outside5: total.outside5, outsideW: total.outsideW,
      rounds: roundOut, wt: weight(allTok), ...est(weight(allTok)),
      calibration: cal ? { ...cal, basisWt: basisW, rate, weekRatio, weekBasis } : null,
      transcripts: files.length,
      latest: last ? { at: last.at, seat: last.proMultiplier, fiveHourPct: last.fiveHourPct, weeklyPct: last.weeklyPct, fiveHourResetsAt: last.fiveHourResetsAt, weeklyResetsAt: last.weeklyResetsAt } : null },
    // Checkpoints of the current run's folders only (a phase that has not started has none yet).
    checkpoints: checkpoints.filter(c => [...currentIds].some(id => phaseRun[id] === `runs/${c.run}/`)).slice(-6).reverse(),
    log: log.reverse(),
  };
  return { data, checkpointCount: checkpoints.length, logCount: log.length };
}

const page = (data: unknown, live: boolean) => {
  const d = data as { feature: string };
  const tpl = readFileSync(join(import.meta.dirname, 'plan-page.tpl'), 'utf8');
  // The static page carries its data inline and has no polling code (no fetch), so it renders with no server.
  return (live ? tpl : tpl.replace(/\/\*LIVE\*\/[\s\S]*?\/\*\/LIVE\*\//, '')).replaceAll('__TITLE__', `${d.feature} Progress`)
    .replace('__LIVE__', String(live)).replace('__DATA__', () => JSON.stringify(data).replace(/</g, '\\u003c').replace(/\uFFFD/g, '\\ufffd'));
};

if (serve) {
  const server = createServer((req, res) => {
    try {
      const url = req.url ?? '/';
      if (url === '/' || url.startsWith('/?')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(page(buildData().data, true)); return; }
      if (url.startsWith('/data.json')) { res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(buildData().data)); return; }
      res.writeHead(404); res.end('Not found');
    } catch (e: any) { res.writeHead(500, { 'content-type': 'text/plain' }); res.end(String(e?.message ?? e)); }
  });
  let port = portArg; const host = lan ? '0.0.0.0' : '127.0.0.1';
  server.on('error', (e: any) => { if (e.code === 'EADDRINUSE' && port < portArg + 10) { port++; server.listen(port, host); } else throw e; });
  server.on('listening', () => {
    console.log(`Run plan (live): http://127.0.0.1:${port}/  — Ctrl+C to stop`);
    if (!lan) return;
    for (const ifs of Object.values(networkInterfaces())) for (const i of ifs ?? []) if (i.family === 'IPv4' && !i.internal) console.log(`  LAN: http://${i.address}:${port}/`);
    console.log('  Warning: --lan has no auth; anyone on this network can read the page.');
  });
  server.listen(port, host);
} else {
  const { data, checkpointCount, logCount } = buildData();
  const html = page(data, false);
  const out = outArg ?? join(runsDir, 'plan.html');
  writeFileSync(out, html);
  const n = data.phases.flatMap((p: any) => p.segments.flatMap((s: any) => s.cases)).length;
  console.log(`${out}: ${data.phases.length} phases, ${n} cases, ${checkpointCount} checkpoints, ${logCount} log lines`);
}
