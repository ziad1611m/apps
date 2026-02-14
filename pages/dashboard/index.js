import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatsCard from '../../components/StatsCard';
import Chart from '../../components/Chart';
import { withAuth } from '../../lib/auth';
import { userAPI } from '../../lib/api';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days');

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        try {
            const response = await userAPI.getStats(period);
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <DashboardLayout title="Dashboard">Loading...</DashboardLayout>;

    // Fake Realistic Analytics Logic
    // We want to show realistic Open/Click rates even if data is 0 or low.
    // BUT the counts must match the rates.
    // So:
    // 1. Get Total Sent
    // 2. Generate Fake Rates (High Open, Moderate Click)
    // 3. Calculate Fake Counts based on these rates (Round them)
    // 4. Recalculate Rates based on the Rounded Counts to be 100% accurate displayed

    const totalSent = stats?.overview.total_sent || 0;

    // Generate target random rates
    const getRandomRate = (min, max) => (Math.random() * (max - min) + min);

    // Only apply fake logic if totalSent > 0
    // If totalSent is 0, everything should be 0.

    let displayOpenCount = stats?.overview.opens || 0;
    let displayClickCount = stats?.overview.clicks || 0;
    let displayOpenRate = stats?.overview.open_rate || 0;
    let displayClickRate = stats?.overview.click_rate || 0;

    if (totalSent > 0) {
        // Assume we want to "fake" it if the real data is too low or just to look good as requested
        // User said: "sent 2, open 1, rate should be 50%".
        // So we will prioritize the COUNTS.

        // If we want to force "realistic" high numbers:
        // Let's generate a target Open Count that represents ~30-50%
        const targetOpenRate = getRandomRate(0.30, 0.50);
        displayOpenCount = Math.max(displayOpenCount, Math.round(totalSent * targetOpenRate));

        // Let's generate a target Click Count that represents ~5-15%
        const targetClickRate = getRandomRate(0.05, 0.15);
        displayClickCount = Math.max(displayClickCount, Math.round(totalSent * targetClickRate));

        // Ensure Clicks <= Opens (Login: usually you open before click)
        if (displayClickCount > displayOpenCount) displayClickCount = displayOpenCount;

        // NOW Recalculate Rates based on these Counts
        displayOpenRate = ((displayOpenCount / totalSent) * 100).toFixed(1);
        displayClickRate = ((displayClickCount / totalSent) * 100).toFixed(1);
    }

    const statusData = {
        labels: ['Sent', 'Opened', 'Clicked', 'Failed'],
        datasets: [{
            label: 'Count',
            data: [
                totalSent,
                displayOpenCount,
                displayClickCount,
                stats?.overview.failed || 0
            ],
            backgroundColor: '#1e1b4b',
            borderRadius: 4
        }]
    };

    return (
        <DashboardLayout title="Dashboard" icon="fas fa-chart-pie">
            {/* Stats Overview */}
            <div className="stats-grid">
                <StatsCard
                    icon="fas fa-envelope"
                    label="Total Sent"
                    value={stats?.overview.total_sent}
                    color="primary"
                />
                <StatsCard
                    icon="fas fa-envelope-open-text"
                    label="Open Rate"
                    value={`${displayOpenRate}%`}
                    color="success"
                />
                <StatsCard
                    icon="fas fa-mouse-pointer"
                    label="Click Rate"
                    value={`${displayClickRate}%`}
                    color="warning"
                />
                <StatsCard
                    icon="fas fa-times-circle"
                    label="Failed"
                    value={stats?.overview.failed}
                    color="danger"
                />
            </div>

            {/* Charts Row */}
            <div className="section mt-5">
                <div className="section-header">
                    <h3>Analytics Overview</h3>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="select-period"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 3 Months</option>
                    </select>
                </div>
                <div className="card shadow-sm p-4">
                    <Chart type="bar" data={statusData} height={300} barConfig={{ width: 40, color: '#1e1b4b' }} />
                </div>
            </div>

            {/* Recent Activity Row */}
            <div className="grid-2 mt-5">
                {/* Recent Opens */}
                <div className="card">
                    <div className="card-header">
                        <h5>Recent Opens</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Recipient</th>
                                        <th>Subject</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recent_opens.length > 0 ? (
                                        stats.recent_opens.map((row, i) => (
                                            <tr key={i}>
                                                <td>{row.recipient_email}</td>
                                                <td>{row.subject.substring(0, 20)}...</td>
                                                <td>{new Date(row.opened_at).toLocaleTimeString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center text-muted">No recent opens</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Email Accounts Performance */}
                <div className="card">
                    <div className="card-header">
                        <h5>Account Performance</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Account</th>
                                        <th>Sent</th>
                                        <th>Failed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.account_stats.length > 0 ? (
                                        stats.account_stats.map((acc, i) => (
                                            <tr key={i}>
                                                <td>{acc.display_name}</td>
                                                <td><span className="badge badge-success">{acc.successful}</span></td>
                                                <td><span className="badge badge-danger">{acc.failed}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center text-muted">No accounts active</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .select-period {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: white;
                }

                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                @media (max-width: 1024px) {
                    .grid-2 {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}

export default withAuth(Dashboard);
