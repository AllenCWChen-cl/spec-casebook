// Render a region of a spec PDF page as a grid of readable tiles, loading the file once and skipping empty tiles.
// Usage: node scripts/render-tiles.ts <pdf> <out dir> [x y w h] [--tile 2000x1300] [--scale 1] [--page 1] [--color rgb]
//   x y w h: region in PDF points (top-left origin, as listed in boards.json or read off an overview render); default the whole page.
//   Tiles overlap by 10% so text cut at one edge is whole in the neighbour. Files are named x<X>-y<Y>.png
//   (PDF points of the tile's top-left corner); index.json lists the tiles that were written.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as mupdf from 'mupdf';

const args = process.argv.slice(2);
const take = (name: string) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const [tw, th] = (take('--tile') ?? '2000x1300').split('x').map(Number);
const scale = Number(take('--scale') ?? 1), pageNo = Number(take('--page') ?? 1);
// Grayscale by default: a third of the memory, so strips can be taller and the page is replayed fewer times.
const color = take('--color') === 'rgb';
const CS = color ? mupdf.ColorSpace.DeviceRGB : mupdf.ColorSpace.DeviceGray, BPP = color ? 3 : 1;
if (args.length !== 2 && args.length !== 6) { console.error('Usage: node scripts/render-tiles.ts <pdf> <out dir> [x y w h] [--tile 2000x1300] [--scale 1] [--page 1]'); process.exit(2); }
const [pdf, outDir] = args;
mkdirSync(outDir, { recursive: true });
const doc = mupdf.Document.openDocument(readFileSync(pdf), 'application/pdf');
const page = doc.loadPage(pageNo - 1);
const [bx0, by0, bx1, by1] = page.getBounds();
const [rx, ry, rw, rh] = args.length === 6 ? args.slice(2).map(Number) : [0, 0, bx1 - bx0, by1 - by0];
const list = page.toDisplayList();   // parse the page once
const stepX = tw * 0.9, stepY = th * 0.9;
const written: { file: string; x: number; y: number; w: number; h: number }[] = [];
let skipped = 0;
// Draw the region in horizontal strips (each at most ~150 MB of pixels), then cut the tiles out of each strip.
// Replaying the whole page once per strip is far faster than once per tile on large Figma canvases.
// Work in column groups of at most 4 tiles so a strip stays small enough for MuPDF's WebAssembly memory.
const tileCols: number[] = [];
for (let x = rx; x < rx + rw; x += stepX) if (Math.min(tw, rx + rw - x) >= tw * 0.15) tileCols.push(x);
const tileRows: number[] = [];
for (let y = ry; y < ry + rh; y += stepY) if (Math.min(th, ry + rh - y) >= th * 0.15) tileRows.push(y);
for (let c = 0; c < tileCols.length; c += 4) {
const gx = tileCols[c], gCols = tileCols.slice(c, c + 4), gw = Math.min(gCols[gCols.length - 1] + tw, rx + rw) - gx;
const pxW = Math.ceil(gw * scale);
const maxStripPx = Math.max(th * scale, Math.floor(30e6 / BPP / pxW));
let i = 0;
while (i < tileRows.length) {
  // group consecutive tile rows into one strip
  const y0 = tileRows[i]; let j = i;
  while (j + 1 < tileRows.length && (Math.min(tileRows[j + 1] + th, ry + rh) - y0) * scale <= maxStripPx) j++;
  const y1 = Math.min(tileRows[j] + th, ry + rh);
  const sb: [number, number, number, number] = [Math.floor((bx0 + gx) * scale), Math.floor((by0 + y0) * scale), Math.ceil((bx0 + gx + gw) * scale), Math.ceil((by0 + y1) * scale)];
  const strip = new mupdf.Pixmap(CS, sb, false);
  strip.clear(255);
  const dev = new mupdf.DrawDevice(mupdf.Matrix.scale(scale, scale), strip);
  list.run(dev, mupdf.Matrix.identity);
  dev.close();
  const SW = strip.getWidth(), sp = strip.getPixels(), n = strip.getNumberOfComponents(), sStride = strip.getStride();
  for (let r = i; r <= j; r++) {
    const y = tileRows[r];
    for (const x of gCols) {
      const w = Math.min(tw, rx + rw - x), h = Math.min(th, ry + rh - y);
      const ox = Math.floor((x - gx) * scale), oy = Math.floor((y - y0) * scale);
      const TW = Math.min(Math.ceil(w * scale), SW - ox), TH = Math.min(Math.ceil(h * scale), strip.getHeight() - oy);
      // skip flat tiles (empty canvas or plain board background)
      let lo = 255, hi = 0;
      for (let yy = 0; yy < TH; yy += 7) for (let xx = 0; xx < TW; xx += 7) { const v = sp[(oy + yy) * sStride + (ox + xx) * n]; if (v < lo) lo = v; if (v > hi) hi = v; }
      if (hi - lo < 12) { skipped++; continue; }
      const tile = new mupdf.Pixmap(CS, [0, 0, TW, TH], false);
      const tp = tile.getPixels(), tStride = tile.getStride();
      for (let yy = 0; yy < TH; yy++) tp.set(sp.subarray((oy + yy) * sStride + ox * n, (oy + yy) * sStride + (ox + TW) * n), yy * tStride);
      const file = `x${Math.round(x)}-y${Math.round(y)}.png`;
      writeFileSync(join(outDir, file), tile.asPNG());
      written.push({ file, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
      tile.destroy();
    }
  }
  strip.destroy();
  i = j + 1;
}
}
writeFileSync(join(outDir, 'index.json'), JSON.stringify({ pdf, region: [rx, ry, rw, rh], tile: [tw, th], scale, tiles: written }, null, 2));
console.log(`${written.length} tiles written, ${skipped} empty skipped → ${outDir}`);
