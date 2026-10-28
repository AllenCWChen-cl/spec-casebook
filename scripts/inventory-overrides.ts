// Merge the review sheets' findings into the inventory overrides (REQ-038 / REQ-040).
// Usage: node scripts/inventory-overrides.ts <feature> <spec-set folder> [--dry]
// Reads specs/<set>/extracted/inventory-review-*.json (one per board group, written by the reviewers of
// inventory-sheets.ts) and merges their missing / not_tappable / drop_screens lists into
// specs/<set>/extracted/inventory-overrides.json (add / drop / hide / drop_screens; a not_tappable entry naming a
// screen hides the control on that screen only), keeping entries already there and
// skipping duplicates and review files already merged (`merged`). "unsure" items are listed, not applied: decide them and add them by hand. Then re-run
// scripts/inventory.ts, scripts/controls.ts and coverage-page.ts.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertIds, featureDir, writeJsonRows } from './lib/library.ts';

const [feature, folder] = process.argv.slice(2);
if (!feature || !folder) { console.error('Usage: node scripts/inventory-overrides.ts <feature> <spec-set folder> [--dry]'); process.exit(2); }
assertIds(feature, 'ios');
const ex = join(featureDir(feature), 'specs', folder, 'extracted');
const path = join(ex, 'inventory-overrides.json');
const ov = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
ov.add ??= []; ov.drop ??= []; ov.drop_screens ??= []; ov.hide ??= []; ov.merged ??= [];
const inv = JSON.parse(readFileSync(join(ex, 'inventory.json'), 'utf8'));
const screens = new Set(inv.screens.map((s: any) => s.id)), controls = new Set(inv.controls.map((c: any) => c.id));
const unsure: string[] = [], bad: string[] = [];
let added = 0, dropped = 0, droppedScreens = 0, hidden = 0;
// a review file is merged once: later curation of the adds (canonical labels, removed duplicates) is not undone
for (const f of readdirSync(ex).filter(f => /^inventory-review-.+\.json$/.test(f) && !ov.merged.includes(f)).sort()) {
  ov.merged.push(f);
  const r = JSON.parse(readFileSync(join(ex, f), 'utf8')), src = f.replace(/^inventory-review-|\.json$/g, '');
  for (const m of r.missing ?? []) {
    if (!screens.has(m.screen) || !Array.isArray(m.box) || m.box.length !== 4) { bad.push(`${src}: missing ${m.label} (screen ${m.screen})`); continue; }
    const dup = ov.add.some((a: any) => a.screen === m.screen && a.label === m.label && a.box.every((v: number, i: number) => Math.abs(v - m.box[i]) < 12));
    if (dup) continue;
    ov.add.push({ screen: m.screen, ...(m.screens?.length ? { screens: m.screens.filter((s: string) => screens.has(s)) } : {}), label: m.label, box: m.box.map(Math.round),
      kind: ['button', 'input', 'toggle', 'tab', 'item'].includes(m.kind) ? m.kind : 'button', why: `${m.why} (review ${src})` });
    added++;
  }
  for (const d of r.not_tappable ?? []) {
    // covered on one screen only (behind a dimmed sheet, under a header): hide it there, keep it elsewhere
    if (d.screen) {
      const ids = (d.ids ?? [d.control]).filter((id: string) => controls.has(id));
      if (!ids.length || !screens.has(d.screen)) { bad.push(`${src}: not_tappable on ${d.screen} (no such screen or controls)`); continue; }
      if (!ov.hide.some((h: any) => h.screen === d.screen && ids.every((id: string) => h.controls.includes(id)))) { ov.hide.push({ screen: d.screen, controls: ids, why: `${d.why} (review ${src})` }); hidden++; }
      continue;
    }
    if (/behind|dimm|covered|overlay|under the header|scrolled under|occlud/i.test(d.why ?? '')) { unsure.push(`${src}: ${d.control} ${d.label ?? ''} — ${d.why} (covered somewhere but no screen given: decide by hand)`); continue; }
    if (!controls.has(d.control)) { bad.push(`${src}: not_tappable ${d.control} (no such control)`); continue; }
    if (ov.drop.some((x: any) => x.control === d.control)) continue;
    ov.drop.push({ control: d.control, why: `${d.label ? `「${d.label}」 ` : ''}${d.why} (review ${src})` }); dropped++;
  }
  for (const d of r.drop_screens ?? []) {
    if (!screens.has(d.screen)) { bad.push(`${src}: drop_screens ${d.screen} (no such screen)`); continue; }
    if (ov.drop_screens.some((x: any) => x.screen === d.screen)) continue;
    ov.drop_screens.push({ screen: d.screen, why: `${d.why} (review ${src})` }); droppedScreens++;
  }
  for (const u of r.unsure ?? []) unsure.push(`${src}: ${u.screen} ${u.what} — ${u.why}`);
}
if (!process.argv.includes('--dry')) writeJsonRows(path, ov);
console.log(JSON.stringify({ out: path, added, dropped, hidden, drop_screens: droppedScreens, totals: { add: ov.add.length, drop: ov.drop.length, hide: ov.hide.length, drop_screens: ov.drop_screens.length }, unsure, rejected: bad }, null, 1));
