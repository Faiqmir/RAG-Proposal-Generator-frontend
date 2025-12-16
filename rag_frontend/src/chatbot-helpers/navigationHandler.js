/**
 * Navigation Handler Module
 * Detects user intents to change settings or navigate the flow.
 */

import { STEPS } from '../services/chatService';

const navigationHandler = {
    /**
     * Detect if user wants to navigate/change a setting
     * @param {string} input - User input
     * @returns {Object|null} - Navigation target { step, message } or null
     */
    detectNavigation(input) {
        if (!input || typeof input !== 'string') return null;

        const lower = input.toLowerCase().trim();

        // Check for "change" or "update" or "modify" commands
        // Include common typos like "chanage", "chnage", "cahnge"
        const changeKeywords = ['change', 'update', 'modify', 'edit', 'wrong', 'chanage', 'chnage', 'cahnge', 'correct'];
        const hasChangeIntent = changeKeywords.some(keyword => lower.includes(keyword));

        if (hasChangeIntent) {

            // Currency
            if (lower.includes('currency') || lower.includes('money') || lower.includes('pkr') || lower.includes('usd') || lower.includes('eur')) {
                return {
                    step: STEPS.CURRENCY,
                    message: "Sure, let's update the currency."
                };
            }

            // Timeline
            if (lower.includes('timeline') || lower.includes('time') || lower.includes('duration') || lower.includes('how long') || lower.includes('weeks') || lower.includes('months')) {
                return {
                    step: STEPS.TIMELINE,
                    message: "Okay, let's adjust the timeline."
                };
            }

            // Budget
            if (lower.includes('budget') || lower.includes('cost') || lower.includes('price') || lower.includes('amount')) {
                return {
                    step: STEPS.BUDGET,
                    message: "No problem, let's update the budget."
                };
            }

            // Project Type
            if (lower.includes('project type') || lower.includes('type of project') || lower.includes('app type')) {
                return {
                    step: STEPS.PROJECT_TYPE,
                    message: "Alright, let's change the project type."
                };
            }

            // Development Scope (Team Location)
            if (lower.includes('scope') || lower.includes('location') || lower.includes('local') || lower.includes('international') || lower.includes('team location')) {
                return {
                    step: STEPS.DEVELOPMENT_SCOPE,
                    message: "Okay, let's update the development scope."
                };
            }

            // Resources (Team Size)
            if (lower.includes('resource') || lower.includes('team size') || lower.includes('how many people') || lower.includes('developers')) {
                return {
                    step: STEPS.RESOURCES,
                    message: "Sure, let's update the team size."
                };
            }

            // Technical Rate
            if (lower.includes('tech rate') || lower.includes('technical rate') || lower.includes('developer rate')) {
                return {
                    step: STEPS.TECHNICAL_RATE,
                    message: "Okay, let's update the technical hourly rate."
                };
            }

            // Non-Technical Rate
            if (lower.includes('non-tech') || lower.includes('manager rate') || lower.includes('management rate')) {
                return {
                    step: STEPS.NON_TECHNICAL_RATE,
                    message: "Okay, let's update the non-technical hourly rate."
                };
            }

            // Requirements / Input Method
            if (lower.includes('requirement') || lower.includes('input') || lower.includes('file') || lower.includes('upload')) {
                return {
                    step: STEPS.INPUT_METHOD,
                    message: "Let's update how you provide requirements."
                };
            }
        }

        // Restart / Reset
        if (lower === 'restart' || lower === 'start over' || lower === 'reset') {
            return {
                action: 'reset',
                message: "Starting over..."
            };
        }

        return null;
    }
};

export default navigationHandler;
