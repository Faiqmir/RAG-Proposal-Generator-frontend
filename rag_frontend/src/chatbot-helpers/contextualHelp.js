/**
 * Contextual Help Module
 * 
 * Provides helpful explanations for each chatbot step.
 * Responds to user questions with relevant context and examples.
 */

const contextualHelp = {
    /**
     * Global definitions for common terms
     */
    definitions: {
        "technical resource": `
💼 **Technical Resources = Developers**

Technical resources include:
- 👨‍💻 Frontend Developers (React, Vue, etc.)
- 👨‍💻 Backend Developers (Node.js, Python, etc.)
- 👨‍💻 Full-Stack Developers
- 🧪 QA Engineers (Testing)
- ⚙️ DevOps Engineers

They write code and build your product!
        `.trim(),

        "non-technical resource": `
👔 **Non-Technical Resources**

Non-technical roles include:
- 📋 Project Manager (coordinates everything)
- 💼 Business Analyst (requirements gathering)
- 🎨 UI/UX Designer (makes it look good)
- 📊 Product Owner (defines features)

They guide the project but don't write code!
        `.trim(),

        "timeline": `
⏱️ **Project Timeline**

This is the estimated time to complete the project from start to finish.
- Includes: Design, Development, Testing, Deployment.
- **Weeks:** We measure in weeks (e.g., 12 weeks = 3 months).

A realistic timeline ensures high quality!
        `.trim(),

        "budget": `
💰 **Project Budget**

This is the total amount you are willing to invest.
- **Fixed:** You have a hard limit (e.g., $10,000).
- **Flexible:** You can spend more for better quality/features.

We'll try to fit the best team within your budget!
        `.trim(),

        "currency": `
💱 **Why Currency Matters?**

- **Cost Estimation:** We calculate costs in this currency.
- **Team Location:** Local teams usually pay in PKR, international in USD/EUR.
- **Budgeting:** Helps you plan your spending accurately.

Choose the one you're most comfortable with!
        `.trim(),

        "project type": `
🎯 **Project Types Defined**

- **Web App:** Runs in a browser (e.g., Facebook, Gmail).
- **Mobile App:** Runs on phones (iOS/Android).
- **Desktop Software:** Runs on PC/Mac.
- **API:** Backend service without a UI.
- **AI/ML:** Uses machine learning models.

Knowing this helps us pick the right tech stack!
        `.trim(),

        "development scope": `
🌍 **Development Scope Explained**

- **Local:** Hiring a team in your own country. Usually cheaper and easier to communicate.
- **International:** Hiring a team abroad. Access to global talent but more expensive.

It depends on your budget and needs!
        `.trim()
    },

    /**
     * Common project requirement suggestions
     */
    projectSuggestions: {
        ecommerce: `
🛍️ **E-commerce App Requirements:**
- User Authentication (Login/Signup)
- Product Catalog & Search
- Shopping Cart & Checkout
- Payment Gateway Integration (Stripe, PayPal)
- Order Management System
- Admin Dashboard
        `.trim(),
        social: `
📱 **Social Media App Requirements:**
- User Profiles & Bios
- News Feed / Timeline
- Friend/Follow System
- Real-time Messaging
- Media Upload (Photos/Videos)
- Notifications & Activity Log
        `.trim(),
        crm: `
💼 **CRM System Requirements:**
- Contact & Lead Management
- Sales Pipeline Tracking
- Task & Calendar Integration
- Email Integration
- Reporting & Analytics Dashboard
- User Roles & Permissions
        `.trim(),
        marketplace: `
🏪 **Marketplace Platform Requirements:**
- Vendor Profiles & Dashboards
- Product Listings & Inventory
- Multi-vendor Checkout
- Commission & Payout System
- Reviews & Ratings
- Dispute Resolution Center
        `.trim(),
        learning: `
🎓 **Learning Management System (LMS):**
- Course Creation & Management
- Student Enrollment & Progress Tracking
- Quizzes & Assessments
- Video Streaming Integration
- Discussion Forums
- Certificates & Badges
        `.trim()
    },

    helpContent: {
        input_method: {
            general: `
📄 **How to Provide Requirements**

You have two options:

**1. Upload a File** 📎
- Upload a PDF or text document with your project requirements
- Best for: Detailed specifications, formal requirement documents

**2. Type Your Requirements** ⌨️
- Type your requirements directly in the chat
- Best for: Quick descriptions, informal specifications

Which method works best for you?
      `.trim(),

            difference: `
📄 **File Upload vs. Typing**

**Upload File:**
- 📎 PDF or TXT format
- ✅ Better for long, detailed requirements
- ✅ Preserves formatting and structure
- Example: "Here's my 10-page requirement doc.pdf"

**Type Requirements:**
- ⌨️ Direct text input
- ✅ Better for quick, informal specs
- ✅ Easy to edit on the fly
- Example: "I need an e-commerce app with shopping cart..."

Which would you prefer?
      `.trim(),

            explanation: `
📄 **Requirements Gathering**

We need to know what you want to build!
- **File Upload:** Best if you already have a doc.
- **Chat:** Best if you want to brainstorm or have a short list.

Just choose one to get started!
            `.trim()
        },

        project_type: {
            general: `
🎯 **Project Type**

This helps us understand the scope and technologies needed.

**Common types:**
- 🌐 Web Application (websites, web apps)
- 📱 Mobile App (iOS, Android)
- 💼 Desktop Software
- 🔗 API/Backend Service
- 🤖 AI/ML Project
- 🎮 Game Development
- 📊 Data Analytics Platform

You can type any custom project type too!

What type of project is this?
      `.trim(),

            example: `
📋 **Project Type Examples:**

- "Web Application" → Online store, SaaS platform
- "Mobile App" → iOS/Android app for food delivery
- "Custom AI Platform" → ML-powered recommendation system
- "E-commerce Platform" → Full shopping site with cart
- "Dashboard" → Admin panel for analytics

What's your project type?
      `.trim(),

            explanation: `
🎯 **Project Types Defined**

- **Web App:** Runs in a browser (e.g., Facebook, Gmail).
- **Mobile App:** Runs on phones (iOS/Android).
- **Desktop Software:** Runs on PC/Mac.
- **API:** Backend service without a UI.
- **AI/ML:** Uses machine learning models.

Knowing this helps us pick the right tech stack!
            `.trim()
        },

        development_scope: {
            general: `
🌍 **Development Scope**

This determines the team location and helps estimate costs.

**Local Team** 🏠
- Developers from your country (Pakistan)
- ✅ Lower hourly rates
- ✅ Same timezone
- ✅ Local market knowledge
- Typical: PKR 2,000-5,000/hour

**International Team** 🌐
- Developers from other countries
- ✅ Global expertise
- ✅ Specialized skills
- ⚠️ Higher costs
- Typical: $30-150/hour (USD)

Which scope fits your project?
      `.trim(),

            difference: `
🏠 **Local vs. International Teams**

**Local Team (Pakistan-based):**
- 💰 Cost: PKR 2,000-5,000/hour
- ⏰ Timezone: Same as yours
- 🗣️ Language: Urdu/English
- 📍 Pros: Lower cost, easy communication
- ⚠️ Cons: May have limited specialized expertise

**International Team:**
- 💰 Cost: $30-150/hour (USD)
- ⏰ Timezone: May differ
- 🗣️ Language: Primarily English
- 📍 Pros: Access to rare skills, global experience
- ⚠️ Cons: Higher cost, timezone challenges

Which is better for your project?
      `.trim(),

            explanation: `
🌍 **Development Scope Explained**

- **Local:** Hiring a team in your own country. Usually cheaper and easier to communicate.
- **International:** Hiring a team abroad. Access to global talent but more expensive.

It depends on your budget and needs!
            `.trim()
        },

        currency: {
            general: `
💱 **Currency Selection**

Choose the currency for your budget and estimates.

**Common options:**
- 🇵🇰 PKR (Pakistani Rupee)
- 🇺🇸 USD (US Dollar)
- 🇪🇺 EUR (Euro)
- 🇬🇧 GBP (British Pound)

Or type any custom currency!

What currency should we use?
      `.trim(),

            difference: `
💱 **Currency Impact**

Your currency choice affects:
- 📊 How costs are displayed in the report
- 💰 Matches your budget expectations
- 🌍 Aligns with team location (local vs international)

**Recommendations:**
- Local team → Use PKR
- International team → Use USD/EUR

No complex conversions needed - we handle it!

What currency works for you?
      `.trim(),

            explanation: `
💱 **Why Currency Matters?**

- **Cost Estimation:** We calculate costs in this currency.
- **Team Location:** Local teams usually pay in PKR, international in USD/EUR.
- **Budgeting:** Helps you plan your spending accurately.

Choose the one you're most comfortable with!
            `.trim()
        },

        technical_rate: {
            general: `
👨‍💻 **Technical Hourly Rate**

This is the hourly rate for **technical resources**:
- Software Developers
- Engineers
- QA/Testers
- DevOps Engineers

**Example rates:**
- Local (PKR): 2,500 - 5,000/hour
- International (USD): $40 - $100/hour

Enter a number, or type "skip" to let AI estimate based on market rates.

What's your technical hourly rate?
      `.trim(),

            explanation: `
💼 **Technical Resources = Developers**

Technical resources include:
- 👨‍💻 Frontend Developers (React, Vue, etc.)
- 👨‍💻 Backend Developers (Node.js, Python, etc.)
- 👨‍💻 Full-Stack Developers
- 🧪 QA Engineers (Testing)
- ⚙️ DevOps Engineers

They write code and build your product!

Enter hourly rate (e.g., "3500" or "$50") or "skip":
      `.trim()
        },

        non_technical_rate: {
            general: `
👔 **Non-Technical Hourly Rate**

This is the hourly rate for **non-technical resources**:
- Project Managers
- Business Analysts
- UI/UX Designers
- Product Owners

**Example rates:**
- Local (PKR): 2,000 - 4,000/hour
- International (USD): $30 - $80/hour

Enter a number, or type "skip" to let AI estimate.

What's your non-technical hourly rate?
      `.trim(),

            explanation: `
👔 **Non-Technical Resources**

Non-technical roles include:
- 📋 Project Manager (coordinates everything)
- 💼 Business Analyst (requirements gathering)
- 🎨 UI/UX Designer (makes it look good)
- 📊 Product Owner (defines features)

They guide the project but don't write code!

Enter hourly rate or "skip":
      `.trim()
        },

        timeline: {
            general: `
⏱️ **Project Timeline**

How many weeks do you expect this project to take?

**Quick reference:**
- 🚀 Small project: 4-8 weeks
- 📦 Medium project: 8-16 weeks
- 🏗️ Large project: 16+ weeks

Enter a number (e.g., "12" for 12 weeks) or "skip" to let AI estimate based on complexity.

What's your preferred timeline?
      `.trim(),

            example: `
📅 **Timeline Examples:**

- Simple landing page → 2-4 weeks
- E-commerce site → 8-12 weeks
- Mobile app (basic) → 10-16 weeks
- SaaS platform → 16-24 weeks
- Enterprise system → 24+ weeks

Enter weeks (e.g., "16") or "skip":
      `.trim(),

            explanation: `
⏱️ **Project Timeline**

This is the estimated time to complete the project from start to finish.
- Includes: Design, Development, Testing, Deployment.
- **Weeks:** We measure in weeks (e.g., 12 weeks = 3 months).

A realistic timeline ensures high quality!
            `.trim()
        },

        budget: {
            general: `
💰 **Fixed Budget**

Do you have a fixed budget for this project?

**Options:**
- Enter a number (e.g., "500000" for PKR 500k)
- Type "no" or "skip" if you want a budget estimate
- Type "flexible" if budget is negotiable

AI will estimate costs based on project complexity if you skip!

What's your budget?
      `.trim(),

            difference: `
💰 **Fixed vs. Flexible Budget**

**Fixed Budget:**
- ✅ You have a set amount to spend
- ✅ Report shows how to fit within budget
- Example: "I have exactly Rs. 500,000"

**Flexible/Estimated Budget:**
- ✅ AI estimates based on project complexity
- ✅ More accurate cost projection
- Example: Type "skip" or "estimate"

Which applies to you?
      `.trim(),

            explanation: `
💰 **Project Budget**

This is the total amount you are willing to invest.
- **Fixed:** You have a hard limit (e.g., $10,000).
- **Flexible:** You can spend more for better quality/features.

We'll try to fit the best team within your budget!
            `.trim()
        },

        resources: {
            general: `
👥 **Team Size**

How many resources (people) do you need on the team?

**Quick guide:**
- 🚀 Small project: 1-3 people
- 📦 Medium project: 3-5 people
- 🏗️ Large project: 5+ people

Enter a number (e.g., "3") or "skip" for AI recommendation.

How many team members do you need?
      `.trim(),

            example: `
👥 **Team Size Examples:**

**1-2 people:**
- Simple website or app
- Solo developer + designer

**3-5 people:**
- Full-featured application
- Developers + PM + Designer

**5+ people:**
- Complex platform
- Multiple teams (frontend, backend, mobile, etc.)

How many resources?
      `.trim(),

            explanation: `
👥 **Team Resources**

These are the people working on your project.
- **Developers:** Build the app.
- **Designers:** Create the look and feel.
- **PMs:** Manage the process.
- **QA:** Test for bugs.

More resources = Faster delivery but higher cost!
            `.trim()
        }
    },

    /**
     * Get specific project suggestion based on user text
     * @param {string} userText - User's input
     * @returns {string|null} - The suggestion text or null
     */
    getSuggestion(userText) {
        if (!userText) return null;
        const lowerText = userText.toLowerCase();

        if (lowerText.includes('ecommerce') || lowerText.includes('shop') || lowerText.includes('store')) {
            return this.projectSuggestions.ecommerce;
        }
        if (lowerText.includes('social') || lowerText.includes('media') || lowerText.includes('chat') || lowerText.includes('connect')) {
            return this.projectSuggestions.social;
        }
        if (lowerText.includes('crm') || lowerText.includes('customer') || lowerText.includes('sales')) {
            return this.projectSuggestions.crm;
        }
        if (lowerText.includes('marketplace') || lowerText.includes('vendor')) {
            return this.projectSuggestions.marketplace;
        }
        if (lowerText.includes('learning') || lowerText.includes('course') || lowerText.includes('school') || lowerText.includes('education')) {
            return this.projectSuggestions.learning;
        }
        return null;
    },

    /**
     * Get contextual help for a specific step
     * @param {string} step - The current chatbot step
     * @param {string} questionType - Type of question (from questionDetector)
     * @param {string} userText - User's input for dynamic suggestions
     * @returns {string} - The help text to display
     */
    getHelp(step, questionType = 'general', userText = '') {
        // Check for dynamic suggestions based on user text
        if (userText && (questionType === 'example' || questionType === 'general')) {
            const suggestion = this.getSuggestion(userText);
            if (suggestion) return suggestion;
        }

        // Check for global definitions (NEW)
        if (userText && (questionType === 'explanation' || questionType === 'general')) {
            const lowerText = userText.toLowerCase();
            // Sort keys by length descending to match longest term first
            const terms = Object.keys(this.definitions).sort((a, b) => b.length - a.length);

            for (const term of terms) {
                if (lowerText.includes(term)) {
                    return this.definitions[term];
                }
            }
        }

        const stepHelp = this.helpContent[step];

        if (!stepHelp) {
            return this.getDefaultHelp(step);
        }

        // Return specific help if available, otherwise return general
        return stepHelp[questionType] || stepHelp.general || this.getDefaultHelp(step);
    },

    /**
     * Default help when no specific help is available
     * @param {string} step - The current step
     * @returns {string} - Generic help message
     */
    getDefaultHelp(step) {
        return `
ℹ️ **Need Help?**

I'm here to help you with this step!

Please answer the question above, or you can:
- Type "skip" to let AI decide
- Type your custom answer
- Ask a more specific question

Let me know how I can assist!
    `.trim();
    },

    /**
     * Get a re-asking message for the current step
     * @param {string} step - The current step
     * @returns {string} - The question to re-ask
     */
    getStepQuestion(step) {
        const questions = {
            input_method: "How would you like to provide your requirements?",
            project_type: "What type of project is this?",
            development_scope: "Will this project be developed by a local team or an international team?",
            currency: "What currency would you like to use?",
            technical_rate: "What is the hourly rate for technical resources (developers, engineers) in your chosen currency?",
            non_technical_rate: "What is the hourly rate for non-technical resources (PM, BA, designers)?",
            timeline: "What is your preferred timeline (in weeks)?",
            budget: "Do you have a fixed budget? (Enter amount or 'skip')",
            resources: "How many resources do you need?"
        };

        return questions[step] || "Please provide your answer:";
    }
};

export default contextualHelp;
