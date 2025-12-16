/**
 * Chat Service - Manages chatbot conversation flow and logic
 */

// Conversation steps
export const STEPS = {
    GREETING: 'greeting',
    PROJECT_TYPE: 'project_type',
    INPUT_METHOD: 'input_method',
    FILE_UPLOAD: 'file_upload',
    TEXT_INPUT: 'text_input',
    CURRENCY: 'currency',
    DEVELOPMENT_SCOPE: 'development_scope',
    TECHNICAL_RATE: 'technical_rate',
    NON_TECHNICAL_RATE: 'non_technical_rate',
    TIMELINE: 'timeline',
    BUDGET: 'budget',
    RESOURCES: 'resources',
    CONFIRMATION: 'confirmation',
    GENERATING: 'generating',
    COMPLETE: 'complete'
}

// Project type options
export const PROJECT_TYPES = [
    { value: 'web_app', label: '🌐 Web App' },
    { value: 'android_app', label: '🤖 Android App' },
    { value: 'ios_app', label: '📱 iOS App' },
    { value: 'backend_api', label: '⚙️ Backend API' },
    { value: 'desktop_app', label: '💻 Desktop App' },
    { value: 'data_pipeline', label: '📊 Data Pipeline' }
]

// Currency options
export const CURRENCIES = [
    { value: 'PKR', label: 'PKR (Pakistani Rupee)' },
    { value: 'USD', label: 'USD (US Dollar)' },
    { value: 'EUR', label: 'EUR (Euro)' }
]

// Development scope options
export const DEVELOPMENT_SCOPES = [
    { value: 'local', label: '🏠 Local Team' },
    { value: 'international', label: '🌍 International Team' }
]

/**
 * Get bot message for current step
 * @param {string} step - Current conversation step
 * @param {Object} userData - Collected user data
 * @returns {string} - Bot message
 */
export const getBotMessage = (step, userData = {}) => {
    const messages = {
        [STEPS.GREETING]: "Hello! 👋 I'm here to help you generate a comprehensive project report. Let's start by understanding what you're building. What type of project are you working on?",

        [STEPS.INPUT_METHOD]: `Great! You're building a ${getProjectTypeLabel(userData.projectType)}. How would you like to provide the project requirements?`,

        [STEPS.FILE_UPLOAD]: "Perfect! Please upload your requirements document (PDF or TXT file).",

        [STEPS.TEXT_INPUT]: "Great! Please describe your project requirements in detail. Include features, functionalities, and any specific requirements you have in mind.",

        [STEPS.CURRENCY]: "Now let's set up the project settings. Which currency would you like to use for cost estimation?",

        [STEPS.DEVELOPMENT_SCOPE]: "Will this project be developed by a local team or an international team?",

        [STEPS.TECHNICAL_RATE]: `What is the hourly rate for technical resources (developers, engineers) in ${userData.currency}?`,

        [STEPS.NON_TECHNICAL_RATE]: `What is the hourly rate for non-technical resources (designers, project managers) in ${userData.currency}?`,

        [STEPS.TIMELINE]: "Do you have a specific timeline in mind? (Optional - enter the number of weeks, or 'skip' to let AI generate it)",

        [STEPS.BUDGET]: "Do you have a fixed budget for this project? (Optional - enter the amount, or 'skip' to let AI generate it)",

        [STEPS.RESOURCES]: "How many resources do you need for this project? (Optional - enter the number, or 'skip' to let AI generate it)",

        [STEPS.CONFIRMATION]: generateConfirmationMessage(userData),

        [STEPS.GENERATING]: "Perfect! I'm generating your comprehensive report now. This may take a few moments... ⚙️",

        [STEPS.COMPLETE]: "Your report has been generated successfully! 🎉"
    }

    return messages[step] || "I'm not sure what to ask next. Let me help you."
}

/**
 * Get quick reply options for current step
 * @param {string} step - Current conversation step
 * @returns {Array} - Array of quick reply options
 */
