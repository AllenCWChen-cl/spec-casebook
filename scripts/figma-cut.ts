// Cut a coverage board out of larger Figma screenshots (user, 2026-10-30). A board the PM and MX reads joined from
// tiles (or a region of loose layers in a frame) is no Figma node, so get_screenshot cannot take it alone: capture the
// frame that holds it (the largest scale Figma returns: 1:1 when it fits, else maxDimension 20000) and cut the
// board's box out. Later sources are pasted over earlier ones, so a low-scale frame can fill the edges of a 1:1 node.
// The output takes the largest source scale. Then record it: figma-check.ts --shot <png> <board id> --box <box>.
// Usage: node scripts/figma-cut.ts <out.png> --box x,y,w,h --src <png>@<x>,<y>,<scale> [--src …]
//   x, y   canvas point of the screenshot's top-left (the node's box; a section render has a 40-pt margin round it)
//   scale  screenshot pixels per canvas point (returned width / original_width)
// Needs Python 3 with Pillow (as figma-check.ts --shot).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { arg } from './lib/library.ts';

const out = process.argv[2], box = arg('box')?.split(',').map(Number);
const srcs = process.argv.flatMap((a, i) => a === '--src' ? [process.argv[i + 1]] : []).map(s => {
  const m = s?.match(/^(.+)@(-?[\d.]+),(-?[\d.]+),([\d.]+)$/);
  if (!m || !existsSync(m[1])) { console.error(`--src <png>@<x>,<y>,<scale>: ${s}`); process.exit(2); }
  return [m[1], +m[2], +m[3], +m[4]];
});
if (!out || out.startsWith('--') || box?.length !== 4 || box.some(n => !Number.isFinite(n)) || !srcs.length) {
  console.error('Usage: node scripts/figma-cut.ts <out.png> --box x,y,w,h --src <png>@<x>,<y>,<scale> [--src …]'); process.exit(2);
}
const py = `import json, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
out, (x, y, w, h), srcs = sys.argv[1], json.loads(sys.argv[2]), json.loads(sys.argv[3])
scale = max(s[3] for s in srcs)
ims = [Image.open(f).convert('RGB') for f, *_ in srcs]
img = Image.new('RGB', (round(w * scale), round(h * scale)), ims[0].getpixel((0, 0)))
for im, (f, ox, oy, s) in zip(ims, srcs):
  l, t, r, b = (x - ox) * s, (y - oy) * s, (x + w - ox) * s, (y + h - oy) * s
  cl, ct, cr, cb = max(0, l), max(0, t), min(im.width, r), min(im.height, b)
  if cr <= cl or cb <= ct: continue
  piece, k = im.crop((round(cl), round(ct), round(cr), round(cb))), scale / s
  if k != 1: piece = piece.resize((round(piece.width * k), round(piece.height * k)), Image.LANCZOS)
  img.paste(piece, (round((cl - l) * k), round((ct - t) * k)))
img.save(out)
print(f'{out}: {img.width} x {img.height} px, {scale:.3f} px per point')`;
const r = spawnSync('python3', ['-I', '-c', py, out, JSON.stringify(box), JSON.stringify(srcs)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
