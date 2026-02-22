import { parseExpenseEmails } from './src/services/expenseParser.js';

console.log("Testing strict string matching:");
const b = 'A charge of $25.50 at STARBUCKS STORE was authorized on your card ending in 1004.';
const r = /charge of \$[0-9.,]+ at (.{2,40}?)\s+was authorized/i;
console.log(b.match(r)[1]);
