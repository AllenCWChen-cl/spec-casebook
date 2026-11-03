// Figma source reader: every node of a board (geometry, visibility, fills, strokes, radius, effects, auto
// layout, text runs, component and variant, variables, styles, prototype links, arrows) read by ONE read-only use_figma
// script per call instead of one Figma MCP read per frame, data type and component instance.
// Run by the agent through scripts/figma-source.ts (figma-source skill), which fills the three placeholders and writes
// each call's `code` to a file; the agent passes that file to use_figma (read-only) and saves the return verbatim.
//   __MODE__     'list'  sections and top-level nodes of the page holding the first target (one small call)
//                'plan'  walks the target boards (no styling read, so it is fast), returns one fingerprint per board
//                        and the chunk table that splits every board's node list into calls of about __BUDGET__ bytes
//                'chunk' returns the nodes [from, to) of one board, in the same walk order the plan used
//   __TARGETS__  'list' / 'plan': JSON array of node ids on ONE page: a page, a section (its children are the boards)
//                or a board. 'chunk': [boardId, from, to, firstId, lastId], a row of the plan's `chunks`
//   __BUDGET__   bytes per chunk return (plan only; default 36000 leaves room under a 40 KB tool result)
//   A chunk row with a sixth entry 'full' reads its range without shrinking. 'fix' mode: [boardId, [walk index…]] of
//   copies whose check failed; returns only the inside nodes that differ from the first instance. 'hidden' mode:
//   [boardId, first instance ordinal]; the layers hidden inside instances (see the hidden section).
// Output tables are local to one return: records refer to paints (P), effects (E), text runs (T), auto layout (L),
// prototype reactions (X), main components (M), variables (V) and styles (S) by index; figma-source.ts merge expands them.
const MODE = __MODE__, TARGETS = __TARGETS__, BUDGET = __BUDGET__ || 36000, NOSHRINK = MODE === 'chunk' && TARGETS[5] === 'full';
const t0 = Date.now();
const MIXED = figma.mixed;
const r2 = n => Math.round(n * 100) / 100;
const hex = (c, a) => '#' + [c.r, c.g, c.b, a === undefined ? (c.a === undefined ? 1 : c.a) : a]
  .map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const firstId = TARGETS[0];
const start = await figma.getNodeByIdAsync(firstId);
if (!start) throw new Error(`node ${firstId} not found`);
let page = start; while (page.type !== 'PAGE' && page.type !== 'DOCUMENT') page = page.parent;
await figma.setCurrentPageAsync(page);
// a node throws on a property its type lacks: read optional ones through g()
const g = (n, k) => k in n ? n[k] : undefined;
const absBox = n => { const b = n.absoluteBoundingBox; return b ? [r2(b.x), r2(b.y), r2(b.width), r2(b.height)] : null; };

// ---- list -----------------------------------------------------------------------------------------------------------
if (MODE === 'list') {
  const row = n => [n.id, n.name.trim().slice(0, 60), n.type, ...(absBox(n) || [0, 0, 0, 0]),
    'findAllWithCriteria' in n ? n.findAllWithCriteria({ types: ['INSTANCE'] }).length : 0, n.visible === false ? 0 : 1];
  const root = start.type === 'PAGE' ? page : start;
  const kids = 'children' in root ? root.children : [];
  return { mode: 'list', page: [page.id, page.name], root: [root.id, root.name, root.type],
    sections: kids.filter(n => n.type === 'SECTION').map(s => [...row(s), s.children.map(row)]),
    nodes: kids.filter(n => n.type !== 'SECTION').map(row) };
}

// ---- boards ---------------------------------------------------------------------------------------------------------
const boards = [], missing = [];
if (MODE === 'chunk' || MODE === 'hidden') boards.push(start);
else for (const id of TARGETS) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) { missing.push(id); continue; }
  if (n.type === 'PAGE' || n.type === 'SECTION') {
    for (const c of n.children) if (c.type === 'SECTION') boards.push(...c.children); else boards.push(c);
  } else boards.push(n);
}

// ---- lookups (async, cached) ------------------------------------------------------------------------------------------
const varCache = new Map(), colCache = new Map(), styleCache = new Map(), compCache = new Map();
const varInfo = async id => {
  if (varCache.has(id)) return; let v = null;
  try { v = await figma.variables.getVariableByIdAsync(id); } catch (e) {}
  let col = null;
  if (v) {
    if (!colCache.has(v.variableCollectionId)) {
      let c = null; try { c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); } catch (e) {}
      colCache.set(v.variableCollectionId, c ? { name: c.name, modes: Object.fromEntries(c.modes.map(m => [m.modeId, m.name])) } : null);
    }
    col = colCache.get(v.variableCollectionId);
  }
  varCache.set(id, v ? [v.name, col ? col.name : '', v.resolvedType, v.remote ? 1 : 0, v.key || ''] : [id, '', '?', 0, '']);
};
const styleInfo = async id => {
  if (!id || id === MIXED || styleCache.has(id)) return; let s = null;
  try { s = await figma.getStyleByIdAsync(id); } catch (e) {}
  styleCache.set(id, s ? [s.name, s.type, s.remote ? 1 : 0, s.key || ''] : [id, '?', 0, '']);
};
// every variable id a description refers to: bound properties, paint colours, gradient stops, effects, text runs
const varIds = d => {
  const ids = [], ref = x => { if (typeof x === 'string') ids.push(x); else if (Array.isArray(x)) x.forEach(ref); };
  const map = m => { if (m) for (const k in m) ref(m[k]); };
  const ps = l => { if (Array.isArray(l)) for (const p of l) { if (p.var) ids.push(p.var); if (p.gs) for (const g of p.gs) if (g[2]) ids.push(g[2]); } };
  map(d.bv); ps(d.f); ps(d.s);
  if (d.e) for (const e of d.e) map(e.var);
  if (d.tx) for (const [, , run] of d.tx.sg) { ps(run.f); map(run.bv); }
  return ids;
};

