import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import './Chat.css'

const ChatContainer = ({ messages, isTyping }) => {
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    return (
        <div className="chat-messages">
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
        </div>
    )
}

ChatContainer.propTypes = {
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            type: PropTypes.oneOf(['bot', 'user']).isRequired,
            content: PropTypes.string.isRequired,
            timestamp: PropTypes.instanceOf(Date).isRequired
        })
    ).isRequired,
    isTyping: PropTypes.bool
}

ChatContainer.defaultProps = {
    isTyping: false
}

export default ChatContainer
