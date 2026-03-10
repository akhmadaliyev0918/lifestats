import React, { useState, useEffect } from 'react';
import './analysis.css';
import {
    getDateData,
    formatHoursMinutes,
    today,
    getLastDays,
    getMonthDays,
    getYearData,
    getGoalHours,
    getTodayTotal,
    getLifetimeTotal,
    getTodayTaskStats,
    getLifetimeTaskStats
} from '../utils/focusTimerUtils';

const Analysis = () => {
    const [focusToday, setFocusToday] = useState(0);
    const [breakToday, setBreakToday] = useState(0);
    const [weekData, setWeekData] = useState([]);
    const [monthData, setMonthData] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [goalHours, setGoalHours] = useState(2);
    const [lifetimeTotal, setLifetimeTotal] = useState(0);
    const [todayTaskCompletion, setTodayTaskCompletion] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [lifetimeCompletedTasks, setLifetimeCompletedTasks] = useState(0);


    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const loadData = () => {
        const todayData = getDateData(today());
        setFocusToday(todayData.focus);
        setBreakToday(todayData.break);
        setWeekData(getLastDays(7));
        setMonthData(getMonthDays());
        setYearData(getYearData());
        setGoalHours(getGoalHours());
        setLifetimeTotal(getLifetimeTotal());

        // Load task completion stats
        const taskStats = getTodayTaskStats();
        setCompletedTasks(taskStats.completedTasks);
        setCompletionPercentage(taskStats.completionPercentage);

        // Load lifetime task stats
        const lifetimeTaskStats = getLifetimeTaskStats();
        setLifetimeCompletedTasks(lifetimeTaskStats.completedTasks);
    };

    const goalSeconds = goalHours * 3600;
    const todayGoalMet = focusToday >= goalSeconds;

    return (
        <div className="analysis-view">
            <div className="stats-page-title">Stats</div>

            {/* Today's stats */}
            <div className="stats-section-label">Today</div>
            <div className="stats-today-row">
                <div className="stat-today-card focus">
                    <div className="stat-today-label">Focus</div>
                    <div className="stat-today-value">{formatHoursMinutes(focusToday)}</div>
                </div>
                <div className="stat-today-card break">
                    <div className="stat-today-label">Break</div>
                    <div className="stat-today-value">{formatHoursMinutes(breakToday)}</div>
                </div>
                <div className="stat-today-card focus">
                    <div className="stat-today-label">Task</div>
                    <div className="stat-today-value">{completedTasks}</div>
                </div>
                <div className="stat-today-card break">
                    <div className="stat-today-label">Task %</div>
                    <div className="stat-today-value">{completionPercentage}%</div>
                </div>
            </div>

            {/* This week */}
            <div className="stat-period-block">
                <div className="stat-period-header">
                    <span className="stat-period-title">This week</span>
                    <span className="stat-period-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                </div>
                <div className="stat-period-num-row">
                    <span className="stat-period-number">
                        {formatHoursMinutes(weekData.length > 0 ? Math.round(weekData.reduce((a, d) => a + d.focus, 0) / 7) : 0)}
                    </span>
                    <span className="stat-period-desc">focus per day (avg)</span>
                </div>
                <div className="chart-wrap">
                    <div className="chart-y" id="y-week">
                        {[0, 33, 67, 100].map(pct => {
                            const max = Math.max(goalSeconds, 3600);
                            const val = (pct / 100) * max;
                            const label = val === 0 ? '0m' : val < 3600 ? Math.round(val / 60) + 'm' : (val / 3600).toFixed(1) + 'h';
                            return <span key={pct} className="chart-y-lbl">{label}</span>;
                        })}
                    </div>
                    <div className="chart-area">
                        <BarChart data={weekData} goalSeconds={goalSeconds} />
                        <div className="chart-x-labels">
                            {weekData.map((d, i) => (
                                <div key={i} className="chart-x-label">{d.label}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* This month */}
            <div className="stat-period-block">
                <div className="stat-period-header">
                    <span className="stat-period-title">This month</span>
                    <span className="stat-period-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                </div>
                <div className="stat-period-num-row">
                    <span className="stat-period-number">
                        {formatHoursMinutes(monthData.length > 0 ? Math.round(monthData.reduce((a, d) => a + d.focus, 0) / monthData.length) : 0)}
                    </span>
                    <span className="stat-period-desc">focus per day (avg)</span>
                </div>
                <div className="chart-wrap">
                    <div className="chart-y" id="y-month">
                        {[0, 33, 67, 100].map(pct => {
                            const max = Math.max(goalSeconds, 3600);
                            const val = (pct / 100) * max;
                            const label = val === 0 ? '0m' : val < 3600 ? Math.round(val / 60) + 'm' : (val / 3600).toFixed(1) + 'h';
                            return <span key={pct} className="chart-y-lbl">{label}</span>;
                        })}
                    </div>
                    <div className="chart-area">
                        <BarChart data={monthData} goalSeconds={goalSeconds} />
                        <div className="chart-x-labels">
                            {monthData.map((d, i) => (
                                <div key={i} className="chart-x-label">{i % 3 === 0 ? d.label : ''}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* This year */}
            <div className="stat-period-block">
                <div className="stat-period-header">
                    <span className="stat-period-title">This year</span>
                    <span className="stat-period-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                </div>
                <div className="stat-period-num-row">
                    <span className="stat-period-number">
                        {formatHoursMinutes(yearData.length > 0 ? Math.round(yearData.reduce((a, d) => a + d.value, 0) / yearData.length) : 0)}
                    </span>
                    <span className="stat-period-desc">focus per day (avg)</span>
                </div>
                <div className="chart-wrap">
                    <div className="chart-y" id="y-year">
                        {[0, 33, 67, 100].map(pct => {
                            const max = Math.max(goalSeconds, 3600);
                            const val = (pct / 100) * max;
                            const label = val === 0 ? '0m' : val < 3600 ? Math.round(val / 60) + 'm' : (val / 3600).toFixed(1) + 'h';
                            return <span key={pct} className="chart-y-lbl">{label}</span>;
                        })}
                    </div>
                    <div className="chart-area">
                        <LineChart data={yearData} goalSeconds={goalSeconds} />
                        <div className="chart-x-labels">
                            {yearData.map((d, i) => (
                                <div key={i} className="chart-x-label">{d.label}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lifetime */}
            <div className="stat-lifetime-container">
                <div className="stat-lifetime-block">
                    <div className="stat-lifetime-title">Lifetime Focus</div>
                    <div className="stat-lifetime-row">
                        <span className="stat-lifetime-number">{formatHoursMinutes(lifetimeTotal)}</span>
                        <span className="stat-lifetime-unit">total</span>
                    </div>
                </div>
                <div className="stat-lifetime-block">
                    <div className="stat-lifetime-title">Lifetime Tasks</div>
                    <div className="stat-lifetime-row">
                        <span className="stat-lifetime-number">{lifetimeCompletedTasks}</span>
                        <span className="stat-lifetime-unit">completed</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

// ═══ BAR CHART COMPONENT ═══
const BarChart = ({ data, goalSeconds }) => {
    const max = Math.max(goalSeconds, 3600);
    const H = 130;
    const chartH = H - 4;

    return (
        <div className="bar-chart-inner">
            {data.map((d, i) => {
                const h = d.focus ? Math.max(4, Math.round((d.focus / max) * chartH)) : 3;
                const cls = d.focus > 0 ? 'has-data' : '';
                const exceedsGoal = d.focus > goalSeconds;
                const barColor = exceedsGoal ? '#ff9f43' : '#b7c8d8';
                
                return (
                    <div key={i} className="bar-col">
                        <div className={`bar ${cls}`} style={{ height: h + 'px', backgroundColor: barColor }}></div>
                    </div>
                );
            })}
            {goalSeconds > 0 && (
                <>
                    <div
                        className="goal-line"
                        style={{ bottom: Math.round((goalSeconds / max) * chartH) + 'px' }}
                    ></div>
                    <div
                        className="goal-dot"
                        style={{ bottom: Math.round((goalSeconds / max) * chartH) + 'px' }}
                    ></div>
                </>
            )}
        </div>
    );
};

// ═══ LINE CHART COMPONENT ═══
const LineChart = ({ data, goalSeconds }) => {
    const max = Math.max(goalSeconds, 3600);
    const H = 130;
    const W = 600;
    const chartH = H - 10;

    const pts = data.map((d, i) => ({
        x: (i / (data.length - 1 || 1)) * (W - 2) + 1,
        y: H - (d.value / max) * chartH - 2
    }));

    let pathD = '';
    pts.forEach((p, i) => {
        if (i === 0) pathD += `M ${p.x} ${p.y}`;
        else pathD += ` L ${p.x} ${p.y}`;
    });

    return (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#96CCF8', stopOpacity: 0.28 }} />
                    <stop offset="100%" style={{ stopColor: '#96CCF8', stopOpacity: 0 }} />
                </linearGradient>
            </defs>

            {/* Goal line */}
            {goalSeconds > 0 && (
                <line
                    x1="0"
                    y1={H - (goalSeconds / max) * chartH - 2}
                    x2={W}
                    y2={H - (goalSeconds / max) * chartH - 2}
                    stroke="rgba(150, 204, 248, 0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="4,6"
                />
            )}

            {/* Gradient fill */}
            <path
                d={`${pathD} L ${pts[pts.length - 1]?.x || 0} ${H} L ${pts[0]?.x || 0} ${H} Z`}
                fill="url(#grad)"
            />

            {/* Line */}
            <path d={pathD} stroke="#96CCF8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {pts.map((p, i) => {
                const exceedsGoal = data[i].value > goalSeconds;
                const circleColor = exceedsGoal ? '#ff9f43' : '#96CCF8';
                const circleOpacity = exceedsGoal ? 1 : 0.6;
                return (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill={circleColor} opacity={circleOpacity} />
                );
            })}
        </svg>
    );
};

export default Analysis;
