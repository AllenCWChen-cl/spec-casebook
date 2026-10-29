// Has the Figma changed since it was read? One small use_figma call per Figma file instead of re-reading every board
// group (Figma MCP has a small quota; user, 2026-10-29). Board fingerprints come from scripts/figma/inventory.js:
// every group read records one hash per board, and the check call returns the current hash of every board the saved
// groups cover, plus the boards on the page that no group covers yet.
// Usage: node scripts/figma-check.ts <feature> [<spec-set folder>] [command]
//   (none)            writes extracted/figma-check/<role>.js, one check call per Figma file (role = design / pm / mx
//                     from figma-frames.json), and prints which MCP server runs each; the agent passes the file as
//                     `code` to use_figma (read-only) and saves the returned JSON verbatim as figma-check/<role>.json
//   --compare         compares those results with extracted/figma-hashes.json (committed: the baseline everyone
//                     shares) and writes extracted/figma-check.json; prints FIGMA: UNCHANGED or FIGMA: CHANGED with
//                     the groups to re-read (their calls are written as figma-check/reread-<group>.js), the new
//                     boards and the screenshots to re-capture; exit 0 unchanged, 10 changed
//   --ack <id,…>      new boards that are not part of the spec (scratch frames): stop reporting them
//   --shot <png> <board id>   shrinks a saved board screenshot (extracted/figma/<png>) to 256 colours and records it
//                     with the board's current hash
//   --prune [--dry-run]       deletes screenshots in extracted/figma/ that shots.json does not list (or every one when
//                     the set is SUPERSEDED), so a re-captured board leaves one file, never an old copy beside it
// Every run first takes the hashes of group files read after the baseline (a re-read clears its boards' change).
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { arg, assertIds, featureDir, ROOT, writeJson } from './lib/library.ts';
import { listSpecSets } from './lib/specs.ts';

const [feature, maybeSet] = process.argv.slice(2);
if (!feature) { console.error('Usage: node scripts/figma-check.ts <feature> [<spec-set folder>] [--compare | --ack <ids> | --shot <png> <board> | --prune]'); process.exit(2); }
assertIds(feature, 'ios');
const specs = join(featureDir(feature), 'specs');
const hasGroups = (set: string) => existsSync(join(specs, set, 'extracted')) && readdirSync(join(specs, set, 'extracted')).some(f => /^figma-inventory-.+\.json$/.test(f));
const set = maybeSet && !maybeSet.startsWith('--') ? maybeSet : listSpecSets(feature).map(s => s.folder).reverse().find(hasGroups);
if (!set) { console.log('FIGMA: NO BASELINE (no spec set has figma-inventory-<group>.json; read the Figma files first)'); process.exit(1); }
const ex = join(specs, set, 'extracted'), checkDir = join(ex, 'figma-check'), shotDir = join(ex, 'figma');
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const has = (f: string) => process.argv.includes(`--${f}`);

// groups: what each board group file read, and the exact entries to read it again
type Group = { name: string; file: string; page: string; entries: any[]; ids: string[]; hash?: Record<string, string>; hashed_at?: string };
const groups: Group[] = readdirSync(ex).filter(f => /^figma-inventory-.+\.json$/.test(f) && !f.endsWith('-boards.json')).sort().map(f => {
  const g = read(join(ex, f));
  // older reads lack `entries`: rebuild them from the boards (a region id is "<parent>/<name>", its box is saved)
  const entries = g.entries ?? g.boards.map((b: any[]) => b[0].includes('/') ? { name: b[1], parent: b[0].split('/')[0], box: b.slice(2, 6) } : { id: b[0], name: b[1] });
  return { name: f.replace(/^figma-inventory-|\.json$/g, ''), file: g.file, page: g.page, entries, ids: g.boards.map((b: any[]) => b[0]), hash: g.hash, hashed_at: g.hashed_at };
});
const groupOf = new Map(groups.flatMap(g => g.ids.map(id => [id, g.name] as [string, string])));

// which Figma file is which: figma-frames.json names the design / pm / mx file keys; design reads go through
// figma-design (qa-dm), the PM and MX files through figma-pm (qa1)
const frames = existsSync(join(ex, 'figma-frames.json')) ? read(join(ex, 'figma-frames.json')) : { files: {} };
const roleOf = (key: string) => Object.entries<any>(frames.files ?? {}).find(([, f]) => f.fileKey === key)?.[0] ?? key;
const serverOf = (role: string) => role === 'design' ? 'figma-design' : role === 'pm' || role === 'mx' ? 'figma-pm' : '(unknown: add the file to figma-frames.json files)';
const files = [...new Map(groups.map(g => [`${g.file} ${g.page}`, { key: g.file, page: g.page, role: roleOf(g.file) }])).values()];
const tag = (f: { role: string; page: string }) => files.filter(x => x.role === f.role).length > 1 ? `${f.role}-${f.page.replace(':', '-')}` : f.role;

