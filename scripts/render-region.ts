// Render a region of a spec PDF page to PNG, to look at a screen design next to the extracted text.
// Uses MuPDF (WebAssembly build from npm); macOS's renderer draws very large Figma canvas pages blank.
// Usage: node scripts/render-region.ts <pdf> <out.png> [x y w h] [--max 2000] [--page 1]
//   x y w h: PDF points, top-left origin, as listed in boards.json or read off an overview render. Omit for the whole page.
//   --max caps the longest output side in pixels (default 2000; scale never exceeds 4x).
import { readFileSync, writeFileSync } from 'node:fs';
import * as mupdf from 'mupdf';

const args = process.argv.slice(2);
const opt = (name: string, def: number) => { const i = args.indexOf(name); if (i < 0) return def; const v = Number(args[i + 1]); args.splice(i, 2); return v; };
const maxSide = opt('--max', 2000), pageNo = opt('--page', 1);
if (args.length !== 2 && args.length !== 6) { console.error('Usage: node scripts/render-region.ts <pdf> <out.png> [x y w h] [--max 2000] [--page 1]'); process.exit(2); }
const [pdf, out] = args;
const doc = mupdf.Document.openDocument(readFileSync(pdf), 'application/pdf');
const page = doc.loadPage(pageNo - 1);
const [bx0, by0, bx1, by1] = page.getBounds();
const [x, y, w, h] = args.length === 6 ? args.slice(2).map(Number) : [0, 0, bx1 - bx0, by1 - by0];
const scale = Math.min(maxSide / Math.max(w, h), 4);
// MuPDF page space is already top-left origin; scale the page, then cut the requested box out of device space.
const bbox: [number, number, number, number] = [Math.floor((bx0 + x) * scale), Math.floor((by0 + y) * scale), Math.ceil((bx0 + x + w) * scale), Math.ceil((by0 + y + h) * scale)];
const pix = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, bbox, false);
pix.clear(255);
const dev = new mupdf.DrawDevice(mupdf.Matrix.scale(scale, scale), pix);
page.run(dev, mupdf.Matrix.identity);
dev.close();
writeFileSync(out, pix.asPNG());
console.log(`${out} ${pix.getWidth()}x${pix.getHeight()} (scale ${scale.toFixed(3)})`);
