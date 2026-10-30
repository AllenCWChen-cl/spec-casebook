// Minimal Appium (W3C WebDriver) client for running cases on the QA Android phone (Sony Xperia 10 III, XQ-BT52)
// through Appium + UiAutomator2. The Android twin of device.ts: same commands, run-dir files and exit codes wherever
// they make sense on Android.
// Usage: node scripts/device-android.ts <run dir> <command> [args]
// Coordinates are device PIXELS, the same frame as `shot` screenshots (1080 × 2520 on the XQ-BT52), not points as on
// iOS: a spot measured on a screenshot is tapped with the same numbers.
// `els` prints one visible element per line: class | resource-id (package prefix dropped) | text | content-desc |
// x,y,w,h [| flags: checked, selected, disabled, focused]. Lookups prefer resource-id, then exact text, then
// content-desc; `id`, `clear` and `setval` take a resource-id (short "btn_ok" or full "<pkg>:id/btn_ok").
//   start [serial]            create a session (noReset, no app launch) and remember it in <run dir>/.session (+ .serial,
//                             .uia2-started). Starts the Android Appium server (APPIUM_ANDROID_URL, default port 4724,
//                             log ~/Library/Logs/appium-android-4724.log) when none answers; the iOS servers on
//                             4723/4725 are never touched (they loaded their drivers before uiautomator2 was installed).
//   restart [serial]          end the session, stop the phone's UiAutomator2 server, start a fresh session and bring
//                             the app back to the front; run it at every segment start (as with WDA on iOS)
//   status                    Appium status, adb state, screen/lock state, whether the stored session is alive and
//                             how long the UiAutomator2 server has been up
// Recovery: a command that fails because UiAutomator2 is gone (instrumentation crashed, socket hang up, dead session)
// restarts it once, re-activates the app and retries. When the phone is unplugged, unauthorized, offline or
// locked behind a PIN/pattern, the script prints BLOCKER and exits 75 (same convention as device.ts).
//   shot NAME                 save <run dir>/screenshots/NAME.png (device pixels; adb screencap when no session)
//   els [filter]              visible elements (format above); filter matches anywhere in the line, case-insensitive
//   texts [NAME]              the visible on-screen strings only (text and content-desc, ids dropped, duplicates merged),
//                             top to bottom; with NAME also screenshots/NAME.png + NAME.txt
//   source                    print the page source XML (UiAutomator2 hierarchy, bounds="[x1,y1][x2,y2]")
//   tap X Y | hold X Y [s]    tap / long-press at pixels
//   burst X Y [n]             n rapid taps (default 10) in one touch action
//   id NAME | lbl TEXT        tap element by resource-id / first element whose text or content-desc contains TEXT
//   drag X1 Y1 X2 Y2 [ms]     finger drag
//   pinch X Y FROM TO [ms]    two fingers on a horizontal line through (X, Y), FROM → TO pixels apart (TO > FROM zooms in)
//   scrollto TEXT [X TOP BOTTOM]  scroll the list under column X until the element whose text or content-desc is exactly
//                             TEXT sits between TOP and BOTTOM, then print its line (plus the row's switch state when the
//                             row has a checkable element); exits 1 when both ends are reached without it. Half-viewport
//                             steps, so no row is skipped. Defaults: X = mid-width, band 12 %–88 % of the height.
//   type TEXT                 type into the focused field (Unicode through UiAutomator2's `mobile: type`)
//   hidekb                    dismiss the software keyboard
//   clear NAME                clear the field with resource-id NAME
//   setval NAME TEXT          clear then set the field's text in one call (fast for long strings)
//   launch [--lang en|zh-Hant|ja|fr] | terminate
//                             relaunch / stop the app. --lang: per-app language on Android 13+; below that (the XQ-BT52,
//                             Android 12) the system locale through the Appium Settings helper, no Settings UI. A plain
//                             launch puts the original language back (as on iOS)
//   locale [status|reset|TAG] show / restore / set the language without relaunching (same mechanism as launch --lang)
//   appstate                  0 not installed · 1 not running · 3 background · 4 foreground
//   back                      system Back (KEYCODE_BACK): a spec exit path on Android, test it like any other button
//   wifi on|off|status        Wi-Fi through adb (`cmd wifi set-wifi-enabled`); refuses unless adb sees the phone over
//                             USB. Offline cases only (AGENTS.md, Wi-Fi during runs); turn it back on right after.
//   build                     installed app versionName / versionCode / last update time
//   logcat start|stop|status  background capture of the app's logcat (main, system, crash buffers, app uid only) into
//                             <run dir>/logs/.live/; the phone's ring buffer holds only ~1 MB, so start it at the
//                             segment start or the early lines are gone by the pull
//   pull-logs [SEGMENT]       into <run dir>/logs/<SEGMENT>-<YYYYMMDD-HHMMSS>/: the live logcat capture so far (rotated,
//                             capture keeps running), a dump of the ring buffer, and the app's log files on shared
//                             storage when it wrote any; prints a summary (failures, toasts, crash lines)
//   wait SECONDS              sleep (keeps the session alive with a status call)
//   waitfor "A|B" [--gone] [--timeout S] [--every S]
//                             poll quietly until any text is visible (text, content-desc or resource-id contains it), or
//                             with --gone until none is; prints the elapsed seconds once. Exits 1 with a screenshot on
//                             timeout. List the failure texts too, so a failure ends the wait.
//   tapif TEXT                tap the element whose text/content-desc is exactly TEXT (else contains it) if visible
//   expect "A|B" | expect-not "A|B"   fail unless one is visible / if any is
//   do <file.steps> [args…] | do "cmd ;; cmd ;; …"
//                             many commands as one call (recipes: library/<product>/<feature>/android/recipes/*.steps, "$1".."$9"
//                             from args, "?" before a line = may fail); stops at the first failure with a screenshot
//                             and the visible elements
//   stop                      delete this run's session (the Appium server keeps running)
// Defaults (override with env): ANDROID_HOME ~/Library/Android/sdk, JAVA_HOME Homebrew openjdk@17,
// CASEBOOK_ANDROID_PACKAGE (else android.package in library/<product>/product.json), CASEBOOK_SERIAL (else the only adb device).
// Every command stamps <run dir>/activity.log (run-log.ts `time` reads it). The script never changes a system setting
// except `wifi`; UiAutomator2 itself relaxes the hidden-API policy while a session is open and restores it on `stop`.
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { productValue } from './lib/feature-config.ts';
import { BLOCKER, env, logActivity, runRecipe, sleep, stamp, webdriver } from './lib/device-common.ts';

