// Full Figma source data (geometry, styling, text runs, components, variables, prototype links, arrows) for every node
// of the boards a spec names, in a few use_figma calls instead of one Figma MCP read per frame, data type and
// component instance (figma-source skill). The reads run scripts/figma/source.js; the board images are one full-size
// get_screenshot per board, cropped here per screen.
// Usage: node scripts/figma-source.ts <product>/<feature> [<spec-set folder>] <command> <role> [ids…] [options]
//   role = design: only the Design Figma file (figma-frames.json `files.design`, read through figma-design) is read
//          this way (user, 2026-10-30); PM and MX files keep the spec-casebook inventory reads
//   calls list <role> [ids]        writes calls/list.js: the page's sections and top-level nodes (ids default: the page)
//   calls plan <role> <ids…> [--per 4] [--budget 36000]
//                                  writes calls/plan-N.js: one plan call per `--per` boards (a page or section id is
//                                  one call), each returning a fingerprint per board and its chunk table
//   calls chunks <role> [--all] [--scale 1]
//                                  reads responses/plan-*.json and writes calls/chunk-<board>_<from>.js for every board
//                                  whose fingerprint differs from hashes.json (all with --all), plus calls/todo.json
//                                  with the screenshots to take (node id, maxDimension) and the file to save each to,
//                                  and calls/hidden-<board>_0.js: the layers hidden inside instances (use_figma skips
//                                  them), read from each instance's main component
//   merge <role>                   checks the chunk responses cover every planned board and writes out/: one
//                                  <board>.json (every node, tables expanded), <board>.metadata.xml (get_metadata
//                                  layout, instances included), screens.json, arrows.json, library.json (variables,
//                                  styles, components), summary.json; updates hashes.json for the boards it completed
//   save <role> [names…]           copies the use_figma returns from the session transcripts into responses/
//   crop <role>                    cuts out/shots/<board>.png into out/crops/<board>/<screen>.png per screen (needs
//                                  python3 with Pillow) and writes out/crops.json
// Folder: specs/<set>/extracted/figma-source/<role>/ — responses/ and hashes.json are committed (no one reads an
// unchanged board again); calls/ and out/ are local.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { arg, assertIds, featureDir, ROOT, writeJson } from './lib/library.ts';
import { listSpecSets } from './lib/specs.ts';

const argv = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && all[i - 1].startsWith('--') && !['--all'].includes(all[i - 1])));
const [feature] = argv;
const usage = 'Usage: node scripts/figma-source.ts <product>/<feature> [<set>] calls list|plan|chunks <role> [ids…] | merge <role> | crop <role>';
if (!feature) { console.error(usage); process.exit(2); }
assertIds(feature, 'ios');
const specs = join(featureDir(feature), 'specs');
const sets = listSpecSets(feature).map(s => s.folder);
let pos = 1;
const set = sets.includes(argv[1]) ? argv[pos++] : [...sets].reverse().find(s => existsSync(join(specs, s, 'extracted', 'figma-frames.json')));
if (!set) { console.error('No spec set has extracted/figma-frames.json (it names the Figma files); add it first (reading-the-spec.md step 8).'); process.exit(2); }
const [cmd, sub] = [argv[pos], argv[pos + 1]];
const role = cmd === 'calls' ? argv[pos + 2] : argv[pos + 1];
const ids = cmd === 'calls' ? argv.slice(pos + 3) : [];
const ex = join(specs, set, 'extracted');
const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const frames = read(join(ex, 'figma-frames.json'));
const file = frames.files?.[role];
if (role !== 'design') { console.error(`${usage}\nOnly the Design Figma file is read with figma-source (role design; user, 2026-10-30), got "${role}".`); process.exit(2); }
if (!file) { console.error(`figma-frames.json has no files.design (fileKey, page) in ${ex.slice(ROOT.length + 1)}`); process.exit(2); }
const server = 'figma-design';
const dir = join(ex, 'figma-source', role), callsDir = join(dir, 'calls'), respDir = join(dir, 'responses'), outDir = join(dir, 'out');
const hashesPath = join(dir, 'hashes.json');
const rel = (p: string) => p.slice(ROOT.length + 1);
const dash = (id: string) => id.replace(/[:;/]/g, '-');

// ---- calls ------------------------------------------------------------------------------------------------------------
const src = readFileSync(join(ROOT, 'scripts', 'figma', 'source.js'), 'utf8');
const squeeze = (s: string) => s.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//')).join('\n');
const compact = squeeze(src);
// a hidden call needs only the preamble, the board lookup, the walk and its own section (about a fifth of the reader)
const compactHidden = squeeze(src.split(/^(?=\/\/ ---- )/m).filter((s, i) => i === 0 || /^\/\/ ---- (boards|walk|hidden)\b/.test(s)).join(''));
const code = (mode: string, targets: unknown, budget = 0) => {
  const c = (mode === 'hidden' ? compactHidden : compact).replace('__MODE__', JSON.stringify(mode)).replace('__TARGETS__', JSON.stringify(targets)).replace('__BUDGET__', String(budget));
  if (c.length > 50000) throw new Error(`call is ${c.length} characters; use_figma takes at most 50000`);
  return c;
};
const writeCall = (name: string, mode: string, targets: unknown, budget = 0) => {
  mkdirSync(callsDir, { recursive: true });
  writeFileSync(join(callsDir, `${name}.js`), code(mode, targets, budget));
  return { call: rel(join(callsDir, `${name}.js`)), save_to: rel(join(respDir, `${name}.json`)), description: `casebook figma-source ${role} ${name}` };
};

