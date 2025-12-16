/**
 * Vanilla JavaScript Integration Example
 * 
 * Shows how to integrate question detection without React
 */

// Import modules (adjust paths as needed)
import questionDetector from '../questionDetector.js';
import contextualHelp from '../contextualHelp.js';

class ChatBot {
    constructor(apiBaseUrl = 'http://localhost:8001') {
        this.apiBaseUrl = apiBaseUrl;
        this.sessionId = null;
        this.currentStep = 'input_method';
        this.messages = [];

        this.steps = [
            'input_method',
            'project_type',
            'development_scope',
            'currency',
            'technical_rate',
            'non_technical_rate',
            'timeline',
            'budget',
            'resources'
        ];

        this.init();
    }

    async init() {
        // Start chat session
        await this.startSession();

        // Add initial message
        this.addBotMessage('How would you like to provide your requirements?');

        // Setup event listeners
        this.setupEventListeners();
    }

    async startSession() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chat/start`, {
                method: 'POST'
            });
            const data = await response.json();
            this.sessionId = data.session_id;
            console.log('Session started:', this.sessionId);
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('user-input');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userInput = input.value.trim();

            if (!userInput) return;

            // Handle user input
            await this.handleUserInput(userInput);

            // Clear input
            input.value = '';
        });
    }

    async handleUserInput(userInput) {
        // Add user message to UI
        this.addUserMessage(userInput);

        // ===== QUESTION DETECTION LOGIC =====
        // This is the key part that prevents skipping questions

        if (questionDetector.isQuestion(userInput)) {
            // User is asking for clarification
            const questionType = questionDetector.getQuestionType(userInput);
            const helpText = contextualHelp.getHelp(this.currentStep, questionType);

            // Show help
            this.addBotMessage(helpText);

            // Re-ask the current question
            const question = contextualHelp.getStepQuestion(this.currentStep);
            this.addBotMessage(question);

            // DON'T save answer
            // DON'T advance to next step
            console.log('User asked a question, staying on step:', this.currentStep);
            return;
        }

        // ===== ANSWER HANDLING =====
        // User provided an actual answer

        // Save to backend
        await this.saveAnswer(userInput);

        // Advance to next step
        this.advanceStep();
    }

    async saveAnswer(answer) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    step: this.currentStep,
                    answer: answer
                })
            });

            const data = await response.json();
            console.log('Answer saved:', data);
        } catch (error) {
            console.error('Failed to save answer:', error);
            this.addBotMessage('Sorry, there was an error saving your answer.');
        }
    }

    advanceStep() {
        const currentIndex = this.steps.indexOf(this.currentStep);

        if (currentIndex < this.steps.length - 1) {
            // Move to next step
            this.currentStep = this.steps[currentIndex + 1];

            // Ask next question
            const nextQuestion = contextualHelp.getStepQuestion(this.currentStep);
            setTimeout(() => this.addBotMessage(nextQuestion), 500);
        } else {
            // All questions answered
            this.showConfirmation();
        }
    }

    showConfirmation() {
        this.addBotMessage('✅ Great! I have all the information I need.');
        this.addBotMessage('📋 Click "Generate Report" to proceed.');

        // Show generate button
        document.getElementById('generate-btn').style.display = 'block';
    }

    async generateReport() {
        try {
            // Confirm with backend
            await fetch(`${this.apiBaseUrl}/chat/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    confirmed: true
                })
            });

            // Generate report
            const response = await fetch(`${this.apiBaseUrl}/chat/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.addBotMessage(`🎉 Report generated!\n\nDownload: ${data.data.report_url}`);
            } else {
                this.addBotMessage('❌ Failed to generate report.');
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            this.addBotMessage('❌ An error occurred.');
        }
    }

    addBotMessage(text) {
        this.messages.push({ role: 'bot', text });
        this.renderMessage('bot', text);
    }

    addUserMessage(text) {
        this.messages.push({ role: 'user', text });
        this.renderMessage('user', text);
    }

    renderMessage(role, text) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new ChatBot();

    // Setup generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
        chatbot.generateReport();
    });
});

export default ChatBot;
