<title>AI Mini Drama eBug Review</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: a single triage column — batch decisions on top, one ticket card per entry, then the record panels.
   Ticket cards carry their severity as a left stripe that recolours live. */
:root{
  --bg:#eef1f3; --panel:#ffffff; --ink:#17222b; --muted:#5b6974; --line:#d5dce1; --soft:#f5f7f8;
  --accent:#1f5f8b; --accent-ink:#ffffff; --warn:#a15c00; --warn-bg:#fff3df;
  --s1:#c62828; --s2:#e0661b; --s3:#b38b00; --s4:#6d7a84; --s5:#8f9aa3;
  --ok:#2e7d4f; --hold-op:.45;
  --display:"IBM Plex Sans Condensed","Arial Narrow",system-ui,sans-serif;
  --body:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,"SF Mono",Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#12181d; --panel:#1a2229; --ink:#e3e9ee; --muted:#94a3ae; --line:#2c3842; --soft:#212b33;
  --accent:#6fb1e0; --accent-ink:#0d1a24; --warn:#f0b05a; --warn-bg:#33270f;
  --s1:#ef5350; --s2:#ff8a3d; --s3:#d9b42a; --s4:#93a1ab; --s5:#7d8a93; --ok:#5cc28a; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#12181d; --panel:#1a2229; --ink:#e3e9ee; --muted:#94a3ae; --line:#2c3842; --soft:#212b33;
  --accent:#6fb1e0; --accent-ink:#0d1a24; --warn:#f0b05a; --warn-bg:#33270f;
  --s1:#ef5350; --s2:#ff8a3d; --s3:#d9b42a; --s4:#93a1ab; --s5:#7d8a93; --ok:#5cc28a; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:15px/1.5 var(--body);margin:0}
.wrap{max-width:1060px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px;display:grid;gap:22px}
h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0;line-height:1.15}
h1{font-size:clamp(26px,4vw,36px);font-weight:700}
h2{font-size:21px;font-weight:600}
.eyebrow{font:500 12px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.lede{color:var(--muted);max-width:68ch;margin:6px 0 0}
dl.facts{display:flex;flex-wrap:wrap;gap:10px 28px;margin:0;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:8px}
dl.facts div{min-width:0}
dl.facts dt{font:500 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
dl.facts dd{margin:2px 0 0;font-weight:600;font-variant-numeric:tabular-nums}
.need{color:var(--warn)}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:16px;display:grid;gap:12px;min-width:0}
.decisions{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.decisions label{display:grid;gap:6px;font-weight:600}
.decisions small{color:var(--muted);font-weight:400}
input[type=text],select,textarea{font:inherit;color:var(--ink);background:var(--soft);border:1px solid var(--line);border-radius:6px;padding:7px 9px;width:100%;min-width:0}
input.pending{border-color:var(--warn);background:var(--warn-bg)}
.radios{display:grid;gap:6px}
.radios label{display:flex;gap:8px;align-items:flex-start;font-weight:500}
.radios input{margin-top:4px}
.tally{display:flex;flex-wrap:wrap;gap:8px}
.chip{display:inline-flex;align-items:center;gap:6px;font:500 12px/1 var(--mono);padding:5px 8px;border-radius:999px;border:1px solid var(--line);background:var(--soft);white-space:nowrap}
.chip b{font-weight:600}
.chip.dup{border-color:var(--warn);color:var(--warn);background:var(--warn-bg)}
.chip.s1{color:var(--s1)}.chip.s2{color:var(--s2)}.chip.s3{color:var(--s3)}
.cal{color:var(--muted);font-size:14px;max-width:80ch;margin:0}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
button{font:600 14px var(--body);border-radius:6px;border:1px solid var(--line);background:var(--panel);color:var(--ink);padding:7px 12px;cursor:pointer}
button.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.card{background:var(--panel);border:1px solid var(--line);border-left:5px solid var(--sevc,var(--s3));border-radius:8px;padding:16px 16px 14px;display:grid;gap:12px;min-width:0;transition:opacity .2s}
.card.held{opacity:var(--hold-op)}
.card.held:hover,.card.held:focus-within{opacity:1}
.head{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:baseline}
.fid{font:700 17px var(--display);color:var(--sevc)}
.head h3{font-size:19px;font-weight:600;flex:1 1 280px;min-width:0}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.why{margin:0;max-width:75ch}
.sd{font:500 13px/1.45 var(--mono);background:var(--soft);border:1px solid var(--line);border-radius:6px;padding:8px 10px;overflow-wrap:anywhere}
details{border:1px solid var(--line);border-radius:6px;background:var(--soft)}
details summary{cursor:pointer;padding:7px 10px;font-weight:600;font-size:14px}
details pre{margin:0;padding:0 10px 10px;font:13px/1.5 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere}
.strip{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.strip button{padding:0;border:1px solid var(--line);background:var(--soft);flex:0 0 auto;width:104px;position:relative}
.strip img{display:block;width:104px;height:150px;object-fit:cover;object-position:top;border-radius:5px}
.strip span{position:absolute;right:4px;bottom:4px;font:500 11px var(--mono);background:var(--panel);color:var(--ink);border-radius:4px;padding:1px 4px}
.myread{border-left:3px solid var(--accent);padding:8px 12px;background:var(--soft);border-radius:0 6px 6px 0;font-size:14px}
.myread b{color:var(--accent);font-family:var(--display);letter-spacing:.02em}
.dupbox{border:1px solid var(--warn);background:var(--warn-bg);border-radius:6px;padding:8px 12px;font-size:14px}
.bar{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;border-top:1px solid var(--line);padding-top:12px}
.bar .file{display:flex;gap:6px;align-items:center;font-weight:600}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.seg button{border:0;border-radius:0;padding:6px 10px;background:var(--soft);font-variant-numeric:tabular-nums}
.seg button+button{border-left:1px solid var(--line)}
.seg button[aria-pressed="true"]{background:var(--sevc);color:#fff}
.bar select{width:auto}
.ctx{flex:1 1 260px;display:grid;gap:4px;min-width:0}
.ctx span{font:600 12px var(--body);color:var(--accent)}
.ctx textarea{min-height:38px;resize:vertical}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;border-bottom:1px solid var(--line);padding:6px 8px;vertical-align:top}
th{font:500 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.tbl{overflow-x:auto}
.mono{font-family:var(--mono);font-size:13px}
#out{font:12px/1.45 var(--mono);min-height:180px;white-space:pre}
.lb{position:fixed;inset:0;background:rgba(5,10,14,.86);display:grid;grid-template-rows:1fr auto;gap:10px;padding:calc(16px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(16px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));z-index:9}
.lb img{max-width:100%;max-height:100%;margin:auto;object-fit:contain;min-height:0}
.lb .cap{color:#e9eef2;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;text-align:center}
.lb .cap button{background:#26323b;color:#e9eef2;border-color:#3a4852}
@media (max-width:560px){.strip img{height:130px}.head h3{flex-basis:100%}}
@media (prefers-reduced-motion:reduce){.card{transition:none}}
</style>

<div class="wrap">
  <header style="display:grid;gap:10px">
    <div class="eyebrow">pdr-spec-casebook · PowerDirector Mobile for iOS · eBug filing review</div>
    <h1>AI Mini Drama — 31 findings from the 118-case run</h1>
    <p class="lede">These cards are the eBug entries exactly as they would be filed. For each one, set file or hold, severity, owner and type, and add any context. Then use Copy decisions and paste the result back. Nothing has been filed.</p>
    <dl class="facts">
      <div><dt>Version</dt><dd>16.9.0</dd></div>
      <div><dt>Build No</dt><dd>189631 (TestFlight)</dd></div>
      <div><dt>Server</dt><dd>Developer Server</dd></div>
      <div><dt>Device</dt><dd>iPhone 17 Air · iOS 26.2.1</dd></div>
      <div><dt>Account</dt><dd class="need">needed</dd></div>
      <div><dt>TRCode</dt><dd class="need">TR261014-0058? confirm</dd></div>
      <div><dt>Template</dt><dd>PowerDirector iOS 16.9 (IF3 23158)</dd></div>
    </dl>
  </header>

  <section class="panel" aria-labelledby="bd">
    <h2 id="bd">Batch decisions</h2>
    <div class="decisions">
      <label for="acct">Filing account (Creator)
        <input type="text" id="acct" class="pending" placeholder="ECL login, e.g. ETHAN_HSU">
        <small>Never inferred. Becomes Creator on every ticket.</small>
      </label>
      <label for="tag">Source tag
        <input type="text" id="tag" class="pending" value="AIAgent">
        <small>Placeholder. [AIFound] is reserved for the exploration suite, and the spec agent already files as [AIAgent]. Pick the casebook's tag.</small>
      </label>
      <label for="tr">TRCode
        <input type="text" id="tr" class="pending" value="TR261014-0058">
        <small>The 16.9.0.189631 TR (status Done, due 2026-10-16; you are a tester on it). Confirm, or give the current one.</small>
      </label>
      <div class="radios" role="radiogroup" aria-labelledby="mlab">
        <span id="mlab" style="font-weight:600">Filing method</span>
        <label><input type="radio" name="method" id="m-api" value="API" checked> API (new way) <small>ecl_if3.py create plus attachment upload. The template is IF3 (23158), so this works.</small></label>
        <label><input type="radio" name="method" id="m-web" value="Browser form"> Browser form (old way) <small>ECL web form through the browser pane, every field by hand.</small></label>
      </div>
    </div>
  </section>

  <section class="panel" aria-labelledby="tl">
    <h2 id="tl">Where the run landed</h2>
    <div class="tally" id="tally"></div>
    <p class="cal"><b>Calibration:</b> since 2026-10-01 the PowerDirector Mobile for iOS pool is 61% Sev 2 and 37% Sev 3; Sev 1 is 1.6% (4 tickets). This batch proposes one S1 (video never completes), six S2 and the rest S3. Copy and spec-conflict items stay at S3 because the pool almost never uses Sev 4. Nine entries already exist in ECL, so they start on <b>hold</b> with the matching ticket named. Reopen or comment on those instead of filing.</p>
    <div class="toolbar">
      <button type="button" id="fileAll">File all except duplicates</button>
      <button type="button" id="holdAll">Hold all</button>
      <button type="button" id="reset">Reset to proposal</button>
    </div>
  </section>

  <main id="cards" style="display:grid;gap:16px"></main>

  <section class="panel" aria-labelledby="nf">
    <h2 id="nf">Reproduced but deliberately not filed</h2>
    <p class="cal" style="margin:0">Duplicates found by the ECL search (162 AI Mini Drama tickets checked, every candidate read). They are on hold above. Their cards say whether to comment on or reopen the existing ticket.</p>
    <div class="tbl"><table id="duptbl"><thead><tr><th>Entry</th><th>Existing ticket</th><th>Status</th><th>What to do</th></tr></thead><tbody></tbody></table></div>
    <p class="cal" style="margin:0">Not raised at all: the AI renaming a drama mid-flow (O-3), reopened chats dropping your own messages (O-4, matches the History info text), and Back from a History-opened chat returning to History (O-6). The 「Generate with AI」 echo bubble (O-9) is folded into entry 19.</p>
  </section>

  <section class="panel" aria-labelledby="gp">
    <h2 id="gp">Gaps you should know about</h2>
    <p class="cal" style="margin:0">22 cases are <b>Blocked</b>, with no verdict. Most need a working video (TC-086 fails 3/3) or a state this account or device can't reach. Fault injection used the Pink debug menu, and all of its toggles were set back to Off at the end. Evidence comes from screenshots only; audio (narration) could not be checked.</p>
    <div class="tbl"><table id="blk"><thead><tr><th>Case</th><th>Why it could not run</th></tr></thead><tbody></tbody></table></div>
  </section>

  <section class="panel" aria-labelledby="cd">
    <h2 id="cd">Copy decisions</h2>
    <div class="toolbar"><button type="button" class="primary" id="copy">Copy decisions</button><span id="copied" class="cal" role="status"></span></div>
    <textarea id="out" readonly aria-label="Decisions table"></textarea>
  </section>
</div>

<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Evidence">
  <img id="lbimg" alt="">
  <div class="cap"><button type="button" id="lbprev">← Prev</button><span id="lbcap"></span><button type="button" id="lbnext">Next →</button><button type="button" id="lbclose">Close</button></div>
</div>

<script>
const DATA = /*__DATA__*/null;
const KEY = "amd-ebug-review-20261016";
const SEVC = {1:"var(--s1)",2:"var(--s2)",3:"var(--s3)",4:"var(--s4)",5:"var(--s5)"};
const BELONGS = ["RD","PM","PC-Doc","PC-Art","Setup Kit","Marketing","RD-ECL"];
const TYPES = ["Functional","UI","UX"];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const proposal = () => Object.fromEntries(DATA.entries.map(e => [e.iss, {action:e.action, sev:e.sev, belong:e.belong, type:e.type, note:""}]));
let st = {d: proposal(), acct:"", tag:"AIAgent", tr:"TR261014-0058", method:"API"};
try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.d) st = {...st, ...s, d:{...st.d, ...s.d}}; } catch(e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e) {} };

function tally(){
  const c = DATA.counts, d = Object.values(st.d);
  const fileN = d.filter(x => x.action === "file").length;
  const sev = n => d.filter(x => x.action === "file" && +x.sev === n).length;
  document.getElementById("tally").innerHTML =
    `<span class="chip"><b>118</b> cases run</span><span class="chip" style="color:var(--ok)"><b>${c.Pass||0}</b> pass</span><span class="chip s1"><b>${c.Fail||0}</b> fail</span><span class="chip"><b>${c.Blocked||0}</b> blocked</span>` +
    `<span class="chip"><b>${DATA.entries.length}</b> entries</span><span class="chip"><b>${fileN}</b> to file</span><span class="chip"><b>${DATA.entries.length - fileN}</b> on hold</span>` +
    `<span class="chip s1">S1 <b>${sev(1)}</b></span><span class="chip s2">S2 <b>${sev(2)}</b></span><span class="chip s3">S3 <b>${sev(3)}</b></span>`;
}

function card(e){
  const s = st.d[e.iss];
  const el = document.createElement("article");
  el.className = "card" + (s.action === "hold" ? " held" : "");
  el.id = "e" + e.n;
  el.style.setProperty("--sevc", SEVC[s.sev]);
  const chips = [`<span class="chip">${esc(e.iss)}</span>`, `<span class="chip">Reproduced ${e.out}/${e.times}</span>`,
    ...e.cases.map(c => `<span class="chip">${esc(c)}</span>`),
    e.dup ? `<span class="chip dup">Duplicate? ${esc(e.dup.code)}</span>` : "",
    e.imgs.length ? "" : `<span class="chip dup">Evidence gap</span>`].join("");
  el.innerHTML = `
    <div class="head"><span class="fid">F-${e.n}</span><h3>${esc(e.title)}</h3></div>
    <div class="chips">${chips}</div>
    <p class="why">${esc(e.why)}</p>
    <div class="sd">${esc(e.short)}</div>
    <details><summary>Repro steps, result and note as filed</summary><pre>${esc(e.desc)}</pre></details>
    <div class="strip">${e.imgs.map((im,i) => `<button type="button" data-n="${e.n}" data-i="${i}" aria-label="Open ${esc(im.name)}"><img src="${im.src}" alt="${esc(im.name)}" loading="lazy"><span>${i+1}/${e.imgs.length}</span></button>`).join("")}</div>
    ${e.dup ? `<div class="dupbox"><b>Already in ECL:</b> ${esc(e.dup.code)} (${esc(e.dup.status)}). ${esc(e.dup.text)}</div>` : ""}
    ${e.related ? `<div class="dupbox">${esc(e.related)}</div>` : ""}
    <div class="myread"><b>My read</b> ${esc(e.note)}</div>
    <div class="bar">
      <label class="file"><input type="checkbox" id="f-${e.n}" ${s.action === "file" ? "checked" : ""}> File</label>
      <div class="seg" role="group" aria-label="Severity">${[1,2,3,4,5].map(n => `<button type="button" data-sev="${n}" aria-pressed="${+s.sev === n}">${n}</button>`).join("")}</div>
      <label>Owner <select id="b-${e.n}">${BELONGS.map(b => `<option ${b === s.belong ? "selected" : ""}>${b}</option>`).join("")}</select></label>
      <label>Type <select id="t-${e.n}">${TYPES.map(t => `<option ${t === s.type ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <label class="ctx" for="c-${e.n}"><span>Add context — what am I missing?</span><textarea id="c-${e.n}" rows="1">${esc(s.note)}</textarea></label>
    </div>`;
  el.querySelector(`#f-${e.n}`).addEventListener("change", ev => { s.action = ev.target.checked ? "file" : "hold"; el.classList.toggle("held", !ev.target.checked); upd(); });
  el.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
    s.sev = +b.dataset.sev; el.style.setProperty("--sevc", SEVC[s.sev]);
    el.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); upd(); }));
  el.querySelector(`#b-${e.n}`).addEventListener("change", ev => { s.belong = ev.target.value; upd(); });
  el.querySelector(`#t-${e.n}`).addEventListener("change", ev => { s.type = ev.target.value; upd(); });
  el.querySelector(`#c-${e.n}`).addEventListener("input", ev => { s.note = ev.target.value; upd(); });
  el.querySelectorAll(".strip button").forEach(b => b.addEventListener("click", () => openLb(+b.dataset.n, +b.dataset.i)));
  return el;
}

