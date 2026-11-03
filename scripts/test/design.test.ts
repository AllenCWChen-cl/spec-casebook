// Tests for the figma skill's design check (scripts/design.ts, lib/design-plan.ts, design-page.ts, device design
// captures' format) and figma-source's receipts (scope.json, stale returns, screenshot size). They build a small
// synthetic feature, library/zztest/design-fixture/, with planted differences of every kind, run the real commands
// on it and remove it afterwards, so they need no phone, no Figma call and no local Figma read.
// Run: npm test   (node --test scripts/test/; python3 with Pillow is needed, as for the commands themselves)
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const F = 'zztest/design-fixture', FD = join(ROOT, 'library', 'zztest'), FEAT = join(FD, 'design-fixture');
const SET = join(FEAT, 'specs', '2026-01-01'), EX = join(SET, 'extracted'), OUT = join(EX, 'figma-source', 'design', 'out');
const T = join(FEAT, 'ios'), RUNS = join(T, 'runs');
const put = (p: string, data: unknown) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data, null, 1)); };
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const run = (script: string, args: string[], opt: { input?: string; env?: Record<string, string> } = {}) => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], { cwd: ROOT, encoding: 'utf8', input: opt.input, env: { ...process.env, ...opt.env } });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};
const design = (...args: string[]) => run('design.ts', [F, 'ios', ...args]);
const cands = (runName: string, screen: string) => read(join(RUNS, runName, 'design', 'compare.json')).screens.find((s: any) => s.id === screen).candidates;
const ids = (c: any[]) => c.map(x => x.id).sort();

// ---- the fixture -----------------------------------------------------------------------------------------------------
const W = '#ffffffff';
const text = (id: string, parent: string, chars: string, box: number[], o: any = {}) => ({ id, parent, type: 'TEXT', name: chars, abs: box,
  text: { characters: chars, align: [o.align ?? 'LEFT', 'TOP'], auto_resize: 'HEIGHT', runs: [{ font_size: 16, line_height: o.lh ?? 20, fills: [{ type: 'SOLID', color: W }] }] } });
// screen 1:10 at the canvas origin, 1:20 beside it, 1:30 (no row reaches it) after that
const S1 = [
  { id: '1:10', parent: '1:1', type: 'FRAME', name: 'Home', abs: [0, 0, 375, 812] },
  text('1:11', '1:10', 'Create Your Drama', [20, 100, 200, 24], { lh: 24 }),
  text('1:13', '1:10', 'Pick a style for your story', [20, 140, 300, 20]),
  text('1:1a', '1:10', 'Choose a template', [20, 180, 200, 20]),
  text('1:1g', '1:10', 'See all', [300, 180, 60, 20]),
  text('1:1b', '1:10', 'Recently created dramas', [20, 220, 200, 20]),
  text('1:1c', '1:10', 'Two line text here', [20, 260, 200, 20]),
  text('1:1e', '1:10', 'Upgrade now', [20, 330, 120, 20]),
  text('1:17', '1:10', 'A lighthouse keeper finds a message in a bottle that was written by her own grandmother', [20, 360, 330, 40]),
  { id: '1:15', parent: '1:10', type: 'FRAME', name: 'btn_start', abs: [120, 590, 140, 44], radius: 12, fills: [{ type: 'SOLID', color: '#3366ffff' }] },
  text('1:14', '1:15', 'Start', [150, 602, 80, 20], { align: 'CENTER' }),
  text('1:12', '1:10', 'Templates', [20, 700, 100, 20]),
  { id: '1:16', parent: '1:10', type: 'INSTANCE', name: 'ic_close', abs: [330, 50, 24, 24] },
  { id: '1:1d', parent: '1:10', type: 'INSTANCE', name: 'ic_more', abs: [290, 50, 24, 24] },
  { id: '1:18', parent: '1:10', type: 'INSTANCE', name: 'Status Bar', abs: [0, 0, 375, 44] },
  text('1:19', '1:18', '9:41', [20, 12, 40, 20]),
];
const S2 = [
  { id: '1:20', parent: '1:1', type: 'FRAME', name: 'Error_offline', abs: [400, 0, 375, 812] },
  ...["You're offline", 'Check your connection', 'Try again', 'Saved drafts', 'Settings'].map((t, i) => text(`1:2${i + 1}`, '1:20', t, [420, 100 + 40 * i, 250, 20])),
];
const S3 = [{ id: '1:30', parent: '1:1', type: 'FRAME', name: 'Orphan', abs: [800, 0, 375, 812] }, text('1:31', '1:30', 'Nobody comes here', [820, 100, 200, 20])];
// 1:40: an empty state drawn under Home, no arrow into it; 1:50: alone on another board, nothing leads to it
const S4 = [{ id: '1:40', parent: '1:1', type: 'FRAME', name: 'Home_empty', abs: [0, 900, 375, 812] }];
const S5 = [{ id: '2:50', parent: '2:1', type: 'FRAME', name: 'Island', abs: [3000, 0, 375, 812] }];
const SCREENS = [S1[0], S2[0], S3[0], S4[0]].map(s => ({ board: '1:1', id: s.id, name: s.name, box: s.abs, abs: s.abs })).concat({ board: '2:1', id: '2:50', name: 'Island', box: S5[0].abs, abs: S5[0].abs });
// the Design's flow arrows: Home's Start → offline (the casebook traces it too), offline's Try again → Orphan
const ARROWS = [{ board: '1:1', id: '1:98', path: [[200, 610], [420, 100]], from: '1:10', control: '1:15', to: '1:20', kind: 'flow' },
  { board: '1:1', id: '1:97', path: [[500, 200], [820, 100]], from: '1:20', control: '1:23', to: '1:30', kind: 'flow' }];