// ---- responses ----------------------------------------------------------------------------------------------------------
// a saved return is the extractor's JSON, possibly inside the host's text blocks or with a line of text around it
const MODES = new Set(['list', 'plan', 'chunk', 'fix', 'hidden']);
const findResult = (x: any): any => {
  if (!x || typeof x !== 'object') return null;
  if (MODES.has(x.mode)) return x;
  for (const v of Array.isArray(x) ? x : Object.values(x)) {
    const r = typeof v === 'string' ? parseResult(v) : findResult(v);
    if (r) return r;
  }
  return null;
};
const parseResult = (text: string): any => {
  const t = text.trim();
  if (!t.includes('mode')) return null;
  try { return findResult(JSON.parse(t)); } catch { /* not bare JSON */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) try { return findResult(JSON.parse(t.slice(a, b + 1))); } catch { /* not JSON */ }
  return null;
};
const responses = (prefix: string) => existsSync(respDir) ? readdirSync(respDir).filter(f => f.startsWith(prefix) && f.endsWith('.json')).sort().map(f => {
  const r = parseResult(readFileSync(join(respDir, f), 'utf8'));
  if (!r) { console.error(`${rel(join(respDir, f))}: no figma-source result in it (save the use_figma return verbatim)`); process.exit(2); }
  return { f, r };
}) : [];
const plans = () => {
  const boards = new Map<string, any>(), chunks = new Map<string, any[][]>();
  for (const { f, r } of responses('plan-')) {
    if (r.mode !== 'plan') { console.error(`${f} is a ${r.mode} response, not a plan`); process.exit(2); }
    for (const b of r.boards) { boards.set(b.id, { ...b, read_at: r.read_at, plan: f }); chunks.set(b.id, []); }
    for (const row of r.chunks) chunks.get(row[0])?.push(row);
    if (r.missing?.length) console.log(`${f}: not found in the file: ${r.missing.join(', ')}`);
  }
  return { boards, chunks };
};
const hashes: Record<string, any> = existsSync(hashesPath) ? read(hashesPath) : {};

if (cmd === 'calls' && sub === 'list') {
  console.log(JSON.stringify({ server, fileKey: file.fileKey, calls: [writeCall('list', 'list', ids.length ? ids : [file.page])] }, null, 1));
} else if (cmd === 'calls' && sub === 'plan') {
  if (!ids.length) { console.error('calls plan <role> <board, section or page ids…> (run `calls list` to see them)'); process.exit(2); }
  const per = Number(arg('per') ?? 4), budget = Number(arg('budget') ?? 36000), calls = [];
  for (let i = 0; i < ids.length; i += per) calls.push(writeCall(`plan-${dash(ids[i])}${per > 1 && ids.length > i + 1 ? `-${Math.min(per, ids.length - i)}` : ""}`, 'plan', ids.slice(i, i + per), budget));
  console.log(JSON.stringify({ server, fileKey: file.fileKey, parallel: true, calls }, null, 1));
} else if (cmd === 'calls' && sub === 'chunks') {
  const { boards, chunks } = plans();
  if (!boards.size) { console.error(`No plan responses in ${rel(respDir)}; run \`calls plan\` first`); process.exit(2); }
  const scale = Number(arg('scale') ?? 1), all = process.argv.includes('--all');
  const calls = [], shots = [], unchanged = [];
  for (const [id, b] of boards) {
    if (!all && hashes[id]?.hash === b.hash) { unchanged.push(id); continue; }
    for (const row of chunks.get(id) ?? []) calls.push(writeCall(`chunk-${dash(id)}_${row[1]}`, 'chunk', [row[0], row[1], row[2], row[4], row[5]]));
    calls.push(writeCall(`hidden-${dash(id)}_0`, 'hidden', [id, 0]));
    const [w, h] = (b.render ?? b.box).slice(2);
    const max = Math.ceil(Math.max(w, h) * scale);
    shots.push(max <= 65536
      ? { nodeId: id, maxDimension: max, save_to: rel(join(outDir, 'shots', `${dash(id)}.png`)) }
      : { nodeId: id, note: `${Math.round(w)}×${Math.round(h)} is over get_screenshot's 65536 limit at scale ${scale}: take each screen from out/screens.json after merge` });
  }
  const todo = { server, fileKey: file.fileKey, scale, unchanged, chunk_calls: calls, screenshots: shots };
  writeJson(join(callsDir, 'todo.json'), todo);
  console.log(`${calls.length} chunk call(s) and ${shots.length} screenshot(s) for ${boards.size - unchanged.length} changed board(s); ${unchanged.length} unchanged.\nList: ${rel(join(callsDir, 'todo.json'))}`);
} else if (cmd === 'save') save();
else if (cmd === 'merge') merge();
else if (cmd === 'crop') crop();
else { console.error(usage); process.exit(2); }

