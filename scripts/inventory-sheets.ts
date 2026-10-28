// Review sheets for the Figma inventory (REQ-038 / REQ-040): every screen of the Design PDF cropped with its control
// boxes drawn, so a reviewer can find tappable elements the inventory missed and boxes on things that are not tappable.
// Usage: node scripts/inventory-sheets.ts <feature> <spec-set folder> [--board "<name>,…"] [--scale 1.5] [--band 25] [--out <dir>]
// --band: megapixels per render (lower it when a large board fails with "malloc … failed")
// Writes <out>/<board>/<nn>-<screen id>.png (local only) and <out>/sheets.json: per screen its image, the controls drawn
// (id, group, kind, layer, label, box in screen points and in image pixels) and the OCR lines inside the screen that no
// box covers (`uncovered`: short texts are likely buttons or links drawn without a component). Default out:
// specs/<set>/extracted/inventory-sheets/. Box colours: button red, item blue, input green, toggle / tab purple.
// The PDF is parsed once into a display list; each row of screens is one render, cut into screens. `edges` is the
// mean edge strength inside the frame: near 0 means the PDF does not draw that frame (hidden, blurred or clipped in
// Figma), so its controls are not on the design (`in_pdf: false` = a Figma-only board, not checked).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as mupdf from 'mupdf';
import { arg, assertIds, featureDir, writeJson } from './lib/library.ts';

const [feature, folder] = process.argv.slice(2);
if (!feature || !folder) { console.error('Usage: node scripts/inventory-sheets.ts <feature> <spec-set folder> [--board <names>] [--scale 1.5] [--out <dir>]'); process.exit(2); }
assertIds(feature, 'ios');
const specDir = join(featureDir(feature), 'specs', folder), ex = join(specDir, 'extracted');
const inv = JSON.parse(readFileSync(join(ex, 'inventory.json'), 'utf8'));
const out = arg('out') ?? join(ex, 'inventory-sheets'), scale = Number(arg('scale') ?? 1.5);
const only = arg('board')?.split(',').map(s => s.trim());
const file: any = Object.values(inv.files).find((f: any) => f.pdf);
if (!file) { console.error('No Design PDF offset in inventory.json (inventory.ts sets it when the PDF matches the section)'); process.exit(1); }
const [dx, dy] = file.pdf.offset;

// OCR lines of the Design boards, in figma coordinates
const ocr: { x: number; y: number; text: string }[] = [];
const bdir = join(ex, 'boards');
if (existsSync(bdir)) for (const f of readdirSync(bdir).filter(f => /^ds-.*\.md$/.test(f)))
  for (const l of readFileSync(join(bdir, f), 'utf8').split('\n')) {
    const m = l.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/); if (m) ocr.push({ y: +m[1] - dy, x: +m[2] - dx, text: m[3].replace(' (?)', '').trim() });
  }

const t0 = Date.now();
const doc = mupdf.Document.openDocument(readFileSync(join(specDir, file.pdf.name)), 'application/pdf');
const list = doc.loadPage(0).toDisplayList();
console.log(`display list ready in ${Math.round((Date.now() - t0) / 1000)} s`);
const COLOR: Record<string, [number, number, number]> = { button: [230, 40, 40], item: [40, 110, 255], input: [20, 200, 60], toggle: [170, 60, 220], tab: [170, 60, 220] };
const ctlsOf = new Map<string, any[]>();
for (const c of inv.controls) for (const s of c.screens) ctlsOf.set(s, [...(ctlsOf.get(s) ?? []), c]);
const sheets: any[] = [];
const byBoard = new Map<string, any[]>();
for (const s of inv.screens) byBoard.set(s.board, [...(byBoard.get(s.board) ?? []), s]);
// boards the PDF lacks (figma-frames.json: in_pdf false) cannot be checked against it
const figmaOnly = new Set((existsSync(join(ex, 'figma-frames.json')) ? JSON.parse(readFileSync(join(ex, 'figma-frames.json'), 'utf8')).frames : [])
  .filter((fr: any) => fr.in_pdf === false).flatMap((fr: any) => [fr.node, fr.frame].filter(Boolean)));