// ---- describe one node (raw, before table encoding) ---------------------------------------------------------------------
const paint = p => {
  const o = { t: p.type };
  if (p.visible === false) o.v = 0;
  if (p.type !== 'SOLID' && p.opacity !== undefined && p.opacity !== 1) o.o = r2(p.opacity);
  if (p.blendMode && p.blendMode !== 'NORMAL') o.bm = p.blendMode;
  if (p.type === 'SOLID') o.c = hex(p.color, p.opacity === undefined ? 1 : p.opacity);
  if (p.gradientStops) { o.gs = p.gradientStops.map(s => [r2(s.position), hex(s.color), s.boundVariables && s.boundVariables.color ? s.boundVariables.color.id : 0]);
    o.gt = p.gradientTransform.map(r => r.map(r2)); }
  if (p.type === 'IMAGE' || p.type === 'VIDEO') { o.ih = p.imageHash || p.videoHash || ''; o.sm = p.scaleMode; if (p.rotation) o.rot = p.rotation; }
  if (p.boundVariables && p.boundVariables.color) o.var = p.boundVariables.color.id;
  return o;
};
const paints = ps => ps === MIXED ? 'mixed' : Array.isArray(ps) && ps.length ? ps.map(paint) : null;
const effect = e => { const o = { t: e.type };
  if (e.visible === false) o.v = 0;
  if (e.color) o.c = hex(e.color);
  if (e.offset) o.xy = [r2(e.offset.x), r2(e.offset.y)];
  if (e.radius !== undefined) o.r = r2(e.radius);
  if (e.spread) o.sp = r2(e.spread);
  if (e.blendMode && e.blendMode !== 'NORMAL') o.bm = e.blendMode;
  if (e.showShadowBehindNode) o.behind = 1;
  if (e.boundVariables) { const b = {}; for (const k in e.boundVariables) b[k] = e.boundVariables[k].id; o.var = b; }
  return o; };
