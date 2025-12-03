import { Request, Response } from "express";
import { interrogations } from "../models/Interrogation";
import { generateWordDocument } from "../utils/documentGenerator";

// Generate Word document for an interrogation
export const generateDocument = (req: Request, res: Response): void => {
  try {
    const interrogationId = parseInt(req.params.id);

    // Find the interrogation
    const interrogation = interrogations.find((i) => i.id === interrogationId);

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Generate the Word document
    const documentPath = generateWordDocument(interrogation);

    // Update the interrogation with the document path
    const interrogationIndex = interrogations.findIndex(
      (i) => i.id === interrogationId
    );
    interrogations[interrogationIndex] = {
      ...interrogations[interrogationIndex],
      wordDocumentPath: documentPath,
      updatedAt: new Date(),
    };

    res.status(200).json({
      message: "Document generated successfully",
      documentPath: documentPath,
      interrogation: interrogations[interrogationIndex],
    });
  } catch (error) {
    console.error("Generate document error:", error);
    res.status(500).json({ message: "Failed to generate document" });
  }
};

// Download Word document
export const downloadDocument = (req: Request, res: Response): void => {
  try {
    const filename = req.params.filename;
    const filePath = `/Users/dilovar/Desktop/old/project_mvd/mvd/backend/documents/${filename}`;

    // In a real application, you would serve the file here
    // For now, we'll just return the file path
    res.status(200).json({ filePath });
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