// ---- save ---------------------------------------------------------------------------------------------------------------
// copies each use_figma return verbatim from the session transcripts (Claude Code: ~/.claude/projects/<cwd>/, its
// subagents included; Codex: ~/.codex/sessions/) to responses/<name>.json, so no one retypes a 40 KB return; the call
// is found by its `description`. Without names, every call in calls/ that has no response yet.
function save() {
  const names = argv.slice(pos + 2);
  const want = names.length ? names : existsSync(callsDir) ? readdirSync(callsDir).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).filter(n => !existsSync(join(respDir, `${n}.json`))) : [];
  if (!want.length) { console.log('Nothing to save.'); return; }
  const home = process.env.HOME ?? '', roots = [join(home, '.claude', 'projects', ROOT.replace(/[^A-Za-z0-9]/g, '-')), join(home, '.codex', 'sessions')];
  const files: { p: string; t: number }[] = [];
  const scan = (d: string) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name);
    if (e.isDirectory()) scan(p); else if (e.name.endsWith('.jsonl')) { const t = statSync(p).mtimeMs; if (Date.now() - t < 2 * 86400000) files.push({ p, t }); } } };
  for (const r of roots) if (existsSync(r)) scan(r);
  files.sort((a, b) => b.t - a.t);
  const desc = new Map(want.map(n => [`casebook figma-source ${role} ${n}`, n])), found = new Map<string, string>();
  const text = (c: any): string => typeof c === 'string' ? c : Array.isArray(c) ? c.map(text).join('') : c && typeof c === 'object' ? (typeof c.text === 'string' ? c.text : text(c.content ?? c.Ok?.content ?? '')) : '';
  const full = (t: string) => { const m = t.match(/Full output saved to: (\S+)/); return m && existsSync(m[1]) ? readFileSync(m[1], 'utf8') : t; };
  for (const { p } of files) {
    if (found.size === desc.size) break;
    // within one transcript the latest return of a call wins; a newer transcript beats an older one
    const calls = new Map<string, string>(), here = new Map<string, string>();
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      if (!line.includes('figma-source') && !calls.size) continue;
      let o: any; try { o = JSON.parse(line); } catch { continue; }
      for (const b of o.message?.content ?? []) {
        if (b.type === 'tool_use' && /use_figma$/.test(b.name) && desc.has(b.input?.description)) calls.set(b.id, desc.get(b.input.description)!);
        if (b.type === 'tool_result' && calls.has(b.tool_use_id) && !b.is_error) here.set(calls.get(b.tool_use_id)!, full(text(b.content)));
      }
      const ev = o.payload ?? o; // Codex: mcp_tool_call_end carries the call and its result together
      const inv = ev.invocation ?? ev.item;
      if (inv && /use_figma$/.test(inv.tool ?? '') && desc.has(inv.arguments?.description)) {
        const n = desc.get(inv.arguments.description)!, r = ev.result ?? inv.result;
        if (r && !r.Err) here.set(n, full(text(r.Ok?.content ?? r.content ?? r)));
      }
    }
    for (const [n, t] of here) if (!found.has(n) && parseResult(t)) found.set(n, t);
  }
  mkdirSync(respDir, { recursive: true });
  for (const n of want) {
    const t = found.get(n);
    if (!t) { console.log(`not found: ${n} (no use_figma call with description "casebook figma-source ${role} ${n}" in the last two days' transcripts)`); continue; }
    if (!parseResult(t)) { console.log(`${n}: the return holds no figma-source result (an error?); not saved:\n${t.slice(0, 300)}`); continue; }
    writeFileSync(join(respDir, `${n}.json`), t);
    console.log(`saved ${rel(join(respDir, `${n}.json`))} (${t.length} bytes)`);
  }
}

