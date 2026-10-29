// Merge the Figma inventory groups of a spec set into one inventory (REQ-038): screens, tappable controls, flow arrows.
// Usage: node scripts/inventory.ts <feature> <spec-set folder> [--sync-arrows] [--file <figma file key>,…]
// Reads specs/<set>/extracted/figma-inventory-<group>.json (written by the agent from scripts/figma/inventory.js, one
// use_figma call per board group) and writes specs/<set>/extracted/inventory.json:
//   files    per Figma file: key, page, section box, and the Design PDF offset (pdf point = figma point + offset)
//   screens  [{ id, file, board, name, box, platform, panel? }]  platform from the frame size / name; a panel
//            (dialog, sheet, popup drawn beside the phones) is platform "any"; controls on an iPhone frame count for
//            Android too unless the overrides say otherwise (android_uses_ios_frames, ios_only_screens)
//   controls [{ id, file, board, name, label, kind, box, screens, node, parent, group, set, platforms }]
//            id = K-<hash of file + board + name + label + 24-pt position>, stable while the design keeps them;
//            kind: input (needs a dismiss step), toggle, tab, item (list / grid entry), button;
//            group = what the totals count: a choice set (set: true) or one button however many screens show it
//   arrows   [{ id, file, board, name, points, from, src, to, target, kind, duplicate_of }]
//            kind: flow (starts on a control), auto (starts on a screen edge: an automatic transition), pointer
//            (an annotation arrow that starts off-screen)
// --sync-arrows adds every flow/auto arrow missing from specs/<set>/extracted/arrows.json (edge text from the
// inventory, "expected" left for the analysis to write) and marks listed arrows that are annotation pointers with
// "not_flow"; check.ts then asks for a requirement per added arrow.
// --file merges only the groups of those Figma files (e.g. the Design file while a PM / MX extraction is unfinished).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg, assertIds, featureDir, writeJson, writeJsonRows } from './lib/library.ts';
import { normLabel } from './lib/coverage.ts';

const [feature, folder] = process.argv.slice(2);
if (!feature || !folder) { console.error('Usage: node scripts/inventory.ts <feature> <spec-set folder> [--sync-arrows]'); process.exit(2); }
assertIds(feature, 'ios');
const ex = join(featureDir(feature), 'specs', folder, 'extracted');
const only = arg('file')?.split(',');
const groups = readdirSync(ex).filter(f => /^figma-inventory-.+\.json$/.test(f) && !f.endsWith('-boards.json')
  && (!only || only.includes(JSON.parse(readFileSync(join(ex, f), 'utf8')).file))).sort();
if (!groups.length) { console.error(`No ${ex}/figma-inventory-<group>.json: extract with scripts/figma/inventory.js first`); process.exit(1); }

