/**
 * goaBuilderShared.ts
 * ---------------------------------------------------------------------------
 * Shared constants, types, and canvas helpers for the Hacker House Goa
 * "Builder" tools (PFP Frame Generator + Builder ID Card Generator).
 *
 * Both builders composite a user photo + user text on top of a pre-made
 * PNG template (goa-frame.png / goa-card.png). This file holds everything
 * that's common to both: the color palette, coordinate constants that MUST
 * match the exported template art exactly, name/handle generation, and the
 * low-level canvas draw routines.
 *
 * ⚠️ COORDINATE CONTRACT
 * The X/Y/W/H/R values below are the single source of truth for where the
 * code expects the photo + text to land. If the final exported PNGs are
 * measured at different values in Figma/Fable, update ONLY the constants
 * in this file — nothing else needs to change.
 * ---------------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Brand palette (from design_prompts.md — keep in sync with globals.css)
// ---------------------------------------------------------------------------
export const GOA_COLORS = {
  forestGreen: "#063D28",
  cream: "#F7F1DF",
  yellowGold: "#F5CE3E",
  hotPink: "#FF2E7E",
  terracotta: "#C0492B",
  nearBlack: "#14100E",
} as const;

// ---------------------------------------------------------------------------
// Template asset paths — drop the final exported PNGs at these paths.
// ---------------------------------------------------------------------------
export const TEMPLATE_PATHS = {
  frame: "/templates/goa-frame.png", // Asset 1 — circular PFP frame
  card: "/templates/goa-card.png", // Asset 2 — builder ID card
} as const;

// ---------------------------------------------------------------------------
// ASSET 1 — Circular PFP Frame coordinate contract
// ---------------------------------------------------------------------------
export const FRAME_SPEC = {
  canvas: 1080,
  circle: {
    cx: 540,
    cy: 540,
    r: 390,
  },
  ring: {
    strokeWidth: 6,
    color: GOA_COLORS.nearBlack,
  },
} as const;

// ---------------------------------------------------------------------------
// ASSET 2 — Builder ID Card coordinate contract
// ---------------------------------------------------------------------------
export const CARD_SPEC = {
  canvas: 1080,
  photoBox: {
    x: 290,
    y: 130,
    w: 430,
    h: 360,
    borderRadius: 28,
  },
  textLines: {
    centerX: 540,
    width: 580,
    name: { y: 548, size: 34, weight: 700 },
    stack: { y: 602, size: 24, weight: 500 },
    title: { y: 656, size: 24, weight: 500 },
    badge: { y: 710, size: 24, weight: 500 },
    handle: { y: 764, size: 24, weight: 500 },
  },
  qrZone: {
    // 120x120, 12px padding from right + bottom edge of 1080 canvas
    x: 1080 - 12 - 120,
    y: 1080 - 12 - 120,
    w: 120,
    h: 120,
  },
  bannerZone: {
    // ZONE A — event name drawn centered here in code
    x: 0,
    y: 0,
    w: 1080,
    h: 120,
    centerY: 60,
  },
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ImageTransform {
  /** zoom scale, 1 = fit, >1 = zoomed in */
  scale: number;
  /** pan offset in px, relative to the crop viewport center */
  offsetX: number;
  offsetY: number;
}

export interface BuilderIdentity {
  name: string;
  handle: string;
  stack: string;
  title: string;
  badgeNumber: string;
}

// ---------------------------------------------------------------------------
// Random identity generation (editable afterwards by the user)
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Arjun", "Meera", "Kabir", "Ananya", "Rohan", "Isha", "Vikram", "Tara",
  "Aditya", "Sana", "Dev", "Priya", "Rian", "Naina", "Yash", "Zara",
];

const LAST_NAMES = [
  "Rao", "Menon", "Shah", "Kapoor", "Iyer", "Bose", "Nair", "Verma",
  "Reddy", "Khan", "Pillai", "Sharma", "Das", "Chowdhury",
];

const STACKS = [
  "Full-Stack Engineer", "ML Engineer", "Product Designer", "Backend Engineer",
  "Frontend Engineer", "DevOps Engineer", "Data Engineer", "Solo Founder",
  "Smart Contract Dev", "Growth Hacker",
];

const TITLES = [
  "Genesis Builder", "Night Owl Shipper", "Bug Whisperer", "Prototype Pirate",
  "Signal Booster", "Chaos Coordinator", "Merge Conflict Survivor",
];

export function generateRandomIdentity(): BuilderIdentity {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = `${first} ${last}`;
  const handle = `@${first.toLowerCase()}${Math.floor(Math.random() * 900 + 100)}`;
  const stack = STACKS[Math.floor(Math.random() * STACKS.length)];
  const title = TITLES[Math.floor(Math.random() * TITLES.length)];
  const badgeNumber = `HHG-${String(Math.floor(Math.random() * 900 + 100))}`;
  return { name, handle, stack, title, badgeNumber };
}

// ---------------------------------------------------------------------------
// Canvas helpers
// ---------------------------------------------------------------------------

/** Loads a File/Blob into an HTMLImageElement. */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/** Loads an image from a URL (e.g. template PNGs in /public). */
export function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draws a user photo into a circular clip on the target canvas ctx,
 * honoring pan/zoom transform, then composites the frame template on top.
 */
export function drawCircularPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number,
  transform: ImageTransform
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const { scale, offsetX, offsetY } = transform;
  // base "cover" fit inside the circle's bounding box, then apply user scale/pan
  const boxSize = r * 2;
  const imgRatio = img.width / img.height;
  let drawW: number;
  let drawH: number;
  if (imgRatio > 1) {
    drawH = boxSize * scale;
    drawW = drawH * imgRatio;
  } else {
    drawW = boxSize * scale;
    drawH = drawW / imgRatio;
  }

  const dx = cx - drawW / 2 + offsetX;
  const dy = cy - drawH / 2 + offsetY;
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
}

/** Draws a user photo into a rounded-rect clip (used by the ID card photo box). */
export function drawRoundedRectPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number; borderRadius: number },
  transform: ImageTransform
) {
  const { x, y, w, h, borderRadius } = box;
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, x, y, w, h, borderRadius);
  ctx.closePath();
  ctx.clip();

  const { scale, offsetX, offsetY } = transform;
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let drawW: number;
  let drawH: number;
  if (imgRatio > boxRatio) {
    drawH = h * scale;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * scale;
    drawH = drawW / imgRatio;
  }

  const cx = x + w / 2;
  const cy = y + h / 2;
  const dx = cx - drawW / 2 + offsetX;
  const dy = cy - drawH / 2 + offsetY;
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}

/** Downloads a canvas as a PNG file. */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

/** Clamp helper for zoom/pan bounds. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
