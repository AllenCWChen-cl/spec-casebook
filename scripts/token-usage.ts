// Claude token use for a run, summed from Claude Code session transcripts (~/.claude/projects/<project>/<session>.jsonl).
// Usage: node scripts/token-usage.ts [--since <ISO>] [--until <ISO>] [--out <file.json>] <transcript.jsonl> [...]
// Counts each assistant message once (by message id, last record wins) whose timestamp falls in the window, and
// prints input, cache-write, cache-read and output tokens per model and in total. Sessions handed off to a fresh
// context have their own transcripts: pass every transcript the run used.
// Also a module: plan-page.ts imports transcriptMessages()/projectTranscripts(), which read each transcript
// incrementally (only the bytes appended since the last call), so a 10 s poll stays cheap.
import { closeSync, existsSync, openSync, readdirSync, readSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export type Msg = { id: string; t: number; ts: string; model: string; input: number; cacheWrite: number; cacheRead: number; output: number };
export type U = { input: number; cacheWrite: number; cacheRead: number; output: number; messages: number };
export const zero = (): U => ({ input: 0, cacheWrite: 0, cacheRead: 0, output: 0, messages: 0 });
export const addMsg = (u: U, m: Msg) => { u.input += m.input; u.cacheWrite += m.cacheWrite; u.cacheRead += m.cacheRead; u.output += m.output; u.messages++; };

const cache = new Map<string, { offset: number; mtime: number; rest: Buffer; msgs: Map<string, Msg> }>();
function readNew(file: string) {
  const st = statSync(file);
  let c = cache.get(file);
  if (!c || st.size < c.offset) { c = { offset: 0, mtime: 0, rest: Buffer.alloc(0), msgs: new Map() }; cache.set(file, c); }
  if (st.size === c.offset && st.mtimeMs === c.mtime) return c.msgs;
  const fd = openSync(file, 'r');
  try {
    const buf = Buffer.alloc(st.size - c.offset); let got = 0;
    while (got < buf.length) { const n = readSync(fd, buf, got, buf.length - got, c.offset + got); if (!n) break; got += n; }
    const all = Buffer.concat([c.rest, buf.subarray(0, got)]);
    const cut = all.lastIndexOf(0x0a) + 1;   // keep a half-written last line for next time
    for (const line of all.subarray(0, cut).toString('utf8').split('\n')) {
      if (!line.includes('"usage"')) continue;
      let o: any; try { o = JSON.parse(line); } catch { continue; }
      const m = o.message, ts: string = o.timestamp ?? '', u = m?.usage;
      if (!u || !m.id || !ts) continue;
      c.msgs.set(m.id, { id: m.id, t: Date.parse(ts), ts, model: m.model ?? '?', input: u.input_tokens ?? 0,
        cacheWrite: u.cache_creation_input_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0, output: u.output_tokens ?? 0 });
    }
    c.rest = Buffer.from(all.subarray(cut)); c.offset += got; c.mtime = st.mtimeMs;
  } finally { closeSync(fd); }
  return c.msgs;
}

/** Every assistant message with usage in these transcripts, deduplicated by message id (last file wins), sorted by time. */
export function transcriptMessages(files: string[]): Msg[] {
  const byId = new Map<string, Msg>();
  for (const f of files) { try { for (const [id, m] of readNew(f)) byId.set(id, m); } catch {} }
  return [...byId.values()].sort((a, b) => a.t - b.t);
}

/** Session transcripts and their subagent transcripts for a project folder (default: the one Claude Code uses for `root`). */
export function projectTranscripts(root: string): string[] {
  const dir = join(homedir(), '.claude', 'projects', resolve(root).replace(/[^A-Za-z0-9]/g, '-'));
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.jsonl')) out.push(join(dir, f));
    const sub = join(dir, f, 'subagents');
    if (existsSync(sub)) for (const s of readdirSync(sub)) if (s.endsWith('.jsonl')) out.push(join(sub, s));
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  const args = process.argv.slice(2);
  const opt = (n: string) => { const i = args.indexOf(n); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
  const since = opt('--since'), until = opt('--until'), out = opt('--out');
  if (!args.length) { console.error('Usage: node scripts/token-usage.ts [--since ISO] [--until ISO] [--out f.json] <transcript.jsonl> [...]'); process.exit(2); }
  const msgs = transcriptMessages(args).filter(m => !(since && m.ts < since) && !(until && m.ts > until));
  const per: Record<string, U> = {}; const tot = zero();
  for (const m of msgs) { addMsg(per[m.model] ??= zero(), m); addMsg(tot, m); }
  const first = msgs[0]?.ts ?? '', last = msgs.at(-1)?.ts ?? '';
  const fmt = (n: number) => n.toLocaleString('en-US');
  const line = (k: string, u: U) => `${k.padEnd(18)} ${String(u.messages).padStart(6)} msgs  in ${fmt(u.input).padStart(10)}  cache-write ${fmt(u.cacheWrite).padStart(12)}  cache-read ${fmt(u.cacheRead).padStart(15)}  out ${fmt(u.output).padStart(10)}`;
  console.log(`window ${since ?? 'start'} → ${until ?? 'now'} (messages ${first || '-'} → ${last || '-'})`);
  for (const [k, u] of Object.entries(per)) console.log(line(k, u));
  console.log(line('total', tot));
  console.log(`all tokens processed: ${fmt(tot.input + tot.cacheWrite + tot.cacheRead + tot.output)} (cache reads are billed at a fraction of input)`);
  if (out) writeFileSync(out, JSON.stringify({ since, until, first, last, per_model: per, total: tot }, null, 1));
}
