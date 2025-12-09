import fs from "fs";
import path from "path";
import { IInterrogation } from "../models/InterrogationModel";

// Create documents directory if it doesn't exist
const documentsDir = path.join(__dirname, "../../documents");
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

/**
 * Generate a Word document from an interrogation
 * @param interrogation The interrogation data
 * @returns Buffer containing the document
 */
export const generateWordDocument = (interrogation: IInterrogation): Buffer => {
  try {
    // Create a simple document content
    const content = `Отчет о допросе


Название: ${interrogation.title}
Дата: ${interrogation.date.toISOString().split("T")[0]}
Подозреваемый: ${interrogation.suspect}
Следователь: ${interrogation.officer}

Транскрипт: 
${interrogation.transcript || "No transcript available"}

Создано: ${new Date().toISOString().split("T")[0]}`;

    // Return as buffer
    return Buffer.from(content, "utf-8");
  } catch (error) {
    console.error("Error generating document content:", error);
    throw new Error("Failed to generate document content");
  }
};
