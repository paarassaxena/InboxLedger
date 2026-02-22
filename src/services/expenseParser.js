// Expanded categorizer
export const categorizeMerchant = (merchantName) => {
    // Clean up merchant name: lowercased, strip common suffixes
    let name = merchantName.toLowerCase();
    name = name.replace(/ (inc|llc|corp|co|ltd)\.?$/i, '').trim();

    // 1. Groceries
    const groceryKeywords = ['whole foods', 'trader joe', 'safeway', 'kroger', 'publix', 'wegmans', 'aldi', 'costco', 'target', 'walmart', 'heb', 'meijer', 'albertsons', 'market', 'grocery', 'supermarket', 'freshdirect', 'instacart', 'cvs', 'walgreens', 'pharmacy'];
    if (groceryKeywords.some(kw => name.includes(kw))) return 'Groceries';

    // 2. Food & Dining
    const foodKeywords = ['doordash', 'starbucks', 'restaurant', 'cafe', 'mcdonald', 'chipotle', 'pizza', 'grubhub', 'dunkin', 'taco bell', 'sweetgreen', 'wendys', 'burger', 'subway', 'panera', 'chick-fil', 'popeyes', 'kfc', 'panda express', 'baker', 'eats', 'diner', 'kitchen', 'grill', 'bar', 'tavern'];
    if (foodKeywords.some(kw => name.includes(kw))) return 'Food & Dining';

    // 3. Travel
    const travelKeywords = ['uber', 'lyft', 'delta', 'airbnb', 'hotel', 'airlines', 'expedia', 'marriott', 'hilton', 'southwest', 'american air', 'united air', 'alaska air', 'jetblue', 'frontier', 'spirit', 'booking.com', 'agoda', 'kayak', 'priceline', 'motel', 'resort', 'taxis', 'cab', 'shell', 'chevron', 'exxon', 'mobil', 'bp', 'parking', 'transit', 'mta', 'bart', 'amtrak', 'tolls', 'ezpass', 'fas-trak', 'auto', 'car wash', 'repair'];
    if (travelKeywords.some(kw => name.includes(kw))) return 'Travel';

    // 4. Utilities
    const utilityKeywords = ['pg&e', 'coned', 'verizon', 'at&t', 't-mobile', 'water', 'electric', 'insurance', 'geico', 'state farm', 'progressive', 'allstate', 'comcast', 'xfinity', 'spectrum', 'cox', 'internet', 'power', 'gas'];
    if (utilityKeywords.some(kw => name.includes(kw))) return 'Utilities';

    // 5. Entertainment
    const funKeywords = ['amc', 'regal', 'cinemark', 'ticketmaster', 'stubhub', 'seatgeek', 'nintendo', 'playstation', 'xbox', 'steam', 'epic games', 'golf', 'gym', 'fitness', 'planet fitness', 'equinox', 'museum', 'theater', 'netflix', 'spotify', 'hulu', 'peacock', 'hbo', 'disney+', 'disney plus', 'paramount', 'youtube'];
    if (funKeywords.some(kw => name.includes(kw))) return 'Entertainment';

    // 6. Professional Services
    const proKeywords = ['aws', 'chatgpt', 'google', 'vercel', 'openai', 'cloudflare', 'digitalocean', 'microsoft', 'heroku', 'firebase', 'azure', 'anthropic', 'upwork', 'fiverr', 'mailchimp', 'domain', 'hosting', 'github', 'apple', 'adobe', 'patreon', 'notion', 'figma', 'slack', 'zoom', 'canva', '1password'];
    if (proKeywords.some(kw => name.includes(kw))) return 'Professional Services';

    // 7. Miscellaneous (Catch-all for Shopping, Health, and Unknowns)
    return 'Miscellaneous';
};

// Extracts body content from the Gmail API payload structure
const extractEmailBody = (payload) => {
    let body = '';

    if (!payload) return body;

    if (payload.parts && Array.isArray(payload.parts)) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
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

// Helper to strip HTML tags from a string and replace encoded entities
const stripHtml = (html) => {
    // Basic sanitization
    let text = html.replace(/<[^>]*>?/gm, ' '); // Replace tags with space
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&[a-z]+;/g, ''); // Strip other entities
    text = text.replace(/\*/g, ''); // Strip asterisks commonly used for footnotes
    return text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
};

