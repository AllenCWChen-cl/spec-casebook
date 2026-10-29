// Validate a draft (or the approved table) before review.
// Usage: node scripts/check.ts <product>/<feature> <ios|android> [--draft <id>]
// Besides the table itself it checks the analysis coverage (skill: "Coverage passes", "Standing inputs"):
// - every Design flow arrow in specs/<set>/extracted/arrows.json has a requirement in requirements.md;
// - a requirement is covered by a row's Spec Ref, or by "Walked by: TC-…" naming an active row;
// - every open "table" entry of library/<product>/<feature>/requests.md for this platform is cited in requirements.md;
// - the "Job states", "Exit × stage" and "Error classes" grids in requirements.md have no empty cell and name only
//   existing, active rows (the last two from 2026-10-22, REQ-030);
// - every dated frame in specs/<set>/extracted/figma-frames.json says where it was read (REQ-030);
// - a draft traces every annotation block (annotation-trace.json) and has the "Hidden clauses" and "Variants" grids
//   for the requirements that need them (user, 2026-10-22, REQ-032);
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHANGES, COLUMNS, arg, assertIds, draftsDir, featureDir, readManifest, readTable, tableDir } from './lib/library.ts';
import { parseCsv } from './lib/csv.ts';
import { linkBlocks } from './lib/links.ts';
import { skillDiffs } from './lib/skills.ts';

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
    const arrows: { arrow: string; not_flow?: string }[] = JSON.parse(readFileSync(arrowsPath, 'utf8')).arrows;
    const missing = arrows.filter(a => !a.not_flow && !reqText.includes(`flow arrow ${a.arrow} `)).map(a => a.arrow);
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

  // Coverage grids: Job states (pass 2), Exit × stage (pass 8) and Error classes (pass 2), REQ-030.
  const checkGrid = (name: string, required: boolean) => {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const grid = reqText.match(new RegExp(`\\n#+ ${esc}\\n[\\s\\S]*?\\n(\\|[^\\n]*\\n(?:\\|[^\\n]*\\n?)+)`))?.[1];
    if (!grid) { (required ? errors : warnings).push(`No "${name}" grid in requirements.md`); return; }
    const [head, , ...body] = grid.trim().split('\n').map(l => l.split('|').slice(1, -1).map(c => c.trim()));
    for (const r of body) r.forEach((cell, i) => {
      if (!cell) errors.push(`${name}: empty cell "${r[0]}" × "${head[i]}" (name the rows, or n/a with the reason)`);
      for (const tc of tcRefs(cell)) if (!active.has(tc)) errors.push(`${name}: "${r[0]}" × "${head[i]}" names ${tc}, which is not an active row`);
    });
  };
  checkGrid('Job states', false);
  checkGrid('Exit × stage', false);
  checkGrid('Error classes', false);

  // Figma dated frames (Reading the spec, step 8): each one says where it was read.
  const figmaPath = specFolder ? join(featureDir(feature), specFolder, 'extracted', 'figma-frames.json') : '';
  if (figmaPath && existsSync(figmaPath)) {
    const frames: { label: string; read?: string }[] = JSON.parse(readFileSync(figmaPath, 'utf8')).frames ?? [];
    const unread = frames.filter(f => !f.read?.trim()).map(f => f.label);
    if (unread.length) errors.push(`Figma dated frames not read yet: ${unread.join(', ')} (figma-frames.json)`);
  } else warnings.push(`No figma-frames.json for ${specFolder ?? 'this spec set'}: Figma dated frames not compared with the PDF (Reading the spec, step 8)`);

  // Control trace (REQ-038): every tappable control of the Figma inventory is pressed by a row; inputs are also dismissed.
  const invPath = specFolder ? join(featureDir(feature), specFolder, 'extracted', 'inventory.json') : '';
  const tracePath = join(dir, 'control-trace.json');
  if (invPath && existsSync(invPath)) {
    if (!existsSync(tracePath)) (draft ? errors : warnings).push(`No control-trace.json: run node scripts/controls.ts ${feature} ${platform}${draft ? ` --draft ${draft}` : ''} and trace every control (REQ-038)`);
    else {
      const entries: { group: string; kind: string; name: string; label: string; press: string; dismiss?: string }[] = JSON.parse(readFileSync(tracePath, 'utf8')).entries;
      const untraced = entries.filter(e => !e.press?.trim());
      if (untraced.length) (draft ? errors : warnings).push(`Controls with no pressing row (${untraced.length} of ${entries.length}): ${untraced.slice(0, 8).map(e => `${e.group} ${e.name}${e.label ? ` 「${e.label.slice(0, 20)}」` : ''}`).join(', ')}${untraced.length > 8 ? ', …' : ''}`);
      const noDismiss = entries.filter(e => e.kind === 'input' && e.press?.trim() && !/^n\/a:/.test(e.press) && !e.dismiss?.trim());
      if (noDismiss.length) (draft ? errors : warnings).push(`Inputs with no dismissing row (${noDismiss.length}): ${noDismiss.slice(0, 8).map(e => e.group).join(', ')}`);
      for (const e of entries) for (const f of ['press', 'dismiss'] as const) {
        const v = e[f]?.trim() ?? '';
        if (!v || /^n\/a:\s*\S/.test(v)) continue;
        const tcs = tcRefs(v);
        if (!tcs.length) errors.push(`Control ${e.group}: ${f} must be TC-… or n/a: <why> (got "${v.slice(0, 40)}")`);
        for (const tc of tcs) if (!active.has(tc)) errors.push(`Control ${e.group}: ${f} names ${tc}, which is not an active row`);
      }
    }
  }
}