// app page sources: iOS (points) for 1:10, UiAutomator2 (pixels, bounds) for 1:20
const st = (label: string, x: number, y: number, w: number, h: number, type = 'XCUIElementTypeStaticText', name = '') =>
  `<${type} type="${type}" name="${name}" label="${label}" visible="true" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
const iosHome = (choose: string) => `<AppiumAUT><XCUIElementTypeApplication type="XCUIElementTypeApplication" name="PDR" label="" visible="true" x="0" y="0" width="375" height="812">
${st('Create Your Drama', 20, 110, 180, 24)}${st('Pick a style for your story', 32, 150, 250, 20)}${st(choose, 20, 190, 180, 20)}
${st('Recently creat…', 20, 230, 150, 20)}${st('Two line text here', 20, 270, 150, 40)}${st('Beta', 200, 100, 40, 20)}
${st('Start', 120, 590, 140, 44, 'XCUIElementTypeButton')}${st('Start', 165, 602, 45, 20)}${st('Templates', 20, 700, 100, 20)}
${st('', 288, 48, 28, 28, 'XCUIElementTypeButton', 'more')}</XCUIElementTypeApplication></AppiumAUT>`;
const androidOffline = `<hierarchy><android.widget.FrameLayout class="android.widget.FrameLayout" bounds="[0,0][1080,2338]" displayed="true">
<android.widget.TextView class="android.widget.TextView" text="You're offline" bounds="[58,317][634,386]" displayed="true"/>
<android.widget.TextView class="android.widget.TextView" text="Something else entirely" bounds="[58,500][900,560]" displayed="true"/>
</android.widget.FrameLayout></hierarchy>`;

// screenshots drawn with Pillow: dark background, a white block for each text, one text in red (planted text colour),
// the Start button green where Figma says blue (planted fill colour)
function png(path: string, w: number, h: number, blocks: [number[], string][]) {
  mkdirSync(dirname(path), { recursive: true });
  const py = `import json, sys
