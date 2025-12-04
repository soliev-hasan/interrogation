import { Request, Response } from "express";
import Interrogation from "../models/InterrogationModel";
import { generateWordDocument } from "../utils/documentGenerator";

// Generate Word document for an interrogation
export const generateDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const interrogationId = req.params.id;

    // Find the interrogation
    const interrogation = await Interrogation.findById(interrogationId);

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Generate the Word document
    const documentBuffer = generateWordDocument(interrogation);

    // In a real implementation, you would save the document to disk or cloud storage
    // For now, we'll generate a filename
    const filename = `interrogation_${interrogationId}_${Date.now()}.docx`;
    const documentPath = `/documents/${filename}`;

    // Save document to file system
    const fs = require("fs");
    const path = require("path");
    const documentsDir = path.join(__dirname, "../../documents");

    // Create documents directory if it doesn't exist
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    const filePath = path.join(documentsDir, filename);
    fs.writeFileSync(filePath, documentBuffer);

    // Update the interrogation with the document path
    interrogation.wordDocumentPath = documentPath;
    await interrogation.save();

    res.status(200).json({
      message: "Document generated successfully",
      documentPath: documentPath,
      filename: filename,
      interrogation,
    });
  } catch (error) {
    console.error("Generate document error:", error);
    res.status(500).json({ message: "Failed to generate document" });
  }
};

// Download Word document
export const downloadDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filename = req.params.filename;
    const path = require("path");
    const filePath = path.join(__dirname, "../../documents", filename);

    // Check if file exists
    const fs = require("fs");
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
