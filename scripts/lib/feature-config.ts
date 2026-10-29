// Per-feature settings the run scripts need (log files and tags, the Pink menu), from library/<product>/<feature>/feature.json,
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

// The feature a run folder belongs to: library/<product>/<feature>/<platform>/runs/<run> → <product>/<feature>.
export function featureOfRunDir(runDir: string): string | null {
  if (!resolve(runDir).startsWith(LIBRARY + sep)) return null;
  const [product, feature] = resolve(runDir).slice(LIBRARY.length + 1).split(sep);
  return product && feature ? `${product}/${feature}` : null;
}

export const configForRunDir = (runDir: string) => { const f = featureOfRunDir(runDir); return f ? loadFeatureConfig(f) : DEFAULTS; };

// The product a feature belongs to, from library/<product>/product.json: app ids per platform and the eBug (ECL)
// product names, so no script hard-codes one product.
export type ProductConfig = {
  name: string;
  ios?: { bundle_id: string; testflight_name?: string; ecl_product?: string };
  android?: { package: string; ecl_product?: string };
};
export function loadProductConfig(feature: string): ProductConfig | null {
  const p = join(LIBRARY, feature.split('/')[0], 'product.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}
export const productForRunDir = (runDir: string) => { const f = featureOfRunDir(runDir); return f ? loadProductConfig(f) : null; };
// A required product value, else stop with what to set: the run folder's product.json or the CASEBOOK_<env> variable.
export function productValue(runDir: string, pick: (p: ProductConfig) => string | undefined, envName: string): string {
  const p = productForRunDir(runDir), v = p ? pick(p) : undefined;
  if (v) return v;
  console.error(`No ${envName.toLowerCase().replace(/_/g, ' ')}: run inside library/<product>/<feature>/<platform>/runs/ with that value in library/<product>/product.json, or set CASEBOOK_${envName}.`);
  process.exit(2);
}
