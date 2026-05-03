const pdf = require("pdf-parse");

/**
 * PDF Extractor Service
 * Handles all PDF text extraction logic
 */

// STEP 1: Extract text from PDF buffer
async function extractTextFromPDF(buffer) {
  try {
    // Validate buffer
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer: Expected a Buffer object");
    }

    if (buffer.length === 0) {
      throw new Error("Empty buffer: PDF file is empty");
    }

    // Check if it's a valid PDF (starts with %PDF)
    const pdfHeader = buffer.toString("utf8", 0, 4);
    if (pdfHeader !== "%PDF") {
      throw new Error("Invalid PDF: File does not appear to be a valid PDF");
    }

    const data = await pdf(buffer);

    if (!data || !data.text) {
      throw new Error("PDF parsed but no text extracted");
    }

    return data.text;
  } catch (error) {
    console.error("PDF Extraction Error:", error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Extract basic information from CV text
function extractBasicInfo(text) {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);

  // Extract phone
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);

  // Extract name (usually first non-empty line)
  const name = lines[0] || "Not found";

  // Extract years of experience
  const expRegex = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i;
  const expMatch = text.match(expRegex);
  const experience = expMatch ? expMatch[1] : "0";

  return {
    name: name.trim(),
    email: emailMatch ? emailMatch[0] : "Not found",
    phone: phoneMatch ? phoneMatch[0] : "Not found",
    experience: experience,
  };
}

module.exports = {
  extractTextFromPDF,
  extractBasicInfo,
};
