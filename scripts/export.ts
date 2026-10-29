// Regenerate the Excel and HTML views of an approved table from its cases.csv.
// Usage: node scripts/export.ts <product>/<feature> <ios|android>
import { assertIds } from './lib/library.ts';
import { exportTable } from './lib/exporter.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
console.log(JSON.stringify(await exportTable(feature, platform), null, 2));
