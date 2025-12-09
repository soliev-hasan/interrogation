import multer, { Multer } from "multer";
import path from "path";
import { Request } from "express";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to only allow audio files
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept audio files only
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"));
  }
};

// Create multer instance
export const upload: Multer = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
