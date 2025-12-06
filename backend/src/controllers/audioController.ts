import { Request, Response } from "express";
import { upload } from "../utils/fileUpload";
import Interrogation from "../models/InterrogationModel";
import path from "path";

// Handle audio file upload
export const uploadAudio = async (
  req: Request,
  res: Response
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
      const interrogationId = req.params.id;

      // Find the interrogation
      const interrogation = await Interrogation.findById(interrogationId);

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

      await interrogation.save();

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
    const filename = req.params.filename;
    // Serve the actual audio file
    const filePath = path.join(__dirname, "../../uploads", filename);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Get audio error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
