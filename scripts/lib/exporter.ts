// Regenerate cases.xlsx and cases.html from the approved cases.csv.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { COLUMNS, readManifest, readTable, tableDir } from './library.ts';
import { renderPage } from './render.ts';

const WIDTHS: Record<string, number> = { ID: 11, Section: 20, Precondition: 30, Action: 48, 'Expected Result': 48, Priority: 9, 'Spec Ref': 16, Notes: 30 };

export async function exportTable(feature: string, platform: string) {
  const dir = tableDir(feature, platform);
  const m = readManifest(feature, platform);
  if (!m) throw new Error(`No approved table for ${feature} / ${platform}`);
  const rows = readTable(join(dir, 'cases.csv'));
  const wb = new ExcelJS.Workbook();
  wb.creator = 'spec-casebook';
  const ws = wb.addWorksheet('Cases', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = COLUMNS.map(c => ({ header: c, key: c, width: WIDTHS[c] ?? 20 }));
  rows.forEach(r => ws.addRow(r));
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F3B52' } };
  ws.eachRow(row => row.eachCell(cell => { cell.alignment = { wrapText: true, vertical: 'top' }; }));
  ws.autoFilter = { from: 'A1', to: { row: 1, column: COLUMNS.length } };
  const info = wb.addWorksheet('Info');
  info.columns = [{ width: 22 }, { width: 90 }];
  [['Feature', m.title], ['Feature ID', m.feature], ['Platform', platform === 'ios' ? 'iOS' : 'Android'], ['Version', String(m.version)],
   ['Approved', m.approved_at], ['Cases', String(rows.length)], ['Spec set SHA-256', m.spec_set_sha256],
   ...m.spec_files.map(f => ['Spec file', `${f.name}  (${f.sha256})`])].forEach(r => info.addRow(r));
  info.getColumn(1).font = { bold: true };
  await wb.xlsx.writeFile(join(dir, 'cases.xlsx'));
  const reqPath = join(dir, 'requirements.md');
  writeFileSync(join(dir, 'cases.html'), renderPage({
    mode: 'view', save: false, feature, platform, title: m.title, draft: m.draft, based_on_version: null,
    version: m.version, approved_at: m.approved_at, spec_files: m.spec_files, rows, previous: {},
    requirements: existsSync(reqPath) ? readFileSync(reqPath, 'utf8') : '', update_plan: '',
    zh: existsSync(join(dir, 'cases.zh.json')) ? JSON.parse(readFileSync(join(dir, 'cases.zh.json'), 'utf8')) : {},
  }));
  return { xlsx: join(dir, 'cases.xlsx'), html: join(dir, 'cases.html'), cases: rows.length };
}
