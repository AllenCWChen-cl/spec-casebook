// Filing defaults for a feature's next eBug batch, read from the newest filed batch.
// Usage: node scripts/ebug-defaults.ts <product>/<feature> <ios|android> [--json] [--exclude <batch>] [--before <batch>]
//
// Looks at every library/<product>/<feature>/<platform>/ebugs/<batch>/filed_bugcodes.json and takes the newest one
// (meta.filed_on, then the batch folder name). Prints Creator (meta.creator), TRCode (meta.tr), the source tag
// (first [tag] of the filed Short Descriptions), method (meta.method) and the build/version the TR was filed for.
// Review pages show these as "from <batch> — confirm" instead of blank fields (reviewer rule, 2026-10-21).
// "Same build" / "Same TR" in a user's decisions means this TR when the build matches.
// --exclude skips one batch folder; --before <batch> only looks at batch folders that sort before it (what a batch's
// own review page uses, so a page rebuilt after later batches were filed still shows the defaults it was filed from).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LIBRARY, PLATFORMS } from './lib/library.ts';

type Filed = {
  meta?: { creator?: string; tr?: string; method?: string; version?: string; build?: string; server?: string; filed_on?: string };
  bugs?: { bugcode?: string; short?: string }[];
};

const args = process.argv.slice(2);
const json = args.includes('--json');
const opt = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const exclude = opt('--exclude');
const before = opt('--before');
const valueIdx = new Set(['--exclude', '--before'].map(n => args.indexOf(n)).filter(i => i >= 0).map(i => i + 1));
const [feature, platform] = args.filter((a, i) => !a.startsWith('--') && !valueIdx.has(i));
if (!feature || !platform || !(PLATFORMS as readonly string[]).includes(platform)) {
  console.error('Usage: node scripts/ebug-defaults.ts <product>/<feature> <ios|android> [--json] [--exclude <batch>] [--before <batch>]');
  process.exit(2);
}

const root = join(LIBRARY, feature, platform, 'ebugs');
const batches = existsSync(root) ? readdirSync(root).filter(b => !b.startsWith('.') && b !== exclude && (!before || b < before)) : [];
const filed = batches
  .filter(b => existsSync(join(root, b, 'filed_bugcodes.json')))
  .map(b => ({ batch: b, data: JSON.parse(readFileSync(join(root, b, 'filed_bugcodes.json'), 'utf8')) as Filed }))
  .sort((a, b) => (a.data.meta?.filed_on ?? '').localeCompare(b.data.meta?.filed_on ?? '') || a.batch.localeCompare(b.batch));

const last = filed.at(-1);
if (!last) {
  const none = { found: false, feature, platform, note: 'no filed batch yet — ask for Creator, TRCode, source tag and method' };
  console.log(json ? JSON.stringify(none) : none.note);
  process.exit(0);
}

const m = last.data.meta ?? {};
const tags = (last.data.bugs ?? []).map(b => /^\S+ \S+ - \[([A-Za-z-]+)\]/.exec(b.short ?? '')?.[1]).filter(Boolean) as string[];
const tag = tags.sort((a, b) => tags.filter(t => t === b).length - tags.filter(t => t === a).length)[0] ?? '';
const method = (m.method ?? '').toLowerCase().startsWith('api') ? 'API' : m.method === 'browser-form' ? 'Browser form' : (m.method ?? '');
const out = {
  found: true,
  from: last.batch,
  filed_on: m.filed_on ?? '',
  creator: m.creator ?? '',
  tr: m.tr ?? '',
  tag,
  method,
  version: m.version ?? '',
  build: m.build ?? '',
  server: m.server ?? '',
  bugs: (last.data.bugs ?? []).length,
  first: last.data.bugs?.[0]?.bugcode ?? '',
  last: last.data.bugs?.at(-1)?.bugcode ?? '',
};

if (json) console.log(JSON.stringify(out));
else {
  console.log(`Filing defaults for ${feature}/${platform} — from ${out.from} (filed ${out.filed_on}) — confirm before filing`);
  console.log(`  Creator     ${out.creator}`);
  console.log(`  TRCode      ${out.tr}  (filed for ${out.version} build ${out.build}; "Same TR" / "Same build" = this TR when the build matches)`);
  console.log(`  Source tag  [${out.tag}]`);
  console.log(`  Method      ${out.method}`);
  console.log(`  Batch       ${out.bugs} bug(s), ${out.first} … ${out.last}`);
}
