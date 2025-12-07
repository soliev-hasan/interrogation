import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../utils/fileUpload";
import {
  uploadAudio,
  getAudio,
  transcribeAudio,
} from "../controllers/audioController";

const router = Router();

// Wrap async middleware to handle errors properly
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes require authentication
router.use(asyncHandler(authenticateToken));

// POST /api/audio/upload/:id - Upload audio file for an interrogation
router.post("/upload/:id", asyncHandler(uploadAudio));

// GET /api/audio/:filename - Get an audio file
router.get("/:filename", asyncHandler(getAudio));

// POST /api/audio/transcribe - Transcribe audio file
router.post(
  "/transcribe",
  upload.single("audio"),
  asyncHandler(transcribeAudio)
);

export default router;
