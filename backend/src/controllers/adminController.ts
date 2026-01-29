import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { UserRepository } from "../repositories";

// Get all users (admin only)
export const getAllUsers = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    // In a real application, we would exclude passwords from the response
    const users = await UserRepository.findAll(true);
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific user by ID (admin only)
export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await UserRepository.findById(id, true);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new user (admin only)
export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    // Build query for checking existing user
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user (email is now optional)

    const savedUser = await UserRepository.save({
      username,
      email: email || "", // Make email optional
      password: hashedPassword,
      role: role || "investigator",
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = savedUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a user (admin only)
export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { username, email, password, role } = req.body;

    const user = await UserRepository.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    // Update the user
    if (username) user.username = username;
    if (email !== undefined) user.email = email || ""; // Allow clearing email
    if (role) user.role = role;
    user.updatedAt = new Date();

    const updatedUser = await UserRepository.update(id, user);

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a user (admin only)
export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await UserRepository.delete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
