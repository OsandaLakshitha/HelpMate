// backend/utils/shortNotes.js

function generateShortNotes(text) {
    const sections = [];
    
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    const keyPhrases = [
        'important', 'key', 'main', 'essential', 'crucial',
        'definition', 'means', 'refers to', 'is a', 'are the',
        'for example', 'such as', 'including', 'consists of',
        'first', 'second', 'third', 'therefore',
        'because', 'due to', 'results in',
        'advantage', 'disadvantage', 'benefit',
        'types of', 'categories'
    ];
    
    const sentences = cleanText
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20 && s.length < 300);
    
    // Score sentences
    const scoredSentences = sentences.map(sentence => {
        let score = 0;
        const lower = sentence.toLowerCase();
        
        keyPhrases.forEach(phrase => {
            if (lower.includes(phrase)) score += 2;
        });
        
        if (/\d+/.test(sentence)) score += 1;
        if (/[A-Z][a-z]+\s+[A-Z][a-z]+/.test(sentence)) score += 1;
        
        const words = sentence.split(' ').length;
        if (words >= 10 && words <= 30) score += 1;
        
        return { sentence, score };
    });
    
    scoredSentences.sort((a, b) => b.score - a.score);
    
    const keyPointsCount = Math.min(Math.ceil(sentences.length * 0.3), 15);
    const keyPoints = scoredSentences.slice(0, keyPointsCount).map(s => s.sentence);
    
    // Extract definitions
    const definitions = sentences.filter(s => {
        const lower = s.toLowerCase();
        return lower.includes(' is a ') || lower.includes(' is the ') || 
               lower.includes(' refers to ') || lower.includes(' means ');
    }).slice(0, 8);
    
    // Extract examples
    const examples = sentences.filter(s => {
        const lower = s.toLowerCase();
        return lower.includes('for example') || lower.includes('such as') || lower.includes('e.g.');
    }).slice(0, 5);
    
    if (keyPoints.length > 0) {
        sections.push({ title: '📌 Key Points', type: 'key_points', items: keyPoints });
    }
    
    if (definitions.length > 0) {
        sections.push({ title: '📖 Definitions', type: 'definitions', items: definitions });
    }
    
    if (examples.length > 0) {
        sections.push({ title: '💡 Examples', type: 'examples', items: examples });
    }
    
    const summary = keyPoints.slice(0, 3).join(' ');
    
    return {
        summary: summary || 'No summary available',
        sections,
        totalPoints: keyPoints.length + definitions.length + examples.length
    };
}

module.exports = { generateShortNotes };