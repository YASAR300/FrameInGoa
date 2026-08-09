import { InferenceClient } from "@huggingface/inference";

const token = "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";
const client = new InferenceClient(token);

const providers = ["fal-ai", "together", "replicate", "nebius", "nscale", "hyperbolic"];

async function run() {
  for (const provider of providers) {
    try {
      console.log(`Testing FLUX.1-dev with provider: ${provider}...`);
      const image = await client.textToImage({
        provider,
        model: "black-forest-labs/FLUX.1-dev",
        inputs: "A futuristic Goan beach background with neon palm trees, dark green and yellow gradients, 8k wallpaper",
        parameters: { num_inference_steps: 5 },
      });
      const buffer = await image.arrayBuffer();
      console.log(`SUCCESS! Provider ${provider} returned image bytes:`, buffer.byteLength);
      return;
    } catch (err) {
      console.log(`Provider ${provider} error:`, err.message || err);
    }
  }
}

run();
