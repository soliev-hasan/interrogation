import { Request, Response } from "express";
import { upload } from "../utils/fileUpload";
import { interrogations } from "../models/Interrogation";

// Handle audio file upload
export const uploadAudio = (req: Request, res: Response): void => {
  // Use multer upload middleware
  upload.single("audio")(req, res, (err: any) => {
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

    // Get interrogation ID from request parameters
    const interrogationId = parseInt(req.params.id);

    // Find the interrogation
    const interrogationIndex = interrogations.findIndex(
      (i) => i.id === interrogationId
    );

    if (interrogationIndex === -1) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Simulate transcription of the audio file
    // In a real application, you would use a speech-to-text service here
    const simulatedTranscript = `Transcription of the audio recording for interrogation ${interrogationId}...
[00:00:01] Officer: Please state your name for the record.
[00:00:05] Suspect: My name is ${interrogations[interrogationIndex].suspect}.
[00:00:10] Officer: You are here today because...
[00:00:15] Suspect: I understand my rights...`;

    // Update the interrogation with the audio file path and transcript
    interrogations[interrogationIndex] = {
      ...interrogations[interrogationIndex],
      audioFilePath: `/uploads/${req.file.filename}`,
      transcript: simulatedTranscript,
      updatedAt: new Date(),
    };

    res.status(200).json({
      message: "Audio file uploaded and transcribed successfully",
      filePath: `/uploads/${req.file.filename}`,
      transcript: simulatedTranscript,
      interrogation: interrogations[interrogationIndex],
    });
  });
};

// Get audio file
export const getAudio = (req: Request, res: Response): void => {
  try {
    const filename = req.params.filename;
    const filePath = `/Users/dilovar/Desktop/old/project_mvd/mvd/backend/uploads/${filename}`;

    // In a real application, you would serve the file here
    // For now, we'll just return the file path
    res.status(200).json({ filePath });
  } catch (error) {
    console.error("Get audio error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
