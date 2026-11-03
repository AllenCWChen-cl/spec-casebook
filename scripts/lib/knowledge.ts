// Domain knowledge (user, 2026-11-03): facts about CyberLink apps that no spec states but the analysis, the runs and
// the eBugs need. Three scopes, narrowest wins: library/knowledge/ (every product, KC-…), library/<product>/knowledge/
// (KP-…) and library/<product>/<feature>/knowledge/ (KF-…). Each is a folder of topic files; an entry is
//
//   ## KP-004 Credits ledger rows
//   - kind: rule · platform: both · use: analysis, run · tags: credits · authority: spec
//   - source: RD note DRA261896P0043 (2026-10-21) · verified: 16.8.0 build 2610212 (2026-10-27)
//   <body until the next "## " heading>
//
// Format and rules: the domain-knowledge skill (.claude/skills/domain-knowledge/SKILL.md).
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { LIBRARY, ROOT } from './library.ts';

export const KINDS = ['rule', 'decision', 'risk', 'question', 'howto', 'quirk', 'fact', 'term'];
export const USES = ['analysis', 'run', 'ebug'];
export const AUTHORITIES = ['spec', 'team', 'observed'];
export type Scope = 'company' | 'product' | 'feature';
export const PREFIX: Record<Scope, string> = { company: 'KC', product: 'KP', feature: 'KF' };
export const KB_ID = /\bK[CPF]-\d{3,}\b/g;

export type Entry = {
  id: string; title: string; scope: Scope; file: string; line: number;
  kind: string; platform: string; use: string[]; tags: string[];
  authority?: string; source?: string; verified?: string; status: string; overrides?: string; aka: string[];
  body: string;
};

// The knowledge folders that apply to an id: "pdr" (product) or "pdr/ai-mini-drama" (feature), broadest first.
export function knowledgeDirs(id: string): { scope: Scope; dir: string }[] {
  const [product, feature] = id.split('/');
  const dirs: { scope: Scope; dir: string }[] = [{ scope: 'company', dir: join(LIBRARY, 'knowledge') }];
  if (product) dirs.push({ scope: 'product', dir: join(LIBRARY, product, 'knowledge') });
  if (feature) dirs.push({ scope: 'feature', dir: join(LIBRARY, product, feature, 'knowledge') });
  return dirs;
}

const topicFiles = (dir: string) => existsSync(dir)
  ? readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'inbox.md' && statSync(join(dir, f)).isFile()).sort().map(f => join(dir, f))
  : [];

