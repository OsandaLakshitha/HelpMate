// backend/utils/pdfUtils.js
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractTextFromPdf(filePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found: ' + filePath);
        }
        
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        
        if (!data.text || data.text.trim().length === 0) {
            throw new Error('No text content found in PDF');
        }
        
        return data.text.trim();
    } catch (err) {
        console.error('PDF extraction failed:', err.message);
        throw err;
    }
}

module.exports = { extractTextFromPdf };