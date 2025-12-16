import PropTypes from 'prop-types'
import './Chat.css'

const QuickReplies = ({ options, onSelect }) => {
    if (!options || options.length === 0) return null

    return (
        <div className="quick-replies">
            <div className="quick-replies-container">
                {options.map((option) => (
                    <button
                        key={option.value}
                        className="quick-reply-btn"
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

QuickReplies.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ),
    onSelect: PropTypes.func.isRequired
}

export default QuickReplies
