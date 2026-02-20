import React, { useMemo, useState, useEffect, useRef } from 'react';

// Helper to check if a date is within the current month
const isCurrentMonth = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date(); // Use system time
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const CumulativeSpend = ({ transactions = [] }) => {
    const [threshold, setThreshold] = useState(() => {
        const saved = localStorage.getItem('amex_spend_threshold');
        return saved ? parseFloat(saved) : 5000;
    });

    // Track if we've already notified during this session to prevent spam
    const hasNotified = useRef(false);

    const total = useMemo(() => {
        return transactions
            .filter((t) => isCurrentMonth(t.date))
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const isExceeded = total > threshold;

    useEffect(() => {
        // Request notification permission if not already granted
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (isExceeded && !hasNotified.current && total > 0) {
            hasNotified.current = true;
            if (Notification.permission === 'granted') {
                new Notification('Amex Tracker Alert', {
                    body: `You have exceeded your monthly spend threshold of $${threshold}! Current spend: $${total.toFixed(2)}`,
                    icon: '/vite.svg'
                });
            }
        } else if (!isExceeded) {
            // reset if total drops below threshold (e.g. new month)
            hasNotified.current = false;
        }
    }, [isExceeded, total, threshold]);

    const handleThresholdChange = (e) => {
        const val = parseFloat(e.target.value) || 0;
        setThreshold(val);
        localStorage.setItem('amex_spend_threshold', val.toString());
        hasNotified.current = false; // reset notification state when threshold changes
    };

    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(total);

    return (
        <div className={`glass-panel cumulative-card ${isExceeded ? 'danger-state' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2>Cumulative Spend</h2>
                <div className="threshold-container">
                    <span className="subtitle">Limit: $</span>
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

            <div className="amount" style={isExceeded ? { background: 'none', WebkitTextFillColor: 'var(--danger-color)', color: 'var(--danger-color)' } : {}}>
                {formattedTotal}
            </div>
            <p className="subtitle">Month to Date Spend</p>

            {isExceeded && (
                <div className="alert-banner">
                    ⚠️ You have exceeded your monthly threshold!
                </div>
            )}
        </div>
    );
};

export default CumulativeSpend;
