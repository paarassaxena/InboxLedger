import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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
    let text = html.replace(/<[^>]*>?/gm, ' ');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&[a-z]+;/g, '');
    text = text.replace(/\*/g, '');
    return text.replace(/\s+/g, ' ').trim();
};

// Parses raw bank emails using Gemini LLM to reliably extract transaction details
export const parseExpenseEmails = async (rawEmails, apiKey) => {
    if (!apiKey) {
        console.warn('Gemini API key is missing. Ensure VITE_GEMINI_API_KEY is set in .env.local.');
        return [];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    merchant: { type: SchemaType.STRING, description: "Name of the merchant where the charge was made" },
                    amount: { type: SchemaType.NUMBER, description: "The single total dollar amount of the transaction as a number without currency symbols" },
                    date: { type: SchemaType.STRING, description: "The date of the transaction in YYYY-MM-DD format" }
                },
                required: ["merchant", "amount", "date"]
            }
        }
    });

    const transactions = [];

    // Local Storage caching to prevent repeating LLM queries and burning rate limit
    const CACHE_KEY = "expense_tracker_llm_cache";
    let cache = {};
    try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) cache = JSON.parse(stored);
    } catch (e) { console.warn("Cache parse error", e); }

    let cacheUpdated = false;
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (const email of rawEmails) {
        try {
            if (cache[email.id]) {
                transactions.push(cache[email.id]);
                continue; // Skip LLM call if already cached
            }

            const payloadToExtract = email.payload || email;
            const rawBody = extractEmailBody(payloadToExtract);
            const body = stripHtml(rawBody);

            // Check headers for date fallback
            const headers = email.payload?.headers || email.headers || [];
            const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');

            // Prevent non-financial generic junk from triggering false positives
            if (!body.includes('$') && !body.includes('Amount') && !body.includes('Charge')) {
                continue;
            }

            // Limit body size to not blow up context unnecessary for alerts
            const promptStr = `Extract the exact merchant name, total transaction dollar amount, and date from this credit card alert email text blob. Do not extract informational emails, only actual financial expenses/charges where a card was charged. If this is an informational update or spam without a specific financial charge, return 0 for amount.
            
Email Content:
${body.slice(0, 3000)}`;

            const result = await model.generateContent(promptStr);
            console.log(`Pinging Gemini for email ${email.id}...`);
            const responseText = result.response.text();

            const extracted = JSON.parse(responseText);

            // Sanity check
            if (extracted && typeof extracted.amount === 'number' && typeof extracted.merchant === 'string') {
                if (extracted.amount <= 0 || extracted.merchant.length < 2) continue; // Skip invalid or $0

                // Fallback date and standardizing formatting
                let finalDate = extracted.date;
                try {
                    finalDate = new Date(finalDate).toISOString();
                } catch {
                    finalDate = dateHeader ? new Date(dateHeader.value).toISOString() : new Date(parseInt(email.internalDate)).toISOString();
                }

                // Standardize merchant name
                let cleanMerchant = extracted.merchant.replace(/[\\*_~`$^]/g, '').trim();

                const tx = {
                    id: email.id,
                    date: finalDate,
                    amount: extracted.amount,
                    merchant: cleanMerchant,
                    category: categorizeMerchant(cleanMerchant)
                };

                transactions.push(tx);
                cache[email.id] = tx; // Add to cache dictionary
                cacheUpdated = true;

                // Rate limit padding to avoid 429 Too Many Requests
                await delay(350);
            }
        } catch (err) {
            console.error('Failed to parse email with Gemini: ', err);
            if (err.toString().includes("429")) {
                console.warn("Hit Gemini Rate Limit. Stopping early.");
                break; // Break loop on 429 quota exhaustion so we don't spam 50 errors in a row
            }
        }
    }

    if (cacheUpdated) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }

    return transactions;
};
