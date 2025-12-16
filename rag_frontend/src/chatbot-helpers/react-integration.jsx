/**
 * React Integration Example
 * 
 * Shows how to integrate question detection into a React chatbot component
 */

import React, { useState, useEffect } from 'react';
import chatFlowHandler from '../chatFlowHandler';

const API_BASE_URL = 'http://localhost:8001';

function ChatBotWithQuestionDetection() {
    const [sessionId, setSessionId] = useState(null);
    const [currentStep, setCurrentStep] = useState('input_method');
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Chat flow configuration
    const steps = [
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

    // Initialize chat session
    useEffect(() => {
        const initSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/chat/start`, {
                    method: 'POST'
                });
                const data = await response.json();
                setSessionId(data.session_id);

                // Add initial message
                addBotMessage('How would you like to provide your requirements?');
            } catch (error) {
                console.error('Failed to start session:', error);
            }
        };

        initSession();
    }, []);

    // Add bot message to UI
    const addBotMessage = (text) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'bot',
            text,
            timestamp: new Date()
        }]);
    };

    // Add user message to UI
    const addUserMessage = (text) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'user',
            text,
            timestamp: new Date()
        }]);
    };

    // Save answer to backend and advance to next step
    const saveAndAdvance = async (answer, step) => {
        try {
            // Save to backend
            await fetch(`${API_BASE_URL}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    step: step,
                    answer: answer
                })
            });

            // Move to next step
            const currentIndex = steps.indexOf(step);
            if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1];
                setCurrentStep(nextStep);

                // Ask next question
                const nextQuestion = getNextQuestion(nextStep);
                setTimeout(() => addBotMessage(nextQuestion), 500);
            } else {
                // All questions answered - show confirmation
                showConfirmation();
            }
        } catch (error) {
            console.error('Failed to save answer:', error);
            addBotMessage('Sorry, there was an error saving your answer. Please try again.');
        }
    };

    // Handle user input submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userInput.trim()) return;

        // Add user message to UI
        addUserMessage(userInput);

        // Clear input
        const input = userInput;
        setUserInput('');

        // Process with chat flow handler
        const result = await chatFlowHandler.handleUserMessage(
            input,
            currentStep,
            addBotMessage,
            saveAndAdvance
        );

        // Log result for debugging
        console.log('Chat flow result:', result);
    };

    // Show confirmation dialog
    const showConfirmation = () => {
        addBotMessage('✅ Great! I have all the information I need.\n\n📋 Review your answers, then click "Generate Report" to proceed.');
        setCurrentStep('confirmation');
    };

    // Generate report
    const handleGenerateReport = async () => {
        try {
            setIsGenerating(true);

            // Confirm with backend
            await fetch(`${API_BASE_URL}/chat/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    confirmed: true
                })
            });

            // Generate report
            const response = await fetch(`${API_BASE_URL}/chat/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId
                })
            });

            const data = await response.json();

            if (data.success) {
                addBotMessage(`🎉 Report generated successfully!\n\n📄 [Download Report](${data.data.report_url})`);
            } else {
                addBotMessage('❌ Failed to generate report. Please try again.');
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            addBotMessage('❌ An error occurred. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Get question text for a step
    const getNextQuestion = (step) => {
        const questions = {
            input_method: 'How would you like to provide your requirements?',
            project_type: 'What type of project is this?',
            development_scope: 'Will this project be developed by a local team or an international team?',
            currency: 'What currency would you like to use?',
            technical_rate: 'What is the hourly rate for technical resources (developers, engineers)?',
            non_technical_rate: 'What is the hourly rate for non-technical resources (PM, BA, designers)?',
            timeline: 'What is your preferred timeline (in weeks)?',
            budget: 'Do you have a fixed budget? (Enter amount or "skip")',
            resources: 'How many resources do you need?'
        };
        return questions[step] || 'Please provide your answer:';
    };

    return (
        <div className="chatbot-container">
            <div className="chat-header">
                <h2>💬 DevGate Report Generator</h2>
                <p>Let's create your project report together</p>
            </div>

            <div className="messages-container">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.role}`}>
                        <div className="message-content">{msg.text}</div>
                        <div className="message-time">
                            {msg.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>

            {currentStep !== 'confirmation' ? (
                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your answer or question..."
                        disabled={isGenerating}
                    />
                    <button type="submit" disabled={isGenerating}>
                        Send
                    </button>
                </form>
            ) : (
                <div className="confirmation-actions">
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="generate-btn"
                    >
                        {isGenerating ? 'Generating...' : '✨ Generate Report'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatBotWithQuestionDetection;