const HOME = homedir();
const ANDROID_HOME = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? join(HOME, 'Library/Android/sdk');
const JAVA_HOME = process.env.JAVA_HOME ?? '/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home';
const ADB = existsSync(join(ANDROID_HOME, 'platform-tools/adb')) ? join(ANDROID_HOME, 'platform-tools/adb') : 'adb';
const BASE = process.env.APPIUM_ANDROID_URL ?? 'http://127.0.0.1:4724';
const [runDir, cmd, ...rest] = process.argv.slice(2);
if (!runDir || !cmd) { console.error('Usage: node scripts/device-android.ts <run dir> <command> [args]'); process.exit(2); }
const PKG = env('ANDROID_PACKAGE') ?? productValue(runDir, p => p.android?.package, 'ANDROID_PACKAGE');
mkdirSync(runDir, { recursive: true });
const SID = join(runDir, '.session'), SERIAL_FILE = join(runDir, '.serial'), UIA_FILE = join(runDir, '.uia2-started');
const LIVE = join(runDir, 'logs', '.live'), LOGCAT_PID = join(LIVE, 'logcat.pid');
const UIA_GONE = /socket hang up|ECONNREFUSED|ECONNRESET|instrumentation process is not running|invalid session id|terminated or not started|Could not proxy command|UiAutomator2 server.*(not running|crashed)|A session is either terminated/i;
logActivity(runDir, cmd, rest);

const { call, sid, s, mobile, pointer } = webdriver(BASE, SID);

// adb on the run's phone. `serial()` is the stored one, else CASEBOOK_SERIAL, else the only device adb lists.
function serial(): string {
  if (existsSync(SERIAL_FILE)) return readFileSync(SERIAL_FILE, 'utf8').trim();
  const fromEnv = env('SERIAL');
  if (fromEnv) return fromEnv;
  const devs = adbDevices();
  if (devs.length === 1) return devs[0].serial;
  if (!devs.length) blocker('adb lists no Android device.');
  throw new Error(`Several adb devices (${devs.map(d => d.serial).join(', ')}): pass the serial to start or set CASEBOOK_SERIAL.`);
}
function adbDevices() {
  const out = execFileSync(ADB, ['devices', '-l'], { encoding: 'utf8' });
  return out.split('\n').slice(1).filter(l => l.trim()).map(l => { const [serial, state] = l.trim().split(/\s+/); return { serial, state, line: l.trim() }; });
}
const adb = (args: string[], opts: { timeout?: number } = {}) =>
  execFileSync(ADB, ['-s', serial(), ...args], { encoding: 'utf8', timeout: opts.timeout ?? 60_000, maxBuffer: 256 * 1024 * 1024 });
const sh = (line: string) => adb(['shell', line]);

// App language (user, 2026-10-30). Android 13+ has per-app languages (`cmd locale set-app-locales`). Below that the app
// follows the system locale, which the Appium Settings helper (io.appium.settings, installed by UiAutomator2 with
// CHANGE_CONFIGURATION granted) switches by broadcast, without the Settings UI. The first change saves the original
// locale in <run dir>/.locale-orig; `launch` without --lang and `locale reset` put it back.
const LOCALE_ORIG = join(runDir, '.locale-orig');
const COUNTRY: Record<string, string> = { en: 'US', ja: 'JP', fr: 'FR', de: 'DE', ko: 'KR', es: 'ES', it: 'IT', pt: 'BR', zh: 'TW' };
const sysLocale = () => sh('getprop persist.sys.locale').trim() || sh('getprop ro.product.locale').trim();
function broadcastLocale(tag: string) {
  const parts = tag.replace(/_/g, '-').split('-');
  const lang = parts[0].toLowerCase();
  const script = parts.find(p => p.length === 4);
  const country = parts.slice(1).find(p => p.length === 2)?.toUpperCase() ?? (lang === 'zh' && script === 'Hans' ? 'CN' : COUNTRY[lang]);
  if (!country) throw new Error(`locale: no default region for "${lang}"; give one, e.g. ${lang}-XX`);
  const out = sh(`am broadcast -a io.appium.settings.locale -n io.appium.settings/.receivers.LocaleSettingReceiver --es lang ${lang} --es country ${country}${script ? ` --es script ${script}` : ''}`);
  if (!/result=-1/.test(out)) throw new Error(`locale: the Appium Settings helper did not take ${tag} (${out.trim().split('\n').pop()}); is io.appium.settings installed?`);
}
function setLanguage(tag: string) {
  if (!tag) throw new Error('language tag needed, e.g. en, zh-Hant, ja, fr');
  if (+sh('getprop ro.build.version.sdk').trim() >= 33) { sh(`cmd locale set-app-locales ${PKG} --locales ${tag}`); return; }
  if (!existsSync(LOCALE_ORIG)) writeFileSync(LOCALE_ORIG, sysLocale() + '\n');
  broadcastLocale(tag);
}
function restoreLocale() {
  if (+sh('getprop ro.build.version.sdk').trim() >= 33) { sh(`cmd locale set-app-locales ${PKG} --locales ""`); return; }
  if (!existsSync(LOCALE_ORIG)) return;
  broadcastLocale(readFileSync(LOCALE_ORIG, 'utf8').trim());
  unlinkSync(LOCALE_ORIG);
}

