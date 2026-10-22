// Compare OCR text of PM boards between two spec sets: lines only in the new set (by normalized text), per board.
// node board-diff.ts <old boards dir> <new boards dir> <out.md>
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [oldDir, newDir, out] = process.argv.slice(2);
const norm = (s: string) => s.replace(/\(\?\)\s*$/, '').replace(/[\s•·.,，。:：;；"'“”‘’()（）\[\]［］|_-]+/g, '').toLowerCase();
const lines = (p: string) => existsSync(p) ? readFileSync(p, 'utf8').split('\n').map(l => l.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/)).filter(Boolean)
  .map(m => ({ x: +m![1], y: +m![2], text: m![3].trim() })) : [];
let md = '# PM board diff (OCR lines only in the new set; short or near-duplicate lines skipped)\n';
const ids = readdirSync(newDir).filter(f => /^pm-.*\.md$/.test(f)).map(f => f.replace(/\.md$/, ''));
for (const id of ids) {
  const o = lines(join(oldDir, `${id}.md`)), n = lines(join(newDir, `${id}.md`));
  const oldSet = new Set(o.map(l => norm(l.text)));
  const oldJoined = o.map(l => norm(l.text)).join('|');
  const added = n.filter(l => norm(l.text).length >= 4 && !oldSet.has(norm(l.text)) && !oldJoined.includes(norm(l.text)));
  const newSet = new Set(n.map(l => norm(l.text)));
  const newJoined = n.map(l => norm(l.text)).join('|');
  const gone = o.filter(l => norm(l.text).length >= 4 && !newSet.has(norm(l.text)) && !newJoined.includes(norm(l.text)));
  md += `\n## ${id} — ${n.length} lines (old ${o.length}); ${added.length} new, ${gone.length} gone\n`;
  if (added.length) md += '### New\n' + added.map(l => `- ${l.x},${l.y} ${l.text}`).join('\n') + '\n';
  if (gone.length) md += '### Gone\n' + gone.map(l => `- ${l.x},${l.y} ${l.text}`).join('\n') + '\n';
}
writeFileSync(out, md);
console.log(md.split('\n').filter(l => l.startsWith('## ')).join('\n'));
