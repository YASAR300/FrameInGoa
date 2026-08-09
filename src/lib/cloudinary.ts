import crypto from "crypto";

export const CLOUDINARY_CONFIG = {
  cloudName: "drfxktigz",
  apiKey: "733942119376438",
  apiSecret: "fKi-BqIbA189KqySTgDa5_YrriY",
};

/**
 * Uploads a base64 image data URL directly to Cloudinary using secure SHA-1 authentication.
 * Saves image permanently to Cloudinary account 'drfxktigz'.
 */
export async function uploadToCloudinary(base64DataUrl: string): Promise<{
  secure_url: string;
  public_id: string;
} | null> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "hh-goa-builders";

    // 1. Try Signed Upload with folder
    const paramsToSign1 = `folder=${folder}&timestamp=${timestamp}`;
    const signature1 = crypto
      .createHash("sha1")
      .update(`${paramsToSign1}${CLOUDINARY_CONFIG.apiSecret}`)
      .digest("hex");

    const formData1 = new FormData();
    formData1.append("file", base64DataUrl);
    formData1.append("api_key", CLOUDINARY_CONFIG.apiKey);
    formData1.append("timestamp", timestamp.toString());
    formData1.append("folder", folder);
    formData1.append("signature", signature1);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

    let res = await fetch(uploadUrl, {
      method: "POST",
      body: formData1,
    });

    if (res.ok) {
      const data = await res.json();
      console.log("✅ Cloudinary Signed Upload Success:", data.secure_url);
      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
      };
    }

    let errText = await res.text();
    console.warn("Cloudinary signed folder upload fallback, reason:", errText);

    // 2. Try Standard Signed Upload without folder
    const paramsToSign2 = `timestamp=${timestamp}`;
    const signature2 = crypto
      .createHash("sha1")
      .update(`${paramsToSign2}${CLOUDINARY_CONFIG.apiSecret}`)
      .digest("hex");

    const formData2 = new FormData();
    formData2.append("file", base64DataUrl);
    formData2.append("api_key", CLOUDINARY_CONFIG.apiKey);
    formData2.append("timestamp", timestamp.toString());
    formData2.append("signature", signature2);

    res = await fetch(uploadUrl, {
      method: "POST",
      body: formData2,
    });

    if (res.ok) {
      const data = await res.json();
      console.log("✅ Cloudinary Standard Signed Upload Success:", data.secure_url);
      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
      };
    }

    errText = await res.text();
    console.error("Cloudinary upload failed:", errText);
    return null;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  }
}
