// List every approved table and any open drafts.
// Usage: node scripts/status.ts
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PLATFORMS, draftsDir, listFeatures, readManifest } from './lib/library.ts';

const out: unknown[] = [];
for (const feature of listFeatures()) {
  for (const platform of PLATFORMS) {
    const m = readManifest(feature, platform);
    const dd = draftsDir(feature, platform);
    const drafts = existsSync(dd) ? readdirSync(dd).filter(d => !d.startsWith('.')).sort() : [];
    if (!m && !drafts.length) continue;
    out.push({ feature, platform, title: m?.title, version: m?.version ?? null, approved_at: m?.approved_at ?? null, cases: m?.cases ?? 0,
      spec_files: m?.spec_files.map(f => f.name) ?? [], open_drafts: drafts.filter(d => !(m?.history ?? []).some(h => h.draft === d)) });
  }
}
console.log(JSON.stringify(out, null, 2));
