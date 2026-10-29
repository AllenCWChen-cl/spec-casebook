# MX ③ Credit Charging Table (action id) — linked sheet

Source: MX Figma 3urWYejMUP2uaglb4s73M5, text 1057:24035 「Action ID & Charging Table Link」 (board `mx-a-right`) →
Google Sheet 「AI Mini Drama CMS」 (12DuNDowqfxfDLx_ucbnn92rneNzFksk3VPvX7eGUteY), tab 「Action ID (not on CMS)」
(gid 1604730147). Workbook last modified 2026-10-20T10:46Z (owner phoebe.chang). Read 2026-10-29 (REQ-057).

| | Generate character (per image) | Generate storyboard (per scene) | Generate video Seedance 2.0 1080p (per sec) | Generate video Seedance 2.0 Mini 720p (per sec) |
|---|---|---|---|---|
| Original price (first generate and regenerate) | 6 | 6 | 13 | 4 |
| Price with discount (first generate only; regenerate has none: 「-」) | 2 | 2 | 2 | 2 |

Action ids (`<prefix>_<qty>_<unit>_<vendor>_<mode>_<attr2>_<resolution>_aiminidrama_<normal|discount>`):
- TextToImage, GPT-Image-2, 1K: `genimage_1_img_openai_gptimage2_none_1K_aiminidrama_normal` (6), `…_enable_…_normal`
  (with a reference image, 6); `…_discount` variants 2.
- ReferenceToVideo: `genvideo_1_sec_bytedance_seedance2.0std_enable_1080p_aiminidrama_normal` (13) / `_discount` (2);
  `genvideo_1_sec_bytedance_seedance2.0mini_enable_720p_aiminidrama_normal` (4) / `_discount` (2).
- No Seedance 2.5 row and no TextToSpeech row.

Against the other sources (2026-10-29):
- PM 10/16 定案: video 2.5 / 2.0 / 2.0 Mini = 6 / 4 / 2 per second; PM 10/20: storyboard image update 2 per image.
- Design: character Generate ◆6.
- App (runs to 2026-10-29, both platforms): character ◆4 per image; video 2.0 Preview 30 s ◆120 (4/s), Mini ◆60 (2/s);
  storyboard cards ◆22–◆37; scene image Regenerate ◆6.
