// Builds phases.json for the first AI Background run (round R1 / R2, 2026-11-03) on iOS or Android.
// Usage: node library/phd/ai-background/android/drafts/20261103-155417/build-phases.ts <ios|android> <draft folder>
// R1 needs no credits (KP-104: a round starts as a Free user with 0 credits): the free trial first, before anything
// can consume it, then the room and the prompt panel. R2 generates (paid) and is held until credits are arranged.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [platform, dir] = process.argv.slice(2);
if (!/^(ios|android)$/.test(platform ?? '') || !dir) { console.error('Usage: build-phases.ts <ios|android> <draft folder>'); process.exit(2); }
const android = platform === 'android';
const draft = dir.replace(/\/$/, '').split('/').pop();
const A = (ios: string[], extra: string[]) => android ? [...ios, ...extra] : ios;

const phases = [
  { id: 'R1', name: 'First use, room and prompt panel (no credits)', round: true,
    note: 'Round start (KP-104 / KP-105): reset the account through Settings › About › debug dialog so the app is a Free user with 0 credits and the AI Background free trial is unused; screenshots before / after, UUID and token masked. No row in R1 spends credits.',
    segments: [
      { id: 'R1-a', name: 'First use and free trial', note: 'Right after the reset, before anything opens Background. TC-040 is the one free generation.',
        cases: ['TC-039', 'TC-040', 'TC-041', 'TC-044'] },
      { id: 'R1-b', name: 'Room, category tabs and thumbnails', note: 'One portrait photo; nothing generated.',
        cases: A(['TC-001', 'TC-002', 'TC-008', 'TC-003', 'TC-004', 'TC-006', 'TC-007', 'TC-009', 'TC-010', 'TC-011', 'TC-012', 'TC-013', 'TC-014', 'TC-015', 'TC-045'],
          ['TC-055', 'TC-049', 'TC-050', 'TC-051']) },
      { id: 'R1-c', name: 'Custom prompt panel', note: 'Close every keyboard a row opens (REQ-039).',
        cases: A(['TC-025', 'TC-016', 'TC-017', 'TC-018', 'TC-019', 'TC-020', 'TC-021', 'TC-022', 'TC-024', 'TC-023'], ['TC-046']) },
    ] },
  { id: 'R2', name: 'Generation and waiting (credits)', hold: 'credits: R1 leaves the account at 0 credits; release when the user has arranged credits for about 6 generations (≈ 25 credits)',
    note: 'Template generations at 2 credits, Custom at 5 (Q-1). Read the credit pill before and after every generation.',
    segments: [
      { id: 'R2-a', name: 'Template generation and the bottom bar', note: 'Two template generations: one for TC-034 / TC-005 / TC-035 / TC-036, one for TC-037.',
        cases: A(['TC-034', 'TC-005', 'TC-035', 'TC-036', 'TC-037', 'TC-043'], ['TC-053', 'TC-048', 'TC-052', 'TC-054']) },
      { id: 'R2-b', name: 'Custom generation and the wait', note: 'One Custom generation for TC-026 – TC-033 (time the progress copy from one screen recording), a second for TC-038.',
        cases: A(['TC-026', 'TC-027', 'TC-028', 'TC-029', 'TC-030', 'TC-031', 'TC-032', 'TC-033', 'TC-038', 'TC-042'], ['TC-047']) },
    ] },
];

const needs: Record<string, string[]> = {
  'TC-042': ['app-log'], 'TC-043': ['app-log'], 'TC-044': ['app-log'], 'TC-045': ['appearance'],
};
const unavailable: Record<string, string> = {
  'app-log': 'observability: no PhotoDirector log pull is set up yet (feature.json has no log files or tags for this app)',
  'appearance': 'which app or system setting shows the light Design is unknown (Q-9); a system appearance change needs the user\'s go-ahead',
};
const all = phases.flatMap(p => p.segments.flatMap(s => s.cases));
if (new Set(all).size !== all.length) throw new Error('a case is in two segments');
writeFileSync(join(dir, 'phases.json'), JSON.stringify({ draft, current: ['R1', 'R2'], needs, unavailable, phases }, null, 2) + '\n');
console.log(`${join(dir, 'phases.json')}: ${all.length} cases; ${phases.map(p => `${p.id} ${p.segments.map(s => `${s.id} ${s.cases.length}`).join(', ')}`).join(' · ')}`);