const hash = (s: string) => { let h = 0x811c9dc5; for (const c of s) { h ^= c.codePointAt(0)!; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0').slice(0, 6); };
const ANDROID = /pixel|android|galaxy/i;
const platformOf = (name: string, w: number) => ANDROID.test(name) || [360, 384, 411, 412].includes(w) ? 'android' : 'ios';
const kindOf = (name: string, label: string) =>
  /^imput$|^input|text ?field|search|ai input/i.test(name) ? 'input'
  : /toggle|switch|checkbox|radio/i.test(name) ? 'toggle'
  : /\btabs?\b/i.test(name) ? 'tab'
  : /thumb|card|library_|scene|video|thumbnail|option|chips?$|Project card|Launcher_|imput_character/i.test(name) && !/^round\/ic_|btn|button/i.test(name) ? 'item'
  : 'button';

type Screen = { id: string; file: string; board: string; name: string; box: number[]; platform: string; panel?: boolean };
type Control = { id: string; file: string; board: string; name: string; label: string; kind: string; box: number[]; screens: string[]; node: string; parent: string | null; group: string; set?: boolean; platforms: string[] };
type Arrow = { id: string; file: string; board: string; name: string; points: number[]; from: string | null; src: string | null; to: string | null; target: string; kind: string; duplicate_of?: string };
const files: Record<string, any> = {};
const screens: Screen[] = [], controls: Control[] = [], arrows: Arrow[] = [];
const seenScreen = new Set<string>(), ctlById = new Map<string, Control>();

for (const g of groups) {
  const j = JSON.parse(readFileSync(join(ex, g), 'utf8'));
  const [secId, secName, sx, sy, sw, sh] = j.section;
  files[j.file] ??= { key: j.file, page: j.page, section: { id: secId, name: secName, box: [sx, sy, sw, sh] }, groups: [] };
  files[j.file].groups.push({ group: j.group, extracted_at: j.extracted_at, boards: j.boards.map((b: any[]) => b[1]) });
  const boards: string[] = j.boards.map((b: any[]) => b[1]);
  files[j.file].boards = { ...(files[j.file].boards ?? {}), ...Object.fromEntries(j.boards.map((b: any[]) => [b[1], { id: b[0], box: b.slice(2, 6) }])) };
  const sIds: string[] = [];
  for (const [id, bi, name, x, y, w, h, kind] of j.screens) {
    sIds.push(id);
    // node ids are per file: the same id in two files (Design, PM, MX) would merge two screens
    if (seenScreen.has(id) && screens.find(s => s.id === id)?.file !== j.file) console.error(`screen id ${id} is in ${j.file} and another file: rename one before tracing`);
    if (seenScreen.has(id)) continue;
    seenScreen.add(id);
    // a panel (dialog, sheet, popup) is drawn once for both platforms
    screens.push({ id, file: j.file, board: boards[bi], name, box: [x, y, w, h], platform: kind === 'panel' ? 'any' : platformOf(name, w), ...(kind === 'panel' ? { panel: true } : {}) });
  }
  const local: string[] = [];
  for (const [ni, label, x, y, w, h, node, scr, parent] of j.controls) {
    const name = j.names[ni], board = boards[j.screens[scr[0]][1]];
    // scroll content clipped by the frame is not drawn: keep a control only if half of it shows inside its screen
    const [, , , , , sw, sh] = j.screens[scr[0]];
    const iw = Math.max(0, Math.min(x + w, sw) - Math.max(x, 0)), ih = Math.max(0, Math.min(y + h, sh) - Math.max(y, 0));
    if (iw * ih < 0.5 * w * h) { local.push(''); continue; }
    const id = `K-${hash(`${j.file}|${board}|${name}|${label}|${Math.round(x / 24)},${Math.round(y / 24)}`)}`;
    local.push(id);
    const ss = scr.map((i: number) => sIds[i]);
    const prev = ctlById.get(id);
    if (prev) { for (const s of ss) if (!prev.screens.includes(s)) prev.screens.push(s); continue; }
    const c: Control = { id, file: j.file, board, name, label, kind: kindOf(name, label), box: [x, y, w, h], screens: ss, node, parent: parent >= 0 ? `#${parent}` : null, group: '', platforms: [] };
    controls.push(c); ctlById.set(id, c);
  }
  for (const c of controls) if (c.parent?.startsWith('#')) c.parent = local[+c.parent.slice(1)] || null;
  const byPts = new Map<string, string>();
  for (const [id, name, pts, from, src, to, toNode, toName] of j.arrows) {
    const a: Arrow = { id: id.replace(':', '-'), file: j.file, board: '', name, points: pts, from: from >= 0 ? sIds[from] : null, src: src >= 0 ? local[src] || null : null, to: to >= 0 ? sIds[to] : null, target: to >= 0 ? '' : `${toNode} ${toName}`.trim(), kind: '' };
    // designers name flow arrows (「a --> b」, 「flow line」); annotation pointers keep Figma's default name (「Vector 2758」)
    a.kind = src >= 0 ? 'flow' : from >= 0 ? 'auto' : /^(Vector|Line|Arrow)( \d+)?$/.test(name.trim()) ? 'pointer' : 'flow';
    const bs = (from >= 0 ? j.screens[from] : to >= 0 ? j.screens[to] : null);
    a.board = bs ? boards[bs[1]] : boards.find((_, i) => { const b = j.boards[i]; return pts[0] >= b[2] && pts[0] <= b[2] + b[4] && pts[1] >= b[3] && pts[1] <= b[3] + b[5]; }) ?? '';
    const k = pts.join(',');
    if (byPts.has(k)) a.duplicate_of = byPts.get(k); else byPts.set(k, a.id);
    arrows.push(a);
  }
}
// Review fixes (specs/<set>/extracted/inventory-overrides.json, from the review sheets; kept across re-extractions):
//   { "drop_screens": [{ "screen", "why" }], "drop": [{ "control", "why" }],
//     "hide": [{ "screen", "controls": [ids], "why" }]  (covered on that screen only, e.g. behind a dimmed sheet),
//     "add": [{ "screen", "screens"?: [more screen ids showing the same element], "label", "box": [x, y, w, h]
//              (screen points), "kind": button | input | toggle | tab | item, "layer"?: Figma layer it copies, "why" }],
//     "kind": [{ "control" | "group": id, "kind", "why" }]  (a wrong kind: a slider drawn as an input, a field drawn as
//              chips; set after the group ids are computed, so a worded label's group id, which hashes the kind, stays),
//     "merge": [{ "groups": [ids], "into": "<group id>", "set"?: bool, "why" }]  (one element the grouping split: the
//              selected state drawn at another size, an icon added by hand next to the layer's own copies; the listed
//              groups' controls take the `into` id, so a control-trace entry keyed on it keeps applying; `set` is true
//              when any of them was a choice set unless the entry says otherwise) }
// `drop`, `hide` and `kind` "control" take control ids (K-… / M-…), not group ids: map a group through
// inventory.json controls[].group. A dropped screen takes its controls with it; an added control gets id M-<hash> and
// layer "manual/<kind>". `kind` and `merge` run after grouping (kind first; a `kind` "group" names the id before the merge).
const ovPath = join(ex, 'inventory-overrides.json');
const ov = existsSync(ovPath) ? JSON.parse(readFileSync(ovPath, 'utf8')) : {};
const dropScreens = new Set((ov.drop_screens ?? []).map((d: any) => d.screen));
const dropControls = new Set((ov.drop ?? []).map((d: any) => d.control));
for (let i = screens.length - 1; i >= 0; i--) if (dropScreens.has(screens[i].id)) screens.splice(i, 1);
const hidden = new Map<string, Set<string>>();
for (const h of ov.hide ?? []) for (const id of h.controls ?? []) hidden.set(id, new Set([...(hidden.get(id) ?? []), h.screen]));
for (let i = controls.length - 1; i >= 0; i--) {
  const c = controls[i];
  c.screens = c.screens.filter(sid => !dropScreens.has(sid) && !hidden.get(c.id)?.has(sid));
  if (dropControls.has(c.id) || !c.screens.length) { controls.splice(i, 1); ctlById.delete(c.id); }
}
for (const a of ov.add ?? []) {
  const on = [a.screen, ...(a.screens ?? [])].filter((sid: string) => screens.some(s => s.id === sid));
  const sc = screens.find(s => s.id === on[0]);
  if (!sc) { console.error(`override add: no screen ${a.screen} (${a.label})`); continue; }
  const id = `M-${hash(`${a.screen}|${a.label}|${a.box.join(',')}`)}`;
  // `layer` names the Figma layer the element is a copy of (an icon the extractor missed here), so it joins that group
  const c: Control = { id, file: sc.file, board: sc.board, name: a.layer ?? `manual/${a.kind}`, label: a.layer ? '' : a.label ?? '', kind: a.kind, box: a.box, screens: [...new Set(on)] as string[], node: '', parent: null, group: '', platforms: [] };
  controls.push(c); ctlById.set(id, c);
}
for (const a of arrows) if (a.src && !ctlById.has(a.src)) a.src = null;
const scrById = new Map(screens.map(s => [s.id, s]));
// An arrow whose tail or head lies on a screen of another group (a heavy frame split into region boards so each
// use_figma call stays small) is resolved here by geometry, as the extractor does inside one group: tail within 4 pt,
// head within 24 pt, the smallest screen wins; the control under the tail within 6 pt is its source.
const near = (b: number[], x: number, y: number, pad: number) => x >= b[0] - pad && x <= b[0] + b[2] + pad && y >= b[1] - pad && y <= b[1] + b[3] + pad;
const screenAt = (file: string, x: number, y: number, pad: number) => screens.filter(s => s.file === file && near(s.box, x, y, pad)).sort((p, q) => p.box[2] * p.box[3] - q.box[2] * q.box[3])[0] ?? null;
const ctlsOn = new Map<string, Control[]>();
for (const c of controls) for (const s of c.screens) ctlsOn.set(s, [...(ctlsOn.get(s) ?? []), c]);
// an end on a screen the review dropped (a duplicate frame) is looked up again among the screens kept
for (const a of arrows) { if (a.from && !scrById.has(a.from)) a.from = a.src = null; if (a.to && !scrById.has(a.to)) a.to = null; }
for (const a of arrows) {
  if (a.from && a.to) continue;
  const n = a.points.length, from = a.from ? null : screenAt(a.file, a.points[0], a.points[1], 4), to = a.to ? null : screenAt(a.file, a.points[n - 2], a.points[n - 1], 24);
  if (to) { a.to = to.id; a.target = ''; }
  if (!from) continue;
  a.from = from.id;
  const [tx, ty] = [a.points[0] - from.box[0], a.points[1] - from.box[1]];
  const src = (ctlsOn.get(from.id) ?? []).filter(c => near(c.box, tx, ty, 6)).sort((p, q) => p.box[2] * p.box[3] - q.box[2] * q.box[3])[0];
  if (src && !a.src) a.src = src.id;
  a.kind = a.src ? 'flow' : 'auto';
}
// The Design draws the shared screens on iPhone frames only (Android frames exist for a few screens), so an iPhone frame
// counts for Android too (user, 2026-10-28). Overrides turn this off with "android_uses_ios_frames": false, or keep
// single screens to iOS with "ios_only_screens": [{ "screen": "<id>", "why": "…" }] (Apple-only sheets, Face ID …).
const shareIos = ov.android_uses_ios_frames !== false;
const iosOnly = new Set((ov.ios_only_screens ?? []).map((d: any) => d.screen));
const platformsOf = (s: string) => { const p = scrById.get(s)?.platform ?? 'ios'; return p === 'any' || (p === 'ios' && shareIos && !iosOnly.has(s)) ? ['ios', 'android'] : [p]; };
for (const c of controls) c.platforms = [...new Set(c.screens.flatMap(platformsOf))].sort();

// Groups: what the totals count (user, 2026-10-28). One group per
//   choice set  same layer repeated side by side on a screen with different labels (chips, options, template cards,
//               scene cards) or with none (thumbnails, avatars): pressing one choice covers the set. Sets with the same
//               layer whose labels mostly agree (Jaccard ≥ 0.5) are one set wherever they appear.
//   button      same worded label on any screen or board, whatever layer draws it (「Generate」, 「Got it」): one
//               group; a numbers-only label (credit pill 「#」) or none (back, history icons) groups by layer (+ size).
// The instances stay listed (controls[].screens), so the page still marks every copy.
const parentOf = new Map<string, string>();
const find = (k: string): string => { const p = parentOf.get(k) ?? k; if (p === k) return k; const r = find(p); parentOf.set(k, r); return r; };
const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parentOf.set(ra, rb); };
const sizeKey = (c: Control) => `${Math.round(c.box[2] / 8)}x${Math.round(c.box[3] / 8)}`;
// sets never join across Figma files: a PM chip list that matches a Design one is the PM spec's own set
const sets: { key: string; file: string; name: string; labels: Set<string>; ids: string[] }[] = [];
const byScreen = new Map<string, Control[]>();
for (const c of controls) for (const s of c.screens) byScreen.set(s, [...(byScreen.get(s) ?? []), c]);
for (const [sid, cs] of byScreen) {
  const byName = new Map<string, Control[]>();
  for (const c of cs) byName.set(c.name, [...(byName.get(c.name) ?? []), c]);
  for (const [name, list] of byName) {
    if (list.length < 2) continue;
    // split into separate lists: a gap over 0.75 item heights (a heading between rows) starts another list, so Gender
    // and Ethnicity chips stay apart while wrapped chip rows (8-pt gaps) stay together
    const sorted = [...list].sort((a, b) => a.box[1] - b.box[1]), clusters: Control[][] = [];
    for (const c of sorted) { const last = clusters.at(-1), prev = last?.at(-1);
      if (prev && c.box[1] - (prev.box[1] + prev.box[3]) <= 0.75 * Math.max(prev.box[3], c.box[3])) last!.push(c); else clusters.push([c]); }
    for (const cl of clusters) {
      if (cl.length < 2) continue;
      const labels = new Set(cl.map(c => normLabel(c.label)).filter(Boolean));
      if (labels.size < 2 && !(labels.size === 0 && new Set(cl.map(sizeKey)).size === 1)) continue;
      const key = `S${sets.length}`; sets.push({ key, file: cl[0].file, name, labels, ids: cl.map(c => c.id) });
      for (const c of cl) union(`c:${c.id}`, key);
    }
  }
}
const jaccard = (a: Set<string>, b: Set<string>) => { if (!a.size && !b.size) return 1; let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n); };
for (let i = 0; i < sets.length; i++) for (let k = i + 1; k < sets.length; k++)
  if (sets[i].file === sets[k].file && sets[i].name === sets[k].name && jaccard(sets[i].labels, sets[k].labels) >= 0.5) union(sets[i].key, sets[k].key);
