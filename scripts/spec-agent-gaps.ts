// Spec agent comparison (user, 2026-10-27, REQ-036 / REQ-037): a report made only when the user asks for one, never a
// step of the analysis; check.ts does not read its output.
// Usage: node scripts/spec-agent-gaps.ts <product>/<feature> <ios|android> --draft <id> [--no-fetch] [--snapshot]
//        node scripts/spec-agent-gaps.ts <product>/<feature> <ios|android> --refresh   (only refresh the snapshot from the clone)
// Reads library/<product>/<feature>/spec-agent.json ({ repo, ref, feature, id_prefix }) and the platform's spec agent cases, then
// compares them with the newest library/<product>/<feature>/<platform>/comparisons/*.mapping.json. The cases come from the
// committed snapshot library/<product>/<feature>/spec-agent/<platform>.json, so the casebook needs no other repo. When a clone of
// the spec agent repo is at <repo>, it is fetched and its <ref> read with git only (never its working tree) and the
// snapshot is refreshed first; --snapshot uses the committed snapshot even then. Every case the mapping does not mark
// covered, and every case it does not know yet, is a gap. Each gap gets its source from the case file (spec file, user
// request, RD build note, other) and is written to <draft>/spec-agent-gaps.json with an empty `decision` for the
// report's reason (covered TC-… · older spec · stated differently · not from the spec · not covered). Decisions already
// in the draft's file are kept; others are carried over from the newest earlier draft.
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { arg, assertIds, draftsDir, featureDir, tableDir, writeJson } from './lib/library.ts';

const COVERED = ['cov', 'rew', 'new', 'add'];
type Gap = {
  id: string; file: string; title: string; claim: string;
  source: { kind: 'spec' | 'request' | 'build' | 'casebook' | 'other'; ref: string };
  mapped: string | null; decision: string; carried_from?: string;
};

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const draft = arg('draft');
const refreshOnly = process.argv.includes('--refresh');
if (!draft && !refreshOnly) { console.error('Usage: node scripts/spec-agent-gaps.ts <product>/<feature> <ios|android> --draft <id> [--no-fetch] [--snapshot] | --refresh'); process.exit(2); }
const draftDir = join(draftsDir(feature, platform), draft ?? '');
if (draft && !existsSync(draftDir)) { console.error(`No draft ${draftDir}`); process.exit(1); }
const cfgPath = join(featureDir(feature), 'spec-agent.json');
if (!existsSync(cfgPath)) { console.error(`No ${cfgPath}: write { repo, ref, feature, id_prefix } for this feature first`); process.exit(1); }
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const repo = cfg.repo.replace(/^~(?=\/)/, homedir());
const ref = cfg.ref ?? 'origin/main';

type Case = { id: string; file: string; title: string; claim: string; source: Gap['source'] };
const snapDir = join(featureDir(feature), 'spec-agent');
const snapPath = join(snapDir, `${platform}.json`);
const dir = `test-cases/generated/${cfg.feature}/platforms/${platform}`;
const useClone = !process.argv.includes('--snapshot') && existsSync(join(repo, '.git'));

const suffix = `-${platform.toUpperCase()}`;
const caseId = (file: string) => {
  let id = file.replace(/\.yaml$/, '');
  if (id.endsWith(suffix)) id = id.slice(0, -suffix.length);
  return id.startsWith(cfg.id_prefix) ? id.slice(cfg.id_prefix.length) : id;
};

