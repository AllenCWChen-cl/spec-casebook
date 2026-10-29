// Read the boards of a Figma-export spec PDF: render each board to tiles, OCR them, and merge the text.
// Usage: node scripts/spec-boards.ts <product>/<feature> <spec-set folder> [--file "<pdf name>"] [--board <id,id>] [--scale 1.5] [--jobs 3] [--reverse]
// Several runs can share the work: a board being rendered carries boards/<id>/.lock and other runs skip it.
// Needs specs/<folder>/extracted/boards.json: { "<pdf name>": [{ "id", "title", "region": [x, y, w, h] }] }
// (board regions in PDF points, read off an overview render). For each board it writes
//   extracted/boards/<id>/tiles/   rendered tiles + ocr.json (local only, git-ignored)
//   extracted/boards/<id>.md       merged OCR text in reading order with canvas coordinates (tracked)
// Steps that already have output are skipped, so the command can be re-run after an interruption.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, arg, assertIds } from './lib/library.ts';
import { specsDir } from './lib/specs.ts';

type Board = { id: string; title: string; region: [number, number, number, number] };
type OcrLine = { text: string; x: number; y: number; w: number; h: number; conf: number };

const [feature, folder] = process.argv.slice(2);
if (!feature || !folder) { console.error('Usage: node scripts/spec-boards.ts <product>/<feature> <spec-set folder> [--file <pdf>] [--board <id>] [--scale 1.5]'); process.exit(2); }
assertIds(feature, 'ios');
const dir = join(specsDir(feature), folder);
const ex = join(dir, 'extracted');
const boards: Record<string, Board[]> = JSON.parse(readFileSync(join(ex, 'boards.json'), 'utf8'));
const onlyFile = arg('file'), onlyBoard = arg('board')?.split(','), reverse = process.argv.includes('--reverse'), scale = arg('scale') ?? '1.5', jobs = Number(arg('jobs') ?? 3);
const run = (cmd: string, args: string[]) => new Promise<void>((ok, fail) => {
  const p = spawn(cmd, args, { stdio: ['ignore', 'inherit', 'ignore'] });
  p.on('exit', code => code === 0 ? ok() : fail(new Error(`${cmd} ${args[0]} exited ${code}`)));
});

function merge(lines: OcrLine[]): OcrLine[] {
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  const kept: OcrLine[] = [];
  // longest first so a full line wins over the fragment cut at a tile edge
  for (const l of [...lines].sort((a, b) => b.text.length - a.text.length)) {
    const n = norm(l.text);
    if (!n) continue;
    const dup = kept.some(k => Math.abs(k.y - l.y) < Math.max(k.h, l.h) * 0.8 && l.x < k.x + k.w + 20 && k.x < l.x + l.w + 20 && (norm(k.text).includes(n) || n.includes(norm(k.text))));
    if (!dup) kept.push(l);
  }
  // reading order: rows (y within half a line height), left to right
  kept.sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: OcrLine[][] = [];
  for (const l of kept) {
    const r = rows.find(r => Math.abs(r[0].y - l.y) < Math.max(r[0].h, l.h) * 0.5);
    r ? r.push(l) : rows.push([l]);
  }
  return rows.flatMap(r => r.sort((a, b) => a.x - b.x));
}

const work: { pdf: string; file: string; b: Board }[] = [];
for (const [file, list] of Object.entries(boards)) {
  if (onlyFile && file !== onlyFile) continue;
  for (const b of list) if (!onlyBoard || onlyBoard.includes(b.id)) work.push({ pdf: join(dir, file), file, b });
}
if (reverse) work.reverse();

async function doBoard({ pdf, file, b }: { pdf: string; file: string; b: Board }) {
  const tiles = join(ex, 'boards', b.id, 'tiles');
  mkdirSync(tiles, { recursive: true });
  const t0 = Date.now();
  const lock = join(ex, 'boards', b.id, '.lock');
  if (!existsSync(join(tiles, 'index.json'))) {
    if (existsSync(lock)) { console.log(`${b.id}: being rendered by another run, skipped`); return; }
    writeFileSync(lock, String(process.pid));
    await run('node', [join(ROOT, 'scripts', 'render-tiles.ts'), pdf, tiles, ...b.region.map(String), '--tile', '1600x1000', '--scale', scale]).finally(() => { try { unlinkSync(lock); } catch {} });
  }
  if (!existsSync(join(tiles, 'ocr.json'))) await run('swift', [join(ROOT, 'scripts', 'ocr-tiles.swift'), tiles]);
  const ocr: { file: string; lines: OcrLine[] }[] = JSON.parse(readFileSync(join(tiles, 'ocr.json'), 'utf8'));
  const lines = merge(ocr.flatMap(t => t.lines));
  const out = [`# ${b.title}`, '', `Source: ${file} · board \`${b.id}\` · region x=${b.region[0]} y=${b.region[1]} w=${b.region[2]} h=${b.region[3]} (PDF points)`,
    `OCR of rendered tiles (macOS Vision). Columns: y, x (canvas points), text; "(?)" marks low-confidence lines.`, '', '```'];
  let lastY = -1e9;
  for (const l of lines) {
    if (l.y - lastY > 150) out.push('');
    lastY = l.y;
    out.push(`${String(Math.round(l.y)).padStart(6)} ${String(Math.round(l.x)).padStart(6)}  ${l.text}${l.conf < 0.4 ? ' (?)' : ''}`);
  }
  out.push('```', '');
  writeFileSync(join(ex, 'boards', `${b.id}.md`), out.join('\n'));
  console.log(`${b.id}: ${lines.length} lines (${Math.round((Date.now() - t0) / 1000)} s)`);
}

// a small worker pool; each render is its own process, so boards run in parallel
const queue = [...work];
await Promise.all(Array.from({ length: Math.max(1, jobs) }, async () => {
  for (let w = queue.shift(); w; w = queue.shift()) {
    try { await doBoard(w); } catch (e) { console.error(`${w.b.id}: ${String(e)}`); process.exitCode = 1; }
  }
}));
