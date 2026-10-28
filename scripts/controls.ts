// Control trace (REQ-038): every tappable control in the Figma inventory names the rows that press it, so each run
// presses every control at least once. Inputs also name the row that dismisses them (keyboard down / Done / tap outside).
// Usage: node scripts/controls.ts <feature> <ios|android> [--draft <id>]
// Reads specs/<set>/extracted/inventory.json (scripts/inventory.ts) and writes control-trace.json next to the table or
// draft. One entry per group (inventory.ts): the same button on any number of screens or boards is one entry, and a
// choice set (chips, options, template or scene cards) is one entry that one press of any choice covers. Fill each
// entry's `press` (and `dismiss` for inputs):
//   TC-…[, TC-…]      the rows that press it (any one counts; several are fine)
//   n/a: <why>        not tappable in the app, decorative, another platform's frame, or out of this table's scope
// Entries already traced in this file are kept; others are carried from the newest earlier draft (same group id), then
// filled automatically where the table says so (`how`):
//   arrow   the control starts a flow arrow whose requirement is covered by these rows
//   label   these rows' Action taps / presses / selects / opens the control's label 「…」 (check these: a match is a hint)
// `app` lists the app's accessibility ids or labels for the control when they differ from the Figma label (e.g.
// "creditsHomePage.UIButton.detail"); coverage-page.ts matches a tap on one of them to this entry first. Add one when
// the page lists a tap that pressed the control under "Taps that matched no control".
// check.ts fails a draft with an entry that has no press (or an input with no dismiss) or names a row that is not active.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg, assertIds, draftsDir, featureDir, readManifest, readTable, tableDir, writeJsonRows } from './lib/library.ts';
import { arrowRequirement, requirementRows, tcList } from './lib/coverage.ts';

const [feature, platform] = process.argv.slice(2);
assertIds(feature, platform);
const draft = arg('draft');
const dir = draft ? join(draftsDir(feature, platform), draft) : tableDir(feature, platform);
const specFolder: string = draft ? JSON.parse(readFileSync(join(dir, 'spec.json'), 'utf8')).spec_folder : readManifest(feature, platform)!.spec_folder;
const invPath = join(featureDir(feature), specFolder, 'extracted', 'inventory.json');
if (!existsSync(invPath)) { console.error(`No ${invPath}: build it with scripts/inventory.ts`); process.exit(1); }
const inv = JSON.parse(readFileSync(invPath, 'utf8'));
const rows = readTable(join(dir, draft ? 'draft.csv' : 'cases.csv')).filter(r => r.Change !== 'removed');
const req = existsSync(join(dir, 'requirements.md')) ? readFileSync(join(dir, 'requirements.md'), 'utf8') : '';
const outPath = join(dir, 'control-trace.json');
type Entry = { group: string; kind: string; board: string; boards: string[]; name: string; label: string; set: boolean; instances: number; screens: string[]; controls: string[]; app: string[]; press: string; dismiss?: string; how?: string; carried_from?: string };
const own: Entry[] = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')).entries : [];
const drafts = draftsDir(feature, platform);
// carry from the newest earlier draft; the approved table carries from nothing (its trace comes from the draft it was
// saved from, and a newer draft's rows may not exist in it)
const earlier = draft && existsSync(drafts) ? readdirSync(drafts).filter(d => d < draft && existsSync(join(drafts, d, 'control-trace.json'))).sort().at(-1) : undefined;
const prev: Entry[] = earlier ? JSON.parse(readFileSync(join(drafts, earlier, 'control-trace.json'), 'utf8')).entries : [];
const ownBy = new Map(own.map(e => [e.group, e])), prevBy = new Map(prev.map(e => [e.group, e]));

