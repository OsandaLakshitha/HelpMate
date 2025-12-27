// backend/ai/generator.js
const axios = require('axios');

const AI_SERVER_URL = 'http://localhost:4000';

/**
 * Extract sentences from text
 */
function extractSentences(text) {
    const sentences = text
        .replace(/\n+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 30 && s.length < 500);
    
    return sentences;
}

/**
 * Create diverse text chunks for MCQ generation
 */
function createDiverseChunks(text) {
    const chunks = [];
    const sentences = extractSentences(text);
    const words = text.split(/\s+/);
    
    console.log(`📝 Extracted ${sentences.length} sentences`);
    
    // Strategy 1: Individual sentences
    sentences.forEach((sent) => {
        if (sent.split(' ').length >= 8) {
            chunks.push({
                text: sent,
                type: 'single_sentence',
                priority: 1
            });
        }
    });
    
    // Strategy 2: Consecutive sentence pairs
    for (let i = 0; i < sentences.length - 1; i++) {
        const pair = sentences[i] + ' ' + sentences[i + 1];
        if (pair.split(' ').length >= 15 && pair.split(' ').length <= 80) {
            chunks.push({
                text: pair,
                type: 'sentence_pair',
                priority: 2
            });
        }
    }
    
    // Strategy 3: Sentence triplets
    for (let i = 0; i < sentences.length - 2; i += 2) {
        const triplet = sentences.slice(i, i + 3).join(' ');
        if (triplet.split(' ').length >= 20 && triplet.split(' ').length <= 100) {
            chunks.push({
                text: triplet,
                type: 'sentence_triplet',
                priority: 3
            });
        }
    }
    
    // Strategy 4: Small word chunks (50-70 words)
    for (let i = 0; i < words.length - 50; i += 40) {
        const chunk = words.slice(i, i + 60).join(' ');
        chunks.push({
            text: chunk,
            type: 'small_chunk',
            priority: 4
        });
    }
    
    // Shuffle chunks
    shuffleArray(chunks);
    
    // Sort by priority
    chunks.sort((a, b) => a.priority - b.priority);
    
    console.log(`📚 Created ${chunks.length} diverse chunks`);
    
    return chunks;
}

/**
 * Shuffle array in place
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Check if two questions are similar
 */
function isSimilar(q1, q2, threshold = 0.5) {
    if (!q1 || !q2) return false;
    
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    
    const words1 = new Set(normalize(q1));
    const words2 = new Set(normalize(q2));
    
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    
    const similarity = intersection / union;
    return similarity > threshold;
}

/**
 * Filter unique MCQs
 */
function filterUniqueMCQs(mcqs) {
    const unique = [];
    
    for (const mcq of mcqs) {
        let isDuplicate = false;
        
        for (const existing of unique) {
            if (isSimilar(mcq.question, existing.question)) {
                isDuplicate = true;
                break;
            }
        }
        
        if (!isDuplicate) {
            unique.push(mcq);
        }
    }
    
    return unique;
}

/**
 * Validate MCQ structure
 */
function isValidMCQ(mcq) {
    return (
        mcq &&
        mcq.question &&
        mcq.question.length > 10 &&
        Array.isArray(mcq.options) &&
        mcq.options.length >= 4 &&
        ['A', 'B', 'C', 'D'].includes(mcq.answer)
    );
}

/**
 * Generate single MCQ from chunk
 */
async function generateSingleMCQ(chunkText) {
    try {
        const response = await axios.post(
            `${AI_SERVER_URL}/generate-single`,
            { text: chunkText },
            { timeout: 30000 }
        );
        
        if (response.data && response.data.mcq) {
            return response.data.mcq;
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Generate MCQs in parallel batches
 */
async function generateBatch(chunks, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        const promises = batch.map(chunk => generateSingleMCQ(chunk.text));
        const batchResults = await Promise.all(promises);
        
        for (const mcq of batchResults) {
            if (mcq && isValidMCQ(mcq)) {
                results.push(mcq);
            }
        }
        
        console.log(`   Batch ${Math.floor(i/batchSize) + 1}: ${results.length} valid MCQs so far`);
    }
    
    return results;
}

/**
 * Main function: Generate MCQs from extracted text
 */
async function generateMCQs(extractedText, numQuestions = 20) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 MCQ Generation Started');
    console.log(`📝 Input: ${extractedText.split(/\s+/).length} words`);
    console.log(`🎯 Target: ${numQuestions} unique questions`);
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    // Check if AI server is running
    try {
        await axios.get(`${AI_SERVER_URL}/health`, { timeout: 5000 });
        console.log('✅ AI Server is running');
    } catch (error) {
        console.error('❌ AI Server is not running at', AI_SERVER_URL);
        throw new Error('AI Server is not running. Please start the AI server first.');
    }
    
    // Create diverse chunks
    const chunks = createDiverseChunks(extractedText);
    
    if (chunks.length === 0) {
        throw new Error('Could not create text chunks. Text might be too short.');
    }
    
    // Limit chunks to process
    const chunksToProcess = chunks.slice(0, Math.min(chunks.length, numQuestions * 3));
    
    console.log(`\n⚙️ Processing ${chunksToProcess.length} chunks...`);
    
    // Generate MCQs in parallel batches
    const allMCQs = await generateBatch(chunksToProcess, 5);
    
    console.log(`\n📊 Generated ${allMCQs.length} valid MCQs`);
    
    // Filter unique questions
    const uniqueMCQs = filterUniqueMCQs(allMCQs);
    
    console.log(`✅ Unique MCQs: ${uniqueMCQs.length}`);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ Time: ${elapsed}s`);
    console.log('='.repeat(60) + '\n');
    
    return uniqueMCQs.slice(0, numQuestions);
}

module.exports = { generateMCQs };