// Minimal Appium (W3C WebDriver) client for running cases on the real QA iPhone through Appium + WebDriverAgent.
// Usage: node scripts/device.ts <run dir> <command> [args]
//   start [udid]              create a session (noReset) and remember it in <run dir>/.session (+ .udid, .wda-started)
//   restart [udid]            end the session, stop this phone's xcodebuild (the WDA process) and start a fresh one,
//                             then bring PowerDirector back to the front; run it at every segment start so one WDA never
//                             serves many hours. WDA stays installed: uninstalling it (useNewWDA) drops the phone's trust
//                             in the developer certificate, which only the user can restore on the phone.
//   install-wda [app path]    install the built WebDriverAgentRunner-Runner.app (newest in Xcode's DerivedData) with
//                             devicectl and leave it installed, so the phone keeps the QA certificate it can trust
//   status                    Appium status, whether the stored session is alive and how long WDA has been up
// WDA recovery (2026-10-27): a command that fails because WDA is gone (socket hang up, connection refused, dead
// session) restarts WDA once, re-activates PowerDirector and retries. When the phone is locked or Xcode holds a
// "preparation error" the restart cannot work: the script prints BLOCKER and exits 75 (unlock the phone, replug USB).
//   shot NAME                 save <run dir>/screenshots/NAME.png (device pixels)
//   els [filter]              visible accessible elements: type | name | label | value | x,y,w,h (points)
//   tap X Y | hold X Y [s]    tap / long-press at points
//   burst X Y [n]             n rapid taps (default 10) in one touch action, e.g. to reveal the in-app debug overlay
//   id NAME | lbl TEXT        tap element by accessibility id / first visible element whose name or label contains TEXT
//   drag X1 Y1 X2 Y2 [ms]     finger drag
//   scrollto TEXT [X TOP BOTTOM]  scroll the list under column X until the element whose name or label is exactly TEXT
//                             (any type: StaticText, Switch, Cell…) sits between TOP and BOTTOM, then print its line;
//                             exits 1 when both ends of the list are reached without it. Half-viewport steps, so no row
//                             is skipped. Pink panel: scrollto "Trip image moderation" 210 110 300
//   type TEXT                 type into the focused element
//   hidekb                    dismiss the software keyboard
//   clear NAME                clear the text of the element with accessibility id NAME
//   setval NAME TEXT          clear then set the element's text in one call (fast for long strings)
//   launch [--lang en|zh-Hant|ja] | terminate
//                             (re)activate / terminate PowerDirector; --lang relaunches it in that language through
//                             launch arguments (no iOS Settings change)
//   appearance [light|dark]   read or set Light/Dark mode (restore dark after a Light-mode case)
//   texts [NAME]              the visible on-screen strings only (labels of text, buttons, cells; ids and empty labels
//                             dropped, duplicates merged), top to bottom; with NAME also screenshots/NAME.png + NAME.txt.
//                             For text/language passes (rule 7): one compact read per screen instead of `els`.
//   source                    print the page source XML
//   wait SECONDS              sleep (keeps the session alive with a status call)
//   waitfor "A|B" [--gone] [--timeout S] [--every S]
//                             poll quietly (2–3 s a round) until any text is visible (or, --gone, none is); prints the
//                             elapsed seconds once. Use it instead of repeated `els` while something generates, and list
//                             the failure texts too so a failure ends the wait. Exits 1 with a screenshot on timeout.
//   tapif TEXT                tap the element named/labelled TEXT if it is visible, otherwise do nothing
//   expect "A|B" | expect-not "A|B"   fail unless one is visible / if any is (stops a recipe on a failure text)
//   pink open ["<group>"] | set "<row>" <on|off|option> | tap "<row>" | show | close | tier Free|Pro|Pro+|System
//                             Pink debug tweaks in one call each, from the Launcher (see the case for details); set and
//                             tier read the row back and save screenshots/pink-<row>-<time>.png
//   do <file.steps> [args…] | do "cmd ;; cmd ;; …"
//                             run many commands as one call (recipes: library/<feature>/<platform>/recipes/*.steps,
//                             "$1".."$9" from args, "?" before a line = may fail); stops at the first failure with a
//                             screenshot and the visible elements
//   logs [ID]                 pull the app's tmp/ folder (holds Logs.zip after ⋯ › Send logs via...) to
//                             <run dir>/logs/<ID>-<YYYYMMDD-HHMMSS>/ (just the time stamp without ID), unzip it and print the
//                             *_aidrama.txt summary (failures, toasts, stage timings, credit lines). Logs stay in the run folder.
//   ledger [ID]               on Mine › Credits › Details: read the visible ledger rows (feature, time, ±credits, e.g.
//                             「Generation failed, credits returned +60」) into <run dir>/ledger/<ID>-<time>.json and print them
// The Appium server and WebDriverAgent are shared services: this script never stops them, and `stop` only
// deletes the session this run created.
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const BASE = process.env.APPIUM_URL ?? 'http://127.0.0.1:4723';
const BUNDLE = process.env.PDR_BUNDLE ?? 'com.cyberlink.ios.powerdirector';
const [runDir, cmd, ...rest] = process.argv.slice(2);
if (!runDir || !cmd) { console.error('Usage: node scripts/device.ts <run dir> <command> [args]'); process.exit(2); }
mkdirSync(runDir, { recursive: true });
const SID = join(runDir, '.session');
const UDID_FILE = join(runDir, '.udid'), WDA_FILE = join(runDir, '.wda-started');
const BLOCKER = 75;
// xcodebuild code 70 behind these texts means the phone must be unlocked (or replugged) before WDA can launch.
const LOCKED = /unlocked|preparation error|passcode|Failed to allocate RSD|device is locked|xcodebuild failed with code 70/i;
const WDA_GONE = /socket hang up|ECONNREFUSED|Connection was refused|invalid session id|terminated or not started|WDA is not listening|Could not proxy command/i;
// Every command leaves a time stamp; run-log.ts `time` uses them to tell test time from idle waits.
try { appendFileSync(join(runDir, 'activity.log'), `${new Date().toISOString()} ${cmd} ${rest.join(' ').slice(0, 80)}\n`); } catch {}
const stamp = () => { const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };

