// Spec sets: every set of spec files received for a feature is copied into its own dated folder,
//   library/<feature>/specs/<YYYY-MM-DD>[-n]/
// with spec-set.json recording names, sizes and SHA-256. The original files are git-ignored (they are large);
// spec-set.json and the extracted text are tracked. Receiving the same set again reuses its folder.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { featureDir, specFiles, specSetHash, writeJson, type SpecFile } from './library.ts';

export type SpecSet = { feature: string; folder: string; received_at: string; spec_set_sha256: string; files: SpecFile[] };

export const specsDir = (feature: string) => join(featureDir(feature), 'specs');

export function listSpecSets(feature: string): SpecSet[] {
  const dir = specsDir(feature);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(d => existsSync(join(dir, d, 'spec-set.json')))
    .map(d => JSON.parse(readFileSync(join(dir, d, 'spec-set.json'), 'utf8')) as SpecSet)
    .sort((a, b) => a.folder.localeCompare(b.folder));
}

function today() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Copy spec files into the feature's spec library, or return the existing folder for an identical set. */
export function addSpecSet(feature: string, paths: string[]): SpecSet & { reused: boolean } {
  const files = specFiles(paths);
  const hash = specSetHash(files);
  const existing = listSpecSets(feature).find(s => s.spec_set_sha256 === hash);
  if (existing) return { ...existing, reused: true };
  let folder = today(), n = 2;
  while (existsSync(join(specsDir(feature), folder))) folder = `${today()}-${n++}`;
  const dir = join(specsDir(feature), folder);
  mkdirSync(dir, { recursive: true });
  for (const p of paths) copyFileSync(p, join(dir, basename(p)));
  const set: SpecSet = { feature, folder, received_at: new Date().toISOString(), spec_set_sha256: hash, files };
  writeJson(join(dir, 'spec-set.json'), set);
  return { ...set, reused: false };
}
