import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import CumulativeSpend from './components/CumulativeSpend';
import CategoryBreakdown from './components/CategoryBreakdown';
import TransactionList from './components/TransactionList';
import { fetchAmexEmails } from './services/emailFetcher';
import { parseAmexEmails } from './services/amexParser';

function App() {
    const [transactions, setTransactions] = useState([]);
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError(null);
                setUserToken(tokenResponse.access_token);

                // Fetch and parse emails using the access token
                const rawEmails = await fetchAmexEmails(tokenResponse.access_token);
                const parsedTxs = parseAmexEmails(rawEmails);
                setTransactions(parsedTxs);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch from Gmail. Make sure you granted permissions.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: errorResponse => {
            console.error('Login error:', errorResponse);
            setError('Login failed. Please check your Google Cloud Console config.');
        },
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
    });

    const handleLogout = () => {
        setUserToken(null);
        setTransactions([]);
    };

    return (
        <div className="app-container">
            <header className="glass-panel header">
                <h1>Amex Tracker</h1>
                {userToken ? (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Connected</span>
                        <button className="btn-primary" onClick={handleLogout} style={{ background: 'var(--panel-border)' }}>Sign Out</button>
                    </div>
                ) : (
                    <button className="btn-primary" onClick={() => login()} disabled={isLoading}>
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
                    <h2>Welcome to Amex Tracker</h2>
                    <p className="subtitle" style={{ marginTop: '16px' }}>Connect your Gmail to securely analyze your Amex spend directly on your device.</p>
                </div>
            )}
        </div>
    );
}

export default App;
