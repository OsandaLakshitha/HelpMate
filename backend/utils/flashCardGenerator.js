// backend/utils/flashCardGenerator.js
const axios = require('axios');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:4000';

/**
 * Check if AI server and flashcard model are available
 */
async function checkAIServer() {
    try {
        const response = await axios.get(`${AI_SERVER_URL}/health`, { timeout: 5000 });
        console.log('🔍 AI Server Health Check:', JSON.stringify(response.data, null, 2));
        
        // Check multiple possible response formats
        const flashcardLoaded = 
            response.data?.models?.flashcard === true ||
            response.data?.flashcard_model === true ||
            response.data?.flashcardModel === true ||
            (response.data?.model && response.data.model.includes('flashcard'));
        
        return {
            available: true,
            flashcardModel: flashcardLoaded,
            data: response.data
        };
    } catch (error) {
        console.log('❌ AI Server not available:', error.message);
        return { available: false, flashcardModel: false };
    }
}

/**
 * Generate single flashcard from text chunk
 */
async function generateSingleFlashcard(text) {
    try {
        const response = await axios.post(
            `${AI_SERVER_URL}/generate-flashcard`,
            { text },
            { timeout: 30000 }
        );

        if (response.data?.flashcard) {
            return response.data.flashcard;
        }
        return null;
    } catch (err) {
        // Don't log every error, just return null
        return null;
    }
}

/**
 * Create diverse chunks from text for flashcard generation
 */
function createFlashcardChunks(text) {
    const chunks = [];
    
    // Clean and split into sentences
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const sentences = cleanText
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 30 && s.length < 500);
    
    console.log(`📝 Extracted ${sentences.length} sentences for flashcards`);
    
    // Strategy 1: Single sentences with definitions (highest priority for flashcards)
    sentences.forEach((sent, idx) => {
        const lower = sent.toLowerCase();
        if (lower.includes(' is ') || lower.includes(' are ') || 
            lower.includes(' refers to ') || lower.includes(' means ') ||
            lower.includes(' defined as ') || lower.includes(' known as ')) {
            chunks.push({ text: sent, type: 'definition', priority: 1, index: idx });
        }
    });
    
    // Strategy 2: Sentences with key concepts
    sentences.forEach((sent, idx) => {
        const lower = sent.toLowerCase();
        if (lower.includes('important') || lower.includes('key ') || 
            lower.includes('main ') || lower.includes('primary ') ||
            lower.includes('essential') || lower.includes('fundamental')) {
            chunks.push({ text: sent, type: 'key_concept', priority: 2, index: idx });
        }
    });
    
    // Strategy 3: Process/procedure sentences
    sentences.forEach((sent, idx) => {
        const lower = sent.toLowerCase();
        if (lower.includes('process') || lower.includes('step') || 
            lower.includes('method') || lower.includes('technique') ||
            lower.includes('approach') || lower.includes('procedure')) {
            chunks.push({ text: sent, type: 'process', priority: 3, index: idx });
        }
    });
    
    // Strategy 4: Sentence pairs for context
    for (let i = 0; i < sentences.length - 1; i++) {
        const pair = sentences[i] + ' ' + sentences[i + 1];
        const wordCount = pair.split(/\s+/).length;
        if (wordCount >= 20 && wordCount <= 80) {
            chunks.push({ text: pair, type: 'pair', priority: 4, index: i });
        }
    }
    
    // Strategy 5: Remaining good sentences
    sentences.forEach((sent, idx) => {
        const wordCount = sent.split(/\s+/).length;
        if (wordCount >= 10 && wordCount <= 50) {
            // Check if not already added
            const alreadyAdded = chunks.some(c => c.index === idx && c.type !== 'pair');
            if (!alreadyAdded) {
                chunks.push({ text: sent, type: 'sentence', priority: 5, index: idx });
            }
        }
    });
    
    // Remove duplicates based on text similarity
    const uniqueChunks = [];
    const seenTexts = new Set();
    
    for (const chunk of chunks) {
        const normalized = chunk.text.toLowerCase().substring(0, 50);
        if (!seenTexts.has(normalized)) {
            seenTexts.add(normalized);
            uniqueChunks.push(chunk);
        }
    }
    
    // Sort by priority
    uniqueChunks.sort((a, b) => a.priority - b.priority);
    
    console.log(`📚 Created ${uniqueChunks.length} diverse chunks for flashcard generation`);
    
    return uniqueChunks;
}

/**
 * Check if two flashcards are similar
 */
function isSimilarFlashcard(card1, card2, threshold = 0.5) {
    if (!card1?.front || !card2?.front) return false;
    
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    
    const words1 = new Set(normalize(card1.front));
    const words2 = new Set(normalize(card2.front));
    
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    
    return union > 0 && (intersection / union) > threshold;
}

/**
 * Filter unique flashcards
 */
function filterUniqueFlashcards(flashcards) {
    const unique = [];
    
    for (const card of flashcards) {
        let isDuplicate = false;
        
        for (const existing of unique) {
            if (isSimilarFlashcard(card, existing)) {
                isDuplicate = true;
                break;
            }
        }
        
        if (!isDuplicate) {
            unique.push(card);
        }
    }
    
    return unique;
}

/**
 * Generate flashcards in parallel batches
 */
