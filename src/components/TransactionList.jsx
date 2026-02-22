import React from 'react';
import './TransactionList.css';

const TransactionList = ({ transactions = [] }) => {
    if (transactions.length === 0) {
        return (
            <div className="glass-panel transactions-card">
                <h2>Recent Transactions</h2>
                <div className="empty-state">No transactions synced yet.</div>
            </div>
        );
    }

    // Filter for current year
    const currentYear = new Date().getFullYear();
    const currentYearTransactions = transactions
        .filter(t => new Date(t.date).getFullYear() === currentYear)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit to 20
    const recentTransactions = currentYearTransactions.slice(0, 20);

    return (
        <div className="glass-panel transactions-card">
            <div className="transactions-header">
                <h2>Recent Transactions</h2>
                <span className="badge">Showing {recentTransactions.length} of {currentYearTransactions.length} total</span>
            </div>

            <div className="transactions-table-container">
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Merchant</th>
                            <th>Category</th>
                            <th className="align-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.map((t) => {
                            const dateObj = new Date(t.date);
                            const formattedDate = dateObj.toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            });

                            return (
                                <tr key={t.id} className="transaction-row">
                                    <td className="col-date">{formattedDate}</td>
                                    <td className="col-merchant">{t.merchant}</td>
                                    <td className="col-category">
                                        <span className="category-tag">{t.category}</span>
                                    </td>
                                    <td className="col-amount align-right">
                                        ${t.amount.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionList;
