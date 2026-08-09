import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { AI_PRESETS } from "@/lib/brand/ai-presets";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userPhotoDataUrl, name, stack, title, preset } = body as {
      userPhotoDataUrl?: string;
      name?: string;
      stack?: string;
      title?: string;
      preset?: string;
    };

    const selectedPreset = AI_PRESETS[preset || "cyber_palm"];
    const promptText = `Hacker House Goa 2026 official Builder ID Card graphic background for ${name || "BUILDER"}, Stack: ${stack || "FULL-STACK AI"}, Title Badge: ${title || "SIGNAL OVER NOISE"}. Visual Theme: ${selectedPreset?.prompt || "Deep Goan green #0D5C3D background with yellow signboard badge and feni pink accents"}. 8k hyper-detailed FLUX graphic artwork.`;

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
        console.warn("Hugging Face FLUX.1-dev card generation warning:", hfErr);
      }
    }

    // 2. Secondary: Cloudflare Workers AI Endpoint Call
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL || "https://frame-in-goa.yasar-khan-cg.workers.dev/";
    const cfApiKey = process.env.CLOUDFLARE_AI_API_KEY || "gdoZUvbrRHC9G14p";
    try {
      const cfRes = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cfApiKey}`,
          "X-API-Key": cfApiKey,
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
      console.warn("Cloudflare Workers AI card generation warning:", cfErr);
    }

    // 3. Tertiary: Gemini 2.5 Flash Endpoint Fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        let mimeType = "image/jpeg";
        let base64Data = "";
        if (userPhotoDataUrl && userPhotoDataUrl.includes(",")) {
          const parts = userPhotoDataUrl.split(",");
          const match = parts[0].match(/:(.*?);/);
          if (match) mimeType = match[1];
          base64Data = parts[1];
        }

        const partsPayload: Array<Record<string, unknown>> = [];
        if (base64Data) {
          partsPayload.push({
            inlineData: { mimeType, data: base64Data },
          });
        }
        partsPayload.push({ text: promptText });

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: partsPayload }] }),
        });

        if (res.ok) {
          const data = await res.json();
          const inlinePart = data?.candidates?.[0]?.content?.parts?.find(
            (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData
          );
          if (inlinePart?.inlineData) {
            const aiGeneratedCardUrl = `data:${inlinePart.inlineData.mimeType || "image/jpeg"};base64,${inlinePart.inlineData.data}`;
            return NextResponse.json({ dataUrl: aiGeneratedCardUrl, isFallback: false, provider: "gemini" });
          }
        }
      } catch (gErr) {
        console.warn("Gemini API card error:", gErr);
      }
    }

    return NextResponse.json({ dataUrl: null, isFallback: true });
  } catch (err) {
    console.error("AI Card Route error:", err);
    return NextResponse.json({ error: "Failed to process AI card generation" }, { status: 500 });
  }
}
