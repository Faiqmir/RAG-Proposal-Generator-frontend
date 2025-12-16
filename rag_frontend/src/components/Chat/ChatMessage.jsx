import PropTypes from 'prop-types'
import './Chat.css'

const ChatMessage = ({ message }) => {
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        })
    }

    const formatContent = (content) => {
        // Split by newlines and handle markdown-style bold
        return content.split('\n').map((line, i) => {
            // Convert **text** to <strong>text</strong>
            const parts = line.split(/(\*\*.*?\*\*)/)
            const formatted = parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>
                }
                return part
            })

            return (
                <p key={i}>
                    {formatted}
                </p>
            )
        })
    }

    return (
        <div className={`message ${message.type}`}>
            <div className="message-avatar">
                {message.type === 'bot' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
                <div className="message-bubble">
                    {formatContent(message.content)}
                </div>
                <div className="message-timestamp">
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    )
}

ChatMessage.propTypes = {
    message: PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['bot', 'user']).isRequired,
        content: PropTypes.string.isRequired,
        timestamp: PropTypes.instanceOf(Date).isRequired
    }).isRequired
}

export default ChatMessage
