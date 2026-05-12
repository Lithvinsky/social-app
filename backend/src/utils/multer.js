import multer from "multer";
import { AppError } from "./errors.js";

const storage = multer.memoryStorage();

function imageOnlyFilter(_req, file, cb) {
  if (!String(file.mimetype || "").startsWith("image/")) {
    cb(new AppError("Only image files are allowed", 400));
    return;
  }
  cb(null, true);
}

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: imageOnlyFilter,
});
