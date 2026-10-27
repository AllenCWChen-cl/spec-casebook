// App setup on the real QA iPhone through the run's Appium session (the one device.ts started).
// Adapted from the AT_PDRi automation suite (TestFlight install, first-launch dialogs, credits page), taking only
// the steps the casebook needs. Never run that suite itself: it can buy credits and consume generations.
// Usage: node scripts/app-setup.ts <run dir> <command> [args]
//   build                         installed PowerDirector version and build (from WDA listApps)
//   reinstall <version> <build>   uninstall PowerDirector, install exactly <version> (<build>) from TestFlight's
//                                 Previous Builds, wait until installed, check the build, open the app.
//                                 --check-only: keep the app, just confirm TestFlight still offers that build
//   first-launch                  clear first-launch screens until the Launcher shows: TestFlight build notes
//                                 (Continue), tracking (Ask App Not to Track), GDPR (Get Started), photo access
//                                 (Allow Full Access), IAP page (close), notifications (Allow)
//   server                        print the backend label shown on the Launcher (expect "Developer Server")
//   credits                       open AI Magic › credit pill › Credits page and print the balance
//   claim-daily                   on the Credits page, tap Claim for the complimentary daily credits (free)
//   topup                         sandbox credit pack (2000) up to Apple's sheet; taps Purchase only when the sheet
//                                 says "You will not be charged". Stops at a password prompt: never types one.
//                                 Needs --confirm and the user's go-ahead for this run.
//   pink-switch "<name>" on|off   with a Pink › Tweaks list open (e.g. [z] AI Mini Drama), scroll the small panel to
//                                 the named switch, set it, and read its value back
//   devserver                     ⋯ debug page: Write Log ON and 「Use developer server:」 ON (alert › OK), relaunch,
//                                 clear the intro pages, check the Launcher says 「Developer Server」
//   fresh <version> <build> [--tier Free|Pro|Pro+|System]
//                                 the whole fresh-install setup of one case: reinstall › first-launch › devserver ›
//                                 Pink Log stage timings ON › tier › Launcher screenshot (pull logs before it)
//   pull-logs [name]              from any screen: back out to the Launcher (tapping 「Leave anyway」 if asked — only
//                                 use when nothing is generating), reveal the debug overlay if needed, ⋯ › Send logs
//                                 via..., pull them with device.ts logs, close the share sheet, return to the Launcher.
//                                 Then slice them per case: node scripts/log-slice.ts <run dir> <pull dir>
// Every command prints what it saw; screenshots go to <run dir>/screenshots/setup-*.png.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.APPIUM_URL ?? 'http://127.0.0.1:4723';
const PDR = process.env.PDR_BUNDLE ?? 'com.cyberlink.ios.powerdirector';
const TF = 'com.apple.TestFlight';
const [runDir, cmd, ...rest] = process.argv.slice(2);
if (!runDir || !cmd) { console.error('Usage: node scripts/app-setup.ts <run dir> build|reinstall|first-launch|server|devserver|fresh|credits|claim-daily|topup|pink-switch|pull-logs'); process.exit(2); }
const sid = readFileSync(join(runDir, '.session'), 'utf8').trim();
// Every command leaves a time stamp; run-log.ts `time` uses them to tell test time from idle waits.
try { appendFileSync(join(runDir, 'activity.log'), `${new Date().toISOString()} ${cmd} ${rest.join(' ').slice(0, 80)}\n`); } catch {}
const sleep = (s: number) => new Promise(r => setTimeout(r, s * 1000));

