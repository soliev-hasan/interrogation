import { Request, Response } from "express";
import { InterrogationRepository } from "../repositories";

// Generate Word document for an interrogation
export const generateDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const interrogationId = req.params.id as string;

    // Find the interrogation
    const interrogation = await InterrogationRepository.repo().findOneBy({
      id: interrogationId,
    });

    if (!interrogation) {
      res.status(404).json({ message: "Interrogation not found" });
      return;
    }

    // Generate the document content
    const content = `Отчет о допросе


Название: ${interrogation.title}
Дата: ${interrogation.date.toISOString().split("T")[0]}
Подозреваемый: ${interrogation.suspect}
Следователь: ${interrogation.officer}

Транскрипт: ${interrogation.transcript || "No transcript available"}

Создано: ${new Date().toISOString().split("T")[0]}`;

    // Generate a filename
    const filename = `interrogation_${interrogationId}_${Date.now()}.txt`;
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
    fs.writeFileSync(filePath, content);

    // Update the interrogation with the document path
    interrogation.wordDocumentPath = documentPath;
    await InterrogationRepository.repo().update(
      interrogation.id,
      interrogation,
    );

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
  res: Response,
): Promise<void> => {
  try {
    const filename = req.params.filename as string;
    const path = require("path");
    const filePath = path.join(__dirname, "../../documents", filename);

    // Check if file exists
    const fs = require("fs");
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Set headers for file download
    if (filename.endsWith(".docx")) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    } else {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Type", "text/plain");
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
