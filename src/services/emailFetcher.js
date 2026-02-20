// Helper to fetch emails from Gmail API using the access token
export const fetchAmexEmails = async (accessToken) => {
    try {
        // 1. Search for Amex emails
        // Standard Amex notification subjects often include "American Express", "transaction", "charge"
        // Adjust the query based on the exact format later
        const query = encodeURIComponent('from:American Express subject:Charge');
        const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=20`;

        const searchResponse = await fetch(searchUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!searchResponse.ok) {
            throw new Error(`Gmail search failed: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        const messages = searchData.messages || [];

        if (messages.length === 0) {
            return [];
        }

        // 2. Fetch full email details for each message
        const emailPromises = messages.map(async (msg) => {
            const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
            const msgResponse = await fetch(msgUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return msgResponse.json();
        });

        const fullEmails = await Promise.all(emailPromises);
        return fullEmails;
    } catch (error) {
        console.error('Error fetching Amex emails:', error);
        throw error;
    }
};
