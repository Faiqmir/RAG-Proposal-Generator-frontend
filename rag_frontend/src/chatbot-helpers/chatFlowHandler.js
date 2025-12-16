/**
 * Chat Flow Handler Module
 * 
 * Orchestrates the question detection and contextual help flow.
 * Main integration point for your chatbot.
 */

// Import dependencies (adjust paths as needed for your project)
// const questionDetector = require('./questionDetector');
// const contextualHelp = require('./contextualHelp');

const chatFlowHandler = {
    /**
     * Process user input and determine next action
     * @param {string} userInput - The text user entered
     * @param {string} currentStep - Current chatbot step
     * @param {Object} callbacks - Callback functions for different actions
     * @param {Function} callbacks.onQuestion - Called when user asks a question
     * @param {Function} callbacks.onAnswer - Called when user provides an answer
     * @returns {Object} - Action to take { type: 'question' | 'answer', data: {...} }
     */
    processInput(userInput, currentStep, callbacks = {}) {
        // Import modules (handles both Node.js and browser)
        const detector = typeof questionDetector !== 'undefined' ? questionDetector : require('./questionDetector');
        const help = typeof contextualHelp !== 'undefined' ? contextualHelp : require('./contextualHelp');

        // Check if input is a question
        const isQuestion = detector.isQuestion(userInput);

        if (isQuestion) {
            // User is asking for clarification
            const questionType = detector.getQuestionType(userInput);
            const helpText = help.getHelp(currentStep, questionType);
            const reaskQuestion = help.getStepQuestion(currentStep);

            if (callbacks.onQuestion) {
                callbacks.onQuestion({
                    helpText,
                    reaskQuestion,
                    questionType
                });
            }

            return {
                type: 'question',
                helpText,
                reaskQuestion,
                questionType,
                shouldAdvance: false,
                shouldSave: false
            };
        } else {
            // User provided an answer
            if (callbacks.onAnswer) {
                callbacks.onAnswer({
                    answer: userInput,
                    step: currentStep
                });
            }

            return {
                type: 'answer',
                answer: userInput,
                step: currentStep,
                shouldAdvance: true,
                shouldSave: true
            };
        }
    },

    /**
     * Simple helper to handle the complete flow
     * @param {string} userInput - User's text input
     * @param {string} currentStep - Current chatbot step
     * @param {Function} addBotMessage - Function to add bot message to UI
     * @param {Function} saveAndAdvance - Function to save answer and move to next step
     */
    async handleUserMessage(userInput, currentStep, addBotMessage, saveAndAdvance) {
        const result = this.processInput(userInput, currentStep);

        if (result.type === 'question') {
            // Show help and re-ask question
            await addBotMessage(result.helpText);
            await addBotMessage(result.reaskQuestion);
            // Don't advance to next step
            return {
                action: 'helped',
                advanced: false
            };
        } else {
            // Save answer and advance
            await saveAndAdvance(result.answer, result.step);
            return {
                action: 'answered',
                advanced: true,
                answer: result.answer
            };
        }
    }
};

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = chatFlowHandler;
}