function blocker(why: string): never {
  console.error(`BLOCKER (device): ${why}\nOn the phone: unlock it (swipe/PIN), keep it on the USB cable, and if it asks "Allow USB debugging?" tick Always allow and tap Allow. Then: node scripts/device-android.ts <run dir> restart`);
  process.exit(BLOCKER);
}
// Reachable, authorized and unlocked, or exit 75. A dark screen is woken (KEYCODE_WAKEUP, like the power button) and
// a swipe-only keyguard dismissed; a PIN/pattern lock is the user's to open.
function ensurePhone(sn?: string) {
  const id = sn ?? serial();
  const d = adbDevices().find(x => x.serial === id);
  if (!d) blocker(`adb does not see ${id} (unplugged, cable or hub problem, or USB debugging off).`);
  if (d.state === 'unauthorized') blocker(`${id} is unauthorized: accept "Allow USB debugging?" on the phone (tick Always allow from this computer).`);
  if (d.state !== 'device') blocker(`${id} is ${d.state}.`);
  const st = () => { const w = execFileSync(ADB, ['-s', id, 'shell', 'dumpsys power 2>/dev/null | grep -m1 mWakefulness=; dumpsys window 2>/dev/null | grep -E "isKeyguardShowing=|mDreamingLockscreen=" | head -2'], { encoding: 'utf8' });
    return { awake: /mWakefulness=Awake/.test(w), locked: /isKeyguardShowing=true|mDreamingLockscreen=true/.test(w) }; };
  let v = st();
  if (!v.awake || v.locked) {
    execFileSync(ADB, ['-s', id, 'shell', 'input keyevent KEYCODE_WAKEUP; wm dismiss-keyguard'], { encoding: 'utf8' });
    execFileSync('sleep', ['1.5']); v = st();
  }
  if (!v.awake) blocker(`${id}: the screen stays off.`);
  if (v.locked) blocker(`${id} is locked (PIN/pattern keyguard).`);
}

// The Android Appium server on BASE's port, started here when nothing answers. Its own process with ANDROID_HOME and
// JAVA_HOME set, so the iOS servers (4723/4725, shared services) are never restarted.
async function ensureServer() {
  try { await call('GET', '/status', undefined, 5000); return; } catch {}
  const port = new URL(BASE).port || '4724';
  const log = join(HOME, 'Library/Logs', `appium-android-${port}.log`); mkdirSync(join(HOME, 'Library/Logs'), { recursive: true });
  const fd = openSync(log, 'a');
  const bin = ['/opt/homebrew/bin/appium', '/usr/local/bin/appium'].find(existsSync) ?? 'appium';
  spawn(bin, ['--address', '127.0.0.1', '--port', port, '--log-timestamp', '--local-timezone'], { detached: true, stdio: ['ignore', fd, fd],
    env: { ...process.env, ANDROID_HOME, ANDROID_SDK_ROOT: ANDROID_HOME, JAVA_HOME, PATH: `${join(ANDROID_HOME, 'platform-tools')}:${join(JAVA_HOME, 'bin')}:${process.env.PATH}` } }).unref();
  closeSync(fd);
  for (let i = 0; i < 40; i++) { await sleep(1); try { await call('GET', '/status', undefined, 3000); console.log(`Appium (Android) started on ${BASE}, log ${log}`); return; } catch {} }
  throw new Error(`Appium did not answer on ${BASE}; see ${log}`);
}

