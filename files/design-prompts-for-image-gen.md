# Hacker House Goa — Image Generation Prompts (for Fable / Midjourney)

Ye file un **do PNG assets** ke liye hai jo tumhe kisi AI art tool (Fable,
Midjourney, etc.) me generate karke `/public/templates/` me drop karne hain.
Code already in hai (`goaBuilderShared.ts`, `PfpFrameBuilder.tsx`,
`IdCardBuilder.tsx`) — bas ye 2 files chahiye:

```
/public/templates/goa-frame.png
/public/templates/goa-card.png
```

Dono **1080 × 1080 px**, PNG. Text ka koi bhi element image me generate mat
karwana — sab text (naam, handle, event name) code khud canvas pe draw karta
hai un exact coordinates par jo neeche diye hain.

---

## ASSET 1 — `goa-frame.png` (Circular PFP Frame)

### Prompt to paste in Fable / Midjourney
```
Flat vector illustration, square 1080x1080 poster in Tattly tattoo /
WPA vintage travel poster style, Goa Portuguese-colonial beach town scene.
Bold thick black outlines (3-5px), completely flat colors, no gradients,
no shadows, no 3D, no blur, slight risograph print texture.

Color palette ONLY — deep forest green #063D28, warm cream #F7F1DF,
vibrant yellow-gold #F5CE3E, hot pink #FF2E7E, terracotta #C0492B,
near-black #14100E for all outlines.

COMPOSITION — a circular illustration wraps AROUND a large empty center
circle (that center circle must stay visually empty / negative space,
do not draw anything inside it):

- Top: large yellow setting sun as a half-circle on the horizon, thin
  horizontal ocean line, 2-3 puffy flat clouds, 5-6 tiny bird V-shapes,
  two tall coconut palm trees leaning inward from left and right edges
- Left side: whitewashed Portuguese-colonial building with terracotta
  tile roof, green shutters, ornate arch doorway, potted plants,
  hanging festoon fairy lights, one palm trunk leaning diagonally
  toward the center
- Right side: a second colonial building (2-story, yellow), a green
  Vespa scooter parked outside, a surfboard leaning on the wall, a
  terracotta beach umbrella, one coconut palm
- Bottom: yellow wavy ocean/beach band across the full width, a small
  flat fishing boat left of center, a small sailboat with triangular
  sail right of center, simple curved cream wave-lines, tiny flat
  hacker/tech icons scattered along the very bottom edge at small
  scale — terminal window ">_", coffee mug with steam, USB cable,
  open laptop, curly braces "{ }", angle brackets "< >"
- Four corners: top-left large yellow hibiscus flower with dark green
  leaves, top-right large hot-pink hibiscus flower with leaves,
  bottom-left tropical fern/palm frond spray, bottom-right tropical
  fern/palm frond spray

NO text anywhere in the image. NO people. NO logos.
The dead-center circle must remain a clean negative-space hole.
```

### Where to place the negative-space circle (CRITICAL — do not change)
| Property | Value |
|---|---|
| Canvas size | 1080 × 1080 px |
| Circle center X | **540 px** |
| Circle center Y | **540 px** |
| Circle radius | **390 px** (diameter 780 px) |
| Circle fill | **100% transparent alpha** — no white, no color |
| Ring stroke around circle edge | 6 px, color `#14100E` |

**How to export from Fable/Figma correctly:**
1. Design the full illustration around the circle as normal — you can even
   temporarily fill the center circle with a placeholder color while
   designing, to check it aligns.
2. Before final export, **delete/hide whatever fills that center circle**
   so it becomes true transparency, not white.
3. Export as PNG with alpha channel enabled.
4. Sanity check: open the PNG, toggle a checkerboard/transparency view —
   center should show checkerboard, not white or color.

### Text — NONE
Zero text goes in this image. The person's name/handle are drawn by code
in the app UI overlay, not baked into this PNG.

---

## ASSET 2 — `goa-card.png` (Builder ID Card)