const lh = v => !v || v === MIXED ? v === MIXED ? 'mixed' : null : v.unit === 'AUTO' ? 'auto' : v.unit === 'PERCENT' ? `${r2(v.value)}%` : r2(v.value);
const ls = v => !v || v === MIXED ? v === MIXED ? 'mixed' : null : v.unit === 'PERCENT' ? `${r2(v.value)}%` : r2(v.value);
const SEG = ['fontName', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textDecoration', 'textCase', 'fills', 'textStyleId', 'fillStyleId'];
let segBound = true;
const segments = n => {
  if (segBound) try { return n.getStyledTextSegments([...SEG, 'boundVariables']); } catch (e) { segBound = false; }
  return n.getStyledTextSegments(SEG);
};
const isHead = c => c === 'ARROW_LINES' || c === 'ARROW_EQUILATERAL' || c === 'TRIANGLE_FILLED' || c === 'CIRCLE_FILLED' || c === 'DIAMOND_FILLED';
const absPt = (v, p) => { const t = v.absoluteTransform; return [t[0][0] * p.x + t[0][1] * p.y + t[0][2], t[1][0] * p.x + t[1][1] * p.y + t[1][2]]; };
const arrowPath = v => {
  if (v.type === 'LINE') return isHead(g(v, 'strokeCap')) || /-->|arrow/i.test(v.name) ? [absPt(v, { x: 0, y: 0 }), absPt(v, { x: v.width, y: 0 })] : null;
  let net; try { net = v.vectorNetwork; } catch (e) { return null; }
  const hi = net.vertices.findIndex(x => isHead(x.strokeCap));
  if (hi < 0 && !isHead(g(v, 'strokeCap')) && !/-->|arrow/i.test(v.name)) return null;
  const adj = net.vertices.map(() => []);
  for (const s of net.segments) { adj[s.start].push(s.end); adj[s.end].push(s.start); }
  const head = hi >= 0 ? hi : adj.findIndex(a => a.length === 1);
  if (head < 0) return null;
  let tail = adj.findIndex((a, i) => a.length === 1 && i !== head); if (tail < 0) tail = 0;
  const order = [tail], seen = new Set([tail]);
  for (let cur = tail; cur !== head;) { const nx = adj[cur].find(j => !seen.has(j)); if (nx === undefined) break; order.push(nx); seen.add(nx); cur = nx; }
  if (order[order.length - 1] !== head) order.push(head);
  return order.map(i => absPt(v, net.vertices[i]));
};
// how much of the node the design draws (0–1): hidden / transparent / layer-blurred ancestors draw nothing; clipping
// ancestors and masks cut its box
const drawn = n => {
  const b = n.absoluteBoundingBox; if (!b || !b.width || !b.height) return 1;
  let x0 = b.x, y0 = b.y, x1 = b.x + b.width, y1 = b.y + b.height;
  const cut = c => { if (!c) return; x0 = Math.max(x0, c.x); y0 = Math.max(y0, c.y); x1 = Math.min(x1, c.x + c.width); y1 = Math.min(y1, c.y + c.height); };
  for (let q = n; q && q.type !== 'PAGE'; q = q.parent) {
    if ('opacity' in q && q.opacity < 0.05) return 0;
    if ('effects' in q && Array.isArray(q.effects) && q.effects.some(e => e.visible !== false && e.type === 'LAYER_BLUR' && e.radius >= 4)) return 0;
    if (q !== n && g(q, 'clipsContent')) cut(q.absoluteBoundingBox);
    const p = q.parent;
    if (p && 'children' in p && p.type !== 'PAGE') { const i = p.children.indexOf(q);
      for (let k = 0; k < i; k++) { const m = p.children[k]; if (g(m, 'isMask') && m.visible !== false) cut(m.absoluteBoundingBox); } }
  }
  return Math.max(0, x1 - x0) * Math.max(0, y1 - y0) / (b.width * b.height);
};

const describe = async (n, origin, hid) => {
  const d = { i: n.id, t: n.type, n: n.name };
  const b = n.absoluteBoundingBox;
  if (b) d.b = [r2(b.x - origin[0]), r2(b.y - origin[1]), r2(b.width), r2(b.height)];
  else d.b = [0, 0, r2(n.width || 0), r2(n.height || 0)];
  if ('rotation' in n && n.rotation) { d.rot = r2(n.rotation); const t = n.absoluteTransform; d.at = [r2(t[0][2] - origin[0]), r2(t[1][2] - origin[1])]; }
  // hidden (or inside a hidden node): listed with its box only
  if (hid || n.visible === false) { d.v = 0; return d; }
  const rb = 'absoluteRenderBounds' in n ? n.absoluteRenderBounds : null;
  if (rb && b && (Math.abs(rb.x - b.x) > 0.5 || Math.abs(rb.y - b.y) > 0.5 || Math.abs(rb.width - b.width) > 0.5 || Math.abs(rb.height - b.height) > 0.5))
    d.rb = [r2(rb.x - origin[0]), r2(rb.y - origin[1]), r2(rb.width), r2(rb.height)];
  const dr = drawn(n); if (dr < 0.999) d.dr = r2(dr);
  if ('opacity' in n && n.opacity !== 1) d.o = r2(n.opacity);
  if ('blendMode' in n && n.blendMode !== 'PASS_THROUGH' && n.blendMode !== 'NORMAL') d.bm = n.blendMode;
  if (g(n, 'isMask')) d.mk = g(n, 'maskType') || 1;
  if ('clipsContent' in n && n.clipsContent) d.c = 1;
  if ('fills' in n && n.type !== 'TEXT') { const f = paints(n.fills); if (f) d.f = f; }
  if ('strokes' in n) { const s = paints(n.strokes);
    if (s) { d.s = s;
      d.sw = n.strokeWeight === MIXED ? [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight].map(r2) : r2(n.strokeWeight);
      const sa = g(n, 'strokeAlign'), dp = g(n, 'dashPattern'), sc = g(n, 'strokeCap'), sj = g(n, 'strokeJoin');
      if (sa && sa !== 'INSIDE') d.sa = sa;
      if (dp && dp.length) d.dp = dp.map(r2);
      if (sc && sc !== 'NONE') d.sc = sc === MIXED ? 'mixed' : sc;
      if (sj && sj !== 'MITER') d.sj = sj === MIXED ? 'mixed' : sj; } }
  if ('cornerRadius' in n) {
    if (n.cornerRadius === MIXED) d.cr = [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].map(r2);
    else if (n.cornerRadius) d.cr = r2(n.cornerRadius);
    if (d.cr !== undefined && g(n, 'cornerSmoothing')) d.cs = r2(n.cornerSmoothing);
  }
  if ('effects' in n && Array.isArray(n.effects) && n.effects.length) d.e = n.effects.map(effect);
  if ('layoutMode' in n && n.layoutMode && n.layoutMode !== 'NONE') d.l = { m: n.layoutMode, w: n.layoutWrap === 'WRAP' ? 1 : 0,
    p: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map(r2), g: r2(n.itemSpacing),
    cg: n.layoutWrap === 'WRAP' && g(n, 'counterAxisSpacing') != null ? r2(n.counterAxisSpacing) : undefined,
    pa: n.primaryAxisAlignItems, ca: n.counterAxisAlignItems, ps: n.primaryAxisSizingMode, cs: n.counterAxisSizingMode,
    si: g(n, 'strokesIncludedInLayout') ? 1 : undefined };
  const par = n.parent;
  if (par && 'layoutMode' in par && par.layoutMode && par.layoutMode !== 'NONE') {
    d.ch = [g(n, 'layoutSizingHorizontal'), g(n, 'layoutSizingVertical')];
    if (g(n, 'layoutPositioning') === 'ABSOLUTE') d.ch.push('ABSOLUTE');
    else if (g(n, 'layoutGrow')) d.ch.push(`grow:${n.layoutGrow}`);
  } else if ('constraints' in n && n.constraints && (n.constraints.horizontal !== 'MIN' || n.constraints.vertical !== 'MIN'))
    d.cn = [n.constraints.horizontal, n.constraints.vertical];
  if ('minWidth' in n && (n.minWidth || n.maxWidth || n.minHeight || n.maxHeight)) d.mm = [n.minWidth, n.maxWidth, n.minHeight, n.maxHeight];
  // styles and variables
  const st = {};
  for (const [k, p] of [['f', 'fillStyleId'], ['s', 'strokeStyleId'], ['e', 'effectStyleId'], ['t', 'textStyleId']])
    if (p in n && n[p] && n[p] !== MIXED) { await styleInfo(n[p]); st[k] = n[p]; }
  if (Object.keys(st).length) d.st = st;
  if ('boundVariables' in n && n.boundVariables && Object.keys(n.boundVariables).length) {
    const bv = {};
    // componentProperties holds one alias per property: kept as componentProperties.<property name>
    for (const k in n.boundVariables) { const v = n.boundVariables[k];
      if (k === 'componentProperties') { for (const q in v) bv[`${k}.${q.replace(/#[^#]*$/, '')}`] = v[q].id; } else bv[k] = Array.isArray(v) ? v.map(a => a.id) : v.id; }
    d.bv = bv;
  }
  if ('explicitVariableModes' in n && n.explicitVariableModes && Object.keys(n.explicitVariableModes).length) {
    d.vm = [];
    for (const cid in n.explicitVariableModes) {
      if (!colCache.has(cid)) { let c = null; try { c = await figma.variables.getVariableCollectionByIdAsync(cid); } catch (e) {}
        colCache.set(cid, c ? { name: c.name, modes: Object.fromEntries(c.modes.map(m => [m.modeId, m.name])) } : null); }
      const c = colCache.get(cid); d.vm.push([c ? c.name : cid, c ? c.modes[n.explicitVariableModes[cid]] || n.explicitVariableModes[cid] : n.explicitVariableModes[cid]]);
    }
  }
  // text
  if (n.type === 'TEXT') {
    const tx = { c: n.characters };
    if (n.textAlignHorizontal !== 'LEFT') tx.ah = n.textAlignHorizontal;
    if (n.textAlignVertical !== 'TOP') tx.av = n.textAlignVertical;
    tx.ar = n.textAutoResize;
    if (g(n, 'paragraphSpacing')) tx.ps = r2(n.paragraphSpacing);
    if (g(n, 'maxLines')) tx.ml = n.maxLines;
    if (g(n, 'textTruncation') && n.textTruncation !== 'DISABLED') tx.tr = n.textTruncation;
    tx.sg = [];
    for (const s of segments(n)) {
      if (s.textStyleId) await styleInfo(s.textStyleId);
      if (s.fillStyleId) await styleInfo(s.fillStyleId);
      const run = { ff: s.fontName.family, fs: s.fontName.style, sz: r2(s.fontSize), w: s.fontWeight, lh: lh(s.lineHeight), ls: ls(s.letterSpacing) };
      if (s.textDecoration && s.textDecoration !== 'NONE') run.td = s.textDecoration;
      if (s.textCase && s.textCase !== 'ORIGINAL') run.tc = s.textCase;
      const f = paints(s.fills); if (f) run.f = f;
      if (s.textStyleId) run.ts = s.textStyleId;
      if (s.fillStyleId) run.fsi = s.fillStyleId;
      if (s.boundVariables && Object.keys(s.boundVariables).length) { run.bv = {}; for (const k in s.boundVariables) { const v = s.boundVariables[k]; run.bv[k] = Array.isArray(v) ? v.map(a => a.id) : v.id; } }
      tx.sg.push([s.start, s.end, run]);
    }
    d.tx = tx;
  }
  // component
  if (n.type === 'INSTANCE') {
    let mc = null; try { mc = await n.getMainComponentAsync(); } catch (e) {}
    if (mc) { if (!compCache.has(mc.id)) { const set = mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : null;
        compCache.set(mc.id, [mc.id, mc.name, set ? set.name : '', mc.key || '', mc.remote ? 1 : 0]); }
      d.m = mc.id; }
    try { const cp = n.componentProperties; if (cp && Object.keys(cp).length) { d.cp = {}; for (const k in cp) d.cp[k.replace(/#[^#]*$/, '')] = cp[k].value; } } catch (e) {}
  }
  if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') d.key = n.key;
  // prototype links
  if ('reactions' in n && n.reactions && n.reactions.length) d.x = n.reactions.map(r => {
    const acts = r.actions || (r.action ? [r.action] : []);
    return [r.trigger ? r.trigger.type : '', acts.map(a => [a.type, a.destinationId || a.url || '', a.navigation || '', a.transition ? a.transition.type : ''])];
  });
  if ('annotations' in n) try { if (n.annotations && n.annotations.length) d.an = n.annotations.map(a => a.labelMarkdown || a.label || ''); } catch (e) {}
  if (n.type === 'VECTOR' || n.type === 'LINE') { const pa = arrowPath(n); if (pa) d.pa = pa.map(([x, y]) => [r2(x - origin[0]), r2(y - origin[1])]); }
  for (const id of varIds(d)) await varInfo(id);
  return d;
};

// ---- walk: depth-first, the board itself is index 0; hid = the node or an ancestor is hidden ------------------------------
const walk = (root, visit) => {
  let i = 0;
  const go = (n, p, hid) => { const me = i++, h = hid || n.visible === false; visit(n, me, p, h); if ('children' in n) for (const c of n.children) go(c, me, h); };
  go(root, -1, false); return i;
};

// ---- encoding into return-local tables ----------------------------------------------------------------------------------
const Enc = () => {
  const T = { P: [], E: [], T: [], L: [], X: [], M: [], V: [], S: [] }, idx = {}, bytes = { n: 0 };
  const put = (tab, key, val) => { const k = tab + key; if (idx[k] !== undefined) return idx[k];
    idx[k] = T[tab].length; T[tab].push(val); bytes.n += JSON.stringify(val).length + 1; return idx[k]; };
  const v = id => put('V', id, varCache.get(id) || [id, '', '?', 0, '']);
  const s = id => put('S', id, styleCache.get(id) || [id, '?', 0, '']);
  const p = o => { const e = { ...o }; if (e.var) e.var = v(e.var); if (e.gs) e.gs = e.gs.map(([a, c, x]) => x ? [a, c, v(x)] : [a, c]); return put('P', JSON.stringify(e), e); };
  const pl = ps => ps === 'mixed' ? ps : ps.map(p);
  const enc = (d, parent) => {
    const r = { ...d, p: parent };
    if (d.f) r.f = pl(d.f);
    if (d.s) r.s = pl(d.s);
    if (d.e) r.e = d.e.map(e => { const o = { ...e }; if (o.var) { const b = {}; for (const k in o.var) b[k] = v(o.var[k]); o.var = b; } return put('E', JSON.stringify(o), o); });
    if (d.l) r.l = put('L', JSON.stringify(d.l), d.l);
    if (d.st) { r.st = {}; for (const k in d.st) r.st[k] = s(d.st[k]); }
    if (d.bv) { r.bv = {}; for (const k in d.bv) r.bv[k] = Array.isArray(d.bv[k]) ? d.bv[k].map(v) : v(d.bv[k]); }
    if (d.m) r.m = put('M', d.m, compCache.get(d.m));
    if (d.x) r.x = d.x.map(x => put('X', JSON.stringify(x), x));
    if (d.tx) r.tx = { ...d.tx, sg: d.tx.sg.map(([a, b, run]) => { const o = { ...run };
      if (o.f) o.f = pl(o.f); if (o.ts) o.ts = s(o.ts); if (o.fsi) o.fsi = s(o.fsi);
      if (o.bv) { const b = {}; for (const k in o.bv) b[k] = Array.isArray(o.bv[k]) ? o.bv[k].map(v) : v(o.bv[k]); o.bv = b; }
      return [a, b, put('T', JSON.stringify(o), o)]; }) };
    bytes.n += JSON.stringify(r).length + 1;
    return r;
  };
  return { T, enc, bytes };
};
const fnv = () => { let h = 0x811c9dc5; return { feed: s => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } }, get: () => h.toString(16).padStart(8, '0') }; };

// ---- shrink: repeated component instances are sent once -------------------------------------------------------------------
// A visible instance whose inside matches an earlier instance's (same ids after the instance prefix, types, names, boxes
// relative to the instance, visibility, text, fills, strokes, radius, opacity, variant values) is sent as its own record plus
// `ref` (the earlier instance's id) and `sk` (how many nodes it stands for); merge copies the inside from the earlier one.
// Plan and chunk compute the same table from the same walk. Each copy is checked: the earlier instance sends `th` and the
// copy `rh`, hashes of the full description of their insides; a mismatch is re-read without shrinking (merge says which).
const sizes = list => { const sz = list.map(() => 1); for (let i = list.length - 1; i > 0; i--) sz[list[i][1]] += sz[i]; return sz; };
const pfx = n => (n.id[0] === 'I' ? n.id : 'I' + n.id) + ';';
const paintKey = ps => Array.isArray(ps) ? ps.filter(f => f.visible !== false).map(f =>
  f.type === 'SOLID' ? hex(f.color, f.opacity === undefined ? 1 : f.opacity) : f.type === 'IMAGE' ? f.imageHash : f.type).join(';') : ps === MIXED ? 'mixed' : '';
const insideSig = (list, i, sz) => {
  const root = list[i][0], o = root.absoluteBoundingBox, pre = pfx(root), h = fnv();
  h.feed(`${r2(root.width)}x${r2(root.height)}\n`);
  for (let j = i + 1; j < i + sz[i]; j++) {
    const [n, , hid] = list[j], a = n.absoluteBoundingBox;
    let cp = ''; if (n.type === 'INSTANCE' && !hid) try { cp = JSON.stringify(Object.values(n.componentProperties).map(v => v.value)); } catch (e) {}
    h.feed(`${n.id.startsWith(pre) ? n.id.slice(pre.length) : n.id}|${n.type}|${n.name}|${hid ? 0 : 1}|${a && o ? [r2(a.x - o.x), r2(a.y - o.y), r2(a.width), r2(a.height)] : ''}|${n.type === 'TEXT' && !hid ? n.characters : ''}|${hid ? '' : paintKey(g(n, 'fills')) + '/' + paintKey(g(n, 'strokes'))}|${g(n, 'opacity')}|${typeof g(n, 'cornerRadius') === 'number' ? n.cornerRadius : ''}|${cp}\n`);
  }
  return h.get();
};
const shrinkTable = (list, sz, off) => {
  const ref = new Map(), first = new Map();
  let skipEnd = -1;
  if (off) return { ref, tpl: new Set(), skipped: () => false };
  const inSkip = [];
  for (let i = 0; i < list.length; i++) {
    if (i < skipEnd) { inSkip[i] = 1; continue; }
    const [n, , hid] = list[i];
    if (n.type !== 'INSTANCE' || hid || sz[i] < 4 || !n.absoluteBoundingBox) continue;
    const sig = insideSig(list, i, sz);
    if (first.has(sig)) { ref.set(i, first.get(sig)); skipEnd = i + sz[i]; } else first.set(sig, i);
  }
  return { ref, tpl: new Set(ref.values()), skipped: i => !!inSkip[i] };
};
// hash of the full description of an instance's inside, relative to the instance (drawn share and render bounds
// excluded: both depend on what clips the instance from outside, and each copy sends its own in `dd`)
const insideHash = async (list, i, sz) => {
  const root = list[i][0], o = root.absoluteBoundingBox, pre = pfx(root), h = fnv();
  for (let j = i + 1; j < i + sz[i]; j++) {
    const d = await describe(list[j][0], [o.x, o.y], list[j][2]);
    d.i = d.i.startsWith(pre) ? d.i.slice(pre.length) : d.i; delete d.dr; delete d.rb; h.feed(JSON.stringify(d)); h.feed('\n');
  }
  return h.get();
};

// ---- plan ---------------------------------------------------------------------------------------------------------------
// Plan reads no styling (a full read of a large board in one call drops the connection): it walks the board once,
// estimates each node's return size from its id, name and text (calibrated 2026-11-02 on board 3946:68005: 130 bytes
// plus those per drawn node, 60 per hidden one, tables add about a third) and fingerprints what the board draws.
if (MODE === 'plan') {
  const out = { mode: 'plan', page: [page.id, page.name], budget: BUDGET, read_at: new Date().toISOString(), boards: [], chunks: [], missing };
  const recBudget = Math.round(BUDGET * 0.72);
  for (const bd of boards) {
    const o = bd.absoluteBoundingBox || { x: 0, y: 0 };
    const list = []; const count = walk(bd, (n, i, p, h) => list.push([n, p, h]));
    const sz = sizes(list), sh = shrinkTable(list, sz, NOSHRINK);
    const h = fnv(); let acc = 0, from = 0, total = 0, sent = 0;
    for (let i = 0; i < list.length; i++) {
      const [n, , hid] = list[i], a = n.absoluteBoundingBox, txt = n.type === 'TEXT' && !hid ? n.characters : '';
      h.feed(`${n.id}|${n.type}|${n.name}|${hid ? 0 : 1}|${a ? [r2(a.x - o.x), r2(a.y - o.y), r2(a.width), r2(a.height)] : ''}|${txt}|${hid ? '' : paintKey(g(n, 'fills'))}|${'opacity' in n ? n.opacity : 1}\n`);
      const e = sh.skipped(i) ? 0 : (hid ? 60 : 130) + n.id.length + n.name.length + txt.length + (sh.ref.has(i) ? 60 : 0);
      if (e) sent++;
      if (acc + e > recBudget && i > from) { out.chunks.push([bd.id, from, i, Math.round(acc / 0.72), list[from][0].id, list[i - 1][0].id]); total += acc; acc = 0; from = i; }
      acc += e;
    }
    out.chunks.push([bd.id, from, list.length, Math.round(acc / 0.72), list[from][0].id, list[list.length - 1][0].id]); total += acc;
    const rb = bd.absoluteRenderBounds;
    const pb = bd.parent && bd.parent.type !== 'PAGE' ? absBox(bd.parent) : null;
    out.boards.push({ id: bd.id, name: bd.name.trim(), type: bd.type, box: absBox(bd), render: rb ? [r2(rb.x), r2(rb.y), r2(rb.width), r2(rb.height)] : null,
      parent: pb ? [pb[0], pb[1]] : null, nodes: count, sent, copies: sh.ref.size, bytes: Math.round(total / 0.72), hash: h.get() });
  }
  out.took_ms = Date.now() - t0;
  return out;
}

// what the copy's surroundings change inside it: per inside node (offset k) its drawn share when under 1 and its render
// bounds (board-relative) when they are not the first instance's shifted ones: [k, drawn, render | 0]
const outsideCut = (all, i, t, sz, origin) => {
  const out = [], ro = all[i][0].absoluteBoundingBox, to = all[t][0].absoluteBoundingBox;
  for (let k = 1; k < sz[i]; k++) {
    if (all[i + k][2]) continue;
    const n = all[i + k][0], m = all[t + k][0], x = drawn(n);
    const a = 'absoluteRenderBounds' in n ? n.absoluteRenderBounds : null, b = 'absoluteRenderBounds' in m ? m.absoluteRenderBounds : null;
    const same = a && b ? Math.abs(a.x - ro.x - (b.x - to.x)) <= 0.5 && Math.abs(a.y - ro.y - (b.y - to.y)) <= 0.5 && Math.abs(a.width - b.width) <= 0.5 && Math.abs(a.height - b.height) <= 0.5 : !a && !b;
    if (x < 0.999 || !same) out.push([k, r2(x), same || !a ? 0 : [r2(a.x - origin[0]), r2(a.y - origin[1]), r2(a.width), r2(a.height)]]);
  }
  return out;
};

// ---- fix ----------------------------------------------------------------------------------------------------------------
// copies whose check failed (TARGETS = [boardId, [walk index…]]): compares each inside node with the first instance's in
// Figma and returns only the nodes that differ, in full, plus each copy's clipping (`dd`); merge copies the rest
if (MODE === 'fix') {
  const [boardId, idxs] = TARGETS, bd = start;
  const origin = bd.absoluteBoundingBox ? [bd.absoluteBoundingBox.x, bd.absoluteBoundingBox.y] : [0, 0];
  const all = []; const count = walk(bd, (n, i, p, h) => all.push([n, p, h]));
  const sz = sizes(all), sh = shrinkTable(all, sz, false), enc = Enc(), fixes = [];
  const rel = async (j, o, pre) => { const d = await describe(all[j][0], [o.x, o.y], all[j][2]); d.i = d.i.startsWith(pre) ? d.i.slice(pre.length) : d.i; delete d.dr; delete d.rb; return JSON.stringify(d); };
  for (const i of idxs) {
    const t = sh.ref.get(i);
    if (t === undefined) { fixes.push([i, null]); continue; }
    const ro = all[i][0].absoluteBoundingBox, to = all[t][0].absoluteBoundingBox, rp = pfx(all[i][0]), tp = pfx(all[t][0]), patch = [];
    for (let k = 1; k < sz[i]; k++) if (await rel(i + k, ro, rp) !== await rel(t + k, to, tp)) {
      const [n, p, h] = all[i + k]; patch.push([k, enc.enc(await describe(n, origin, h), p)]);
    }
    fixes.push([i, all[i][0].id, patch, outsideCut(all, i, t, sz, origin)]);
  }
  return { mode: 'fix', board: boardId, count, read_at: new Date().toISOString(), tables: enc.T, fixes, bytes: enc.bytes.n, took_ms: Date.now() - t0 };
}

// ---- chunk --------------------------------------------------------------------------------------------------------------
if (MODE === 'chunk') {
  const [boardId, from, to, firstExpected, lastExpected] = TARGETS;
  const bd = start;
  const origin = bd.absoluteBoundingBox ? [bd.absoluteBoundingBox.x, bd.absoluteBoundingBox.y] : [0, 0];
  const all = []; const count = walk(bd, (n, i, p, h) => all.push([n, p, h]));
  const drift = !all[from] || !all[to - 1] || all[from][0].id !== firstExpected || all[to - 1][0].id !== lastExpected;
  const sz = sizes(all), sh = shrinkTable(all, sz, NOSHRINK);
  const enc = Enc(), nodes = []; let first = -1;
  for (let i = from; i < to && i < all.length; i++) {
    if (sh.skipped(i)) continue;
    if (first < 0) first = i;
    const [n, p, h] = all[i], d = await describe(n, origin, h);
    if (sh.ref.has(i)) {
      d.ref = all[sh.ref.get(i)][0].id; d.sk = sz[i] - 1; d.rh = await insideHash(all, i, sz);
      const dd = outsideCut(all, i, sh.ref.get(i), sz, origin);
      if (dd.length) d.dd = dd;
    } else if (sh.tpl.has(i)) d.th = await insideHash(all, i, sz);
    nodes.push(enc.enc(d, p));
  }
  return { mode: 'chunk', board: boardId, from, to, first, count, drift, full: NOSHRINK ? 1 : 0, origin: [r2(origin[0]), r2(origin[1])], read_at: new Date().toISOString(),
    tables: enc.T, nodes, bytes: enc.bytes.n, took_ms: Date.now() - t0 };
}

// ---- hidden -------------------------------------------------------------------------------------------------------------
// Layers hidden inside an instance are not in the walk: use_figma runs with figma.skipInvisibleInstanceChildren on, and a
// View seat cannot turn it off (setting it counts as an edit). Each shown instance's children are paired with its main
// component's; a component child with no shown counterpart is a hidden layer, read from the component (with its subtree)
// and placed at its offset from the nearest shown ancestor. TARGETS = [boardId, first instance ordinal]; a call stops near
// __BUDGET__ bytes or 40 s and returns `next`. Records: i id, t type, n name, b board-relative box, pi parent id, af
// previous sibling id (null: first child), src component node id; ax = box approximate (the shown ancestor is resized
// from the component); sid = id made up (a library component's local copy has other ids than its instances: `~` marks it).
// A hidden layer's subtree is the same in every instance that hides it, so it is sent once per call in `tpl` (rows: s id
// after the layer's instance prefix, i.e. its id minus its `src`, t, n, d box relative to the layer's, p parent row or -1 for the layer, ax, sid) and each
// layer record names its row list in `tp`. One level up, an instance's hidden layers taken relative to the instance (ids
// and parents after its prefix, '' for the instance itself, boxes from its corner) are the same in every like instance:
// each set is sent once in `it` and each instance as [id, `it` row, x, y] in `ins`.
if (MODE === 'hidden') {
  const [boardId, from] = TARGETS, bd = start;
  const ob = bd.absoluteBoundingBox || { x: 0, y: 0 };
  const all = []; const count = walk(bd, (n, i, p, h) => all.push([n, p, h]));
  const insts = all.filter(([n, , h]) => n.type === 'INSTANCE' && !h).map(([n]) => n);
  const strip = id => id[0] === 'I' ? id.slice(1) : id, pre = id => (id[0] === 'I' ? id : 'I' + id) + ';';
  const nodes = [], tpl = [], tplAt = new Map(), it = [], itAt = new Map(), ins = [], unsure = [], mains = new Map(); let bytes = 0, next = null;
  const main = async n => { if (!mains.has(n.id)) { let m = null; try { m = await n.getMainComponentAsync(); } catch (e) {} mains.set(n.id, m); } return mains.get(n.id); };
  // pairs the shown children of `m` with the children of its component-side node `c`: by id where the ids map, else in
  // order by type and name; null when neither accounts for every shown child
  const pairKids = (m, c, toId) => {
    const cs = 'children' in c ? c.children : [], ms = 'children' in m ? m.children : [];
    if (cs.length === ms.length) return { pairs: cs.map((x, k) => [x, ms[k]]), exact: true };
    const byId = new Map(ms.map(y => [y.id, y])), pairs = cs.map(x => [x, byId.get(toId(x.id))]);
    if (pairs.filter(p => p[1]).length === ms.length) return { pairs, exact: true };
    let j = 0; const seq = cs.map(x => { const y = ms[j]; if (y && y.type === x.type && y.name === x.name) { j++; return [x, y]; } return [x, undefined]; });
    return j === ms.length ? { pairs: seq, exact: false } : null;
  };
  const box = (x, base) => { const b = x.absoluteBoundingBox; return b ? [r2(b.x + base[0] - ob.x), r2(b.y + base[1] - ob.y), r2(b.width), r2(b.height)] : [0, 0, r2(x.width || 0), r2(x.height || 0)]; };
  // a hidden component-side node and its subtree; idOf maps a component-side id to the board's id space
  const emit = async (x, base, parentId, after, idOf, approx, depth, out) => {
    const id = idOf(x.id), r = { i: id, t: x.type, n: x.name, b: box(x, base), pi: parentId, af: after, src: x.id };
    if (approx) r.ax = 1; if (id.includes('~')) r.sid = 1;
    out.push(r);
    if (depth > 12 || !('children' in x)) return;
    let prev = null;
    if (x.type === 'INSTANCE') {
      // its own hidden children are skipped too: pair it with its main component
      const mc = await main(x), toId = cid => pre(x.id) + strip(cid), pk = mc && pairKids(x, mc, toId);
      if (!pk) { for (const y of x.children) { await emit(y, base, id, prev, idOf, approx, depth + 1, out); prev = idOf(y.id); } return; }
      const mb = mc.absoluteBoundingBox, xb = x.absoluteBoundingBox, base2 = mb && xb ? [xb.x + base[0] - mb.x, xb.y + base[1] - mb.y] : base;
      for (const [cx, y] of pk.pairs) {
        if (y) { await emit(y, base, id, prev, idOf, approx, depth + 1, out); prev = idOf(y.id); continue; }
        const of2 = pk.exact ? cid => idOf(toId(cid)) : cid => `${pre(id)}~${strip(cid)}`;
        await emit(cx, base2, id, prev, of2, approx || x.width !== mc.width || x.height !== mc.height, depth + 1, out); prev = of2(cx.id);
      }
      return;
    }
    for (const y of x.children) { await emit(y, base, id, prev, idOf, approx, depth + 1, out); prev = idOf(y.id); }
  };
  // walks a shown instance against its component; shown nested instances get their own turn in `insts`
  const visit = async (m, c, inst, toId, depth) => {
    const pk = pairKids(m, c, toId);
    if (!pk) { unsure.push(m.id); return; }
    const mb = m.absoluteBoundingBox, cb = c.absoluteBoundingBox;
    const base = mb && cb ? [mb.x - cb.x, mb.y - cb.y] : [0, 0], approx = m.width !== c.width || m.height !== c.height;
    let prev = null;
    for (const [x, y] of pk.pairs) {
      if (y) { prev = y.id; if (y.type !== 'INSTANCE' && 'children' in y && depth < 40) await visit(y, x, inst, toId, depth + 1); continue; }
      const idOf = pk.exact ? cid => toId(cid) : cid => `${pre(m.id)}~${strip(cid)}`;
      const sub = []; await emit(x, base, m.id, prev, idOf, approx, 0, sub); prev = idOf(x.id);
      const [root, ...rest] = sub;
      if (rest.length) {
        const key = `${x.id}|${root.sid ? 1 : 0}|${approx ? 1 : 0}`;
        if (!tplAt.has(key)) {
          const at = root.i.length - strip(x.id).length, row = new Map([[root.i, -1]]), rows = rest.map((d, k) => { row.set(d.i, k);
            const o = { s: d.i.slice(at), t: d.t, n: d.n, d: [r2(d.b[0] - root.b[0]), r2(d.b[1] - root.b[1]), d.b[2], d.b[3]], p: row.get(d.pi) };
            if (d.ax) o.ax = 1; if (d.sid) o.sid = 1; return o; });
          tplAt.set(key, tpl.length); tpl.push(rows); bytes += JSON.stringify(rows).length + 1;
        }
        root.tp = tplAt.get(key);
      }
      nodes.push(root);
    }
  };
  let k = from;
  for (; k < insts.length; k++) {
    if (bytes > BUDGET * 0.8 || Date.now() - t0 > 40000) { next = k; break; }
    const inst = insts[k], mc = await main(inst);
    const at = nodes.length;
    if (mc) await visit(inst, mc, inst, cid => pre(inst.id) + strip(cid), 0);
    if (nodes.length === at) continue;
    const recs = nodes.splice(at), P = pre(inst.id), ib = box(inst, [0, 0]);
    const rel = v => v === null ? null : v === inst.id ? '' : v.startsWith(P) ? v.slice(P.length) : undefined;
    const rows = recs.map(r => { const o = { s: rel(r.i), t: r.t, n: r.n, d: [r2(r.b[0] - ib[0]), r2(r.b[1] - ib[1]), r.b[2], r.b[3]], p: rel(r.pi), a: rel(r.af), src: r.src };
      if (r.tp !== undefined) o.tp = r.tp; if (r.ax) o.ax = 1; if (r.sid) o.sid = 1; return o; });
    if (rows.some(o => !o.s || o.p === undefined || o.a === undefined)) { nodes.push(...recs); bytes += JSON.stringify(recs).length; continue; }
    const key = JSON.stringify(rows);
    if (!itAt.has(key)) { itAt.set(key, it.length); it.push(rows); bytes += key.length + 1; }
    ins.push([inst.id, itAt.get(key), ib[0], ib[1]]); bytes += inst.id.length + 24;
  }
  return { mode: 'hidden', board: boardId, from, next, instances: insts.length, count, read_at: new Date().toISOString(), nodes, tpl, it, ins, unsure, bytes, took_ms: Date.now() - t0 };
}
throw new Error(`unknown mode ${MODE}`);
