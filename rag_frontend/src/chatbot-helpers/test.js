/**
 * Test File for Question Detection
 * 
 * Run this in Node.js to test the modules:
 * node chatbot-helpers/test.js
 */

const questionDetector = require('./questionDetector');
const contextualHelp = require('./contextualHelp');

console.log('🧪 Testing Question Detection Module\n');
console.log('='.repeat(50));

// Test cases
const testCases = [
    // Questions - should return TRUE
    { input: 'what is the difference', expected: true, type: 'question' },
    { input: 'can you explain?', expected: true, type: 'question' },
    { input: 'what does local mean', expected: true, type: 'question' },
    { input: 'help', expected: true, type: 'question' },
    { input: 'I don\'t understand', expected: true, type: 'question' },
    { input: 'why international?', expected: true, type: 'question' },
    { input: 'tell me more', expected: true, type: 'question' },

    // Answers - should return FALSE
    { input: 'local', expected: false, type: 'answer' },
    { input: 'international team', expected: false, type: 'answer' },
    { input: '3500', expected: false, type: 'answer' },
    { input: 'skip', expected: false, type: 'answer' },
    { input: 'USD', expected: false, type: 'answer' },
    { input: 'Custom AI Platform', expected: false, type: 'answer' },
];

console.log('\n📋 Running Test Cases:\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = questionDetector.isQuestion(test.input);
    const status = result === test.expected ? '✅ PASS' : '❌ FAIL';

    if (result === test.expected) {
        passed++;
    } else {
        failed++;
    }

    console.log(`${index + 1}. ${status} | "${test.input}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result}, Type: ${test.type}\n`);
});

console.log('='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

// Test question types
console.log('='.repeat(50));
console.log('\n🔍 Testing Question Type Detection:\n');

const questionTypeTests = [
    { input: 'what is the difference', expected: 'difference' },
    { input: 'can you give me an example', expected: 'example' },
    { input: 'what does this mean', expected: 'explanation' },
    { input: 'help me understand', expected: 'help' },
];

questionTypeTests.forEach((test) => {
    const type = questionDetector.getQuestionType(test.input);
    const status = type === test.expected ? '✅' : '❌';
    console.log(`${status} "${test.input}" → ${type} (expected: ${test.expected})`);
});

// Test contextual help
console.log('\n' + '='.repeat(50));
console.log('\n💬 Testing Contextual Help:\n');

// Test getting help for development_scope with "difference" question
const scopeHelp = contextualHelp.getHelp('development_scope', 'difference');
console.log('📖 Help for "development_scope" (difference):\n');
console.log(scopeHelp.substring(0, 200) + '...\n');

// Test getting step questions
console.log('='.repeat(50));
console.log('\n❓ Testing Step Questions:\n');

const steps = [
    'input_method',
    'project_type',
    'development_scope',
    'currency'
];

steps.forEach(step => {
    const question = contextualHelp.getStepQuestion(step);
    console.log(`${step}: "${question}"`);
});

console.log('\n' + '='.repeat(50));
console.log('\n✨ All tests completed!\n');
