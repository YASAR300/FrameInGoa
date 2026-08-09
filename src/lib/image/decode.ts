import { detectFormatByMagicBytes, ImageFormat } from "./magic-bytes";

export interface DecodedImage {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  format: ImageFormat;
  imageBitmap?: ImageBitmap;
}

export async function processAndDecodeImage(
  file: File,
  onProgress?: (msg: string) => void
): Promise<DecodedImage> {
  const maxEdge = 2048;
  const format = await detectFormatByMagicBytes(file);

  let targetBlob: Blob = file;

  // Handle HEIC dynamically
  if (format === "heic") {
    onProgress?.("Converting HEIC photo...");
    const heic2any = (await import("heic2any")).default;
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    targetBlob = Array.isArray(result) ? result[0] : result;
  }

  onProgress?.("Decoding image...");

  // Try createImageBitmap with imageOrientation: 'from-image'
  let imageBitmap: ImageBitmap | undefined;
  try {
    imageBitmap = await createImageBitmap(targetBlob, {
      imageOrientation: "from-image",
    });
  } catch {
    // Fallback if createImageBitmap fails
    imageBitmap = undefined;
  }

  let width = imageBitmap?.width ?? 0;
  let height = imageBitmap?.height ?? 0;

  // If width/height unknown, read via Image element
  if (!width || !height) {
    const dataUrl = await blobToDataUrl(targetBlob);
    const img = await loadImageElement(dataUrl);
    width = img.width;
    height = img.height;
  }

  // Downscale long edge to maxEdge if larger
  const longEdge = Math.max(width, height);
  if (longEdge > maxEdge) {
    onProgress?.("Optimising image resolution...");
    const scale = maxEdge / longEdge;
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (imageBitmap) {
        ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);
      } else {
        const dataUrl = await blobToDataUrl(targetBlob);
        const img = await loadImageElement(dataUrl);
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }

      targetBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Downscale failed"))), "image/jpeg", 0.92);
      });

      width = targetW;
      height = targetH;

      // Re-create ImageBitmap for fast canvas draws
      try {
        imageBitmap = await createImageBitmap(targetBlob);
      } catch {
        imageBitmap = undefined;
      }
    }
  }

  const dataUrl = await blobToDataUrl(targetBlob);

  return {
    blob: targetBlob,
    dataUrl,
    width,
    height,
    format,
    imageBitmap,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob"));
    reader.readAsDataURL(blob);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image element"));
    img.src = src;
  });
}
