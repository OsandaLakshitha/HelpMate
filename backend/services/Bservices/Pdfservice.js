import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

// Extract full text from PDF file path — called once at project creation
export const extractPdfText = async (filePath) => {
  try {
    const abs = path.resolve(filePath);
    if (!fs.existsSync(abs)) return '';
    const buffer = fs.readFileSync(abs);
    const parsed = await pdfParse(buffer);
    return parsed.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch (err) {
    console.error('PDF extraction error:', err.message);
    return '';  // non-fatal — Claude will still generate using approach text
  }
};

// Delete uploaded PDF if project creation fails after upload
export const deletePdfFile = (filePath) => {
  try {
    const abs = path.resolve(filePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (err) {
    console.error('Delete PDF error:', err.message);
  }
};