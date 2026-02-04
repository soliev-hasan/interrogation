import { Request, Response } from "express";
import { upload } from "../utils/fileUpload";
import path from "path";
import FormData from "form-data";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
// import ffmpegStatic from "ffmpeg-static";
import fetch from "node-fetch";
import { appConfig } from "../config/app";
import { InterrogationRepository } from "../repositories";

// Set ffmpeg path
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

// Function to convert audio file to MP3
const convertToMp3 = (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("mp3")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};

// Handle audio file upload
export const uploadAudio = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Use multer upload middleware
  upload.single("audio")(req, res, async (err: any) => {
    if (err) {
      console.error("Upload error:", err);
      if (err.message === "Only audio files are allowed!") {
        res.status(400).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: "File upload failed" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    try {
      // Get interrogation ID from request parameters
      const interrogationId = req.params.id as string;

      // Find the interrogation
      const interrogation = await InterrogationRepository.repo().findOneBy({
        id: interrogationId,
      });

      if (!interrogation) {
        res.status(404).json({ message: "Interrogation not found" });
        return;
      }

      // Get transcript from request body or simulate if not provided
      let transcript = req.body.transcript;
      if (!transcript) {
        // Simulate transcription of the audio file if no transcript provided
        // In a real application, you would use a speech-to-text service here
        transcript = `Transcription of the audio recording for interrogation ${interrogationId}...
[00:00:01] Officer: Please state your name for the record.
[00:00:05] Suspect: My name is ${interrogation.suspect}.
[00:00:10] Officer: You are here today because...
[00:00:15] Suspect: I understand my rights...`;
      }

      // Update the interrogation with the audio file path and transcript
      interrogation.audioFilePath = `/uploads/${req.file.filename}`;
      interrogation.transcript = transcript;

      await InterrogationRepository.repo().update(
        interrogation.id,
        interrogation,
      );

      res.status(200).json({
        message: "Audio file uploaded and transcribed successfully",
        filePath: `/uploads/${req.file.filename}`,
        transcript: transcript,
        interrogation,
      });
    } catch (error) {
      console.error("Audio upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

// Get audio file
export const getAudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const filename = req.params.filename as string;
    // Serve the actual audio file
    const filePath = path.join(__dirname, "../../uploads", filename);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Get audio error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Transcribe audio using Python service
export const transcribeAudio = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Convert the file to MP3 format
    const mp3FilePath = req.file.path + ".mp3";
    await convertToMp3(req.file.path, mp3FilePath);

    // Verify MP3 file was created
    if (!fs.existsSync(mp3FilePath)) {
      res.status(500).json({ message: "Failed to convert audio to MP3" });
      return;
    }

    console.log(1111111);

    // Forward the request to Python service
    const pythonServiceUrl = `${appConfig.pythonServiceUrl}/transcribe`;

    // Create form data to forward to Python service with MP3 file
    const form = new FormData();
    const mp3FileName = req.file.originalname.replace(
      path.extname(req.file.originalname),
      ".mp3",
    );

    form.append("audio", fs.createReadStream(mp3FilePath), {
      filename: mp3FileName,
      contentType: "audio/mpeg",
    });

    // Log file information for debugging
    console.log("Forwarding file to Python service:");
    console.log("  Original name:", req.file.originalname);
    console.log(
      "  Converted to MP3 name:",
      req.file.originalname.replace(
        path.extname(req.file.originalname),
        ".mp3",
      ),
    );
    console.log("  MIME type:", "audio/mpeg");
    console.log("  File path:", mp3FilePath);
    console.log("  File size:", fs.statSync(mp3FilePath).size);

    // Add max_length if provided
    if (req.body.max_length) {
      form.append("max_length", req.body.max_length);
    }

    // Make request to Python service using node-fetch
    // Get headers from form-data (includes boundary)
    const formHeaders = form.getHeaders();

    const response = await fetch(pythonServiceUrl, {
      method: "POST",
      headers: formHeaders,
      // {
      //   "Content-Type": "multipart/form-data",
      // },
      body: form as any, // form-data stream
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python service error:", errorText);

      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        res.status(response.status).json({
          message: `Transcription service error: ${
            errorJson.detail || errorText
          }`,
        });
      } catch (parseError) {
        res.status(response.status).json({
          message: `Transcription service error: ${errorText}`,
        });
      }
      return;
    }

    const result = await response.json();

    // Clean up the temporary MP3 file
    try {
      fs.unlinkSync(mp3FilePath);
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary MP3 file:", cleanupError);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