const rowsOfReq = requirementRows(rows, req);
const arrowRows = new Map<string, string[]>();
for (const a of inv.arrows) {
  if (!a.src || a.duplicate_of) continue;
  const rid = arrowRequirement(req, a.id);
  if (rid) arrowRows.set(a.src, [...new Set([...(arrowRows.get(a.src) ?? []), ...rowsOfReq(rid)])]);
}
const norm = (s: string) => s.toLowerCase().replace(/[\s「」"'’…]+/g, ' ').trim();
const labelRows = (label: string) => {
  if (!label || label.length < 3 || /^[\d\s.,:/%+-]+$/.test(label)) return [];
  // a row counts only when it acts on the label (「Delete」 in "Delete one character" is not a tap on 「Delete」)
  const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const acts = new RegExp(`\\b(tap|taps|tapping|press|presses|select|selects|choose|chooses|pick|picks|open|opens|toggle|switch)\\b[^.;→]{0,40}(「${esc(label)}」|\\b${esc(norm(label))}\\b)`, 'i');
  return rows.filter(r => acts.test(r.Action ?? '') || acts.test(norm(r.Action ?? ''))).map(r => r.ID);
};
const DISMISS = /keyboard|dismiss|tap outside|「Done」|「return」|close the (?:editor|input)/i;

const scrName = new Map(inv.screens.map((s: any) => [s.id, s.name]));
const groups = new Map<string, any[]>();
for (const c of inv.controls) if (c.platforms.includes(platform)) groups.set(c.group, [...(groups.get(c.group) ?? []), c]);
const entries: Entry[] = [];
for (const [group, cs] of groups) {
  const c0 = cs[0];
  const labels = [...new Set(cs.map((c: any) => c.label).filter(Boolean))] as string[];
  const isSet = cs.some((c: any) => c.set);
  const e: Entry = { group, kind: c0.kind, board: c0.board, boards: [...new Set(cs.map((c: any) => c.board))] as string[], name: c0.name,
    label: isSet ? `choice of ${labels.length || cs.length}${labels.length ? `: ${labels.slice(0, 4).map(l => `「${l}」`).join(' ')}${labels.length > 4 ? ' …' : ''}` : ''}` : c0.label,
    set: isSet, instances: cs.reduce((n: number, c: any) => n + c.screens.length, 0),
    screens: [...new Set(cs.flatMap((c: any) => c.screens.map((s: string) => scrName.get(s))))].slice(0, 6) as string[], controls: cs.map((c: any) => c.id), app: [], press: '' };
  const k = ownBy.get(group), p = prevBy.get(group);
  e.app = [...new Set([...(k?.app ?? []), ...(p?.app ?? [])])];
  if (k?.press) Object.assign(e, { press: k.press, dismiss: k.dismiss, how: k.how, carried_from: k.carried_from });
  else if (p?.press) Object.assign(e, { press: p.press, dismiss: p.dismiss, how: p.how, carried_from: earlier });
  if (!e.press || e.how === 'arrow' || e.how === 'label') {
    const viaArrow = [...new Set(cs.flatMap((c: any) => arrowRows.get(c.id) ?? []))];
    const viaLabel = viaArrow.length ? [] : [...new Set(cs.flatMap((c: any) => labelRows(c.label)))];
    const auto = viaArrow.length ? viaArrow : viaLabel;
    if (auto.length) Object.assign(e, { press: auto.slice(0, 6).join(', '), how: viaArrow.length ? 'arrow' : 'label' });
  }
  if (e.kind === 'input' && !e.dismiss && e.press && !e.press.startsWith('n/a')) {
    const d = tcList(e.press).filter(t => DISMISS.test(rows.find(r => r.ID === t)?.Action ?? ''));
    if (d.length) e.dismiss = d.join(', ');
  }
  if (e.kind === 'input' && e.dismiss === undefined) e.dismiss = '';
  entries.push(e);
}
entries.sort((a, b) => a.board.localeCompare(b.board) || a.name.localeCompare(b.name));
writeJsonRows(outPath, { spec_folder: specFolder, platform, inventory: invPath.slice(featureDir(feature).length + 1), entries });
const by = (f: (e: Entry) => boolean) => entries.filter(f).length;
console.log(JSON.stringify({ out: outPath, groups: entries.length, traced: by(e => !!e.press), auto_arrow: by(e => e.how === 'arrow'), auto_label: by(e => e.how === 'label'),
  not_applicable: by(e => e.press.startsWith('n/a')), untraced: by(e => !e.press), inputs_without_dismiss: by(e => e.kind === 'input' && !e.dismiss), carried_from: earlier ?? null }, null, 1));
