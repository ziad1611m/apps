export default function StatsCard({ icon, label, value, color, change }) {
    const colorClass = color || 'primary';

    // Map colors to gradients
    const gradients = {
        primary: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        danger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    };

    const gradient = gradients[colorClass] || gradients.primary;

    return (
        <div className="stat-card">
            <div className="content">
                <div className="label">{label}</div>
                <div className="value">{value}</div>
                {change && (
                    <div className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
                        <i className={`fas fa-arrow-${change >= 0 ? 'up' : 'down'}`}></i>
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <div className={`icon`} style={{ background: gradient }}>
                <i className={icon}></i>
            </div>

            <style jsx>{`
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(241, 245, 249, 1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    transition: all 0.3s ease;
                    height: 100%;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }

                .icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    flex-shrink: 0;
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .value {
                    font-size: 24px;
                    font-weight: 700;
                    line-height: 1.2;
                    color: #1e293b;
                    letter-spacing: -0.5px;
                }

                .label {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .change {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    margin-top: 4px;
                    padding: 2px 8px;
                    border-radius: 20px;
                    width: fit-content;
                }

                .positive { color: #059669; background: #d1fae5; }
                .negative { color: #dc2626; background: #fee2e2; }
            `}</style>
        </div>
    );
}
