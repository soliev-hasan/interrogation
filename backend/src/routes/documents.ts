import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  generateDocument,
  downloadDocument,
} from "../controllers/documentController";

const router: Router = Router();

// Wrap async middleware to handle errors properly
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /api/documents/generate/:id - Generate Word document for an interrogation (requires authentication)
router.post("/generate/:id", authenticateToken, asyncHandler(generateDocument));

// GET /api/documents/download/:filename - Download a Word document (no authentication required)
router.get("/download/:filename", asyncHandler(downloadDocument));

export default router;
