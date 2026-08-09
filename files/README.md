# Hacker House Goa — Builder Tools

5 files, sab `.ts` / `.tsx`, Next.js App Router + TypeScript + Tailwind
compatible, theme tumhare screenshot se match karta hai (forest green,
cream, yellow-gold, hot pink, terracotta, near-black).

## Files

| File | Kya karta hai |
|---|---|
| `goaBuilderShared.ts` | Colors, coordinate constants, canvas draw helpers, random name/handle generator — dono builders isse import karte hain |
| `usePhotoPositioner.ts` | Drag-to-pan + pinch/scroll/slider-to-zoom hook (mouse + touch dono) |
| `PfpFrameBuilder.tsx` | Asset 1 — circular PFP frame builder |
| `IdCardBuilder.tsx` | Asset 2 — builder ID card generator (QR code included) |
| `GoaBuilder.tsx` | Parent — tab switch between the two |
| `design-prompts-for-image-gen.md` | AI-art prompts + exact pixel coordinates for the 2 template PNGs |

## Setup

1. Copy all 5 code files into your project, e.g. `components/goa-builder/`
2. Install the one extra dependency:
   ```bash
   npm install qrcode
   npm install -D @types/qrcode
   ```
   (`lucide-react` already in your project per the theme.)
3. Generate `goa-frame.png` and `goa-card.png` using the prompts in
   `design-prompts-for-image-gen.md`, and drop them at:
   ```
   /public/templates/goa-frame.png
   /public/templates/goa-card.png
   ```
4. Render wherever the builder section lives:
   ```tsx
   import GoaBuilder from "@/components/goa-builder/GoaBuilder";

   export default function BuilderPage() {
     return <GoaBuilder />;
   }
   ```
   Or use `PfpFrameBuilder` / `IdCardBuilder` standalone if you want them
   on separate routes instead of tabs.

## User flow (both builders)

```
Upload photo  →  Drag/zoom to position  →  Edit auto-generated
   (drag/drop      inside circle or          name + handle
   or tap)          rounded photo box         (ID card: + stack,
                     • drag = pan               title, badge #)
                     • scroll/pinch/slider          ↓
                       = zoom                  Generate → Preview
                                                    ↓
                                              Download PNG
```

- Naam/handle (aur ID card ke stack/title/badge) **random auto-generate**
  hote hain step load hote hi, phir user pencil icon se tap karke edit
  kar sakta hai — no typing required unless they want to change it.
- Mobile: pointer events use kiye hain (touch + mouse dono), pinch-to-zoom
  aur single-finger drag dono kaam karte hain. Zoom slider bhi hai for
  precision without gestures.
- Photo kabhi bhi "Change photo" se replace ho sakta hai bina progress
  lose kiye.

## If the template PNGs aren't dropped in yet

Dono builders graceful fallback karte hain — agar `/public/templates/*.png`
nahi mile to sirf photo + ring dikhega bina illustration overlay ke, koi
crash nahi hoga. Isse UI turant test kar sakte ho even before art is ready.

## Tuning the coordinates later

Agar final exported PNG me circle ya photo-box position thoda alag nikle
Figma/Fable measurement me, sirf `goaBuilderShared.ts` ke `FRAME_SPEC` aur
`CARD_SPEC` constants update karo — baaki kahin kuch change nahi karna
padega.
