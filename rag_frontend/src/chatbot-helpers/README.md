# Chatbot Question Detection & Contextual Help

Intelligent modules to detect when users ask clarifying questions and provide helpful context before proceeding.

## 🎯 Problem Solved

**Before:** User asks "what is the difference" → Bot ignores and moves to next question ❌

**After:** User asks "what is the difference" → Bot provides explanation → Re-asks question → User can now answer ✅

---

## 📦 Modules

### 1. `questionDetector.js`
Detects if user input is a question vs. an answer.

**Usage:**
```javascript
import questionDetector from './questionDetector.js';

const isQ = questionDetector.isQuestion("what is the difference");
// Returns: true

const isA = questionDetector.isQuestion("local team");  
// Returns: false
```

### 2. `contextualHelp.js`
Provides step-specific help content.

**Usage:**
```javascript
import contextualHelp from './contextualHelp.js';

const help = contextualHelp.getHelp('development_scope', 'difference');
// Returns: Detailed explanation of local vs international teams
```

### 3. `chatFlowHandler.js`
Orchestrates the complete flow.

**Usage:**
```javascript
import chatFlowHandler from './chatFlowHandler.js';

const result = await chatFlowHandler.handleUserMessage(
  userInput,
  currentStep,
  addBotMessage,      // Your function to show bot messages
  saveAndAdvance      // Your function to save & move to next step
);
```

---

## 🚀 Integration Examples

### React Integration

```jsx
import { useState } from 'react';
import chatFlowHandler from './chatbot-helpers/chatFlowHandler';

function ChatBot() {
  const [currentStep, setCurrentStep] = useState('development_scope');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { role: 'bot', text }]);
  };

  const saveAndAdvance = async (answer, step) => {
    // Save to backend
    await fetch('http://localhost:8001/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, step, answer })
    });

    // Move to next step
    setCurrentStep(getNextStep(step));
  };

  const handleUserInput = async (userInput) => {
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', text: userInput }]);

    // Process with flow handler
    const result = await chatFlowHandler.handleUserMessage(
      userInput,
      currentStep,
      addBotMessage,
      saveAndAdvance
    );

    if (result.advanced) {
      console.log('Moved to next step with answer:', result.answer);
    } else {
      console.log('Provided help, staying on same step');
    }
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.text}
        </div>
      ))}
      <input onKeyPress={e => {
        if (e.key === 'Enter') handleUserInput(e.target.value);
      }} />
    </div>
  );
}
```

### Vanilla JavaScript Integration

```javascript
// Import modules
import questionDetector from './chatbot-helpers/questionDetector.js';
import contextualHelp from './chatbot-helpers/contextualHelp.js';

let currentStep = 'project_type';

function handleUserInput(input) {
  // Check if it's a question
  if (questionDetector.isQuestion(input)) {
    // Get help
    const questionType = questionDetector.getQuestionType(input);
    const help = contextualHelp.getHelp(currentStep, questionType);
    
    // Show help
    showBotMessage(help);
    
    // Re-ask question
    const question = contextualHelp.getStepQuestion(currentStep);
    showBotMessage(question);
    
    // Don't advance
    return;
  }
  
  // It's an answer - save and advance
  saveToBackend(currentStep, input);
  currentStep = getNextStep();
}
```

---

## 🔧 Manual Integration (Step by Step)

If you prefer to integrate manually:

### Step 1: Import the Modules

```javascript
import questionDetector from './chatbot-helpers/questionDetector.js';
import contextualHelp from './chatbot-helpers/contextualHelp.js';
```

### Step 2: Modify Your Input Handler

