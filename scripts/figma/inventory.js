// Figma inventory of one board group (REQ-038): phone screens, tappable controls and flow arrows, read in ONE use_figma
// call per group so a large file costs a handful of Figma MCP calls, not one per element (Figma MCP has a daily quota).
// Run by the agent: read this file, replace the two placeholders, pass it as `code` to use_figma (read-only), and save
// the returned JSON as specs/<set>/extracted/figma-inventory-<group>.json; then run scripts/inventory.ts.
//   __PAGE__    the page id, e.g. '116:7873' (Design), '2016:2' (PM), '989:8' (MX)
//   __BOARDS__  JSON array of board (top-level frame) ids in the page's section, e.g. ['2778:127318','2566:113114'];
//               [] lists the boards only (ids, names, boxes, a rough size) so the groups can be chosen.
//               An entry can also be { id, name } (the board under another name, e.g. the spec PDF's board id) or a
//               region { name, parent: id | [ids], box: [x, y, w, h] } for a file whose phones and arrows lie loose
//               in a page or frame (the PM and MX files): the board is the parents' visible children (sections
//               excluded) whose centre lies in the box (absolute canvas points).
// Output (compact; indices are local to this group, scripts/inventory.ts merges the groups):
//   section: [id, name, x, y, w, h]          absolute canvas box of the section holding the boards
//   boards:  [[id, name, x, y, w, h]]
//   names:   control layer names; controls refer to them by index
//   screens: [[id, board, name, x, y, w, h, 'panel'?]]  phone frames (300–450 wide; taller than 1000 = a long
//            scrolling page) and panels (dialogs, sheets, popups beside the phones), absolute boxes
//   controls:[[name, label, x, y, w, h, node, [screen…], parent]]  one per board + name + label + position (24-pt
//            buckets); x/y relative to the screen; node = first instance; parent = enclosing control or -1
//   hidden:  { screens, controls } skipped because the design does not draw them (hidden, opacity 0, layer blur,
//            or mostly outside a clipping frame or mask)
//   arrows:  [[id, name, [x,y,…], from, src, to, toNode, toName]]  vector points (absolute, tail first, head last);
//            from/to = screen index or -1, src = control under the tail or -1, toNode/toName = the smallest node under
//            the head when it is not a screen (popover, card)
//   entries, hash, hashed_at: the __BOARDS__ given, one fingerprint per board id and when it was taken (figma-check.ts)
// Check mode (scripts/figma-check.ts writes the call): __BOARDS__ = { hash: [entries] } returns only
//   { mode: 'hash', hashed_at, boards: [[id, hash | null]], others: [[id, name]] }: the fingerprint of every board
//   (null = gone) and the boards on the page that no entry covers, so a whole file is checked in one small call.
const PAGE = __PAGE__, BOARDS = __BOARDS__;
const page = await figma.getNodeByIdAsync(PAGE);
await figma.setCurrentPageAsync(page);
const R = n => Math.round(n);
const box = n => { const b = n.absoluteBoundingBox; return b ? [R(b.x), R(b.y), R(b.width), R(b.height)] : null; };
const idOf = e => typeof e === 'string' ? e : e.id || [e.parent].flat()[0];
const first = BOARDS.length ? await figma.getNodeByIdAsync(idOf(BOARDS[0])) : null;
const sections = page.children.filter(n => n.type === 'SECTION' && 'children' in n).sort((a, b) => b.children.length - a.children.length);
const sec = first ? (typeof BOARDS[0] === 'object' && BOARDS[0].box ? first : first.parent) : sections[0] || page;
// a page has no box: use the union of what it draws
const secBox = n => box(n) || (() => { const bs = n.children.filter(c => c.visible !== false && c.absoluteBoundingBox).map(c => c.absoluteBoundingBox);
  const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y));
  return [R(x0), R(y0), R(Math.max(...bs.map(b => b.x + b.width)) - x0), R(Math.max(...bs.map(b => b.y + b.height)) - y0)]; })();
