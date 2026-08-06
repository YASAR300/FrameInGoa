# FrameInGoa — 9-Prompt Build Guide
### HH Goa 2026 Shortlisting Task · Frame / ID Card Generator

**How to use this:** Paste **Section 0** at the top of every prompt (it's the shared context your coding agent will otherwise forget), then run prompts 1 → 9 in order. Don't skip ahead — each prompt assumes the previous one shipped. Deadline: **11:59 pm, 13 Aug 2026**. One submission per team.

---

## Section 0 — Locked Context (prepend to every prompt)

### Event facts (verified from hhgoa.com)
| Field | Value |
|---|---|
| Event | Hacker House Goa 2026 (HH GOA) |
| Dates | 28–31 October 2026 |
| Location | Goa, India |
| Organiser | 2:47 pm Studio (`@247pmstudio` on X) |
| Taglines | "4 days. one rhythm. everything intentional." / "Less Noise. More Signal." |
| Day names | Day 01 Genesis Day · Day 02 Day of Triangle · Day 03 Build Day · Day 04 Launch Day |
| Scale signals | 6800+ registrations · 390+ hackers · 100 projects · $50K+ bounties · 247 builders in residency |
| Required hashtag | `#FrameInGoa` |

### Brand tokens
Sampled from the official site. **Before Prompt 2, open the "Brand Kit" link in the hhgoa.com footer and replace these with exact values if they differ.**

```
--goa-green   #0D5C3D   /* primary surface — the whole site lives on this */
--deep-palm   #063D28   /* depth, shadows, footer */
--sun-yellow  #F5CE3E   /* primary accent, wordmark, signboards */
--feni-pink   #FF2E7E   /* secondary accent — GRAPHIC USE ONLY, see contrast table */
--sand-cream  #F7F1DF   /* light surface, cards, timeline section */
--night-ink   #14100E   /* text on light/yellow, ticker bars */
```

**Type roles:** Display = heavy Tuscan/western slab serif (`Rye` or `Alfa Slab One` as free stand-ins for the HH wordmark — prefer the official wordmark SVG where you can). Editorial = serif for pull-quotes (`Instrument Serif`, `Libre Caslon`). Utility = mono for meta/labels, uppercase, wide tracking (`JetBrains Mono`, `Space Mono`). Devanagari = the official `goa_hindi.svg` for गोवा; if you must set Devanagari as live text, load `Noto Sans Devanagari` explicitly (canvas font fallback is unreliable).

**Motif library** — rebuild these as your own SVG/canvas primitives, **do not hotlink hhgoa.com assets**: checkerboard trim strips, Portuguese azulejo tile borders, palm silhouettes, sunburst rays, terracotta-roof Goan houses, hand-painted wooden direction signboards, scooter, beach umbrella, pinned sticky notes.

### Contrast table — read this before choosing any text colour
Approximate WCAG ratios for the tokens above:

| Combination | Ratio | Verdict |
|---|---|---|
| Sun yellow on Goa green | ~5.2:1 | ✅ AA body text |
| Sand cream on Goa green | ~6.8:1 | ✅ AA body text |
| Night ink on sun yellow | ~12.3:1 | ✅ AAA |
| Feni pink on Goa green | **~2.3:1** | ❌ fails everything |
| Feni pink on sand cream | ~3.0:1 | ⚠️ large display type only (≥24px, or ≥19px bold) |

**Rule:** feni pink is a shape colour — fills, rules, checkerboards, badges, borders. It is never body copy on green. This one constraint will keep your accessibility score honest without dulling the brand.

### Architecture decisions (locked — don't let the agent relitigate these)
1. **Client-side rendering is the default.** All composition happens in the browser on Canvas 2D. Nothing uploads unless the user explicitly taps Share. This is what makes it feel instant and what makes the privacy story clean.
2. **Raw Canvas 2D, not `html2canvas` / `html-to-image`.** DOM rasterisation is slow, breaks on webfonts and CORS, and is worst on iOS Safari — exactly the device most of your users are on.
3. **One pure render function per format:** `renderCard(ctx, state, scale)`. Preview calls it at `scale ≈ 0.5`, export calls it at `scale = 2`. Same code path, no drift between what they see and what they download.
4. **Two share paths, chosen at runtime.** Mobile: Web Share Level 2 with the actual PNG attached. Desktop: upload → short link → X intent, where the link's OG image is the graphic. Detail in Prompt 7.
5. **Stack:** Next.js 15 App Router (14 is fine), TypeScript, Tailwind, Vercel Blob for share images, Upstash Redis for rate limiting, `heic2any` (dynamic import only), `react-easy-crop` for the pan/zoom stage.

---

# Prompt 1 — Project Architecture & UI Planning

**Objective**
Scaffold the FrameInGoa repository and lock down the design system, state model and render architecture *before* any feature code exists, so prompts 2–9 slot in without refactoring.

**Features**
- Next.js App Router project in TypeScript, strict mode, ESLint + Prettier.
- Design tokens from Section 0 encoded once in Tailwind config + CSS custom properties.
- A single finite state machine driving the whole app: `idle → uploading → decoding → adjusting → customising → rendering → ready → sharing`. Every UI surface reads from this; no ad-hoc booleans.
- Route map: `/` (landing + generator, one page), `/s/[id]` (share page), `/api/share` (POST), `/api/og/[id]` (optional), `/privacy`.
- Font loading strategy: `next/font/local` for display faces, plus a `waitForFonts()` promise the canvas renderer awaits before its first `fillText`.

**UI requirements**
Produce a written design plan (not code) covering: colour tokens, the three type roles with a concrete scale (display 56/40/28, body 17/15, mono 12/11 uppercase +0.08em tracking), an 8px spacing scale, radii, and the **signature device** — pick one and commit: the Goan roadside wooden signboard, or the perforated ferry-ticket stub with a rubber-stamp date. That device carries the whole identity; everything else stays quiet.

**UX requirements**
The entire flow lives on one page with no navigation and no gate. Progressive disclosure: the user only ever sees the current step plus their result. Every state change is reversible — Change photo, Re-crop, Start over — with no data loss.

**Technical requirements**
Folder structure: `app/`, `components/`, `lib/canvas/` (pure render functions, zero React imports), `lib/image/` (decode, HEIC, EXIF, downscale), `lib/share/`, `lib/brand/` (tokens + motif path data), `types/`. The `lib/canvas` modules must be unit-testable in Node with `node-canvas` — that's the point of keeping them pure.

**Edge cases**
Define upfront how the app behaves with: JS disabled (static branded fallback explaining the tool needs JS), a hard reload mid-flow (state is ephemeral, show the upload screen cleanly, never a broken half-state), and an unsupported browser (feature-detect `createImageBitmap` and `canvas.toBlob`, show a friendly message).

**Performance considerations**
Set budgets now and enforce them in Prompt 9: first-load JS ≤ 130 KB gzipped for `/`, LCP < 1.8s on 4G, upload-to-preview p75 < 1.5s on a mid-range Android. Every heavy dependency (`heic2any`, crop library) is a dynamic import.

**Mobile responsiveness**
Design mobile-first at a 360px baseline. Define breakpoints (`sm 640 / md 768 / lg 1024`) and the rule that the canvas preview is always the largest element on screen with controls below it, never beside it, under 768px.

**Accessibility**
Establish the baseline contract now: visible focus rings on the yellow/cream tokens, `prefers-reduced-motion` respected globally, all touch targets ≥44×44px, one `<h1>` per page, and a documented policy that the canvas gets `role="img"` with a live-updating `aria-label`.

**Expected deliverables**
Running repo on `localhost:3000`; `tailwind.config.ts` + `globals.css` with all tokens; `lib/state/machine.ts` with the state machine typed and tested; `DESIGN.md` containing the written design plan and the contrast table; a placeholder page rendering the brand green with the wordmark, correct fonts loaded.

---

# Prompt 2 — Landing Page & Branding

**Objective**
Build a landing surface that is unmistakably Hacker House Goa 2026 within two seconds of load, and that drops the user into the upload step without a single extra click.

**Features**
- Hero: HH GOA wordmark lockup with गोवा, the meta line `GOA, INDIA · 28–31 OCT 2026 · 2:47 PM STUDIO` in mono caps, and a one-line value prop in the event's voice.
- A format chooser: two large tappable cards — **PFP Frame** and **Builder ID Card** — each showing a live sample output, not an icon.
- Primary CTA that opens the file picker directly. No "Get started" → scroll → "Upload" chain.
- A thin stats ticker using real numbers (6800+ registrations · 390+ hackers · 100 projects · $50K+ bounties) styled as painted signboards.
- Footer: credit line ("Built for the HH Goa 2026 shortlisting task by <team>"), link to hhgoa.com, privacy link, `#FrameInGoa` badge.

**UI requirements**
Full-bleed Goa green. Illustrated horizon band — sun, palms, terracotta rooftops — as inline SVG built from your own paths. Checkerboard trim separating major bands. Sand-cream panels for anything text-dense. Display face used exactly twice on the page (wordmark + one section head); everywhere else is mono and body. Restraint is what stops this reading as a template.

**UX requirements**
Copy is instructional, not salesy: "Upload a photo. Get your HH Goa badge. Post it." The two format cards state what each is *for* — one for your X profile picture, one for your timeline. Sample outputs must be real renders of the actual generators, so expectations match reality.

**Technical requirements**
Server component for the static shell, one small client island for the file input and format state. Inline critical SVG; lazy-load anything below the fold. Preload the display font; `font-display: swap` on the rest. No layout shift — reserve the hero illustration's aspect ratio.

**Edge cases**
Very small viewports (320px) must not clip the wordmark — build an SVG lockup that scales, not a fixed-width PNG. Slow connections: the page must be readable and the CTA tappable before illustrations finish. Users landing from the X in-app browser (a large share of your traffic) — verify the layout there specifically.

**Performance considerations**
LCP element should be the wordmark SVG or a text node, never a large raster. Total illustration payload ≤ 80 KB. Defer Framer Motion; if the only animation is a scroll reveal, use CSS + `IntersectionObserver` and skip the library entirely.

**Mobile responsiveness**
Single column below 768px. Format cards stack full-width with a minimum 56px tap height. Sticky bottom CTA bar once the hero scrolls out. Safe-area insets respected for notched devices.

**Accessibility**
Decorative illustrations get `aria-hidden="true"`. Format cards are real `<button>`s with descriptive labels. Skip-to-content link. Reduced motion disables the sun/wave ambient loop. Verify every text colour against the Section 0 table — no pink body copy.

**Expected deliverables**
Deployed preview URL; hero + format chooser + ticker + footer complete; Lighthouse mobile Performance ≥ 90 and Accessibility 100 on the landing route alone; two real sample images committed to `/public/samples/`.

---

# Prompt 3 — Image Upload System (JPG, PNG, HEIC)

**Objective**
Accept any photo a phone can produce and turn it into a correctly-oriented, correctly-sized bitmap in under a second, with the crop stage doing the work the user would otherwise have to do themselves.

**Features**
- Drag-and-drop zone (desktop) + tap-to-choose + camera capture (`capture="user"` on mobile) + paste-from-clipboard.
- Format support: JPG, PNG, WebP, HEIC/HEIF. Detect by **magic bytes**, not extension or MIME — HEIC files routinely arrive with an empty MIME type.
- HEIC → JPEG conversion via `heic2any`, dynamically imported *only* when HEIC is detected (the wasm bundle is ~1.5 MB; never ship it to the 90% who don't need it).
- EXIF orientation correction via `createImageBitmap(blob, { imageOrientation: 'from-image' })`, with a manual EXIF-tag fallback for older Safari.
- Interactive pan/zoom crop stage (`react-easy-crop`) with a smart default: centre-weighted, biased toward the upper third where faces sit in portraits.

**UI requirements**
Dropzone in sand cream on green, dashed pink border, with a clear hint line: "JPG, PNG or HEIC · up to 25 MB". Crop stage shows the *actual output shape* as the mask — circle for PFP, card rectangle for the ID — with the discarded area dimmed, never hidden. Zoom slider plus pinch. A visible "Use original framing" reset.

**UX requirements**
No modal chain. Upload replaces the dropzone in place. If the crop looks good by default — which it should for most photos — the user just taps Continue. Show the filename and a Change photo affordance at all times. Errors are specific and actionable: "That file is 41 MB. Try a smaller photo or one straight from your camera roll," not "Upload failed."

**Technical requirements**
Pipeline: `File → magic-byte sniff → (HEIC? convert) → createImageBitmap → downscale long edge to ≤2048px → store ImageBitmap in state`. Downscale *before* any canvas composition — iOS Safari has a hard total-canvas-area ceiling and a 48MP photo will silently produce a blank canvas. Always `URL.revokeObjectURL()` after decode.

**Edge cases**
Animated GIF (take frame 1). Transparent PNG (composite onto brand green, never black). CMYK JPEG (decode fails — catch and message clearly). Corrupt/truncated file. Images under 400px on the short edge (allow, but warn that output will be soft). 1:20 panoramas. 25 MB+ files (reject before decode). Multi-file drop (take the first, say so). Non-image file dropped. Permission denied on the camera picker. Rapid re-upload while a decode is in flight — cancel the previous one.

**Performance considerations**
Decode via `createImageBitmap` (off main thread). Target: JPEG/PNG ready in <400ms, HEIC in <2s including the wasm fetch — show a determinate "Converting HEIC…" state for that path, because it's the one case where the user will notice a wait.

**Mobile responsiveness**
Crop stage fills the viewport width with controls in a fixed bottom bar. Pinch-zoom must not fight page zoom (`touch-action: none` on the crop surface). Test one-handed reachability on a 6.7" screen.

**Accessibility**
The dropzone is keyboard-operable and announces its state. Crop stage supports arrow keys to pan and `+`/`-` to zoom, with on-screen instructions for keyboard users. `aria-live="polite"` for decode progress and errors. File input is never hidden from screen readers behind a styled label alone.

**Expected deliverables**
Working upload → crop → confirmed bitmap flow for all four formats; a `lib/image/` module with unit tests for magic-byte detection and downscale maths; a test fixture folder containing a HEIC from an iPhone, a rotated EXIF JPEG, a transparent PNG, a panorama and a corrupt file.

---

# Prompt 4 — Builder ID Card Generator

**Objective**
Generate an event badge that looks like it came from the HH Goa design team, populated from the user's photo and three quick fields, rendering live as they type.

**Features**
- Fields: **Name** (required, ≤22 chars), **Stack / Role** (required, ≤28 chars, with a datalist of common answers — MERN, Rust, Design, iOS, Product, ML), **Builder Title** (auto-generated, re-rollable, editable).
- Deterministic title generator: hash `name + stack` to seed the pick, so the same input always gives the same title — but expose a **Re-roll** button that adds a nonce. Word bank in the event's voice: *Terminal Dweller, Signal Over Noise, Susegad Shipper, Genesis Day Gremlin, Ship-or-Ship, Beach Deployer, Latency Hater, 2:47 AM Committer*.
- Auto-assigned badge number in `#247-XXXX` format (nods to 2:47 pm Studio / 247 builders), derived from the input hash.
- 2–3 card variants the user can toggle: e.g. **Signboard**, **Ticket Stub**, **Notice Board**.

**UI requirements**
Card canvas at **1200×1500 (4:5)** — the tallest ratio X displays uncropped in-timeline. Layout: photo in a rounded-rect window with a pink checkerboard border; name in display face, auto-fitted; stack in mono caps; builder title on a yellow painted-signboard shape; footer rule with `HH GOA 2026 · 28–31 OCT · GOA, INDIA` and the badge number in mono. Azulejo tile strip along one edge. The signature device from Prompt 1 does the heavy lifting — resist adding a second one.

**UX requirements**
Live preview updates on every keystroke, debounced 80ms. Fields sit directly under the preview on mobile so the user sees the effect without scrolling. Placeholder values pre-fill the card so it never looks empty. Variant toggle is a visible segmented control, not a hidden swipe.

**Technical requirements**
`renderCard(ctx, state, scale)` in `lib/canvas/card.ts`, pure and side-effect free. Text auto-fit by binary-searching font size between a min and max until `measureText` fits the box, then hard-ellipsis. Await `waitForFonts()` before the first draw or your export will silently use Times New Roman. Set the canvas font stack to include `Noto Sans Devanagari` and a colour-emoji face.

**Edge cases**
Names in Devanagari, Tamil, emoji, or with combining marks. All-caps 22-character names (auto-fit must not go illegibly small — clamp and ellipsis). Single-character names. Empty optional fields. Whitespace-only input. Pasted text with newlines (strip). Extremely wide photos in a portrait window (cover-fit, centre on the crop point chosen in Prompt 3). Profanity — decide your policy and apply a light word filter, since these get posted publicly under the event's hashtag.

**Performance considerations**
Preview renders at `scale 0.5` (600×750) — well under 60ms. Never re-render on unrelated state changes; memoise on the render-relevant slice only. Cache the composed background layer (motifs don't change between keystrokes) and redraw only the text layer.

**Mobile responsiveness**
Preview occupies ~55vh, fields scroll beneath. Sticky "Download" and "Share" bar pinned to the bottom. Inputs use correct `inputmode` and `autocapitalize="words"` for the name. Keyboard opening must not push the preview off-screen — use `dvh` units.

**Accessibility**
Canvas gets `role="img"` with an `aria-label` that reconstructs the card in words: "Builder ID card. Name Aditya. Stack MERN. Title Signal Over Noise. Badge 247-0412." Labelled inputs with `aria-describedby` for character limits. Character counters announce at 80% and 100%. Re-roll button announces the new title via a live region.

**Expected deliverables**
Fully working card generator with all variants; `lib/canvas/card.ts` with Node-side unit tests rendering fixtures to PNG for visual diffing; the title word bank in a reviewable JSON file; five sample cards across different name lengths and scripts committed to the repo.

---

# Prompt 5 — Profile Frame Generator

**Objective**
Produce a PFP overlay that reads unmistakably as HH Goa **after X masks it into a circle** — the failure mode that sinks most frame tools.

**Features**
- 3–4 frame variants: **Sunburst Halo** (yellow rays radiating from a pink ring), **Checkerboard Ring**, **Azulejo Tile Ring**, **Signboard Arc** (bottom ribbon reading `HH GOA '26`).
- Live zoom/pan of the photo inside the frame.
- Frame thickness control (subtle / bold) — two presets, not a slider, so nobody generates something broken.
- Optional bottom arc text: `28–31 OCT` toggle.

**UI requirements**
Export square at **1024×1024**, but design against a **circular safe zone**: everything meaningful lives inside the inscribed circle, with the outer square corners treated as bleed only. Show the circular mask preview by default, with a "see full square" toggle. Ring occupies ~9–11% of the diameter — thinner reads as a rendering artefact, thicker eats the face.

**UX requirements**
Default zoom should already fit a typical portrait well. Variant switching is instant and preserves zoom/pan — never reset the user's framing when they browse frames. Show a small "This is how it'll look on X" circular preview at actual PFP size (48px), because a frame that's illegible at 48px has failed.

**Technical requirements**
`renderFrame(ctx, state, scale)` in `lib/canvas/frame.ts`. Draw order: photo (cover-fit, respecting crop offset) → optional inner vignette for edge separation → ring → arc text on a path. Arc text via `ctx.rotate` per glyph with correct kerning compensation. Export as PNG with the square corners filled brand green (transparent corners render inconsistently across clients).

**Edge cases**
Photos where the face sits near an edge (the ring will crop it — warn and offer auto-recentre). Very dark or very bright photos where the ring loses contrast (add a 2px ink separator line between photo and ring). Group photos. Non-face subjects (logos, pets) — must still look right. Already-framed profile pictures from other events (double ring; nothing to do but make the default zoom generous). Square vs portrait vs landscape source, all cover-fitted.

**Performance considerations**
The ring geometry is static per variant — pre-render each ring once to an `OffscreenCanvas` at export scale and blit it, rather than re-drawing hundreds of ray paths every frame. Target <16ms per preview frame so pan/zoom stays at 60fps.

**Mobile responsiveness**
Circular preview centred, ~70vw. Variant thumbnails in a horizontally scrollable row with snap points and visible overflow affordance. Pinch to zoom the photo inside the frame with `touch-action: none`.

**Accessibility**
`role="img"` with `aria-label` naming the chosen frame variant. Variant selector as a proper radio group with roving tabindex and arrow-key navigation. Selected state indicated by more than colour alone (add a check mark or border weight change). Frame contrast against a mid-grey placeholder must remain visible for low-vision users.

**Expected deliverables**
All frame variants working with live pan/zoom; `lib/canvas/frame.ts` unit-tested; a contact sheet PNG showing every variant at both 1024px and 48px circular, committed to the repo as visual proof the small-size test passes.

---

# Prompt 6 — Image Export (HD PNG) & Download

**Objective**
Turn the on-screen preview into a real, high-resolution file on the user's device, reliably, on every browser they'll actually use — including iOS Safari and the X in-app webview.

**Features**
- Export at `scale = 2`: PFP → 1024×1024 (offer 1500×1500 as "extra sharp"), Card → 1200×1500.
- PNG primary; offer JPEG at q0.92 as a smaller alternative for the card.
- Filename convention: `frameingoa-{format}-{slugified-name-or-'builder'}.png`.
- A second, simultaneously-generated **1200×630 OG composite** (the graphic centred on a branded green field) — produced in the same pass, needed by Prompt 7.
- Subtle bottom-edge credit: `frameingoa.app · #FrameInGoa` in mono, small enough not to be defacement, present enough to drive traffic.

**UI requirements**
A single primary Download button in sun yellow with night-ink text. Transient states: idle → "Rendering…" (with a spinner only if it exceeds 300ms) → "Saved" checkmark for 2s. Never a full-screen loader — the task explicitly asks for "a few seconds, not a loading screen."

**UX requirements**
The download must never navigate away or open a blank tab. On iOS, where downloads land in Files and users get confused, show a one-line hint: "Saved to your Files app" — and surface the Share button as the easier path. Keep the result on screen after download so the user can tweak and re-export.

**Technical requirements**
Render into a detached `OffscreenCanvas` at export scale (fall back to a hidden `<canvas>` where unsupported), call the same pure render function, then `canvas.toBlob()` — **not** `toDataURL()`, which allocates a base64 string 33% larger than the image and will OOM a low-end phone. Trigger download via an `<a download>` with an object URL, revoked on the next tick. Run export in a Web Worker where `OffscreenCanvas` + worker transfer is supported; fall back to main thread with a `requestIdleCallback` yield so the UI doesn't lock.

**Edge cases**
`toBlob` returning null (out of memory) — catch and retry at 1× scale with a quality notice. iOS Safari total-canvas-area ceiling — your 1500×1500 max keeps you safe; don't let anyone raise it later. In-app webviews (X, Instagram) that block downloads — feature-detect and promote Share instead. Private browsing mode. Double-tapping Download (debounce and disable during render). Fonts not yet loaded on a fast first interaction — the export must `await waitForFonts()` even if the preview already drew.

**Performance considerations**
Full export under 800ms on a mid-range Android. Reuse the cached background layer from Prompts 4/5 at export scale rather than re-composing motifs. Generate the OG composite by downscaling the already-rendered export canvas, not by rendering a third time.

**Mobile responsiveness**
Download and Share sit in a fixed bottom bar, side by side, each ≥48px tall, with safe-area padding. Both remain reachable without scrolling at any point after the result exists.

**Accessibility**
Button label changes with state and is announced via `aria-live`. Never communicate success by colour alone — include the word "Saved". Focus stays on the button after download; it does not jump. Provide the export dimensions in the button's `aria-describedby` so users know what they're getting.

**Expected deliverables**
Working HD download for both formats on iOS Safari, Android Chrome, desktop Chrome/Safari/Firefox; a documented export-timing table per device from real testing; the OG composite generated and inspectable in the UI.

---

# Prompt 7 — Share to X with Pre-filled Caption

**Objective**
Get the generated graphic into a tweet carrying `#FrameInGoa` with the fewest possible taps — and make the link preview show the real graphic, never a blank thumbnail. This is the requirement the task warns about most explicitly, so it gets the most engineering.

**Features**
- **Path A (mobile, preferred):** `navigator.canShare({ files })` → `navigator.share({ files: [png], text: caption })`. Native sheet, user picks X, image arrives attached.
- **Path B (desktop):** POST the export + OG composite to `/api/share` → receive `/s/{id}` → open `https://x.com/intent/post?text={caption}&url={shareUrl}` in a new tab, and auto-download the PNG so the user can attach it directly if they prefer.
- **Path C (fallback):** Copy caption + Download, with a two-step instruction.
- `/s/{id}` share page: the graphic large, the event branding, a "Make yours" CTA, and complete OG/Twitter card meta.
- Caption template, editable but hashtag-locked in the UI: *"Locked in for Hacker House Goa 2026. 28–31 Oct, Goa. Built my badge in 20 seconds → frameingoa.app #FrameInGoa @247pmstudio"*

**UI requirements**
One primary "Share to X" button. Below it, a caption preview box showing exactly what will be posted, with `#FrameInGoa` rendered as a non-deletable pink chip rather than plain text. A visible warning if the user edits the caption and the hashtag goes missing: "Your submission is invalid without #FrameInGoa" — this mirrors the task's own warning and will read well to judges.

**UX requirements**
Never make the user guess whether it worked. After Path A fires, show "Opened your share sheet — pick X." After Path B, show the two-step card with the image already downloaded. Always offer "Copy caption" as an escape hatch, because iOS Safari intermittently drops `text` when `files` are present in `navigator.share` — copy the caption to the clipboard preemptively on mobile and say so in a toast.

**Technical requirements**
`/api/share`: validate content-type and size (≤6 MB), strip all EXIF, store both images in Vercel Blob with `addRandomSuffix`, return the short id. Rate limit by IP with `@upstash/ratelimit` (e.g. 10/hour) and return a friendly 429. `/s/[id]` uses the Next.js Metadata API: `twitter:card=summary_large_image`, `twitter:image` = the 1200×630 OG composite, `og:image` with explicit `width`/`height`, `og:title`, `og:description`. Every share id produces a unique immutable image URL so X's aggressive card cache can never serve a stale thumbnail.

**Edge cases**
`navigator.share` present but rejects files (Android Chrome older versions) — catch and fall through to Path B. User cancels the share sheet (an `AbortError`, not a failure — don't show an error). Upload fails or times out — fall back to download + copy caption, and say why. X in-app browser opening `/s/{id}` — the page must be self-contained and fast. Blob storage quota exceeded. Someone hitting `/api/share` directly with junk. Expired or missing share id → a branded 404 with a CTA, not a stack trace.

**Performance considerations**
Upload only the two composited images, never the source photo. Both should total <1.5 MB; compress the OG composite as JPEG q0.85. Kick off the upload optimistically the moment the result renders on desktop, so the Share tap feels instant. `/s/{id}` should be statically rendered with ISR and the image served from the blob CDN.

**Mobile responsiveness**
Share button is the visual primary on mobile (download is secondary — most phone users want to post, not save). Caption box is fully readable without horizontal scroll. Toasts appear above the fixed bottom bar, not behind it.

**Accessibility**
Share button state announced via `aria-live`. Caption editor is a labelled `<textarea>` with the hashtag requirement in `aria-describedby`. Copy-to-clipboard confirms in text. `/s/{id}` has a real `<h1>`, and the graphic has descriptive alt text reconstructing the badge contents.

**Expected deliverables**
Both share paths working on real devices; a share URL you can paste into X that renders a large-image card showing the actual graphic (screenshot it as proof); `/api/share` rate-limited and validated; a documented decision tree of which path fires on which browser.

---

# Prompt 8 — UX Polish, Responsiveness, Accessibility & Performance

**Objective**
Close the gap between "it works" and "this feels like a product." This is the prompt that separates a shortlisted submission from a rejected one.

**Features**
- Empty, loading, error and success states designed for every surface — no default browser dialogs anywhere.
- Undo / Start over with confirmation only when work would be lost.
- Micro-interactions: button press feedback, a satisfying transition from crop → result, haptic feedback on mobile via `navigator.vibrate` on successful export.
- Recently-used inputs persisted in `sessionStorage` so a reload doesn't cost the user their name and stack.
- A "Make the other one too" prompt after the first result — one tap to generate the second format from the same photo.

**UI requirements**
Audit every screen against the Section 0 contrast table and fix every violation. Consistent 8px spacing rhythm. Consistent radii. One loading pattern reused everywhere. Kill any decoration that doesn't serve the badge — apply Chanel's rule and remove one accessory per screen.

**UX requirements**
Rewrite all copy in the event's register: plain verbs, sentence case, no filler, no apologising. Errors explain what happened and what to do. Every button keeps the same verb through its whole lifecycle — "Download" produces "Downloaded", not "Saved". Count the taps from landing to a shared post; if it's more than five on mobile, cut one.

**Technical requirements**
Add error boundaries around the canvas and share subsystems so a single failure degrades one panel rather than white-screening the app. Centralise toasts. Add `prefers-reduced-motion` guards on every animation. Feature-detect rather than user-agent sniff, everywhere.

**Edge cases**
Rotating the device mid-crop. Backgrounding the tab during export (iOS throttles timers — verify the render completes or resumes). Very slow networks during the share upload. Users with 200% browser zoom. Users with a system font-size override. Dark mode system preference (the app is intentionally single-theme — make sure nothing inverts or breaks). Long-press on the canvas triggering the iOS image menu — decide whether to allow it (it's actually a useful save path, so allow it).

**Performance considerations**
Run a real Lighthouse mobile audit and hit ≥90 Performance, 100 Accessibility, ≥95 Best Practices, ≥95 SEO. Analyse the bundle and remove anything unjustified. Confirm `heic2any` and the crop library are genuinely code-split by inspecting the network tab. Measure INP on the crop interaction — it must stay under 200ms.

**Mobile responsiveness**
Test at 320, 360, 390, 430 and 768px widths plus landscape. Verify `dvh` behaviour when the keyboard opens. Confirm nothing important hides behind the home indicator. Test on a genuinely low-end Android, not just a simulator throttle.

**Accessibility**
Full keyboard pass: complete the entire flow — upload, crop, fill, export, share — without a mouse. Full screen-reader pass with VoiceOver on iOS and NVDA on desktop. Verify focus order, focus trapping in any modal, and that focus moves sensibly after each state transition. Fix all axe DevTools violations. Confirm the canvas `aria-label` genuinely conveys the output.

**Expected deliverables**
Lighthouse report screenshots hitting the targets; axe DevTools clean run; a written keyboard-and-screen-reader test log; a before/after copy diff; the tap-count from landing to shared post documented.

---

# Prompt 9 — Production Optimisation, SEO, Open Graph, Vercel Deploy & Testing

**Objective**
Ship it, make it findable and shareable, prove it works on real devices, and assemble everything the HH Goa form asks for.

**Features**
- Production deploy on Vercel with a custom domain and HTTPS.
- Full metadata: title, description, canonical, `og:*`, `twitter:*`, favicon set, `apple-touch-icon`, web manifest, `robots.txt`, `sitemap.xml`.
- Site-wide OG image (1200×630) that *is* a sample badge on brand green — your marketing asset and your proof of quality in one.
- Privacy-friendly analytics (Vercel Analytics or Plausible) tracking the funnel: landing → upload → result → download → share.
- Error monitoring (Sentry free tier) with source maps.
- A Vercel Cron job purging share blobs older than 30 days, plus a `/privacy` page stating plainly: photos are processed in your browser; only the finished graphic is uploaded, and only when you tap Share; it's deleted after 30 days.

**UI requirements**
Final visual QA against the real hhgoa.com in a side-by-side: does your green match, does your yellow match, does the type feel like theirs? Adjust tokens to the official Brand Kit if you haven't already. Add a small "Not affiliated — built for the shortlisting task" line in the footer for honesty.

**UX requirements**
The production URL must load into a working upload state in under two seconds on 4G. Test the full journey as a stranger would, on a phone, from an X link — that's how your judges will experience it.

**Technical requirements**
Set caching headers: static assets immutable, `/s/{id}` ISR, `/api/share` no-store. Add security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`) via `next.config`. Confirm environment variables are set in Vercel, not committed. Enable Vercel's image optimisation for the share page. Set up a preview-deploy workflow so you can share work-in-progress with teammates.

**Edge cases**
Verify the OG card in X's post composer by actually pasting a share link (screenshot it). Test the site in the X and LinkedIn in-app browsers. Confirm behaviour when blob storage is unreachable. Test with an ad blocker enabled (analytics must fail silently). Confirm the app works with third-party cookies fully blocked. Load-test `/api/share` lightly — a viral hour is a real possibility with 6800+ registrants.

**Performance considerations**
Final Lighthouse on the *production* URL, mobile profile, not localhost. Verify Core Web Vitals in Vercel Analytics after a day of real traffic. Confirm the blob CDN serves share images with correct cache headers.

**Mobile responsiveness**
Device matrix, all tested for real: iPhone SE (small), iPhone 15 Pro Max, a mid-range Android (Redmi/Realme — your actual audience), iPad, desktop Chrome/Safari/Firefox, and both the X and Instagram in-app browsers. Log pass/fail per device.

**Accessibility**
Final axe scan on production. Confirm reduced-motion still holds after the build optimiser runs. Verify colour contrast survives any last-minute token changes.

**Expected deliverables**
Live production URL; the X post published with the generated graphic and `#FrameInGoa`; the Google Form submitted (`https://forms.gle/jM5hTaGvsrfEfixPA`); a `README.md` covering the stack, architecture decisions, and how to run it; the device test matrix; and the completed checklist below.

---

## Appendix A — Requirement traceability

| HH Goa requirement | Covered in |
|---|---|
| Upload JPG / PNG / HEIC | Prompt 3 |
| Format A: PFP frame | Prompt 5 |
| Format B: Builder ID card | Prompt 4 |
| Near-instant generation | Prompts 4, 5, 6 |
| Handles portrait / landscape / off-centre | Prompts 3, 5 |
| No login wall, one-pass flow | Prompts 1, 2 |
| Downloadable real image file | Prompt 6 |
| Share to X with pre-filled caption | Prompt 7 |
| `#FrameInGoa` in the post | Prompt 7 |
| OG preview shows the actual graphic | Prompts 6, 7, 9 |
| Unmistakably this event | Section 0, Prompts 2, 4, 5 |
| Mobile-friendly | Every prompt |
| Live working link | Prompt 9 |

## Appendix B — Pre-submission checklist

- [ ] Live URL loads in under 2s on 4G, mobile
- [ ] Upload → download works on iOS Safari **and** Android Chrome
- [ ] HEIC from a real iPhone tested end-to-end
- [ ] Both formats generate at full HD
- [ ] Share link pasted into X shows a **large-image card with the actual graphic** (screenshot saved)
- [ ] Caption contains `#FrameInGoa` — verified in the live post, not just the code
- [ ] X post published and the URL copied
- [ ] Lighthouse mobile: Perf ≥90, A11y 100
- [ ] No login, no signup, no gate anywhere in the flow
- [ ] Google Form submitted — **one submission per team only**
- [ ] Submitted before 11:59 pm, 13 Aug 2026

---

**Two things worth flagging before you start.** First, the OG-preview requirement in Prompt 7 is the one most teams will get wrong — build and verify it early rather than on the last day, because X's card cache is unforgiving and debugging it under deadline is miserable. Second, open the Brand Kit link in the hhgoa.com footer before Prompt 2 and replace the sampled hex values in Section 0 with the official ones; "unmistakably this event" is a stated judging criterion, and matching the green exactly costs you five minutes.