```javascript
async function onUserSubmit(userInput) {
  // BEFORE: Always saved answer immediately
  // await saveAnswer(userInput);
  
  // AFTER: Check if it's a question first
  if (questionDetector.isQuestion(userInput)) {
    // Provide help
    const questionType = questionDetector.getQuestionType(userInput);
    const helpText = contextualHelp.getHelp(currentStep, questionType);
    addBotMessage(helpText);
    
    // Re-ask the question
    const question = contextualHelp.getStepQuestion(currentStep);
    addBotMessage(question);
    
    // Don't save, don't advance
    return;
  }
  
  // Save answer and advance
  await saveAnswerToBackend(currentStep, userInput);
  moveToNextStep();
}
```

### Step 3: Update Your chatService.js

```javascript
// In your chatService.js
import questionDetector from '../chatbot-helpers/questionDetector';
import contextualHelp from '../chatbot-helpers/contextualHelp';

export const validateAndAdvance = (step, answer) => {
  // Check if user is asking a question
  if (questionDetector.isQuestion(answer)) {
    const questionType = questionDetector.getQuestionType(answer);
    return {
      isValid: false,
      isQuestion: true,
      helpText: contextualHelp.getHelp(step, questionType),
      reaskQuestion: contextualHelp.getStepQuestion(step)
    };
  }
  
  // Validate answer as before
  return {
    isValid: true,
    isQuestion: false,
    // ... your existing validation
  };
};
```

---

## 📋 Quick Reference

### Question Detection Patterns

✅ Detected as questions:
- "what is the difference"
- "can you explain?"
- "what does local mean"
- "help"
- "I don't understand"
- Anything with "?" at the end

❌ NOT detected as questions:
- "local"
- "international team"
- "3500"
- "skip"

### Help Content Available

Each step has contextual help:

| Step | Help Types |
|------|-----------|
| `development_scope` | general, difference, explanation |
| `project_type` | general, example |
| `currency` | general, difference |
| `technical_rate` | general, explanation |
| `non_technical_rate` | general, explanation |
| `timeline` | general, example |
| `budget` | general, difference |
| `resources` | general, example |

---

## 🧪 Testing

### Test Question Detection

```javascript
// In browser console or Node.js
const questionDetector = require('./questionDetector');

// Test cases
console.log(questionDetector.isQuestion("what is the difference")); // true
console.log(questionDetector.isQuestion("local")); // false
console.log(questionDetector.isQuestion("can you explain?")); // true
console.log(questionDetector.isQuestion("3500")); // false
```

### Test Contextual Help

```javascript
const contextualHelp = require('./contextualHelp');

// Get help for development scope difference
const help = contextualHelp.getHelp('development_scope', 'difference');
console.log(help);
// Outputs: Detailed comparison of local vs international teams
```

---

## 🎨 Customization

### Add More Question Patterns

Edit `questionDetector.js`:

```javascript
patterns: [
  // Add your custom patterns
  /give\s+me\s+more\s+info/i,
  /need\s+clarification/i,
  // ... existing patterns
]
```

### Add Custom Help Content

Edit `contextualHelp.js`:

```javascript
helpContent: {
  your_custom_step: {
    general: "Your general help text",
    difference: "Your comparison help",
    example: "Your example help"
  }
}
```

---

## ⚠️ Important Notes

1. **Don't save questions as answers** - Questions should NOT be sent to `/chat/message` endpoint
2. **Stay on current step** - Don't advance when providing help
3. **Re-ask after help** - Always re-ask the question after providing context
4. **Backend is ready** - The backend API already supports this workflow

---

## 🆘 Troubleshooting

**Problem:** Bot still skips questions

**Solution:** Make sure you're calling `questionDetector.isQuestion()` BEFORE saving the answer

**Problem:** Help text not showing

**Solution:** Check that you're importing `contextualHelp` correctly and the step name matches

**Problem:** Module import errors

**Solution:** Adjust import paths based on your project structure:
```javascript
// Relative import
import questionDetector from './chatbot-helpers/questionDetector.js';

// Or absolute import (configure in your bundler)
import questionDetector from '@/helpers/questionDetector';
```

---

## 📞 Need Help?

Check the example files in the `examples/` folder for complete working implementations!
