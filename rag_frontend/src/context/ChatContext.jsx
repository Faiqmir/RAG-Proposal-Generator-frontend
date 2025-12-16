import { createContext, useContext, useState, useCallback } from 'react'
import { STEPS, getBotMessage, getNextStep, validateResponse } from '../services/chatService'
import questionDetector from '../chatbot-helpers/questionDetector'
import contextualHelp from '../chatbot-helpers/contextualHelp'
import timelineParser from '../utils/timelineParser'
import budgetParser from '../utils/budgetParser'
import navigationHandler from '../chatbot-helpers/navigationHandler'

const ChatContext = createContext(null)

export const useChatContext = () => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider')
    }
    return context
}

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: getBotMessage(STEPS.GREETING),
            timestamp: new Date()
        }
    ])

    const [currentStep, setCurrentStep] = useState(STEPS.PROJECT_TYPE)
    const [userData, setUserData] = useState({
        projectType: null,
        inputMode: null,
        file: null,
        textContent: null,
        currency: null,
        developmentScope: null,
        technicalRate: null,
        nonTechnicalRate: null,
        timeline: null,
        budget: null,
        resources: null
    })

    const [returnStep, setReturnStep] = useState(null)
    const [suggestedRequirements, setSuggestedRequirements] = useState(null)

    const [isTyping, setIsTyping] = useState(false)
    const [error, setError] = useState(null)

    /**
     * Add a message to the chat
     */
    const addMessage = useCallback((type, content, metadata = {}) => {
        const newMessage = {
            id: Date.now(),
            type,
            content,
            timestamp: new Date(),
            ...metadata
        }

        setMessages(prev => [...prev, newMessage])
        return newMessage
    }, [])

    /**
     * Simulate bot typing and add bot message
     */
    const addBotMessage = useCallback((content, metadata = {}) => {
        setIsTyping(true)

        setTimeout(() => {
            addMessage('bot', content, metadata)
            setIsTyping(false)
        }, 800) // Simulate typing delay
    }, [addMessage])

    /**
     * Handle user response with question detection
     */
    const handleUserResponse = useCallback((response, responseType = 'text') => {
        setError(null)

        // ===== NAVIGATION / COMMANDS =====
        // Check for navigation commands (e.g., "change currency", "restart")
        if (responseType === 'text') {
            const navigation = navigationHandler.detectNavigation(response)
            if (navigation) {
                // Handle Reset
                if (navigation.action === 'reset') {
                    addMessage('user', response)
                    setTimeout(() => {
                        setMessages([
                            {
                                id: 1,
                                type: 'bot',
                                content: getBotMessage(STEPS.GREETING),
                                timestamp: new Date()
                            }
                        ])
                        setCurrentStep(STEPS.PROJECT_TYPE)
                        setUserData({
                            projectType: null,
                            inputMode: null,
                            file: null,
                            textContent: null,
                            currency: null,
                            developmentScope: null,
                            technicalRate: null,
                            nonTechnicalRate: null,
                            timeline: null,
                            budget: null,
                            resources: null
                        })
                    }, 500)
                    return true
                }

                // Handle Step Jump
                if (navigation.step) {
                    addMessage('user', response)
                    addBotMessage(navigation.message)

                    // Save current step to return to later
                    if (currentStep !== navigation.step) {
                        setReturnStep(currentStep)
                    }

                    // Jump to step after delay
                    setTimeout(() => {
                        setCurrentStep(navigation.step)
                        // Also show the question for that step
                        const question = getBotMessage(navigation.step, userData)
                        addBotMessage(question)
                    }, 1000)

                    return true
                }
            }
        }

        // Check if user is responding to a suggestion offer
        if (suggestedRequirements && responseType === 'text') {
            const lowerResp = response.toLowerCase();
            if (lowerResp.includes('yes') || lowerResp.includes('use') || lowerResp.includes('sure') || lowerResp.includes('ok') || lowerResp.includes('apply')) {
                // Apply suggestion
                addMessage('user', response);

                const updatedUserData = { ...userData };
                updatedUserData.textContent = suggestedRequirements;
                updatedUserData.inputMode = 'text';
                setUserData(updatedUserData);

                setTimeout(() => {
                    addBotMessage("✅ Great! I've applied those requirements.");
                    setCurrentStep(STEPS.CURRENCY);
                    setSuggestedRequirements(null);

                    // Ask currency question
                    setTimeout(() => {
                        const currencyMsg = getBotMessage(STEPS.CURRENCY, updatedUserData);
                        addBotMessage(currencyMsg);
                    }, 500);
                }, 500);

                return true;
            } else if (lowerResp.includes('no') || lowerResp.includes('don\'t')) {
                setSuggestedRequirements(null);
            }
        }

        // ===== QUESTION DETECTION =====
        // Check if user is asking a question instead of providing an answer
        if (responseType === 'text' && questionDetector.isQuestion(response)) {
            // Add user message
            addMessage('user', response)

            // Get question type and provide contextual help
            const questionType = questionDetector.getQuestionType(response)

            // Map current step to help step name
            const helpStepMap = {
                [STEPS.PROJECT_TYPE]: 'project_type',
                [STEPS.INPUT_METHOD]: 'input_method',
                [STEPS.FILE_UPLOAD]: 'input_method',
                [STEPS.TEXT_INPUT]: 'input_method',
                [STEPS.CURRENCY]: 'currency',
                [STEPS.DEVELOPMENT_SCOPE]: 'development_scope',
                [STEPS.TECHNICAL_RATE]: 'technical_rate',
                [STEPS.NON_TECHNICAL_RATE]: 'non_technical_rate',
                [STEPS.TIMELINE]: 'timeline',
                [STEPS.BUDGET]: 'budget',
                [STEPS.RESOURCES]: 'resources'
            }

            const helpStep = helpStepMap[currentStep] || currentStep

            // Check for specific suggestion first
            const suggestion = contextualHelp.getSuggestion(response);
            if (suggestion) {
                setSuggestedRequirements(suggestion);
                const msg = suggestion + "\n\n**Would you like to use these requirements?** (Type 'Yes' or 'Use these')";
                addBotMessage(msg);
                return true;
            }

            const helpText = contextualHelp.getHelp(helpStep, questionType, response)

            // Show help message
            addBotMessage(helpText)

            // Re-ask the question
            const reaskQuestion = getBotMessage(currentStep, userData)
            setTimeout(() => {
                addBotMessage(reaskQuestion)
            }, 1600) // After help message appears

            // Don't advance to next step
            return true
        }

        // ===== NORMAL ANSWER HANDLING =====
        // Validate response
        const validation = validateResponse(currentStep, response)
        if (!validation.valid) {
            setError(validation.error)
            return false
        }

        // Add user message to chat
        let userMessageContent = response
        if (responseType === 'file') {
            userMessageContent = `📄 ${response.name}`
        }
        addMessage('user', userMessageContent)

        // Update user data based on current step
        const updatedUserData = { ...userData }

        switch (currentStep) {
            case STEPS.PROJECT_TYPE:
                updatedUserData.projectType = response
                break
            case STEPS.INPUT_METHOD:
                updatedUserData.inputMode = response
                break
            case STEPS.FILE_UPLOAD:
                updatedUserData.file = response
                break
            case STEPS.TEXT_INPUT:
                updatedUserData.textContent = response
                break
            case STEPS.CURRENCY:
                updatedUserData.currency = response
                break
            case STEPS.DEVELOPMENT_SCOPE:
                updatedUserData.developmentScope = response
                break
            case STEPS.TECHNICAL_RATE:
                // Parse rate amount (handles "$50", "50 dollars", etc.)
                const techRate = budgetParser.parseAmount(response)
                updatedUserData.technicalRate = techRate

                // Check for currency mismatch
                const mentionedCurrencyTech = budgetParser.detectMentionedCurrency(response)
                if (mentionedCurrencyTech && mentionedCurrencyTech !== updatedUserData.currency) {
                    const convertedRate = budgetParser.convertCurrency(
                        techRate,
                        mentionedCurrencyTech,
                        updatedUserData.currency
                    )
                    updatedUserData.technicalRate = convertedRate
                    const warning = budgetParser.getCurrencyMismatchWarning(
                        mentionedCurrencyTech,
                        updatedUserData.currency,
                        techRate,
                        convertedRate
                    )
                    if (warning) {
                        setTimeout(() => addMessage('bot', warning), 500)
                    }
                }
                break
            case STEPS.NON_TECHNICAL_RATE:
                // Parse rate amount (handles "$50", "50 dollars", etc.)
                const nonTechRate = budgetParser.parseAmount(response)
                updatedUserData.nonTechnicalRate = nonTechRate

                // Check for currency mismatch
                const mentionedCurrencyNonTech = budgetParser.detectMentionedCurrency(response)
                if (mentionedCurrencyNonTech && mentionedCurrencyNonTech !== updatedUserData.currency) {
                    const convertedRate = budgetParser.convertCurrency(
                        nonTechRate,
                        mentionedCurrencyNonTech,
                        updatedUserData.currency
                    )
                    updatedUserData.nonTechnicalRate = convertedRate
                    const warning = budgetParser.getCurrencyMismatchWarning(
                        mentionedCurrencyNonTech,
                        updatedUserData.currency,
                        nonTechRate,
                        convertedRate
                    )
                    if (warning) {
                        setTimeout(() => addMessage('bot', warning), 500)
                    }
                }
                break
            case STEPS.TIMELINE:
                // Parse timeline and convert to weeks
                const weeks = timelineParser.parseToWeeks(response)
                updatedUserData.timeline = weeks

                // If converted from months/years, show confirmation
                if (weeks && response.toLowerCase().includes('month') || response.toLowerCase().includes('year')) {
                    const conversionMsg = timelineParser.getConversionMessage(response, weeks)
                    // Add a quick confirmation message
                    setTimeout(() => {
                        addMessage('bot', conversionMsg)
                    }, 500)
                }
                break
            case STEPS.BUDGET:
                // Parse budget amount from text (handles "$50", "50 dollars", "Rs 1000", etc.)
                const budgetAmount = budgetParser.parseAmount(response)
                updatedUserData.budget = budgetAmount

                // Check if user mentioned a different currency than selected
                const mentionedCurrency = budgetParser.detectMentionedCurrency(response)
                if (mentionedCurrency && mentionedCurrency !== updatedUserData.currency) {
                    // Convert the amount
                    const convertedAmount = budgetParser.convertCurrency(
                        budgetAmount,
                        mentionedCurrency,
                        updatedUserData.currency
                    )

                    // Update the budget with converted amount
                    updatedUserData.budget = convertedAmount

                    // Show conversion message
                    const warning = budgetParser.getCurrencyMismatchWarning(
                        mentionedCurrency,
                        updatedUserData.currency,
                        budgetAmount,
                        convertedAmount
                    )

                    if (warning) {
                        setTimeout(() => {
                            addMessage('bot', warning)
                        }, 500)
                    }
                }
                break
            case STEPS.RESOURCES:
                updatedUserData.resources = response === 'skip' ? null : response
                break
        }

        setUserData(updatedUserData)

        // Check if we need to return to a previous step
        if (returnStep) {
            // Add a small delay for natural flow
            setTimeout(() => {
                setCurrentStep(returnStep)
                const returnMsg = getBotMessage(returnStep, updatedUserData)
                addBotMessage(`Updated! Let's continue where we left off:\n\n${returnMsg}`)
                setReturnStep(null)
            }, 500)
            return true
        }

        // Move to next step
        const nextStep = getNextStep(currentStep, updatedUserData)
        setCurrentStep(nextStep)

        // Add bot response for next step
        const botMessage = getBotMessage(nextStep, updatedUserData)
        addBotMessage(botMessage)

        return true
    }, [currentStep, userData, returnStep, suggestedRequirements, addMessage, addBotMessage])

    /**
     * Reset conversation
     */
    const resetChat = useCallback(() => {
        setMessages([
            {
                id: 1,
                type: 'bot',
                content: getBotMessage(STEPS.GREETING),
                timestamp: new Date()
            }
        ])
        setCurrentStep(STEPS.PROJECT_TYPE)
        setUserData({
            projectType: null,
            inputMode: null,
            file: null,
            textContent: null,
            currency: null,
            developmentScope: null,
            technicalRate: null,
            nonTechnicalRate: null,
            timeline: null,
            budget: null,
            resources: null
        })
        setIsTyping(false)
        setError(null)
    }, [])

    /**
     * Move to generating step
     */
    const startGenerating = useCallback(() => {
        setCurrentStep(STEPS.GENERATING)
        addBotMessage(getBotMessage(STEPS.GENERATING))
    }, [addBotMessage])

    const value = {
        messages,
        currentStep,
        userData,
        isTyping,
        error,
        addMessage,
        addBotMessage,
        handleUserResponse,
        resetChat,
        startGenerating,
        setCurrentStep
    }

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
