import { Request, Response } from "express";
import mongoose from "mongoose";
import Interrogation from "../models/InterrogationModel";
import User from "../models/UserModel";

// Get all interrogations (with optional filtering by user)
export const getAllInterrogations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Admins can see all interrogations, investigators only see their own
    const query = userRole === "admin" ? {} : { createdBy: userId };
    const interrogations = await Interrogation.find(query).populate(
      "createdBy",
      "username email"
    );

    res.status(200).json(interrogations);
  } catch (error) {
    console.error("Get interrogations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific interrogation by ID
export const getInterrogationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const interrogation = await Interrogation.findById(id).populate(
      "createdBy",
      "username email"
    );

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Check if user has permission to access this interrogation
    if (userRole !== "admin" && interrogation.createdBy.toString() !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json(interrogation);
  } catch (error) {
    console.error("Get interrogation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new interrogation
export const createInterrogation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, date, suspect, officer, notes } = req.body;
    const userId = (req as any).userId;

    if (!title || !date || !suspect || !officer) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newInterrogation = new Interrogation({
      title,
      date,
      suspect,
      officer,
      notes: notes || "",
      createdBy: userId,
    });

    const savedInterrogation = await newInterrogation.save();

    // Check if the interrogation was actually saved
    if (!savedInterrogation || !savedInterrogation._id) {
      res.status(500).json({ message: "Failed to save interrogation" });
      return;
    }

    // Populate the createdBy field with user details
    await savedInterrogation.populate("createdBy", "username email");

    res.status(201).json(savedInterrogation);
  } catch (error) {
    console.error("Create interrogation error:", error);
    // More detailed error response
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Update an existing interrogation
export const updateInterrogation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const {
      title,
      date,
      suspect,
      officer,
      notes,
      audioFilePath,
      transcript,
      wordDocumentPath,
    } = req.body;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const interrogation = await Interrogation.findById(id);

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Check if user has permission to update this interrogation
    if (userRole !== "admin" && interrogation.createdBy.toString() !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Update the interrogation
    const updates: any = {};
    if (title) updates.title = title;
    if (date) updates.date = date;
    if (suspect) updates.suspect = suspect;
    if (officer) updates.officer = officer;
    if (notes !== undefined) updates.notes = notes;
    if (audioFilePath) updates.audioFilePath = audioFilePath;
    if (transcript) updates.transcript = transcript;
    if (wordDocumentPath) updates.wordDocumentPath = wordDocumentPath;
    updates.updatedAt = new Date();

    const updatedInterrogation = await Interrogation.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate("createdBy", "username email");

    res.status(200).json(updatedInterrogation);
  } catch (error) {
    console.error("Update interrogation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete an interrogation
export const deleteInterrogation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    
    // Check if ID is provided
    if (!id) {
      res.status(400).json({ message: "Interrogation ID is required" });
      return;
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid interrogation ID format" });
      return;
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const interrogation = await Interrogation.findById(id);

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Check if user has permission to delete this interrogation
    if (userRole !== "admin" && interrogation.createdBy.toString() !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await Interrogation.findByIdAndDelete(id);
    res.status(200).json({ message: "Interrogation deleted successfully" });
  } catch (error) {
    console.error("Delete interrogation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get interrogations by user
export const getInterrogationsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const requestingUserId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Only admins can view other users' interrogations
    if (userRole !== "admin" && requestingUserId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userInterrogations = await Interrogation.find({
      createdBy: userId,
    }).populate("createdBy", "username email");
    res.status(200).json(userInterrogations);
  } catch (error) {
    console.error("Get user interrogations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
