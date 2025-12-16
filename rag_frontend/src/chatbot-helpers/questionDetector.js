/**
 * Question Detector Module
 * Detects if user input is a clarifying question vs. an answer.
 */

const questionDetector = {
    /**
     * Question patterns that indicate user is asking for clarification
     */
    patterns: [
        // Direct question words
        /^what\s+(is|are|does|do|can|would|should)/i,
        /^why\s/i,
        /^how\s/i,
        /^when\s/i,
        /^where\s/i,
        /^which\s/i,
        /^who\s/i,

        // Suggestions (Strict matching)
        /^(suggest|recommend|advice|idea)/i,
        /^(you|u)\s+(suggest|recommend|advice|idea)/i,
        /\b(give|need|want)\s+.*(suggestion|recommendation|advice|idea)/i,
        /^(create|generate|write|make|give)\s+.*(requirements|features|specs)/i,

        // "Can u" variants
        /can\s+(you|u)\s+/i,
        /could\s+(you|u)\s+/i,
        /would\s+(you|u)\s+/i,

        // Common question phrases
        /what's\s+the/i,
        /can\s+you\s+(explain|tell|clarify|describe)/i,
        /could\s+you\s+(explain|tell|clarify|describe)/i,
        /tell\s+me\s+(about|more)/i,
        /explain\s+/i,

        // Specific chatbot-related questions
        /difference/i,
        /what\s+do\s+you\s+mean/i,
        /don't\s+understand/i,
        /what\s+does\s+that\s+mean/i,
        /i\s+don't\s+know/i,
        /i'm\s+not\s+sure/i,
        /\bhelp\b/i,
        /\binfo\b/i,
        /more\s+details/i,

        // Elaboration & Clarification
        /^(please\s+)?(elaborate|clarify|detail|expand)/i,
        /mean\s+by/i,
        /in\s+what\s+sense/i,

        // Examples & Demonstrations
        /example\s+of/i,
        /instance\s+of/i,
        /sample/i,
        /show\s+me/i,
        /demonstrate/i,

        // Definitions
        /^define\s/i,
        /meaning\s+of/i,
        /definition\s+of/i,

        // Comparisons
        /compare/i,
        /vs\.?/i,
        /versus/i,
        /difference\s+between/i,
        /pros\s+and\s+cons/i,
        /advantages?\s+and\s+disadvantages?/i,

        // Validation & Feedback
        /is\s+(this|it|that)\s+(correct|right|valid|true)/i,
        /am\s+i\s+(right|correct)/i,
        /what\s+do\s+you\s+think/i,
        /opinion\s+on/i,

        // Capabilities & Process
        /what\s+can\s+you\s+do/i,
        /how\s+does\s+it\s+work/i,
        /steps?\s+for/i,
        /procedure\s+for/i,

        // Question mark at the end
        /\?$/
    ],

    /**
     * Check if user input is a question
     * @param {string} input - User's text input
     * @returns {boolean} - True if input appears to be a question
     */
    isQuestion(input) {
        if (!input || typeof input !== 'string') {
            return false;
        }

        const trimmedInput = input.trim();

        // Empty input is not a question
        if (!trimmedInput) {
            return false;
        }

        // Check against all patterns
        return this.patterns.some(pattern => pattern.test(trimmedInput));
    },

    /**
     * Detect specific question types for more targeted help
     * @param {string} input - User's text input
     * @returns {string} - Type of question (difference, explanation, example, general)
     */
    getQuestionType(input) {
        if (!input) return 'general';

        const lower = input.toLowerCase();

        // Difference / Comparison
        if (lower.includes('difference') || lower.includes('vs') || lower.includes('versus') || lower.includes('compare') || lower.includes('pros and cons') || lower.includes('advantage')) {
            return 'difference';
        }

        // Examples
        if (lower.includes('example') || lower.includes('instance') || lower.includes('sample') || lower.includes('show me') || lower.includes('demonstrate')) {
            return 'example';
        }

        // Explanation / Definition / Elaboration
        if (lower.includes('explain') || lower.includes('what does') || lower.includes('what is') || lower.includes('define') || lower.includes('meaning') || lower.includes('elaborate') || lower.includes('clarify') || lower.includes('detail')) {
            return 'explanation';
        }

        // Suggestions (mapped to example for now as it triggers suggestion logic)
        if (lower.includes('suggest') || lower.includes('recommend') || lower.includes('advice') || lower.includes('idea') || lower.includes('give') || lower.includes('create') || lower.includes('generate') || lower.includes('write') || lower.includes('make')) {
            return 'example';
        }

        // Help
        if (lower.includes('help') || lower.includes("don't understand") || lower.includes('not sure') || lower.includes('info')) {
            return 'help';
        }

        return 'general';
    }
};

export default questionDetector;
