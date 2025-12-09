import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import connectDB from "./config/database";
import interrogationRoutes from "./routes/interrogations";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import audioRoutes from "./routes/audio";
import documentsRoutes from "./routes/documents";

// Load environment variables
dotenv.config();

// Create necessary directories if they don't exist
const uploadsDir = path.join(__dirname, "../uploads");
const documentsDir = path.join(__dirname, "../documents");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Connect to MongoDB
connectDB();

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