async function generateBatch(chunks, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        const promises = batch.map(chunk => generateSingleFlashcard(chunk.text));
        const batchResults = await Promise.all(promises);
        
        for (const card of batchResults) {
            if (card && card.front && card.back) {
                results.push({
                    type: 'ai_generated',
                    front: card.front,
                    back: card.back
                });
            }
        }
        
        console.log(`   Batch ${Math.floor(i/batchSize) + 1}: ${results.length} valid flashcards so far`);
    }
    
    return results;
}

/**
 * Generate basic flashcards (fallback when AI not available)
 */
function generateBasicFlashcards(text, maxCards = 10) {
    console.log('📝 Generating basic flashcards (fallback mode)');
    
    const flashcards = [];
    const sentences = text
        .replace(/\s+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 30 && s.length < 400);
    
    // Find definition sentences
    for (const sentence of sentences) {
        if (flashcards.length >= maxCards) break;
        
        const lower = sentence.toLowerCase();
        
        // Pattern: "X is Y" or "X are Y"
        const isMatch = sentence.match(/^([A-Z][^.]*?)\s+(is|are)\s+(.+)$/i);
        if (isMatch) {
            const subject = isMatch[1].trim();
            const definition = isMatch[3].trim().replace(/\.$/, '');
            
            if (subject.length > 3 && subject.length < 100 && definition.length > 10) {
                flashcards.push({
                    type: 'basic',
                    front: `What is ${subject.toLowerCase()}?`,
                    back: definition
                });
            }
        }
        
        // Pattern: "X refers to Y"
        const refersMatch = sentence.match(/^([A-Z][^.]*?)\s+refers to\s+(.+)$/i);
        if (refersMatch) {
            const subject = refersMatch[1].trim();
            const definition = refersMatch[2].trim().replace(/\.$/, '');
            
            flashcards.push({
                type: 'basic',
                front: `What does ${subject.toLowerCase()} refer to?`,
                back: definition
            });
        }
    }
    
    // If not enough, create simple Q&A from key sentences
    if (flashcards.length < maxCards) {
        const keyPhrases = ['important', 'key', 'main', 'essential', 'primary', 'fundamental'];
        
        for (const sentence of sentences) {
            if (flashcards.length >= maxCards) break;
            
            const lower = sentence.toLowerCase();
            const hasKeyPhrase = keyPhrases.some(p => lower.includes(p));
            
            if (hasKeyPhrase && sentence.length > 50 && sentence.length < 300) {
                // Create a question from the first few words
                const words = sentence.split(' ');
                const questionPart = words.slice(0, Math.min(5, words.length)).join(' ');
                
                flashcards.push({
                    type: 'basic',
                    front: `What is important about: "${questionPart}..."?`,
                    back: sentence
                });
            }
        }
    }
    
    console.log(`✅ Generated ${flashcards.length} basic flashcards`);
    return flashcards;
}

/**
 * Main function: Generate flashcards from extracted text
 */
async function generateFlashCards(extractedText, maxCards = 15) {
    console.log('\n🎴 ========== AI FLASHCARD GENERATION ==========');
    console.log(`📄 Input: ${extractedText.split(/\s+/).length} words`);
    console.log(`🎯 Target: ${maxCards} flashcards`);
    
    const startTime = Date.now();
    
    // Check if AI server is available
    const serverStatus = await checkAIServer();
    console.log(`🤖 AI Server available: ${serverStatus.available ? 'Yes' : 'No'}`);
    console.log(`🎴 Flashcard model loaded: ${serverStatus.flashcardModel ? 'Yes' : 'No'}`);
    
    if (!serverStatus.available || !serverStatus.flashcardModel) {
        console.log('⚠️ Using fallback basic flashcard generator');
        const basicCards = generateBasicFlashcards(extractedText, maxCards);
        console.log(`⏱️ Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
        console.log('🎴 ========== GENERATION COMPLETE ==========\n');
        return basicCards;
    }
    
    // Create diverse chunks
    const chunks = createFlashcardChunks(extractedText);
    
    if (chunks.length === 0) {
        console.log('⚠️ No suitable text chunks found, using fallback');
        return generateBasicFlashcards(extractedText, maxCards);
    }
    
    // Limit chunks to process (process more than needed to account for failures)
    const chunksToProcess = chunks.slice(0, Math.min(chunks.length, maxCards * 4));
    
    console.log(`\n⚙️ Processing ${chunksToProcess.length} chunks...`);
    
    // Generate flashcards in parallel batches
    const allFlashcards = await generateBatch(chunksToProcess, 5);
    
    console.log(`\n📊 Generated ${allFlashcards.length} valid flashcards`);
    
    // Filter unique flashcards
    const uniqueFlashcards = filterUniqueFlashcards(allFlashcards);
    
    console.log(`✅ Unique flashcards: ${uniqueFlashcards.length}`);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ Time: ${elapsed}s`);
    console.log('🎴 ========== GENERATION COMPLETE ==========\n');
    
    // If AI generated too few, supplement with basic ones
    let result = uniqueFlashcards.slice(0, maxCards);
    
    if (result.length < maxCards) {
        console.log(`📝 AI generated ${result.length}, adding basic flashcards to reach ${maxCards}`);
        const basicCards = generateBasicFlashcards(extractedText, maxCards - result.length);
        result = [...result, ...basicCards].slice(0, maxCards);
    }
    
    return result;
}

module.exports = { generateFlashCards, generateBasicFlashcards };
