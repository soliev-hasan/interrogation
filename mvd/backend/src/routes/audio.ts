import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { uploadAudio, getAudio } from "../controllers/audioController";

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

export default router;
