import { useState, useRef } from 'react'
import { SendOutlined, PaperClipOutlined, CloseCircleOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import './Chat.css'

const ChatInput = ({ onSendMessage, onFileUpload, error, disabled, acceptFile, selectedFile, onRemoveFile }) => {
    const [inputValue, setInputValue] = useState('')
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    const handleSend = () => {
        const message = inputValue.trim()
        if (message) {
            onSendMessage(message)
            setInputValue('')
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            onFileUpload(file)
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleTextareaChange = (e) => {
        setInputValue(e.target.value)

        // Auto-resize textarea
        const textarea = e.target
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }

    return (
        <div className="chat-input-container">
            {error && (
                <div className="error-message">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {selectedFile && (
                <div className="file-preview">
                    <div className="file-preview-icon">📄</div>
                    <div className="file-preview-info">
                        <div className="file-preview-name">{selectedFile.name}</div>
                        <div className="file-preview-size">{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <button className="file-preview-remove" onClick={onRemoveFile}>
                        <CloseCircleOutlined />
                    </button>
                </div>
            )}

            <div className="chat-input-wrapper">
                <div className="chat-input">
                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={handleTextareaChange}
                        onKeyPress={handleKeyPress}
                        disabled={disabled}
                        rows={1}
                    />
                </div>

                {acceptFile && (
                    <>
                        <button
                            className="file-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            type="button"
                        >
                            <PaperClipOutlined />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="file-upload-input"
                            accept=".pdf,.txt"
                            onChange={handleFileSelect}
                        />
                    </>
                )}

                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={disabled || !inputValue.trim()}
                >
                    <SendOutlined />
                </button>
            </div>
        </div>
    )
}

ChatInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired,
    onFileUpload: PropTypes.func,
    error: PropTypes.string,
    disabled: PropTypes.bool,
    acceptFile: PropTypes.bool,
    selectedFile: PropTypes.object,
    onRemoveFile: PropTypes.func
}

ChatInput.defaultProps = {
    disabled: false,
    acceptFile: false,
    error: null,
    selectedFile: null,
    onFileUpload: () => { },
    onRemoveFile: () => { }
}

export default ChatInput