// ---- page source -------------------------------------------------------------------------------------------------
type El = { cls: string; id: string; text: string; desc: string; x: number; y: number; w: number; h: number; a: Record<string, string>; kids: El[]; hidden: boolean };
const dec = (t: string) => t.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#10;/g, ' ').replace(/&#xA;/gi, ' ').replace(/&amp;/g, '&');
const shortId = (id: string) => id.replace(/^[\w.]+:id\//, '');
// Elements in document order, with `hidden` set for views covered by a later screen. The app opens pages as
// fragments on top of the previous one in the same container (Menu › Preferences keeps the whole Menu in the source,
// marked displayed="true"), so a subtree counts as hidden when a later sibling (higher drawing-order) covers its whole
// frame and holds text or a content-desc of its own: a page, not an empty overlay such as a player's touch layer.
function parse(xml: string): El[] {
  const out: El[] = []; const roots: El[] = []; const stack: El[] = [];
  for (const m of xml.matchAll(/<(\/?)([\w.$]+)([^>]*?)(\/?)>/g)) {
    if (m[2] === 'hierarchy' || m[2] === 'xml') continue;
    if (m[1]) { stack.pop(); continue; }
    const a = Object.fromEntries([...m[3].matchAll(/([\w-]+)="([^"]*)"/g)].map(x => [x[1], dec(x[2])]));
    const b = /\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]/.exec(a.bounds ?? '') ?? [0, 0, 0, 0, 0];
    const [x1, y1, x2, y2] = b.slice(1).map(Number);
    const e: El = { cls: (a.class ?? m[2]).split('.').pop()!, id: shortId(a['resource-id'] ?? ''), text: a.text ?? '', desc: a['content-desc'] ?? '', x: x1, y: y1, w: x2 - x1, h: y2 - y1, a, kids: [], hidden: false };
    (stack.length ? stack[stack.length - 1].kids : roots).push(e); out.push(e);
    if (!m[4]) stack.push(e);
  }
  const labelled = (e: El): boolean => !!(e.text || e.desc) || e.kids.some(labelled);
  const hide = (e: El) => { e.hidden = true; e.kids.forEach(hide); };
  const covers = (d: El, c: El) => d.w > 0 && d.x <= c.x && d.y <= c.y && d.x + d.w >= c.x + c.w && d.y + d.h >= c.y + c.h;
  const order = (e: El, i: number) => Number(e.a['drawing-order'] ?? i);
  const walk = (sibs: El[]) => {
    sibs.forEach((c, i) => { if (sibs.some((d, j) => j !== i && order(d, j) > order(c, i) && covers(d, c) && labelled(d))) hide(c); });
    sibs.forEach(c => walk(c.kids));
  };
  walk(roots);
  return out;
}
const shown = (e: El) => !e.hidden && e.a.displayed !== 'false' && e.w > 0 && e.h > 0;
const flags = (e: El) => [e.a.checkable === 'true' ? (e.a.checked === 'true' ? 'checked' : 'unchecked') : '', e.a.selected === 'true' ? 'selected' : '',
  e.a.enabled === 'false' ? 'disabled' : '', e.a.focused === 'true' ? 'focused' : ''].filter(Boolean).join(' ');
const line = (e: El) => { const f = flags(e); return `${e.cls} | ${e.id} | ${e.text} | ${e.desc} | ${e.x},${e.y},${e.w},${e.h}${f ? ` | ${f}` : ''}`; };
function parseEls(xml: string, filter?: string) {
  return parse(xml).filter(e => shown(e) && (e.id || e.text || e.desc))
    .map(line).filter(l => !filter || l.toLowerCase().includes(filter.toLowerCase()));
}
const source = async (): Promise<string> => (await s('GET', '/source')).value;
const center = (e: El) => ({ x: Math.round(e.x + e.w / 2), y: Math.round(e.y + e.h / 2) });
const tapAt = (x: number, y: number) => mobile('clickGesture', { x, y });
// The first visible element whose text, content-desc or resource-id contains T (exact matches win).
function findText(els: El[], t: string, exactOnly = false) {
  const vis = els.filter(shown);
  return vis.find(e => e.text === t || e.desc === t) ?? vis.find(e => e.id === t)
    ?? (exactOnly ? undefined : vis.find(e => e.text.includes(t) || e.desc.includes(t) || (e.id && e.id.includes(t))));
}
const winSize = async () => (await s('GET', '/window/rect')).value as { width: number; height: number };
// Run another command without its own output (for composite commands).
async function quiet(c: string, a: string[]) { const o = console.log; console.log = () => {}; try { return await run(c, a); } finally { console.log = o; } }
const quote = (t: string) => JSON.stringify(t);
const resIdSel = (n: string) => n.includes(':id/') ? n : `${PKG}:id/${n}`;
async function elementByIdOrText(name: string) {
  for (const sel of [`new UiSelector().resourceId(${quote(resIdSel(name))})`, `new UiSelector().text(${quote(name)})`, `new UiSelector().description(${quote(name)})`]) {
    try { const e = await s('POST', '/element', { using: '-android uiautomator', value: sel }); return Object.values(e.value)[0] as string; } catch {}
  }
  throw new Error(`no element with resource-id, text or content-desc "${name}"`);
}
function uid() { const m = /userId=(\d+)/.exec(sh(`dumpsys package ${PKG} 2>/dev/null | grep -m1 userId=`)); if (!m) throw new Error(`${PKG} is not installed`); return m[1]; }
const logcatRunning = () => { if (!existsSync(LOGCAT_PID)) return 0; const pid = +readFileSync(LOGCAT_PID, 'utf8'); try { process.kill(pid, 0); return pid; } catch { return 0; } };
function startLogcat() {
  mkdirSync(LIVE, { recursive: true });
  const file = join(LIVE, `logcat-${stamp()}.txt`); const fd = openSync(file, 'a');
  // -T 1: from now on (the ring buffer's past goes into pull-logs' dump instead), app uid only, wall-clock with year.
  const p = spawn(ADB, ['-s', serial(), 'logcat', '-b', 'main,system,crash', '-v', 'threadtime,year', '-T', '1', `--uid=${uid()}`], { detached: true, stdio: ['ignore', fd, fd] });
  p.unref(); closeSync(fd); writeFileSync(LOGCAT_PID, String(p.pid)); writeFileSync(join(LIVE, 'current'), file);
  return file;
}

// One automatic UiAutomator2 restart per command when it has gone away; start / restart / stop / status never retry.
async function runRecovering(c: string, a: string[]) {
  try { return await run(c, a); }
  catch (e: any) {
    const msg = String(e?.message ?? e);
    if (['start', 'restart', 'stop', 'status', 'wifi', 'build', 'logcat'].includes(c) || !UIA_GONE.test(msg) || !existsSync(SERIAL_FILE)) throw e;
    ensurePhone();
    console.error(`UiAutomator2 gone (${msg.slice(0, 120)}); restarting it once and retrying "${c}"`);
    logActivity(runDir, 'restart', [`(auto, after: ${msg.slice(0, 60)})`]);
    await run('restart', []);
    return await run(c, a);
  }
}
async function run(cmd: string, rest: string[]): Promise<string | void> {
switch (cmd) {
  case 'start': {
    const sn = (rest[0] && !rest[0].startsWith('--') ? rest[0] : undefined) ?? (existsSync(SERIAL_FILE) ? readFileSync(SERIAL_FILE, 'utf8').trim() : undefined) ?? env('SERIAL') ?? serial();
    ensurePhone(sn);
    await ensureServer();
    const caps = { platformName: 'Android', 'appium:automationName': 'UiAutomator2', 'appium:udid': sn, 'appium:noReset': true,
      'appium:newCommandTimeout': 7200, 'appium:uiautomator2ServerLaunchTimeout': 120_000, 'appium:uiautomator2ServerInstallTimeout': 120_000,
      'appium:adbExecTimeout': 60_000,
      // No app in the caps: the session attaches to whatever is on screen (launch brings the app up). The
      // phone is unlocked by ensurePhone, never by Appium's unlock helper; no mock-location grant (empty app id).
      'appium:skipUnlock': true, 'appium:mockLocationApp': '', 'appium:skipLogcatCapture': true,
      // io.appium.settings on this phone (3.4.0) is signed by another key and cannot be upgraded; keep it as it is.
      'appium:skipSettingsAppReinstall': true,
      // Text fields: report the real text, not the hint; keep the device's own keyboard (no Appium IME).
      'appium:disableWindowAnimation': false };
    const r = await call('POST', '/session', { capabilities: { alwaysMatch: caps } }, 600_000);
    writeFileSync(SID, r.value.sessionId); writeFileSync(SERIAL_FILE, sn); writeFileSync(UIA_FILE, new Date().toISOString());
    console.log('session', r.value.sessionId, 'on', sn);
    break;
  }
  case 'restart': {
    const sn = rest[0] ?? (existsSync(SERIAL_FILE) ? readFileSync(SERIAL_FILE, 'utf8').trim() : undefined);
    if (existsSync(SID)) await call('DELETE', `/session/${sid()}`).catch(() => {});
    try { execFileSync(ADB, ['-s', sn ?? serial(), 'shell', 'am force-stop io.appium.uiautomator2.server; am force-stop io.appium.uiautomator2.server.test']); } catch {}
    await sleep(2);
    await run('start', sn ? [sn] : []);
    await mobile('activateApp', { appId: PKG }).catch(() => {});
    console.log('UiAutomator2 restarted; the app brought to the front');
    break;
  }
  case 'status': {
    try { console.log(JSON.stringify((await call('GET', '/status', undefined, 5000)).value)); } catch { console.log(`Appium (Android) not answering on ${BASE} (start launches it)`); }
    for (const d of adbDevices()) console.log('adb', d.line);
    try { const w = sh('dumpsys power 2>/dev/null | grep -m1 mWakefulness=; dumpsys window 2>/dev/null | grep -m1 isKeyguardShowing='); console.log(w.trim().replace(/\s+/g, ' ')); } catch {}
    if (existsSync(SID)) { try { await s('GET', '/window/rect'); console.log('session alive', sid()); } catch (e) { console.log('session not alive:', String(e).slice(0, 200)); } }
    if (existsSync(UIA_FILE)) { const h = (Date.now() - Date.parse(readFileSync(UIA_FILE, 'utf8'))) / 3_600_000; console.log(`UiAutomator2 started ${h.toFixed(1)} h ago${h > 3 ? ' — run `restart` at the next segment start' : ''}`); }
    const lp = logcatRunning(); console.log(lp ? `logcat capture running (pid ${lp}) → ${readFileSync(join(LIVE, 'current'), 'utf8')}` : 'logcat capture not running');
    break;
  }
  case 'shot': {
    const dir = join(runDir, 'screenshots'); mkdirSync(dir, { recursive: true });
    const p = join(dir, `${rest[0]}.png`);
    try { writeFileSync(p, Buffer.from((await s('GET', '/screenshot')).value, 'base64')); }
    catch (e) { if (existsSync(SID) && !UIA_GONE.test(String(e))) throw e;
      writeFileSync(p, execFileSync(ADB, ['-s', serial(), 'exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 })); }
    console.log(p);
    return p;
  }
  case 'els': console.log(parseEls(await source(), rest[0]).join('\n')); break;
  case 'source': console.log(await source()); break;
  case 'texts': {
    const seen = new Set<string>(); const rows: [number, number, string][] = [];
    for (const e of parse(await source()).filter(shown)) {
      for (const t of [e.text, e.desc]) {
        if (!t || seen.has(t)) continue; seen.add(t);
        const kind = /Button|Switch|CheckBox|EditText|Tab/.test(e.cls) ? `[${e.cls}] ` : '';
        rows.push([e.y, e.x, `${kind}${t.replace(/\n/g, ' ⏎ ')}`]);
      }
    }
    const out = rows.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(r => r[2]).join('\n'); console.log(out);
    if (rest[0]) { mkdirSync(join(runDir, 'screenshots'), { recursive: true });
      writeFileSync(join(runDir, 'screenshots', `${rest[0]}.txt`), out + '\n');
      writeFileSync(join(runDir, 'screenshots', `${rest[0]}.png`), Buffer.from((await s('GET', '/screenshot')).value, 'base64'));
      console.log(`→ screenshots/${rest[0]}.png/.txt`); }
    break;
  }
  case 'tap': await tapAt(+rest[0], +rest[1]); console.log('tapped', rest[0], rest[1]); break;
  case 'hold': await mobile('longClickGesture', { x: +rest[0], y: +rest[1], duration: Math.round(+(rest[2] ?? 1.5) * 1000) }); console.log('held'); break;
  case 'burst': {
    const [x, y] = rest.map(Number); const n = +(rest[2] ?? 10); const acts: unknown[] = [{ type: 'pointerMove', duration: 0, x, y }];
    for (let i = 0; i < n; i++) acts.push({ type: 'pointerDown', button: 0 }, { type: 'pause', duration: 40 }, { type: 'pointerUp', button: 0 }, { type: 'pause', duration: 90 });
    await pointer(acts); console.log('burst', n, x, y); break;
  }
  case 'drag': {
    const [x1, y1, x2, y2, ms] = rest.map(Number);
    await pointer([{ type: 'pointerMove', duration: 0, x: x1, y: y1 }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 120 },
      { type: 'pointerMove', duration: ms || 500, x: x2, y: y2 }, { type: 'pointerUp', button: 0 }]);
    console.log('dragged'); break;
  }
  case 'pinch': {
    const [x, y, from, to, ms] = rest.map(Number);
    const finger = (id: string, sign: number) => ({ type: 'pointer', id, parameters: { pointerType: 'touch' }, actions: [
      { type: 'pointerMove', duration: 0, x: Math.round(x + sign * from / 2), y }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 100 },
      { type: 'pointerMove', duration: ms || 800, x: Math.round(x + sign * to / 2), y }, { type: 'pointerUp', button: 0 }] });
    await s('POST', '/actions', { actions: [finger('f1', -1), finger('f2', 1)] });
    console.log('pinched', from, '→', to); break;
  }
  case 'scrollto': {
    // Steer by where the element is in the source (never by a column of `els` output). UiAutomator2 lists only views
    // that are attached, so a hit in the source is a real on-screen (or edge) row, not a recycled stale frame.
    const text = rest[0]; if (!text) throw new Error('scrollto TEXT [X TOP BOTTOM]');
    const win = await winSize();
    const [X, TOP, BOTTOM] = [+(rest[1] ?? Math.round(win.width / 2)), +(rest[2] ?? Math.round(win.height * 0.12)), +(rest[3] ?? Math.round(win.height * 0.88))];
    // Drags start and end inside the band (15 % margins) and travel 70 % of it, so every row passes through the band.
    const lo = Math.round(TOP + (BOTTOM - TOP) * 0.15), hi = Math.round(BOTTOM - (BOTTOM - TOP) * 0.15);
    const drag = (dir: number) => pointer([{ type: 'pointerMove', duration: 0, x: X, y: dir > 0 ? lo : hi },
      { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 120 },
      { type: 'pointerMove', duration: 600, x: X, y: dir > 0 ? hi : lo }, { type: 'pause', duration: 200 }, { type: 'pointerUp', button: 0 }]);
    let dir = -1, ends = 0, prev = '';
    for (let i = 0; i < 60; i++) {
      const xml = await source(); const els = parse(xml);
      const hits = els.filter(e => shown(e) && (e.text === text || e.desc === text)).map(e => ({ e, cy: e.y + e.h / 2 }));
      // A row clipped by its list's edge keeps only a sliver of its frame (seen: 「Remove watermark」 1 px high under the
      // Menu's header): not found until at least 24 px of it shows.
      const ok = hits.find(h => h.cy >= TOP && h.cy <= BOTTOM && h.e.h >= 24);
      if (ok) {
        // A settings-style row: the checkable element (Switch / CheckBox) whose vertical span covers the text's centre.
        const sw = els.find(e => shown(e) && e.a.checkable === 'true' && e.y <= ok.cy && e.y + e.h >= ok.cy && e !== ok.e);
        const l = `${line(ok.e)}${sw ? ` | row ${sw.cls} ${sw.a.checked === 'true' ? 'on' : 'off'} at ${center(sw).x},${center(sw).y}` : ''}`;
        console.log(l); return l;
      }
      if (hits.length) dir = hits[0].cy > BOTTOM ? -1 : hits[0].cy < TOP ? 1 : hits[0].cy > (TOP + BOTTOM) / 2 ? -1 : 1;
      const sig = parseEls(xml).join('\n');
      if (sig === prev) { ends++; if (ends >= 2) break; dir = -dir; }
      prev = sig;
      await drag(dir); // dir -1: finger moves up, content moves up (reveals rows below)
      await sleep(0.4);
    }
    throw new Error(`scrollto: "${text}" not found between y ${TOP}-${BOTTOM} after sweeping both ends`);
  }
  case 'id': {
    const n = rest.join(' ');
    const e = await s('POST', '/element', { using: 'id', value: resIdSel(n) });
    await s('POST', `/element/${Object.values(e.value)[0]}/click`, {}); console.log('clicked id', n); break;
  }
  case 'lbl': {
    const t = rest.join(' ');
    let id: string | undefined;
    for (const sel of [`new UiSelector().textContains(${quote(t)})`, `new UiSelector().descriptionContains(${quote(t)})`]) {
      try { id = Object.values((await s('POST', '/element', { using: '-android uiautomator', value: sel })).value)[0] as string; break; } catch {}
    }
    if (!id) throw new Error(`no element whose text or content-desc contains "${t}"`);
    await s('POST', `/element/${id}/click`, {}); console.log('clicked', t); break;
  }
  case 'clear': case 'setval': {
    const id = await elementByIdOrText(rest[0]);
    await s('POST', `/element/${id}/clear`, {});
    if (cmd === 'setval') { const t = rest.slice(1).join(' '); await s('POST', `/element/${id}/value`, { text: t, value: [...t] }); }
    console.log(cmd, rest[0]); break;
  }
  case 'hidekb': await s('POST', '/appium/device/hide_keyboard', {}).catch(() => {}); console.log('keyboard hidden'); break;
  case 'type': await mobile('type', { text: rest.join(' ') }); console.log('typed'); break;
  case 'back': await mobile('pressKey', { keycode: 4 }); console.log('back'); break;
  case 'home': await mobile('pressKey', { keycode: 3 }); console.log('home'); break;
  case 'launch': {
    const li = rest.indexOf('--lang');
    if (li >= 0) setLanguage(rest[li + 1]);
    else restoreLocale();
    await mobile('terminateApp', { appId: PKG }).catch(() => {});
    await mobile('activateApp', { appId: PKG });
    console.log(li >= 0 ? `launched in ${rest[li + 1]}` : 'launched'); break;
  }
  case 'locale': {
    const a = rest[0] ?? 'status';
    if (a === 'status') console.log(`system locale ${sysLocale()}${existsSync(LOCALE_ORIG) ? ` (changed by a run; original ${readFileSync(LOCALE_ORIG, 'utf8').trim()})` : ''}`);
    else if (a === 'reset') { restoreLocale(); console.log(`system locale ${sysLocale()}`); }
    else { setLanguage(a); console.log(`language ${a} (system locale ${sysLocale()})`); }
    break;
  }
  case 'terminate': await mobile('terminateApp', { appId: PKG }); console.log('terminated'); break;
  case 'activate': await mobile('activateApp', { appId: PKG }); console.log('activated (no restart)'); break;
  case 'appstate': console.log(JSON.stringify((await mobile('queryAppState', { appId: PKG })).value)); break;
  case 'build': {
    const d = sh(`dumpsys package ${PKG} | grep -E "versionName=|versionCode=|lastUpdateTime=" | head -3`);
    const v = (k: string) => new RegExp(`${k}=(\\S+(?: \\S+)?)`).exec(d)?.[1] ?? '?';
    console.log(`${PKG} versionName ${v('versionName')} versionCode ${v('versionCode').split(' ')[0]} lastUpdateTime ${v('lastUpdateTime')}`);
    break;
  }
  case 'wifi': {
    const want = rest[0] ?? 'status';
    const state = () => /Wifi is enabled/i.test(sh('cmd wifi status | head -1')) ? 'on' : 'off';
    if (want === 'status') { const c = /Wifi is (connected to "[^"]*"|disconnected)/.exec(sh('cmd wifi status 2>/dev/null | head -6'))?.[1] ?? 'no connection line'; console.log(`Wi-Fi ${state()} · ${c}`); break; }
    if (!['on', 'off'].includes(want)) throw new Error('wifi on|off|status');
    // Only over the USB cable: with Wi-Fi off a wireless adb link would drop and nothing could turn it back on.
    const d = adbDevices().find(x => x.serial === serial());
    if (!d || !/\busb:/.test(d.line)) throw new Error(`wifi: adb does not see ${serial()} over USB (${d?.line ?? 'absent'}); refusing`);
    sh(`cmd wifi set-wifi-enabled ${want === 'on' ? 'enabled' : 'disabled'}`);
    for (let i = 0; i < 10 && state() !== want; i++) await sleep(1);
    const now = state(); console.log(`Wi-Fi ${now}${now === want ? '' : `  (WANTED ${want})`}`);
    if (now !== want) throw new Error(`wifi: reads ${now}, wanted ${want}`);
    break;
  }
  case 'logcat': {
    const sub = rest[0] ?? 'status'; const pid = logcatRunning();
    if (sub === 'status') { console.log(pid ? `running (pid ${pid}) → ${readFileSync(join(LIVE, 'current'), 'utf8')}` : 'not running'); break; }
    if (sub === 'stop') { if (pid) { process.kill(pid); try { unlinkSync(LOGCAT_PID); } catch {} } console.log(pid ? `stopped (pid ${pid})` : 'not running'); break; }
    if (sub === 'start') { if (pid) { console.log(`already running (pid ${pid})`); break; } console.log(`capturing → ${startLogcat()}`); break; }
    throw new Error('logcat start|stop|status');
  }
  case 'pull-logs': {
    // The live capture so far (rotated: a new capture file starts at once), the ring buffer (app uid, may overlap
    // the capture), and any log files the app wrote on shared storage.
    const name = [rest[0], stamp()].filter(Boolean).join('-');
    const dir = join(runDir, 'logs', name); mkdirSync(dir, { recursive: true });
    const pid = logcatRunning();
    if (pid) {
      const cur = readFileSync(join(LIVE, 'current'), 'utf8'); process.kill(pid); try { unlinkSync(LOGCAT_PID); } catch {}
      await sleep(0.5); renameSync(cur, join(dir, 'logcat-live.txt')); startLogcat();
    } else console.log('(no live logcat capture: run `logcat start` at the segment start; only the ring buffer is pulled)');
    writeFileSync(join(dir, 'logcat-buffer.txt'), adb(['logcat', '-d', '-b', 'main,system,crash', '-v', 'threadtime,year', `--uid=${uid()}`]));
    for (const remote of APP_LOG_DIRS) {
      try { if (sh(`[ -d "${remote}" ] && echo yes || true`).trim() === 'yes') adb(['pull', remote, join(dir, 'files')], { timeout: 600_000 }); } catch {}
    }
    const walk = (d: string): string[] => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
    console.log(`pulled → ${dir}`);
    for (const f of walk(dir).filter(f => /\.(txt|log)$/i.test(f))) {
      const lines = readFileSync(f, 'utf8').split('\n');
      const pick = (re: RegExp) => lines.filter(l => re.test(l));
      const fails = pick(/FATAL EXCEPTION|\bE AndroidRuntime|workflow step failed|error=|\bfailed\b/i), toasts = pick(/Toast/i), credit = pick(/credit|refund|charge/i);
      console.log(`\n${f}\n  ${lines.length} lines · ${fails.length} failure · ${toasts.length} toast · ${credit.length} credit lines`);
      for (const l of [...fails.slice(-10), ...toasts.slice(-5), ...credit.slice(-10)]) console.log('  ' + l.slice(0, 300));
    }
    break;
  }
  case 'wait': case 'sleep': { const sec = +(rest[0] ?? 5); await sleep(sec); await s('GET', '/window/rect').catch(() => {}); console.log('waited', sec); break; }
  case 'stop': if (existsSync(SID)) { await call('DELETE', `/session/${sid()}`).catch(() => {}); console.log('session deleted'); } break;
  case 'waitfor': {
    // waitfor "A|B|C" [--gone] [--timeout S] [--every S]: one page source per round, every text checked against it.
    const a = [...rest]; const take = (n: string) => { const i = a.indexOf(n); return i < 0 ? undefined : a.splice(i, 2)[1]; };
    const gi = a.indexOf('--gone'); const gone = gi >= 0; if (gone) a.splice(gi, 1);
    const timeout = Number(take('--timeout') ?? 600), every = Number(take('--every') ?? 2);
    const alts = a.join(' ').split('|').map(t => t.trim()).filter(Boolean);
    if (!alts.length) throw new Error('waitfor "TEXT[|TEXT…]" [--gone] [--timeout S] [--every S]');
    const t0 = Date.now(); const secs = () => Math.round((Date.now() - t0) / 1000);
    for (;;) {
      const els = parse(await source()); let hit = '';
      for (const t of alts) { const e = findText(els, t); if (e) { hit = `${t} | ${e.text || e.desc || e.id} | ${e.x},${e.y},${e.w},${e.h}`; break; } }
      if (!gone && hit) { const l = `found after ${secs()} s: ${hit}`; console.log(l); return l; }
      if (gone && !hit) { const l = `gone after ${secs()} s: ${alts.join(' | ')}`; console.log(l); return l; }
      if (Date.now() - t0 > timeout * 1000) {
        const p = await quiet('shot', [`waitfor-timeout-${stamp()}`]);
        throw new Error(`waitfor: ${gone ? 'still visible' : 'none of'} "${alts.join('|')}" after ${secs()} s (screenshot ${p})`);
      }
      await sleep(every);
    }
  }
  case 'expect': case 'expect-not': {
    const alts = rest.join(' ').split('|').map(t => t.trim()).filter(Boolean); const els = parse(await source());
    const hit = alts.find(t => findText(els, t)) ?? '';
    if (cmd === 'expect' && !hit) throw new Error(`expect: none of "${alts.join('|')}" is visible`);
    if (cmd === 'expect-not' && hit) throw new Error(`expect-not: "${hit}" is visible`);
    console.log(`${cmd} ok${hit ? `: ${hit}` : ''}`); return;
  }
  case 'tapif': {
    const t = rest.join(' '); const e = findText(parse(await source()), t);
    if (!e) { console.log(`not present: ${t}`); return; }
    const c = center(e); await tapAt(c.x, c.y); console.log(`tapped ${t} at ${c.x},${c.y}`); return;
  }
  default: throw new Error(`Unknown command ${cmd}`);
}
}
// Folders on shared storage where the app keeps its own log files, if any (pulled whole by pull-logs).
const APP_LOG_DIRS = [`/sdcard/Android/data/${PKG}/files/Log`, `/sdcard/Android/data/${PKG}/files/log`, `/sdcard/Android/data/${PKG}/cache/Log`];
// `do`: run a recipe (a .steps file, one command per line, "$1".."$9" filled from the extra arguments) or an inline
// list ("tap 1 2 ;; waitfor X ;; shot Y") as ONE call. A line starting with "?" may fail without stopping the recipe.
// On the first real failure it prints the step, saves a screenshot and the visible elements, and exits 1.
try {
  if (cmd === 'do') await runRecipe(runDir, rest, runRecovering, async () => [
    `  screenshot ${await quiet('shot', [`do-fail-${stamp()}`]).catch(() => '?')}`,
    ...parseEls(await source().catch(() => '')).slice(0, 40)]);
  else await runRecovering(cmd, rest);
} catch (e: any) { console.error(String(e?.message ?? e)); process.exit(1); }
