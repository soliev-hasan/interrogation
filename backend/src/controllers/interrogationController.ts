import { Request, Response } from "express";
import { appDataSource } from "../config/database";
import { InterrogationEntity, UserEntity } from "../entities";
import { UserRepository } from "../repositories";

// Get all interrogations (with optional filtering by user)
export const getAllInterrogations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const interrogationRepo = appDataSource.getRepository(InterrogationEntity);

    const qb = interrogationRepo
      .createQueryBuilder("interrogation")
      .leftJoinAndSelect("interrogation.createdBy", "user")
      .select([
        "interrogation.id",
        "interrogation.title",
        "interrogation.date",
        "interrogation.suspect",
        "interrogation.officer",
        "interrogation.transcript",
        "interrogation.audioFilePath",
        "interrogation.wordDocumentPath",
        "interrogation.createdAt",
        "interrogation.updatedAt",
        "user.id",
        "user.username",
        "user.email",
      ]);

    // Admins → all, Investigators → only their own
    if (userRole !== "admin") {
      qb.where("user.id = :userId", { userId });
    }

    const interrogations = await qb.getMany();

    res.status(200).json(interrogations);
  } catch (error) {
    console.error("Get interrogations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific interrogation by ID
export const getInterrogationById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const interrogationRepo = appDataSource.getRepository(InterrogationEntity);

    const interrogation = await interrogationRepo
      .createQueryBuilder("interrogation")
      .leftJoinAndSelect("interrogation.createdBy", "user")
      .select([
        "interrogation.id",
        "interrogation.title",
        "interrogation.date",
        "interrogation.suspect",
        "interrogation.officer",
        "interrogation.transcript",
        "interrogation.audioFilePath",
        "interrogation.wordDocumentPath",
        "interrogation.createdAt",
        "interrogation.updatedAt",
        "user.id",
        "user.username",
        "user.email",
      ])
      .where("interrogation.id = :id", { id })
      .getOne();

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Permission check (much simpler in TypeORM)
    if (userRole !== "admin" && interrogation.createdBy.id !== userId) {
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
  res: Response,
): Promise<void> => {
  try {
    const { title, date, suspect, officer, transcript } = req.body;
    const userId = (req as any).userId;

    if (!title || !date || !suspect || !officer) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const interrogationRepo = appDataSource.getRepository(InterrogationEntity);

    const interrogation = interrogationRepo.create({
      title,
      date,
      suspect,
      officer,
      transcript: transcript || "",
      createdBy: { id: userId } as UserEntity,
    });

    await interrogationRepo.save(interrogation);

    // Fetch again with populated user (username + email)
    const savedInterrogation = await interrogationRepo.findOne({
      where: { id: interrogation.id },
      relations: ["createdBy"],
      select: {
        createdBy: {
          id: true,
          username: true,
          email: true,
        },
      },
    });

    res.status(201).json(savedInterrogation);
  } catch (error) {
    console.error("Create interrogation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an existing interrogation
export const updateInterrogation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const {
      title,
      date,
      suspect,
      officer,
      transcript,
      audioFilePath,
      wordDocumentPath,
    } = req.body;

    const interrogationRepo = appDataSource.getRepository(InterrogationEntity);

    const interrogation = await interrogationRepo.findOne({
      where: { id },
      relations: ["createdBy"],
    });

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    if (userRole !== "admin" && interrogation.createdBy.id !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    if (title !== undefined) interrogation.title = title;
    if (date !== undefined) interrogation.date = date;
    if (suspect !== undefined) interrogation.suspect = suspect;
    if (officer !== undefined) interrogation.officer = officer;
    if (transcript !== undefined) interrogation.transcript = transcript;
    if (audioFilePath !== undefined)
      interrogation.audioFilePath = audioFilePath;
    if (wordDocumentPath !== undefined)
      interrogation.wordDocumentPath = wordDocumentPath;

    await interrogationRepo.save(interrogation);

    res.status(200).json(interrogation);
  } catch (error) {
    console.error("Update interrogation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete an interrogation
export const deleteInterrogation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const interrogationRepo = appDataSource.getRepository(InterrogationEntity);

    const interrogation = await interrogationRepo.findOne({
      where: { id },
      relations: ["createdBy"],
    });

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    if (userRole !== "admin" && interrogation.createdBy.id !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await interrogationRepo.remove(interrogation);

    res.status(200).json({ message: "Interrogation deleted successfully" });
  } catch (error) {
    console.error("Delete interrogation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get interrogations by user
export const getInterrogationsByUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const requestingUserId = (req as any).userId;
    const userRole = (req as any).userRole;

    if (userRole !== "admin" && requestingUserId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const interrogationRepo = appDataSource.getRepository(InterrogationEntity);

    const userExists = await UserRepository.findById(userId);
    if (!userExists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const interrogations = await interrogationRepo.find({
      where: { createdBy: { id: userId } },
      relations: ["createdBy"],
      select: {
        createdBy: {
          id: true,
          username: true,
          email: true,
        },
      },
    });

    res.status(200).json(interrogations);
  } catch (error) {
    console.error("Get user interrogations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