const storePath = join(ex, 'figma-hashes.json');
const store: any = existsSync(storePath) ? read(storePath) : { boards: {}, files: {} };
// a group read after the stored hash replaces it (and settles a change the last check found)
let absorbed = 0;
for (const g of groups) if (g.hash && g.hashed_at) for (const [id, h] of Object.entries(g.hash)) {
  const b = store.boards[id];
  if (!b || b.at < g.hashed_at) { store.boards[id] = { hash: h, at: g.hashed_at, group: g.name }; absorbed++; }
}
const shotsPath = join(shotDir, 'shots.json');
const shots: Record<string, any> = existsSync(shotsPath) ? read(shotsPath) : {};
// a check call stops after the hash block (the group-mode code below it is never reached), which keeps it small
const code = (page: string, boards: any) => {
  const src = readFileSync(join(ROOT, 'scripts', 'figma', 'inventory.js'), 'utf8')
    .replace('const PAGE = __PAGE__, BOARDS = __BOARDS__;', `const PAGE = ${JSON.stringify(page)}, BOARDS = ${JSON.stringify(boards)};`);
  return boards.hash ? src.slice(0, src.indexOf('\nfor (const e of BOARDS) {')).split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n') + '\n' : src;
};
const save = () => { if (Object.keys(store.boards).length) writeJson(storePath, store); };
const rel = (p: string) => p.slice(ROOT.length + 1);

