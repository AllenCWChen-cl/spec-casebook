// Validate a draft (or the approved table) before review.
// Usage: node scripts/check.ts <feature> <ios|android> [--draft <id>]
// Besides the table itself it checks the analysis coverage (skill: "Coverage passes", "Standing inputs"):
// - every Design flow arrow in specs/<set>/extracted/arrows.json has a requirement in requirements.md;
// - a requirement is covered by a row's Spec Ref, or by "Walked by: TC-…" naming an active row;
// - every open "table" entry of library/<feature>/requests.md for this platform is cited in requirements.md;
// - the "Job states" grid in requirements.md has no empty cell and names only existing, active rows.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHANGES, COLUMNS, arg, assertIds, draftsDir, featureDir, readManifest, readTable, tableDir } from './lib/library.ts';
import { parseCsv } from './lib/csv.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const draft = arg('draft');
const dir = draft ? join(draftsDir(feature, platform), draft) : tableDir(feature, platform);
const csv = join(dir, draft ? 'draft.csv' : 'cases.csv');
const errors: string[] = [], warnings: string[] = [];
if (!existsSync(csv)) { console.error(`Missing ${csv}`); process.exit(1); }
const header = parseCsv(readFileSync(csv, 'utf8'))[0].map(h => h.trim());
for (const c of COLUMNS) if (!header.includes(c)) errors.push(`Missing column "${c}"`);
const rows = readTable(csv);
const reqPath = join(dir, 'requirements.md');
const reqText = existsSync(reqPath) ? readFileSync(reqPath, 'utf8') : null;
const reqIds = reqText ? new Set(reqText.match(/\bR-\d{3,}\b/g) ?? []) : null;
if (!reqIds) warnings.push('No requirements.md next to the table; Spec Ref cannot be checked.');
const seen = new Set<string>();
rows.forEach((r, i) => {
  const at = `row ${i + 2}${r.ID ? ` (${r.ID})` : ''}`;
  if (!r.ID) errors.push(`${at}: empty ID`);
  else if (seen.has(r.ID)) errors.push(`${at}: duplicate ID`);
  seen.add(r.ID);
  if (r.Change === 'removed') return;
  if (!r.Action) errors.push(`${at}: empty Action`);
  if (!r['Expected Result']) errors.push(`${at}: empty Expected Result`);
  if (!r.Section) warnings.push(`${at}: empty Section`);
  if (r.Priority && !/^P[1-3]$/.test(r.Priority)) warnings.push(`${at}: Priority should be P1, P2 or P3`);
  if (!r['Spec Ref']) errors.push(`${at}: empty Spec Ref (every case must trace to a requirement)`);
  else if (reqIds) for (const id of r['Spec Ref'].match(/\bR-\d{3,}\b/g) ?? []) if (!reqIds.has(id)) errors.push(`${at}: Spec Ref ${id} is not in requirements.md`);
  if (draft && r.Change && !CHANGES.includes(r.Change)) errors.push(`${at}: Change must be one of ${CHANGES.join(', ')}`);
});
const active = new Set(rows.filter(r => r.Change !== 'removed').map(r => r.ID));
const tcRefs = (s: string) => {
  const out: string[] = [];
  for (const m of s.matchAll(/\bTC-(\d{3,})(?:\s*[–-]\s*TC-(\d{3,}))?/g)) {
    const a = +m[1], b = m[2] ? +m[2] : a;
    for (let n = a; n <= b; n++) out.push(`TC-${String(n).padStart(m[1].length, '0')}`);
  }
  return out;
};

if (reqText && reqIds) {
  // Requirements covered by a Spec Ref or by "Walked by: TC-…".
  const used = new Set(rows.filter(r => r.Change !== 'removed').flatMap(r => r['Spec Ref']?.match(/\bR-\d{3,}\b/g) ?? []));
  for (const line of reqText.split('\n')) {
    const id = line.match(/^- (R-\d{3,})\b/)?.[1];
    const walked = line.match(/Walked by: ([^.]*)/)?.[1];
    if (!id || !walked) continue;
    const by = tcRefs(walked);
    if (!by.length) errors.push(`${id}: "Walked by" names no case`);
    for (const tc of by) if (!active.has(tc)) errors.push(`${id}: walked by ${tc}, which is not an active row`);
    if (by.some(tc => active.has(tc))) used.add(id);
  }
  const unused = [...reqIds].filter(id => !used.has(id) && !new RegExp(`^- ${id}\\b.*NOT TESTABLE`, 'm').test(reqText));
  if (unused.length) warnings.push(`Requirements with no case: ${unused.join(', ')} (fine only if each is marked not testable in requirements.md)`);

  // Flow arrows of the spec set.
  const specFolder = draft
    ? JSON.parse(readFileSync(join(dir, 'spec.json'), 'utf8')).spec_folder
    : readManifest(feature, platform)?.spec_folder;
  const arrowsPath = specFolder ? join(featureDir(feature), specFolder, 'extracted', 'arrows.json') : '';
  if (arrowsPath && existsSync(arrowsPath)) {
    const arrows: { arrow: string }[] = JSON.parse(readFileSync(arrowsPath, 'utf8')).arrows;
    const missing = arrows.filter(a => !reqText.includes(`flow arrow ${a.arrow} `)).map(a => a.arrow);
    if (missing.length) errors.push(`Flow arrows with no requirement (${missing.length}): ${missing.join(', ')}`);
  } else warnings.push(`No arrows.json for ${specFolder ?? 'this spec set'}: flow-arrow coverage not checked (coverage pass 1 writes it)`);

  // Request ledger.
  const ledgerPath = join(featureDir(feature), 'requests.md');
  if (existsSync(ledgerPath)) {
    for (const line of readFileSync(ledgerPath, 'utf8').split('\n')) {
      const cells = line.split('|').map(c => c.trim());
      if (!/^REQ-\d{3,}$/.test(cells[1] ?? '')) continue;
      const [, id, , , , kind, plat, status] = cells;
      if (kind !== 'table' || /^superseded/i.test(status) || !(plat === 'both' || plat === platform)) continue;
      if (/not started/i.test(status)) continue;
      if (!new RegExp(`\\b${id}\\b`).test(reqText)) errors.push(`Request ${id} (table, ${plat}) is not cited in requirements.md`);
    }
  } else warnings.push(`No library/${feature}/requests.md: request ledger not checked`);

  // Job-state grid.
  const grid = reqText.match(/\n#+ Job states\n[\s\S]*?\n(\|[^\n]*\n(?:\|[^\n]*\n?)+)/)?.[1];
  if (!grid) warnings.push('No "Job states" grid in requirements.md (coverage pass 2)');
  else {
    const [head, , ...body] = grid.trim().split('\n').map(l => l.split('|').slice(1, -1).map(c => c.trim()));
    for (const r of body) r.forEach((cell, i) => {
      if (!cell) errors.push(`Job states: empty cell "${r[0]}" × "${head[i]}" (name the rows, or n/a with the reason)`);
      for (const tc of tcRefs(cell)) if (!active.has(tc)) errors.push(`Job states: "${r[0]}" × "${head[i]}" names ${tc}, which is not an active row`);
    });
  }
}
console.log(JSON.stringify({ table: csv, rows: rows.length, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
