export type ImageFormat = "jpeg" | "png" | "webp" | "heic" | "unknown";

export async function detectFormatByMagicBytes(file: File): Promise<ImageFormat> {
  // Read first 32 bytes
  const slice = file.slice(0, 32);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 4) {
    return "unknown";
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  // PNG: 89 50 4E 47 (89 'P' 'N' 'G')
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }

  // WEBP: 'R' 'I' 'F' 'F' ... 'W' 'E' 'B' 'P'
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length >= 12
  ) {
    const webpHeader = Array.from(bytes.slice(8, 12)).map((b) => String.fromCharCode(b)).join("");
    if (webpHeader === "WEBP") {
      return "webp";
    }
  }

  // HEIC / HEIF: bytes 4-7 are "ftyp", followed by heic, heix, hevc, mif1, msf1
  if (bytes.length >= 12) {
    const ftyp = Array.from(bytes.slice(4, 8)).map((b) => String.fromCharCode(b)).join("");
    if (ftyp === "ftyp") {
      const brand = Array.from(bytes.slice(8, 12)).map((b) => String.fromCharCode(b)).join("").toLowerCase();
      if (
        brand.includes("heic") ||
        brand.includes("heix") ||
        brand.includes("hevc") ||
        brand.includes("mif1") ||
        brand.includes("msf1")
      ) {
        return "heic";
      }
    }
  }

  // Extension fallback if magic bytes were indeterminate
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (ext === ".heic" || ext === ".heif") return "heic";
  if (ext === ".jpg" || ext === ".jpeg") return "jpeg";
  if (ext === ".png") return "png";
  if (ext === ".webp") return "webp";

  return "unknown";
}
