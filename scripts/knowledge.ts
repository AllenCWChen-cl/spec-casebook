// Domain knowledge brief: the CyberLink, product and feature entries that apply, merged into one text (narrowest
// scope wins, superseded and overridden entries left out), so an analysis or a run segment reads one short file.
// Format and rules: the domain-knowledge skill (.claude/skills/domain-knowledge/SKILL.md).
// Usage:
//   node scripts/knowledge.ts <product>[/<feature>] [ios|android] [--for analysis|run|ebug] [--tags a,b] [--grep text]
//        [--ids] [--out <file>]       print the brief (--ids: one line per entry; --out: also write it, e.g. a draft's knowledge.md)
//   node scripts/knowledge.ts <product>[/<feature>] --check          validate every entry in the three scopes
//   node scripts/knowledge.ts <product>[/<feature>] --next company|product|feature   the next free id of that scope
//   node scripts/knowledge.ts <product>[/<feature>] inbox [add "<text>" --from "<who, where>" [--now] | done <I-nnn> <result>]
//        park knowledge given mid-run, list the open items, or close one with the entries it became
import { writeFileSync } from 'node:fs';
import { arg } from './lib/library.ts';
import { USES, addInbox, applicable, closeInbox, inboxPath, loadKnowledge, nextId, nowItems, oversized, readInbox, render, staleness, type Scope } from './lib/knowledge.ts';

const [id, maybePlatform] = process.argv.slice(2);
if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)?$/.test(id)) {
  console.error('Usage: node scripts/knowledge.ts <product>[/<feature>] [ios|android] [--for analysis|run|ebug] [--tags a,b] [--grep text] [--ids] [--out file] | --check | --next <scope>');
  process.exit(2);
}
if (maybePlatform === 'inbox') {
  const [verb, a, ...rest] = process.argv.slice(4);
  if (verb === 'add') {
    const from = arg('from');
    if (!a || !from) { console.error('inbox add "<text>" --from "<who, where>" [--now]'); process.exit(2); }
    console.log(`${addInbox(id, a, from, process.argv.includes('--now'))} parked in ${inboxPath(id)}`);
  } else if (verb === 'done') {
    const result = rest.filter(r => !r.startsWith('--')).join(' ');
    if (!a || !result) { console.error('inbox done <I-nnn> <entry ids | "dropped: why">'); process.exit(2); }
    if (!closeInbox(id, a, result)) { console.error(`${a} is not an open item`); process.exit(1); }
    console.log(`${a} → ${result}`);
  } else {
    const open = readInbox(id).filter(i => !i.done);
    for (const i of open) console.log(`${i.id} ${i.date} · ${i.from} · ${i.about}${i.now ? ' · now' : ''} · ${i.text}`);
    console.log(`${open.length} open item(s) in ${inboxPath(id)}`);
  }
  process.exit(0);
}
const platform = ['ios', 'android'].includes(maybePlatform) ? maybePlatform : undefined;
const { entries, problems } = loadKnowledge(id);

if (process.argv.includes('--check')) {
  problems.push(...oversized(id));
  for (const p of problems) console.log(p);
  const open = readInbox(id).filter(i => !i.done).length;
  console.log(`${problems.length ? `${problems.length} problem(s) in ${entries.length} entries` : `${entries.length} entries OK`}${open ? `; ${open} inbox item(s) to process (domain-knowledge skill)` : ''}`);
  process.exit(problems.length ? 1 : 0);
}

const next = arg('next');
if (next) {
  if (!['company', 'product', 'feature'].includes(next)) { console.error('--next takes company, product or feature'); process.exit(2); }
  if (next === 'feature' && !id.includes('/')) { console.error('--next feature needs a <product>/<feature> id'); process.exit(2); }
  console.log(nextId(entries, next as Scope));
  process.exit(0);
}

const use = arg('for');
if (use && !USES.includes(use)) { console.error(`--for takes ${USES.join(', ')}`); process.exit(2); }
const filter = { platform, use, tags: arg('tags')?.split(',').map(s => s.trim()).filter(Boolean), grep: arg('grep') };
const { shown, hidden } = applicable(entries, filter);
for (const p of problems) console.error(`knowledge: ${p}`);

if (process.argv.includes('--ids')) {
  for (const e of shown) console.log(`${e.id}  ${e.kind.padEnd(5)}  ${e.platform.padEnd(7)}  ${e.title}${staleness(e) ? `  (${staleness(e)})` : ''}  [${e.file}]`);
  console.log(`${shown.length} entries${hidden.length ? `, ${hidden.length} not shown (superseded or overridden)` : ''}`);
  process.exit(0);
}
const text = render(id, filter, shown, hidden, new Date(), use === 'run' ? nowItems(id) : []);
const out = arg('out');
if (out) { writeFileSync(out, text); console.error(`Wrote ${out} (${shown.length} entries)`); }
else process.stdout.write(text);
