import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  configured = true;
  return true;
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
      (err, result) => (err ? reject(err) : resolve(result))
    );
    uploadStream.end(buffer);
  });
}
