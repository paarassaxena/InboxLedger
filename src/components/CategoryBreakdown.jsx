import React, { useMemo } from 'react';
import './CategoryBreakdown.css'; // We'll create specific styles for the bars

const CategoryBreakdown = ({ transactions = [] }) => {
    const categoryTotals = useMemo(() => {
        const totals = {};
        transactions.forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + t.amount;
        });

        // Convert to sorted array
        return Object.entries(totals)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [transactions]);

    const grandTotal = useMemo(() => {
        return categoryTotals.reduce((sum, cat) => sum + cat.amount, 0);
    }, [categoryTotals]);

    if (categoryTotals.length === 0) {
        return (
            <div className="glass-panel categories-card" style={{ height: '100%' }}>
                <h2>By Category</h2>
                <div className="empty-state">No categories available</div>
            </div>
        );
    }

    return (
        <div className="glass-panel categories-card">
            <h2>By Category</h2>
            <div className="categories-list">
                {categoryTotals.map((cat, index) => {
                    const percentage = grandTotal > 0 ? (cat.amount / grandTotal) * 100 : 0;
                    return (
                        <div key={index} className="category-item">
                            <div className="category-header">
                                <span className="category-name">{cat.name}</span>
                                <span className="category-amount">
                                    ${cat.amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${percentage}%`,
                                        animationDelay: `${index * 0.1 + 0.5}s`
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBreakdown;