// Analysis passes that find spec rules on their own (user, 2026-10-22, REQ-032), for drafts:
// - annotation-trace.json (scripts/annotations.ts): every annotation block on the spec boards is traced;
// - "Hidden clauses" grid (pass 9): every requirement with a clause the screen does not show names how it is observed
//   and the rows that check it;
// - "Variants" grid (pass 10): a rule stated for several tiers / models / languages has a row per variant.
const HIDDEN = /\b(not run|does not run|doesn't run|reruns?|only (?:the )?failed|submit(?:ted|s)?|upload(?:ed|s)?|is sent|are sent|only the cropped|server[- ]?(?:side|configured|set)|backend|remote[- ]?config(?:ured)?|Firebase|STT|TTS|speech-to-text|kept on the device|stored on|cached|analytics)\b/i;
const TIERS = /\b(Free|Pro\+|Pro|Premium)(?![\w+])/g;
const VARIANT = /\b(?:each|every|per|all) (?:tier|language|model)s?\b|\bENU, CHT\b|\bBest \/ Standard \/ Fast\b/i;
if (draft && reqText) {
  const specFolder = JSON.parse(readFileSync(join(dir, 'spec.json'), 'utf8')).spec_folder;
  const reqLines = [...reqText.matchAll(/^- (R-\d{3,})\b(.*)$/gm)].map(m => ({ id: m[1], text: m[2] }))
    .filter(r => !/NOT TESTABLE/.test(r.text) && !/flow arrow/.test(r.text));
  const qIds = new Set(reqText.match(/\bQ-A?\d+\b/g) ?? []);

  if (existsSync(join(featureDir(feature), specFolder, 'extracted', 'boards'))) {
    const tracePath = join(dir, 'annotation-trace.json');
    if (!existsSync(tracePath)) errors.push(`No annotation-trace.json: run node scripts/annotations.ts ${feature} ${platform} --draft ${draft} and trace every block (REQ-032)`);
    else {
      const blocks: { id: string; trace: string }[] = JSON.parse(readFileSync(tracePath, 'utf8')).blocks;
      // every item of a linked table (extracted/links.json) is a block of its own (REQ-058)
      const lost = linkBlocks(join(featureDir(feature), specFolder, 'extracted')).filter(lb => !blocks.some(b => b.id === lb.id)).map(lb => lb.id);
      if (lost.length) errors.push(`Linked-table items missing from annotation-trace.json (${lost.length}): ${lost.slice(0, 5).join(', ')}; rerun node scripts/annotations.ts ${feature} ${platform} --draft ${draft}`);
      const untraced = blocks.filter(b => !b.trace?.trim()).map(b => b.id);
      if (untraced.length) errors.push(`Annotation blocks not traced (${untraced.length} of ${blocks.length}): ${untraced.slice(0, 10).join(', ')}${untraced.length > 10 ? ', …' : ''}`);
      for (const b of blocks) {
        const t = b.trace?.trim() ?? '';
        if (!t) continue;
        if (/^NEW\b/.test(t)) { errors.push(`Annotation ${b.id}: still "NEW"; write the requirement and trace the block to it`); continue; }
        if (/^(label|ui|older|held):\s*\S/.test(t)) continue;
        const rs = t.match(/\bR-\d{3,}\b/g) ?? [], qs = t.match(/\bQ-A?\d+\b/g) ?? [];
        if (!rs.length && !qs.length) errors.push(`Annotation ${b.id}: trace must be R-…, Q-n, label: / ui: / older: / held: <why> (got "${t.slice(0, 40)}")`);
        for (const r of rs) if (!reqIds?.has(r)) errors.push(`Annotation ${b.id}: ${r} is not in requirements.md`);
        for (const q of qs) if (!qIds.has(q)) errors.push(`Annotation ${b.id}: ${q} is not in requirements.md`);
      }
    }
  }

  const gridRows = (name: string) => {
    const g = reqText.match(new RegExp(`\\n#+ ${name}\\n[\\s\\S]*?\\n(\\|[^\\n]*\\n(?:\\|[^\\n]*\\n?)+)`))?.[1];
    return g ? g.trim().split('\n').slice(2).map(l => l.split('|').slice(1, -1).map(c => c.trim())) : null;
  };
  const hidden = reqLines.filter(r => HIDDEN.test(r.text));
  const hg = gridRows('Hidden clauses');
  if (hidden.length && !hg) errors.push(`No "Hidden clauses" grid in requirements.md (pass 9); it must list ${hidden.map(r => r.id).join(', ')}`);
  if (hg) {
    for (const r of hidden) if (!hg.some(c => c[0] === r.id)) errors.push(`Hidden clauses: ${r.id} is missing (its text names a clause the screen may not show)`);
    for (const [id, clause, evidence, by] of hg) {
      if (!clause || !evidence || !by) { errors.push(`Hidden clauses: ${id} needs the clause, how it is observed and the rows`); continue; }
      const tcs = tcRefs(by);
      if (!tcs.length && !/^n\/a \(/.test(by)) errors.push(`Hidden clauses: ${id} names no row`);
      for (const tc of tcs) if (!active.has(tc)) errors.push(`Hidden clauses: ${id} names ${tc}, which is not an active row`);
    }
  }
  const variants = reqLines.filter(r => new Set(r.text.match(TIERS) ?? []).size >= 2 || VARIANT.test(r.text));
  const vg = gridRows('Variants');
  if (variants.length && !vg) errors.push(`No "Variants" grid in requirements.md (pass 10); it must list ${variants.map(r => r.id).join(', ')}`);
  if (vg) {
    for (const r of variants) {
      const mine = vg.filter(c => c[0] === r.id);
      const need = Math.max(2, new Set(r.text.match(TIERS) ?? []).size);
      if (!mine.length) errors.push(`Variants: ${r.id} is missing (it states a rule for several tiers, models or languages)`);
      else if (mine.length < need && !mine.some(c => /^n\/a \(/.test(c[2] ?? ''))) errors.push(`Variants: ${r.id} lists ${mine.length} variant(s), needs ${need} (one line per variant)`);
    }
    for (const [id, variant, by] of vg) {
      if (!variant || !by) { errors.push(`Variants: ${id} needs the variant and its rows`); continue; }
      const tcs = tcRefs(by);
      if (!tcs.length && !/^n\/a \(/.test(by)) errors.push(`Variants: ${id} × ${variant} names no row`);
      for (const tc of tcs) if (!active.has(tc)) errors.push(`Variants: ${id} × ${variant} names ${tc}, which is not an active row`);
    }
  }
}

const skillDrift = skillDiffs();
if (skillDrift.length) warnings.push(`.codex/skills differs from .claude/skills (${skillDrift.length} file(s), e.g. ${skillDrift[0]}): run node scripts/sync-skills.ts`);

console.log(JSON.stringify({ table: csv, rows: rows.length, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