for (const [board, scrs] of byBoard) {
  if (only && !only.includes(board)) continue;
  const dir = join(out, board.replace(/[^\w-]+/g, '-'));
  mkdirSync(dir, { recursive: true });
  scrs.sort((a: any, b: any) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
  const pad = 12, inPdf = !figmaOnly.has(file.boards[board]?.id);
  // a board with a saved Figma screenshot (extracted/figma/<board>.png, board origin, 1 px = 1 pt) is cut from it;
  // a Figma-only board needs one
  const shotPath = join(ex, 'figma', `${board.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`);
  // a saved Figma screenshot of the board wins over the PDF too: the PDF can lag the Figma file (MX's 1016 frames)
  const shot = existsSync(shotPath) ? new mupdf.Image(readFileSync(shotPath)).toPixmap() : null;
  if (!inPdf && !shot) { console.log(`${board}: Figma-only and no ${shotPath}; skipped`); continue; }
  // one render per row of screens (screens whose boxes overlap vertically), then each screen is cut out of the row
  const rows: any[][] = [];
  for (const sc of scrs) { const r = rows.find(r => r.some((o: any) => sc.box[1] < o.box[1] + o.box[3] && o.box[1] < sc.box[1] + sc.box[3])); r ? r.push(sc) : rows.push([sc]); }
  // each render replays the whole page (~1 min), so neighbouring rows share one render up to ~25 Mpx (the wasm heap fails near 60)
  const span = (r: any[]) => { const xs = r.flatMap((s: any) => [s.box[0], s.box[0] + s.box[2]]), ys = r.flatMap((s: any) => [s.box[1], s.box[1] + s.box[3]]);
    return (Math.max(...xs) - Math.min(...xs) + 2 * pad) * (Math.max(...ys) - Math.min(...ys) + 2 * pad) * scale * scale; };
  rows.sort((a, b) => Math.min(...a.map((s: any) => s.box[1])) - Math.min(...b.map((s: any) => s.box[1])));
  for (let k = 0; k + 1 < rows.length;) { if (span([...rows[k], ...rows[k + 1]]) <= Number(arg("band") ?? 25) * 1e6) { rows[k].push(...rows[k + 1]); rows.splice(k + 1, 1); } else k++; }
  let i = 0;
  for (const row of rows) {
    const x0 = Math.min(...row.map((s: any) => s.box[0])) - pad, y0 = Math.min(...row.map((s: any) => s.box[1])) - pad;
    const x1 = Math.max(...row.map((s: any) => s.box[0] + s.box[2])) + pad, y1 = Math.max(...row.map((s: any) => s.box[1] + s.box[3])) + pad;
    const sc = shot ? 1 : scale, [ox, oy] = shot ? [-file.boards[board].box[0], -file.boards[board].box[1]] : [dx, dy];
    const sb: [number, number, number, number] = [Math.floor((x0 + ox) * sc), Math.floor((y0 + oy) * sc), Math.ceil((x1 + ox) * sc), Math.ceil((y1 + oy) * sc)];
    let strip: any;
    if (shot) { strip = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, sb, false); strip.clear(255);
      const sp0 = shot.getPixels(), sn0 = shot.getNumberOfComponents(), /* n already counts alpha */ ss0 = shot.getStride(), tp = strip.getPixels(), ts = strip.getStride();
      for (let v = 0; v < sb[3] - sb[1]; v++) for (let u = 0; u < sb[2] - sb[0]; u++) { const X = sb[0] + u, Y = sb[1] + v; if (X < 0 || Y < 0 || X >= shot.getWidth() || Y >= shot.getHeight()) continue;
        const so = Y * ss0 + X * sn0, to = v * ts + u * 3; tp[to] = sp0[so]; tp[to + 1] = sp0[so + 1]; tp[to + 2] = sp0[so + 2]; } }
    else { strip = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, sb, false); strip.clear(255);
      const dev = new mupdf.DrawDevice(mupdf.Matrix.scale(scale, scale), strip); list.run(dev, mupdf.Matrix.identity); dev.close(); }
    const sp = strip.getPixels(), sStride = strip.getStride(), sn = strip.getNumberOfComponents();
    for (const s of row) {
      const [x, y, w, h] = s.box;
      const bbox: [number, number, number, number] = [Math.floor((x + ox - pad) * sc), Math.floor((y + oy - pad) * sc), Math.ceil((x + ox + w + pad) * sc), Math.ceil((y + oy + h + pad) * sc)];
      const pix = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, bbox, false);
      const W = pix.getWidth(), H = pix.getHeight(), px = pix.getPixels(), n = pix.getNumberOfComponents(), stride = pix.getStride();
      for (let v = 0; v < H; v++) { const so = (bbox[1] - sb[1] + v) * sStride + (bbox[0] - sb[0]) * sn; px.set(sp.subarray(so, so + W * sn), v * stride); }
      // edge energy inside the frame: a drawn UI has text and edges; a frame Figma hides (blur, mask, opacity, clipped
      // by its board) shows nearly none in the PDF
      let e = 0, cnt = 0;
      for (let v = Math.round(pad * sc); v < H - pad * sc - 1; v += 2) for (let u = Math.round(pad * sc); u < W - pad * sc - 1; u += 2) {
        const o = v * stride + u * n; e += Math.abs(px[o] - px[o + n]) + Math.abs(px[o] - px[o + stride]); cnt++; }
      const edges = Math.round(e / Math.max(cnt, 1) * 100) / 100;
      const put = (u: number, v: number, c: [number, number, number]) => { if (u < 0 || v < 0 || u >= W || v >= H) return; const o = v * stride + u * n; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; };
      const rect = (u0: number, v0: number, u1: number, v1: number, c: [number, number, number], t = 3) => {
        for (let k = 0; k < t; k++) { for (let u = u0; u <= u1; u++) { put(u, v0 + k, c); put(u, v1 - k, c); } for (let v = v0; v <= v1; v++) { put(u0 + k, v, c); put(u1 - k, v, c); } }
      };
      const toPx = (bx: number, by: number) => [Math.round((bx + pad) * sc), Math.round((by + pad) * sc)];
      const controls = (ctlsOf.get(s.id) ?? []).map((c: any) => {
        const [u0, v0] = toPx(c.box[0], c.box[1]), [u1, v1] = toPx(c.box[0] + c.box[2], c.box[1] + c.box[3]);
        rect(u0, v0, u1, v1, COLOR[c.kind] ?? COLOR.button);
        return { id: c.id, group: c.group, kind: c.kind, layer: c.name, label: c.label, box: c.box, px: [u0, v0, u1, v1] };
      });
      const uncovered = ocr.filter(o => o.x >= x && o.x <= x + w && o.y >= y && o.y <= y + h)
        .map(o => ({ text: o.text, at: [Math.round(o.x - x), Math.round(o.y - y)] }))
        .filter(o => !controls.some((c: any) => o.at[0] >= c.box[0] - 4 && o.at[0] <= c.box[0] + c.box[2] + 4 && o.at[1] >= c.box[1] - 4 && o.at[1] <= c.box[1] + c.box[3] + 4));
      const img = join(dir, `${String(++i).padStart(2, '0')}-${s.id.replace(/[:;]/g, '-')}.png`);
      writeFileSync(img, pix.asPNG());
      pix.destroy(); // the wasm heap is small next to the display list: free each crop right away
      sheets.push({ board, screen: s.id, name: s.name, platform: s.platform, panel: !!s.panel, image: img, size: [W, H], scale: sc, pad, in_pdf: inPdf, edges, controls, uncovered });
    }
    strip.destroy();
  }
  console.log(`${board}: ${scrs.length} screens in ${rows.length} rows (${Math.round((Date.now() - t0) / 1000)} s)`);
}
writeJson(join(out, only ? `sheets-${only.join('_').replace(/[^\w-]+/g, '-')}.json` : 'sheets.json'), sheets);
console.log(JSON.stringify({ out, screens: sheets.length, seconds: Math.round((Date.now() - t0) / 1000) }));
