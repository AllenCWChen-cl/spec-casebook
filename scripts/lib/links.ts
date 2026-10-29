// Linked content (user, 2026-10-29, REQ-058): a board whose note is a link (a sheet, a doc, another Figma file) holds
// the linked content too. specs/<set>/extracted/links.json lists each link, where it sits on its board and what the
// linked page says, one item per rule or price; scripts/annotations.ts turns every item into an annotation block under
// the link line, so it is traced like any other note, and the coverage page marks each one on the board.
//   { "links": [{ "board": "mx-a-right", "at": [x, y], "node": "1057:24035", "text": "<link text>",
//                 "target": "<what it opens>", "label": "<heading on the board>", "file": "<extracted copy>",
//                 "read": "YYYY-MM-DD", "items": [{ "label": "Character · original · 6/image", "text": "<the rule in full>" }] }] }
// "at" is the link line in the board's OCR points (boards/<board>.md), so the items stack right below it; the coverage
// page draws each item's short label next to its marker, so the board reads like the table it points to.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type LinkItem = string | { label: string; text: string };
export type Link = { board: string; at: [number, number]; node?: string; text: string; target: string; label?: string; file?: string; read?: string; items: LinkItem[] };
export type LinkBlock = { id: string; board: string; x: number; y: number; low: boolean; text: string; trace: string; link: string; label: string; link_i: number; link_label: string };

export const LINK_STEP = 60;

export function readLinks(extracted: string): Link[] {
  const p = join(extracted, 'links.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).links : [];
}

/** One block per linked item, stacked under the link line, text prefixed with what the link opens. */
export const linkBlocks = (extracted: string): LinkBlock[] => readLinks(extracted).flatMap(l => l.items.map((it, i) => {
  const x = l.at[0], y = l.at[1] + LINK_STEP * (i + 1), t = typeof it === 'string' ? it : it.text;
  return { id: `${l.board}@${x},${y}`, board: l.board, x, y, low: false, text: `[link ${l.target}] ${t}`, trace: '', link: l.node ?? l.target,
    label: typeof it === 'string' ? it : it.label, link_i: i, link_label: l.label ?? l.target };
}));