// Minimal YAML reading: a scalar value (plain or folded over deeper-indented lines) and a top-level block.
const scalar = (text: string, key: string) => {
  const lines = text.split('\n');
  const i = lines.findIndex(l => new RegExp(`^\\s*(- )?${key}:`).test(l));
  if (i < 0) return '';
  const indent = lines[i].search(/\S/) + (lines[i].trimStart().startsWith('- ') ? 2 : 0);
  const parts = [lines[i].replace(new RegExp(`^\\s*(- )?${key}:\\s*`), '')];
  for (const l of lines.slice(i + 1)) {
    if (!l.trim() || l.search(/\S/) <= indent || /^\s*[\w-]+:(\s|$)/.test(l) || /^\s*- /.test(l)) break;
    parts.push(l.trim());
  }
  return parts.join(' ').replace(/^["'>|-]\s*|["']$/g, '').trim();
};
const block = (text: string, key: string) => text.match(new RegExp(`^${key}:\\n((?:[ ]+.*\\n?)+)`, 'm'))?.[1] ?? '';

const classify = (text: string): Gap['source'] => {
  // The case's own source: source_frame, else the first requirement's source (not companion or reconciliation notes).
  const own = block(text, 'source_frame') || (block(text, 'requirements_to_check').match(/\n\s+source:\n((?:\s{6,}.*\n?)+)/)?.[1] ?? '');
  const paths = [...own.matchAll(/^\s*(?:markdown|source_pdf|file): (.+)$/gm)].map(m => m[1].trim());
  const p = paths.join(' ');
  if (!p) return { kind: 'other', ref: '(no source in the case file)' };
  if (/source\/user-/.test(p)) return { kind: 'request', ref: p };
  if (/source\/tr-/.test(p)) return { kind: 'build', ref: p };
  if (/(?:pdr-)?spec-casebook/.test(p)) return { kind: 'casebook', ref: p };
  if (/source\/(pm|design|figma)[-\w]*\/|active\/0\d-|\.pdf\b/.test(p)) return { kind: 'spec', ref: paths.find(x => x.endsWith('.pdf')) ?? paths[0] };
  return { kind: 'other', ref: p };
};

let commit: string, cases: Case[], from: 'clone' | 'snapshot';
if (useClone) {
  const git = (args: string[], input?: string) => {
    const r = spawnSync('git', ['-C', repo, ...args], { input, maxBuffer: 1 << 30 });
    if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr.toString()}`);
    return r.stdout;
  };
  if (!process.argv.includes('--no-fetch')) git(['fetch', '--quiet', 'origin']);
  commit = git(['rev-parse', ref]).toString().trim();
  const files = git(['ls-tree', '--name-only', `${commit}:${dir}`]).toString().split('\n')
    .filter(f => f.endsWith('.yaml') && !f.includes('suite-preflight'));
  // Read every case file in one `git cat-file --batch` call.
  const out = git(['cat-file', '--batch'], files.map(f => `${commit}:${dir}/${f}`).join('\n') + '\n');
  cases = [];
  let at = 0;
  for (const f of files) {
    const nl = out.indexOf(10, at);
    const size = +out.subarray(at, nl).toString().split(' ')[2];
    const text = out.subarray(nl + 1, nl + 1 + size).toString('utf8');
    at = nl + 1 + size + 1;
    cases.push({ id: caseId(f), file: `${dir}/${f}`, title: scalar(text, 'title'),
      claim: scalar(text, 'pass_when') || scalar(text, 'expected') || scalar(text, 'text'), source: classify(text) });
  }
  mkdirSync(snapDir, { recursive: true });
  writeJson(snapPath, { repo: cfg.repo, ref, commit, feature: cfg.feature, platform, read_at: new Date().toISOString(), cases });
  from = 'clone';
  if (refreshOnly) { console.log(`${snapPath}: ${cases.length} cases at ${commit.slice(0, 8)}`); process.exit(0); }
} else {
  if (refreshOnly) { console.error(`No spec agent clone at ${repo} to refresh from`); process.exit(1); }
  if (!existsSync(snapPath)) { console.error(`No spec agent clone at ${repo} and no snapshot ${snapPath}`); process.exit(1); }
  const snap = JSON.parse(readFileSync(snapPath, 'utf8'));
  ({ commit, cases } = snap);
  from = 'snapshot';
  console.error(`Spec agent cases from the committed snapshot (${commit.slice(0, 8)}, read ${snap.read_at.slice(0, 10)})`);
}

const cmpDir = join(tableDir(feature, platform), 'comparisons');
const mappings = existsSync(cmpDir) ? readdirSync(cmpDir).filter(f => f.endsWith('.mapping.json')).sort() : [];
const mappingFile = mappings.at(-1) ?? null;
const sa: Record<string, string> = mappingFile ? JSON.parse(readFileSync(join(cmpDir, mappingFile), 'utf8')).sa : {};

// Decisions to keep: this draft's own file first, then the newest earlier draft that has one.
const outPath = join(draftDir, 'spec-agent-gaps.json');
const own = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')).gaps as Gap[] : [];
const earlier = readdirSync(draftsDir(feature, platform)).filter(d => d < (draft ?? '') && existsSync(join(draftsDir(feature, platform), d, 'spec-agent-gaps.json'))).sort().at(-1);
const prev = earlier ? JSON.parse(readFileSync(join(draftsDir(feature, platform), earlier, 'spec-agent-gaps.json'), 'utf8')).gaps as Gap[] : [];
const kept = new Map(own.map(g => [g.id, g]));
const carried = new Map(prev.filter(g => !/^added\b/.test(g.decision)).map(g => [g.id, g]));

const gaps: Gap[] = [];
for (const c of cases) {
  const mapped = sa[c.id] ?? null;
  if (mapped && COVERED.includes(mapped)) continue;
  const g: Gap = { ...c, mapped, decision: '' };
  const k = kept.get(c.id), p = carried.get(c.id);
  if (k?.decision) Object.assign(g, { decision: k.decision, carried_from: k.carried_from });
  else if (p?.decision) Object.assign(g, { decision: p.decision, carried_from: earlier });
  gaps.push(g);
}
gaps.sort((a, b) => a.source.kind.localeCompare(b.source.kind) || a.id.localeCompare(b.id));

writeJson(outPath, {
  spec_agent: { repo: cfg.repo, ref, commit, feature: cfg.feature, platform, cases: cases.length, from },
  mapping: mappingFile ? `comparisons/${mappingFile}` : null,
  generated_at: new Date().toISOString(),
  gaps,
});
const by = (k: string) => gaps.filter(g => g.source.kind === k).length;
console.log(JSON.stringify({
  out: outPath, commit: commit.slice(0, 8), from, cases: cases.length, mapping: mappingFile, gaps: gaps.length,
  by_source: { spec: by('spec'), request: by('request'), build: by('build'), casebook: by('casebook'), other: by('other') },
  unmapped: gaps.filter(g => !g.mapped).length, undecided: gaps.filter(g => !g.decision).map(g => g.id),
  next: 'Give every gap its reason in the new mapping and build the comparison page (skill: Spec agent comparison). The report adds no rows.',
}, null, 2));
