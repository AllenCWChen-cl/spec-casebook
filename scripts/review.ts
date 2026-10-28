// Serve the review page for a draft (or for the approved table) and save the reviewed result.
// Usage: node scripts/review.ts <feature> <ios|android> [--draft <id>] [--port 4387]
// Without --draft the approved table itself is opened for editing; saving creates a new version.
// Save writes library/<feature>/<platform>/cases.csv (the approved table), archives the previous
// version under history/, updates manifest.json, and regenerates cases.xlsx and cases.html.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { COLUMNS, arg, assertIds, draftsDir, readManifest, readTable, stamp, tableDir, writeJson, writeTable, type Manifest } from './lib/library.ts';
import { renderPage } from './lib/render.ts';
import { exportTable } from './lib/exporter.ts';
import { writeFeatureIndex } from './lib/feature-index.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const draftArg = arg('draft');
let port = Number(arg('port') ?? 4387);
const table = tableDir(feature, platform);
const manifest = readManifest(feature, platform);

let draftId: string, draftDir: string | null, rows: Record<string, string>[], spec: any, requirements = '', plan = '';
if (draftArg) {
  draftId = draftArg;
  draftDir = join(draftsDir(feature, platform), draftArg);
  if (!existsSync(join(draftDir, 'draft.csv'))) throw new Error(`No draft.csv in ${draftDir}`);
  rows = readTable(join(draftDir, 'draft.csv'));
  spec = JSON.parse(readFileSync(join(draftDir, 'spec.json'), 'utf8'));
  if (existsSync(join(draftDir, 'requirements.md'))) requirements = readFileSync(join(draftDir, 'requirements.md'), 'utf8');
  if (existsSync(join(draftDir, 'update-plan.md'))) plan = readFileSync(join(draftDir, 'update-plan.md'), 'utf8');
} else {
  if (!manifest) throw new Error(`No approved table for ${feature} / ${platform}; pass --draft <id>.`);
  draftId = `edit-${stamp()}`;
  draftDir = null;
  rows = readTable(join(table, 'cases.csv'));
  spec = { title: manifest.title, spec_folder: manifest.spec_folder, spec_files: manifest.spec_files, spec_set_sha256: manifest.spec_set_sha256 };
  if (existsSync(join(table, 'requirements.md'))) requirements = readFileSync(join(table, 'requirements.md'), 'utf8');
}

const previous: Record<string, Record<string, string>> = {};
if (manifest && existsSync(join(table, 'cases.csv'))) for (const r of readTable(join(table, 'cases.csv'))) previous[r.ID] = r;

const page = () => renderPage({
  mode: 'review', save: true, feature, platform, title: spec.title ?? feature, draft: draftId,
  based_on_version: manifest?.version ?? null, version: manifest?.version ?? null, approved_at: manifest?.approved_at ?? null,
  spec_files: spec.spec_files, rows, previous: draftArg ? previous : {}, requirements, update_plan: plan,
});

async function save(body: { rows: Record<string, string>[]; decisions: unknown[]; summary: string }) {
  const current = readManifest(feature, platform);
  const sameDraft = current?.draft === draftId;
  const version = current ? (sameDraft ? current.version : current.version + 1) : 1;
  const history = current?.history ?? [];
  if (current && !sameDraft && existsSync(join(table, 'cases.csv'))) {
    mkdirSync(join(table, 'history'), { recursive: true });
    copyFileSync(join(table, 'cases.csv'), join(table, 'history', `v${current.version}.csv`));
    if (existsSync(join(table, 'requirements.md'))) copyFileSync(join(table, 'requirements.md'), join(table, 'history', `v${current.version}-requirements.md`));
  }
  const clean = body.rows.map(r => Object.fromEntries(COLUMNS.map(c => [c, String(r[c] ?? '').trim()])));
  writeTable(join(table, 'cases.csv'), COLUMNS, clean);
  if (draftDir && existsSync(join(draftDir, 'requirements.md'))) copyFileSync(join(draftDir, 'requirements.md'), join(table, 'requirements.md'));
  // the control trace (REQ-038) goes with the table, so coverage-page.ts reads the approved one
  if (draftDir && existsSync(join(draftDir, 'control-trace.json'))) copyFileSync(join(draftDir, 'control-trace.json'), join(table, 'control-trace.json'));
  const now = new Date().toISOString();
  const entry = { version, approved_at: now, spec_set_sha256: spec.spec_set_sha256, draft: draftId, cases: clean.length, csv: 'cases.csv', requirements: 'requirements.md' };
  const hist = history.filter(h => h.version !== version).map(h => ({ ...h, csv: `history/v${h.version}.csv`, requirements: `history/v${h.version}-requirements.md` }));
  const m: Manifest = { feature, platform, title: spec.title ?? current?.title ?? feature, version, approved_at: now, draft: draftId,
    spec_folder: spec.spec_folder ?? current?.spec_folder, spec_files: spec.spec_files, spec_set_sha256: spec.spec_set_sha256, cases: clean.length, history: [...hist, entry] };
  writeJson(join(table, 'manifest.json'), m);
  const logDir = draftDir ?? join(table, 'history');
  writeJson(join(logDir, draftDir ? 'decisions.json' : `${draftId}-decisions.json`), { saved_at: now, version, decisions: body.decisions, summary: body.summary });
  const out = await exportTable(feature, platform);
  writeFeatureIndex(feature);
  return { version, cases: clean.length, csv: join(table, 'cases.csv'), ...out };
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url?.startsWith('/?'))) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(page()); return;
    }
    if (req.method === 'POST' && req.url === '/save') {
      let raw = ''; for await (const c of req) raw += c;
      const result = await save(JSON.parse(raw));
      console.log(`Saved version ${result.version}: ${result.cases} cases → ${result.csv}`);
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(result)); return;
    }
    res.writeHead(404); res.end('Not found');
  } catch (e: any) {
    console.error(e);
    res.writeHead(500, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: String(e?.message ?? e) }));
  }
});
server.on('error', (e: any) => {
  if (e.code === 'EADDRINUSE' && port < 4400) { port++; server.listen(port, '127.0.0.1'); } else throw e;
});
server.listen(port, '127.0.0.1');
server.on('listening', () => console.log(`Review ${feature} / ${platform} (${draftId}): http://127.0.0.1:${port}/  — Ctrl+C to stop`));