async function call(method: string, path: string, body?: unknown, timeout = 300_000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
  const r = await fetch(BASE + path, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: ctl.signal });
  clearTimeout(t);
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${j?.value?.error ?? ''} ${String(j?.value?.message ?? '').slice(0, 400)}`);
  return j;
}
const sid = () => readFileSync(SID, 'utf8').trim();
const s = (method: string, path: string, body?: unknown) => call(method, `/session/${sid()}${path}`, body);
const mobile = (script: string, args: unknown = {}) => s('POST', '/execute/sync', { script: `mobile: ${script}`, args: [args] });
const pointer = (actions: unknown[]) => s('POST', '/actions', { actions: [{ type: 'pointer', id: 'f', parameters: { pointerType: 'touch' }, actions }] });
const sleep = (sec: number) => new Promise(r => setTimeout(r, sec * 1000));
const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const exactPred = (t: string) => `visible == 1 AND (name == "${esc(t)}" OR label == "${esc(t)}")`;
const visibleIds = async (pred: string): Promise<string[]> =>
  ((await s('POST', '/elements', { using: '-ios predicate string', value: pred })).value as object[]).map(v => Object.values(v)[0] as string);
const visibleContaining = async (t: string) =>
  (await visibleIds(`visible == 1 AND (name CONTAINS "${esc(t)}" OR label CONTAINS "${esc(t)}" OR value CONTAINS "${esc(t)}")`))[0];
// Lookup by a unique accessibility id without `visible == 1` (that predicate makes WDA compute visibility for the whole
// tree: ~4 s a query on the QA iPhone, against ~0.6 s without it); on-screen is then checked from the frame.
const byName = async (name: string) => {
  for (const id of await visibleIds(`name == "${esc(name)}"`)) {
    const r = (await s('GET', `/element/${id}/rect`)).value; if (r.width > 0 && r.height > 0 && r.y < 932 && r.y + r.height > 0) return id;
  }
  return undefined;
};
const waitIds = async (pred: string, secs: number) => { const end = Date.now() + secs * 1000;
  while (Date.now() < end) { const e = (await visibleIds(pred))[0]; if (e) return e; await sleep(0.5); } return undefined; };
const clickExact = async (t: string) => { const e = (await visibleIds(exactPred(t)))[0]; if (!e) throw new Error(`"${t}" not visible`); await s('POST', `/element/${e}/click`, {}); };
async function describe(id: string) {
  const [label, r] = await Promise.all([s('GET', `/element/${id}/attribute/label`).then(x => x.value).catch(() => ''), s('GET', `/element/${id}/rect`).then(x => x.value).catch(() => null)]);
  return `${String(label ?? '').slice(0, 120)}${r ? ` | ${r.x},${r.y},${r.width},${r.height}` : ''}`;
}
function blocker(why: string): never {
  console.error(`BLOCKER (device): ${why}\nUnlock the iPhone and leave it on the home screen; if that is not enough, unplug and replug the USB cable. Then: node scripts/device.ts <run dir> restart`);
  process.exit(BLOCKER);
}
// The last lines of the Appium server log, when APPIUM_LOG points at it (xcodebuild's own reason for code 70).
function appiumTail() { try { const f = process.env.APPIUM_LOG; if (!f) return ''; const b = readFileSync(f); return b.subarray(Math.max(0, b.length - 200_000)).toString('utf8'); } catch { return ''; } }
// Run another command without its own output (for composite commands).
async function quiet(c: string, a: string[]) { const o = console.log; console.log = () => {}; try { return await run(c, a); } finally { console.log = o; } }

// The XML of one element and everything inside it (first element whose name is NAME), or '' if absent.
function subtree(xml: string, name: string) {
  const start = xml.search(new RegExp(`<XCUIElementType\\w+ [^>]*name="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  if (start < 0) return '';
  let depth = 0;
  for (const m of xml.slice(start).matchAll(/<(\/?)XCUIElementType\w+[^>]*?(\/?)>/g)) {
    if (m[1]) depth--; else if (!m[2]) depth++;
    if (depth === 0) return xml.slice(start, start + m.index! + m[0].length);
  }
  return xml.slice(start);
}

