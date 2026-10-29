// What device.ts (iOS, WebDriverAgent) and device-android.ts (UiAutomator2) share: settings, time stamps, the W3C
// WebDriver client for the run's stored session, and the `do` recipe runner. Platform behaviour stays in each script.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// device.ts exit code for a phone the agent cannot fix (locked, unplugged, untrusted certificate).
export const BLOCKER = 75;
// Settings come from CASEBOOK_<name>; the older PDR_<name> spellings still work.
export const env = (k: string, old = k) => process.env[`CASEBOOK_${k}`] ?? process.env[`PDR_${old}`];
export const stamp = () => { const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };
export const sleep = (sec: number) => new Promise(r => setTimeout(r, sec * 1000));
// Splits a recipe line into words, keeping "quoted" and 'quoted' strings whole.
export const tokens = (l: string) => [...l.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(m => m[1] ?? m[2] ?? m[3]);

// Every command leaves a time stamp; run-log.ts `time` uses them to tell test time from idle waits.
export function logActivity(runDir: string, cmd: string, args: string[]) {
  try { appendFileSync(join(runDir, 'activity.log'), `${new Date().toISOString()} ${cmd} ${args.join(' ').slice(0, 80)}\n`); } catch {}
}

// W3C WebDriver calls against the Appium server at `base`, for the session id stored in `sidFile`.
export function webdriver(base: string, sidFile: string) {
  async function call(method: string, path: string, body?: unknown, timeout = 300_000) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
    const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: ctl.signal });
    clearTimeout(t);
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${j?.value?.error ?? ''} ${String(j?.value?.message ?? '').slice(0, 400)}`);
    return j;
  }
  const sid = () => readFileSync(sidFile, 'utf8').trim();
  const s = (method: string, path: string, body?: unknown) => call(method, `/session/${sid()}${path}`, body);
  const mobile = (script: string, args: unknown = {}) => s('POST', '/execute/sync', { script: `mobile: ${script}`, args: [args] });
  const pointer = (actions: unknown[]) => s('POST', '/actions', { actions: [{ type: 'pointer', id: 'f', parameters: { pointerType: 'touch' }, actions }] });
  return { call, sid, s, mobile, pointer };
}

// `do <file.steps> [args…]` or `do "cmd ;; cmd ;; …"`: runs each line through `step`, "$1".."$9" from args, "?" before
// a line = may fail. On the first failure it prints the step and what `onFail` returns (screenshot, visible elements)
// and exits 1.
export async function runRecipe(runDir: string, rest: string[], step: (c: string, a: string[]) => Promise<unknown>, onFail: () => Promise<string[]>) {
  const file = rest[0] && existsSync(rest[0]) ? rest[0] : '';
  const vars = file ? rest.slice(1) : [];
  const text = file ? readFileSync(file, 'utf8') : rest.join(' ').split(';;').join('\n');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    .map(l => l.replace(/\$(\d)/g, (_, n) => vars[Number(n) - 1] ?? ''));
  for (const [i, raw] of lines.entries()) {
    const optional = raw.startsWith('?'); const line = optional ? raw.slice(1).trim() : raw;
    const [c, ...a] = tokens(line);
    logActivity(runDir, c, a);
    try { await step(c, a); }
    catch (e: any) {
      if (optional) { console.log(`  (step ${i + 1} skipped: ${String(e?.message ?? e).slice(0, 160)})`); continue; }
      console.error(`✗ step ${i + 1}/${lines.length}: ${line}\n  ${String(e?.message ?? e).slice(0, 400)}`);
      for (const l of await onFail()) console.error(l);
      process.exit(1);
    }
  }
  console.log(`✓ ${lines.length} steps${file ? ` (${file})` : ''}`);
}
