// The skills are written once under .claude/skills/ and mirrored to .codex/skills/ (Codex reads that folder).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const CLAUDE_SKILLS = '.claude/skills';
export const CODEX_SKILLS = '.codex/skills';
const IGNORED = /(^|\/)(\.DS_Store|__pycache__)(\/|$)|\.(orig|pyc)$/;

export function listFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (IGNORED.test(relative(root, p))) continue;
      if (statSync(p).isDirectory()) walk(p); else out.push(relative(root, p));
    }
  };
  walk(root);
  return out.sort();
}

// Paths (relative to the skills folder) that differ between the two copies, with why.
export function skillDiffs(): string[] {
  const src = listFiles(CLAUDE_SKILLS), dst = new Set(listFiles(CODEX_SKILLS));
  const out: string[] = [];
  for (const f of src) {
    if (!dst.has(f)) out.push(`${f} (missing in ${CODEX_SKILLS})`);
    else if (!readFileSync(join(CLAUDE_SKILLS, f)).equals(readFileSync(join(CODEX_SKILLS, f)))) out.push(`${f} (differs)`);
    dst.delete(f);
  }
  for (const f of dst) out.push(`${f} (only in ${CODEX_SKILLS})`);
  return out;
}
