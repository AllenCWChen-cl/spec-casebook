// Shared by controls.ts and coverage-page.ts (REQ-038): which rows cover a requirement or a flow arrow.

export const tcList = (s: string) => [...s.matchAll(/\bTC-(\d{3,})(?:\s*[–-]\s*TC-(\d{3,}))?/g)].flatMap(m => {
  const a = +m[1], b = m[2] ? +m[2] : a; return Array.from({ length: b - a + 1 }, (_, i) => `TC-${String(a + i).padStart(m[1].length, '0')}`); });

// rows covering a requirement: its Spec Ref, or "Walked by: TC-…" on the requirement's line
export function requirementRows(rows: Record<string, string>[], req: string) {
  const active = new Set(rows.filter(r => r.Change !== 'removed').map(r => r.ID));
  const lines = req.split('\n');
  return (rid: string) => {
    const out = rows.filter(r => r.Change !== 'removed' && (r['Spec Ref'] ?? '').match(/\bR-\d{3,}\b/g)?.includes(rid)).map(r => r.ID);
    const walked = lines.find(l => l.startsWith(`- ${rid} `))?.match(/Walked by: ([^.]*)/)?.[1];
    return [...new Set([...out, ...(walked ? tcList(walked).filter(t => active.has(t)) : [])])];
  };
}

// the requirement written for a flow arrow (`[DS: flow arrow <node> …]`)
export const arrowRequirement = (req: string, arrow: string) =>
  req.split('\n').find(l => l.includes(`flow arrow ${arrow} `))?.match(/R-\d{3,}/)?.[0];