from PIL import Image, ImageDraw
j = json.load(sys.stdin); im = Image.new("RGB", (j["w"], j["h"]), "#101418"); d = ImageDraw.Draw(im)
for b, c in j["blocks"]: d.rectangle(b, fill=c)
im.save(j["path"])`;
  const r = spawnSync('python3', ['-c', py], { input: JSON.stringify({ path, w, h, blocks }), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
}
const s3 = (b: number[], inset = 4) => [b[0] * 3 + inset, b[1] * 3 + inset, (b[0] + b[2]) * 3 - inset, (b[1] + b[3]) * 3 - inset];
function homeShot(path: string) {
  png(path, 1125, 2436, [
    [s3([120, 590, 140, 44], 0), '#33cc66'],
    ...[[20, 110, 180, 24], [20, 190, 180, 20], [20, 230, 150, 20], [20, 270, 150, 40], [165, 602, 45, 20], [20, 700, 100, 20]].map(b => [s3(b), '#ffffff'] as [number[], string]),
    [s3([32, 150, 250, 20]), '#ff2020'],
  ]);
}
function capture(runName: string, screen: string, file: string, xml: string, win: any, extra: any = {}) {
  const dir = join(RUNS, runName);
  put(join(dir, 'screenshots', 'design', `${file}.xml`), xml);
  const line = { t: new Date().toISOString(), screen, case: extra.case ?? 'TC-001', png: `screenshots/design/${file}.png`, xml: `screenshots/design/${file}.xml`, win, ...extra };
  writeFileSync(join(dir, 'design', 'captures.jsonl'), (existsSync(join(dir, 'design', 'captures.jsonl')) ? readFileSync(join(dir, 'design', 'captures.jsonl'), 'utf8') : '') + JSON.stringify(line) + '\n');
}

function writeOut() {
  put(join(OUT, 'screens.json'), SCREENS);
  put(join(OUT, '1-1.json'), { board: { id: '1:1', name: 'Board', box: [0, 0, 1200, 1712] }, nodes: [{ id: '1:1', parent: null, type: 'FRAME', name: 'Board', abs: [0, 0, 1200, 1712] }, ...S1, ...S2, ...S3, ...S4] });
  put(join(OUT, '2-1.json'), { board: { id: '2:1', name: 'Other', box: [3000, 0, 375, 812] }, nodes: S5 });
  put(join(OUT, 'arrows.json'), ARROWS);
}

before(() => {
  rmSync(FD, { recursive: true, force: true });
  put(join(FD, 'product.json'), { name: 'Test' });
  put(join(SET, 'spec-set.json'), { feature: F, folder: '2026-01-01', received_at: '2026-01-01T00:00:00Z', spec_set_sha256: 'x', files: [] });
  put(join(EX, 'figma-frames.json'), { files: { design: { fileKey: 'KEY123', page: '0:1' } } });
  writeOut();
  put(join(EX, 'inventory.json'), {
    screens: [S1[0], S2[0], S3[0], S4[0], S5[0]].map(s => ({ id: s.id, board: 'Board', name: s.name, box: s.abs })),
    controls: [
      { id: 'K-1', group: 'G-close', kind: 'button', name: 'ic_close', label: '', node: '1:16', screens: ['1:10'] },
      { id: 'K-2', group: 'G-start', kind: 'button', name: 'btn_start', label: 'Start', node: '1:15', screens: ['1:10'] },
      { id: 'K-3', group: 'G-more', kind: 'button', name: 'ic_more', label: '', node: '1:1d', screens: ['1:10'] },
    ],
    arrows: [{ id: '1-99', to: '1:20', kind: 'flow' }],
  });
  put(join(EX, 'arrows.json'), { arrows: [{ arrow: '1-99', node: '1-99', edge: 'Home Start → offline', expected: 'Start offline shows the offline screen.' }] });
  put(join(T, 'cases.csv'), 'ID,Section,Precondition,Action,Expected Result,Priority,Spec Ref,Notes\n' +
    'TC-001,Home,Signed in,Tap Start,The drama composer opens,High,R-002,\nTC-002,Errors,Wi-Fi off,Tap Start,The offline screen shows,High,R-001,\n');
  put(join(T, 'requirements.md'), '- R-001 (DS: flow arrow 1-99 Home Start → offline) Start while offline shows the offline screen. Walked by: TC-002.\n- R-002 Start opens the composer.\n');
  put(join(T, 'control-trace.json'), { entries: [{ group: 'G-close', press: 'TC-001' }, { group: 'G-start', press: 'TC-001' }, { group: 'G-more', press: 'TC-001' }] });
  put(join(T, 'drafts', 'd1', 'phases.json'), { phases: [{ id: 'P1', segments: [{ id: 'P1-a', cases: ['TC-001', 'TC-002'] }] }] });
  // run r1: Home (iOS, with a scrolled part holding "See all") and the offline screen (Android-style source)
  put(join(RUNS, 'r1', 'run-state.md'), '# Run state — P1\nBuild: PowerDirector iOS 15.2.0 (190001)\n');
  mkdirSync(join(RUNS, 'r1', 'design'), { recursive: true });
  homeShot(join(RUNS, 'r1', 'screenshots', 'design', '1-10.png'));
  capture('r1', '1:10', '1-10', iosHome('Choose the template'), { w: 375, h: 812 });
  png(join(RUNS, 'r1', 'screenshots', 'design', '1-10.p2.png'), 1125, 2436, []);
  capture('r1', '1:10', '1-10.p2', `<A>${st('See all', 300, 100, 60, 20)}</A>`, { w: 375, h: 812 }, { part: 2 });
  png(join(RUNS, 'r1', 'screenshots', 'design', '1-20.png'), 1080, 2338, []);
  capture('r1', '1:20', '1-20', androidOffline, { w: 1080, h: 2338 }, { case: 'TC-002' });
});
after(() => { if (!process.env.KEEP_FIXTURE) rmSync(FD, { recursive: true, force: true }); });

// ---- plan ------------------------------------------------------------------------------------------------------------
test('plan: each screen gets the row that reaches it, or no route', () => {
  const r = design('plan');
  assert.equal(r.status, 0, r.out);
  const plan = read(join(T, 'design', 'plan.json')), by = (id: string) => plan.screens.find((s: any) => s.id === id);
  assert.equal(by('1:10').route.case, 'TC-001');
  assert.equal(by('1:10').route.how, 'on');
  assert.equal(by('1:10').route.fit, 'high');
  assert.equal(by('1:20').route.case, 'TC-002');
  assert.equal(by('1:20').route.how, 'arrow');
  // no row reaches these: the Design's own arrows do, marked as gaps in the casebook table
  assert.equal(by('1:30').route.how, 'figma'); assert.equal(by('1:30').route.fit, 'path'); assert.equal(by('1:30').gap, true);
  assert.deepEqual(by('1:30').route.steps.map((x: any) => x.screen), ['Home', 'Error_offline']);
  assert.equal(by('1:30').route.steps[0].control, 'btn_start');
  assert.equal(by('1:40').route.fit, 'variant', 'a state drawn beside Home takes Home\'s path');
  assert.equal(by('2:50').status, 'no-route');
  assert.deepEqual(plan.by_case, { 'TC-001': ['1:10'], 'TC-002': ['1:20'] });
  assert.match(r.out, /2 by Design arrows only \(2 gaps in the table\), 1 no route/);
  assert.match(r.out, /no route: 2:50 Island/);
});

test('plan on its own: no casebook table, the Design arrows are the route', () => {
  const r = run('design.ts', [F, 'android', 'plan']);
  assert.equal(r.status, 0, r.out);
  const plan = read(join(FEAT, 'android', 'design', 'plan.json')), by = (id: string) => plan.screens.find((s: any) => s.id === id);
  assert.equal(plan.casebook, false);
  assert.equal(by('1:10').route.fit, 'entry');
  assert.equal(by('1:20').route.action, 'Home › btn_start');
  assert.equal(by('1:30').route.steps.length, 2);
  assert.ok(!by('1:30').gap, 'no table, no gap');
  assert.match(run('design.ts', [F, 'android', 'screens']).out, /1:20 {2}Error_offline \(Board\) · Design path: Home › btn_start/);
});

test('figma-source init: a feature with no spec set gets one holding the Design link', () => {
  const r = run('figma-source.ts', ['zztest/new-feature', 'init', 'https://www.figma.com/design/AbC123/Name?node-id=5-6&t=x']);
  assert.equal(r.status, 0, r.out);
  const dir = join(FD, 'new-feature', 'specs');
  const set = JSON.parse(readFileSync(join(dir, require_one(dir), 'spec-set.json'), 'utf8'));
  assert.deepEqual(set.files, []);
  assert.deepEqual(read(join(dir, set.folder, 'extracted', 'figma-frames.json')).files.design, { fileKey: 'AbC123', page: '5:6', url: 'https://www.figma.com/design/AbC123/Name?node-id=5-6&t=x' });
  assert.notEqual(run('figma-source.ts', ['zztest/new-feature', 'init', 'https://example.com']).status, 0);
});
const require_one = (dir: string) => { const d = readdirSync(dir); assert.equal(d.length, 1); return d[0]; };

test('plan: skip list kept, and built again when the table changes', () => {
  assert.equal(design('plan', '--skip', '1:30', '--skip-reason', 'superseded').status, 0);
  assert.equal(read(join(T, 'design', 'plan.json')).screens.find((s: any) => s.id === '1:30').status, 'excluded');
  const later = new Date(Date.now() + 5000);
  utimesSync(join(T, 'cases.csv'), later, later);
  const r = design('screens', 'TC-001');
  assert.match(r.out, /plan built again/);
  assert.match(r.out, /1:10 {2}Home \(Board\) · fit high/);
  assert.equal(read(join(T, 'design', 'plan.json')).screens.find((s: any) => s.id === '1:30').status, 'excluded', 'skip survives a rebuild');
  assert.match(design('screens', 'TC-999').out, /no Design screen/);
});

// ---- check -----------------------------------------------------------------------------------------------------------
test('check: every planted difference is found, and nothing else', () => {
  const r = design('check', 'r1');
  assert.equal(r.status, 0, r.out);
  const c = cands('r1', '1:10');
  assert.deepEqual(ids(c.filter((x: any) => x.severity !== 'info')), [
    'colour:1:13',      // text drawn red, Figma white
    'colour:1:15',      // button green, Figma blue
    'control:1:16',     // close icon with nothing tappable there
    'copy:1:1a',        // "Choose the template"
    'copy:1:1b',        // "Recently creat…" contained in the Figma text
    'lines:1:1c',       // two lines where Figma has one
    'missing:1:1e',     // "Upgrade now" not on the phone
    'position:1:13',    // 12 pt right of the fit
    'truncated:1:1b',   // ends in an ellipsis
  ]);
  assert.ok(c.some((x: any) => x.id === 'sample:1:17' && x.severity === 'info'), 'long sample text is info');
  assert.ok(c.some((x: any) => x.id === 'extra:beta'), 'app text not in Figma is info');
  assert.ok(!c.some((x: any) => /1:1d|1:19|1:1g|1:11|1:14|1:12/.test(x.id)), 'present icon, status bar, part-2 text and matched texts give nothing');
  const s = read(join(RUNS, 'r1', 'design', 'compare.json')).screens.find((x: any) => x.id === '1:10');
  assert.equal(s.fit.top.dy, 10); assert.equal(s.fit.top.ok, true); assert.equal(s.fit.bottom.ok, true);
  assert.equal(s.build, '15.2.0 (190001)');
  assert.equal(s.parts.length, 1);
  assert.ok(existsSync(join(RUNS, 'r1', 'screenshots', 'design', '1-10-sheet.png')), 'review sheet drawn');
});

test('check: an Android capture of another state is flagged on arrival', () => {
  const c = cands('r1', '1:20');
  assert.equal(c[0].id, 'state:1:20');
  assert.ok(!c.some((x: any) => x.id === 'missing:1:21'), "the one matching text (You're offline) pairs across pixel bounds");
  assert.equal(c.filter((x: any) => x.kind === 'missing').length, 4);
});

test('check: a half with too few anchors measures no positions', () => {
  // r0: the same Home screen with only one exact text in the top half and that one far off
  put(join(RUNS, 'r0', 'design', '.keep'), '');
  homeShot(join(RUNS, 'r0', 'screenshots', 'design', '1-10.png'));
  capture('r0', '1:10', '1-10', `<A>${st('Create Your Drama', 60, 160, 180, 24)}${st('Start', 165, 602, 45, 20)}${st('Templates', 20, 700, 100, 20)}</A>`, { w: 375, h: 812 });
  assert.equal(design('check', 'r0').status, 0);
  const s = read(join(RUNS, 'r0', 'design', 'compare.json')).screens[0];
  assert.equal(s.fit.top.ok, false);
  assert.ok(!s.candidates.some((x: any) => x.id === 'position:1:11'));
});

// ---- review, decisions, eBugs ----------------------------------------------------------------------------------------
test('settle: agreement stands, a split or an unjudged candidate is a question', () => {
  put(join(RUNS, 'r1', 'design', 'builder.json'), { screens: { '1:10': {
    'copy:1:1a': { verdict: 'bug', severity: 'major', note: 'wrong article' },
    'position:1:13': { verdict: 'ok', note: 'inside padding' },
    'visual:1': { kind: 'visual', verdict: 'bug', severity: 'cosmetic', figma: { box: [330, 50, 24, 24] }, note: 'icon differs' } } } });
  put(join(RUNS, 'r1', 'design', 'reviewer.json'), { screens: { '1:10': {
    'copy:1:1a': { verdict: 'bug', note: 'article' }, 'position:1:13': { verdict: 'bug', note: '12 pt' }, 'visual:1': { verdict: 'bug', note: 'icon' } } } });
  const r = design('settle', 'r1');
  assert.equal(r.status, 0, r.out);
  const f = read(join(RUNS, 'r1', 'design', 'findings.json')).screens;
  assert.equal(f['1:10']['copy:1:1a'].verdict, 'bug');
  assert.equal(f['1:10']['visual:1'].verdict, 'bug');
  assert.deepEqual(f['1:10']['visual:1'].figma, { box: [330, 50, 24, 24] }, 'a visual item keeps its box for the page');
  assert.equal(f['1:10']['position:1:13'].verdict, 'question');
  assert.equal(f['1:10']['missing:1:1e'].verdict, 'question', 'a candidate neither pass judged is not dropped');
  assert.equal(f['1:20']['state:1:20'].split, 'builder skipped · reviewer skipped');
});

test('decide: the Design tab block is applied, and settle keeps it', () => {
  const block = `DESIGN DECISIONS ${F} ios\nr1 1:10 position:1:13: bug\nr1 1:10 position:1:13: eBug\nr1 1:20 state:1:20: n/a\nr1 1:10 copy:1:1a: eBug\nnonsense line\n`;
  assert.notEqual(run('design.ts', [F, 'ios', 'decide'], { input: '' }).status, 0, 'no block, no change');
  const ok = run('design.ts', [F, 'ios', 'decide'], { input: block });
  assert.equal(ok.status, 0, ok.out);
  assert.match(ok.out, /skipped: nonsense line/);
  let f = read(join(RUNS, 'r1', 'design', 'findings.json')).screens;
  assert.equal(f['1:10']['position:1:13'].verdict, 'bug'); assert.equal(f['1:10']['position:1:13'].ebug, true);
  assert.equal(f['1:20']['state:1:20'].verdict, 'n/a'); assert.match(f['1:20']['state:1:20'].decided, /^user /);
  assert.equal(design('settle', 'r1').status, 0);
  f = read(join(RUNS, 'r1', 'design', 'findings.json')).screens;
  assert.equal(f['1:10']['position:1:13'].verdict, 'bug', 'settling again keeps the user decision');
  assert.notEqual(run('design.ts', [F, 'ios', 'decide'], { input: 'DESIGN DECISIONS other/feature ios\n' }).status, 0, 'a block for another feature is refused');
});

test('ebugs: the ticked bugs with their row, Figma link and sheet', () => {
  const r = design('ebugs', 'r1');
  assert.equal(r.status, 0, r.out);
  const md = readFileSync(join(RUNS, 'r1', 'design', 'ebug-findings.md'), 'utf8');
  assert.match(md, /2 bug\(s\)|## 2\./);
  assert.match(md, /Home — copy \(major\)/);
  assert.match(md, /Reached by: TC-001 — Precondition: Signed in; Action: Tap Start/);
  assert.match(md, /https:\/\/www\.figma\.com\/design\/KEY123\?node-id=1-10/);
  assert.match(md, /Image: screenshots\/design\/1-10-sheet\.png/);
  assert.match(md, /Build 15\.2\.0 \(190001\)/);
  assert.ok(!/visual/.test(md.split('## ').slice(1).map(b => b.split('\n')[0]).join()), 'an unticked bug is not listed');
  assert.match(design('ebugs', 'r1', '--all').out, /3 bug\(s\)$/m);
});

test('check --recheck: earlier bugs fixed, still there, or to look at again', () => {
  put(join(RUNS, 'r2', 'design', '.keep'), '');
  homeShot(join(RUNS, 'r2', 'screenshots', 'design', '1-10.png'));
  capture('r2', '1:10', '1-10', iosHome('Choose a template'), { w: 375, h: 812 });
  const r = design('check', 'r2', '--recheck', 'r1', '--build', '15.3.0 (190100)');
  assert.equal(r.status, 0, r.out);
  const s = read(join(RUNS, 'r2', 'design', 'compare.json')).screens[0];
  const now = Object.fromEntries(s.recheck.items.map((i: any) => [i.id, i.now]));
  assert.deepEqual(now, { 'copy:1:1a': 'fixed', 'visual:1': 'check', 'position:1:13': 'still' });
  assert.equal(s.build, '15.3.0 (190100)');
});

test('shared captures: another computer checks and shows the run from the committed copies', () => {
  const shared = join(RUNS, 'r2', 'design', 'captures');
  assert.ok(existsSync(join(shared, '1-10.webp')) && existsSync(join(shared, '1-10.xml')), 'check wrote the compact copies');
  const before = read(join(RUNS, 'r2', 'design', 'compare.json')).screens[0].candidates.map((c: any) => c.id).sort();
  // the phone's files are gone (a computer that pulled the repo)
  rmSync(join(RUNS, 'r2', 'screenshots'), { recursive: true, force: true });
  const r = design('check', 'r2', '--recheck', 'r1');
  assert.equal(r.status, 0, r.out);
  const after = read(join(RUNS, 'r2', 'design', 'compare.json')).screens[0].candidates.map((c: any) => c.id).sort();
  assert.deepEqual(after, before, 'the same differences from the 750 px copy');
  assert.ok(existsSync(join(RUNS, 'r2', 'screenshots', 'design', '1-10-sheet.png')), 'the sheet is drawn again');
  const out = join(tmpdir(), `design-test-shared-${process.pid}.html`);
  assert.equal(run('design-page.ts', [F, 'ios', '--out', out]).status, 0);
  assert.match(readFileSync(out, 'utf8'), /design\/captures\/1-10\.webp/);
  rmSync(out);
});

test('status: names the next step as the check moves on', () => {
  assert.match(design('status', 'r2').out, /next: the two review passes/);
  assert.match(design('status', 'r1').out, /settled: 3 bugs \(2 ticked for eBugs\), \d+ open questions[\s\S]*next: the user answers the questions/);
  // the user answers every open question OK: then the ticked bugs are next
  const f = read(join(RUNS, 'r1', 'design', 'findings.json')).screens;
  const open = Object.entries<any>(f).flatMap(([scr, v]) => Object.entries<any>(v).filter(([, x]) => x.verdict === 'question').map(([id]) => `r1 ${scr} ${id}: ok`));
  assert.equal(run('design.ts', [F, 'ios', 'decide'], { input: `DESIGN DECISIONS ${F} ios\n${open.join('\n')}\n` }).status, 0);
  rmSync(join(RUNS, 'r1', 'design', 'ebug-findings.md'));
  assert.match(design('status', 'r1').out, /0 open questions[\s\S]*next: design\.ts … ebugs r1/);
  assert.match(design('status').out, /Design check of r2/, 'without a run: the newest run with captures');
});

// ---- the Design tab --------------------------------------------------------------------------------------------------
test('page: statuses, the newest capture per screen, and the app image', () => {
  const out = join(tmpdir(), `design-test-${process.pid}.html`);
  const r = run('design-page.ts', [F, 'ios', '--out', out]);
  assert.equal(r.status, 0, r.out);
  const data = JSON.parse(readFileSync(out, 'utf8').match(/const D = (\{.*\});\n/)![1]);
  const by = (id: string) => data.screens.find((s: any) => s.id === id);
  assert.equal(by('1:10').run, 'r2', 'the newest run that captured it');
  assert.equal(by('1:10').status, 'unreviewed');
  assert.equal(by('1:10').recheck.items.length, 3);
  assert.equal(by('1:20').status, 'matches', 'r1: the user called the state n/a and every other item OK');
  assert.equal(by('1:30').status, 'excluded');
  assert.ok(by('1:10').app?.endsWith('design/captures/1-10.webp'), 'r2\'s phone files are gone: the committed copy');
  assert.equal(data.file, 'KEY123');
  rmSync(out);
});

// ---- figma-source receipts -------------------------------------------------------------------------------------------
test('figma-source: scope.json records the list, boards read and ids not found', () => {
  const resp = join(EX, 'figma-source', 'design', 'responses');
  put(join(resp, 'list.json'), JSON.stringify({ mode: 'list', page: ['0:1', 'UI'], root: ['0:1', 'UI', 'PAGE'], sections: [['5:1', 'GM', 'SECTION', 0, 0, 1, 1, 0, 1, [['1:1', 'Board', 'FRAME', 0, 0, 1, 1, 0, 1]]]], nodes: [] }));
  put(join(resp, 'plan-1-1.json'), JSON.stringify({ mode: 'plan', page: ['0:1', 'UI'], read_at: '2026-01-01T00:00:00Z', boards: [{ id: '1:1', name: 'Board', hash: 'abc', box: [0, 0, 1200, 812] }], chunks: [], missing: ['9:9'] }));
  run('figma-source.ts', [F, 'merge', 'design']);
  const sc = read(join(EX, 'figma-source', 'design', 'scope.json'));
  assert.deepEqual(sc.page, ['0:1', 'UI']);
  assert.deepEqual(sc.listed.map((x: any) => x[0]), ['5:1', '1:1']);
  assert.equal(sc.read[0].id, '1:1');
  assert.deepEqual(sc.missing, [{ id: '9:9', plan: 'plan-1-1.json', error: 'node not found' }]);
});

test('figma-source: board images live in the shared folder, are size-checked and reused', () => {
  writeOut();
  const calls = join(EX, 'figma-source', 'design', 'calls'), shared = join(EX, 'figma');
  put(join(calls, 'todo.json'), { screenshots: [{ nodeId: '1:1', maxDimension: 1712, fingerprint: 'abc', save_to: 'library/zztest/design-fixture/specs/2026-01-01/extracted/figma/board.png' },
    { nodeId: '2:1', maxDimension: 812, fingerprint: 'def', save_to: 'library/zztest/design-fixture/specs/2026-01-01/extracted/figma/other.png' }] });
  png(join(shared, 'board.png'), 600, 856, []);
  png(join(shared, 'other.png'), 375, 812, []);
  const bad = run('figma-source.ts', [F, 'crop', 'design']);
  assert.match(bad.out, /not cropped: 1:1 \(screenshot is not the size asked for/);
  png(join(shared, 'board.png'), 1200, 1712, []);
  const good = run('figma-source.ts', [F, 'crop', 'design']);
  assert.match(good.out, /from 2 board screenshot\(s\)/);
  assert.match(good.out, /board image\(s\) added to .*extracted\/figma/);
  assert.ok(existsSync(join(OUT, 'crops', '1-1', '1-10.png')));
  const shots = read(join(shared, 'shots.json'));
  assert.equal(shots['board.png'].board, '1:1'); assert.equal(shots['board.png'].source_hash, 'abc');
  // the next read of an unchanged board takes no screenshot: the shared image is current for its fingerprint
  rmSync(join(EX, 'figma-source', 'design', 'hashes.json'), { force: true });
  const plan = join(EX, 'figma-source', 'design', 'responses', 'plan-1-1.json');
  put(plan, JSON.stringify({ mode: 'plan', page: ['0:1', 'UI'], read_at: '2026-01-02T00:00:00Z', boards: [{ id: '1:1', name: 'Board', hash: 'abc', box: [0, 0, 1200, 1712] }], chunks: [], missing: [] }));
  const ch = run('figma-source.ts', [F, 'calls', 'chunks', 'design']);
  assert.match(ch.out, /0 screenshot\(s\).*1 board image\(s\) already current/s);
  // a board the casebook captured (no source_hash) is current while its hash matches figma-hashes.json
  put(join(shared, 'shots.json'), { 'board.png': { board: '1:1', group: 'd1', hash: 'cb1', captured_at: '2026-01-01T00:00:00Z' } });
  put(join(EX, 'figma-hashes.json'), { boards: { '1:1': { hash: 'cb1' } }, files: {} });
  assert.match(run('figma-source.ts', [F, 'calls', 'chunks', 'design']).out, /already current/);
  put(join(EX, 'figma-hashes.json'), { boards: { '1:1': { hash: 'cb2' } }, files: {} });
  assert.match(run('figma-source.ts', [F, 'calls', 'chunks', 'design']).out, /1 screenshot\(s\)/);
  assert.equal(read(join(calls, 'todo.json')).screenshots[0].save_to, 'library/zztest/design-fixture/specs/2026-01-01/extracted/figma/board.png', 'saved over the shared image');
});

test('figma-source: save refuses a return older than its call', () => {
  const calls = join(EX, 'figma-source', 'design', 'calls'), home = join(tmpdir(), `design-test-home-${process.pid}`);
  put(join(calls, 'plan-9-9.js'), '// call');
  const proj = join(home, '.claude', 'projects', ROOT.replace(/[^A-Za-z0-9]/g, '-'));
  const ret = JSON.stringify({ mode: 'plan', boards: [], chunks: [], missing: [] });
  const transcript = (at: string) => [
    { timestamp: at, message: { content: [{ type: 'tool_use', id: 'u1', name: 'mcp__figma-design__use_figma', input: { description: 'casebook figma-source design plan-9-9' } }] } },
    { timestamp: at, message: { content: [{ type: 'tool_result', tool_use_id: 'u1', content: [{ type: 'text', text: ret }] }] } },
  ].map(x => JSON.stringify(x)).join('\n') + '\n';
  put(join(proj, 's.jsonl'), transcript(new Date(Date.now() - 3600_000).toISOString()));
  const stale = run('figma-source.ts', [F, 'save', 'design', 'plan-9-9'], { env: { HOME: home } });
  assert.match(stale.out, /stale: plan-9-9/);
  put(join(proj, 's.jsonl'), transcript(new Date(Date.now() + 1000).toISOString()));
  const fresh = run('figma-source.ts', [F, 'save', 'design', 'plan-9-9'], { env: { HOME: home } });
  assert.match(fresh.out, /saved .*plan-9-9\.json/);
  rmSync(home, { recursive: true, force: true });
});