export function parseFile(path: string, scope: Scope): { entries: Entry[]; problems: string[] } {
  const entries: Entry[] = [], problems: string[] = [];
  const lines = readFileSync(path, 'utf8').split('\n');
  const where = (n: number) => `${relative(ROOT, path)}:${n + 1}`;
  let cur: Entry | null = null, inMeta = false;
  const close = () => { if (cur) { cur.body = cur.body.trim(); entries.push(cur); } cur = null; };
  lines.forEach((line, n) => {
    const h = line.match(/^## (\S+)\s+(.*)$/);
    if (h) {
      close();
      if (!/^K[CPF]-\d{3,}$/.test(h[1])) { problems.push(`${where(n)}: heading "${line}" has no KC-/KP-/KF- id`); return; }
      if (!h[1].startsWith(PREFIX[scope])) problems.push(`${where(n)}: ${h[1]} is in a ${scope} folder, so its id starts with ${PREFIX[scope]}-`);
      cur = { id: h[1], title: h[2].trim(), scope, file: relative(ROOT, path), line: n + 1, kind: '', platform: 'both', use: ['analysis', 'run'], tags: [], aka: [], status: 'current', body: '' };
      inMeta = true;
      return;
    }
    if (!cur) return;
    if (inMeta && /^- \w+:/.test(line)) {
      for (const part of line.slice(2).split(' · ')) {
        const m = part.match(/^(\w+):\s*(.*)$/);
        if (!m) { problems.push(`${where(n)}: "${part}" is not key: value`); continue; }
        const [, k, v] = m, list = v.split(',').map(s => s.trim()).filter(Boolean);
        if (k === 'kind') cur.kind = v.trim();
        else if (k === 'platform') cur.platform = v.trim();
        else if (k === 'use') cur.use = list;
        else if (k === 'tags') cur.tags = list.map(t => t.toLowerCase());
        else if (k === 'authority') cur.authority = v.trim();
        else if (k === 'source') cur.source = v.trim();
        else if (k === 'verified') cur.verified = v.trim();
        else if (k === 'status') cur.status = v.trim();
        else if (k === 'overrides') cur.overrides = v.trim();
        else if (k === 'aka') cur.aka = list;
        else problems.push(`${where(n)}: unknown key "${k}"`);
      }
      return;
    }
    inMeta = false;
    cur.body += line + '\n';
  });
  close();
  for (const e of entries) {
    const at = `${e.file}:${e.line} ${e.id}`;
    if (!KINDS.includes(e.kind)) problems.push(`${at}: kind must be one of ${KINDS.join(', ')}`);
    if (!['ios', 'android', 'both'].includes(e.platform)) problems.push(`${at}: platform must be ios, android or both`);
    for (const u of e.use) if (!USES.includes(u)) problems.push(`${at}: use "${u}" is not one of ${USES.join(', ')}`);
    if (!e.source) problems.push(`${at}: no source (who said it or where it came from, and when)`);
    if (e.kind === 'rule' && !AUTHORITIES.includes(e.authority ?? '')) problems.push(`${at}: a rule needs authority: ${AUTHORITIES.join(' | ')}`);
    if (!/^(current|superseded by K[CPF]-\d{3,}|disputed: .+)$/.test(e.status)) problems.push(`${at}: status must be current, "superseded by K…-NNN" or "disputed: <why>"`);
    if (!e.body) problems.push(`${at}: empty body`);
  }
  return { entries, problems };
}

export function loadKnowledge(id: string): { entries: Entry[]; problems: string[] } {
  const entries: Entry[] = [], problems: string[] = [];
  for (const { scope, dir } of knowledgeDirs(id)) for (const f of topicFiles(dir)) {
    const r = parseFile(f, scope);
    entries.push(...r.entries); problems.push(...r.problems);
  }
  const byId = new Map<string, Entry>();
  for (const e of entries) {
    if (byId.has(e.id)) problems.push(`${e.file}:${e.line}: ${e.id} is also ${byId.get(e.id)!.file}:${byId.get(e.id)!.line}`);
    byId.set(e.id, e);
  }
  for (const e of entries) {
    const sup = e.status.match(/^superseded by (\S+)/)?.[1];
    if (sup && !byId.has(sup)) problems.push(`${e.id}: superseded by ${sup}, which does not exist here`);
    if (e.overrides) {
      const o = byId.get(e.overrides);
      if (!o) problems.push(`${e.id}: overrides ${e.overrides}, which does not exist here`);
      else if (scopeRank(o.scope) >= scopeRank(e.scope)) problems.push(`${e.id}: overrides ${o.id}, which is not a broader scope`);
    }
  }
  return { entries, problems };
}

const scopeRank = (s: Scope) => ({ company: 0, product: 1, feature: 2 })[s];

export type Filter = { platform?: string; use?: string; tags?: string[]; grep?: string };

// Entries that apply: current, not overridden by a narrower one, matching the platform, use, tags and text asked for.
export function applicable(entries: Entry[], f: Filter = {}): { shown: Entry[]; hidden: { id: string; why: string }[] } {
  const overridden = new Map(entries.filter(e => e.overrides && e.status === 'current').map(e => [e.overrides!, e.id]));
  const hidden: { id: string; why: string }[] = [], shown: Entry[] = [];
  const g = f.grep?.toLowerCase();
  for (const e of entries) {
    if (e.status !== 'current') { hidden.push({ id: e.id, why: e.status }); continue; }
    if (overridden.has(e.id)) { hidden.push({ id: e.id, why: `overridden by ${overridden.get(e.id)}` }); continue; }
    if (f.platform && e.platform !== 'both' && e.platform !== f.platform) continue;
    if (f.use && !e.use.includes(f.use)) continue;
    if (f.tags?.length && !f.tags.some(t => e.tags.includes(t.toLowerCase()))) continue;
    if (g && !`${e.id} ${e.aka.join(' ')} ${e.title} ${e.tags.join(' ')} ${e.body}`.toLowerCase().includes(g)) continue;
    shown.push(e);
  }
  const order = (e: Entry) => KINDS.indexOf(e.kind) * 10 - scopeRank(e.scope);
  shown.sort((a, b) => order(a) - order(b) || a.id.localeCompare(b.id));
  return { shown, hidden };
}

// An entry whose verified date is missing or older than this is flagged in the brief, so a run re-checks it.
export const STALE_DAYS = 90;
export function staleness(e: Entry, today = new Date()): string {
  if (['term', 'decision', 'question'].includes(e.kind)) return '';
  const d = e.verified?.match(/\d{4}-\d{2}-\d{2}/g)?.pop();
  if (!d) return 'unverified';
  const days = Math.floor((today.getTime() - Date.parse(d)) / 86400000);
  return days > STALE_DAYS ? `verified ${days} days ago` : '';
}

export function render(id: string, f: Filter, entries: Entry[], hidden: { id: string; why: string }[], today = new Date(), now: InboxItem[] = []): string {
  const out: string[] = [];
  if (now.length) out.push('## Parked, applies now (inbox, not processed yet)', '', ...now.map(i => `- ${i.id} ${i.date} (${i.from}): ${i.text}`), '');
  out.unshift(`# Domain knowledge for ${id}${f.platform ? ` (${f.platform})` : ''}${f.use ? `, for ${f.use}` : ''}`, '');
  if (!entries.length) out.push('_No entries apply._', '');
  // A run segment reads the brief at every start (user, 2026-11-03: a run that does not drain tokens): what drives the
  // phone in full, what the table's rows already carry (rules, risks, questions, terms) as titles to --grep when needed.
  const titleOnly = (e: Entry) => f.use === 'run' && !f.grep && ['rule', 'risk', 'question', 'term'].includes(e.kind);
  let kind = '';
  for (const e of entries.filter(e => !titleOnly(e))) {
    if (e.kind !== kind) { kind = e.kind; out.push(`## ${kind}`, ''); }
    const flags = [e.platform !== 'both' ? e.platform : '', e.authority ? `authority ${e.authority}` : '', staleness(e, today)].filter(Boolean);
    out.push(`### ${e.id} ${e.title}${flags.length ? ` (${flags.join(', ')})` : ''}`, e.body, '');
  }
  const titles = entries.filter(titleOnly);
  if (titles.length) out.push('## Titles only (`--grep <id>` prints one)', '', ...titles.map(e => `- ${e.id} ${e.kind}: ${e.title}${e.platform !== 'both' ? ` (${e.platform})` : ''}`), '');
  if (hidden.length) out.push(`Not shown: ${hidden.map(h => `${h.id} (${h.why})`).join(', ')}`, '');
  out.push(`<!-- knowledge hash: ${knowledgeHash(entries)} -->`, '');
  return out.join('\n');
}

// What a draft read: the ids, titles and bodies shown (not the staleness flags, which change with the date).
export const knowledgeHash = (entries: Entry[]) =>
  createHash('sha256').update(entries.map(e => `${e.id}\n${e.title}\n${e.body}`).join('\n\n')).digest('hex').slice(0, 16);

// The store stays small (user, 2026-11-03): originals in sources/ are git-ignored; what is committed there is text, and
// a committed text over this size is a warning (summarise it into entries instead of keeping a dump).
export const SOURCE_TEXT_MAX = 200 * 1024;
export function oversized(id: string): string[] {
  const out: string[] = [];
  // Originals sit straight in sources/<set>/ and are git-ignored; everything else here is committed.
  const ignored = (p: string) => /\/sources\/[^/]+\/[^/]+$/.test(p) && !p.endsWith('/source.json');
  const walk = (d: string) => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d)) {
      const p = join(d, f), st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (!ignored(p) && st.size > SOURCE_TEXT_MAX) out.push(`${relative(ROOT, p)} is ${Math.round(st.size / 1024)} KB (over ${SOURCE_TEXT_MAX / 1024} KB): summarise it into entries instead of committing it whole`);
    }
  };
  for (const { dir } of knowledgeDirs(id)) walk(dir);
  return out;
}

