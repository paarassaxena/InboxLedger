import { parseExpenseEmails } from './src/services/expenseParser.js';

const mocks = [
    {
        id: "bofa-1",
        payload: {
            body: {
                data: Buffer.from("Amount: $16.53\nDate: February 9, 2026\nWhere: AMAZON PRIME PMTS\nView details").toString('base64')
            },
            headers: [{ name: 'Date', value: 'Mon, 09 Feb 2026 10:00:00 GMT' }]
        }
    }
];

console.log(parseExpenseEmails(mocks));