if (Array.isArray(BOARDS) && !BOARDS.length) {
  return { section: [sec.id, sec.name, ...secBox(sec)], boards: sec.children.filter(b => 'children' in b).map(b => [b.id, b.name.trim(), ...box(b), b.findAllWithCriteria({ types: ['INSTANCE'] }).length]) };
}
const SKIP = /^(Key|Keys|Keyboard|HomeIndicator|Home Indicator|iPhone X|Time|Status ?Bar|Background|bg)\b/i;
const TAP = /button|btn|^round\/ic_|^ic_|chip|tab\b|tabs|toggle|switch|link|select|thumb|card|imput|input|text ?field|search|scene|video|download|paycard|option|ViewMore|Launcher_|Free user|AI Smart Tools|checkbox|radio|slider|dropdown|menu|nav\/|Top\/|close|back/i;
// a phone frame: 300–450 wide, 600–1000 tall; a taller one is a long scrolling page unless it holds phone frames itself
const phoneSized = n => (n.type === 'FRAME' || n.type === 'INSTANCE' || n.type === 'COMPONENT') && n.width >= 300 && n.width <= 450 && n.height >= 600;
const isPhone = n => phoneSized(n) && (n.height <= 1000 || (n.height <= 6000 && !('findOne' in n && n.findOne(c => phoneSized(c) && c.height <= 1000))));
// how much of a node the design actually draws (0–1): hidden, transparent or layer-blurred ancestors draw nothing;
// clipping frames and masks above it cut its box (a screen parked outside its board, scroll content past the frame)
const shown = n => {
  const b = n.absoluteBoundingBox; if (!b || !b.width || !b.height) return 0;
  let x0 = b.x, y0 = b.y, x1 = b.x + b.width, y1 = b.y + b.height;
  const cut = c => { if (!c) return; x0 = Math.max(x0, c.x); y0 = Math.max(y0, c.y); x1 = Math.min(x1, c.x + c.width); y1 = Math.min(y1, c.y + c.height); };
  for (let q = n; q && q.type !== 'PAGE'; q = q.parent) {
    if (q.visible === false || ('opacity' in q && q.opacity < 0.05)) return 0;
    if ('effects' in q && q.effects.some(e => e.visible !== false && e.type === 'LAYER_BLUR' && e.radius >= 4)) return 0;
    if (q !== n && q.clipsContent) cut(q.absoluteBoundingBox);
    const p = q.parent;
    if (p && 'children' in p) { const i = p.children.indexOf(q); for (let k = 0; k < i; k++) if ('isMask' in p.children[k] && p.children[k].isMask && p.children[k].visible !== false) cut(p.children[k].absoluteBoundingBox); }
  }
  return Math.max(0, x1 - x0) * Math.max(0, y1 - y0) / (b.width * b.height);
};
// buttons drawn as plain frames rather than component instances
const TAPFRAME = /^(button|btn|cta|chip|tab|toggle|link|close|back)\b|button$/i;
const inside = (b, x, y, pad) => b && x >= b.x - pad && x <= b.x + b.width + pad && y >= b.y - pad && y <= b.y + b.height + pad;
const out = { section: [sec.id, sec.name, ...secBox(sec)], boards: [], names: [], screens: [], controls: [], arrows: [], hidden: { screens: 0, controls: 0 },
  entries: BOARDS, hash: {}, hashed_at: new Date().toISOString() };