export const getQuickReplies = (step) => {
    const replies = {
        [STEPS.PROJECT_TYPE]: PROJECT_TYPES,

        [STEPS.INPUT_METHOD]: [
            { value: 'file', label: '📄 Upload File' },
            { value: 'text', label: '✍️ Enter Text' }
        ],

        [STEPS.CURRENCY]: CURRENCIES,

        [STEPS.DEVELOPMENT_SCOPE]: DEVELOPMENT_SCOPES,

        [STEPS.TIMELINE]: [
            { value: 'skip', label: 'Skip ⏭️' }
        ],

        [STEPS.BUDGET]: [
            { value: 'skip', label: 'Skip ⏭️' }
        ],

        [STEPS.RESOURCES]: [
            { value: 'skip', label: 'Skip ⏭️' }
        ],

        [STEPS.CONFIRMATION]: [
            { value: 'confirm', label: '✅ Generate Report' },
            { value: 'restart', label: '🔄 Start Over' }
        ]
    }

    return replies[step] || []
}

/**
 * Get next step based on current step and user response
 * @param {string} currentStep - Current step
 * @param {Object} userData - User data collection
 * @returns {string} - Next step
 */
export const getNextStep = (currentStep, userData) => {
    const stepFlow = {
        [STEPS.GREETING]: STEPS.PROJECT_TYPE,
        [STEPS.PROJECT_TYPE]: STEPS.INPUT_METHOD,
        [STEPS.INPUT_METHOD]: userData.inputMode === 'file' ? STEPS.FILE_UPLOAD : STEPS.TEXT_INPUT,
        [STEPS.FILE_UPLOAD]: STEPS.CURRENCY,
        [STEPS.TEXT_INPUT]: STEPS.CURRENCY,
        [STEPS.CURRENCY]: STEPS.DEVELOPMENT_SCOPE,
        [STEPS.DEVELOPMENT_SCOPE]: STEPS.TECHNICAL_RATE,
        [STEPS.TECHNICAL_RATE]: STEPS.NON_TECHNICAL_RATE,
        [STEPS.NON_TECHNICAL_RATE]: STEPS.TIMELINE,
        [STEPS.TIMELINE]: STEPS.BUDGET,
        [STEPS.BUDGET]: STEPS.RESOURCES,
        [STEPS.RESOURCES]: STEPS.CONFIRMATION,
        [STEPS.CONFIRMATION]: STEPS.GENERATING,
        [STEPS.GENERATING]: STEPS.COMPLETE
    }

    return stepFlow[currentStep] || STEPS.GREETING
}

/**
 * Validate user response for current step
 * @param {string} step - Current step
 * @param {any} response - User response
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateResponse = (step, response) => {
    switch (step) {
        case STEPS.PROJECT_TYPE:
            // Accept any project type value (for custom text input)
            if (!response || (typeof response === 'string' && !response.trim())) {
                return { valid: false, error: 'Please provide a project type' }
            }
            break

        case STEPS.INPUT_METHOD:
            // Accept 'file', 'text', or any custom response
            if (!response || (typeof response === 'string' && !response.trim())) {
                return { valid: false, error: 'Please specify how you want to provide requirements' }
            }
            break

        case STEPS.FILE_UPLOAD:
            if (!response) {
                return { valid: false, error: 'Please upload a file' }
            }
            break

        case STEPS.TEXT_INPUT:
            if (!response || !response.trim()) {
                return { valid: false, error: 'Please enter your project requirements' }
            }
            break

        case STEPS.CURRENCY:
            // Accept any currency value (for custom text input)
            if (!response || (typeof response === 'string' && !response.trim())) {
                return { valid: false, error: 'Please specify a currency' }
            }
            break

        case STEPS.DEVELOPMENT_SCOPE:
            // Accept any scope value (for custom text input)
            if (!response || (typeof response === 'string' && !response.trim())) {
                return { valid: false, error: 'Please specify the development scope' }
            }
            break

        case STEPS.TECHNICAL_RATE:
        case STEPS.NON_TECHNICAL_RATE:
            if (!response || (typeof response === 'string' && !response.trim())) {
                return { valid: false, error: 'Please enter a hourly rate' }
            }
            // Allow numbers or text responses
            break

        case STEPS.TIMELINE:
        case STEPS.BUDGET:
        case STEPS.RESOURCES:
            // Optional fields - accept skip or any value
            if (response && typeof response === 'string' && response.trim() === '') {
                return { valid: false, error: 'Please enter a value or type "skip"' }
            }
            break

        case STEPS.CONFIRMATION:
            const lower = response.toLowerCase();
            const affirmative = ['yes', 'yeah', 'yep', 'ok', 'okay', 'sure', 'generate', 'proceed', 'go', 'confirm', 'right', 'correct', 'fine', 'good'];
            const isAffirmative = affirmative.some(word => lower.includes(word));

            if (!isAffirmative) {
                return { valid: false, error: 'Please confirm with "Yes" to generate the report, or say "Change [setting]" to update something.' }
            }
            break
    }

    return { valid: true, error: null }
}

/**
 * Helper function to get project type label
 */
