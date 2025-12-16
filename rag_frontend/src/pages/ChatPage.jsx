import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatContext } from '../context/ChatContext'
import ChatContainer from '../components/Chat/ChatContainer'
import ChatInput from '../components/Chat/ChatInput'
import QuickReplies from '../components/Chat/QuickReplies'
import { STEPS, getQuickReplies, buildFormData } from '../services/chatService'
import { processDocument } from '../services/apiService'
import '../components/Chat/Chat.css'

const ChatPage = () => {
    const navigate = useNavigate()
    const {
        messages,
        currentStep,
        userData,
        isTyping,
        error,
        handleUserResponse,
        resetChat,
        startGenerating
    } = useChatContext()

    const [selectedFile, setSelectedFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    /**
     * Handle quick reply selection
     */
    const handleQuickReply = (value) => {
        if (value === 'restart') {
            resetChat()
            setSelectedFile(null)
            return
        }

        if (value === 'confirm') {
            handleGenerateReport()
            return
        }

        handleUserResponse(value)
    }

    /**
     * Handle text message send
     */
    const handleSendMessage = (message) => {
        handleUserResponse(message)
    }

    /**
     * Handle file upload
     */
    const handleFileUpload = (file) => {
        setSelectedFile(file)
        handleUserResponse(file, 'file')
    }

    /**
     * Remove selected file
     */
    const handleRemoveFile = () => {
        setSelectedFile(null)
    }

    /**
     * Generate report with collected data
     */
    const handleGenerateReport = async () => {
        startGenerating()
        setIsProcessing(true)

        try {
            const formData = buildFormData(userData)
            const result = await processDocument(formData)

            // Navigate to report page with result data
            navigate('/report', {
                state: {
                    reportData: result,
                    documentId: result.document_id,
                    costing: result.data?.costing,
                    currency: userData.currency
                }
            })
        } catch (error) {
            console.error('Failed to generate report:', error)
            // You could add error handling here
        } finally {
            setIsProcessing(false)
        }
    }

    // Determine if we should show quick replies
    const quickReplies = getQuickReplies(currentStep)
    const showQuickReplies = quickReplies.length > 0 && !isTyping && !isProcessing

    // Determine if file upload is needed
    const needsFileUpload = currentStep === STEPS.FILE_UPLOAD

    // Always show chat input except when generating or at certain steps
    const showChatInput = currentStep !== STEPS.GENERATING && currentStep !== STEPS.COMPLETE

    // Disable input if processing or typing
    const inputDisabled = isProcessing || isTyping || currentStep === STEPS.GENERATING

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-header-icon">
                        🤖
                    </div>
                    <div className="chat-header-content">
                        <h2>DevGate Report Generator</h2>
                        <p>Let's create your project report together</p>
                    </div>
                </div>

                <ChatContainer messages={messages} isTyping={isTyping} />

                {isProcessing && (
                    <div className="loading-overlay">
                        <div className="loading-content">
                            <div className="loading-spinner"></div>
                            <h3>Generating Report...</h3>
                            <p>This may take a few moments</p>
                        </div>
                    </div>
                )}

                {showQuickReplies && (
                    <QuickReplies options={quickReplies} onSelect={handleQuickReply} />
                )}

                {showChatInput && (
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        onFileUpload={needsFileUpload ? handleFileUpload : null}
                        acceptFile={needsFileUpload}
                        selectedFile={selectedFile}
                        onRemoveFile={handleRemoveFile}
                        error={error}
                        disabled={inputDisabled}
                    />
                )}
            </div>
        </div>
    )
}

export default ChatPage
