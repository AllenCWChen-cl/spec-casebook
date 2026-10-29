// Per-feature settings the run scripts need (log files and tags, the Pink menu), from library/<feature>/feature.json,
// so the scripts carry no feature names. A feature without the file gets the generic defaults below.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { LIBRARY } from './library.ts';

export type FeatureConfig = {
  logs: {
    files: RegExp;           // app log files to read in a pull (first capture group = short name shown per line)
    failure: RegExp;         // lines that report a failure
    toast: RegExp;           // lines that record a toast
    credit: RegExp;          // credit authorisations, charges and refunds
    timing: RegExp | null;   // stage-timing lines, when the feature logs them
  };
  pink: { menu: string; freshInstallOn: string[] } | null;  // the feature's Pink tweaks menu and switches a fresh install turns on
};

const DEFAULTS: FeatureConfig = {
  logs: {
    files: /_([a-z_]+)\.txt$/,
    failure: /workflow step failed|tool failed|send failure|turn abandoned|error=|nativeFailure|recovery failed/i,
    toast: /toast/i,
    credit: /credit=|refund|returned/i,
    timing: null,
  },
  pink: null,
};

const rx = (v: unknown, flags = '') => typeof v === 'string' && v ? new RegExp(v, flags) : null;

export function loadFeatureConfig(feature: string): FeatureConfig {
  const p = join(LIBRARY, feature, 'feature.json');
  if (!existsSync(p)) return DEFAULTS;
  const j = JSON.parse(readFileSync(p, 'utf8'));
  const l = j.logs ?? {};
  return {
    logs: {
      files: rx(l.files) ?? DEFAULTS.logs.files,
      failure: rx(l.failure, 'i') ?? DEFAULTS.logs.failure,
      toast: rx(l.toast) ?? DEFAULTS.logs.toast,
      credit: rx(l.credit, 'i') ?? DEFAULTS.logs.credit,
      timing: rx(l.timing),
    },
    pink: j.pink?.menu ? { menu: j.pink.menu, freshInstallOn: j.pink.fresh_install_on ?? [] } : null,
  };
}

// The feature a run folder belongs to: library/<feature>/<platform>/runs/<run>.
export function featureOfRunDir(runDir: string): string | null {
  const rel = resolve(runDir).slice(LIBRARY.length + 1);
  return resolve(runDir).startsWith(LIBRARY + sep) ? rel.split(sep)[0] : null;
}

export const configForRunDir = (runDir: string) => { const f = featureOfRunDir(runDir); return f ? loadFeatureConfig(f) : DEFAULTS; };
