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

  // Extract phone - try multiple patterns
  const phoneRegex1 = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/; // US format
  const phoneRegex2 =
    /(\+\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/; // International format
  const phoneMatch = text.match(phoneRegex1) || text.match(phoneRegex2);

  // Extract name with improved logic
  let name = "Not found";

  // First, try to find "Name:" or "Name :" followed by the actual name
  const nameWithLabelMatch = text.match(
    /\bName\s*:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
  );
  if (nameWithLabelMatch) {
    name = nameWithLabelMatch[1].trim();
  } else {
    // Look for a capitalized name pattern in the first few lines
    // Skip common CV headings
    const commonHeadings =
      /^(curriculum\s+vitae|resume|cv|personal\s+information|contact|profile|summary|objective)/i;

    for (const line of lines.slice(0, 10)) {
      if (commonHeadings.test(line.trim())) {
        continue; // Skip this line
      }

      // Look for name pattern: Two or more capitalized words
      const namePattern =
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]*\.?)*(?:\s+[A-Z][a-z]+)+)$/;
      const match = line.trim().match(namePattern);

      if (match) {
        name = match[1];
        break;
      }
    }

    // Fallback: if still not found, use first non-heading line
    if (name === "Not found") {
      for (const line of lines) {
        if (!commonHeadings.test(line.trim()) && line.trim().length > 2) {
          name = line.trim();
          break;
        }
      }
    }
  }

  // Extract years of experience
  const expRegex = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i;
  const expMatch = text.match(expRegex);
  const experience = expMatch ? expMatch[1] : "0";

  // Extract work experience section
  const workExperience = extractWorkExperience(text);

  // Extract skills
  const skills = extractSkills(text);

  return {
    name: name.trim(),
    email: emailMatch ? emailMatch[0] : "Not found",
    phone: phoneMatch ? phoneMatch[0] : "Not found",
    experience: experience,
    workExperience: workExperience,
    skills: skills,
  };
}

// Extract work experience details
function extractWorkExperience(text) {
  const experienceEntries = [];

  // Find work experience section with various header patterns
  const sectionRegex =
    /(?:work\s+experience|professional\s+experience|experience|employment\s+history|career\s+history)/gi;
  const sectionMatch = text.match(sectionRegex);

  if (!sectionMatch) {
    return experienceEntries;
  }

  // Get the section start position
  const sectionStart = text
    .toLowerCase()
    .indexOf(sectionMatch[0].toLowerCase());

  // Find the next major section (education, skills, etc.) or end of text
  const nextSectionRegex =
    /(?:education|skills|certifications|projects|awards|references)/gi;
  const nextSectionMatch = text
    .substring(sectionStart + 50)
    .match(nextSectionRegex);

  const sectionEnd = nextSectionMatch
    ? sectionStart +
      50 +
      text.substring(sectionStart + 50).indexOf(nextSectionMatch[0])
    : text.length;

  const experienceText = text.substring(sectionStart, sectionEnd);

  // Extract job entries with title, company, and date range
  // Pattern: Job Title | Company | Date or Job Title - Company - Date
  const jobPattern =
    /([A-Za-z\s&,]+?)\s*[|\-–]\s*([A-Za-z\s&,]+?)\s*[|\-–]?\s*(\d{4}\s*[–\-]\s*(?:\d{4}|Present|Current))/gi;

  let match;
  while ((match = jobPattern.exec(experienceText)) !== null) {
    experienceEntries.push({
      title: match[1].trim(),
      company: match[2].trim(),
      period: match[3].trim(),
    });
  }

  return experienceEntries;
}

// Extract skills from CV text
function extractSkills(text) {
  const skills = [];

  // Find skills section with various header patterns
  const sectionRegex =
    /(?:skills|technical\s+skills|artistic\s+skills|core\s+competencies|proficiencies|expertise)/gi;
  const sectionMatch = text.match(sectionRegex);

  if (!sectionMatch) {
    return skills;
  }

  // Get the section start position
  const sectionStart = text
    .toLowerCase()
    .indexOf(sectionMatch[0].toLowerCase());

  // Find the next major section or end of text
  const nextSectionRegex =
    /(?:work\s+experience|professional\s+experience|experience|education|certifications|projects|awards|references|languages|interests)/gi;
  const nextSectionMatch = text
    .substring(sectionStart + 50)
    .match(nextSectionRegex);

  const sectionEnd = nextSectionMatch
    ? sectionStart +
      50 +
      text.substring(sectionStart + 50).indexOf(nextSectionMatch[0])
    : text.length;

  const skillsText = text.substring(sectionStart, sectionEnd);

  // Extract skills - look for bullet points or comma-separated items
  const lines = skillsText.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip the header line
    if (
      trimmedLine
        .toLowerCase()
        .match(
          /^(?:skills|technical\s+skills|artistic\s+skills|core\s+competencies|proficiencies|expertise)/i
        )
    ) {
      continue;
    }

    // Match bullet points (•, -, *, or numbered)
    const bulletMatch = trimmedLine.match(/^(?:[•\-\*]|\d+\.)\s*(.+)$/);
    if (bulletMatch) {
      const skillText = bulletMatch[1].trim();

      // Check if it has parentheses with tools/technologies
      const skillWithToolsMatch = skillText.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (skillWithToolsMatch) {
        skills.push({
          category: skillWithToolsMatch[1].trim(),
          tools: skillWithToolsMatch[2].split(",").map((t) => t.trim()),
        });
      } else if (skillText.length > 0) {
        skills.push(skillText);
      }
    } else if (
      trimmedLine.length > 0 &&
      !trimmedLine.match(/^(?:skills|technical\s+skills|artistic\s+skills)/i)
    ) {
      // If not a bullet point but has content, might be comma-separated
      const commaSeparated = trimmedLine
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (commaSeparated.length > 1) {
        skills.push(...commaSeparated);
      }
    }
  }

  return skills;
}

module.exports = {
  extractTextFromPDF,
  extractBasicInfo,
};