// a lone copy whose label belongs to a set of its layer (the one chip left on a selected-state screen) joins that set
const setLabels = new Map<string, Set<string>>();
for (const s of sets) { const r = find(s.key); setLabels.set(r, new Set([...(setLabels.get(r) ?? []), ...s.labels])); }
for (const c of controls) {
  if (parentOf.has(`c:${c.id}`) || !c.label) continue;
  const r = [...setLabels].find(([root, ls]) => ls.has(normLabel(c.label)) && sets.some(s => find(s.key) === root && s.name === c.name && s.file === c.file));
  if (r) union(`c:${c.id}`, r[0]);
}
for (const c of controls) {
  const inSet = parentOf.has(`c:${c.id}`);
  c.set = inSet;
  c.group = inSet ? `C-${hash(`${c.file}|${c.name}|${find(`c:${c.id}`)}|${[...setLabels.get(find(`c:${c.id}`)) ?? []].sort().join(',')}`)}`
    // a worded label is the button whatever layer draws it (「Generate」 as Action Button_M, button or Button/Action;
    // the idea input as 「ai input」 or 「imput」); a label of only numbers (credit pill, prices) keeps its layer
    : /[a-z\p{L}]/u.test(normLabel(c.label).replace(/#/g, '')) ? `K-${hash(`${c.file}|${c.kind}|${normLabel(c.label)}`)}`
    : `K-${hash(`${c.file}|${c.name}|${normLabel(c.label) || sizeKey(c)}`)}`;
}
// Review fixes that need the group ids (overrides `kind`, `merge`; see the comment above `ovPath`)
for (const k of ov.kind ?? []) {
  const hit = controls.filter(c => k.control ? c.id === k.control : c.group === k.group);
  if (!hit.length) console.error(`override kind: no ${k.control ? 'control' : 'group'} ${k.control ?? k.group}`);
  for (const c of hit) c.kind = k.kind;
}
for (const m of ov.merge ?? []) {
  const from = new Set<string>([...m.groups, m.into]), hit = controls.filter(c => from.has(c.group));
  for (const g of from) if (!controls.some(c => c.group === g)) console.error(`override merge: no group ${g} (into ${m.into})`);
  const set = m.set ?? hit.some(c => c.set);
  for (const c of hit) { c.group = m.into; c.set = set; }
}

// Design PDF offset: the export spans the section, flush with its bottom edge (checked on Template Detail, 2026-10-28)
const setJson = JSON.parse(readFileSync(join(featureDir(feature), 'specs', folder, 'spec-set.json'), 'utf8'));
const designPdf = setJson.files.map((f: any) => f.name).find((n: string) => /design/i.test(n));
const pdfPath = designPdf ? join(featureDir(feature), 'specs', folder, designPdf) : '';
if (pdfPath && existsSync(pdfPath)) {
  const mupdf = await import('mupdf');
  const [, , pw, ph] = mupdf.Document.openDocument(readFileSync(pdfPath), 'application/pdf').loadPage(0).getBounds();
  for (const f of Object.values(files)) {
    const [x, y, w, h] = f.section.box;
    if (Math.abs(pw - w) < 2) f.pdf = { name: designPdf, size: [Math.round(pw), Math.round(ph)], offset: [-x, -y + Math.round(ph - h)] };
  }
}
// PM and MX PDFs export a whole page whose Figma file kept changing, so their offset is measured once (OCR anchors or
// the page bounds) and kept in figma-frames.json: files.<role> = { fileKey, pdf, pdf_offset }
const framesPath = join(ex, 'figma-frames.json');
for (const fr of Object.values<any>(existsSync(framesPath) ? JSON.parse(readFileSync(framesPath, 'utf8')).files ?? {} : {}))
  if (files[fr.fileKey] && !files[fr.fileKey].pdf && fr.pdf && fr.pdf_offset) files[fr.fileKey].pdf = { name: fr.pdf, offset: fr.pdf_offset };
writeJsonRows(join(ex, 'inventory.json'), { built_at: new Date().toISOString(), groups, files, screens, controls, arrows });

if (process.argv.includes('--sync-arrows')) {
  const path = join(ex, 'arrows.json');
  const doc = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { arrows: [] };
  const listed = new Set(doc.arrows.map((a: any) => a.node));
  const desc = (a: Arrow) => {
    const s = a.from ? scrById.get(a.from) : null, t = a.to ? scrById.get(a.to) : null, c = a.src ? ctlById.get(a.src) : null;
    return `${a.board}: ${s?.name ?? '?'}${c ? ` · ${c.label ? `「${c.label}」` : c.name}` : a.kind === 'auto' ? ' (automatic)' : ''} → ${t?.name ?? a.target ?? '?'}`;
  };
  let added = 0, marked = 0;
  for (const a of arrows) {
    if (a.duplicate_of || a.kind === 'pointer' || listed.has(a.id)) continue;
    doc.arrows.push({ arrow: a.id, node: a.id, edge: desc(a), expected: '', source: 'figma-inventory' }); added++;
  }
  const pointers = new Set(arrows.filter(a => a.kind === 'pointer').map(a => a.id));
  for (const a of doc.arrows) {
    if (pointers.has(a.node) && !a.not_flow) { a.not_flow = 'annotation pointer (default layer name, starts off-screen; figma-inventory)'; marked++; }
    else if (!pointers.has(a.node) && /figma-inventory/.test(a.not_flow ?? '')) delete a.not_flow;
  }
  doc.count = doc.arrows.filter((a: any) => !a.not_flow).length;
  writeJson(path, doc);
  console.log(`arrows.json: ${added} added, ${marked} marked not_flow`);
}

const count = (xs: any[], f: (x: any) => string) => xs.reduce((m, x) => (m[f(x)] = (m[f(x)] ?? 0) + 1, m), {} as Record<string, number>);
console.log(JSON.stringify({
  out: join(ex, 'inventory.json'), groups, screens: count(screens, s => s.platform), overrides: { drop_screens: dropScreens.size, drop: dropControls.size, hide: (ov.hide ?? []).length, add: (ov.add ?? []).length, kind: (ov.kind ?? []).length, merge: (ov.merge ?? []).length }, hidden_by_figma: groups.map(g => JSON.parse(readFileSync(join(ex, g), 'utf8')).hidden ?? null),
  controls: controls.length, by_kind: count(controls, c => c.kind),
  ios_required: new Set(controls.filter(c => c.platforms.includes('ios')).map(c => c.group)).size,
  android_required: new Set(controls.filter(c => c.platforms.includes('android')).map(c => c.group)).size,
  arrows: count(arrows, a => a.duplicate_of ? 'duplicate' : a.kind), pdf: Object.fromEntries(Object.entries(files).map(([k, f]) => [k, f.pdf ?? null])),
}, null, 1));
