import React, { useMemo, useState, useEffect, useRef } from 'react';

// Helper to check if a date is within the current month
const isCurrentMonth = (dateString, now) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

// Helper to check if a date is within the current year
const isCurrentYear = (dateString, now) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date.getFullYear() === now.getFullYear();
};

const CumulativeSpend = ({ transactions = [] }) => {
    const [threshold, setThreshold] = useState(() => {
        const saved = localStorage.getItem('expense_spend_threshold');
        return saved ? parseFloat(saved) : 5000;
    });

    // Track if we've already notified during this session to prevent spam
    const hasNotified = useRef(false);

    const { mtdTotal, ytdTotal } = useMemo(() => {
        const now = new Date();
        let mtd = 0;
        let ytd = 0;

        transactions.forEach(t => {
            if (isCurrentMonth(t.date, now)) mtd += t.amount;
            if (isCurrentYear(t.date, now)) ytd += t.amount;
        });

        return { mtdTotal: mtd, ytdTotal: ytd };
    }, [transactions]);

    const isExceeded = mtdTotal > threshold;

    useEffect(() => {
        // Request notification permission if not already granted
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (isExceeded && !hasNotified.current && mtdTotal > 0) {
            hasNotified.current = true;
            if (Notification.permission === 'granted') {
                new Notification('Expense Tracker Alert', {
                    body: `You have exceeded your monthly spend threshold of $${threshold}! Current spend: $${mtdTotal.toFixed(2)}`,
                    icon: '/vite.svg'
                });
            }
        } else if (!isExceeded) {
            // reset if total drops below threshold (e.g. new month)
            hasNotified.current = false;
        }
    }, [isExceeded, mtdTotal, threshold]);

    const handleThresholdChange = (e) => {
        const val = parseFloat(e.target.value) || 0;
        setThreshold(val);
        localStorage.setItem('expense_spend_threshold', val.toString());
        hasNotified.current = false; // reset notification state when threshold changes
    };

    const formattedMtdTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(mtdTotal);

    const formattedYtdTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(ytdTotal);

    return (
        <div className={`glass-panel cumulative-card ${isExceeded ? 'danger-state' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2>Cumulative Spend</h2>
                <div className="threshold-container">
                    <span className="subtitle">MTD Limit: $</span>
                    <input
                        type="number"
                        className="threshold-input"
                        value={threshold}
                        onChange={handleThresholdChange}
                        step="100"
                        min="0"
                    />
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div className="amount" style={isExceeded ? { background: 'none', WebkitTextFillColor: 'var(--danger-color)', color: 'var(--danger-color)', margin: '0' } : { margin: '0' }}>
                        {formattedMtdTotal}
                    </div>
                    <p className="subtitle" style={{ marginTop: '8px' }}>Month to Date Spend</p>
                </div>

                <div style={{ textAlign: 'right', paddingBottom: '4px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {formattedYtdTotal}
                    </div>
                    <p className="subtitle" style={{ marginTop: '4px' }}>Year to Date Spend</p>
                </div>
            </div>

            {isExceeded && (
                <div className="alert-banner">
                    ⚠️ You have exceeded your monthly threshold!
                </div>
            )}
        </div>
    );
};

export default CumulativeSpend;
