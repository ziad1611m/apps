import React from 'react';

export default function Chart({ type = 'line', data, height = 250, barConfig = {} }) {
    if (!data || !data.datasets || data.datasets.length === 0) {
        return (
            <div className="no-data" style={{ height }}>
                <i className="fas fa-chart-area"></i>
                <p>No data available</p>
            </div>
        );
    }

    const { labels, datasets } = data;
    const padding = 20;
    const width = 800; // SVG internal coordinate system width
    const chartHeight = height;

    // Find min and max for scaling
    const allValues = datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 5); // Ensure at least some height

    const chartWidth = width - (padding * 2);
    const chartAreaHeight = chartHeight - (padding * 2);

    const getX = (index) => padding + (index * (chartWidth / (labels.length - 1 || 1)));
    const getY = (value) => chartHeight - padding - ((value / maxValue) * chartAreaHeight);

    return (
        <div className="custom-chart-container" style={{ height }}>
            <svg viewBox={`0 0 ${width} ${chartHeight}`} className="chart-svg" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 0.4 }} />
                        <stop offset="100%" style={{ stopColor: '#818cf8', stopOpacity: 0 }} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#34d399', stopOpacity: 0.4 }} />
                        <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {(() => {
                    let ticks = [];
                    if (maxValue <= 5) {
                        ticks = [0, 1, 2, 3, 4, 5];
                    } else if (maxValue <= 10) {
                        ticks = [0, 2, 4, 6, 8, 10];
                    } else {
                        ticks = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(r * maxValue));
                    }

                    // Remove duplicates and sort
                    ticks = [...new Set(ticks)].sort((a, b) => a - b);

                    return ticks.map((value) => {
                        const ratio = value / maxValue;
                        const y = chartHeight - padding - (ratio * chartAreaHeight);
                        return (
                            <g key={value}>
                                <line
                                    x1={padding}
                                    y1={y}
                                    x2={width - padding}
                                    y2={y}
                                    stroke="#f1f5f9"
                                    strokeWidth="1"
                                />
                                <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
                                    {value}
                                </text>
                            </g>
                        );
                    });
                })()}

                {/* X-axis Labels */}
                {labels.map((label, i) => {
                    // Show fewer labels if too many
                    if (labels.length > 8 && i % 2 !== 0) return null;
                    return (
                        <text
                            key={i}
                            x={getX(i)}
                            y={chartHeight - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#94a3b8"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Datasets */}
                {datasets.map((dataset, setIndex) => {
                    const color = dataset.borderColor || dataset.backgroundColor || (setIndex === 0 ? '#6366f1' : '#10b981');
                    const gradId = setIndex === 0 ? 'url(#grad1)' : 'url(#grad2)';

                    if (type === 'bar') {
                        // Use fixed width if provided in barConfig, otherwise calculate dynamically
                        const fixedBarWidth = barConfig.width;
                        const defaultBarWidth = (chartWidth / labels.length) * 0.4;
                        const barWidth = fixedBarWidth || defaultBarWidth;

                        // Calculate gap to center the bar in its slot
                        const slotWidth = chartWidth / labels.length;
                        const centerOffset = (slotWidth - barWidth) / 2;

                        return dataset.data.map((val, i) => {
                            const barHeight = (val / maxValue) * chartAreaHeight;
                            const x = padding + (i * slotWidth) + centerOffset;
                            const y = chartHeight - padding - barHeight;

                            // Prevent negative height if val is 0
                            if (barHeight <= 0) return null;

                            return (
                                <g key={`${setIndex}-${i}`} className="chart-bar">
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={barConfig.color || color} // Use configured color if available
                                        rx="2"
                                        ry="2"
                                    />
                                    {/* Value label on top of bar */}
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        textAnchor="middle"
                                        fill="#1e293b"
                                        fontSize="12"
                                        fontWeight="600"
                                    >
                                        {val}
                                    </text>
                                    <title>{`${dataset.label}: ${val}`}</title>
                                </g>
                            );
                        });
                    }

                    // Line Chart Logic
                    const points = dataset.data.map((val, i) => `${getX(i)},${getY(val)}`).join(' ');
                    const areaPoints = `${getX(0)},${chartHeight - padding} ${points} ${getX(labels.length - 1)},${chartHeight - padding}`;

                    return (
                        <g key={setIndex}>
                            <path
                                d={`M ${areaPoints} Z`}
                                fill={gradId}
                            />
                            <polyline
                                points={points}
                                fill="none"
                                stroke={color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Hover Points */}
                            {dataset.data.map((val, i) => (
                                <g key={i} className="chart-point">
                                    <circle
                                        cx={getX(i)}
                                        cy={getY(val)}
                                        r="0"
                                        fill="white"
                                        stroke={color}
                                        strokeWidth="2"
                                        className="point-circle"
                                    />
                                    <title>{`${dataset.label}: ${val}`}</title>
                                </g>
                            ))}
                        </g>
                    );
                })}
            </svg>

            <div className="chart-legend">
                {datasets.map((d, i) => (
                    <div key={i} className="legend-item">
                        <span className="legend-dot" style={{ background: d.borderColor || d.backgroundColor || (i === 0 ? '#6366f1' : '#10b981') }}></span>
                        <span className="legend-text">{d.label}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .custom-chart-container {
                    width: 100%;
                    position: relative;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }
                .chart-svg {
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }
                .chart-legend {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 4px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .legend-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .legend-text {
                    font-size: 11px;
                    color: #64748b;
                    font-weight: 500;
                }
                
                /* Animations */
                .chart-point {
                    cursor: pointer;
                }
                .point-circle {
                    transition: r 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .custom-chart-container:hover .point-circle {
                    r: 4;
                }
                .chart-point:hover .point-circle {
                    r: 6;
                    stroke-width: 3;
                }

                .chart-bar rect {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .chart-bar:hover rect {
                    opacity: 0.8;
                    transform: scaleY(1.02); /* Subtle pop */
                }

                .no-data {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    gap: 8px;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .no-data i {
                    font-size: 24px;
                    opacity: 0.5;
                }
                .no-data p {
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
}
