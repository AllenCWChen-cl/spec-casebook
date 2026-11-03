# Locale and RTL

## KP-048 Arabic may keep Western digits
- kind: rule · platform: android · use: analysis, run, ebug · tags: locale, arabic, digits · authority: spec
- source: PHD domain confirmed-rules.md K68 (PHA262026-0201, -0203, -0205, -0206, -0239) · aka: K68

Arabic UI may show digits 0–9 (Quick Actions sliders align with iOS, `Locale.US`, decided 2026-05). Do not fail
Arabic for Western digits.

## KP-049 Localised strings keep their placeholders
- kind: rule · platform: android · tags: locale, strings, crash · authority: spec
- source: PHD domain confirmed-rules.md K70 (PHA262026-0298) · aka: K70

Translations keep the platform's placeholders, types and argument count (`%1$s` on Android); a wrong placeholder
crashes the screen.

## KP-050 RTL mirrors layout, not only text
- kind: rule · platform: android · tags: locale, rtl · authority: spec
- source: PHD domain confirmed-rules.md / regression-risks.md K66 (PHA262026-0348, -0214, -0352, -0215, -0224, -0225 … -0227, -0211, -0274, -0238, -0230) · aka: K66

Bubbles point at the real button; prompt text leaves room for its buttons; slider drag matches the effect (Skin Tone,
AI Relight); lists and toolbars stay in bounds and scroll (Blender, Mosaic); measured views keep a size (ID Photo);
text and icons stay centred.
