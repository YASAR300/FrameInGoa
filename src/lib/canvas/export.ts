/**
 * export.ts — HD Export utility
 *
 * Usage Note IMPORTANT:
 * Outputs raster PNGs at 2048×2048 (frame) or 2048×2048 (card).
 * For true vector delivery, re-draw in Figma/Illustrator using these as reference comps.
 */
import { AppState } from "../state/machine";
import { renderCard } from "./card";
import { renderFrame } from "./frame";

export interface ExportResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
}

export function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function exportHighResGraphic(
  state: AppState,
  imgElement: HTMLImageElement | ImageBitmap | null
): Promise<ExportResult> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");

  if (state.format === "frame") {
    await renderFrame(ctx, { crop: state.crop, imgElement, scale: 2 }); // 2048×2048
  } else {
    await renderCard(ctx, { config: state.cardConfig, crop: state.crop, imgElement, scale: 2 });
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });

  const dataUrl = await blobToDataUrl(blob);
  const slug = slugify(state.cardConfig.name || "builder");
  const filename = `hackhouse-goa-${state.format}-${slug}.png`;

  return { blob, dataUrl, filename };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}
