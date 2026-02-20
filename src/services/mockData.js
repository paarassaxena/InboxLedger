// Helper to generate a date relative to today
const getRelativeDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

export const generateMockTransactions = () => {
    return [
        {
            id: 'tx_1',
            date: getRelativeDate(1), // Yesterday
            amount: 45.50,
            merchant: 'Uber Eats',
            category: 'Food Delivery'
        },
        {
            id: 'tx_2',
            date: getRelativeDate(2),
            amount: 12.99,
            merchant: 'Netflix',
            category: 'Subscriptions'
        },
        {
            id: 'tx_3',
            date: getRelativeDate(5),
            amount: 150.00,
            merchant: 'AWS Cloud Services',
            category: 'Professional Services'
        },
        {
            id: 'tx_4',
            date: getRelativeDate(8),
            amount: 340.25,
            merchant: 'Delta Airlines',
            category: 'Travel'
        },
        {
            id: 'tx_5',
            date: getRelativeDate(12),
            amount: 85.00,
            merchant: 'Whole Foods Market',
            category: 'Groceries'
        },
        {
            id: 'tx_6',
            date: getRelativeDate(14),
            amount: 22.50,
            merchant: 'Starbucks',
            category: 'Food & Dining'
        },
        {
            id: 'tx_7',
            date: getRelativeDate(20),
            amount: 450.00,
            merchant: 'Marriott Hotels',
            category: 'Travel'
        },
        {
            id: 'tx_8',
            date: getRelativeDate(35), // Last month, shouldn't show in MTD
            amount: 60.00,
            merchant: 'Github',
            category: 'Subscriptions'
        },
        {
            id: 'tx_9',
            date: getRelativeDate(3),
            amount: 18.00,
            merchant: 'ChatGPT Express',
            category: 'Professional Services'
        }
    ];
};
