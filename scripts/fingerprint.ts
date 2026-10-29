// Compare spec files with the approved table for a feature and platform.
// Usage: node scripts/fingerprint.ts <product>/<feature> <ios|android> <spec file> [more spec files...]
// Prints JSON: status NEW (no approved table), SAME (identical spec set) or CHANGED.
import { assertIds, readManifest, specFiles, specSetHash } from './lib/library.ts';

const [feature, platform, ...paths] = process.argv.slice(2);
if (!feature || !platform || !paths.length) {
  console.error('Usage: node scripts/fingerprint.ts <product>/<feature> <ios|android> <spec file> [...]');
  process.exit(2);
}
assertIds(feature, platform);
const files = specFiles(paths);
const set = specSetHash(files);
const m = readManifest(feature, platform);
if (!m) {
  console.log(JSON.stringify({ status: 'NEW', feature, platform, spec_set_sha256: set, spec_files: files }, null, 2));
} else {
  const known = new Map(m.spec_files.map(f => [f.sha256, f.name]));
  const now = new Set(files.map(f => f.sha256));
  console.log(JSON.stringify({
    status: set === m.spec_set_sha256 ? 'SAME' : 'CHANGED',
    feature, platform,
    approved: { version: m.version, approved_at: m.approved_at, cases: m.cases, title: m.title },
    unchanged_files: files.filter(f => known.has(f.sha256)).map(f => f.name),
    new_or_changed_files: files.filter(f => !known.has(f.sha256)).map(f => f.name),
    files_no_longer_supplied: m.spec_files.filter(f => !now.has(f.sha256)).map(f => f.name),
    spec_set_sha256: set,
  }, null, 2));
}