function render(){
  const m = document.getElementById("cards"); m.innerHTML = "";
  DATA.entries.forEach(e => m.appendChild(card(e)));
  upd();
}

function decisions(){
  const cell = v => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const tag = (st.tag || "").replace(/[\[\]\s]/g, "");
  const L = [`Account: ${st.acct || "(needed)"}`, `Method: ${st.method}`, `Source tag: [${tag || "(needed)"}]`, `TRCode: ${st.tr || "(needed)"}`, "",
    "| # | ISS | Sev | Belong | Type | Action | Short Description | Note |", "|---|---|---|---|---|---|---|---|"];
  DATA.entries.forEach(e => {
    const s = st.d[e.iss];
    const short = e.short.replace("[AIAgent]", `[${tag || "AIAgent"}]`).replace(/\]\[(Functional)\]/, "]");
    L.push(`| F-${e.n} | ${e.iss} | ${s.sev} | ${s.belong} | ${s.type} | ${s.action}${e.dup && s.action === "hold" ? " (dup " + e.dup.code + ")" : ""} | ${cell(short)} | ${cell(s.note)} |`);
  });
  return L.join("\n");
}
function upd(){ tally(); document.getElementById("out").value = decisions(); save(); }

for (const [id, k] of [["acct","acct"],["tag","tag"],["tr","tr"]]) {
  const el = document.getElementById(id); el.value = st[k] ?? el.value;
  el.addEventListener("input", () => { st[k] = el.value.trim(); upd(); });
}
document.querySelectorAll('input[name="method"]').forEach(r => { r.checked = r.value === st.method; r.addEventListener("change", () => { st.method = r.value; upd(); }); });
document.getElementById("fileAll").addEventListener("click", () => { DATA.entries.forEach(e => st.d[e.iss].action = e.dup ? "hold" : "file"); render(); });
document.getElementById("holdAll").addEventListener("click", () => { DATA.entries.forEach(e => st.d[e.iss].action = "hold"); render(); });
document.getElementById("reset").addEventListener("click", () => { st.d = proposal(); render(); });
document.getElementById("copy").addEventListener("click", () => {
  const t = document.getElementById("out"), msg = document.getElementById("copied");
  navigator.clipboard.writeText(t.value).then(() => { msg.textContent = "Copied. Paste it back in the chat."; })
    .catch(() => { t.focus(); t.select(); msg.textContent = "Copy was blocked. The text is selected; press Cmd+C."; });
});

