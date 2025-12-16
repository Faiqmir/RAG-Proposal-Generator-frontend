/**
 * Timeline Parser Utility
 * Converts timeline inputs from various formats (months, years) to weeks
 */

const timelineParser = {
    /**
     * Parse timeline string and convert to weeks
     * @param {string} input - User input like "1 month", "2 years", "12 weeks"
     * @returns {number|null} - Number of weeks, or null if invalid/skip
     */
    parseToWeeks(input) {
        if (!input || typeof input !== 'string') {
            return null;
        }

        const trimmed = input.trim().toLowerCase();

        // Handle skip
        if (trimmed === 'skip' || trimmed === 'no' || trimmed === 'none') {
            return null;
        }

        // Extract number and unit
        const monthPattern = /(\d+\.?\d*)\s*(month|months|mon|mo|m)/i;
        const yearPattern = /(\d+\.?\d*)\s*(year|years|yr|y)/i;
        const weekPattern = /(\d+\.?\d*)\s*(week|weeks|wk|w)/i;

        let weeks = null;

        // Check for months
        const monthMatch = trimmed.match(monthPattern);
        if (monthMatch) {
            const months = parseFloat(monthMatch[1]);
            weeks = Math.round(months * 4); // 1 month ≈ 4 weeks
            return weeks;
        }

        // Check for years
        const yearMatch = trimmed.match(yearPattern);
        if (yearMatch) {
            const years = parseFloat(yearMatch[1]);
            weeks = Math.round(years * 52); // 1 year = 52 weeks
            return weeks;
        }

        // Check for weeks
        const weekMatch = trimmed.match(weekPattern);
        if (weekMatch) {
            weeks = Math.round(parseFloat(weekMatch[1]));
            return weeks;
        }

        // If just a number, assume weeks
        const numberMatch = trimmed.match(/^(\d+\.?\d*)$/);
        if (numberMatch) {
            weeks = Math.round(parseFloat(numberMatch[1]));
            return weeks;
        }

        // Couldn't parse
        return null;
    },

    /**
     * Get a human-readable conversion message
     * @param {string} input - Original input
     * @param {number} weeks - Converted weeks
     * @returns {string} - Confirmation message
     */
    getConversionMessage(input, weeks) {
        const trimmed = input.trim().toLowerCase();

        if (trimmed.includes('month')) {
            const months = parseFloat(trimmed.match(/(\d+\.?\d*)/)[1]);
            return `Got it! ${months} month${months !== 1 ? 's' : ''} = ${weeks} weeks`;
        }

        if (trimmed.includes('year')) {
            const years = parseFloat(trimmed.match(/(\d+\.?\d*)/)[1]);
            return `Got it! ${years} year${years !== 1 ? 's' : ''} = ${weeks} weeks`;
        }

        return `Timeline set to ${weeks} weeks`;
    }
};

export default timelineParser;
