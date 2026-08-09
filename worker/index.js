/**
 * Cloudflare Worker for Hacker House Goa 2026 Image Generation using Cloudflare Workers AI
 * Endpoint: https://frame-in-goa.yasar-khan-cg.workers.dev/
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    };

    // Handle CORS preflight options request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let prompt = "A futuristic Goan beach background with neon palm trees, dark green #0D5C3D and sun yellow #F5CE3E accents, 8k wallpaper";
      let model = "@cf/bytedance/stable-diffusion-xl-lightning";

      if (request.method === "POST") {
        try {
          const body = await request.json();
          if (body.prompt) prompt = body.prompt;
          if (body.model) model = body.model;
        } catch (e) {
          // If body parsing fails, fallback to default prompt
        }
      } else {
        const url = new URL(request.url);
        if (url.searchParams.has("prompt")) {
          prompt = url.searchParams.get("prompt");
        }
      }

      // Check if Cloudflare Workers AI binding (env.AI) is present
      if (!env || !env.AI) {
        return new Response(
          JSON.stringify({
            status: "error",
            message: "Cloudflare AI binding (env.AI) missing. Add [ai] binding = { binding = \"AI\" } in wrangler.toml or Worker Dashboard.",
            promptReceived: prompt,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Run Cloudflare Workers AI image generation model
      const inputs = {
        prompt: prompt,
        num_steps: 4,
      };

      const binaryImage = await env.AI.run(model, inputs);

      return new Response(binaryImage, {
        headers: {
          ...corsHeaders,
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (err) {
      console.error("Cloudflare Workers AI Error:", err);
      return new Response(
        JSON.stringify({
          error: "Cloudflare AI image generation failed",
          details: err.message || String(err),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};
