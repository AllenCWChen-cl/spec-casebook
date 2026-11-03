"""Blueprint pieces from the A7 logcats, for DRA262610P0420 / DRA262610P0421.

The release build keeps blueprint.json in app-private storage (not debuggable, adb backup excludes data on targetSdk 36),
so this pulls what logcat recorded about each session: every MiniDrama line naming the session, the multi-line prompt
blocks sent to the image / video tools, the character and beat objects that survived logcat's ~4,100-character line cut,
and the cut-off heads of the blueprint the plan step sends as its prompt. Secrets are dropped as in logx.py.

    python3 -I blueprint_extract.py   ->  ../blueprint-extract/<bugcode>/ (zipped by hand with ../blueprint-extract/README.md)
"""
import json, os, re, shutil, sys, zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logx import DROP, logfiles  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "blueprint-extract"))

SESSIONS = {
    "DRA262610P0420": ("261029_193738_69bb0cf5", "Hidden Identity: a Mine character's face turns about 25 years younger in the full episode's clips"),
    "DRA262610P0421": ("261029_171551_db193be2", "Trapped Together: asking to update two characters charges for and regenerates three"),
}
HEAD = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d{3})\s+(\d+)\s+(\d+) \w ([^:]+?): ?(.*)$")
PROMPT_TOOL = re.compile(r"\[TOOL\] (RefToVideo|ImageToVideo|TextToVideo|TextToImage|ImageToImage)\b.*prompt=")
SECRET = re.compile(r"sToken=\[[^\]]*\]|(member_?token|access_?token)[\"=:]+[^,\s\"]+", re.I)


def records():
    """Log lines as (file, time, pid, tid, tag, msg), with untagged continuation lines kept in order."""
    for f in logfiles():
        seg = os.path.basename(os.path.dirname(f))
        for raw in open(f, encoding="utf-8", errors="replace"):
            m = HEAD.match(raw.rstrip("\n"))
            if m:
                yield (seg, *m.groups())


def unescape(s):
    return s.replace('\\\\', '\x00').replace('\\"', '"').replace('\\n', '\n').replace('\\/', '/').replace('\x00', '\\')


def objects(text, key):
    """Complete JSON objects starting with {"<key>": in text (and in its unescaped copies)."""
    found, variants = [], [text]
    for _ in range(3):
        variants.append(unescape(variants[-1]))
    for t in variants:
        for m in re.finditer(r'\{"' + key + '":', t):
            depth, instr, esc = 0, False, False
            for i in range(m.start(), len(t)):
                c = t[i]
                if instr:
                    esc = (c == '\\' and not esc)
                    if c == '"' and not esc and t[i - 1] != '\\':
                        instr = False
                    continue
                if c == '"':
                    instr = True
                elif c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
                    if depth == 0:
                        try:
                            found.append(json.loads(t[m.start():i + 1]))
                        except ValueError:
                            pass
                        break
    return found


def scrub(s):
    return SECRET.sub("<dropped>", s)


def extract(code, sid, title):
    d = os.path.join(OUT, code)
    os.makedirs(d, exist_ok=True)
    log, prompts, heads = [], [], []
    chars, beats = {}, {}
    block, last = None, {}
    for seg, t, pid, tid, tag, msg in records():
        if not tag.startswith("MiniDrama"):
            block = None
            continue
        line = f"{t} [{seg}] {tag}: {msg}"
        if block is not None:
            if (pid, tid, t[:19]) == block[0] and not msg.startswith("["):
                block[1].append(msg)
                continue
            block = None
        if "tool_dispatch" in msg:
            last[(pid, tid)] = sid in msg
        if sid not in msg and not (PROMPT_TOOL.search(msg) and last.get((pid, tid))):
            continue
        if DROP.search(msg) and "[TOKEN]" in msg:
            continue
        log.append(scrub(line))
        if PROMPT_TOOL.search(msg):
            block = ((pid, tid, t[:19]), [f"=== {t} [{seg}] {msg}"])
            prompts.append(block[1])
        m = re.search(r'\[TOOL\] tool_dispatch: (\w+) args=.*?"(?:user_)?prompt":"((?:[^"\\\\]|\\\\.)*)', msg)
        if m and "{\\\"blueprint" not in m.group(2)[:20]:
            prompts.append([f"=== {t} [{seg}] {m.group(1)} (from tool_dispatch args{', line cut' if len(msg) > 4000 else ''})",
                            unescape(m.group(2))])
        if '"prompt":"{\\"blueprint\\"' in msg:
            i = msg.index('"prompt":"{\\"blueprint\\"')
            heads.append(f"=== {t} [{seg}] line cut at {len(msg)} chars\n" + unescape(msg[i + 10:]))
        for o in objects(msg, "age") + objects(msg, "asset_id"):
            if "asset_id" in o and str(o["asset_id"]).startswith("char_") and ("age" in o or "look" in o):
                chars.setdefault(o["asset_id"], []).append({"time": t, "segment": seg, **o})
        for o in objects(msg, "beat_id"):
            beats.setdefault(o["beat_id"], []).append({"time": t, "segment": seg, **o})

    def latest_versions(objs):
        out = {}
        for k, vs in objs.items():
            uniq = []
            for v in vs:
                body = {x: y for x, y in v.items() if x not in ("time", "segment")}
                if not uniq or {x: y for x, y in uniq[-1].items() if x not in ("time", "segment")} != body:
                    uniq.append(v)
            out[k] = uniq
        return out

    write(d, "session-log.txt", "\n".join(log))
    write(d, "tool-prompts.txt", "\n\n".join("\n".join(b) for b in prompts))
    write(d, "blueprint-prompt-heads.txt", "\n\n".join(heads))
    write(d, "characters.json", json.dumps(latest_versions(chars), ensure_ascii=False, indent=2))
    write(d, "beats.json", json.dumps(latest_versions(beats), ensure_ascii=False, indent=2))
    return {"code": code, "sid": sid, "title": title, "lines": len(log), "prompts": len(prompts),
            "heads": len(heads), "chars": len(chars), "beats": len(beats),
            "ages": {k: sorted({str(v["age"]) for v in vs if "age" in v}) for k, vs in chars.items()},
            "names": {k: sorted({v.get("name") for v in vs if v.get("name")}) for k, vs in chars.items()}}


def write(d, name, text):
    with open(os.path.join(d, name), "w", encoding="utf-8") as fh:
        fh.write(text + "\n")


def main():
    shutil.rmtree(OUT, ignore_errors=True)
    stats = [extract(c, *v) for c, v in SESSIONS.items()]
    json.dump(stats, open(os.path.join(OUT, "stats.json"), "w"), ensure_ascii=False, indent=2)
    for s in stats:
        print(f"{s['code']} {s['sid']}: {s['lines']} lines, {s['prompts']} prompt blocks, {s['heads']} blueprint heads, "
              f"{s['chars']} characters, {s['beats']} beats")
        for k in s["ages"]:
            print(f"   {k} {s['names'][k]} ages {s['ages'][k]}")


if __name__ == "__main__":
    main()
