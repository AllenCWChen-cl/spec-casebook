# PhotoDirector domain knowledge

Facts true of every PhotoDirector (PHD) feature that no single spec states (`KP-…`). Format, scopes and how the
analysis and runs use them: the `domain-knowledge` skill. Read them merged with the CyberLink
and feature entries: `node scripts/knowledge.ts phd/<feature> <platform> [--for analysis|run|ebug]`.

There is no `library/phd/product.json` yet; the scripts that read one do not know PHD until it is added.

## Where these came from (2026-11-03)

- `sources/2026-11-03-phd-domain-k01-k76/`: a colleague's PHD domain knowledge (K01–K76), distilled from 260 PHD
  eBugs (2026-04 → 10, mostly Android) and rules the user confirmed. User-confirmed rules are `authority: team`;
  PM-stated and "confirmed by fix" rules are `authority: spec`; decisions, root causes and open questions keep their
  own kinds. Each entry's `aka` holds its old K id, so a `[Domain: K21]` citation is found with
  `node scripts/knowledge.ts phd --grep K21`. That folder's own files are the imported snapshot: change entries here.
- `sources/2026-11-03-phdi-exploration-kb/editor-navigation-map.md`: a PhotoDirector iOS exploration (20.15.0,
  2026-07-24), not all accurate; its rules are `authority: observed` (`editor-navigation.md` and a few others).
