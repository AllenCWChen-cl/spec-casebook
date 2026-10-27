// Annotation trace (Reading the spec, step 9; user, 2026-10-22, REQ-032): every annotation on the spec boards is traced
// to the requirements that state it, so no written rule is skipped (the 10/22 miss: PM 「只送 crop 後的圖」, read by OCR
// as low-confidence and never turned into a requirement).
// Usage: node scripts/annotations.ts <feature> <ios|android> --draft <id> [--skip <board prefix,…> --skip-reason "<why>"]
// Reads specs/<set>/extracted/boards/*.md of the draft's spec set, keeps annotation lines (Chinese text or a • bullet,
// dropping OCR noise of 3 characters or fewer), groups lines that sit together on the canvas into blocks, and writes
// <draft>/annotation-trace.json. Fill each block's `trace`:
//   R-…[, R-…]        the requirements that state everything in the block (add one when none does)
//   label: <why>      a heading, date stamp or board title with no rule in it
//   ui: <frame>       UI copy of a mockup, checked through the frame's requirements
//   older: <newer>    replaced by a newer board or frame
//   Q-n               an open question
// Traces already in this draft's file are kept; others are carried from the newest earlier draft (same board and text).
// check.ts fails a draft with an untraced block or a trace naming a requirement or question that does not exist.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg, assertIds, draftsDir, featureDir, writeJson } from './lib/library.ts';

const X_TOL = 120, Y_GAP = 140;
type Block = { id: string; board: string; x: number; y: number; low: boolean; text: string; trace: string; carried_from?: string };

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const draft = arg('draft');
if (!draft) { console.error('Usage: node scripts/annotations.ts <feature> <ios|android> --draft <id> [--skip <prefixes> --skip-reason "<why>"]'); process.exit(2); }
const drafts = draftsDir(feature, platform);
const dir = join(drafts, draft);
const outPath = join(dir, 'annotation-trace.json');
const own = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : null;
const specFolder: string = JSON.parse(readFileSync(join(dir, 'spec.json'), 'utf8')).spec_folder;
const boardsDir = join(featureDir(feature), specFolder, 'extracted', 'boards');
if (!existsSync(boardsDir)) { console.error(`No ${boardsDir}: render and OCR the boards first (spec-boards.ts)`); process.exit(1); }

const earlier = readdirSync(drafts).filter(d => d < draft && existsSync(join(drafts, d, 'annotation-trace.json'))).sort().at(-1);
const prev = earlier ? JSON.parse(readFileSync(join(drafts, earlier, 'annotation-trace.json'), 'utf8')) : null;
const skipArg = arg('skip');
const skip: string[] = skipArg ? skipArg.split(',').map(s => s.trim()).filter(Boolean) : own?.skip ?? prev?.skip ?? [];
const skipReason = arg('skip-reason') ?? own?.skip_reason ?? prev?.skip_reason ?? '';
if (skip.length && !skipReason) { console.error('--skip needs --skip-reason (why those boards are not part of the current spec)'); process.exit(2); }

const CJK = /[一-鿿]/;
const isAnnotation = (t: string) => {
  const s = t.replace('(?)', '').trim();
  if (s.replace(/[\s•·.,:：，、()（）\-–—]/g, '').length <= 3) return false;
  return CJK.test(s) || s.startsWith('•');
};
const norm = (s: string) => s.replace(/\(\?\)/g, '').replace(/\s+/g, ' ').trim();
const key = (b: { board: string; text: string }) => `${b.board}\n${norm(b.text)}`;
const kept = new Map<string, Block>((own?.blocks ?? []).map((b: Block) => [key(b), b]));
const carried = new Map<string, Block>((prev?.blocks ?? []).map((b: Block) => [key(b), b]));

const blocks: Block[] = [];
for (const file of readdirSync(boardsDir).filter(f => f.endsWith('.md')).sort()) {
  const board = file.slice(0, -3);
  if (skip.some(p => board.startsWith(p))) continue;
  const lines = readFileSync(join(boardsDir, file), 'utf8').split('\n')
    .map(l => l.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/)).filter((m): m is RegExpMatchArray => !!m && isAnnotation(m[3]))
    .map(m => ({ y: +m[1], x: +m[2], t: m[3].trim() })).sort((a, b) => a.y - b.y || a.x - b.x);
  const groups: { x: number; y: number; last: number; lines: string[] }[] = [];
  for (const l of lines) {
    const g = [...groups].reverse().find(g => Math.abs(g.x - l.x) <= X_TOL && l.y - g.last >= 0 && l.y - g.last <= Y_GAP);
    if (g) { g.lines.push(l.t); g.last = l.y; } else groups.push({ x: l.x, y: l.y, last: l.y, lines: [l.t] });
  }
  for (const g of groups) {
    const b: Block = { id: `${board}@${g.x},${g.y}`, board, x: g.x, y: g.y, low: g.lines.some(t => t.includes('(?)')), text: g.lines.join(' / '), trace: '' };
    const k = kept.get(key(b)), c = carried.get(key(b));
    if (k?.trace) Object.assign(b, { trace: k.trace, carried_from: k.carried_from });
    else if (c?.trace) Object.assign(b, { trace: c.trace, carried_from: earlier });
    blocks.push(b);
  }
}
writeJson(outPath, { spec_folder: specFolder, skip, skip_reason: skipReason, grouping: { x_tolerance: X_TOL, y_gap: Y_GAP }, blocks });
const byBoard: Record<string, string> = {};
for (const b of blocks) {
  const [t, n] = (byBoard[b.board] ?? '0/0').split('/').map(Number);
  byBoard[b.board] = `${t + (b.trace ? 1 : 0)}/${n + 1}`;
}
console.log(JSON.stringify({
  out: outPath, blocks: blocks.length, traced: blocks.filter(b => b.trace).length,
  low_confidence: blocks.filter(b => b.low).length, carried_from: earlier ?? null, skip, by_board_traced: byBoard,
}, null, 2));
