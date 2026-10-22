// Copy a set of spec files into the feature's spec library (library/<feature>/specs/<date>/).
// Usage: node scripts/add-spec.ts <feature> <spec file> [...]
import { assertIds } from './lib/library.ts';
import { addSpecSet } from './lib/specs.ts';
import { writeFeatureIndex } from './lib/feature-index.ts';

const [feature, ...paths] = process.argv.slice(2);
if (!feature || !paths.length) { console.error('Usage: node scripts/add-spec.ts <feature> <spec file> [...]'); process.exit(2); }
assertIds(feature, 'ios');
const set = addSpecSet(feature, paths);
writeFeatureIndex(feature);
console.log(JSON.stringify({ folder: `library/${feature}/specs/${set.folder}`, reused: set.reused, files: set.files.map(f => f.name), spec_set_sha256: set.spec_set_sha256 }, null, 2));
