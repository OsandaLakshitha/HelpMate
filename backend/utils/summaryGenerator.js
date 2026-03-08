// backend/utils/summaryGenerator.js
const axios = require('axios');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:4000';

/**
 * Generate a single summary from a text chunk
 */
async function generateSingleSummary(text) {
    try {
        const response = await axios.post(
            `${AI_SERVER_URL}/generate-summary`,
            { text },
            { timeout: 30000 }
        );

        if (response.data?.summary) {
            return response.data.summary;
        }
        return null;
    } catch (err) {
        console.error('Summary generation error:', err.message);
        return null;
    }
}

/**
 * Check if summarizer model is available
 */
async function checkSummarizerHealth() {
    try {
        const response = await axios.get(`${AI_SERVER_URL}/health`, { timeout: 5000 });
        return response.data?.models?.summarizer === true;
    } catch (err) {
        return false;
    }
}

/**
 * Create text chunks for summarization
 */
function createSummaryChunks(text, wordsPerChunk = 150) {
    const sentences = text
        .replace(/\n+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);

    const chunks = [];
    let currentChunk = '';
    let wordCount = 0;

    for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).length;
        
        if (wordCount + sentenceWords > wordsPerChunk && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence + ' ';
            wordCount = sentenceWords;
        } else {
            currentChunk += sentence + ' ';
            wordCount += sentenceWords;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Extract key definitions from text
 */
function extractDefinitions(text) {
    const sentences = text
        .replace(/\n+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.length > 30 && s.length < 400);

    const definitions = sentences.filter(s => {
        const lower = s.toLowerCase();
        return (
            lower.includes(' is a ') ||
            lower.includes(' is the ') ||
            lower.includes(' refers to ') ||
            lower.includes(' means ') ||
            lower.includes(' defined as ') ||
            lower.includes(' known as ')
        );
    });

    return definitions.slice(0, 10);
}

/**
 * Extract examples from text
 */
function extractExamples(text) {
    const sentences = text
        .replace(/\n+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.length > 30 && s.length < 400);

    const examples = sentences.filter(s => {
        const lower = s.toLowerCase();
        return (
            lower.includes('for example') ||
            lower.includes('such as') ||
            lower.includes('e.g.') ||
            lower.includes('for instance') ||
            lower.includes('including')
        );
    });

    return examples.slice(0, 8);
}

/**
 * Generate AI-powered short notes from extracted text
 */
async function generateShortNotes(extractedText, maxSummaries = 10) {
    console.log('\n📝 ========== AI SUMMARY GENERATION ==========');
    console.log(`📄 Input: ${extractedText.split(/\s+/).length} words`);
    console.log(`🎯 Target: ${maxSummaries} summaries`);

    const startTime = Date.now();

    // Check if AI server is available
    const aiAvailable = await checkSummarizerHealth();
    console.log(`🤖 AI Summarizer available: ${aiAvailable ? 'Yes' : 'No'}`);

    // Create chunks for summarization
    const chunks = createSummaryChunks(extractedText, 200);
    console.log(`📚 Created ${chunks.length} text chunks`);

    // Select chunks to process (spread across the document)
    const chunksToProcess = [];
    const step = Math.max(1, Math.floor(chunks.length / maxSummaries));
    for (let i = 0; i < chunks.length && chunksToProcess.length < maxSummaries; i += step) {
        chunksToProcess.push(chunks[i]);
    }

    console.log(`⚙️ Processing ${chunksToProcess.length} chunks...`);

    // Generate summaries
    const summaries = [];

    if (aiAvailable) {
        // Use AI model
        for (let i = 0; i < chunksToProcess.length; i++) {
            const summary = await generateSingleSummary(chunksToProcess[i]);
            if (summary) {
                summaries.push(summary);
                console.log(`   ✅ Summary ${i + 1}: ${summary.substring(0, 50)}...`);
            }
        }
        console.log(`\n📊 Generated ${summaries.length} AI summaries`);
    } else {
        console.log('⚠️ AI not available, using extractive summarization');
    }

    // Extract definitions and examples (always do this)
    const definitions = extractDefinitions(extractedText);
    const examples = extractExamples(extractedText);

    console.log(`📖 Found ${definitions.length} definitions`);
    console.log(`💡 Found ${examples.length} examples`);

    // Build sections
    const sections = [];

    // AI-generated summaries or key points
    if (summaries.length > 0) {
        sections.push({
            title: '🤖 AI Summary',
            type: 'ai_summary',
            items: summaries
        });
    }

    // Key points (extractive)
    const keyPoints = extractKeyPoints(extractedText, 10);
    if (keyPoints.length > 0) {
        sections.push({
            title: '📌 Key Points',
            type: 'key_points',
            items: keyPoints
        });
    }

    // Definitions
    if (definitions.length > 0) {
        sections.push({
            title: '📖 Definitions',
            type: 'definitions',
            items: definitions
        });
    }

    // Examples
    if (examples.length > 0) {
        sections.push({
            title: '💡 Examples',
            type: 'examples',
            items: examples
        });
    }

    // Create overall summary
    const overallSummary = summaries.length > 0 
        ? summaries.slice(0, 3).join(' ')
        : keyPoints.slice(0, 3).join(' ');

    const totalPoints = summaries.length + keyPoints.length + definitions.length + examples.length;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ Time: ${elapsed}s`);
    console.log(`📊 Total points: ${totalPoints}`);
    console.log('📝 ========== SUMMARY COMPLETE ==========\n');

    return {
        summary: overallSummary || 'Summary generated from your document.',
        sections,
        totalPoints,
        aiGenerated: summaries.length > 0
    };
}

/**
 * Extract key points using keyword scoring
 */
function extractKeyPoints(text, maxPoints = 10) {
    const keyPhrases = [
        'important', 'key', 'main', 'essential', 'crucial', 'significant',
        'fundamental', 'primary', 'major', 'critical', 'vital',
        'must', 'should', 'always', 'never', 'ensure',
        'first', 'second', 'third', 'finally', 'therefore', 'however',
        'because', 'due to', 'results in', 'leads to', 'causes',
        'advantage', 'disadvantage', 'benefit', 'drawback',
        'types of', 'categories', 'consists of', 'includes'
    ];

    const sentences = text
        .replace(/\n+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 30 && s.length < 350);

    // Score sentences
    const scoredSentences = sentences.map(sentence => {
        let score = 0;
        const lower = sentence.toLowerCase();

        keyPhrases.forEach(phrase => {
            if (lower.includes(phrase)) score += 2;
        });

        // Bonus for numbers/data
        if (/\d+/.test(sentence)) score += 1;

        // Bonus for proper nouns
        if (/[A-Z][a-z]+\s+[A-Z][a-z]+/.test(sentence)) score += 1;

        // Optimal length bonus
        const words = sentence.split(' ').length;
        if (words >= 12 && words <= 35) score += 1;

        return { sentence, score };
    });

    // Sort by score and get top points
    scoredSentences.sort((a, b) => b.score - a.score);

    return scoredSentences
        .slice(0, maxPoints)
        .map(s => s.sentence);
}

/**
 * Fallback: Generate basic short notes without AI
 */
function generateBasicShortNotes(text) {
    const keyPoints = extractKeyPoints(text, 15);
    const definitions = extractDefinitions(text);
    const examples = extractExamples(text);

    const sections = [];

    if (keyPoints.length > 0) {
        sections.push({
            title: '📌 Key Points',
            type: 'key_points',
            items: keyPoints
        });
    }

    if (definitions.length > 0) {
        sections.push({
            title: '📖 Definitions',
            type: 'definitions',
            items: definitions
        });
    }

    if (examples.length > 0) {
        sections.push({
            title: '💡 Examples',
            type: 'examples',
            items: examples
        });
    }

    const summary = keyPoints.slice(0, 3).join(' ');

    return {
        summary: summary || 'No summary available',
        sections,
        totalPoints: keyPoints.length + definitions.length + examples.length,
        aiGenerated: false
    };
}

module.exports = { 
    generateShortNotes, 
    generateBasicShortNotes,
    generateSingleSummary,
    checkSummarizerHealth 
};
