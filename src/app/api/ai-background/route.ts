import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { AI_PRESETS } from "@/lib/brand/ai-presets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const presetKey = body.preset as string;
    const customPrompt = body.customPrompt as string | undefined;

    const selectedPreset = AI_PRESETS[presetKey];
    const promptText =
      customPrompt ||
      selectedPreset?.prompt ||
      "A futuristic Goan beach background with neon palm trees, dark green #0D5C3D and sun yellow #F5CE3E accents, 8k wallpaper, no text.";

    // 1. Primary: Hugging Face Inference Client (FLUX.1-dev model via fal-ai)
    const hfToken = process.env.HF_TOKEN || "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";
    if (hfToken) {
      try {
        const client = new InferenceClient(hfToken);
        const result = (await client.textToImage({
          provider: "fal-ai",
          model: "black-forest-labs/FLUX.1-dev",
          inputs: promptText,
          parameters: { num_inference_steps: 5 },
        })) as unknown;

        if (result instanceof Blob) {
          const arrayBuffer = await result.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = result.type || "image/jpeg";
          return NextResponse.json({
            dataUrl: `data:${mimeType};base64,${base64}`,
            isFallback: false,
            provider: "huggingface-flux",
          });
        } else if (typeof result === "string") {
          return NextResponse.json({
            dataUrl: result.startsWith("data:") ? result : `data:image/jpeg;base64,${result}`,
            isFallback: false,
            provider: "huggingface-flux",
          });
        }
      } catch (hfErr) {
        console.warn("Hugging Face FLUX.1-dev inference warning:", hfErr);
      }
    }

    // 2. Secondary: Cloudflare Workers AI Endpoint Call
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL || "https://frame-in-goa.yasar-khan-cg.workers.dev/";
    const apiKey = process.env.CLOUDFLARE_AI_API_KEY || "gdoZUvbrRHC9G14p";
    try {
      const cfRes = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (cfRes.ok) {
        const contentType = cfRes.headers.get("content-type") || "";

        if (contentType.includes("image/")) {
          const buffer = await cfRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const mime = contentType.split(";")[0] || "image/png";
          return NextResponse.json({
            dataUrl: `data:${mime};base64,${base64}`,
            isFallback: false,
            provider: "cloudflare",
          });
        }

        if (contentType.includes("application/json")) {
          const json = await cfRes.json();
          if (json.dataUrl || json.image) {
            return NextResponse.json({
              dataUrl: json.dataUrl || `data:image/png;base64,${json.image}`,
              isFallback: false,
              provider: "cloudflare",
            });
          }
        }
      }
    } catch (cfErr) {
      console.warn("Cloudflare Workers AI fetch warning:", cfErr);
    }

    // 3. Tertiary: Gemini 2.5 Flash API Fallback
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `Generate an image concept description: ${promptText}` }],
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const inlineData = data?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData)?.inlineData;
          if (inlineData?.data) {
            return NextResponse.json({
              dataUrl: `data:image/jpeg;base64,${inlineData.data}`,
              isFallback: false,
              provider: "gemini",
            });
          }
        }
      } catch (gErr) {
        console.warn("Gemini 2.5 Flash API call warning:", gErr);
      }
    }

    // 4. Fallback High-Quality Goan SVG Gradient Background
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#063D28"/>
          <stop offset="50%" stop-color="#0D5C3D"/>
          <stop offset="100%" stop-color="#14100E"/>
        </linearGradient>
        <radialGradient id="sun" cx="80%" cy="20%" r="50%">
          <stop offset="0%" stop-color="#F5CE3E" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#FF2E7E" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="960" cy="300" r="400" fill="url(#sun)"/>
      <path d="M0 1200 Q 600 1000, 1200 1200 L 1200 1500 L 0 1500 Z" fill="#063D28" opacity="0.8"/>
    </svg>`;

    const fallbackDataUrl = `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString("base64")}`;
    return NextResponse.json({ dataUrl: fallbackDataUrl, isFallback: true, provider: "svg" });
  } catch (err) {
    console.error("AI Background API error:", err);
    return NextResponse.json({ error: "Failed to process AI background request" }, { status: 500 });
  }
}
