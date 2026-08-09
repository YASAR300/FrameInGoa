/**
 * card.ts — Builder Card Canvas Renderer
 *
 * Template: goa-card.png (1024×1024)
 * Blank zone measurements from the clean generated template:
 *   • Top banner strip  : y=0 → y=115  (branding area)
 *   • Center photo box  : x=290, y=130, w=430, h=360, r=28
 *   • Text line 1 (Name): y=548
 *   • Text line 2 (Stack): y=596
 *   • Text line 3 (Title): y=644
 *   • Text line 4 (Badge): y=692
 *   • Text line 5 (Handle): y=740
 *   • QR code zone      : x=868, y=836, w=124, h=124
 *
 * Usage Note IMPORTANT: Outputs raster PNG. Re-draw in Figma for vector delivery.
 * Usage Note TIP: HTML Canvas dynamically inserts photo, name, builder number,
 *                 QR code, and social handle into the blank zones.
 */
import { CardConfig, CropArea } from "../state/machine";
import QRCode from "qrcode";

export interface CardRenderOptions {
  config: CardConfig;
  crop: CropArea;
  imgElement: HTMLImageElement | ImageBitmap | null;
  /** 1 = 1024×1024  |  2 = 2048×2048 HD export */
  scale?: number;
}

/* ── Template cache ────────────────────────────────────────────────────── */
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
export function preloadCardTemplate(): void {
  if (typeof window !== "undefined") void loadImg("/templates/goa-card.png");
}

/* ── Clip helpers ──────────────────────────────────────────────────────── */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ── Photo fill helper (cover-fit) ────────────────────────────────────── */
function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  imgEl: HTMLImageElement | ImageBitmap,
  crop: CropArea,
  destX: number, destY: number, destW: number, destH: number
) {
  const origW = "width"  in imgEl ? imgEl.width  : destW;
  const origH = "height" in imgEl ? imgEl.height : destH;
  const zoom  = Math.max(1, crop.zoom || 1);
  const cs    = Math.max(destW / origW, destH / origH) * zoom;
  const dw    = origW * cs;
  const dh    = origH * cs;
  const panX  = crop.x ? (crop.x / 100 - 0.5) * dw : 0;
  const panY  = crop.y ? (crop.y / 100 - 0.5) * dh : 0;
  ctx.drawImage(
    imgEl,
    destX + (destW - dw) / 2 - panX,
    destY + (destH - dh) / 2 - panY,
    dw, dh
  );
}

/* ══ Main renderer ═════════════════════════════════════════════════════════ */
export async function renderCard(
  ctx: CanvasRenderingContext2D,
  options: CardRenderOptions
): Promise<void> {
  const scale   = options.scale ?? 1;
  const BASE    = 1024;
  const S       = BASE * scale;

  ctx.canvas.width  = S;
  ctx.canvas.height = S;
  ctx.save();
  ctx.scale(scale, scale);

  const { config, crop, imgElement } = options;
  const tpl = await loadImg("/templates/goa-card.png");

  /* ── 1. Draw template background ─────────────────────────────────── */
  if (tpl) {
    ctx.drawImage(tpl, 0, 0, BASE, BASE);
  } else {
    ctx.fillStyle = "#063D28";
    ctx.fillRect(0, 0, BASE, BASE);
  }

  /* ── 2. Center photo zone  (x=290, y=130, w=430, h=360, r=28) ────── */
  const PX = 290, PY = 130, PW = 430, PH = 360, PR = 28;

  ctx.save();
  roundedRectPath(ctx, PX, PY, PW, PH, PR);
  ctx.clip();

  if (imgElement) {
    drawCoverPhoto(ctx, imgElement, crop, PX, PY, PW, PH);
  } else {
    ctx.fillStyle = "#d6d0ba";
    ctx.fillRect(PX, PY, PW, PH);
  }
  ctx.restore();

  /* ── 3. Branding in top banner ────────────────────────────────────── */
  // Event name drawn into the top cream strip — NOT on the template image
  ctx.save();
  ctx.fillStyle = "#063D28";
  ctx.font      = "900 26px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HACKER HOUSE GOA  '26", BASE / 2, 57);
  ctx.font      = "bold 13px monospace";
  ctx.fillStyle = "#8B7355";
  ctx.fillText("AI × CRYPTO BUILDER RESIDENCY", BASE / 2, 84);
  ctx.restore();

  /* ── 4. Dynamic text — rendered into the ruled-line zones ─────────── */
  // All text is drawn dynamically from CardConfig — nothing is hardcoded in the PNG

  // Name  (line 1, y≈548)
  ctx.save();
  const nameText = (config.name || "YOUR NAME").toUpperCase();
  let fs = 38;
  ctx.font = `900 ${fs}px Georgia, serif`;
  while (ctx.measureText(nameText).width > 560 && fs > 20) {
    fs -= 2;
    ctx.font = `900 ${fs}px Georgia, serif`;
  }
  ctx.fillStyle    = "#F7F1DF";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(nameText, BASE / 2, 548);
  ctx.restore();

  // Stack / Role  (line 2, y≈596)
  ctx.save();
  ctx.fillStyle    = "#F5CE3E";
  ctx.font         = "bold 20px monospace";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((config.stack || "BUILDER").toUpperCase(), BASE / 2, 596);
  ctx.restore();

  // Builder Title  (line 3, y≈644)
  ctx.save();
  ctx.fillStyle    = "#F7F1DF";
  ctx.font         = "italic 700 20px Georgia, serif";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  const titleText = `"${config.title || "SIGNAL OVER NOISE"}"`;
  ctx.fillText(titleText, BASE / 2, 644);
  ctx.restore();

  // Badge Number  (line 4, y≈692)
  ctx.save();
  ctx.fillStyle    = "#FF2E7E";
  ctx.font         = "bold 18px monospace";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`PASS  ${config.badgeNumber || "#247-0412"}`, BASE / 2, 692);
  ctx.restore();

  // Social Handle  (line 5, y≈740)
  ctx.save();
  ctx.fillStyle    = "#F7F1DF";
  ctx.font         = "bold 18px monospace";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((config.socialHandle || "@builder").trim(), BASE / 2, 740);
  ctx.restore();

  /* ── 5. QR Code — bottom-right blank zone (x=868, y=836, 124×124) ── */
  try {
    const qrUrl  = `https://frameingoa.app?b=${encodeURIComponent(config.name || "builder")}`;
    const qrSize = 124;
    const qrX    = 868;
    const qrY    = 836;
    const off    = document.createElement("canvas");
    await QRCode.toCanvas(off, qrUrl, {
      width: qrSize,
      margin: 1,
      color: { dark: "#063D28", light: "#F7F1DF" },
    });
    ctx.drawImage(off, qrX, qrY, qrSize, qrSize);

    ctx.save();
    ctx.fillStyle    = "#F7F1DF";
    ctx.font         = "bold 11px monospace";
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.fillText("SCAN", qrX + qrSize / 2, qrY + qrSize + 4);
    ctx.restore();
  } catch {
    // QR failed silently
  }

  ctx.restore();
}
