# -*- coding: utf-8 -*-
import re,os,sys,collections,unicodedata
def _find_idx():   # repo-relative (was hard-coded to one machine's home, 2026-10-12)
    import os as _o; d=_o.path.dirname(_o.path.realpath(__file__))
    while d!='/' and not _o.path.isdir(_o.path.join(d,'Figma','_index')): d=_o.path.dirname(d)
    return _o.path.join(d,'Figma','_index')
IDX=_find_idx()
SPEC={"20260825_eBug_drafts_AI-Anime-Video_16.7.5.md":[2,8,9,10,11,12,21,26,28,29,30,32,34,35,36,37,43,44,48,51,52,53],
      "20260826_eBug_drafts_Character-Motion-Swap_16.7.5.md":[5,7,9,13,14,16,17,24,25,27,28,30,32],
      # mx-scenario-suite batches are keyed by MX-<SCN>-NN and reconcile against 情境步驟 rows, not ▲ rows
      "20260827_eBug_drafts_UX-01-Make-a-photo-move_16.7.0.md":list(range(1,21)),
      "20260901_eBug_drafts_Mine-Page_16.8.0.md":[1,2,3,4,8,10,13,14,15,16,18,20,25,28,29,32,33],
      # 2026-09-02 regression pass over the three 0901 reports; row maps key on the verification
      # report's step numbers, and rows with no step (a finding minted this pass) use an em dash.
      "20260902_eBug_drafts_AI-Cartoon_16.7.5.md":[30,36,37,38],
      "20260902_eBug_drafts_AI-Sketch_16.7.5.md":[26,27,28,29,31,32,33,34,35,39,40],
      "20260902_eBug_drafts_Mine-Page_16.7.5.md":[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
      # 2026-09-04 re-verification of the UX-01..UX-04 scenario runs on 16.7.5 (188575).
      # These batches reconcile PER FINDING (the pass re-exercises findings, not journey steps),
      # so the row-map "步驟 N" column is the finding's ordinal in the source report finding list.
      "20260904_eBug_drafts_UX-01-Make-a-photo-move_16.7.5.md":list(range(1,12)),
      "20260904_eBug_drafts_UX-02-Auto-captions_16.7.5.md":list(range(1,20)),
      "20260904_eBug_drafts_UX-03-Video-Enhance_16.7.5.md":list(range(1,7)),
      "20260904_eBug_drafts_UX-04-AI-Storytelling_16.7.5.md":list(range(1,6))}
# Batches that intentionally ship WITHOUT `Spec Link:` lines (no Figma URL on record for the sheet).
# Quoted `Spec string (...)` values are still verified — against the sheet the Description names in prose.
NOLINK={"20260901_eBug_drafts_Mine-Page_16.8.0.md":
        [("Template Page - 7_1 & 7_E support AI Magic & Me",
          "Template Page - 7_1 & 7_E support AI Magic & Me.md")],
        "20260902_eBug_drafts_Mine-Page_16.7.5.md":
        [("Template Page - 7_1 & 7_E support AI Magic & Me",
          "Template Page - 7_1 & 7_E support AI Magic & Me.md")]}
SHEETFILE={"Speed Ramp SPEC":"Speed Ramp - SPEC (live).md",
           "Mine page - Launcher Template Page (UGC)":"Template Page - 7_1 & 7_E support AI Magic & Me.md",
           "Text to image support model list":"Text to image - Text to image support model list.md",
           "TTI add aspect ratio":"Text to image - TTI add aspect ratio.md",
           "Text to image select mode":"Text to image - Select mode.md",
           "11/E Only leep photo bg mode":"Character Motion Swap - 11_E Only leep photo bg mode.md",
           "12/E Add keep video bg":"Character Motion Swap - 12_E Add keep video bg.md",
           "12/E Support trim & sample":"Character Motion Swap - 12_E Support trim & sample.md",
           "6/E Add Kling Control":"Character Motion Swap - 6_E Add Kling Control.md",
           "8/E Launcher supports banner (TBD)":"Template Page - Launcher supports banner (TBD) (8_E).md",
           "Pro+ user bubble tag":"Template Page -  Pro+ user bubble tag.md",
           "Text To Video - model list":"Text To Video - model list.md",
           # AI Mini Drama (2026-09-24): live Figma 10.GM layer transcript + stale 0629 board
           "10.GM AI Mini Drama home page":"AI Mini Drama - 10.GM.md",
           "10.GM main flow":"AI Mini Drama - 10.GM.md",
           "10.GM MX":"AI Mini Drama - 10.GM.md",
           "10.GM Recent Task":"AI Mini Drama - 10.GM.md",
           "Design Spec 0629 recent task":"AI Mini Drama.md",
           "10.GM Choose Character":"AI Mini Drama - 10.GM.md",
           "10.GM Storyboard":"AI Mini Drama - 10.GM.md",
           "10.GM video":"AI Mini Drama - 10.GM.md",
           "AI Mini Drama - PM Spec":"AI Mini Drama - PM Spec.md",
           "AI Minidrama - PDRM MX":"AI Minidrama - PDRM MX.md"}
AMBIG=collections.Counter(n.split(' ')[0] for n in SHEETFILE)   # 12/E -> 2, others -> 1
SHEET=re.compile(r'\b\d+/E\b|\bSFT\b|\bchecklist\b'); CITE=re.compile(r'\{([^}]*\.(?:png|jpg|jpeg|txt))\}')   # .txt = cited log excerpts (2026-10-12)
URL=re.compile(r'^Spec Link: (?:none - .+|.+ - https://www\.figma\.com/design/\S+)$')
def norm(t):
    t=unicodedata.normalize('NFKC',t).replace('’',"'").replace('“','"').replace('”','"').lower()
    return re.sub(r'\s+',' ',t)   # transcripts wrap mid-sentence; compare on collapsed whitespace
# Ad-hoc run on new batches: `python3 verify_ebug_drafts.py ebugs/<batch>.md ...`
# (run from the ebugs/ folder or pass paths). With no ▲-row list on record the row map
# is checked for completeness against the entries instead of against a fixed list.
if len(sys.argv) > 1:
    SPEC = {a: None for a in sys.argv[1:]}
fails=[]; warns=[]
def chk(c,m):
    if not c: fails.append(m)
for md,steps in SPEC.items():
    txt=open(md,encoding='utf-8').read(); imgroot=md[:-3]+"_images"; mdname=os.path.basename(md)
    heads=[(int(a),b,c,d,e,f) for a,b,c,d,e,f in re.findall(r'^## (\d+)\. (?:⛔ WITHDRAWN — )?((?:ISS|MX)-[A-Z0-9]+-\d+)(?: → \S+)? — (.+?)  ·  Class: (\w+)  ·  Severity: (S\d)  ·  Owner: ([\w-]+)\s*$',txt,re.M)]
    nums=[h[0] for h in heads]; ids=[h[1] for h in heads]; bodies=re.split(r'^## \d+\. ',txt,flags=re.M)[1:]
    wd=[n for n,_ in zip(nums,re.findall(r'^## \d+\. (⛔ WITHDRAWN — )?',txt,re.M)) ] and \
       [int(m) for m in re.findall(r'^## (\d+)\. ⛔ WITHDRAWN — ',txt,re.M)]
    chk(not wd or min(wd)>max(set(nums)-set(wd),default=0),f"{md}: filed entry after a withdrawn one")
    chk(not wd or re.search(r'^# ⛔ ',txt,re.M),f"{md}: withdrawn entries but no ⛔ section heading")
    chk(nums==list(range(1,len(nums)+1)),f"{md}: numbers"); chk(len(set(ids))==len(ids),f"{md}: dup id")
    nimg=nspec=maxsd=0; rep=[]; devs=set()
    for (n,iid,t,cls,sev,own),body in zip(heads,bodies):
        body=body.split('\n# Not raised')[0]
        desc=re.search(r'\*\*Description:\*\*\s*\n\s*```\n(.+?)\n```',body,re.S).group(1)
        sd=re.search(r'\*\*Short Description:\*\*\s*\n\s*```\n(.+?)\n```',body,re.S).group(1).strip(); maxsd=max(maxsd,len(sd))
        chk(len(sd)<=140,f"{md} e{n}: {len(sd)}>140")
        tags=re.findall(r'\[([A-Za-z]+)\]',sd.split(' - ',1)[-1].split(':')[0])
        chk(tags and tags[0] in ('AIFound','AIAgent','EDF','MXFound'),f"{md} e{n}: no source tag")
        chk((len(tags)==1) if cls=='Functional' else (cls in tags[1:]),f"{md} e{n}: tag vs Class {cls}")
        chk(desc.count('Device:')==1 and desc.count('<Claude Reviewed>')==1,f"{md} e{n}: note lines")
        prose=desc[:desc.rindex('Note:')]
        links=[l for l in desc.split('\n') if l.startswith('Spec Link:')]; nspec+=len(links)
        named=set(SHEET.findall(prose))
        chk(not named or links,f"{md} e{n} ({iid}): names {sorted(named)} but no Spec Link")
        linked=[]
        for l in links:
            chk(URL.match(l) is not None,f"{md} e{n}: malformed -> {l[:70]}")
            if l.startswith('Spec Link: none'): continue
            name=l.split('Spec Link: ')[1].split(' - http')[0]; linked.append(name)
            tag=name.split(' ')[0]
            # an ambiguous milestone (two sheets share it) must be named in full in the prose
            need = name if AMBIG[tag]>1 else tag
            chk(need in prose,f"{md} e{n} ({iid}): links '{name}' but Description never names {'that sheet in full' if AMBIG[tag]>1 else tag} (ambiguous={AMBIG[tag]>1})")
            f_=SHEETFILE.get(name); chk(f_ and os.path.exists(os.path.join(IDX,f_)),f"{md} e{n}: unknown sheet '{name}'")
        cands=[(nm,SHEETFILE[nm]) for nm in linked if nm in SHEETFILE]
        if not cands:   # no Spec Link by design -> fall back to sheets this entry names in prose
            cands=[(nm,f_) for nm,f_ in NOLINK.get(md,[]) if nm in prose]
        for q in re.findall(r'Spec string \([^)]*\): "([^"]+)"',prose):
            hit=[nm for nm,f_ in cands if norm(q) in norm(open(os.path.join(IDX,f_),encoding='utf-8').read())]
            chk(hit,f"{md} e{n} ({iid}): quoted spec string '{q}' not found in any cited sheet")
            if hit: rep.append(f"e{n} {iid}: \"{q}\" verified present in {', '.join(hit)}")
        note=[x for x in desc[desc.rindex('Note:'):].split('\n')[1:] if x.strip()]
        chk(note[0].startswith('Device:') and note[-1]=='<Claude Reviewed>',f"{md} e{n}: Note bookends")
        chk(all(x.startswith(('Spec Link:','Basis:','Related:')) for x in note[1:-1]),f"{md} e{n}: stray text in Note")
        if mdname[:8].isdigit() and mdname[:8]>='20261021':
            # reviewer rules (2026-10-21): every entry links its spec; one action per Repro step;
            # [UX] only on a Basis: External / None entry (RD) — check_ebug_format.py has the detail
            chk(any(not l.startswith('Spec Link: none') for l in links),f"{md} e{n} ({iid}): no Spec Link — every bug carries its link")
            steps_=desc.split('\nResult:')[0]
            chk(not re.search(r'^\s*\d+\.[^\n「“"]*\s(?:>|›|→)\s',steps_,re.M),f"{md} e{n} ({iid}): Repro step chains actions with '>'")
            if cls=='UX':
                chk(re.search(r'^Basis: (External|None)\b',desc,re.M),f"{md} e{n} ({iid}): Class UX needs 'Basis: External — …' or 'Basis: None — …'")
                # ALLOW_AGENT_UX=1 is the revert switch for the casebook (see check_ebug_format.py --allow-agent-ux)
                chk(tags[0]!='AIAgent' or os.environ.get('ALLOW_AGENT_UX')=='1',f"{md} e{n} ({iid}): [AIAgent] entries never carry [UX]")
        ipath=re.search(r'\*\*Images:\*\* `([^`]+)`',body).group(1).rstrip('/')
        pre=mdname[:9]
        chk(ipath.startswith(pre) or not mdname[:8].isdigit(),f"{md} e{n}: Images path lacks {pre} prefix")
        folder=ipath.split('/')[-1]
        chk(folder=="%02d_%s"%(n,iid),f"{md} e{n}: folder {folder}")
        d=os.path.join(imgroot,folder); cited=CITE.findall(body); onhand=set(os.listdir(d)); nimg+=len(onhand)
        for c in cited: chk(c in onhand,f"{md} e{n}: cited {c} missing")
        for f in onhand: chk(f in cited,f"{md} e{n}: {f} uncited")
        vpre=[c.split('_')[0] for c in cited if re.match(r'^\d+\.\d+\.\d+_',c)]
        if vpre: chk(cited[0].split('_')[0]==max(vpre,key=lambda v:[int(x) for x in v.split('.')]),f"{md} e{n}: newest capture must be cited first")
        dev=re.search(r'^Device: (.+)$',desc,re.M)
        chk(dev and dev.group(1).strip(),f"{md} e{n}: empty Device")
        if dev: devs.add(dev.group(1).strip())
    if len(devs)>1: warns.append(f"{md}: mixed Device lines across entries {sorted(devs)}")
    ot=re.search(r'### Owner split\n(?:(?!\|).*\n)*\|.+?\n\|[-| ]+\|\n((?:\|.*\n)+)',txt); got=[]
    chk(ot,f"{md}: no '### Owner split' table")
    for line in (ot.group(1).strip().split('\n') if ot else []):
        c=line.split('|')
        if len(c)>2: got+=[int(x) for x in re.findall(r'\b(\d+)\b',c[2])]
    chk(sorted(got)==nums or sorted(got)==sorted(set(nums)-set(wd)),f"{md}: owner split")
    h=next((x for x in ('### Suggested filing order','### Filing order') if x in txt),None)
    fsec=txt[txt.find(h):] if h else ''
    fon=sorted(int(x) for x in re.findall(r'\*\*(\d+)\*\*',fsec))
    if not fon:      # newer batches list every entry by ID in a plain table
        idnum={i:n for n,i in zip(nums,ids)}
        fon=sorted(idnum[i] for i in re.findall(r'(?:ISS|MX)-[A-Z0-9]+-\d+',fsec) if i in idnum)
    if h: chk(fon==nums or fon==sorted(set(nums)-set(wd)),f"{md}: filing order")
    _b=txt.find('### Row-by-row map'); _n=txt.find('\n### ',_b+1)
    seg=txt[_b:_n if _n>0 else len(txt)]
    mapped=sorted({int(x) for x in re.findall(r'\|\s*步驟 (\d+)',seg)})
    if not mapped:   # newer batches put the bare step number in the first column
        mapped=sorted({int(x) for x in re.findall(r'^\|\s*(\d+)\s*\|',seg,re.M)})
    if steps is None:
        seg_ids=set(re.findall(r'(?:ISS|MX)-[A-Z0-9]+-\d+',seg))
        chk(set(ids)<=seg_ids,f"{md}: row map omits {sorted(set(ids)-seg_ids)}")
        steps=mapped
    else:
        chk(mapped==sorted(steps),f"{md}: row map")
    print(f"{md}\n  {len(heads)} entries · {nimg} images · {nspec} Spec Link lines · {len(mapped)}/{len(steps)} ▲ rows · max ShortDesc {maxsd}")
    for r in rep: print("    ✓ "+r)
if warns: print("WARNINGS (not blocking):\n  " + "\n  ".join(warns))
print(("FAILED:\n  " + "\n  ".join(fails)) if fails else "ALL CHECKS PASS")
sys.exit(1 if fails else 0)