const dtb = document.querySelector("#duptbl tbody");
DATA.entries.filter(e => e.dup).forEach(e => { dtb.insertAdjacentHTML("beforeend", `<tr><td><a href="#e${e.n}">F-${e.n}</a> ${esc(e.title)}</td><td class="mono">${esc(e.dup.code)}</td><td>${esc(e.dup.status)}</td><td>${esc(e.dup.text)}</td></tr>`); });
const btb = document.querySelector("#blk tbody");
DATA.blocked.forEach(([k, why]) => btb.insertAdjacentHTML("beforeend", `<tr><td class="mono">${esc(k)}</td><td>${esc(why)}</td></tr>`));

let lbE = null, lbI = 0;
const lb = document.getElementById("lb");
function openLb(n, i){ lbE = DATA.entries.find(e => e.n === n); lbI = i; showLb(); lb.hidden = false; document.getElementById("lbclose").focus(); }
function showLb(){ const im = lbE.imgs[lbI]; document.getElementById("lbimg").src = im.src; document.getElementById("lbimg").alt = im.name;
  document.getElementById("lbcap").textContent = `F-${lbE.n} · ${lbI+1} of ${lbE.imgs.length} · ${im.name}`; }
const step = d => { lbI = (lbI + d + lbE.imgs.length) % lbE.imgs.length; showLb(); };
document.getElementById("lbprev").onclick = () => step(-1);
document.getElementById("lbnext").onclick = () => step(1);
document.getElementById("lbclose").onclick = () => { lb.hidden = true; };
lb.addEventListener("click", ev => { if (ev.target === lb) lb.hidden = true; });
document.addEventListener("keydown", ev => { if (lb.hidden) return; if (ev.key === "Escape") lb.hidden = true; if (ev.key === "ArrowLeft") step(-1); if (ev.key === "ArrowRight") step(1); });

render();
</script>