// ---- merge --------------------------------------------------------------------------------------------------------------
function merge() {
  const { boards, chunks } = plans();
  const got = new Map<string, any[]>();
  for (const { f, r } of responses('chunk-')) {
    if (r.mode !== 'chunk') continue;
    if (!got.has(r.board)) got.set(r.board, []);
    got.get(r.board)!.push({ ...r, f });
  }
  mkdirSync(outDir, { recursive: true });
  const lib = { variables: new Map<string, any>(), styles: new Map<string, any>(), components: new Map<string, any>() };
  const screens: any[] = [], arrows: any[] = [], summary: any = { boards: [], incomplete: [], calls: { plan: responses('plan-').length, chunk: 0 }, bytes: 0 };
  for (const [id, b] of boards) {
    // chunks read after this board's plan; a `full` chunk re-reads one copied instance without shrinking
    const fresh = (got.get(id) ?? []).filter(c => c.read_at >= b.read_at);
    // a planned chunk may also come back as pieces that tile it exactly (a chunk whose call kept dropping, split by hand
    // at boundaries a smaller-budget plan of the same fingerprint gave)
    const want = chunks.get(id) ?? [], inRow = fresh.filter(c => !c.full && want.some(w => w[1] <= c.from && c.to <= w[2])), fulls = fresh.filter(c => c.full);
    const tiles = (w: any[]) => { let at = w[1]; for (let c; at < w[2] && (c = inRow.find(x => x.from === at && x.to <= w[2])); at = c.to); return at === w[2]; };
    const have = inRow.filter(c => { const w = want.find(w => w[1] <= c.from && c.to <= w[2])!; return w[1] === c.from && w[2] === c.to || !inRow.some(x => x.from === w[1] && x.to === w[2]); });
    const missing = want.filter(w => !tiles(w)).map(w => `chunk-${dash(id)}_${w[1]}`);
    const drift = have.filter(c => c.drift || c.count !== b.nodes).map(c => c.f);
    if (missing.length || drift.length) {
      summary.incomplete.push({ board: id, name: b.name, missing, changed_since_plan: drift });
      continue;
    }
    have.sort((x, y) => x.from - y.from);
    summary.calls.chunk += have.length + fulls.length + responses('fix-').filter(x => x.r.board === id).length; summary.bytes += [...have, ...fulls].reduce((s, c) => s + c.bytes, 0);
    // records sit at their walk index: a chunk starts at `first`, a copied instance stands for itself and `sk` nodes
    const arr: any[] = new Array(b.nodes);
    for (const c of have) { let k = c.first ?? c.from; if (k < 0) continue; for (const n of c.nodes) { arr[k] = expand(n, c.tables, lib); k += 1 + (n.sk ?? 0); } }
    for (const c of fulls) { let k = c.first; for (const n of c.nodes) arr[k++] = expand(n, c.tables, lib); }
    // fix returns: per failed copy, the inside nodes that really differ and its clipping
    const fixes = new Map<number, { patch: [number, any][]; dd: any[] }>();
    for (const { r } of responses('fix-')) if (r.board === id && r.read_at >= b.read_at)
      for (const [i, rid, patch, dd] of r.fixes) if (rid) fixes.set(i, { patch: patch.map(([k, n]: [number, any]) => [k, expand(n, r.tables, lib)]), dd });
    const at = new Map<string, number>(), mismatch: number[] = [];
    let copies = 0;
    for (let i = 0; i < arr.length; i++) {
      const n = arr[i]; if (!n) continue; at.set(n.id, i);
      if (!n.copy_of || arr[i + 1]?.id?.startsWith(prefixOf(n.id))) continue; // already read in full
      const t = at.get(n.copy_of)!, tpl = arr[t];
      const fx = fixes.get(i);
      if (tpl?.inside_hash !== n.inside_hash && !fx) mismatch.push(i);
      if (fx) n.copied_drawn = fx.dd;
      const from = prefixOf(tpl.id), to = prefixOf(n.id), dx = n.box[0] - tpl.box[0], dy = n.box[1] - tpl.box[1];
      const sh = (v: number[] | undefined) => v && [r2(v[0] + dx), r2(v[1] + dy), ...v.slice(2)];
      // dd rows: [k, drawn] (older reads) or [k, drawn, render | 0]
      const dd = new Map<number, any[]>((n.copied_drawn ?? []).map((r: any[]) => [r[0], r]));
      for (let k = 1; k <= n.copied; k++) {
        const src = arr[t + k], c = structuredClone(src);
        c.id = src.id.startsWith(from) ? to + src.id.slice(from.length) : src.id;
        c.p = src.p - t + i; c.box = sh(src.box); if (src.render) c.render = sh(src.render); if (src.origin) c.origin = sh(src.origin);
        if (src.arrow) c.arrow = src.arrow.map((q: number[]) => [r2(q[0] + dx), r2(q[1] + dy)]);
        delete c.drawn; const cut = dd.get(k);
        if (cut) { if (cut[1] < 0.999) c.drawn = cut[1]; if (cut[2]) c.render = cut[2]; }
        delete c.copy_of; delete c.copied; delete c.copied_drawn; delete c.inside_hash;
        arr[i + k] = c; at.set(c.id, i + k);
      }
      if (fx) for (const [k, rec] of fx.patch) { arr[i + k] = rec; at.set(rec.id, i + k); }
      copies++;
    }
    if (mismatch.length) {
      // one fix call per 60 failed copies: it returns only what differs
      const calls = [];
      for (let q = 0; q < mismatch.length; q += 60) calls.push(writeCall(`fix-${dash(id)}_${mismatch[q]}`, 'fix', [id, mismatch.slice(q, q + 60)]));
      summary.incomplete.push({ board: id, name: b.name, missing: calls.map(c => c.call.split('/').pop()!.replace(/\.js$/, '')), changed_since_plan: [], copies_to_check: mismatch.length });
      continue;
    }
    // hidden layers inside instances (hidden mode), read after this board's plan from instance 0 on, following `next`
    const hid: any[] = [];
    { const got = new Map(responses('hidden-').filter(x => x.r.board === id && x.r.read_at >= b.read_at && x.r.count === b.nodes).map(x => [x.r.from, x.r]));
      let at: number | null = 0;
      // an `ins` row is an instance's hidden layers stored once in `it`, relative to the instance
      const fromIns = (r: any) => (r.ins ?? []).flatMap(([iid, k, x, y]: [string, number, number, number]) => {
        const P = (iid[0] === 'I' ? iid : 'I' + iid) + ';', abs = (v: string | null) => v === null ? null : v === '' ? iid : P + v;
        return r.it[k].map((o: any) => ({ i: P + o.s, t: o.t, n: o.n, b: [r2(x + o.d[0]), r2(y + o.d[1]), o.d[2], o.d[3]], pi: abs(o.p), af: abs(o.a), src: o.src, tp: o.tp, ax: o.ax, sid: o.sid }));
      });
      for (let r; at !== null && (r = got.get(at)); at = r.next) for (const h of [...r.nodes, ...fromIns(r)]) {
        hid.push(h);
        // a template row list: the layer's subtree, ids after the layer's instance prefix, boxes relative to the layer, siblings in order
        const ids: string[] = [], last = new Map<string, string>(), pre = h.i.slice(0, h.i.length - h.src.replace(/^I/, '').length);
        for (const o of h.tp !== undefined ? r.tpl[h.tp] : []) {
          const id = pre + o.s, pi = o.p < 0 ? h.i : ids[o.p];
          hid.push({ i: id, t: o.t, n: o.n, b: [r2(h.b[0] + o.d[0]), r2(h.b[1] + o.d[1]), o.d[2], o.d[3]], pi, af: last.get(pi) ?? null, ax: o.ax, sid: o.sid });
          last.set(pi, id); ids.push(id);
        }
      }
      if (at !== null) {
        const c = writeCall(`hidden-${dash(id)}_${at}`, 'hidden', [id, at]);
        summary.incomplete.push({ board: id, name: b.name, missing: [c.call.split('/').pop()!.replace(/\.js$/, '')], changed_since_plan: [] });
        continue;
      }
      summary.calls.hidden = (summary.calls.hidden ?? 0) + got.size; }
    const holes = arr.findIndex(n => !n);
    if (holes >= 0) { summary.incomplete.push({ board: id, name: b.name, missing: [`node ${holes} has no record`], changed_since_plan: [] }); continue; }
    for (const n of arr) { delete n.copied; delete n.copied_drawn; delete n.inside_hash; }
    // parents (records carry their parent's walk index), then the hidden layers after their previous sibling
    for (const n of arr) { const p = arr[n.p]; n.parent = p ? p.id : null; delete n.p; }
    const kids = new Map<string, any[]>(), known = new Set(arr.map(n => n.id));
    const kidsOf = (pid: string) => { if (!kids.has(pid)) kids.set(pid, []); return kids.get(pid)!; };
    for (const n of arr) if (n.parent) kidsOf(n.parent).push(n);
    let orphans = 0;
    for (const h of hid) {
      if (known.has(h.i)) continue;
      if (!known.has(h.pi)) { orphans++; continue; }
      const rec = { id: h.i, type: h.t, name: h.n, box: h.b, hidden: true, ...(h.src ? { from_component: h.src } : {}), ...(h.ax ? { approx_box: true } : {}), ...(h.sid ? { made_up_id: true } : {}), parent: h.pi };
      const sib = kidsOf(h.pi), after = h.af ? sib.findIndex(s => s.id === h.af) : -1;
      sib.splice(after + 1, 0, rec); known.add(h.i);
    }
    const nodes: any[] = [];
    const place = (n: any, depth: number) => { n.index = nodes.length; n.depth = depth; nodes.push(n); for (const c of kids.get(n.id) ?? []) place(c, depth + 1); };
    place(arr[0], 0);
    const [ox, oy] = b.box;
    for (const n of nodes) n.abs = [r2(n.box[0] + ox), r2(n.box[1] + oy), n.box[2], n.box[3]];
    const board = { id, name: b.name, type: b.type, box: b.box, render: b.render, parent: b.parent ?? null, hash: b.hash, read_at: b.read_at, nodes: nodes.length };
    writeJson(join(outDir, `${dash(id)}.json`), { board, nodes });
    writeFileSync(join(outDir, `${dash(id)}.metadata.xml`), metadataXml(nodes, b.parent));
    const sc = findScreens(nodes);
    screens.push(...sc.map(s => ({ board: id, ...s })));
    arrows.push(...findArrows(nodes, sc).map(a => ({ board: id, ...a })));
    hashes[id] = { hash: b.hash, read_at: b.read_at, name: b.name, nodes: nodes.length };
    summary.boards.push({ id, name: b.name, nodes: nodes.length, hidden_in_instances: nodes.length - arr.length, ...(orphans ? { hidden_unplaced: orphans } : {}), copied_instances: copies, screens: sc.length, chunks: have.length, rereads: fulls.length });
  }
  writeJson(join(outDir, 'screens.json'), screens);
  writeJson(join(outDir, 'arrows.json'), arrows);
  writeJson(join(outDir, 'library.json'), Object.fromEntries(Object.entries(lib).map(([k, m]) => [k, [...m.values()]])));
  writeJson(join(outDir, 'summary.json'), summary);
  writeJson(hashesPath, hashes);
  console.log(`${summary.boards.length} board(s) merged (${summary.boards.reduce((s: number, b: any) => s + b.nodes, 0)} nodes, ${screens.length} screens, ${arrows.length} arrows) from ${summary.calls.plan} plan and ${summary.calls.chunk} chunk call(s); out: ${rel(outDir)}`);
  for (const i of summary.incomplete) console.log(`INCOMPLETE ${i.board} ${i.name}: ${i.missing.length ? `missing ${i.missing.join(', ')}` : ''}${i.changed_since_plan.length ? ` changed since the plan (${i.changed_since_plan.join(', ')}): plan this board again` : ''}`);
  if (summary.incomplete.length) process.exit(10);
}
function r2(n: number) { return Math.round(n * 100) / 100; }
function prefixOf(id: string) { return (id[0] === 'I' ? id : 'I' + id) + ';'; }

