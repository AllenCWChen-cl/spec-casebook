// Start a draft for a feature and platform from a set of spec files.
// Usage: node scripts/new-draft.ts <feature> <ios|android> --title "AI Mini Drama" <spec file> [...]
// Creates library/<feature>/<platform>/drafts/<stamp>/ with spec.json, and copies the spec files into the
// feature's spec library (library/<feature>/specs/<date>/) so later updates can be compared with the originals.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { arg, assertIds, draftsDir, readManifest, stamp, writeJson } from './lib/library.ts';
import { addSpecSet } from './lib/specs.ts';
import { writeFeatureIndex } from './lib/feature-index.ts';

const argv = process.argv.slice(2);
const title = arg('title', process.argv) ?? '';
const rest = argv.filter((a, i) => a !== '--title' && argv[i - 1] !== '--title');
const [feature, platform, ...paths] = rest;
if (!feature || !platform || !paths.length) {
  console.error('Usage: node scripts/new-draft.ts <feature> <ios|android> --title "<Feature name>" <spec file> [...]');
  process.exit(2);
}
assertIds(feature, platform);
const set = addSpecSet(feature, paths);
const id = stamp();
const dir = join(draftsDir(feature, platform), id);
mkdirSync(dir, { recursive: true });
const base = readManifest(feature, platform);
writeJson(join(dir, 'spec.json'), {
  feature, platform, title: title || base?.title || feature,
  draft: id, created_at: new Date().toISOString(),
  based_on_version: base?.version ?? null,
  spec_folder: `specs/${set.folder}`, spec_files: set.files, spec_set_sha256: set.spec_set_sha256,
});
writeFeatureIndex(feature);
console.log(JSON.stringify({ draft: id, dir, spec_folder: `library/${feature}/specs/${set.folder}`, based_on_version: base?.version ?? null,
  next: ['Write requirements.md in the draft folder', 'Write draft.csv in the draft folder', `node scripts/check.ts ${feature} ${platform} --draft ${id}`, `node scripts/review.ts ${feature} ${platform} --draft ${id}`] }, null, 2));
