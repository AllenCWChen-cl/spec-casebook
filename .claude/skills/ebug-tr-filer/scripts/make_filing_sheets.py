# -*- coding: utf-8 -*-
"""Build the images that get attached to the TR: one captioned evidence sheet per ticket, with a red
rectangle around the problem area on every frame that has one in boxes.json.

    <venv>/bin/python3 make_filing_sheets.py <session>/upload \
        [--boxes <session>/upload/boxes.json] [--captions captions.json] \
        [--out <session>/upload_filing] [--version 16.9.0] [--no-sheet]

Reads <upload>/bodies.json (drafts_to_bodies.py output) and the staged frames beside it. Writes
<out>/<version>_<slug>_evidence.jpg per ticket and <out>/bodies.json whose descriptions cite the sheet
instead of the separate frames. --no-sheet keeps the frames separate (IF3 API upload, several
attachments) and only draws the boxes; bodies.json is then copied through unchanged.

boxes.json — {filename: [[x0, y0, x1, y1], ...]}, one list per frame:
  * values 0..1 are fractions of the frame (preferred: they survive any resize or crop-to-mirror),
    values > 1 are pixels of the staged source file;
  * the stroke is drawn OUTSIDE the given box, so it never covers the text it points at;
  * [] means "deliberately unmarked" (a spec frame or healthy control); a cited frame with no key at
    all is reported as a warning so a missed box is visible before filing.

The stroke is BOX_WIDTH px in the delivered JPEG — drawn after the frame is scaled to the sheet
height, never before, because staged phone frames are ~500 px tall and get upscaled ~2x.
Needs Pillow: `pip install -r requirements.txt` in a venv (see the README).
"""
import argparse, json, os, re, shutil, sys
from PIL import Image, ImageDraw, ImageFont

BOX_WIDTH = 5
BOX_RGB = (255, 0, 0)
SHEET_H = 1100            # every frame is scaled to this height on the sheet
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"


def scale_box(box, src_size, dst_size):
    """Box in fractions (all values <= 1) or source pixels -> pixels of the image being drawn on."""
    (sw, sh), (dw, dh) = src_size, dst_size
    if all(0 <= v <= 1 for v in box):
        x0, y0, x1, y1 = box[0] * dw, box[1] * dh, box[2] * dw, box[3] * dh
    else:
        x0, y0, x1, y1 = box[0] * dw / sw, box[1] * dh / sh, box[2] * dw / sw, box[3] * dh / sh
    return min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)


def draw_boxes(im, boxes, src_size, width=BOX_WIDTH):
    """Red `width`-px rectangle just outside each box, clamped so the full stroke stays on the image."""
    d = ImageDraw.Draw(im)
    W, H = im.size
    for b in boxes:
        x0, y0, x1, y1 = scale_box(b, src_size, im.size)
        x0, y0 = max(0, round(x0) - width), max(0, round(y0) - width)
        x1, y1 = min(W - 1, round(x1) + width - 1), min(H - 1, round(y1) + width - 1)
        d.rectangle([x0, y0, x1, y1], outline=BOX_RGB, width=width)
    return im


def load_frame(path, boxes, height=None):
    im = Image.open(path).convert("RGB")
    src = im.size
    if height:
        im = im.resize((max(1, round(im.width * height / im.height)), height), Image.LANCZOS)
    return draw_boxes(im, boxes, src) if boxes else im