// ---- expand one record ----------------------------------------------------------------------------------------------------
function expand(n: any, T: any, lib: any) {
  const V = (i: number) => { const v = T.V[i]; if (!v) return null; const o = { name: v[0], collection: v[1], type: v[2], remote: !!v[3], key: v[4] }; lib.variables.set(v[0] + '|' + v[1], o); return `${v[1]}/${v[0]}`; };
  const S = (i: number) => { const s = T.S[i]; if (!s) return null; lib.styles.set(s[0] + '|' + s[1], { name: s[0], type: s[1], remote: !!s[2], key: s[3] }); return s[0]; };
  const paint = (i: number) => { const p = T.P[i]; const o: any = { type: p.t };
    if (p.c) o.color = p.c; if (p.o !== undefined) o.opacity = p.o; if (p.v === 0) o.visible = false; if (p.bm) o.blend = p.bm;
    if (p.var !== undefined) o.variable = V(p.var);
    if (p.gs) o.stops = p.gs.map((s: any[]) => ({ position: s[0], color: s[1], ...(s[2] !== undefined ? { variable: V(s[2]) } : {}) }));
    if (p.gt) o.transform = p.gt; if (p.ih !== undefined) { o.image = p.ih; o.scale_mode = p.sm; }
    return o; };
  const paints = (l: any) => l === 'mixed' ? 'mixed' : l.map(paint);
  const vars = (bv: any) => Object.fromEntries(Object.entries(bv).map(([k, v]) => [k, Array.isArray(v) ? v.map(V) : V(v as number)]));
  const o: any = { id: n.i, type: n.t, name: n.n, box: n.b, p: n.p };
  if (n.v === 0) o.hidden = true;
  if (n.rb) o.render = n.rb; if (n.rot) { o.rotation = n.rot; o.origin = n.at; } if (n.dr !== undefined) o.drawn = n.dr;
  if (n.o !== undefined) o.opacity = n.o; if (n.bm) o.blend = n.bm; if (n.mk) o.mask = n.mk; if (n.c) o.clips = true;
  if (n.f) o.fills = paints(n.f);
  if (n.s) { o.strokes = paints(n.s); o.stroke_weight = n.sw; o.stroke_align = n.sa ?? 'INSIDE'; if (n.dp) o.dash = n.dp; if (n.sc) o.stroke_cap = n.sc; if (n.sj) o.stroke_join = n.sj; }
  if (n.cr !== undefined) { o.radius = n.cr; if (n.cs) o.smoothing = n.cs; }
  if (n.e) o.effects = n.e.map((i: number) => { const e = T.E[i]; return { type: e.t, ...(e.v === 0 ? { visible: false } : {}), ...(e.c ? { color: e.c } : {}),
    ...(e.xy ? { offset: e.xy } : {}), ...(e.r !== undefined ? { radius: e.r } : {}), ...(e.sp ? { spread: e.sp } : {}), ...(e.bm ? { blend: e.bm } : {}),
    ...(e.behind ? { behind_node: true } : {}), ...(e.var ? { variables: vars(e.var) } : {}) }; });
  if (n.l !== undefined) { const l = T.L[n.l]; o.layout = { mode: l.m, wrap: !!l.w, padding: l.p, gap: l.g, ...(l.cg !== undefined ? { cross_gap: l.cg } : {}),
    primary_align: l.pa, cross_align: l.ca, primary_sizing: l.ps, cross_sizing: l.cs, ...(l.si ? { strokes_in_layout: true } : {}) }; }
  if (n.ch) o.child = { horizontal: n.ch[0], vertical: n.ch[1], ...(n.ch[2] ? { extra: n.ch[2] } : {}) };
  if (n.cn) o.constraints = n.cn; if (n.mm) o.min_max = n.mm;
  if (n.st) o.styles = Object.fromEntries(Object.entries(n.st).map(([k, v]) => [{ f: 'fill', s: 'stroke', e: 'effect', t: 'text' }[k] ?? k, S(v as number)]));
  if (n.bv) o.variables = vars(n.bv);
  if (n.vm) o.modes = Object.fromEntries(n.vm);
  if (n.tx) o.text = { characters: n.tx.c, align: [n.tx.ah ?? 'LEFT', n.tx.av ?? 'TOP'], auto_resize: n.tx.ar,
    ...(n.tx.ps ? { paragraph_spacing: n.tx.ps } : {}), ...(n.tx.ml ? { max_lines: n.tx.ml } : {}), ...(n.tx.tr ? { truncation: n.tx.tr } : {}),
    runs: n.tx.sg.map(([a, b, i]: number[]) => { const t = T.T[i]; return { start: a, end: b, font_family: t.ff, font_style: t.fs, font_size: t.sz, font_weight: t.w,
      line_height: t.lh, letter_spacing: t.ls, ...(t.td ? { decoration: t.td } : {}), ...(t.tc ? { case: t.tc } : {}), ...(t.f ? { fills: paints(t.f) } : {}),
      ...(t.ts !== undefined ? { text_style: S(t.ts) } : {}), ...(t.fsi !== undefined ? { fill_style: S(t.fsi) } : {}), ...(t.bv ? { variables: vars(t.bv) } : {}) }; }) };
  if (n.m !== undefined) { const m = T.M[n.m]; if (m) { o.component = { id: m[0], name: m[1], set: m[2], key: m[3], remote: !!m[4] }; lib.components.set(m[0], o.component); } }
  if (n.cp) o.component_props = n.cp; if (n.key) o.key = n.key;
  if (n.x) o.reactions = n.x.map((i: number) => { const [trigger, acts] = T.X[i]; return { trigger, actions: acts.map((a: string[]) => ({ type: a[0], destination: a[1], navigation: a[2], transition: a[3] })) }; });
  if (n.an) o.annotations = n.an; if (n.pa) o.arrow = n.pa;
  if (n.ref) { o.copy_of = n.ref; o.copied = n.sk; o.inside_hash = n.rh; if (n.dd) o.copied_drawn = n.dd; }
  if (n.th) o.inside_hash = n.th;
  return o;
}

