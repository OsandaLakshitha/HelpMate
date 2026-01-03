// backend/utils/flashCards.js

function generateFlashCards(text) {
    const flashCards = [];
    
    const sentences = text
        .replace(/\s+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 30 && s.length < 400);
    
    // Pattern: Definitions
    sentences.forEach(sentence => {
        const defMatch = sentence.match(/^([A-Z][^.]*?)\s+(is|are)\s+(a|an|the)?\s*(.+?)\.?$/i);
        if (defMatch && defMatch[1].split(' ').length <= 5) {
            flashCards.push({
                type: 'definition',
                front: `What is ${defMatch[1]}?`,
                back: defMatch[4].charAt(0).toUpperCase() + defMatch[4].slice(1)
            });
        }
        
        const refMatch = sentence.match(/^([A-Z][^.]*?)\s+refers to\s+(.+?)\.?$/i);
        if (refMatch) {
            flashCards.push({
                type: 'definition',
                front: `What does ${refMatch[1]} refer to?`,
                back: refMatch[2]
            });
        }
    });
    
    // Pattern: Facts with numbers
    sentences.forEach(sentence => {
        const numberMatch = sentence.match(/([^.]*?)\s+(?:has|have|contains?)\s+(\d+[^.]*)/i);
        if (numberMatch) {
            flashCards.push({
                type: 'fact',
                front: `How many/much does ${numberMatch[1].trim()} have?`,
                back: numberMatch[2].trim()
            });
        }
    });
    
    // Pattern: Cause/Effect
    sentences.forEach(sentence => {
        const causeMatch = sentence.match(/([^.]+?)\s+causes?\s+([^.]+)/i);
        if (causeMatch && causeMatch[1].split(' ').length <= 8) {
            flashCards.push({
                type: 'cause_effect',
                front: `What does ${causeMatch[1].trim()} cause?`,
                back: causeMatch[2].trim()
            });
        }
    });
    
    // Remove duplicates
    const uniqueCards = [];
    const seenFronts = new Set();
    
    for (const card of flashCards) {
        const frontNorm = card.front.toLowerCase().replace(/[^\w\s]/g, '');
        if (!seenFronts.has(frontNorm) && card.back.length > 10) {
            seenFronts.add(frontNorm);
            uniqueCards.push(card);
        }
    }
    
    return uniqueCards.slice(0, 30);
}

module.exports = { generateFlashCards };