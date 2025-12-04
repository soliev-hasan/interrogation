import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { IInterrogation } from "../models/InterrogationModel";

// Create documents directory if it doesn't exist
const documentsDir = path.join(__dirname, "../../documents");
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

/**
 * Generate a Word document from an interrogation
 * @param interrogation The interrogation data
 * @returns Path to the generated document
 */
export const generateWordDocument = (interrogation: IInterrogation): Buffer => {
  try {
    // Load the template
    const templatePath = path.join(
      __dirname,
      "../templates/interrogation-template.docx"
    );

    // Check if template exists, if not create a simple one
    let content: Buffer;
    if (fs.existsSync(templatePath)) {
      content = fs.readFileSync(templatePath);
    } else {
      // Create a simple template content
      content = createSimpleTemplate();
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Set the template variables
    doc.setData({
      title: interrogation.title,
      date: interrogation.date.toISOString().split("T")[0],
      suspect: interrogation.suspect,
      officer: interrogation.officer,
      notes: interrogation.transcript || "",
      transcript: interrogation.transcript || "",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    });

    try {
      // Render the document
      doc.render();
    } catch (error) {
      throw new Error(`Error rendering document: ${error}`);
    }

    // Generate the document buffer
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // Create filename
    const filename = `interrogation-${interrogation._id}-${Date.now()}.docx`;
    const filePath = path.join(documentsDir, filename);

    // Write the document to disk
    fs.writeFileSync(filePath, buf);

    return buf;
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw new Error("Failed to generate Word document");
  }
};

/**
 * Create a simple Word document template
 * @returns Buffer containing the template
 */
const createSimpleTemplate = (): Buffer => {
  // This is a minimal valid .docx file structure
  // In a real application, you would use a proper template file
  const template = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
  <w:p>
    <w:r>
      <w:t>Interrogation Report</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:r>
      <w:t>Title: {title}</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:r>
      <w:t>Date: {date}</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:r>
      <w:t>Suspect: {suspect}</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:r>
      <w:t>Officer: {officer}</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:r>
      <w:t>Notes: {notes}</w:t>
    </w:r>
  </w:p>
  <w:p>
    <w:r>
      <w:t>Transcript: {transcript}</w:t>
    </w:r>
  </w:p>
</w:body>
</w:document>`;

  // For simplicity, we're returning a basic buffer
  // In a real implementation, you'd use a proper .docx template
  return Buffer.from(template, "utf-8");
};