function getProjectTypeLabel(value) {
    const type = PROJECT_TYPES.find(pt => pt.value === value)
    return type ? type.label : value
}

/**
 * Generate confirmation message with all collected data
 */
function generateConfirmationMessage(userData) {
    const projectType = getProjectTypeLabel(userData.projectType)
    const inputMethod = userData.inputMode === 'file' ? 'File Upload' : 'Text Input'
    const scope = DEVELOPMENT_SCOPES.find(ds => ds.value === userData.developmentScope)?.label || userData.developmentScope

    let message = `Perfect! Let me summarize what we've collected:\n\n`
    message += `📋 **Project Type**: ${projectType}\n`
    message += `📝 **Input Method**: ${inputMethod}\n`

    if (userData.inputMode === 'file' && userData.file) {
        message += `📄 **File**: ${userData.file.name}\n`
    }

    message += `💰 **Currency**: ${userData.currency}\n`
    message += `🌍 **Team**: ${scope}\n`
    message += `👨‍💻 **Technical Rate**: ${userData.currency} ${userData.technicalRate}/hour\n`
    message += `👔 **Non-Technical Rate**: ${userData.currency} ${userData.nonTechnicalRate}/hour\n`

    if (userData.timeline) {
        message += `📅 **Timeline**: ${userData.timeline} weeks\n`
    }

    if (userData.budget) {
        message += `💵 **Budget**: ${userData.currency} ${userData.budget}\n`
    }

    if (userData.resources) {
        message += `👥 **Resources**: ${userData.resources}\n`
    }

    message += `\nShould I generate the comprehensive report with these settings?`

    return message
}

/**
 * Build FormData for API submission
 * @param {Object} userData - Collected user data
 * @returns {FormData} - Form data ready for API
 */
export const buildFormData = (userData) => {
    const formData = new FormData()

    // Add file or text content
    if (userData.inputMode === 'file' && userData.file) {
        formData.append('file', userData.file)
        formData.append('input_mode', 'file')
    } else if (userData.inputMode === 'text' && userData.textContent) {
        formData.append('text_content', userData.textContent)
        formData.append('input_mode', 'text')
    }

    // Add required parameters
    formData.append('project_type', userData.projectType || 'web_app')
    formData.append('currency', userData.currency || 'PKR')
    formData.append('development_scope', userData.developmentScope || 'local')
    formData.append('technical_hourly_rate', userData.technicalRate?.toString() || '0')
    formData.append('non_technical_hourly_rate', userData.nonTechnicalRate?.toString() || '0')
    formData.append('mode', 'master') // Default to master mode
    formData.append('instruction', '') // Empty instruction

    // Add optional parameters
    if (userData.timeline && userData.timeline !== 'skip') {
        formData.append('timeline_weeks', userData.timeline.toString())
    }

    if (userData.budget && userData.budget !== 'skip') {
        formData.append('fixed_budget', userData.budget.toString())
    }

    if (userData.resources && userData.resources !== 'skip') {
        formData.append('resources_needed', userData.resources.toString())
    }

    return formData
}