if (has('ack')) {
  const ids = (arg('ack') ?? '').split(',').filter(Boolean);
  for (const f of Object.values<any>(store.files)) f.acked = [...new Set([...(f.acked ?? []), ...ids])];
  save(); console.log(`Acknowledged ${ids.length} board(s) as not part of the spec`);
} else if (has('shot')) {
  const i = process.argv.indexOf('--shot'), png = process.argv[i + 1], id = process.argv[i + 2];
  if (!png || !id || !existsSync(join(shotDir, png))) { console.error(`--shot <png in ${rel(shotDir)}> <board id>`); process.exit(2); }
  // committed images stay small (user, 2026-10-29): 256 colours, no dithering, keeps the size and 1 px = 1 pt
  // (a Figma board is flat UI; about a fifth of the size). Needs Python 3 with Pillow, else the file is kept as is.
  const before = statSync(join(shotDir, png)).size;
  const q = spawnSync('python3', ['-c', `import sys; from PIL import Image
im = Image.open(sys.argv[1]); a = im.getchannel('A').getextrema()[0] if im.mode in ('RGBA', 'LA') else 255
if im.mode != 'P': (im.convert('RGBA') if a < 255 else im.convert('RGB')).quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(sys.argv[1], optimize=True)`, join(shotDir, png)], { encoding: 'utf8' });
  if (q.status !== 0) console.log(`${png}: not shrunk (python3 with Pillow needed: pip3 install pillow)`);
  else console.log(`${png}: ${Math.round(before / 1024)} KB → ${Math.round(statSync(join(shotDir, png)).size / 1024)} KB`);
  shots[png] = { board: id, group: groupOf.get(id) ?? null, hash: store.boards[id]?.hash ?? null, captured_at: new Date().toISOString() };
  writeJson(shotsPath, shots); console.log(`${png}: recorded for board ${id} (hash ${shots[png].hash ?? 'none yet'})`);
} else if (has('prune')) {
  const superseded = existsSync(join(specs, set, 'SUPERSEDED.md'));
  const extra = existsSync(shotDir) ? readdirSync(shotDir).filter(f => /\.(png|jpe?g)$/i.test(f) && (superseded || !shots[f])) : [];
  for (const f of extra) { if (!has('dry-run')) rmSync(join(shotDir, f)); console.log(`${has('dry-run') ? 'would delete' : 'deleted'} ${rel(join(shotDir, f))}`); }
  if (superseded && !has('dry-run') && existsSync(shotsPath)) rmSync(shotsPath);
  console.log(`${extra.length} screenshot(s) ${has('dry-run') ? 'to prune' : 'pruned'}${superseded ? ' (superseded set)' : ''}`);
} else if (has('compare')) {
  const report: any = { checked_at: '', set, unchanged: [], changed: [], removed: [], baseline: [], new_boards: [], reread: [], shots: [] };
  const missing = files.filter(f => !existsSync(join(checkDir, `${tag(f)}.json`)));
  if (missing.length) { console.error(`No result for ${missing.map(tag).join(', ')}: run the figma-check/<role>.js calls first`); process.exit(2); }
  for (const f of files) {
    const res = read(join(checkDir, `${tag(f)}.json`));
    if (res.mode !== 'hash') { console.error(`${tag(f)}.json is not a check result (mode: hash)`); process.exit(2); }
    report.checked_at = res.hashed_at;
    for (const [id, h] of res.boards as [string, string | null][]) {
      const b = store.boards[id], row = { id, group: groupOf.get(id) };
      if (h === null) report.removed.push(row);
      else if (!b) { store.boards[id] = { hash: h, at: res.hashed_at, group: groupOf.get(id), from: 'check' }; report.baseline.push(row); }
      else if (b.hash === h) { delete b.changed; report.unchanged.push(row); }
      else { b.changed = { hash: h, at: res.hashed_at }; report.changed.push(row); }
    }
    const fs = store.files[tag(f)] ??= { key: f.key, page: f.page };
    const known = new Set([...(fs.others ?? []), ...(fs.acked ?? [])]);
    if (!fs.others) fs.others = (res.others as string[][]).map(([id]) => id); // first check: what is there now is the baseline
    else report.new_boards.push(...(res.others as string[][]).filter(([id]) => !known.has(id)).map(([id, name]) => ({ id, name, file: tag(f) })));
    fs.checked_at = res.hashed_at;
  }
  // re-read calls for every group with a changed or removed board
  const stale = new Set([...report.changed, ...report.removed].map((r: any) => r.group).filter(Boolean));
  for (const g of groups.filter(g => stale.has(g.name))) {
    mkdirSync(checkDir, { recursive: true });
    const p = join(checkDir, `reread-${g.name}.js`);
    writeFileSync(p, code(g.page, g.entries));
    report.reread.push({ group: g.name, server: serverOf(roleOf(g.file)), code: rel(p), save_as: rel(join(ex, `figma-inventory-${g.name}.json`)) });
  }
  for (const [png, s] of Object.entries<any>(shots)) {
    const b = store.boards[s.board];
    if (b?.changed || (s.hash && b && s.hash !== b.hash)) report.shots.push({ png, board: s.board });
  }
  const orphans = existsSync(shotDir) ? readdirSync(shotDir).filter(f => /\.(png|jpe?g)$/i.test(f) && !shots[f]) : [];
  save(); writeJson(join(ex, 'figma-check.json'), report);
  const changed = report.changed.length + report.removed.length + report.new_boards.length;
  console.log(`${changed ? 'FIGMA: CHANGED' : 'FIGMA: UNCHANGED'} — ${set}: ${report.unchanged.length} unchanged, ${report.changed.length} changed, ${report.removed.length} removed, ${report.new_boards.length} new, ${report.baseline.length} baselined now${absorbed ? `, ${absorbed} hash(es) taken from re-read groups` : ''}`);
  for (const r of report.reread) console.log(`  re-read ${r.group} via ${r.server}: ${r.code} → ${r.save_as}`);
  for (const n of report.new_boards) console.log(`  new board ${n.id} 「${n.name}」 in ${n.file}: add it to a group or --ack it`);
  for (const s of report.shots) console.log(`  re-capture ${s.png} (board ${s.board}), then --shot ${s.png} ${s.board}`);
  if (orphans.length) console.log(`  ${orphans.length} screenshot(s) not in shots.json (${orphans.join(', ')}): record them with --shot or delete them with --prune`);
  if (report.baseline.length && !report.unchanged.length && !report.changed.length) console.log('  first check: the hashes are the baseline from now on; changes made before today were not compared');
  process.exit(changed ? 10 : 0);
} else {
  if (absorbed) save();
  mkdirSync(checkDir, { recursive: true });
  for (const f of files) {
    const entries = groups.filter(g => g.file === f.key && g.page === f.page).flatMap(g => g.entries);
    const p = join(checkDir, `${tag(f)}.js`);
    writeFileSync(p, code(f.page, { hash: entries }));
    console.log(`${tag(f)}: ${entries.length} boards — use_figma on ${serverOf(f.role)} (fileKey ${f.key}), code ${rel(p)}, save the result as ${rel(join(checkDir, `${tag(f)}.json`))}`);
  }
  console.log(`Then: node scripts/figma-check.ts ${feature} ${set} --compare`);
}