// ---- derived views --------------------------------------------------------------------------------------------------------
// get_metadata's layout: x / y relative to the nearest ancestor that is not a group, the board relative to its section
function metadataXml(nodes: any[], parentAt: number[] | null) {
  const TAG: Record<string, string> = { RECTANGLE: 'rounded-rectangle', BOOLEAN_OPERATION: 'boolean-operation', GROUP: 'frame', COMPONENT_SET: 'component-set', REGULAR_POLYGON: 'regular-polygon' };
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const kids = new Map<string, any[]>();
  for (const n of nodes) if (n.parent) { if (!kids.has(n.parent)) kids.set(n.parent, []); kids.get(n.parent)!.push(n); }
  const byId = new Map(nodes.map(n => [n.id, n]));
  const at = (n: any) => n.origin ?? n.box;
  const lines: string[] = [];
  const go = (n: any) => {
    let c = n.parent ? byId.get(n.parent) : null;
    while (c && (c.type === 'GROUP' || c.type === 'BOOLEAN_OPERATION') && c.parent) c = byId.get(c.parent);
    const [x, y] = c ? [r2(at(n)[0] - at(c)[0]), r2(at(n)[1] - at(c)[1])] : parentAt ? [r2(n.abs[0] - parentAt[0]), r2(n.abs[1] - parentAt[1])] : n.abs;
    const tag = TAG[n.type] ?? n.type.toLowerCase().replace(/_/g, '-'), ch = kids.get(n.id) ?? [];
    const attrs = `id="${n.id}" name="${esc(n.name)}" x="${x}" y="${y}" width="${n.box[2]}" height="${n.box[3]}"${n.hidden ? ' hidden="true"' : ''}`;
    const pad = '  '.repeat(n.depth);
    if (!ch.length) { lines.push(`${pad}<${tag} ${attrs} />`); return; }
    lines.push(`${pad}<${tag} ${attrs}>`); ch.forEach(go); lines.push(`${pad}</${tag}>`);
  };
  go(nodes[0]);
  return lines.join('\n') + '\n';
}
// phone screens: frames 300–450 wide and at least 600 tall (taller than 1000 = a long page unless it holds phones),
// not inside another screen, and at least half drawn
function findScreens(nodes: any[]) {
  const sized = (n: any) => ['FRAME', 'INSTANCE', 'COMPONENT'].includes(n.type) && n.box[2] >= 300 && n.box[2] <= 450 && n.box[3] >= 600;
  const byId = new Map(nodes.map(n => [n.id, n]));
  const inside = (n: any, a: any) => { for (let q = byId.get(n.parent); q; q = byId.get(q.parent)) if (q === a) return true; return false; };
  const cands = nodes.filter(n => n.depth > 0 && !n.hidden && (n.drawn ?? 1) >= 0.5 && sized(n));
  const phones = cands.filter(n => n.box[3] <= 1000 || !cands.some(c => c !== n && c.box[3] <= 1000 && inside(c, n)));
  return phones.filter(n => !phones.some(p => p !== n && inside(n, p))).map(n => ({ id: n.id, name: n.name, box: n.box, abs: n.abs }));
}
function findArrows(nodes: any[], screens: any[]) {
  const hit = (b: number[], x: number, y: number, pad: number) => x >= b[0] - pad && x <= b[0] + b[2] + pad && y >= b[1] - pad && y <= b[1] + b[3] + pad;
  const screenAt = (x: number, y: number, pad: number) => screens.filter(s => hit(s.box, x, y, pad)).sort((a, b) => a.box[2] * a.box[3] - b.box[2] * b.box[3])[0]?.id ?? null;
  return nodes.filter(n => n.arrow && !n.hidden).map(n => {
    const [tx, ty] = n.arrow[0], [hx, hy] = n.arrow[n.arrow.length - 1], from = screenAt(tx, ty, 4);
    const src = nodes.filter(c => (c.type === 'INSTANCE' || c.type === 'FRAME') && !c.hidden && c.depth > 1 && hit(c.box, tx, ty, 6) && c.box[2] * c.box[3] < 200000)
      .sort((a, b) => a.box[2] * a.box[3] - b.box[2] * b.box[3])[0];
    return { id: n.id, name: n.name, path: n.arrow, from, control: src ? { id: src.id, name: src.name } : null, to: screenAt(hx, hy, 24) };
  });
}