function parseEls(xml: string, filter?: string) {
  const out: string[] = [];
  for (const m of xml.matchAll(/<(XCUIElementType\w+)([^>]*)>/g)) {
    const a = Object.fromEntries([...m[2].matchAll(/(\w+)="([^"]*)"/g)].map(x => [x[1], x[2]]));
    if (a.visible !== 'true') continue;
    const name = a.name ?? '', label = a.label ?? '', value = a.value ?? '';
    if (!name && !label && !value) continue;
    const line = `${m[1].replace('XCUIElementType', '')} | ${name} | ${label} | ${value} | ${a.x},${a.y},${a.width},${a.height}`;
    if (!filter || line.toLowerCase().includes(filter.toLowerCase())) out.push(line.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#10;/g, ' '));
  }
  return out;
}

// One automatic WDA restart per command when WDA has gone away; start / restart / stop / status are never retried.
async function runRecovering(c: string, a: string[]) {
  try { return await run(c, a); }
  catch (e: any) {
    const msg = String(e?.message ?? e);
    if (['start', 'restart', 'stop', 'status'].includes(c) || !WDA_GONE.test(msg) || !existsSync(UDID_FILE)) throw e;
    console.error(`WDA gone (${msg.slice(0, 120)}); restarting it once and retrying "${c}"`);
    try { appendFileSync(join(runDir, 'activity.log'), `${new Date().toISOString()} restart (auto, after: ${msg.slice(0, 60)})\n`); } catch {}
    await run('restart', []);
    return await run(c, a);
  }
}
async function run(cmd: string, rest: string[]): Promise<string | void> {
switch (cmd) {
  case 'start': {
    const udid = (rest[0] && !rest[0].startsWith('--') ? rest[0] : undefined) ?? (existsSync(UDID_FILE) ? readFileSync(UDID_FILE, 'utf8').trim() : undefined) ?? process.env.PDR_UDID;
    if (!udid) throw new Error('Pass the device UDID (xcrun xctrace list devices) or set PDR_UDID.');
    const caps = { platformName: 'iOS', 'appium:automationName': 'XCUITest', 'appium:udid': udid, 'appium:noReset': true,
      'appium:newCommandTimeout': 7200, 'appium:wdaLaunchTimeout': 180000, 'appium:wdaConnectionTimeout': 180000,
      // WDA signing (the QA team's, as the AT_PDRi suite uses it); without it a rebuild fails with "requires a development team".
      'appium:xcodeOrgId': process.env.PDR_WDA_TEAM ?? 'LR55RBG94F', 'appium:xcodeSigningId': 'Apple Development',
      'appium:updatedWDABundleId': process.env.PDR_WDA_BUNDLE ?? 'com.cyberlinkqa1-4.WebDriverAgentRunner',
      'appium:showXcodeLog': true,
      // PDR_WDA_PREINSTALLED=1 launches the WDA already on the phone through devicectl (no xcodebuild, never uninstalled),
      // but on iOS 26.2 with this WDA build it never listened on 8100 (10/27), so xcodebuild stays the default. Appium
      // uninstalls WDA after a failed xcodebuild launch; then `install-wda` and the user trusts the certificate again.
      ...(process.env.PDR_WDA_PREINSTALLED === '1' ? { 'appium:usePreinstalledWDA': true } : {}) };
    let r;
    try { r = await call('POST', '/session', { capabilities: { alwaysMatch: caps } }, 900_000); }
    catch (e: any) {
      const m = String(e?.message ?? e) + appiumTail();
      if (/not (been explicitly )?trusted/i.test(m)) blocker('WDA cannot launch: the phone does not trust the developer certificate. On the iPhone: Settings › General › VPN & Device Management › the Developer App certificate › Trust.');
      if (LOCKED.test(m)) blocker('WDA cannot launch (xcodebuild code 70): the phone is locked, or Xcode still holds a "preparation error" from an earlier lock.');
      if (/xcodebuild failed with code 6\d/.test(m)) blocker('WDA cannot launch (xcodebuild code 65): usually the phone no longer trusts the developer certificate (Settings › General › VPN & Device Management › Developer App › Trust), or the phone is locked. Set APPIUM_LOG to the Appium server log to see which.');
      throw e;
    }
    writeFileSync(SID, r.value.sessionId); writeFileSync(UDID_FILE, udid); writeFileSync(WDA_FILE, new Date().toISOString());
    console.log('session', r.value.sessionId);
    break;
  }
  case 'install-wda': {
    const udid = existsSync(UDID_FILE) ? readFileSync(UDID_FILE, 'utf8').trim() : process.env.PDR_UDID;
    const dd = join(process.env.HOME ?? '', 'Library/Developer/Xcode/DerivedData');
    const app = rest[0] ?? readdirSync(dd).filter(d => d.startsWith('WebDriverAgent-'))
      .map(d => join(dd, d, 'Build/Products/Debug-iphoneos/WebDriverAgentRunner-Runner.app')).filter(existsSync)
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
    if (!app) throw new Error('No built WebDriverAgentRunner-Runner.app in DerivedData; pass its path');
    // devicectl wants its own device identifier; map the UDID through `devicectl list devices`.
    let dev = udid ?? '';
    try {
      const out = join(runDir, '.devices.json');
      execFileSync('xcrun', ['devicectl', 'list', 'devices', '--json-output', out], { stdio: 'ignore' });
      const d = JSON.parse(readFileSync(out, 'utf8')).result.devices.find((x: any) => x.hardwareProperties?.udid === udid);
      if (d) dev = d.identifier;
    } catch {}
    execFileSync('xcrun', ['devicectl', 'device', 'install', 'app', '--device', dev, app], { stdio: 'inherit' });
    console.log(`installed ${app} — if the phone asks, trust the Developer App certificate (Settings › General › VPN & Device Management)`);
    break;
  }
  case 'restart': {
    // A fresh WDA process: P9 lost its run when one WDA had served 18.5 h and ~22,000 searches (2026-10-23 09:57).
    const udid = rest[0] ?? (existsSync(UDID_FILE) ? readFileSync(UDID_FILE, 'utf8').trim() : process.env.PDR_UDID);
    if (existsSync(SID)) await call('DELETE', `/session/${sid()}`).catch(() => {});
    if (udid) { try { execFileSync('pkill', ['-f', `xcodebuild.*${udid}`]); } catch {} await sleep(3); }
    await run('start', udid ? [udid] : []);
    await mobile('activateApp', { bundleId: BUNDLE }).catch(() => {});
    console.log('WDA restarted; PowerDirector brought to the front');
    break;
  }
  case 'status': {
    console.log(JSON.stringify((await call('GET', '/status')).value));
    if (existsSync(SID)) { try { await s('GET', '/window/rect'); console.log('session alive', sid()); } catch (e) { console.log('session not alive:', String(e).slice(0, 200)); } }
    if (existsSync(WDA_FILE)) { const h = (Date.now() - Date.parse(readFileSync(WDA_FILE, 'utf8'))) / 3_600_000; console.log(`WDA started ${h.toFixed(1)} h ago${h > 3 ? ' — run `restart` at the next segment start' : ''}`); }
    break;
  }
  case 'shot': {
    const dir = join(runDir, 'screenshots'); mkdirSync(dir, { recursive: true });
    const p = join(dir, `${rest[0]}.png`);
    writeFileSync(p, Buffer.from((await s('GET', '/screenshot')).value, 'base64'));
    console.log(p);
    return p;
  }
  case 'els': console.log(parseEls((await s('GET', '/source')).value, rest[0]).join('\n')); break;
  case 'source': console.log((await s('GET', '/source')).value); break;
  case 'texts': {
    const xml: string = (await s('GET', '/source')).value; const seen = new Set<string>(); const rows: [number, string][] = [];
    const dec = (t: string) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#10;/g, ' ⏎ ');
    for (const m of xml.matchAll(/<XCUIElementType(\w+)([^>]*)>/g)) {
      const a = Object.fromEntries([...m[2].matchAll(/(\w+)="([^"]*)"/g)].map(x => [x[1], x[2]]));
      if (a.visible !== 'true' || /^(Application|Window|Other|ScrollView|CollectionView|Table|Key|Keyboard)$/.test(m[1])) continue;
      for (const t of [a.label, m[1] === 'TextView' || m[1] === 'TextField' ? a.value : '']) {
        // Skip ids (dotted identifiers) and duplicates; keep the type so buttons can be told from text.
        if (!t || /^[\w-]+(\.[\w-]+)+$/.test(t) || seen.has(t)) continue; seen.add(t);
        rows.push([+a.y, `${m[1] === 'StaticText' ? '' : `[${m[1]}] `}${dec(t)}`]);
      }
    }
    const out = rows.sort((x, y) => x[0] - y[0]).map(r => r[1]).join('\n'); console.log(out);
    if (rest[0]) { mkdirSync(join(runDir, 'screenshots'), { recursive: true });
      writeFileSync(join(runDir, 'screenshots', `${rest[0]}.txt`), out + '\n');
      writeFileSync(join(runDir, 'screenshots', `${rest[0]}.png`), Buffer.from((await s('GET', '/screenshot')).value, 'base64'));
      console.log(`→ screenshots/${rest[0]}.png/.txt`); }
    break;
  }
  case 'tap': await mobile('tap', { x: +rest[0], y: +rest[1] }); console.log('tapped', rest[0], rest[1]); break;
  case 'burst': {
    const [x, y] = rest.map(Number); const n = +(rest[2] ?? 10); const acts: unknown[] = [{ type: 'pointerMove', duration: 0, x, y }];
    for (let i = 0; i < n; i++) acts.push({ type: 'pointerDown', button: 0 }, { type: 'pause', duration: 40 }, { type: 'pointerUp', button: 0 }, { type: 'pause', duration: 90 });
    await pointer(acts); console.log('burst', n, x, y); break;
  }
  case 'hold': await mobile('touchAndHold', { x: +rest[0], y: +rest[1], duration: +(rest[2] ?? 1.5) }); console.log('held'); break;
  case 'drag': {
    const [x1, y1, x2, y2, ms] = rest.map(Number);
    await pointer([{ type: 'pointerMove', duration: 0, x: x1, y: y1 }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 120 },
      { type: 'pointerMove', duration: ms || 500, x: x2, y: y2 }, { type: 'pointerUp', button: 0 }]);
    console.log('dragged'); break;
  }
  case 'pinch': {
    // pinch X Y FROM TO [ms]: two fingers on a horizontal line through (X, Y), FROM → TO points apart (TO > FROM zooms in).
    const [x, y, from, to, ms] = rest.map(Number);
    const finger = (id: string, sign: number) => ({ type: 'pointer', id, parameters: { pointerType: 'touch' }, actions: [
      { type: 'pointerMove', duration: 0, x: x + sign * from / 2, y }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 100 },
      { type: 'pointerMove', duration: ms || 800, x: x + sign * to / 2, y }, { type: 'pointerUp', button: 0 }] });
    await s('POST', '/actions', { actions: [finger('f1', -1), finger('f2', 1)] });
    console.log('pinched', from, '→', to); break;
  }
  case 'scrollto': {
    // Read the frame from the source itself (never from a column of `els` output) and steer by where the element is.
    const [text, X, TOP, BOTTOM] = [rest[0], +(rest[1] ?? 210), +(rest[2] ?? 120), +(rest[3] ?? 780)];
    if (!text) throw new Error('scrollto TEXT [X TOP BOTTOM]');
    // Drags start and end well inside the band (15 % margins): a drag that starts on a header or bar above/below
    // the list does not scroll it. Travel is 70 % of the band, so every row passes through the band at least once.
    const lo = Math.round(TOP + (BOTTOM - TOP) * 0.15), hi = Math.round(BOTTOM - (BOTTOM - TOP) * 0.15);
    const find = (xml: string) => [...xml.matchAll(/<(XCUIElementType\w+)([^>]*)>/g)]
      .map(m => ({ type: m[1].replace('XCUIElementType', ''), a: Object.fromEntries([...m[2].matchAll(/(\w+)="([^"]*)"/g)].map(x => [x[1], x[2]])) }))
      .filter(e => { const d = (t?: string) => (t ?? '').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); return d(e.a.name) === text || d(e.a.label) === text; })
      .map(e => ({ ...e, cy: +e.a.y + +e.a.height / 2 }));
    const drag = (dy: number) => pointer([{ type: 'pointerMove', duration: 0, x: X, y: dy > 0 ? lo : hi },
      { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 120 },
      { type: 'pointerMove', duration: 600, x: X, y: dy > 0 ? hi : lo }, { type: 'pause', duration: 150 }, { type: 'pointerUp', button: 0 }]);
    let dir = -1, ends = 0, prev = '';
    for (let i = 0; i < 60; i++) {
      const xml: string = (await s('GET', '/source')).value;
      const hits = find(xml);
      // Prefer a Switch when a row's text and its switch share the name (Pink 「Fail every call (ignores number)」).
      const inBand = hits.filter(h => h.a.visible === 'true' && h.cy >= TOP && h.cy <= BOTTOM);
      const ok = inBand.find(h => h.type === 'Switch') ?? inBand[0];
      if (ok) { const line = `${ok.type} | ${ok.a.name ?? ''} | ${ok.a.label ?? ''} | ${ok.a.value ?? ''} | ${ok.a.x},${ok.a.y},${ok.a.width},${ok.a.height}`; console.log(line); return line; }
      // A visible hit outside the band: nudge toward it. Off-screen hits are ignored on purpose — table views keep
      // recycled cells in the source with stale frames (seen: Pink row at y=-346 while it was really further down).
      // Otherwise sweep down to the end of the list, then up to the other end.
      const vis = hits.find(h => h.a.visible === 'true');
      if (vis) dir = vis.cy > BOTTOM ? -1 : 1;
      const sig = parseEls(xml).join('\n');
      if (sig === prev) { ends++; if (ends >= 2) break; dir = -dir; }
      prev = sig;
      await drag(dir); // dir -1: finger moves up, content moves up (reveals rows below)
      await new Promise(r => setTimeout(r, 350));
    }
    throw new Error(`scrollto: "${text}" not found between y ${TOP}-${BOTTOM} after sweeping both ends`);
  }
  case 'id': {
    const e = await s('POST', '/element', { using: 'accessibility id', value: rest.join(' ') });
    await s('POST', `/element/${Object.values(e.value)[0]}/click`, {}); console.log('clicked id', rest.join(' ')); break;
  }
  case 'lbl': {
    const t = rest.join(' ').replace(/"/g, '\\"');
    const e = await s('POST', '/element', { using: '-ios predicate string', value: `visible == 1 AND (name CONTAINS "${t}" OR label CONTAINS "${t}")` });
    await s('POST', `/element/${Object.values(e.value)[0]}/click`, {}); console.log('clicked', rest.join(' ')); break;
  }
  case 'clear': case 'setval': {
    const e = await s('POST', '/element', { using: 'accessibility id', value: rest[0] }); const id = Object.values(e.value)[0];
    await s('POST', `/element/${id}/clear`, {});
    if (cmd === 'setval') await s('POST', `/element/${id}/value`, { text: rest.slice(1).join(' ') });
    console.log(cmd, rest[0]); break;
  }
  case 'hidekb': await s('POST', '/appium/device/hide_keyboard', {}); console.log('keyboard hidden'); break;
  case 'type': await mobile('keys', { keys: [...rest.join(' ')] }); console.log('typed'); break;
  case 'launch': {
    // launch [--lang en|zh-Hant|ja …]: with --lang, relaunch PowerDirector with -AppleLanguages/-AppleLocale launch
    // arguments, so the app runs in that language without touching iOS Settings (lasts until the next plain launch).
    const li = rest.indexOf('--lang');
    // A plain launch relaunches with no launch arguments, so an app started with --lang returns to the device
    // language (activateApp alone kept the old -AppleLanguages process running; fixed 2026-10-20).
    if (li < 0) {
      await mobile('terminateApp', { bundleId: BUNDLE }).catch(() => {});
      await mobile('launchApp', { bundleId: BUNDLE });
      console.log('launched (device language)'); break;
    }
    const lang = rest[li + 1]; const locale = ({ en: 'en_US', 'zh-Hant': 'zh_TW', ja: 'ja_JP' } as Record<string, string>)[lang] ?? lang.replace('-', '_');
    await mobile('terminateApp', { bundleId: BUNDLE }).catch(() => {});
    await mobile('launchApp', { bundleId: BUNDLE, arguments: ['-AppleLanguages', `(${lang})`, '-AppleLocale', locale] });
    console.log(`launched in ${lang} (${locale})`); break;
  }
  case 'appearance': {
    // appearance [light|dark]: read or set the system appearance (Light/Dark mode) through XCUITest.
    if (rest[0]) await mobile('setAppearance', { style: rest[0] });
    console.log(JSON.stringify((await mobile('getAppearance')).value)); break;
  }
  case 'terminate': await mobile('terminateApp', { bundleId: BUNDLE }); console.log('terminated'); break;
  case 'appstate': console.log(JSON.stringify((await mobile('queryAppState', { bundleId: BUNDLE })).value)); break;
  case 'wait': case 'sleep': { const sec = +(rest[0] ?? 5); await new Promise(r => setTimeout(r, sec * 1000)); await s('GET', '/window/rect').catch(() => {}); console.log('waited', sec); break; }
  case 'logs': {
    // The app writes tmp/Logs.zip when ⋯ (debug settings) › General › 「Send logs via...」 is tapped (Write Log must be ON).
    // Pull the folder instead of sending the logs anywhere, then cancel the share sheet.
    const name = [rest[0], stamp()].filter(Boolean).join('-');
    const dir = join(runDir, 'logs', name); mkdirSync(dir, { recursive: true });
    const r = await mobile('pullFolder', { remotePath: `@${BUNDLE}/tmp/` });
    const zip = join(dir, 'tmp.zip'); writeFileSync(zip, Buffer.from(r.value, 'base64'));
    execFileSync('ditto', ['-x', '-k', zip, dir]);
    const walk = (d: string): string[] => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
    for (const z of walk(dir).filter(f => /Logs\d*\.zip$/.test(f))) execFileSync('ditto', ['-x', '-k', z, join(dir, 'unzipped')]);
    const txt = walk(dir).filter(f => f.endsWith('_aidrama.txt'));
    console.log(`pulled → ${dir}; ${txt.length} *_aidrama.txt`);
    for (const f of txt) {
      const lines = readFileSync(f, 'utf8').split('\n');
      const pick = (re: RegExp) => lines.filter(l => re.test(l));
      const fails = pick(/workflow step failed|error=|\bfailed\b/i), toasts = pick(/\[AIDrama Toast\]/), perf = pick(/\[AMDPerf\]/), credit = pick(/credit|refund|charge/i);
      console.log(`\n${f}\n  ${lines.length} lines · ${fails.length} failure · ${toasts.length} toast · ${perf.length} timing · ${credit.length} credit lines`);
      for (const l of [...fails.slice(-15), ...toasts.slice(-10), ...credit.slice(-15)]) console.log('  ' + l.slice(0, 300));
    }
    break;
  }
  case 'ledger': {
    // Rows as { time, credits, feature, product }, newest first, only the ones on screen (scroll for older rows).
    const xml: string = (await s('GET', '/source')).value; const rowsOut: Record<string, string>[] = [];
    const parts = xml.split(/(?=<XCUIElementType\w+ [^>]*name="creditsDetailPage\.CreditDetailsCellView\.cell")/).slice(1);
    for (const part of parts) {
      if (!/^<XCUIElementType\w+ [^>]*visible="true"/.test(part)) continue;
      const texts = [...part.slice(0, 4000).matchAll(/<XCUIElementTypeStaticText [^>]*?(?:name|label)="([^"]*)"/g)]
        .map(m => m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"')).filter(t => !t.startsWith('creditsDetailPage.'));
      const time = texts.find(t => /^\d{4}-\d\d-\d\d \d\d:\d\d/.test(t)) ?? '';
      const credits = texts.find(t => /^[+-]\d+$/.test(t)) ?? '';
      const product = texts.find(t => /PowerDirector|PhotoDirector|MyEdit|\(iOS\)|\(Android\)/.test(t)) ?? '';
      const feature = texts.filter(t => ![time, credits, product].includes(t)).join(' · ');
      if (time || credits) rowsOut.push({ time, credits, feature, product });
    }
    const dir = join(runDir, 'ledger'); mkdirSync(dir, { recursive: true });
    const p = join(dir, `${[rest[0], stamp()].filter(Boolean).join('-')}.json`);
    writeFileSync(p, JSON.stringify(rowsOut, null, 1));
    console.log(`${rowsOut.length} visible ledger rows → ${p}`);
    for (const r of rowsOut) console.log(`  ${r.time}  ${r.credits.padStart(5)}  ${r.feature}  (${r.product})`);
    console.log('Shared account: rows from other devices appear too; match rows to this run by time and amount.');
    break;
  }
  case 'stop': if (existsSync(SID)) { await call('DELETE', `/session/${sid()}`).catch(() => {}); console.log('session deleted'); } break;
  case 'waitfor': {
    // waitfor "A|B|C" [--gone] [--timeout S] [--every S]: poll quietly until any of the texts is visible (name, label
    // or value contains it; accessibility ids count), or with --gone until none is. Prints one line with the elapsed
    // seconds, which is also the stage timing for the wait-rule cases. Pass the failure texts too ("Here's your
    // drama|Couldn't create video|Try again") so a failure ends the wait instead of the timeout.
    const a = [...rest]; const take = (n: string) => { const i = a.indexOf(n); return i < 0 ? undefined : a.splice(i, 2)[1]; };
    const gi = a.indexOf('--gone'); const gone = gi >= 0; if (gone) a.splice(gi, 1);
    const timeout = Number(take('--timeout') ?? 600), every = Number(take('--every') ?? 3);
    const alts = a.join(' ').split('|').map(t => t.trim()).filter(Boolean);
    if (!alts.length) throw new Error('waitfor "TEXT[|TEXT…]" [--gone] [--timeout S] [--every S]');
    const t0 = Date.now(); const secs = () => Math.round((Date.now() - t0) / 1000);
    for (;;) {
      let hit = '';
      for (const t of alts) { const e = await visibleContaining(t); if (e) { hit = `${t} | ${await describe(e)}`; break; } }
      if (!gone && hit) { const l = `found after ${secs()} s: ${hit}`; console.log(l); return l; }
      if (gone && !hit) { const l = `gone after ${secs()} s: ${alts.join(' | ')}`; console.log(l); return l; }
      if (Date.now() - t0 > timeout * 1000) {
        const p = await quiet('shot', [`waitfor-timeout-${stamp()}`]);
        throw new Error(`waitfor: ${gone ? 'still visible' : 'none of'} "${alts.join('|')}" after ${secs()} s (screenshot ${p})`);
      }
      await new Promise(r => setTimeout(r, every * 1000));
    }
  }
  case 'expect': case 'expect-not': {
    // expect "A|B": fail unless one is visible now; expect-not "A|B": fail if any is (e.g. after a waitfor that also
    // accepted failure texts, so a recipe stops on the failure).
    const alts = rest.join(' ').split('|').map(t => t.trim()).filter(Boolean); let hit = '';
    for (const t of alts) if (await visibleContaining(t)) { hit = t; break; }
    if (cmd === 'expect' && !hit) throw new Error(`expect: none of "${alts.join('|')}" is visible`);
    if (cmd === 'expect-not' && hit) throw new Error(`expect-not: "${hit}" is visible`);
    console.log(`${cmd} ok${hit ? `: ${hit}` : ''}`); return;
  }
  case 'tapif': {
    // tapif TEXT: tap the visible element whose name or label is exactly TEXT (else contains it); skip if absent.
    const t = rest.join(' ');
    const e = (await visibleIds(exactPred(t)))[0] ?? await visibleContaining(t);
    if (!e) { console.log(`not present: ${t}`); return; }
    await s('POST', `/element/${e}/click`, {}); console.log(`tapped ${t}`); return;
  }
  case 'pink': {
    // Pink debug tweaks in one call each (from the Launcher; the panel's list band is X 210, TOP 110, BOTTOM 300):
    //   pink open ["<group>"]        close any Pink panel, reveal the overlay, ☰ Tweaks, then open the group
    //   pink set "<row>" <value>     Switch rows: on|off. Value rows: tap the row, pick the option (exact name, else the
    //                                option that starts with it, e.g. System), then read the row back
    //   pink tap "<row>"             tap an action row, e.g. 「Use up today's chats」
    //   pink show                    every row and value of the open group (for read-backs and checkpoints)
    //   pink close                   Dismiss and close the overlay
    //   pink tier Free|Pro|Pro+|System   [0] IAP › status, read back, close
    // Every set/tap/tier saves screenshots/pink-<row>-<time>.png and prints the read-back line.
    const [sub, ...pa] = rest;
    const T0 = Date.now(); const tr = (m: string) => { if (process.env.PINK_TRACE) console.error(`  [${((Date.now() - T0) / 1000).toFixed(1)} s] ${m}`); };
    // The panel moves with the Pink bubble (P1: y 60–330; later y 171–442), so the list band comes from the panel's
    // own frame each time: below its 45-pt navigation bar, above its Dismiss bar.
    let band = ['210', '110', '300'];
    const setBand = async () => {
      const c = await byName('debug.UIView.mainContainer'); if (!c) return;
      const r = (await s('GET', `/element/${c}/rect`)).value;
      band = [String(Math.round(r.x + r.width / 2)), String(Math.round(r.y + 48)), String(Math.round(r.y + r.height - 40))];
    };
    const drag = (from: number, to: number, ms: number) => quiet('drag', [band[0], String(from), band[0], String(to), String(ms)]);
    const [, bTop, bBot] = [0, 1, 2].map(i => () => Number(band[i]));
    // Flick the open list to its top so searches run top-down: a row hidden under the title bar is marked invisible,
    // and scrollto would otherwise sweep the whole list down and back up before finding it (minutes on this phone).
    const toTop = async () => {
      const lo = bTop() + Math.round((bBot() - bTop()) * 0.15), hi = bBot() - Math.round((bBot() - bTop()) * 0.15);
      for (let i = 0; i < 3; i++) await drag(lo, hi, 120);
      await sleep(1);
    };
    const close = async () => {
      for (const id of ['Dismiss', 'debug.UIButton.close', 'shortcutDemo.UIButton.backButton']) {
        const e = await byName(id);
        if (e) { await s('POST', `/element/${e}/click`, {}); await sleep(0.8); }
      }
    };
    const open = async (group?: string) => {
      await close();
      const home = await byName('launcher.UIButton.homeButton');
      if (!home) throw new Error('pink: not on the Launcher (no Home tab visible); back out of the current page first');
      await s('POST', `/element/${home}/click`, {}); await sleep(0.8);
      // The bubble and its panel can be dragged, and a drag that starts on them moves them (P1 found them at 37,95,
      // later at 13,171 and 24,82). So tap the bubble where it is, and scroll the Launcher only when the overlay has to
      // be revealed, with drags that start below the panel.
      let tw = await byName('debug.UIButton.tweaks');
      if (!tw) {
        if (!(await byName('debug.UIImageView.mode'))) {
          for (let i = 0; i < 2; i++) await quiet('drag', ['210', '560', '210', '900', '300']);
          await quiet('burst', ['267', '95', '10']); await sleep(1.5);
        }
        // A tap right after the panel closes can be swallowed by its closing animation: wait, tap, and tap once more
        // only if the panel still has not opened after 3 s.
        await sleep(1);
        for (let attempt = 0; attempt < 2 && !tw; attempt++) {
          const b = await byName('debug.UIImageView.mode');
          if (b) { const r = (await s('GET', `/element/${b}/rect`)).value; await mobile('tap', { x: r.x + r.width / 2, y: r.y + r.height / 2 }); }
          for (let k = 0; k < 6 && !(tw = await byName('debug.UIButton.tweaks')); k++) await sleep(0.5);
        }
      }
      if (!tw) { const p = await quiet('shot', [`pink-open-failed-${stamp()}`]); throw new Error(`pink: ☰ Tweaks button not found after revealing the overlay (screenshot ${p})`); }
      await s('POST', `/element/${tw}/click`, {});
      let dis; for (let k = 0; k < 10 && !(dis = await byName('Dismiss')); k++) await sleep(0.6);
      if (!dis) throw new Error('pink: Tweaks list did not open');
      await setBand();
      if (group) { await toTop(); await quiet('scrollto', [group, ...band]); await clickExact(group); await sleep(1.2); }
      console.log(`Pink open${group ? ` › ${group}` : ''}`);
    };
    let atTop = false;
    const rowLine = async (row: string) => {
      if (!atTop) { await toTop(); atTop = true; }
      const l = await quiet('scrollto', [row, ...band]) as string;
      const [type, , , value, frame] = l.split(' | '); const [x, y, w, h] = frame.split(',').map(Number);
      return { type, value, x, y, w, h };
    };
    const rowValue = async (row: string) => {
      const r = await rowLine(row);
      if (r.type === 'Switch') return { ...r, shown: r.value === '1' ? 'on' : 'off' };
      const xml: string = subtree((await s('GET', '/source')).value, 'debug.UIView.mainContainer');
      const shown = parseEls(xml).map(l => l.split(' | ')).filter(f => { const [ex, ey, , eh] = f[4].split(',').map(Number);
        const cy = ey + eh / 2; return cy >= r.y - 6 && cy <= r.y + r.h + 6 && ex > r.x + 10 && f[2] !== row && f[1] !== row; })
        .map(f => f[2] || f[1] || f[3]).filter(t => t && !/^[\w.-]+\.[\w.-]+$/.test(t));
      return { ...r, shown: [...new Set(shown)].join(' ') || '?' };
    };
    const evidence = async (row: string) => quiet('shot', [`pink-${row.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}-${stamp()}`]);
    if (sub === 'open') { await open(pa.join(' ') || undefined); return; }
    await setBand();
    if (sub === 'close') { await close(); console.log('Pink closed'); return; }
    if (sub === 'tap') { const row = pa.join(' '); const r = await rowLine(row); await mobile('tap', { x: r.x + r.w / 2, y: r.y + r.h / 2 }); await sleep(1); console.log(`tapped ${row} (${await evidence(row)})`); return; }
    if (sub === 'set' || sub === 'tier') {
      if (sub === 'tier') await open('[0] IAP');
      const [row, want] = sub === 'tier' ? ['status', pa.join(' ')] : [pa[0], pa.slice(1).join(' ')];
      if (!row || !want) throw new Error('pink set "<row>" <on|off|option>  /  pink tier Free|Pro|Pro+|System');
      tr('find row'); const r = await rowLine(row); tr('row found');
      if (r.type === 'Switch') {
        if (!['on', 'off'].includes(want)) throw new Error(`${row} is a switch: use on or off`);
        if ((r.value === '1') !== (want === 'on')) { await mobile('tap', { x: r.x + r.w / 2, y: r.y + r.h / 2 }); await sleep(1); }
      } else {
        await mobile('tap', { x: r.x + r.w / 2, y: r.y + r.h / 2 }); await sleep(1.5);
        let opt = await byName(want);
        if (!opt) { try { await quiet('scrollto', [want, ...band]); opt = (await visibleIds(exactPred(want)))[0]; } catch {} }
        if (!opt) opt = (await visibleIds(`visible == 1 AND type == "XCUIElementTypeStaticText" AND (label BEGINSWITH[c] "${esc(want)}" OR name BEGINSWITH[c] "${esc(want)}")`))[0];
        if (!opt) { const p = await quiet('shot', [`pink-no-option-${stamp()}`]); throw new Error(`pink: option "${want}" not in the ${row} list (screenshot ${p})`); }
        tr('option found'); await s('POST', `/element/${opt}/click`, {}); await sleep(1.5);
        // Picking an option pops back by itself; only go back if the list is still open.
        if (!(await byName(row))) { const b = await byName('BackButton'); if (b) { await s('POST', `/element/${b}/click`, {}); await sleep(1); } }
      }
      tr('read back'); const v = await rowValue(row); const p = await evidence(row); tr('done');
      const ok = r.type === 'Switch' ? v.shown === want : v.shown.toLowerCase().startsWith(want.toLowerCase());
      console.log(`${row} = ${v.shown}${ok ? '' : `  (WANTED ${want})`}  ${p}`);
      if (sub === 'tier') await close();
      if (!ok) throw new Error(`pink: ${row} reads "${v.shown}", wanted "${want}"`);
      return;
    }
    if (sub === 'show') {
      // Sweep the open group top to bottom; each row is the elements sharing one line in the band: a Switch gives
      // on/off, otherwise the leftmost text is the row and the texts to its right are its value.
      const isId = (t: string) => /^[\w.\[\]-]+\.[\w.-]+$/.test(t) && !t.includes(' ');
      const title = (pa.join(' ') || '').trim();
      const lo = bTop() + Math.round((bBot() - bTop()) * 0.15), hi = bBot() - Math.round((bBot() - bTop()) * 0.15);
      await toTop();
      const rows = new Map<string, string>();
      for (let i = 0, prev = ''; i < 20; i++) {
        const els = parseEls(subtree((await s('GET', '/source')).value, 'debug.UIView.mainContainer')); const sig = els.join('\n'); if (sig === prev) break; prev = sig;
        const items = els.map(l => l.split(' | ')).map(f => { const [x, y, w, h] = f[4].split(',').map(Number); return { type: f[0], name: f[1], label: f[2], value: f[3], x, cy: y + h / 2 }; })
          .filter(e => e.cy >= bTop() && e.cy <= bBot() && ['StaticText', 'Switch', 'Button', 'TextField'].includes(e.type))
          .map(e => e.type === 'TextField' ? { ...e, label: e.value } : e)   // option rows show their value in a TextField
          .filter(e => { const t = e.label || e.name; return t && !isId(t) && !/scroll bar|^Dismiss$|^Back$|^Tweaks$|^Reset$|^isLocationAt|^[A-Z]{2}: (true|false)$/.test(t) && t !== title; });
        const lines: (typeof items)[] = [];
        for (const e of items.sort((a, b) => a.cy - b.cy)) { const l = lines.find(g => Math.abs(g[0].cy - e.cy) < 10); if (l) l.push(e); else lines.push([e]); }
        for (const l of lines) {
          l.sort((a, b) => a.x - b.x);
          const sw = l.find(e => e.type === 'Switch');
          const key = sw ? (sw.name || sw.label) : (l[0].label || l[0].name);
          const val = sw ? (sw.value === '1' ? 'on' : 'off') : [...new Set(l.slice(1).map(e => e.label || e.name))].filter(v => v !== key).join(' ');
          if (!rows.has(key) || (!rows.get(key) && val)) rows.set(key, val);
        }
        await drag(hi, lo, 500); await sleep(0.3);
      }
      for (const [k, v] of rows) console.log(`${k}${v ? ` = ${v}` : ''}`);
      return;
    }
    throw new Error('pink open|set|tap|show|close|tier');
  }
  default: throw new Error(`Unknown command ${cmd}`);
}
}
// `do`: run a recipe (a .steps file, one device.ts command per line, "$1".."$9" filled from the extra arguments) or an
// inline list ("tap 1 2 ;; waitfor X ;; shot Y") as ONE call. A line starting with "?" may fail without stopping the
// recipe. On the first real failure it prints the step, saves a screenshot and the visible elements, and exits 1.
// Recipes for a feature live in library/<feature>/<platform>/recipes/.
const tokens = (l: string) => [...l.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(m => m[1] ?? m[2] ?? m[3]);
try {
  if (cmd === 'do') {
    const file = rest[0] && existsSync(rest[0]) ? rest[0] : '';
    const vars = file ? rest.slice(1) : [];
    const text = file ? readFileSync(file, 'utf8') : rest.join(' ').split(';;').join('\n');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
      .map(l => l.replace(/\$(\d)/g, (_, n) => vars[Number(n) - 1] ?? ''));
    for (const [i, raw] of lines.entries()) {
      const optional = raw.startsWith('?'); const line = optional ? raw.slice(1).trim() : raw;
      const [c, ...a] = tokens(line);
      try { appendFileSync(join(runDir, 'activity.log'), `${new Date().toISOString()} ${c} ${a.join(' ').slice(0, 80)}\n`); } catch {}
      try { await runRecovering(c, a); }
      catch (e: any) {
        if (optional) { console.log(`  (step ${i + 1} skipped: ${String(e?.message ?? e).slice(0, 160)})`); continue; }
        console.error(`✗ step ${i + 1}/${lines.length}: ${line}\n  ${String(e?.message ?? e).slice(0, 400)}`);
        console.error(`  screenshot ${await quiet('shot', [`do-fail-${stamp()}`]).catch(() => '?')}`);
        console.error(parseEls((await s('GET', '/source')).value).slice(0, 40).join('\n'));
        process.exit(1);
      }
    }
    console.log(`✓ ${lines.length} steps${file ? ` (${file})` : ''}`);
  } else await runRecovering(cmd, rest);
} catch (e: any) { console.error(String(e?.message ?? e)); process.exit(1); }