export function nextId(entries: Entry[], scope: Scope): string {
  const p = PREFIX[scope];
  const max = Math.max(0, ...entries.filter(e => e.id.startsWith(p)).map(e => Number(e.id.slice(3))));
  return `${p}-${String(max + 1).padStart(3, '0')}`;
}

// The inbox (user, 2026-11-03): knowledge given while a run is going on is parked word for word, one line per item, and
// processed later by the domain-knowledge skill in a fresh context, so a run spends no tokens on intake.
//   - [ ] I-003 2026-11-03 · user, chat · pdr/ai-mini-drama · now · <text>
//   - [x] I-002 2026-11-02 · RD Kevin, TR reply · pdr · <text> → KP-066
export type InboxItem = { id: string; done: boolean; date: string; from: string; about: string; now: boolean; text: string; result?: string; line: number };
export const inboxPath = (id: string) => join(LIBRARY, id.split('/')[0], 'knowledge', 'inbox.md');
const INBOX_HEAD = '# Knowledge inbox\n\nParked knowledge, processed by the domain-knowledge skill after a run (`node scripts/knowledge.ts <id> inbox`).\n\n';

export function readInbox(id: string): InboxItem[] {
  const p = inboxPath(id);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split('\n').flatMap((line, n) => {
    const m = line.match(/^- \[( |x)\] (I-\d{3,}) (\S+) · (.*?) · (\S+) · (now · )?(.*?)(?: → (.*))?$/);
    return m ? [{ done: m[1] === 'x', id: m[2], date: m[3], from: m[4], about: m[5], now: !!m[6], text: m[7], result: m[8], line: n }] : [];
  });
}

