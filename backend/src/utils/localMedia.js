import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

/** Absolute path to `backend/uploads` (works when cwd is `backend/`). */
export function uploadsRootDir() {
  return path.join(process.cwd(), "uploads");
}

const postsDir = () => path.join(uploadsRootDir(), "posts");

function ensurePostsDir() {
  fs.mkdirSync(postsDir(), { recursive: true });
}

const MIME_EXT = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

/**
 * @param {Buffer} buffer
 * @param {string} originalname
 * @param {string} mimetype
 * @returns {Promise<{ url: string, resourceType: 'image'|'video' }>}
 */
export async function savePostMediaLocal(buffer, originalname, mimetype) {
  ensurePostsDir();
  let ext = path.extname(originalname || "").toLowerCase();
  if (!ext || ext.length > 8) {
    ext = MIME_EXT[mimetype] || ".bin";
  }
  if (!/^\.[a-z0-9]+$/i.test(ext)) {
    ext = ".bin";
  }
  const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const full = path.join(postsDir(), name);
  await fs.promises.writeFile(full, buffer);
  const url = `/uploads/posts/${name}`;
  const resourceType = mimetype.startsWith("video/") ? "video" : "image";
  return { url, resourceType };
}
