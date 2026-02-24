import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import CumulativeSpend from './components/CumulativeSpend';
import CategoryBreakdown from './components/CategoryBreakdown';
import TransactionList from './components/TransactionList';
import { fetchCreditCardEmails } from './services/emailFetcher';
import { parseExpenseEmails } from './services/expenseParser';

function App() {
    const [transactions, setTransactions] = useState([]);
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("====== GOOGLE LOGIN SUCCESS TRIGGERED ======");
            console.log("Token Response:", tokenResponse);
            try {
                setIsLoading(true);
                setError(null);
                setUserToken(tokenResponse.access_token);

                console.log("Fetching emails from Google API...");
                const rawEmails = await fetchCreditCardEmails(tokenResponse.access_token);
                console.log(`Fetched ${rawEmails.length} emails. Parsing...`);

                const parsedTxs = await parseExpenseEmails(rawEmails, import.meta.env.VITE_GEMINI_API_KEY);
                console.log(`Parsed ${parsedTxs.length} transactions. Updating state...`);
                setTransactions(parsedTxs);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(`Failed to fetch from Gmail: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        },
        onError: errorResponse => {
            console.error('====== GOOGLE LOGIN ERROR TRIGGERED ======');
            console.error(errorResponse);
            setError(`Login failed: ${JSON.stringify(errorResponse)}`);
        },
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        prompt: 'select_account',
    });

    const handleLoginClick = () => {
        console.log("Login button clicked. Initiating Google Auth popup...");
        login();
    };

    const handleLogout = () => {
        setUserToken(null);
        setTransactions([]);
    };

    return (
        <div className="app-container">
            <header className="glass-panel header">
                <h1>Expense Tracker</h1>
                {userToken ? (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Connected</span>
                        <button className="btn-primary" onClick={handleLogout} style={{ background: 'var(--panel-border)' }}>Sign Out</button>
                    </div>
                ) : (
                    <button className="btn-primary" onClick={handleLoginClick} disabled={isLoading}>
                        {isLoading ? 'Connecting...' : 'Connect Gmail'}
                    </button>
                )}
            </header>

            {error && (
                <div style={{ color: 'var(--danger-color)', padding: '16px', background: 'rgba(248,81,73,0.1)', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            {userToken ? (
                <main className="dashboard-grid">
                    <CumulativeSpend transactions={transactions} />
                    <CategoryBreakdown transactions={transactions} />
                    <TransactionList transactions={transactions} />
                </main>
            ) : (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <h2>Welcome to Expense Tracker</h2>
                    <p className="subtitle" style={{ marginTop: '16px' }}>Connect your Gmail to securely analyze your credit card spend directly on your device.</p>
                </div>
            )}
        </div>
    );
}

export default App;