def composite(frames, dst, boxes, captions):
    font = ImageFont.truetype(FONT, 26)
    panels = []
    for i, f in enumerate(frames, 1):
        im = load_frame(f, boxes.get(os.path.basename(f)), SHEET_H)
        w = max(im.width, 460)
        d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        lines, cur = [], ""
        for wd in f"{i}. {captions.get(os.path.basename(f), '')}".split():
            t = (cur + " " + wd).strip()
            if d.textlength(t, font=font) > w - 24 and cur:
                lines.append(cur); cur = wd
            else:
                cur = t
        lines.append(cur)
        bar = 20 + 34 * len(lines)
        p = Image.new("RGB", (w, SHEET_H + bar), (22, 32, 43))
        dr = ImageDraw.Draw(p)
        for j, l in enumerate(lines):
            dr.text((12, 10 + 34 * j), l, font=font, fill=(255, 255, 255))
        p.paste(im, ((w - im.width) // 2, bar))
        panels.append(p)
    g = 16
    S = Image.new("RGB", (sum(p.width for p in panels) + g * (len(panels) + 1),
                          max(p.height for p in panels) + 2 * g), (243, 245, 247))
    x = g
    for p in panels:
        S.paste(p, (x, g)); x += p.width + g
    S.save(dst, "JPEG", quality=80, optimize=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("upload", help="staged upload folder holding bodies.json and the cited frames")
    ap.add_argument("--boxes", help="boxes.json (default: <upload>/boxes.json if present)")
    ap.add_argument("--captions", help="{filename: caption} JSON for the sheet's caption bars")
    ap.add_argument("--out", help="default: <upload>_filing")
    ap.add_argument("--version", help="attachment prefix; default: taken from the first cited file name")
    ap.add_argument("--no-sheet", action="store_true", help="keep frames separate, only draw the boxes")
    a = ap.parse_args()

    up = os.path.abspath(a.upload.rstrip("/"))
    out = a.out or up + "_filing"
    os.makedirs(out, exist_ok=True)
    bp = a.boxes or os.path.join(up, "boxes.json")
    boxes = json.load(open(bp, encoding="utf-8")) if os.path.exists(bp) else {}
    captions = json.load(open(a.captions, encoding="utf-8")) if a.captions else {}
    bodies = json.load(open(os.path.join(up, "bodies.json"), encoding="utf-8"))

    unmarked, errors = [], []
    for f, bl in boxes.items():
        for b in bl:
            if len(b) != 4:
                errors.append(f"{f}: box {b} is not [x0, y0, x1, y1]")
    for k, b in bodies.items():
        for f in b["files"]:
            if not os.path.exists(os.path.join(up, f)):
                errors.append(f"{k}: {f} is cited but not staged in {up}")
            elif f not in boxes:
                unmarked.append(f"{k}: {f}")
    if errors:
        sys.exit("\n".join(["ERROR"] + errors))

    for k, b in bodies.items():
        if a.no_sheet:
            for f in b["files"]:
                if not f.lower().endswith((".png", ".jpg", ".jpeg")):
                    shutil.copy(os.path.join(up, f), os.path.join(out, f)); continue  # log excerpts etc. ship as-is
                load_frame(os.path.join(up, f), boxes.get(f)).save(os.path.join(out, f), "JPEG", quality=85)
            continue
        ver = a.version or re.match(r"(\d+(?:\.\d+)+)_", b["files"][0]).group(1)
        slug = b.get("iss", k).lower().replace("iss-", "").replace("-", "")
        sheet = f"{ver}_{slug}_evidence.jpg"
        composite([os.path.join(up, f) for f in b["files"]], os.path.join(out, sheet), boxes, captions)
        cites = " ".join("{" + f + "}" for f in b["files"])
        if cites not in b["desc"]:
            sys.exit(f"ERROR {k}: description does not cite its frames as one run: {cites}")
        b["desc"] = b["desc"].replace(cites, "{" + sheet + "}")
        b["files"] = [sheet]

    json.dump(bodies, open(os.path.join(out, "bodies.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for f in sorted(os.listdir(out)):
        print(f"{f}  {os.path.getsize(os.path.join(out, f)) // 1024} KB")
    marked = sum(1 for bl in boxes.values() if bl)
    print(f"\n{marked} frame(s) boxed, {BOX_WIDTH}px red.")
    if unmarked:
        print("WARNING — no entry in boxes.json (add a box, or [] if it is a spec/control frame):")
        print("\n".join("  " + u for u in unmarked))


if __name__ == "__main__":
    main()
