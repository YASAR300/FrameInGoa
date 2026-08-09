/**
 * frame.ts — Circular PFP Frame Canvas Renderer
 *
 * Template: goa-frame.png (1024×1024)
 * The frame is the illustrated Goa beach scene (hackhouse_goa_circle_frame PNG).
 * The transparent circular hole sits at:
 *   cx ≈ 512,  cy ≈ 478,  radius ≈ 363 px
 *
 * Rendering strategy:
 *   1. Draw user photo first, clipped to the circle  (behind the frame)
 *   2. Draw the frame PNG on top  → its solid illustration covers everything
 *      except the transparent center, which reveals the user photo below.
 *
 * Usage Note TIP (Circular Frame):
 *   Canvas: ctx.arc() + ctx.clip()
 *   CSS equivalent applied to preview wrapper: border-radius: 50%; overflow: hidden
 */
import { CropArea } from "../state/machine";

export interface FrameRenderOptions {
  crop: CropArea;
  imgElement: HTMLImageElement | ImageBitmap | null;
  /** 1 = 1024×1024  |  2 = 2048×2048 HD */
  scale?: number;
}

/* ── Image cache ──────────────────────────────────────────────────────── */
const cache = new Map<string, HTMLImageElement>();
function loadImg(src: string): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (cache.has(src)) return Promise.resolve(cache.get(src)!);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { cache.set(src, img); resolve(img); };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function preloadFrameTemplate(): void {
  if (typeof window !== "undefined") void loadImg("/templates/goa-frame.png");
}

/* ══ Main renderer ══════════════════════════════════════════════════════ */
export async function renderFrame(
  ctx: CanvasRenderingContext2D,
  options: FrameRenderOptions
): Promise<void> {
  const scale  = options.scale ?? 1;
  const BASE   = 1024;
  const S      = BASE * scale;

  ctx.canvas.width  = S;
  ctx.canvas.height = S;
  ctx.save();
  ctx.scale(scale, scale);

  const { crop, imgElement } = options;
  const frameImg = await loadImg("/templates/goa-frame.png");

  /* ── Circular photo zone (measured from the frame template) ───────── */
  const CX = 512;   // circle center X
  const CY = 478;   // circle center Y  (slightly above true center)
  const R  = 363;   // circle radius

  /* Step 1 — Draw user photo clipped to circle ──────────────────────── */
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.clip();   // ← CSS equiv: border-radius:50%; overflow:hidden

  if (imgElement) {
    const origW = "width"  in imgElement ? imgElement.width  : BASE;
    const origH = "height" in imgElement ? imgElement.height : BASE;
    const D     = R * 2;
    const zoom  = Math.max(1, crop.zoom || 1);
    const cs    = Math.max(D / origW, D / origH) * zoom;
    const dw    = origW * cs;
    const dh    = origH * cs;
    const panX  = crop.x ? (crop.x / 100 - 0.5) * dw : 0;
    const panY  = crop.y ? (crop.y / 100 - 0.5) * dh : 0;
    ctx.drawImage(
      imgElement,
      CX - R + (D - dw) / 2 - panX,
      CY - R + (D - dh) / 2 - panY,
      dw, dh
    );
  } else {
    /* Placeholder circle when no photo uploaded */
    ctx.fillStyle = "#e8e2cc";
    ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Upload Photo", CX, CY);
  }
  ctx.restore();

  /* Step 2 — Draw frame illustration on top ─────────────────────────── */
  // The PNG's transparent circle lets the photo show through.
  // Its opaque illustration areas cover everything else naturally.
  if (frameImg) {
    ctx.drawImage(frameImg, 0, 0, BASE, BASE);
  } else {
    // Fallback decorative ring if template failed to load
    ctx.beginPath();
    ctx.arc(CX, CY, R + 8, 0, Math.PI * 2);
    ctx.arc(CX, CY, R, 0, Math.PI * 2, true);
    ctx.fillStyle = "#F5CE3E";
    ctx.fill();
    ctx.strokeStyle = "#063D28";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  ctx.restore();
}
