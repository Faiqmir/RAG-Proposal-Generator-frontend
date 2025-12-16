/**
 * Budget Parser Utility
 * Extracts numeric budget amounts from text, handling various currency formats
 */

const budgetParser = {
    /**
     * Parse budget string and extract the numeric amount
     * @param {string} input - User input like "50 dollars", "$1000", "Rs 50000"
     * @returns {number|null} - Numeric amount, or null if invalid/skip
     */
    parseAmount(input) {
        if (!input || typeof input !== 'string') {
            return null;
        }

        const trimmed = input.trim().toLowerCase();

        // Handle skip
        if (trimmed === 'skip' || trimmed === 'no' || trimmed === 'none' || trimmed === 'flexible') {
            return null;
        }

        // Remove common currency symbols and words
        let cleaned = trimmed
            .replace(/\$/g, '')           // Remove $
            .replace(/₹/g, '')            // Remove ₹
            .replace(/€/g, '')            // Remove €
            .replace(/£/g, '')            // Remove £
            .replace(/rs\.?/gi, '')       // Remove Rs or Rs.
            .replace(/pkr/gi, '')         // Remove PKR
            .replace(/usd/gi, '')         // Remove USD
            .replace(/eur/gi, '')         // Remove EUR
            .replace(/gbp/gi, '')         // Remove GBP
            .replace(/dollars?/gi, '')    // Remove dollar/dollars
            .replace(/rupees?/gi, '')     // Remove rupee/rupees
            .replace(/euros?/gi, '')      // Remove euro/euros
            .replace(/pounds?/gi, '')     // Remove pound/pounds
            .replace(/,/g, '')            // Remove commas (e.g., 1,000)
            .trim();

        // Extract the first number found
        const numberMatch = cleaned.match(/(\d+\.?\d*)/);
        if (numberMatch) {
            const amount = parseFloat(numberMatch[1]);
            return isNaN(amount) ? null : amount;
        }

        return null;
    },

    /**
     * Detect if user mentioned a currency in their input
     * @param {string} input - User input
     * @returns {string|null} - Currency code mentioned (USD, PKR, EUR, GBP) or null
     */
    detectMentionedCurrency(input) {
        if (!input) return null;

        const lower = input.toLowerCase();

        if (lower.includes('$') || lower.includes('dollar')) return 'USD';
        if (lower.includes('₹') || lower.includes('rs') || lower.includes('rupee') || lower.includes('pkr')) return 'PKR';
        if (lower.includes('€') || lower.includes('euro') || lower.includes('eur')) return 'EUR';
        if (lower.includes('£') || lower.includes('pound') || lower.includes('gbp')) return 'GBP';

        return null;
    },

    /**
     * Exchange rates (approximate) - Base: PKR
     */
    rates: {
        USD: 278,
        EUR: 300,
        GBP: 350,
        PKR: 1
    },

    /**
     * Convert amount from one currency to another
     * @param {number} amount - Amount to convert
     * @param {string} fromCurrency - Currency code to convert from
     * @param {string} toCurrency - Currency code to convert to
     * @returns {number} - Converted amount
     */
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (!amount || !fromCurrency || !toCurrency) return amount;

        // Normalize codes
        const from = fromCurrency.toUpperCase();
        const to = toCurrency.toUpperCase();

        if (from === to) return amount;

        // Convert to PKR first (Base)
        const pkrAmount = from === 'PKR' ? amount : amount * (this.rates[from] || 1);

        // Convert from PKR to target
        const finalAmount = to === 'PKR' ? pkrAmount : pkrAmount / (this.rates[to] || 1);

        return Math.round(finalAmount);
    },

    /**
     * Get a warning message if user mentioned different currency
     * @param {string} mentionedCurrency - Currency user mentioned
     * @param {string} selectedCurrency - Currency user selected earlier
     * @param {number} amount - The amount extracted
     * @param {number} convertedAmount - The converted amount
     * @returns {string|null} - Warning message or null
     */
    getCurrencyMismatchWarning(mentionedCurrency, selectedCurrency, amount, convertedAmount) {
        if (!mentionedCurrency || !selectedCurrency || mentionedCurrency === selectedCurrency) {
            return null;
        }

        return `I noticed you mentioned ${mentionedCurrency}. I've automatically converted ${amount} ${mentionedCurrency} to ${convertedAmount} ${selectedCurrency} for you.`;
    }
};

export default budgetParser;