### Prompt to paste in Fable / Midjourney
```
Flat vector illustration, square 1080x1080 event ID card / lanyard pass
design, vintage conference badge meets Goa ferry ticket stub meets
Brazilian carnival ID card. WPA poster aesthetic, bold flat shapes,
structured zoned layout, thick black outlines on all framed elements,
no gradients, no shadows, no 3D, no blur.

Color palette ONLY — deep forest green #063D28 (base background),
warm cream #F7F1DF, vibrant yellow-gold #F5CE3E, hot pink #FF2E7E,
terracotta #C0492B, near-black #14100E outlines.

LAYOUT (top to bottom, on a 1080x1080 canvas):

1. Top banner strip, full width, y from 0 to 120px: solid cream fill,
   3px black bottom border. Small illustrated yellow sun icon with rays
   on the far left (~50px). Small Goa landmark silhouette or compass
   rose icon on the far right (~40px). Leave the CENTER of this strip
   completely EMPTY / blank cream — no text, no icons in the center.

2. Photo box, centered, x=290 to x=720 (430px wide), y=130 to y=490
   (360px tall), 28px rounded corners, cream fill, 3px black border,
   optional subtle double-line inner border 6px inset. Interior must
   stay completely blank/empty cream — no icons, no texture, no text
   inside this box, it will hold a photo later.

3. Below the photo box, a ruled ticket-stub section y=510 to y=780:
   five thin horizontal cream ruled lines at 35% opacity, each 580px
   wide, centered horizontally, spaced 54px apart. Add a small subtle
   tropical leaf/frond icon flanking the far left of this ruled zone,
   and a small "{ }" code-bracket icon flanking the far right, both at
   low opacity (25-30%) so they read as background texture, not focal
   elements. NO text characters anywhere on these ruled lines.

4. Bottom zone y=800 to 1080, same forest green background:
   - Bottom-left corner: a rich small Goa beach vignette illustration
     (~220x220px) — palm tree, waves, tiny colonial buildings, a
     scooter silhouette, contained tightly to the corner
   - Bottom-right corner: a 120x120px plain WHITE square with a black
     border, positioned 12px padding from the right edge and 12px from
     the bottom edge. This square must stay completely blank white
     inside — no pattern, no QR code, nothing — it is reserved empty
     space.
   - Bottom-center: very faint (about 15% opacity) decorative texture
     only, no legible text

5. Left and right vertical edges (full height): a tropical vine
   climbing from bottom to top, with 2-3 hibiscus flowers along it,
   kept at 65-70% opacity on both sides so it reads as a border motif
   without covering the content zones.

STRICT — do NOT render any of the following anywhere in the image:
any placeholder text, zone labels like "top section" or "photo here",
any person's name, handle, job title, or badge number, any QR code
pattern (the bottom-right square must be empty), any watermark text
that is meant to be legible (decorative-only texture is fine at very
low opacity).
```

### Exact coordinate contract (CRITICAL — matches `CARD_SPEC` in code)

**Photo box**
| Property | Value |
|---|---|
| x | 290 px |
| y | 130 px |
| width | 430 px |
| height | 360 px |
| border radius | 28 px |

**Ruled text lines** (baseline positions the code writes text onto — leave these areas visually blank/ruled only, no text)
| Line | Purpose | Y position |
|---|---|---|
| 1 | Name | 548 px |
| 2 | Stack / Role | 602 px |
| 3 | Builder Title | 656 px |
| 4 | Badge Number | 710 px |
| 5 | Social Handle | 764 px |

Each line centered at X = 540, spanning 580 px wide.

**QR code zone**
| Property | Value |
|---|---|
| x | 948 px (1080 − 12 − 120) |
| y | 948 px (1080 − 12 − 120) |
| width | 120 px |
| height | 120 px |
| fill | must stay pure white/blank in the source PNG |

**Top banner text zone (event name, drawn by code)**
| Property | Value |
|---|---|
| Zone | x:0–1080, y:0–120 |
| Text baseline center | X = 540, Y = 60 |
| Leave center of this strip blank in the artwork |

### Export Checklist Before Handoff
- [ ] `goa-frame.png` — center circle verified transparent (checkerboard test)
- [ ] `goa-card.png` — no placeholder text anywhere, QR corner is pure blank white
- [ ] Both exactly 1080 × 1080 px, PNG
- [ ] File names exactly: `goa-frame.png` and `goa-card.png`
- [ ] Drop both into `/public/templates/` in the codebase — no other code changes needed, the coordinate constants already match this spec

---

## Quick reference — full palette

| Name | Hex | Used for |
|---|---|---|
| Forest Green | `#063D28` | Primary background |
| Cream | `#F7F1DF` | Photo zones, banner, text |
| Yellow Gold | `#F5CE3E` | Sun, accents, highlights |
| Hot Pink | `#FF2E7E` | Badge color, flowers |
| Terracotta | `#C0492B` | Roof tiles, boat, warm accents |
| Near-Black | `#14100E` | All outlines and borders |
