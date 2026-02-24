// Helper to fetch emails from Gmail API using the access token
export const fetchCreditCardEmails = async (accessToken) => {
    try {
        // 1. Search for credit card expense emails across major banks
        // Correctly parenthesize the sender addresses so AND applies to all of them, not just Bank of America.
        const query = encodeURIComponent('((from:americanexpress OR from:chase OR from:capitalone OR from:citi OR from:discover OR from:bankofamerica OR from:usbank) AND (subject:charge OR subject:transaction OR subject:receipt OR subject:alert))');
        // Restore to 200 so we don't truncate valid older Amex emails behind a wall of Discover spam
        const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=200`;

        const searchResponse = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!searchResponse.ok) {
            throw new Error(`Gmail search failed: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        const messages = searchData.messages || [];

        if (messages.length === 0) return [];

        const fullEmails = [];
        // Fetch in batches of 25 to respect the 250 unit/sec Gmail API quota (messages.get = 5 units)
        const BATCH_SIZE = 25;
        for (let i = 0; i < messages.length; i += BATCH_SIZE) {
            const batch = messages.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (msg) => {
                const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
                const msgResponse = await fetch(msgUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (msgResponse.ok) {
                    return msgResponse.json();
                } else if (msgResponse.status === 429) {
                    // Retry once on 429
                    await new Promise(r => setTimeout(r, 1000));
                    const retry = await fetch(msgUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
                    if (retry.ok) return retry.json();
                }
                return null;
            });

            const batchResults = await Promise.all(batchPromises);
            fullEmails.push(...batchResults.filter(Boolean));

            // Wait 500ms between batches to fully clear the rolling rate limit window
            if (i + BATCH_SIZE < messages.length) {
                await new Promise(r => setTimeout(r, 500));
            }
        }

        return fullEmails;
    } catch (error) {
        console.error('Error fetching credit card emails:', error);
        throw error;
    }
};
