import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminController";

const router: Router = Router();

// Wrap async middleware to handle errors properly
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes require authentication
router.use(asyncHandler(authenticateToken));

// Only admins can access these routes
router.use(authorizeRole(["admin"]));

// GET /api/admin/users - Get all users
router.get("/users", asyncHandler(getAllUsers));

// GET /api/admin/users/:id - Get a specific user by ID
router.get("/users/:id", asyncHandler(getUserById));

// POST /api/admin/users - Create a new user
router.post("/users", asyncHandler(createUser));

// PUT /api/admin/users/:id - Update a user
router.put("/users/:id", asyncHandler(updateUser));

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", asyncHandler(deleteUser));

export default router;
