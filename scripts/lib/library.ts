// Paths, columns and manifest handling for the approved-table library.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecords, writeRecords } from './csv.ts';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const LIBRARY = join(ROOT, 'library');

/** Columns of an approved table, in order. */
export const COLUMNS = ['ID', 'Section', 'Precondition', 'Action', 'Expected Result', 'Priority', 'Spec Ref', 'Notes'];
/** Extra columns a draft may carry while it is under review. They are never stored in the approved table. */
export const DRAFT_COLUMNS = [...COLUMNS, 'Change', 'Change Reason'];
export const CHANGES = ['new', 'modified', 'removed', 'unchanged'];
export const PLATFORMS = ['ios', 'android'];

export type SpecFile = { name: string; sha256: string; bytes: number };
export type HistoryEntry = { version: number; approved_at: string; spec_set_sha256: string; draft: string; cases: number; csv: string; requirements: string };
export type Manifest = {
  feature: string; platform: string; title: string;
  version: number; approved_at: string; draft: string;
  spec_folder?: string; spec_files: SpecFile[]; spec_set_sha256: string;
  cases: number; history: HistoryEntry[];
};

export function assertIds(feature: string, platform: string) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(feature)) throw new Error(`Feature id must be kebab-case, for example ai-mini-drama (got "${feature}").`);
  if (!PLATFORMS.includes(platform)) throw new Error(`Platform must be one of ${PLATFORMS.join(', ')} (got "${platform}").`);
}

export const featureDir = (feature: string) => join(LIBRARY, feature);
export const tableDir = (feature: string, platform: string) => join(LIBRARY, feature, platform);
export const draftsDir = (feature: string, platform: string) => join(tableDir(feature, platform), 'drafts');

export function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function specFiles(paths: string[]): SpecFile[] {
  return paths.map(p => {
    if (!existsSync(p)) throw new Error(`Spec file not found: ${p}`);
    return { name: basename(p), sha256: sha256File(p), bytes: statSync(p).size };
  }).sort((a, b) => a.sha256.localeCompare(b.sha256));
}

/** One hash for the whole set of spec files, independent of their order and file names. */
export function specSetHash(files: SpecFile[]): string {
  return createHash('sha256').update(files.map(f => f.sha256).sort().join('\n')).digest('hex');
}

export function readManifest(feature: string, platform: string): Manifest | null {
  const p = join(tableDir(feature, platform), 'manifest.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

// Large generated lists (inventory, control trace, overrides): one record per line keeps the file small and its git
// diffs line-sized; nested objects (e.g. inventory "files") stay on one line each.
export function writeJsonRows(path: string, data: Record<string, unknown>) {
  mkdirSync(dirname(path), { recursive: true });
  const keys = Object.keys(data);
  const body = keys.map((k, i) => {
    const v = data[k], comma = i < keys.length - 1 ? ',' : '';
    if (Array.isArray(v) && v.length) return `  ${JSON.stringify(k)}: [\n${v.map(x => `    ${JSON.stringify(x)}`).join(',\n')}\n  ]${comma}`;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sub = Object.entries(v as Record<string, unknown>);
      return `  ${JSON.stringify(k)}: {\n${sub.map(([sk, sv], j) => `    ${JSON.stringify(sk)}: ${JSON.stringify(sv)}${j < sub.length - 1 ? ',' : ''}`).join('\n')}\n  }${comma}`;
    }
    return `  ${JSON.stringify(k)}: ${JSON.stringify(v)}${comma}`;
  });
  writeFileSync(path, `{\n${body.join('\n')}\n}\n`);
}

export function readTable(path: string) {
  return readRecords(readFileSync(path, 'utf8'));
}

export function writeTable(path: string, columns: string[], rows: Record<string, string>[]) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, writeRecords(columns, rows));
}

export function stamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export function arg(name: string, argv = process.argv): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
}
