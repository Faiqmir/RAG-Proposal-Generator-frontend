import './Chat.css'

const TypingIndicator = () => {
    return (
        <div className="typing-indicator">
            <div className="message-avatar">
                🤖
            </div>
            <div className="typing-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
            </div>
        </div>
    )
}

export default TypingIndicator
