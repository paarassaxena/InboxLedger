// Simple categorizer based on keywords
export const categorizeMerchant = (merchantName) => {
    const name = merchantName.toLowerCase();

    if (name.includes('uber') || name.includes('lyft') || name.includes('delta') || name.includes('airbnb') || name.includes('hotel')) {
        return 'Travel';
    }
    if (name.includes('netflix') || name.includes('spotify') || name.includes('github') || name.includes('hulu')) {
        return 'Subscriptions';
    }
    if (name.includes('aws') || name.includes('chatgpt') || name.includes('google') || name.includes('vercel')) {
        return 'Professional Services';
    }
    if (name.includes(' whole foods') || name.includes('trader') || name.includes('safeway')) {
        return 'Groceries';
    }
    if (name.includes('doordash') || name.includes('starbucks') || name.includes('restaurant') || name.includes('cafe')) {
        return 'Food & Dining';
    }

    return 'Uncategorized';
};

// Extracts body content from the Gmail API payload structure
const extractEmailBody = (payload) => {
    let body = '';

    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain') {
                body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } else if (part.mimeType === 'text/html') {
                // html data is often easiest, though parse logic varies
                body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } else if (part.parts) {
                body += extractEmailBody(part); // recursive for multipart
            }
        }
    } else if (payload.body && payload.body.data) {
        body = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    return body;
};

// Parses raw Amex emails to extract the transaction details.
// Note: This relies heavily on Amex's exact email format which may change.
export const parseAmexEmails = (rawEmails) => {
    const transactions = [];

    for (const email of rawEmails) {
        try {
            const body = extractEmailBody(email.payload);
            const headers = email.payload.headers;

            // Get internal date
            const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
            const dateStr = dateHeader ? dateHeader.value : new Date(parseInt(email.internalDate)).toISOString();
            const dateObj = new Date(dateStr);

            // Basic regex parsing heuristics for Amex
            // WARNING: These regular expressions are brittle and based on typical standard Amex notification structures
            // They may need tweaking depending on the user's specific region/card type.

            const amountMatch = body.match(/(?:Amount|Charge Amount|Amount in USD)[:\s]*\$([\d,]+(?:\.\d{2})?)/i) ||
                body.match(/\$([\d,]+(?:\.\d{2})?)/);

            const merchantMatch = body.match(/(?:Merchant|Charge made at)[:\s]*([^\n<]+)/i) ||
                body.match(/at ([^\n<]+) for/i);

            if (amountMatch && amountMatch[1]) {
                const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
                const merchant = merchantMatch && merchantMatch[1] ? merchantMatch[1].trim() : 'Unknown Merchant';

                // Skip obvious non-merchants that might get caught by greedy regex
                if (merchant.length > 50 || amount <= 0) continue;

                transactions.push({
                    id: email.id,
                    date: dateObj.toISOString(),
                    amount: amount,
                    merchant: merchant,
                    category: categorizeMerchant(merchant)
                });
            }
        } catch (err) {
            console.warn('Failed to parse an email: ', err);
        }
    }

    return transactions;
};
