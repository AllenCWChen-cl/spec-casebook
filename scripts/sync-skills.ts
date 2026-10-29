// Copy the skills from .claude/skills/ (the copy you edit) to .codex/skills/, removing files Codex has that Claude doesn't.
// Usage: node scripts/sync-skills.ts [--check]   (--check only lists differences and exits 1 when there are any)
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CLAUDE_SKILLS, CODEX_SKILLS, skillDiffs } from './lib/skills.ts';

const diffs = skillDiffs();
if (process.argv.includes('--check')) {
  for (const d of diffs) console.log(d);
  console.log(diffs.length ? `${diffs.length} skill file(s) out of sync; run node scripts/sync-skills.ts` : 'Skills in sync.');
  process.exit(diffs.length ? 1 : 0);
}
for (const d of diffs) {
  const f = d.slice(0, d.lastIndexOf(' ('));
  if (d.endsWith(`(only in ${CODEX_SKILLS})`)) rmSync(join(CODEX_SKILLS, f));
  else { mkdirSync(dirname(join(CODEX_SKILLS, f)), { recursive: true }); copyFileSync(join(CLAUDE_SKILLS, f), join(CODEX_SKILLS, f)); }
  console.log(d.endsWith(`(only in ${CODEX_SKILLS})`) ? `removed ${f}` : `copied  ${f}`);
}
console.log(diffs.length ? `Synced ${diffs.length} file(s).` : 'Skills already in sync.');
