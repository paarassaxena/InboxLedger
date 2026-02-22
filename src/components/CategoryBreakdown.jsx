import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#58a6ff', '#2ea043', '#f85149', '#cca700', '#d2a8ff', '#ff7b72', '#a5d6ff', '#79c0ff'];

const isCurrentMonth = (dateString, now) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const isCurrentYear = (dateString, now) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date.getFullYear() === now.getFullYear();
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    if (percent < 0.05) return null; // Don't show label if slice is too small
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>{payload[0].name}</p>
                <p style={{ margin: 0 }}>${payload[0].value.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

const CategoryBreakdown = ({ transactions = [] }) => {
    const { mtdData, ytdData } = useMemo(() => {
        const now = new Date();
        const mtdTotals = {};
        const ytdTotals = {};

        transactions.forEach(t => {
            if (isCurrentMonth(t.date, now)) {
                mtdTotals[t.category] = (mtdTotals[t.category] || 0) + t.amount;
            }
            if (isCurrentYear(t.date, now)) {
                ytdTotals[t.category] = (ytdTotals[t.category] || 0) + t.amount;
            }
        });

        const mtdAgg = Object.entries(mtdTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        const ytdAgg = Object.entries(ytdTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        return { mtdData: mtdAgg, ytdData: ytdAgg };
    }, [transactions]);

    return (
        <div className="glass-panel categories-card" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
                <h2>Month to Date</h2>
                <p className="subtitle" style={{ marginBottom: '16px' }}>Expense Categorization</p>
                {mtdData.length === 0 ? (
                    <div className="empty-state">No MTD expenses found</div>
                ) : (
                    <div style={{ height: 260, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mtdData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {mtdData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '32px' }}>
                <h2>Year to Date</h2>
                <p className="subtitle" style={{ marginBottom: '16px' }}>Expense Categorization</p>
                {ytdData.length === 0 ? (
                    <div className="empty-state">No YTD expenses found</div>
                ) : (
                    <div style={{ height: 260, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ytdData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {ytdData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryBreakdown;