// Parses raw bank emails to extract the transaction details.
export const parseExpenseEmails = (rawEmails) => {
    const transactions = [];

    for (const email of rawEmails) {
        try {
            const payloadToExtract = email.payload || email;
            const rawBody = extractEmailBody(payloadToExtract);
            // Crucial: Strip HTML tags so regexes don't catch garbage or fail to match across spans
            const body = stripHtml(rawBody);

            if (body.toLowerCase().includes("wasn't present")) {
                console.log("====== AMEX CARD NOT PRESENT RAW BODY ======\n" + body);
            }

            const headers = email.payload?.headers || email.headers || [];

            // Get internal date
            const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
            let dateStr = dateHeader ? dateHeader.value : new Date(parseInt(email.internalDate)).toISOString();

            let dateObj = new Date(dateStr);
            let finalIsoDate = new Date().toISOString(); // Default to today if parsing fails
            try {
                if (!isNaN(dateObj)) {
                    finalIsoDate = dateObj.toISOString();
                }
            } catch (e) {
                // Keep default today date on RangeError
            }

            let merchant = 'Unknown Merchant';
            let finalAmountMatch = null;

            // 2. Merchant is heavily variable. Try a suite of standard preceding/succeeding keywords in plain text.
            const merchantRegexes = [
                // "Merchant: Target"
                /(?:Merchant|Where|Description|Payee|Charge made at|Transaction Details|\bat|to\b)\s*:?-?\s*([\w\s\'&*#.-]+?)(?:\s+(?:on|for|has been|to|Amount|Date|Account|-|$))/i,
                // "at Target on"
                /\s(?:at|to)\s+([\w\s\'&*#.-]{2,40}?)\s+(?:on|for|has been)/i,
                // "authorized a charge of $X at Target."
                /authorized a \w+ of \$[0-9.,]+ at (.{2,40}?)(?:\s+on|\.|\s+was authorized|$)/i,
                // "A charge of $X at Target was authorized..."
                /charge of \$[0-9.,]+ at (.{2,40}?)(?:\s+on|\.|\s+was authorized|$)/i,
                // "paid $X to Target"
                /paid \$[0-9.,]+ to ([\w\s\'&*#.-]{2,40}?)(?:\s+for|\.|$)/i,
                // Tabular layout fallback (e.g. "RENTERS INS EXCEED   $16.42*")
                // Looks for strictly uppercase words (min 3 chars), followed by any amount of whitespace/asterisks, followed by a dollar sign
                /([A-Z0-9\s'&*-]{3,40}?)[*\s]+\$[\d,]+(?:\.\d{2})?/
            ];

            // Dedicated Amex "Card Not Present" Override
            // Looks for the exact phrasing: "at the time of purchase. RENTERS INS EXCEED $16.42"
            const amexNotPresentRegex = /time of purchase\.?\s*([A-Z0-9\s'&*#.-]{3,40}?)\s+\$([\d,]+(?:\.\d{2})?)/i;
            const amexMatch = body.match(amexNotPresentRegex);

            // Explicit Table format override
            // Directly targets formats like "Merchant: UBR PENDING Amount: $29.65" and handles intermediate fields like Date
            const explicitTableRegex = /(?:Merchant|Description|Payee|Where)\s*:?-?\s*([A-Za-z0-9\s\'&*#.\-\/]{2,50}?)\s+[\s\S]{0,150}?(?:Amount|Total|Charge)\s*:?-?\s*\$?([\d,]+(?:\.\d{2})?)/i;
            const tableMatch = body.match(explicitTableRegex);

            // Reverse Table format override (e.g. Bank of America: "Amount: $16.53 ... Where: AMAZON PRIME PMTS View details")
            const explicitTableReverseRegex = /(?:Amount|Total|Charge)\s*:?-?\s*\$?([\d,]+(?:\.\d{2})?)[\s\S]{0,150}?(?:Merchant|Description|Payee|Where)\s*:?-?\s*([A-Za-z0-9\s\'&*#.\-\/]{2,50}?)(?:\s+(?:View|Click|The|This|Date|Amount|Your|Account|Contact|Questions|If|$))/i;
            const reverseTableMatch = body.match(explicitTableReverseRegex);

            if (amexMatch) {
                merchant = amexMatch[1].trim();
                // Override the amountMatch array so it uses the exact amount tied to the merchant
                finalAmountMatch = [amexMatch[0], amexMatch[2]];
            } else if (tableMatch) {
                merchant = tableMatch[1].trim();
                finalAmountMatch = [tableMatch[0], tableMatch[2]];
            } else if (reverseTableMatch) {
                merchant = reverseTableMatch[2].trim();
                finalAmountMatch = [reverseTableMatch[0], reverseTableMatch[1]];
            } else {
                for (let regex of merchantRegexes) {
                    const match = body.match(regex);
                    if (match && match[1]) {
                        const extracted = match[1].trim();
                        const lowerExtracted = extracted.toLowerCase();
                        // Advanced sanity check to prevent grabbing parts of other sentences or common banking fluff
                        const isInvalid =
                            lowerExtracted.length <= 1 ||
                            lowerExtracted.length > 40 ||
                            lowerExtracted.startsWith('your') ||
                            lowerExtracted.startsWith('view') ||
                            lowerExtracted.startsWith('click') ||
                            lowerExtracted.includes('the number') ||
                            lowerExtracted.includes('account ending') ||
                            lowerExtracted.includes('card ending') ||
                            lowerExtracted.includes('manage your') ||
                            lowerExtracted.includes('privacy policy') ||
                            lowerExtracted.includes('terms of service') ||
                            lowerExtracted === 'ion' ||
                            lowerExtracted === 'ation';

                        if (!isInvalid) {
                            merchant = extracted;
                            // 1. Amount is usually the first noticeable currency figure. Grab it only if we passed merchant validation.
                            finalAmountMatch = body.match(/(?:Amount|Charge Amount|Transaction Amount|Total|Purchase Amount|balance)[\s\S]*?\$([\d,]+(?:\.\d{2})?)/i) ||
                                body.match(/\$([\d,]+(?:\.\d{2})?)/) ||
                                body.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
                            break;
                        }
                    }
                }
            }

            if (merchant === 'Unknown Merchant' || !finalAmountMatch || !finalAmountMatch[1]) {
                // Ignore missing or malformed records
            } else {
                const amount = parseFloat(finalAmountMatch[1].replace(/,/g, ''));

                // Final clean up and garbage filter
                merchant = merchant.replace(/[\\*_~`$]/g, '').trim();
                // strip out trailing text like .com, Inc, LLC if needed, but for now just trim
                if (isNaN(amount) || merchant === 'Unknown Merchant' || merchant.length > 40 || merchant.length < 2 || amount <= 0) {
                    continue;
                }

                transactions.push({
                    id: email.id,
                    date: finalIsoDate,
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
