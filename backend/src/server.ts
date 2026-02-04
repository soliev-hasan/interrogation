import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";

import interrogationRoutes from "./routes/interrogations";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import audioRoutes from "./routes/audio";
import documentsRoutes from "./routes/documents";
import { appDataSource } from "./config/database";

// Set ffmpeg path
// if (!ffmpegPath) {
//   throw new Error("ffmpeg binary not found");
// }
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

// Load environment variables
dotenv.config();

appDataSource.initialize();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/documents", express.static(path.join(__dirname, "../documents")));

// Routes
app.get("/", (_req: Request, res: Response): void => {
  res.send("Interrogation Management System API is running!");
});

app.get("/api/health", (_req: Request, res: Response): void => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Interrogation routes
app.use("/api/interrogations", interrogationRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Audio routes
app.use("/api/audio", audioRoutes);

// Documents routes
app.use("/api/documents", documentsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
