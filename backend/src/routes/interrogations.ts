import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllInterrogations,
  getInterrogationById,
  createInterrogation,
  updateInterrogation,
  deleteInterrogation,
  getInterrogationsByUser,
} from "../controllers/interrogationController";

const router: Router = Router();

// Wrap async middleware to handle errors properly
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes require authentication
router.use(asyncHandler(authenticateToken));

// GET /api/interrogations - Get all interrogations
router.get("/", asyncHandler(getAllInterrogations));

// GET /api/interrogations/:id - Get a specific interrogation by ID
router.get("/:id", asyncHandler(getInterrogationById));

// POST /api/interrogations - Create a new interrogation
router.post("/", asyncHandler(createInterrogation));

// PUT /api/interrogations/:id - Update an interrogation
router.put("/:id", asyncHandler(updateInterrogation));

// DELETE /api/interrogations/:id - Delete an interrogation
router.delete("/:id", asyncHandler(deleteInterrogation));

// GET /api/interrogations/user/:userId - Get interrogations by user
router.get("/user/:userId", asyncHandler(getInterrogationsByUser));

export default router;
