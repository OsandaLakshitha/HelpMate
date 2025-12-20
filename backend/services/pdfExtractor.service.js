const PDFParser = require("pdf-parse");

/**
 * PDF Extractor Service
 * Handles all PDF text extraction logic
 */

// STEP 1: Extract text from PDF buffer
async function extractTextFromPDF(buffer) {
  try {
    const data = await PDFParser(buffer);
    return data.text;
  } catch (error) {
    throw new Error("Failed to extract text from PDF");
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