const nameIdx = new Map(), ctlIdx = new Map(), inst = [];
const nameOf = s => { if (!nameIdx.has(s)) { nameIdx.set(s, out.names.length); out.names.push(s); } return nameIdx.get(s); };
const boardNodes = [];
// a region board stands in for a frame: its members are searched as a frame's children would be
const region = async e => {
  const [x, y, w, h] = e.box, nodes = [];
  for (const pid of [e.parent].flat()) { const p = await figma.getNodeByIdAsync(pid);
    for (const n of p ? p.children : []) { const b = n.absoluteBoundingBox;
      if (n.visible !== false && n.type !== 'SECTION' && b && b.x + b.width / 2 >= x && b.x + b.width / 2 <= x + w && b.y + b.height / 2 >= y && b.y + b.height / 2 <= y + h) nodes.push(n); } }
  const all = (n, f) => [...(f(n) ? [n] : []), ...('findAll' in n ? n.findAll(f) : [])];
  return { id: `${[e.parent].flat()[0]}/${e.name}`, name: e.name, type: 'REGION', children: nodes, absoluteBoundingBox: { x, y, width: w, height: h },
    findAll: f => nodes.flatMap(n => all(n, f)),
    findAllWithCriteria: o => nodes.flatMap(n => [...(o.types.includes(n.type) ? [n] : []), ...('findAllWithCriteria' in n ? n.findAllWithCriteria(o) : [])]) };
};
const boardOf = async e => typeof e === 'object' && e.box ? await region(e) : await figma.getNodeByIdAsync(idOf(e));
// a board's fingerprint: FNV-1a over everything it draws (type, name, box relative to the board, text, fills, opacity);
// group and check mode share it, so a board re-read after a check carries the hash the check saw
const fingerprint = b => {
  const o = b.absoluteBoundingBox; let h = 0x811c9dc5;
  const feed = s => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } };
  const paint = n => 'fills' in n && Array.isArray(n.fills) ? n.fills.filter(f => f.visible !== false).map(f =>
    f.type === 'SOLID' ? `${R(f.color.r * 255)},${R(f.color.g * 255)},${R(f.color.b * 255)},${f.opacity ?? 1}` : f.type === 'IMAGE' ? f.imageHash : f.type).join(';') : '';
  const walk = n => {
    if (n.visible === false) return;
    const a = n.absoluteBoundingBox;
    feed(`${n.type}|${n.name}|${a ? [R(a.x - o.x), R(a.y - o.y), R(a.width), R(a.height)] : ''}|${n.type === 'TEXT' ? n.characters : ''}|${paint(n)}|${'opacity' in n ? n.opacity : 1}\n`);
    if ('children' in n) for (const c of n.children) walk(c);
  };
  for (const c of b.children) walk(c);
  return h.toString(16).padStart(8, '0');
};
if (BOARDS.hash) {
  const res = { mode: 'hash', hashed_at: new Date().toISOString(), boards: [], others: [] }, boxes = [], parents = new Set();
  for (const e of BOARDS.hash) {
    const id = typeof e === 'object' && e.box ? `${[e.parent].flat()[0]}/${e.name}` : idOf(e);
    const b = await boardOf(e);
    res.boards.push([id, b ? fingerprint(b) : null]);
    if (b) { boxes.push(b.absoluteBoundingBox); if (b.type !== 'REGION') parents.add(b.parent.id); }
    if (typeof e === 'object' && e.box) for (const p of [e.parent].flat()) parents.add(p);
  }
  // boards no entry covers: board-sized children of the page, its sections and the regions' parents
  const listed = new Set(res.boards.map(([id]) => id)), seen = new Set();
  const holders = [page, ...page.children.filter(n => n.type === 'SECTION')];
  for (const p of parents) { const n = await figma.getNodeByIdAsync(p); if (n && 'children' in n) holders.push(n); }
  for (const p of holders) for (const n of p.children) {
    const b = n.absoluteBoundingBox;
    if (seen.has(n.id) || listed.has(n.id) || parents.has(n.id) || n.visible === false || !b || b.width < 300 || b.height < 300) continue;
    seen.add(n.id);
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    if (!boxes.some(x => inside(x, cx, cy, 0)) && res.others.length < 400) res.others.push([n.id, n.name.trim().slice(0, 40)]);
  }
  return res;
}
for (const e of BOARDS) {
  const b = await boardOf(e);
  if (b) { boardNodes.push(b); out.boards.push([b.id, (typeof e === 'object' && e.name) || b.name.trim(), ...box(b)]); out.hash[b.id] = fingerprint(b); }
}
const isHead = c => c === 'ARROW_LINES' || c === 'ARROW_EQUILATERAL' || c === 'TRIANGLE_FILLED';
const abs = (v, p) => { const t = v.absoluteTransform; return [R(t[0][0] * p.x + t[0][1] * p.y + t[0][2]), R(t[1][0] * p.x + t[1][1] * p.y + t[1][2])]; };
// arrow geometry first: panels (dialogs, popups) are found partly by the arrows that point at them
const vectors = [];
for (const board of boardNodes) for (const v of board.findAllWithCriteria({ types: ['VECTOR', 'LINE'] })) {
  if (v.visible === false) continue;
  let pts;
  if (v.type === 'LINE') { if (!v.name.includes('-->') && !isHead(v.strokeCap)) continue; pts = [abs(v, { x: 0, y: 0 }), abs(v, { x: v.width, y: 0 })]; }
  else {
    let net; try { net = v.vectorNetwork; } catch (e) { continue; }
    const hi = net.vertices.findIndex(x => isHead(x.strokeCap));
    if (hi < 0 && !v.name.includes('-->')) continue;
    // walk the path from the free end without an arrowhead to the arrowhead
    const adj = net.vertices.map(() => []);
    for (const s of net.segments) { adj[s.start].push(s.end); adj[s.end].push(s.start); }
    const head = hi >= 0 ? hi : adj.findIndex(a => a.length === 1);
    let tail = adj.findIndex((a, i) => a.length === 1 && i !== head); if (tail < 0) tail = 0;
    const order = [tail], seen = new Set([tail]);
    for (let cur = tail; cur !== head;) { const nx = adj[cur].find(j => !seen.has(j)); if (nx === undefined) break; order.push(nx); seen.add(nx); cur = nx; }
    if (order[order.length - 1] !== head) order.push(head);
    pts = order.map(i => abs(v, net.vertices[i]));
  }
  let ok = true; for (let q = v; q && q.type !== 'PAGE'; q = q.parent) if (q.visible === false) ok = false;
  if (ok) vectors.push({ v, board, pts });
}
const screenNodes = [];
boardNodes.forEach((b, bi) => {
  const walk = n => { if (n.visible === false) return;
    if (isPhone(n) && n.absoluteBoundingBox) { if (shown(n) < 0.5) { out.hidden.screens++; return; } screenNodes.push(n); out.screens.push([n.id, bi, n.name.slice(0, 40), ...box(n)]); return; }
    if ('children' in n) for (const c of n.children) walk(c); };
  walk(b);
});
// panels: dialogs, sheets, popups and menus drawn beside the phones (not inside one). A frame of dialog size counts
// (frame, instance or group) when its name says so or an arrow starts or ends within 40 pt of it; the outermost wins. Kept as screens with 'panel' set.
const PANEL = /dialog|popup|pop-up|sheet|toast|alert|modal|tooltip|menu|snackbar|leave|confirm/i;
const phones = new Set(screenNodes.map(n => n.id));
const inPhone = n => { for (let q = n.parent; q && q.type !== 'PAGE'; q = q.parent) if (phones.has(q.id)) return true; return false; };
const ends = vectors.flatMap(({ pts }) => [pts[0], pts[pts.length - 1]]);
const panelIds = new Set();
boardNodes.forEach((b, bi) => {
  const cands = b.findAll(n => (n.type === 'FRAME' || n.type === 'INSTANCE' || n.type === 'COMPONENT' || n.type === 'GROUP') && !phones.has(n.id)
    && n.width >= 160 && n.width <= 460 && n.height >= 50 && n.height <= 700 && n.absoluteBoundingBox && !inPhone(n)
    && (PANEL.test(n.name) || ends.some(([x, y]) => inside(n.absoluteBoundingBox, x, y, 40)))
    && !!n.findOne(t => t.type === 'TEXT' && t.visible !== false));
  for (const n of cands) {
    let nested = false; for (let q = n.parent; q && q !== b; q = q.parent) if (cands.includes(q)) nested = true;
    if (nested || shown(n) < 0.5) continue;
    panelIds.add(n.id); screenNodes.push(n); out.screens.push([n.id, bi, n.name.slice(0, 40), ...box(n), 'panel']);
  }
});
screenNodes.forEach((s, si) => {
  const panel = panelIds.has(s.id);
  const sb = s.absoluteBoundingBox, bi = out.screens[si][1];
  const visit = (n, parent) => {
    if (n.visible === false) return;
    let me = parent;
    // in a panel any button-shaped frame with one short text is a button (dialog actions are often plain frames)
    const short = () => { const ts = n.findAll(t => t.type === 'TEXT' && t.visible !== false); return ts.length === 1 && ts[0].characters.trim().split(/\s+/).length <= 4; };
    // a `btn` / `back` frame that only wraps icon or button instances is a holder: the instances inside are the controls
    const wraps = () => !!n.findOne(x => x.type === 'INSTANCE' && x.visible !== false && TAP.test(x.name) && !SKIP.test(x.name));
    const asFrame = (n.type === 'FRAME' && TAPFRAME.test(n.name.trim()) && n.width <= 400 && n.height <= 140 && !wraps())
      || (panel && (n.type === 'FRAME' || n.type === 'INSTANCE') && n.height >= 24 && n.height <= 64 && n.width >= 40 && n.width <= 420 && short());
    if ((n.type === 'INSTANCE' || asFrame) && n !== s) {
      if (SKIP.test(n.name)) return;
      if ((asFrame || TAP.test(n.name)) && n.absoluteBoundingBox) {
        if (shown(n) < 0.5) { out.hidden.controls++; return; }
        const b = n.absoluteBoundingBox, t = n.findOne(x => x.type === 'TEXT' && x.visible !== false);
        const label = t ? t.characters.replace(/\s+/g, ' ').trim().slice(0, 40) : '';
        const rx = R(b.x - sb.x), ry = R(b.y - sb.y);
        const key = `${bi}|${n.name}|${label}|${Math.round(rx / 24)},${Math.round(ry / 24)}`;
        if (!ctlIdx.has(key)) { ctlIdx.set(key, out.controls.length); out.controls.push([nameOf(n.name.slice(0, 48)), label, rx, ry, R(b.width), R(b.height), n.id, [], parent]); }
        const ci = ctlIdx.get(key), c = out.controls[ci];
        if (!c[7].includes(si)) c[7].push(si);
        inst.push({ ci, si, b });
        me = ci;
        if (b.width < 120 || b.height < 60) return; // small controls hold no separate buttons
      }
    }
    if ('children' in n) for (const c of n.children) visit(c, me);
  };
  for (const c of s.children) visit(c, -1);
});
const screenAt = (x, y, pad) => { let best = -1, area = Infinity; screenNodes.forEach((s, i) => { const b = s.absoluteBoundingBox; if (inside(b, x, y, pad) && b.width * b.height < area) { best = i; area = b.width * b.height; } }); return best; };
for (const { v, board, pts } of vectors) {
  const [tx, ty] = pts[0], [hx, hy] = pts[pts.length - 1];
  const from = screenAt(tx, ty, 4), to = screenAt(hx, hy, 24);
  let src = -1, area = Infinity;
  for (const it of inst) if ((from < 0 || it.si === from) && inside(it.b, tx, ty, 6) && it.b.width * it.b.height < area) { src = it.ci; area = it.b.width * it.b.height; }
  let toNode = '', toName = '';
  if (to < 0) {
    const hits = board.findAll(n => n.visible !== false && n.type !== 'VECTOR' && n.type !== 'LINE' && n.type !== 'TEXT' && inside(n.absoluteBoundingBox, hx, hy, 12));
    hits.sort((a, b) => a.width * a.height - b.width * b.height);
    const h = hits.find(n => n.width > 40 && n.height > 30);
    if (h) { toNode = h.id; const t = 'findOne' in h ? h.findOne(x => x.type === 'TEXT' && x.visible !== false) : null; toName = `${h.name}${t ? ` 「${t.characters.replace(/\s+/g, ' ').slice(0, 30)}」` : ''}`.slice(0, 60); }
  }
  out.arrows.push([v.id, v.name.slice(0, 60), pts.flat(), from, src, to, toNode, toName]);
}
out.size = JSON.stringify(out).length;
return out;