export function addInbox(id: string, text: string, from: string, now: boolean, today = new Date().toISOString().slice(0, 10)): string {
  const p = inboxPath(id), items = readInbox(id);
  const next = `I-${String(Math.max(0, ...items.map(i => Number(i.id.slice(2)))) + 1).padStart(3, '0')}`;
  if (!existsSync(p)) { mkdirSync(join(p, '..'), { recursive: true }); writeFileSync(p, INBOX_HEAD); }
  appendFileSync(p, `- [ ] ${next} ${today} · ${from.replace(/ · /g, ', ')} · ${id} · ${now ? 'now · ' : ''}${text.replace(/\s*\n\s*/g, ' ')}\n`);
  return next;
}

export function closeInbox(id: string, item: string, result: string): boolean {
  const p = inboxPath(id), it = readInbox(id).find(i => i.id === item && !i.done);
  if (!it) return false;
  const lines = readFileSync(p, 'utf8').split('\n');
  lines[it.line] = `${lines[it.line].replace('- [ ]', '- [x]')} → ${result}`;
  writeFileSync(p, lines.join('\n'));
  return true;
}

// Open items parked with --now that concern this id (its feature or the whole product).
export const nowItems = (id: string) => readInbox(id).filter(i => !i.done && i.now && (i.about === id || i.about === id.split('/')[0] || id === i.about.split('/')[0]));
