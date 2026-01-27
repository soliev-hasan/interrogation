import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import wav from "node-wav";
import { pipeline } from "@xenova/transformers";

import connectDB from "./config/database";
import interrogationRoutes from "./routes/interrogations";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import audioRoutes from "./routes/audio";
import documentsRoutes from "./routes/documents";

// Set ffmpeg path
if (!ffmpegPath) {
  throw new Error("ffmpeg binary not found");
}
ffmpeg.setFfmpegPath(ffmpegPath);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/documents", express.static(path.join(__dirname, "../documents")));

// ---------------- Whisper setup ----------------
const upload = multer({ dest: "uploads/" });
let whisper: any;

async function loadModel() {
  whisper = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-medium",
    {
      quantized: true,
    }
  );
  console.log("Whisper Small Multilingual Loaded");
}

loadModel();

app.post(
  "/api/transcribe",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).send({ error: "No file attached" });

    const input = req.file.path;
    const output = `${input}.wav`;

    try {
      // Convert audio to wav 16k mono
      await new Promise((resolve, reject) => {
        ffmpeg(input)
          .output(output)
          .audioFrequency(16000)
          .audioChannels(1)
          .format("wav")
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      // Decode wav → Float32Array
      const buffer = fs.readFileSync(output);
      const { channelData } = wav.decode(buffer);
      const float32 = new Float32Array(channelData[0]);

      // Transcribe
      const result = await whisper(float32, {
        language: "tg", // Таджикский
        task: "transcribe",
      });

      fs.unlinkSync(input);
      fs.unlinkSync(output);

      return res.json({ text: result.text });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);
// ------------------------------------------------

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
