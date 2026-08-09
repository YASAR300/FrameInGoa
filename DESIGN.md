# FrameInGoa — Design System & Architecture Specification

## Brand Tokens

| Token | Hex Value | Usage |
|---|---|---|
| `--goa-green` / `bg-goa-dark-green` | `#0D5C3D` / `#063D28` | Primary surface background, footer, shadows |
| `--sun-yellow` / `text-goa-yellow` | `#F5CE3E` | Primary accent, wordmark, signboard shapes |
| `--feni-pink` / `text-goa-pink` | `#FF2E7E` | Graphic accents, rules, badges, ring borders ONLY (never body text) |
| `--sand-cream` / `text-goa-cream` | `#F7F1DF` | Light surface cards, timeline text, body text |
| `--night-ink` | `#14100E` | High-contrast text on yellow/cream badges |

---

## Contrast Matrix (WCAG Compliance)

| Combination | Ratio | Status | Guidelines |
|---|---|---|---|
| Sun Yellow on Goa Green | ~5.2:1 | ✅ AA Body | Text & UI elements |
| Sand Cream on Goa Green | ~6.8:1 | ✅ AA Body | Readable copy |
| Night Ink on Sun Yellow | ~12.3:1 | ✅ AAA | Badges & CTA buttons |
| Feni Pink on Goa Green | ~2.3:1 | ❌ Fails Text | Fills, badges, and shapes ONLY |
| Feni Pink on Sand Cream | ~3.0:1 | ⚠️ Large Display | ≥24px or ≥19px bold only |

---

## Typography Roles & Scale

- **Display**: Western slab serif / Heavy Serif (`Rye`, `Alfa Slab One`, or official SVG lockups).
  - Sizes: 56px (Hero), 40px (Section), 28px (Card Headline).
- **Editorial**: Serif (`Instrument Serif`, `Libre Caslon`).
  - Sizes: 20px (Pull-quotes), 17px / 15px (Subtitles & Body).
- **Utility / Meta**: Monospace (`JetBrains Mono`, `Space Mono`).
  - Sizes: 12px / 11px UPPERCASE with `+0.08em` tracking (`badge numbers`, `dates`, `tech stack`).
- **Devanagari**: `Noto Sans Devanagari` / official `goa_hindi.svg`.

---

## Layout & Grid System
- **Spacing Scale**: 8px baseline rhythm (`8px, 16px, 24px, 32px, 48px`).
- **Border Radii**: `rounded-2xl` (16px), `rounded-xl` (12px), `rounded-full`.
- **Signature Device**: The Goan roadside wooden signboard with sun yellow fill and dark ink lettering.