// ---- crop ---------------------------------------------------------------------------------------------------------------
// one full-size board screenshot → one image per screen; the image covers the board's render bounds (its box when the
// board clips), and its scale is read from the image width
function crop() {
  const screens: any[] = existsSync(join(outDir, 'screens.json')) ? read(join(outDir, 'screens.json')) : [];
  if (!screens.length) { console.error(`No ${rel(join(outDir, 'screens.json'))}; run merge first`); process.exit(2); }
  const jobs: any[] = [], report: any[] = [];
  for (const id of [...new Set(screens.map(s => s.board))]) {
    const png = join(outDir, 'shots', `${dash(id)}.png`);
    if (!existsSync(png)) { report.push({ board: id, missing: rel(png) }); continue; }
    const b = read(join(outDir, `${dash(id)}.json`)).board, cover = b.render ?? b.box;
    jobs.push({ png, cover, box: b.box, out: join(outDir, 'crops', dash(id)), screens: screens.filter(s => s.board === id).map(s => ({ id: s.id, abs: s.abs })) });
  }
  const py = `import json, sys, os
from PIL import Image
res = []
for j in json.load(sys.stdin):
    im = Image.open(j['png']); W, H = im.size; cx, cy, cw, ch = j['cover']
    if abs(W / cw - H / ch) * max(cw, ch) > 2: cx, cy, cw, ch = j['box']
    s = W / cw; os.makedirs(j['out'], exist_ok=True); n = 0
    for sc in j['screens']:
        x, y, w, h = sc['abs']
        im.crop((round((x - cx) * s), round((y - cy) * s), round((x - cx + w) * s), round((y - cy + h) * s))).save(os.path.join(j['out'], sc['id'].replace(':', '-').replace(';', '-') + '.png')); n += 1
    res.append({'png': j['png'], 'size': [W, H], 'scale': round(s, 4), 'origin': [cx, cy], 'crops': n})
print(json.dumps(res))`;
  const r = spawnSync('python3', ['-c', py], { input: JSON.stringify(jobs), encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr || 'python3 with Pillow is needed: pip3 install pillow'); process.exit(1); }
  const done = JSON.parse(r.stdout).map((d: any) => ({ ...d, png: rel(d.png) }));
  writeJson(join(outDir, 'crops.json'), [...done, ...report]);
  console.log(`${done.reduce((s: number, d: any) => s + d.crops, 0)} screen image(s) from ${done.length} board screenshot(s)${report.length ? `; missing screenshots: ${report.map(x => x.board).join(', ')}` : ''}`);
}
