// Validate a draft (or the approved table) before review.
// Usage: node scripts/check.ts <feature> <ios|android> [--draft <id>]
// Besides the table itself it checks the analysis coverage (skill: "Coverage passes", "Standing inputs"):
// - every Design flow arrow in specs/<set>/extracted/arrows.json has a requirement in requirements.md;
// - a requirement is covered by a row's Spec Ref, or by "Walked by: TC-…" naming an active row;
// - every open "table" entry of library/<feature>/requests.md for this platform is cited in requirements.md;
// - the "Job states", "Exit × stage" and "Error classes" grids in requirements.md have no empty cell and name only
//   existing, active rows (the last two from 2026-10-22, REQ-030);
// - every dated frame in specs/<set>/extracted/figma-frames.json says where it was read (REQ-030);
// - a draft traces every annotation block (annotation-trace.json) and has the "Hidden clauses" and "Variants" grids
//   for the requirements that need them (user, 2026-10-22, REQ-032);
// - a draft of a feature with spec-agent.json decides every spec agent gap and lists it in update-plan.md; gaps from
//   the spec files are added as rows and name the pass that missed them (manager, 2026-10-22, REQ-031 / REQ-032).
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
  const qIds = new Set(reqText.match(/\bQ-\d+\b/g) ?? []);

  if (existsSync(join(featureDir(feature), specFolder, 'extracted', 'boards'))) {
    const tracePath = join(dir, 'annotation-trace.json');
    if (!existsSync(tracePath)) errors.push(`No annotation-trace.json: run node scripts/annotations.ts ${feature} ${platform} --draft ${draft} and trace every block (REQ-032)`);
    else {
      const blocks: { id: string; trace: string }[] = JSON.parse(readFileSync(tracePath, 'utf8')).blocks;
      const untraced = blocks.filter(b => !b.trace?.trim()).map(b => b.id);
      if (untraced.length) errors.push(`Annotation blocks not traced (${untraced.length} of ${blocks.length}): ${untraced.slice(0, 10).join(', ')}${untraced.length > 10 ? ', …' : ''}`);
      for (const b of blocks) {
        const t = b.trace?.trim() ?? '';
        if (!t) continue;
        if (/^NEW\b/.test(t)) { errors.push(`Annotation ${b.id}: still "NEW"; write the requirement and trace the block to it`); continue; }
        if (/^(label|ui|older):\s*\S/.test(t)) continue;
        const rs = t.match(/\bR-\d{3,}\b/g) ?? [], qs = t.match(/\bQ-\d+\b/g) ?? [];
        if (!rs.length && !qs.length) errors.push(`Annotation ${b.id}: trace must be R-…, Q-n, label: / ui: / older: <why> (got "${t.slice(0, 40)}")`);
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

// Spec agent cross-check (standing input 6; manager, 2026-10-22, REQ-031): for a feature with spec-agent.json every
// draft carries spec-agent-gaps.json (scripts/spec-agent-gaps.ts). Each gap has a decision, a gap from the spec files
// is added (never "low value" / "not from the spec"), named rows are active, and update-plan.md lists every gap.
if (draft && existsSync(join(featureDir(feature), 'spec-agent.json'))) {
  const gapsPath = join(dir, 'spec-agent-gaps.json');
  if (!existsSync(gapsPath)) errors.push(`No spec-agent-gaps.json: run node scripts/spec-agent-gaps.ts ${feature} ${platform} --draft ${draft} and decide every gap (REQ-031)`);
  else {
    const gaps: { id: string; source: { kind: string }; decision: string }[] = JSON.parse(readFileSync(gapsPath, 'utf8')).gaps;
    const planPath = join(dir, 'update-plan.md');
    const plan = existsSync(planPath) ? readFileSync(planPath, 'utf8') : '';
    const section = plan.match(/\n## Spec agent cross-check\n([\s\S]*?)(?=\n## |$)/)?.[1];
    if (!section) errors.push('update-plan.md has no "## Spec agent cross-check" section');
    for (const g of gaps) {
      const d = g.decision?.trim() ?? '';
      const kind = d.match(/^(added|covered|older spec|pass 7|not from the spec|low value)\b/)?.[1];
      if (!d) errors.push(`Spec agent gap ${g.id}: no decision in spec-agent-gaps.json`);
      else if (!kind) errors.push(`Spec agent gap ${g.id}: decision must start with added / covered / older spec / pass 7 / not from the spec / low value`);
      else if (g.source.kind === 'spec' && (kind === 'not from the spec' || kind === 'low value')) errors.push(`Spec agent gap ${g.id} comes from the spec files: add it as a row (REQ-031), not "${kind}"`);
      else if (g.source.kind === 'spec' && kind === 'added' && !/missed by:/i.test(d)) errors.push(`Spec agent gap ${g.id}: the analysis should have found it; say which pass missed it ("added TC-… (missed by: <pass>)") and fix that pass (REQ-032)`);
      if (kind === 'added' || kind === 'covered') {
        const by = tcRefs(d);
        if (!by.length) errors.push(`Spec agent gap ${g.id}: "${kind}" names no case`);
        for (const tc of by) if (!active.has(tc)) errors.push(`Spec agent gap ${g.id}: ${tc} is not an active row`);
      }
      if (section && !section.includes(g.id)) errors.push(`Spec agent gap ${g.id} is not listed under "Spec agent cross-check" in update-plan.md`);
    }
  }
}
console.log(JSON.stringify({ table: csv, rows: rows.length, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
