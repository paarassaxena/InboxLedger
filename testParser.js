import { parseExpenseEmails } from './src/services/expenseParser.js';

const mockEmailBody = `
Discover https://discover.app.link/3p?%243p=e_rs&%24original_url=https%3A%2F%2Fportal.discover.com%2Fcustomersvcs%2FuniversalLogin%2Fac_main%3Flink%3D%2Fcardmembersvcs%2Fachome%2Fhomepage%3FselAcct&deeplink=linktohome&dms_VS_PARMS_qs&emailstat=clk&section=header Account ending in Â 1298 ------------------------------------------------------------ Transaction threshold exceeded ------------------------------------------------------------ You've set an account alert to let you know if a purchase or cash advance exceeds your specified amount. This alert is just informational: we've processed the transaction as usual. Transaction Date:: June 18, 2025 Merchant: UBR PENDING.UBER.COM Amount: $29.65 If you don't recognize this transaction, call us at 1-800-DISCOVER (1-800-347-2683) View Recent Act
`;

const mockPayload = {
    id: 'test-123',
    internalDate: new Date().getTime().toString(),
    payload: {
        headers: [{ name: 'Date', value: new Date().toISOString() }],
        parts: [{
            mimeType: 'text/plain',
            body: {
                data: Buffer.from(mockEmailBody).toString('base64')
            }
        }]
    }
};

const result = parseExpenseEmails([mockPayload]);
console.log("PARSING RESULT:");
console.log(JSON.stringify(result, null, 2));