async function call(method: string, path: string, body?: unknown, timeout = 300_000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
  const r = await fetch(`${BASE}/session/${sid}${path}`, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: ctl.signal });
  clearTimeout(t);
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${String(j?.value?.message ?? '').slice(0, 300)}`);
  return j.value;
}
const mobile = (script: string, args: unknown = {}) => call('POST', '/execute/sync', { script: `mobile: ${script}`, args: [args] });
const elId = (v: any) => (v ? Object.values(v)[0] as string : null);
async function find(pred: string): Promise<string | null> {
  try { return elId(await call('POST', '/element', { using: '-ios predicate string', value: pred }, 30_000)); } catch { return null; }
}
async function findAll(pred: string): Promise<string[]> {
  try { return (await call('POST', '/elements', { using: '-ios predicate string', value: pred }, 30_000)).map(elId); } catch { return []; }
}
async function findX(xpath: string): Promise<string | null> {
  try { return elId(await call('POST', '/element', { using: 'xpath', value: xpath }, 60_000)); } catch { return null; }
}
const rect = async (id: string) => call('GET', `/element/${id}/rect`);
const attr = async (id: string, a: string) => call('GET', `/element/${id}/attribute/${a}`).catch(() => null);
const click = async (id: string) => call('POST', `/element/${id}/click`, {});
async function waitFor(pred: string, secs: number): Promise<string | null> {
  const end = Date.now() + secs * 1000;
  while (Date.now() < end) { const e = await find(pred); if (e) return e; await sleep(1); }
  return null;
}
async function tapIf(pred: string, label: string): Promise<boolean> {
  const e = await find(pred); if (!e) return false;
  await click(e); console.log(`  tapped ${label}`); await sleep(1.5); return true;
}
async function shot(name: string) {
  const dir = join(runDir, 'screenshots'); mkdirSync(dir, { recursive: true });
  const p = join(dir, `setup-${name}.png`); writeFileSync(p, Buffer.from(await call('GET', '/screenshot'), 'base64')); return p;
}
const swipeUp = () => mobile('swipe', { direction: 'up' }).catch(() => {});
async function installed(): Promise<{ version?: string; build?: string } | null> {
  const apps = await mobile('listApps', { applicationType: 'User' });
  const a = apps?.[PDR]; return a ? { version: a.CFBundleShortVersionString, build: a.CFBundleVersion } : null;
}
const onScreen = async (id: string) => { const r = await rect(id); return r.y > 0 && r.y < 900 && r.height > 0; };

const pointer = (actions: unknown[]) => call('POST', '/actions', { actions: [{ type: 'pointer', id: 'f', parameters: { pointerType: 'touch' }, actions }] });
// From any screen: back out to the Launcher (tapping 「Leave anyway」 if asked — only when nothing is generating), reveal
// the debug overlay if needed and open the ⋯ debug page.
async function openDebugPage() {
  const onLauncher = async () => !!(await find('name == "launchpadViewController.UILabel.serverTypeLabel" OR name == "launcher.button.settings"'));
  for (let i = 0; i < 10 && !(await onLauncher()); i++) {
    if (await tapIf('type == "XCUIElementTypeButton" AND (label == "Leave anyway" OR label == "Leave")', 'Leave anyway')) continue;
    const back = await find('type == "XCUIElementTypeButton" AND (name ENDSWITH ".UIButton.back" OR name ENDSWITH ".UIButton.backButton" OR name ENDSWITH ".button.back" OR name ENDSWITH ".UIButton.btnBack" OR name == "header.closeButton")');
    if (back) { await click(back); await sleep(1.5); continue; }
    if (!(await tapIf('name == "launcher.UIButton.homeButton"', 'Home'))) { await mobile('activateApp', { bundleId: PDR }); await sleep(2); }
  }
  if (!(await onLauncher())) { console.log(await shot('pull-logs-lost')); throw new Error('Could not get back to the Launcher'); }
  await tapIf('name == "launcher.UIButton.homeButton"', 'Home');
  for (let i = 0; i < 2; i++) await pointer([{ type: 'pointerMove', duration: 0, x: 210, y: 300 }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 100 }, { type: 'pointerMove', duration: 300, x: 210, y: 800 }, { type: 'pointerUp', button: 0 }]);
  await sleep(1);
  let dbg = await find('name == "launchpadViewController.UIButton.debugSettingBtn"');
  if (!dbg) {
    const acts: unknown[] = [{ type: 'pointerMove', duration: 0, x: 267, y: 95 }];
    for (let i = 0; i < 10; i++) acts.push({ type: 'pointerDown', button: 0 }, { type: 'pause', duration: 40 }, { type: 'pointerUp', button: 0 }, { type: 'pause', duration: 90 });
    await pointer(acts); await sleep(1.5);
    await tapIf('label == "Allow Full Access"', 'Allow Full Access (photos)');
    dbg = await find('name == "launchpadViewController.UIButton.debugSettingBtn"');
  }
  if (!dbg) { console.log(await shot('pull-logs-no-debug')); throw new Error('Debug ⋯ button not revealed (burst 267,95 on the Launcher top)'); }
  await click(dbg); await sleep(2);
}

const LAUNCHER = 'name == "launcher.button.settings" OR (name == "launcher.UIButton.homeButton" AND value == "1")';

switch (cmd) {
  case 'build': console.log(JSON.stringify(await installed())); break;

  case 'reinstall': {
    const [version, build] = rest;
    if (!version || !build) throw new Error('reinstall <version> <build>, e.g. reinstall 16.9.0 189631');
    const checkOnly = rest.includes('--check-only');
    console.log('before:', JSON.stringify(await installed()));
    if (!checkOnly) {
      if (await mobile('isAppInstalled', { bundleId: PDR })) { await mobile('removeApp', { bundleId: PDR }); await sleep(3); }
      if (await mobile('isAppInstalled', { bundleId: PDR })) throw new Error('PowerDirector is still installed after removeApp');
      console.log('uninstalled');
    }
    await mobile('terminateApp', { bundleId: TF }).catch(() => {}); await sleep(2);
    await mobile('activateApp', { bundleId: TF }); await sleep(5);
    await tapIf('name == "Allow" OR label == "Allow"', 'Allow (TestFlight notifications)');
    await tapIf('name == "Not Now" OR label == "Not Now"', 'Not Now (TestFlight sign-in)');
    const cell = await waitFor('type == "XCUIElementTypeCell" AND (name CONTAINS "PowerDirector" OR label CONTAINS "PowerDirector")', 20)
      ?? await waitFor('name BEGINSWITH "PowerDirector" OR label BEGINSWITH "PowerDirector"', 5);
    if (!cell) { console.log(await shot('tf-no-app')); throw new Error('PowerDirector not listed in TestFlight'); }
    await click(cell); await sleep(3);
    const prev = await waitFor('name == "Previous Builds" OR label == "Previous Builds"', 30);
    if (!prev) { console.log(await shot('tf-no-previous')); throw new Error('Previous Builds not shown'); }
    await click(prev); await sleep(3);
    let v = await find(`name == "${version}" OR label == "${version}"`);
    for (let i = 0; !v && i < 10; i++) { await swipeUp(); await sleep(1); v = await find(`name == "${version}" OR label == "${version}"`); }
    if (!v) { console.log(await shot('tf-no-version')); throw new Error(`Version ${version} not in Previous Builds`); }
    await click(v); await sleep(2);
    let tapped = false;
    for (let i = 0; !tapped && i <= 10; i++) {
      if (i) { await swipeUp(); await sleep(1); }
      const txt = await find(`name CONTAINS "${build}" OR label CONTAINS "${build}"`);
      if (!txt || !(await onScreen(txt))) continue;
      if (checkOnly) { tapped = true; console.log(`TestFlight offers ${version} (${build})`, await shot('tf-check')); break; }
      for (const xp of [`//XCUIElementTypeOther[contains(@name, "${build}")]/following-sibling::XCUIElementTypeButton[@name="Install"]`,
        `//XCUIElementTypeOther[contains(@name, "${build}")]/following-sibling::XCUIElementTypeOther//XCUIElementTypeButton[@name="Install"]`,
        `//XCUIElementTypeCell[.//*[contains(@name, "${build}")]]//XCUIElementTypeButton[@name="Install"]`]) {
        const b = await findX(xp);
        if (b && await onScreen(b)) { await click(b); tapped = true; console.log(`  tapped Install for ${version} (${build})`); break; }
      }
    }
    if (checkOnly) { await mobile('activateApp', { bundleId: PDR }); if (!tapped) throw new Error(`${version} (${build}) not offered in TestFlight`); break; }
    if (!tapped) { console.log(await shot('tf-no-build')); throw new Error(`Install for ${version} (${build}) not found — the build may have expired in TestFlight`); }
    await sleep(2);
    if (await find('name == "Install Older Build?" AND type == "XCUIElementTypeAlert"'))
      await tapIf('name == "Install" AND type == "XCUIElementTypeButton"', 'Install (older build warning)');
    const end = Date.now() + 600_000; let done = false;
    while (Date.now() < end) {
      const busy = await find('name == "Installing" OR label == "Installing" OR name == "Cancel Download" OR label == "Cancel Download"');
      if (!busy && await mobile('isAppInstalled', { bundleId: PDR })) { done = true; break; }
      process.stdout.write('.'); await sleep(10);
    }
    console.log('');
    if (!done) { console.log(await shot('tf-timeout')); throw new Error('Install did not finish within 10 minutes'); }
    const now = await installed();
    console.log('installed:', JSON.stringify(now));
    if (now?.version !== version || now?.build !== build) throw new Error(`Installed ${now?.version} (${now?.build}), expected ${version} (${build})`);
    await mobile('activateApp', { bundleId: PDR }); await sleep(5);
    console.log('PowerDirector opened; next: first-launch');
    break;
  }

  case 'first-launch': {
    await mobile('activateApp', { bundleId: PDR }); await sleep(3);
    const steps: [string, string][] = [
      ['(name == "Continue" AND label == "Continue" AND type == "XCUIElementTypeButton")', 'Continue (TestFlight build notes)'],
      ['label == "Ask App Not to Track"', 'Ask App Not to Track'],
      ['(name == "Get Started" AND type == "XCUIElementTypeButton") OR name == "gDPRPrivacyPolicy.GDPRButton.acceptButton"', 'Get Started (GDPR)'],
      ['label == "Allow Full Access" OR label == "Allow Access to All Photos"', 'Allow Full Access (photos)'],
      ['name == "btn back iap n" OR name == "iap btn back n" OR name == "btn material panel cancel n" OR name == "IAP.button.back" OR name == "vIPBenefitsVC.UIButton.back" OR name == "vIPBenefitsVC.UIButton.backButton" OR name CONTAINS "InterstitialVC.UIButton.close"', 'close (IAP page)'],
      ['label == "Allow" AND type == "XCUIElementTypeButton"', 'Allow (notifications)'],
      ['name == "btn cancel shadow"', 'close (feature intro page)'],
    ];
    let home = false;
    for (let round = 0; round < 15 && !home; round++) {
      let acted = false;
      for (const [pred, label] of steps) if (await tapIf(pred, label)) { acted = true; break; }
      home = !!(await find(LAUNCHER));
      if (!acted && !home) await sleep(2);
    }
    console.log(await shot('first-launch-end'));
    if (!home) throw new Error('Launcher not reached; see the screenshot');
    console.log('on the Launcher');
    break;
  }

  case 'server': {
    const els = await findAll('name CONTAINS "serverTypeLabel" OR label CONTAINS "Server"');
    const labels = (await Promise.all(els.map(e => attr(e, 'label')))).filter(Boolean);
    console.log(labels.length ? labels.join(' | ') : 'no server label visible (open the Launcher, scrolled to the top)');
    break;
  }

  case 'credits': case 'claim-daily': case 'topup': {
    if (!(await find('name == "creditsHomePage.UILabel.remainingCredits"'))) {
      if (!(await find(LAUNCHER))) await tapIf('name == "launcher.UIButton.homeButton"', 'Home');
      await tapIf('name == "launcher.button.aiMagic"', 'AI Magic'); await sleep(1);
      if (!(await tapIf('name == "launcher.button.creditEntry" OR name == "creditEntry.UIView.background"', 'credit pill')))
        throw new Error('Credit pill not found on AI Magic');
      await sleep(2);
    }
    const bal = await waitFor('name == "creditsHomePage.UILabel.remainingCredits"', 15);
    const before = bal ? Number(await attr(bal, 'label')) : NaN;
    console.log('balance:', before);
    if (cmd === 'credits') break;
    if (cmd === 'claim-daily') {
      if (!(await tapIf('name == "creditsHomePage.UIButton.claim" OR name == "freeCreditsClaimDialog.UIButton.claim"', 'Claim'))) { console.log('no Claim button (already claimed today?)'); break; }
      await sleep(3); const b2 = await find('name == "creditsHomePage.UILabel.remainingCredits"');
      console.log('balance after claim:', b2 ? await attr(b2, 'label') : '?', await shot('claim-daily'));
      break;
    }
    if (!rest.includes('--confirm')) throw new Error('topup needs --confirm (and the user\'s go-ahead for this run)');
    if (!(await tapIf('name == "creditsHomePage.UIButton.purchase"', 'Buy More'))) throw new Error('Buy More not found');
    await sleep(3);
    const label = await waitFor('name == "subscribePlanRadioButton.UILabel.label" AND label == "2000"', 10);
    if (!label) throw new Error('No 2000-credit pack listed');
    const lr = await rect(label);
    for (const c of await findAll('name == "subscribePlanButtonType.SubscribePlanRadioButton.button"')) {
      const cr = await rect(c);
      if (cr.x <= lr.x && lr.x <= cr.x + cr.width && cr.y <= lr.y && lr.y <= cr.y + cr.height) { await mobile('tap', { x: cr.x + cr.width / 2, y: cr.y + cr.height / 2 }); break; }
    }
    await sleep(1);
    const get = await find('name == "creditsIAPVC.UIButton.confirm"');
    const getText = get ? String(await attr(get, 'label')) : '';
    if (!getText.includes('Get 2000 Credits')) throw new Error(`2000 pack not selected (button reads ${getText})`);
    await click(get!);
    if (!(await waitFor('name == "payment-sheet"', 60))) throw new Error('Apple payment sheet did not appear (relaunch the app; a second purchase in one session spins)');
    if (!(await find('label CONTAINS "You will not be charged"'))) { console.log(await shot('topup-not-sandbox')); throw new Error('Sheet does not say "You will not be charged": not tapping Purchase'); }
    console.log('  sandbox sheet confirmed', await shot('topup-sheet'));
    await tapIf('type == "XCUIElementTypeButton" AND name == "footer" AND label == "Purchase"', 'Purchase');
    const end = Date.now() + 60_000; let result = '';
    while (Date.now() < end && !result) {
      if (await find('type == "XCUIElementTypeSecureTextField"')) result = 'password';
      else if (await find('type == "XCUIElementTypeAlert" AND label CONTAINS "all set"')) result = 'done';
      else await sleep(2);
    }
    if (result === 'password') { console.log(await shot('topup-password')); console.log('STOP: Apple asks for the sandbox password. Ask the user to enter it on the phone, then run `credits`.'); break; }
    if (result !== 'done') throw new Error('Neither "You\'re all set" nor a password prompt within 60 s');
    await tapIf('type == "XCUIElementTypeButton" AND name == "OK"', 'OK'); await sleep(4);
    const b3 = await find('name == "creditsHomePage.UILabel.remainingCredits"');
    console.log(`balance ${before} → ${b3 ? await attr(b3, 'label') : '?'} (expected +2000)`);
    break;
  }
  case 'pink-switch': {
    const [name, want] = rest; if (!name || !['on', 'off'].includes(want)) throw new Error('pink-switch "<name>" on|off');
    const pred = `type == "XCUIElementTypeSwitch" AND name == "${name.replace(/"/g, '\\"')}"`;
    let sw: string | null = null;
    for (const dir of [-1, 1]) {                       // first scroll down the list, then back up
      for (let i = 0; i < 25 && !sw; i++) {
        const e = await find(pred); if (e && String(await attr(e, 'visible')) === 'true') { sw = e; break; }
        const [y1, y2] = dir < 0 ? [290, 170] : [160, 280];   // W3C pointer drag; mobile: dragFromTo doesn't scroll this panel
        await call('POST', '/actions', { actions: [{ type: 'pointer', id: 'f', parameters: { pointerType: 'touch' }, actions: [
          { type: 'pointerMove', duration: 0, x: 200, y: y1 }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 120 },
          { type: 'pointerMove', duration: 300, x: 200, y: y2 }, { type: 'pointerUp', button: 0 }] }] }); await sleep(0.6);
      }
      if (sw) break;
    }
    if (!sw) throw new Error(`Switch "${name}" not found in the open Tweaks list`);
    const now = String(await attr(sw, 'value')) === '1';
    if (now !== (want === 'on')) { const r = await rect(sw); await mobile('tap', { x: r.x + r.width / 2, y: r.y + r.height / 2 }); await sleep(1); }
    const after = String(await attr(sw, 'value'));
    console.log(`${name}: ${now ? 'on' : 'off'} → ${after === '1' ? 'on' : 'off'}`);
    if ((after === '1') !== (want === 'on')) throw new Error(`${name} did not change`);
    break;
  }
  case 'pull-logs': {
    await openDebugPage();
    let send: string | null = null;
    for (let i = 0; i < 15 && !send; i++) {
      const e = await find('name == "Send logs via..." AND type == "XCUIElementTypeStaticText"');
      if (e && String(await attr(e, 'visible')) === 'true') { send = e; break; }
      await pointer([{ type: 'pointerMove', duration: 0, x: 200, y: 750 }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 100 }, { type: 'pointerMove', duration: 300, x: 200, y: 250 }, { type: 'pointerUp', button: 0 }]); await sleep(0.5);
    }
    if (!send) throw new Error('「Send logs via...」 not found on the debug page');
    const wl = await find('type == "XCUIElementTypeSwitch" AND name == "Write Log:"');
    if (wl && String(await attr(wl, 'value')) !== '1') console.log('WARNING: Write Log is OFF — logs are incomplete; turn it on');
    const r = await rect(send); await mobile('tap', { x: r.x + 60, y: r.y + r.height / 2 }); console.log('  tapped Send logs via...');
    await waitFor('name == "header.closeButton"', 20); await sleep(2);
    const { execFileSync } = await import('node:child_process');
    const outTxt = execFileSync('node', [join(import.meta.dirname, 'device.ts'), runDir, 'logs', ...(rest[0] ? [rest[0]] : [])], { encoding: 'utf8', maxBuffer: 64 << 20 });
    console.log(outTxt.split('\n').slice(0, 3).join('\n'));
    await tapIf('name == "header.closeButton"', 'Close (share sheet, nothing sent)');
    await tapIf('name == "debugViewController.UIButton.btnBack"', 'back to the Launcher');
    break;
  }
  case 'devserver': {
    // ⋯ debug page: Write Log ON, 「Use developer server:」 ON (its 「Server Changed」 alert › OK), then relaunch, clear the
    // intro pages and read the Launcher's server label.
    await openDebugPage();
    const findSwitch = async (prefix: string) => {
      // The search only scrolls down, and 「Use developer server:」 sits above 「Write Log:」, so start every search from
      // the top of the page (fixed 2026-10-20: the second search began below its switch and never found it).
      for (let i = 0; i < 4; i++) { await pointer([{ type: 'pointerMove', duration: 0, x: 200, y: 250 }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 50 }, { type: 'pointerMove', duration: 150, x: 200, y: 800 }, { type: 'pointerUp', button: 0 }]); await sleep(0.3); }
      await sleep(0.8);
      for (let i = 0; i < 15; i++) {
        const e = await find(`type == "XCUIElementTypeSwitch" AND (name BEGINSWITH "${prefix}" OR label BEGINSWITH "${prefix}")`);
        if (e && String(await attr(e, 'visible')) === 'true' && await onScreen(e)) return e;
        await pointer([{ type: 'pointerMove', duration: 0, x: 200, y: 750 }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: 100 }, { type: 'pointerMove', duration: 300, x: 200, y: 450 }, { type: 'pointerUp', button: 0 }]); await sleep(0.5);
      }
      console.log(await shot(`no-switch-${prefix.replace(/\W+/g, '-')}`)); throw new Error(`Switch 「${prefix}…」 not found on the debug page`);
    };
    const ensureOn = async (prefix: string) => {
      const e = await findSwitch(prefix);
      if (String(await attr(e, 'value')) === '1') { console.log(`  ${prefix}: already ON`); return false; }
      const r = await rect(e); await mobile('tap', { x: r.x + r.width / 2, y: r.y + r.height / 2 }); await sleep(1.5);
      console.log(`  ${prefix}: turned ON`); return true;
    };
    await ensureOn('Write Log');
    const changed = await ensureOn('Use developer server');
    if (changed) {
      if (!(await waitFor('label == "Server Changed" OR name == "Server Changed"', 5))) console.log('  (no 「Server Changed」 alert seen)');
      await tapIf('type == "XCUIElementTypeButton" AND label == "OK"', 'OK (Server Changed)');
    }
    console.log(await shot('devserver-debug-page'));
    await tapIf('name == "debugViewController.UIButton.btnBack"', 'back to the Launcher');
    if (changed) {
      await mobile('terminateApp', { bundleId: PDR }); await sleep(2); await mobile('activateApp', { bundleId: PDR }); await sleep(5);
      const { execFileSync } = await import('node:child_process');
      execFileSync('node', [join(import.meta.dirname, 'app-setup.ts'), runDir, 'first-launch'], { stdio: 'inherit' });
    }
    const els = await findAll('name CONTAINS "serverTypeLabel" OR label CONTAINS "Server"');
    const labels = (await Promise.all(els.map(e => attr(e, 'label')))).filter(Boolean);
    console.log(`server label: ${labels.join(' | ') || '?'}`);
    if (!labels.some(l => /Developer Server/.test(String(l)))) throw new Error('Launcher does not show 「Developer Server」');
    break;
  }
  case 'fresh': {
    // One fresh-install case setup: reinstall <version> <build> › first-launch › devserver (Write Log, Developer
    // Server, relaunch) › Pink [z] AI Mini Drama › Log stage timings ON › optional tier › Launcher screenshot.
    // Pull the logs BEFORE this (a reinstall wipes them) and note what the reinstall removed in the checkpoint.
    const [version, build] = rest; const ti = rest.indexOf('--tier'); const tier = ti >= 0 ? rest[ti + 1] : '';
    if (!version || !build) throw new Error('fresh <version> <build> [--tier Free|Pro|Pro+|System]');
    const { execFileSync } = await import('node:child_process');
    const step = (script: string, ...a: string[]) => { console.log(`— ${script} ${a.join(' ')}`); execFileSync('node', [join(import.meta.dirname, script), runDir, ...a], { stdio: 'inherit' }); };
    step('app-setup.ts', 'reinstall', version, build);
    step('app-setup.ts', 'first-launch');
    step('app-setup.ts', 'devserver');
    // The photo-access alert can arrive after devserver's relaunch (P9 setup 2026-10-22: it blocked pink open).
    step('device.ts', 'do', 'wait 3 ;; tapif Allow Full Access');
    step('device.ts', 'do', 'pink open "[z] AI Mini Drama" ;; pink set "Log stage timings" on ;; pink close');
    if (tier) step('device.ts', 'pink', 'tier', tier);
    const now = await installed();
    if (now?.version !== version || now?.build !== build) throw new Error(`Installed ${now?.version} (${now?.build}), expected ${version} (${build})`);
    console.log(`fresh install ready: ${version} (${build}), Developer Server, Write Log + Log stage timings ON${tier ? `, tier ${tier}` : ''}`, await shot('fresh-launcher'));
    break;
  }
  default: console.error(`Unknown command ${cmd}`); process.exit(2);
}