// a label as the app may show it: case, spacing, quotes, ellipsis and numbers (credit balances, counts) do not matter
export const normLabel = (s: string) => (s ?? '').toLowerCase().normalize('NFKC').replace(/[「」"'’“”…]|\.{3}/g, '').replace(/\d+([.,]\d+)*/g, '#')
  .replace(/[\s\u00a0]+/g, ' ').trim();

// ---- Tap → control matching (user, 2026-10-28: matching must hold up when labels, ids or layouts differ) ----
// Each logged press is scored against every control group; the best group above the threshold gets the tap.
//   app id   the tapped element's accessibility id / label is listed in the entry's `app`              1.00
//   label    the element's label equals the Figma label (normalised: case, quotes, ellipsis, numbers)  0.90
//            one is a truncation of the other (≥ 4 characters)                                          0.75
//            the Figma label sits inside the element's text, or their words mostly agree               0.60–0.65
//   icon/id  words of the Figma layer (round/ic_xmark → close) meet words of the element's id/label     0.55
//   position the tap (or the element's box) falls on the control, mapped from the 375-pt frame to the phone
//            proportionally or anchored to the left / right / top / bottom edge (safe areas differ)     0.50
// A label or id match that also agrees on position gains 0.15; the right element type (text field for an input,
// switch for a toggle) gains 0.10; a tap made during one of the entry's pressing rows gains 0.15, any other loses 0.10.
// A tap is assigned at 0.60 or more; when the runner-up is within 0.05 it is flagged ambiguous with both names, and a
// tie on position alone (no label or id evidence) is not assigned: it is listed as unmatched 「A or B」.
export type TapEl = { type: string; name: string; label: string; value?: string; x: number; y: number; w: number; h: number };
export type TapLog = { run: string; t: string; cmd: string; case: string; x?: number; y?: number; win?: string; el?: TapEl; shot?: string };
export type MatchGroup = { group: string; kind: string; name: string; labels: string[]; app: string[]; press: string[]; members: { box: number[]; sw: number; sh: number }[] };
export type TapMatch = { score: number; why: string[]; outside_rows: boolean; text: boolean; ambiguous?: string };

const STOP = new Set(['round', 'ic', 'btn', 'button', 'filled', 'outline', 'icon', 'main', 'mani', 'text', 'action', 'ui', 'uibutton',
  'view', 'cell', 'the', 'a', 'of', 'to', 'and', 'm', 'n', 's', 'l', 'v1', 'v2', 'xcuielementtype', 'other', 'image', 'static',
  'page', 'detail', 'container', 'item', 'label', 'controller', 'vc', 'btn2']);
// words that name the same control in Figma layer names and in app accessibility ids
const SYN: [RegExp, string][] = [
  [/^(xmark|close|dismiss|cancel|x)$/, 'close'], [/^(back|return|chevronleft)$/, 'back'], [/^(more|vertical|menu|ellipsis|kebab)$/, 'more'],
  [/^(trash|delete|remove|bin)$/, 'delete'], [/^(vocal|mic|microphone|voice|speech|stt)$/, 'voice'], [/^(check|done|confirm|ok|tick)$/, 'done'],
  [/^(info|information|tooltip)$/, 'info'], [/^(download|save|export)$/, 'download'], [/^(edit|pencil|square|rename)$/, 'edit'],
  [/^(expand|collapse|fullscreen|full|screen|enlarge)$/, 'expand'], [/^(credit|credits|balance|coin|coins|pill)$/, 'credit'],
  [/^(volume|mute|sound|audio|speaker)$/, 'volume'], [/^(history|recent|clock|task|tasks)$/, 'history'], [/^(play|playback)$/, 'play'],
  [/^(pause)$/, 'pause'], [/^(filter|filters)$/, 'filter'], [/^(add|plus|new|create)$/, 'add'], [/^(send|arrowup|submit)$/, 'send'],
  [/^(camera|photo|gallery|media|album)$/, 'media'], [/^(sparkle|ai|magic|enhance|enhancement)$/, 'ai'], [/^(chat|conversation)$/, 'chat'],
];
export function words(s: string) {
  const out = new Set<string>();
  const raw = (s ?? '').replace(/chevron[_\s-]?left/gi, ' back ').replace(/arrow[_\s-]?up/gi, ' send ').replace(/full[_\s-]?screen/gi, ' expand ')
    .replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9]+/);
  for (const w of raw) { if (!w || STOP.has(w) || /^\d+$/.test(w)) continue; out.add(SYN.find(([re]) => re.test(w))?.[1] ?? w); }
  return out;
}
const PRESS = /^(tap|hold|burst|id|lbl|tapif|clear|setval)$/;
function positionScore(t: TapLog, m: { box: number[]; sw: number; sh: number }) {
  if (!t.win) return { score: 0, how: '' };
  const [W, H] = t.win.split('x').map(Number), [x, y, w, h] = m.box, k = W / m.sw;
  const pts: [number, number][] = [];
  if (t.x !== undefined && t.y !== undefined) pts.push([t.x, t.y]);
  if (t.el && t.el.w > 0) pts.push([t.el.x + t.el.w / 2, t.el.y + t.el.h / 2]);
  if (!pts.length) return { score: 0, how: '' };
  const xs: [number, number, string][] = [[x * k, w * k, 'scaled'], [x, w, 'left'], [W - (m.sw - x), w, 'right']];
  // a long scrolling page only maps from the top (its lower part depends on the scroll position)
  const ys: [number, number, string][] = m.sh > 1000 ? [[y, h, 'top']] : [[y * k, h * k, 'scaled'], [y * H / m.sh, h * H / m.sh, 'stretched'], [y, h, 'top'], [H - (m.sh - y), h, 'bottom']];
  let best = { score: 0, how: '' };
  for (const [px, py] of pts) for (const [rx, rw, hx] of xs) for (const [ry, rh, hy] of ys) {
    const pad = 6;
    if (px >= rx - pad && px <= rx + rw + pad && py >= ry - pad && py <= ry + rh + pad) {
      const sc = hx === 'scaled' && (hy === 'scaled' || hy === 'stretched') ? 0.5 : 0.45;
      if (sc > best.score) best = { score: sc, how: `position (${hx === hy ? hx : `${hx}/${hy}`})` };
    }
  }
  return best;
}
export function scoreTap(t: TapLog, g: MatchGroup): TapMatch {
  const why: string[] = [];
  const texts = [t.el?.label, t.el?.name, t.el?.value].filter((v): v is string => !!v);
  let text = 0;
  if (g.app.length && texts.some(v => g.app.includes(v))) { text = 1; why.push('app id'); }
  const nl = g.labels.map(normLabel).filter(l => l && l !== '#'), nt = texts.map(normLabel).filter(Boolean);
  for (const L of nl) for (const T of nt) {
    let sc = 0, w = '';
    if (T === L) { sc = 0.9; w = `label 「${L}」`; }
    else if (Math.min(T.length, L.length) >= 4 && (T.startsWith(L) || L.startsWith(T))) { sc = 0.75; w = `label 「${L}」 (truncated)`; }
    else if (L.length >= 4 && T.includes(L)) { sc = 0.65; w = `label 「${L}」 inside the element's text`; }
    else { const a = new Set(L.split(' ')), b = new Set(T.split(' ')); let n = 0; for (const x of a) if (b.has(x)) n++;
      if (a.size >= 2 && n / (a.size + b.size - n) >= 0.6) { sc = 0.6; w = `label words 「${L}」`; } }
    if (sc > text) { text = sc; why.splice(0, why.length, w); }
  }
  if (text < 0.55) {
    const gw = words(g.name), ew = words(texts.join(' '));
    const shared = [...gw].filter(x => ew.has(x));
    if (shared.length) { text = 0.55; why.push(`icon/id word 「${shared.join(', ')}」`); }
  }
  let pos = { score: 0, how: '' };
  for (const m of g.members) { const p = positionScore(t, m); if (p.score > pos.score) pos = p; }
  let score = text ? text + (pos.score ? 0.15 : 0) : pos.score;
  if (pos.score) why.push(pos.how);
  if (!score) return { score: 0, why: [], outside_rows: false, text: false };
  const type = t.el?.type ?? '';
  if ((g.kind === 'input' && /TextField|TextView|SearchField/.test(type)) || (g.kind === 'toggle' && /Switch/.test(type))) { score += 0.1; why.push(`type ${type}`); }
  const inRows = g.press.includes(t.case);
  score += inRows ? 0.15 : -0.1;
  if (inRows) why.push(`during ${t.case}`);
  return { score: Math.round(Math.min(score, 1.2) * 100) / 100, why, outside_rows: !inRows, text: text > 0 };
}
export function matchTaps(taps: TapLog[], groups: MatchGroup[], threshold = 0.6) {
  const assigned = new Map<string, { tap: TapLog; m: TapMatch }[]>(), unmatched: { tap: TapLog; best?: string; score: number; tie?: string }[] = [];
  for (const t of taps) {
    if (!PRESS.test(t.cmd)) continue;
    const ranked = groups.map(g => ({ g, m: scoreTap(t, g) })).filter(r => r.m.score > 0).sort((a, b) => b.m.score - a.m.score);
    const [top, next] = ranked;
    if (!top || top.m.score < threshold) { unmatched.push({ tap: t, best: top?.g.group, score: top?.m.score ?? 0 }); continue; }
    const nameOf = (g: MatchGroup) => `${g.name}${g.labels[0] ? ` 「${g.labels[0]}」` : ''}`;
    if (next && top.m.score - next.m.score < 0.05) {
      // a tie on position alone proves neither control: leave it for a person (or an `app` id) to settle
      if (!top.m.text) { unmatched.push({ tap: t, best: top.g.group, score: top.m.score, tie: `${nameOf(top.g)} or ${nameOf(next.g)}` }); continue; }
      top.m.ambiguous = `${nameOf(next.g)} (${next.m.score})`;
    }
    assigned.set(top.g.group, [...(assigned.get(top.g.group) ?? []), { tap: t, m: top.m }]);
  }
  return { assigned, unmatched };
}
