import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface CachedImage {
  cloudinaryUrl?: string;
  buffer: Buffer;
  mime: string;
  createdAt: number;
}

// Global persistent cache map across Next.js reloads / serverless instances
const globalCache = globalThis as unknown as {
  _shareCache?: Map<string, CachedImage>;
};

if (!globalCache._shareCache) {
  globalCache._shareCache = new Map<string, CachedImage>();
}

const shareCache = globalCache._shareCache;

// Clean up cached images older than 48 hours
function cleanupOldCache() {
  const now = Date.now();
  const maxAge = 48 * 60 * 60 * 1000;
  shareCache.forEach((item, id) => {
    if (now - item.createdAt > maxAge) {
      shareCache.delete(id);
    }
  });
}

export async function POST(request: Request) {
  try {
    cleanupOldCache();

    let buffer: Buffer | null = null;
    let mime = "image/png";
    let base64DataUrl = "";
    let customId: string | undefined = undefined;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const imageStr = body?.image as string | undefined;
      customId = body?.id as string | undefined;

      if (!imageStr) {
        return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
      }

      if (imageStr.startsWith("data:")) {
        base64DataUrl = imageStr;
        const matches = imageStr.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          mime = matches[1];
          buffer = Buffer.from(matches[2], "base64");
        } else {
          buffer = Buffer.from(imageStr.replace(/^data:image\/\w+;base64,/, ""), "base64");
        }
      } else {
        base64DataUrl = `data:image/png;base64,${imageStr}`;
        buffer = Buffer.from(imageStr, "base64");
      }
    } else {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      customId = (formData.get("id") as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: "No image file provided" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mime = file.type || "image/png";
      base64DataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10 MB size limit" }, { status: 400 });
    }

    // ── UPLOAD DIRECTLY TO CLOUDINARY
    const cloudinaryRes = await uploadToCloudinary(base64DataUrl);
    const cloudinaryUrl = cloudinaryRes?.secure_url;

    // Generate clean 8-character unique share ID or use custom pre-generated share ID
    const id = customId || Math.random().toString(36).substring(2, 10);

    shareCache.set(id, {
      cloudinaryUrl,
      buffer,
      mime,
      createdAt: Date.now(),
    });

    return NextResponse.json(
      {
        id,
        shareUrl: `/s/${id}`,
        imageUrl: cloudinaryUrl || `/api/share?id=${id}`,
        cloudinaryUrl,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Share upload API error:", err);
    return NextResponse.json({ error: "Failed to process share upload" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || !shareCache.has(id)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const cached = shareCache.get(id)!;

  // If Cloudinary CDN URL exists, redirect directly to Cloudinary
  if (cached.cloudinaryUrl) {
    return NextResponse.redirect(cached.cloudinaryUrl, 302);
  }

  return new NextResponse(new Uint8Array(cached.buffer), {
    headers: {
      "Content-Type": cached.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
