// Tests for the domain knowledge store (scripts/knowledge.ts, lib/knowledge.ts): scopes merge narrowest-first,
// superseded and overridden entries drop out, platform and use filter, --check catches bad entries. They build a small
// synthetic product, library/zzknow/, and remove it afterwards.
// Run: npm test
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const P = join(ROOT, 'library', 'zzknow');
const run = (...args: string[]) => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'knowledge.ts'), ...args], { cwd: ROOT, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};
const put = (p: string, s: string) => { mkdirSync(join(p, '..'), { recursive: true }); writeFileSync(p, s); };

before(() => {
  put(join(P, 'knowledge', 'menus.md'), `# Menus

## KP-001 Debug menu
- kind: howto · platform: ios · use: run · tags: debug
- source: test

Old way in.

## KP-002 Refunds
- kind: rule · use: analysis, run · tags: credits · authority: team
- source: test

Failures refund.

## KP-003 Old name
- kind: term · source: test · status: superseded by KP-004

Was called X.

## KP-004 New name
- kind: term · source: test

Now called Y.
`);
  put(join(P, 'kfeat', 'knowledge', 'menus.md'), `# Menus

## KF-001 Debug menu in this feature
- kind: howto · platform: ios · use: run · source: test · overrides: KP-001

Feature way in.
`);
});
after(() => rmSync(P, { recursive: true, force: true }));

test('narrowest scope wins and superseded entries drop out', () => {
  const r = run('zzknow/kfeat', 'ios', '--ids');
  assert.equal(r.status, 0);
  assert.match(r.out, /KF-001/);
  assert.doesNotMatch(r.out, /KP-001 /);
  assert.doesNotMatch(r.out, /KP-003/);
  assert.match(r.out, /KP-004/);
  assert.match(r.out, /2 not shown/);
});

test('platform and use filter', () => {
  assert.doesNotMatch(run('zzknow/kfeat', 'android', '--ids').out, /KF-001/);
  const a = run('zzknow/kfeat', 'ios', '--for', 'analysis', '--ids').out;
  assert.match(a, /KP-002/);
  assert.doesNotMatch(a, /KF-001/);
});

test('the brief carries a hash and the product alone skips feature entries', () => {
  assert.match(run('zzknow/kfeat', 'ios').out, /knowledge hash: [0-9a-f]{16}/);
  assert.doesNotMatch(run('zzknow', '--ids').out, /KF-001/);
  assert.equal(run('zzknow', '--next', 'product').out.trim(), 'KP-005');
});

test('--check catches bad entries', () => {
  assert.equal(run('zzknow/kfeat', '--check').status, 0);
  put(join(P, 'knowledge', 'bad.md'), `## KF-009 Wrong prefix\n- kind: rule · source: test\n\nNo authority.\n`);
  const r = run('zzknow/kfeat', '--check');
  assert.equal(r.status, 1);
  assert.match(r.out, /starts with KP-/);
  assert.match(r.out, /needs authority/);
  rmSync(join(P, 'knowledge', 'bad.md'));
});

test('inbox: park, show --now items in the run brief, close', () => {
  assert.match(run('zzknow/kfeat', 'inbox', 'add', "Don't tap Reset", '--from', 'user, chat', '--now').out, /I-001 parked/);
  assert.match(run('zzknow/kfeat', 'inbox', 'add', 'Menu moved', '--from', 'RD').out, /I-002 parked/);
  assert.match(run('zzknow/kfeat', 'inbox').out, /2 open item/);
  const brief = run('zzknow/kfeat', 'ios', '--for', 'run').out;
  assert.match(brief, /applies now[\s\S]*I-001.*Don't tap Reset/);
  assert.doesNotMatch(brief, /I-002/);
  assert.doesNotMatch(run('zzknow/kfeat', 'ios', '--for', 'analysis').out, /I-001/);
  assert.match(run('zzknow/kfeat', '--check').out, /2 inbox item/);
  assert.equal(run('zzknow/kfeat', 'inbox', 'done', 'I-001', 'KF-002').status, 0);
  assert.equal(run('zzknow/kfeat', 'inbox', 'done', 'I-001', 'KF-002').status, 1);
  assert.match(run('zzknow/kfeat', 'inbox').out, /1 open item/);
  assert.doesNotMatch(run('zzknow/kfeat', 'ios', '--for', 'run').out, /applies now/);
});
