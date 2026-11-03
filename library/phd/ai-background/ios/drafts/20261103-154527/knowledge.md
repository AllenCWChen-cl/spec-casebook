# Domain knowledge for phd/ai-background (ios), for analysis

## rule

### KP-013 iOS has two paid modes: Pro and Pro+ (ios, authority team, unverified)
Pro and Pro+ are distinct modes on iOS; never apply them to Android.

### KP-016 A one-time free trial is consumed at once (authority spec, unverified)
After the free use, returning shows the paid Generate, never 「1 Free Trial」 again; on entry the CTA never flashes
the paid price before showing Free Trial. Seen on AI Hairstyle, AI Expand (Android) and iOS Creative Studio.

### KP-031 Save & Share Next Edit starts a new edit (ios, authority observed, verified 102 days ago)
Save & Share › 「Next Edit」 reopens the photo picker for a new edit, not continuing the current one. Expectation
unconfirmed.

### KP-127 Editor guard dialogs (ios, authority observed, verified 102 days ago)
Flattening a text layer asks 「Save Changes?」 (it cannot be modified again); leaving the editor with edits asks
「Discard changes?」 (all changes will be lost).

### KP-128 Pre-checks on portrait tools (ios, authority observed, verified 102 days ago)
Body Reshape warns when it is unable to detect certain body parts; Hair Volume pre-checks the face angle (「too
slanted」 with Continue Anyway). Camera asks for the system camera permission first.

## risk

### KP-095 iOS animated-thumbnail cache key (ios, unverified)
Keyed by feature GUID it missed updates; now keyed by URL hash. iOS only.

## question

### KP-122 Does Export write to the Photos library? (ios)
Only inferred from reaching Save & Share; on-canvas Text box typing was not tested either.

## howto

### KP-112 Reading an old ticket (unverified)
Read the latest discussion, RD root cause and last QA recheck before the original Expected Result. Closed needs its
close reason; Propose Won't Fix is not permanent; RDResolved has no QA close yet. A fix's regression covers the
original path and the scope RD names.

## quirk

### KP-023 AI Enhance badge says 5 but VIP is charged 0 (ios, verified 102 days ago)
The displayed price does not always equal the actual charge for VIP: match the ledger, not the badge.

## fact

### KP-022 Credit costs seen on iOS 20.15 (ios, verified 102 days ago)
AI Removal (generative) 5, AI Replace (Describe text) 2, AI Creative Studio (GPT-Image-2) 6, AI Try-On 3 (badge), as
charged to a VIP account. Version-bound.

### KP-123 Bottom navigation has five tabs (ios, verified 102 days ago)
Home (Edit, Camera, AI-tool grid), Discover (community feed, chips All / GPT Trends / Animate / Pets, 「Try it」), AI
Videos (Image to Video, AI Anime Video), AI Photos (「AI Portrait Styles」: Creative Studio, Try-On, Hairstyle, Art, Glow
Up, Face Swap), Mine (VIP status, My Credits, Buy Now, shortcuts).

### KP-126 Editor has five category tabs (ios, verified 102 days ago)
Quick Actions (Auto, Subject, Retouch, Background, Presets), Edit (AI Edit Agent, AI Removal, Crop, Text, Cutout,
Background), Enhance (AI Enhance, Adjustments, Filter, AI Color, Deblur), Portrait (Beautify, Body Reshape, Makeup,
Hair, AI Art), Effects (Blur Tool, Fisheye, HDR, Vignette, Light Hit). Top bar: Home, layers, Download, Settings;
undo / redo appear after the first edit. Adjustments › Light / Color / Details; Crop = Crop &
Rotate + Perspective; Text = Text + Text Bubble.

<!-- knowledge hash: c63caf7863e08517 -->
