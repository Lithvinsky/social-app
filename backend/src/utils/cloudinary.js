import { v2 as cloudinary } from "cloudinary";

let configured = false;

/** Call once at startup (e.g. from server.js) after dotenv is loaded. */
export function configureCloudinary() {
  const cloud_name =
    process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
  const api_secret =
    process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    configured = false;
    return;
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
  configured = true;
}

export function isCloudinaryReady() {
  return configured;
}

/**
 * @param {Buffer} buffer
 * @param {{ folder?: string, resourceType?: 'image'|'video'|'auto' }} opts
 */
export async function uploadBuffer(buffer, opts = {}) {
  if (!configured) {
    throw new Error("Cloudinary is not configured");
  }
  const folder = opts.folder || "social-app";
  const resourceType = opts.resourceType || "auto";
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    uploadStream.end(buffer);
  });
}

/**
 * @param {string} publicId
 * @param {"image"|"video"} resourceType
 */
export async function destroyCloudinaryByPublicId(
  publicId,
  resourceType = "image",
) {
  if (!configured || !publicId || typeof publicId !== "string") {
    return;
  }
  const rt = resourceType === "video" ? "video" : "image";
  return cloudinary.uploader.destroy(publicId, undefined, {
    resource_type: rt,
  });
}
