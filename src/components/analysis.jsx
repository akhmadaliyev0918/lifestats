import React, { useState, useEffect, useRef } from 'react';
import './analysis.css';
import {
    getDateData,
    formatHoursMinutes,
    today,
    getLastDays,
    getMonthDays,
    getYearData,
    getGoalHours,
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
    const [completedTasks, setCompletedTasks] = useState(0);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [lifetimeCompletedTasks, setLifetimeCompletedTasks] = useState(0);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
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

        const taskStats = getTodayTaskStats();
        setCompletedTasks(taskStats.completedTasks);
        setCompletionPercentage(taskStats.completionPercentage);

        const lifetimeTaskStats = getLifetimeTaskStats();
        setLifetimeCompletedTasks(lifetimeTaskStats.completedTasks);
    };

    const goalSeconds = goalHours * 3600;

    // Haqiqiy max: real data yoki goal — qaysi katta bo'lsa shu
    const calcMax = (items, field = 'focus') => {
        const dataMax = items.length > 0 ? Math.max(...items.map(d => d[field] ?? 0)) : 0;
        return Math.max(dataMax, goalSeconds, 1);
    };

    // Y-axis labellari — maxdan 0 gacha 4 qadam
    const makeYLabels = (maxSec) =>
        [1, 2 / 3, 1 / 3, 0].map(ratio => {
            const val = ratio * maxSec;
            if (val === 0) return '0m';
            if (val < 3600) return Math.round(val / 60) + 'm';
            const h = Math.floor(val / 3600);
            const m = Math.round((val % 3600) / 60);
            return m > 0 ? `${h}h ${m}m` : `${h}h`;
        });

    const weekMax  = calcMax(weekData,  'focus');
    const monthMax = calcMax(monthData, 'focus');
    const yearMax  = calcMax(yearData,  'value');

    return (
        <div className="analysis-view">
            <div className="stats-page-title">Stats</div>

            {/* ── Today ── */}
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

            {/* ── This week ── */}
            <div className="stat-period-block">
                <div className="stat-period-header">
                    <span className="stat-period-title">This week</span>
                    <PeriodIcon />
                </div>
                <div className="stat-period-num-row">
                    <span className="stat-period-number">
                        {formatHoursMinutes(
                            weekData.length > 0
                                ? Math.round(weekData.reduce((a, d) => a + d.focus, 0) / 7)
                                : 0
                        )}
                    </span>
                    <span className="stat-period-desc">focus per day (avg)</span>
                </div>
                <div className="chart-wrap">
                    <div className="chart-y">
                        {makeYLabels(weekMax).map((lbl, i) => (
                            <span key={i} className="chart-y-lbl">{lbl}</span>
                        ))}
                    </div>
                    <div className="chart-area">
                        <BarChart
                            data={weekData.map(d => ({ ...d, value: d.focus }))}
                            max={weekMax}
                            goalSeconds={goalSeconds}
                        />
                        <div className="chart-x-labels">
                            {weekData.map((d, i) => (
                                <div key={i} className="chart-x-label">{d.label}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── This month ── */}
            <div className="stat-period-block">
                <div className="stat-period-header">
                    <span className="stat-period-title">This month</span>
                    <PeriodIcon />
                </div>
                <div className="stat-period-num-row">
                    <span className="stat-period-number">
                        {formatHoursMinutes(
                            monthData.length > 0
                                ? Math.round(monthData.reduce((a, d) => a + d.focus, 0) / monthData.length)
                                : 0
                        )}
                    </span>
                    <span className="stat-period-desc">focus per day (avg)</span>
                </div>
                <div className="chart-wrap">
                    <div className="chart-y">
                        {makeYLabels(monthMax).map((lbl, i) => (
                            <span key={i} className="chart-y-lbl">{lbl}</span>
                        ))}
                    </div>
                    <div className="chart-area">
                        <BarChart
                            data={monthData.map(d => ({ ...d, value: d.focus }))}
                            max={monthMax}
                            goalSeconds={goalSeconds}
                        />
                        <div className="chart-x-labels">
                            {monthData.map((d, i) => (
                                <div key={i} className="chart-x-label">
                                    {i % 3 === 0 ? d.label : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── This year ── */}
            <div className="stat-period-block">
                <div className="stat-period-header">
                    <span className="stat-period-title">This year</span>
                    <PeriodIcon />
                </div>
                <div className="stat-period-num-row">
                    <span className="stat-period-number">
                        {formatHoursMinutes(
                            yearData.length > 0
                                ? Math.round(yearData.reduce((a, d) => a + (d.value ?? 0), 0) / yearData.length)
                                : 0
                        )}
                    </span>
                    <span className="stat-period-desc">focus per day (avg)</span>
                </div>
                <div className="chart-wrap">
                    <div className="chart-y">
                        {makeYLabels(yearMax).map((lbl, i) => (
                            <span key={i} className="chart-y-lbl">{lbl}</span>
                        ))}
                    </div>
                    <div className="chart-area">
                        <LineChart
                            data={yearData.map(d => ({ ...d, value: d.value ?? 0 }))}
                            max={yearMax}
                            goalSeconds={goalSeconds}
                        />
                        <div className="chart-x-labels">
                            {yearData.map((d, i) => (
                                <div key={i} className="chart-x-label">{d.label}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Lifetime ── */}
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

/* ────────────────────────────────────────
   SHARED ICON
──────────────────────────────────────── */
const PeriodIcon = () => (
    <span className="stat-period-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    </span>
);

/* ────────────────────────────────────────
   BAR CHART
   Props:
     data[]      — { value: number (soniya), label: string }
     max         — barlar shunga nisbatan o'lchanadi
     goalSeconds — kesik chiziq qayerda bo'lishi kerak
──────────────────────────────────────── */
const CHART_H = 130;

const BarChart = ({ data, max, goalSeconds }) => {
    if (!data || data.length === 0) {
        return <div style={{ height: CHART_H }} />;
    }

    const safeMax = max > 0 ? max : 1;
    const drawH   = CHART_H - 4;

    // Goal chizig'i pastdan qancha px yuqorida (clamp: 1px..CHART_H-1px)
    const goalPx =
        goalSeconds > 0
            ? Math.min(CHART_H - 1, Math.max(1, Math.round((goalSeconds / safeMax) * drawH)))
            : null;

    return (
        /*
         * Tashqi wrapper — position:relative, fixed height.
         * Ichida ikkita layer:
         *   1) bars-row  — flex, align-items:flex-end (barlar)
         *   2) absolute overlays — goal chiziq va nuqta
         */
        <div style={{ position: 'relative', height: CHART_H, width: '100%' }}>

            {/* ── Bars ── */}
            <div
                style={{
                    position:      'absolute',
                    inset:         0,
                    display:       'flex',
                    alignItems:    'flex-end',
                    gap:           5,
                    borderBottom:  '1px solid rgba(255,255,255,0.08)',
                }}
            >
                {data.map((d, i) => {
                    const barH     = d.value > 0
                        ? Math.max(3, Math.round((d.value / safeMax) * drawH))
                        : 3;
                    const exceeds  = goalSeconds > 0 && d.value > goalSeconds;
                    // mint — oddiy kun, to'q sariq — maqsaddan oshgan kun
                    const color    = exceeds ? '#ff9f43' : (d.value > 0 ? '#a8e8c0' : '#2a3e2c');

                    return (
                        <div
                            key={i}
                            style={{
                                flex:         1,
                                display:      'flex',
                                flexDirection:'column',
                                alignItems:   'center',
                                justifyContent:'flex-end',
                                height:       '100%',
                            }}
                        >
                            <div
                                style={{
                                    width:           '100%',
                                    height:          barH,
                                    backgroundColor: color,
                                    borderRadius:    '4px 4px 0 0',
                                    transition:      'height 0.4s ease, background-color 0.3s ease',
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* ── Goal line overlay ── */}
            {goalPx !== null && (
                <>
                    {/* Kesik chiziq */}
                    <div
                        style={{
                            position:      'absolute',
                            left:          0,
                            right:         0,
                            bottom:        goalPx,
                            height:        0,
                            borderTop:     '1.5px dashed rgba(141,219,168,0.65)',
                            pointerEvents: 'none',
                            zIndex:        2,
                        }}
                    />
                    {/* Chap tomondagi yashil nuqta */}
                    <div
                        style={{
                            position:        'absolute',
                            left:            4,
                            bottom:          goalPx,
                            width:           8,
                            height:          8,
                            borderRadius:    '50%',
                            backgroundColor: '#8ddba8',
                            transform:       'translateY(50%)',
                            pointerEvents:   'none',
                            zIndex:          3,
                            boxShadow:       '0 0 6px rgba(141,219,168,0.6)',
                        }}
                    />
                </>
            )}
        </div>
    );
};

/* ────────────────────────────────────────
   LINE CHART  (SVG, responsive)
   Props:
     data[]      — { value: number (soniya), label: string }
     max         — Y o'qi shunga nisbatan
     goalSeconds — kesik chiziq
──────────────────────────────────────── */
const LineChart = ({ data, max, goalSeconds }) => {
    const containerRef = useRef(null);
    const [svgWidth, setSvgWidth]  = useState(500);

    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                const w = containerRef.current.offsetWidth;
                if (w > 0) setSvgWidth(w);
            }
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const H      = CHART_H;
    const W      = svgWidth;
    const padT   = 6;               // yuqori padding (nuqtalar kesilmasin)
    const padB   = 4;               // quyi padding
    const drawH  = H - padT - padB; // chizish maydoni balandligi
    const safeMax = max > 0 ? max : 1;

    /* value → SVG Y koordinatasi
       value=0   → y = padT + drawH  (pastki chegara)
       value=max → y = padT          (yuqori chegara) */
    const toY = (val) => {
        const ratio = Math.min(1, Math.max(0, val / safeMax));
        return padT + drawH * (1 - ratio);
    };

    if (!data || data.length === 0) {
        return <div ref={containerRef} style={{ height: H }} />;
    }

    const pts = data.map((d, i) => ({
        x: data.length > 1
            ? (i / (data.length - 1)) * (W - 2) + 1
            : W / 2,
        y:     toY(d.value),
        value: d.value,
    }));

    const linePath =
        pts.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
        ).join(' ');

    /* Gradient fill — pastki chegaraga yopiladi */
    const baseY  = (padT + drawH).toFixed(1);
    const fillPath =
        pts.length > 1
            ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${baseY} L ${pts[0].x.toFixed(1)} ${baseY} Z`
            : '';

    const goalY = goalSeconds > 0 ? toY(goalSeconds) : null;

    return (
        <div ref={containerRef} style={{ width: '100%' }}>
            <svg
                width="100%"
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                style={{ display: 'block', overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#8ddba8" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#8ddba8" stopOpacity="0.00" />
                    </linearGradient>
                </defs>

                {/* Kesik maqsad chizig'i */}
                {goalY !== null && (
                    <>
                        <line
                            x1={0} y1={goalY.toFixed(1)}
                            x2={W} y2={goalY.toFixed(1)}
                            stroke="rgba(141,219,168,0.50)"
                            strokeWidth="1.5"
                            strokeDasharray="4 6"
                        />
                        <circle
                            cx={0}
                            cy={goalY.toFixed(1)}
                            r={4}
                            fill="#8ddba8"
                        />
                    </>
                )}

                {/* Gradient fill */}
                {fillPath && (
                    <path d={fillPath} fill="url(#lineGradient)" />
                )}

                {/* Asosiy chiziq */}
                {linePath && (
                    <path
                        d={linePath}
                        stroke="#8ddba8"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Data nuqtalari */}
                {pts.map((p, i) => {
                    const exceeds = goalSeconds > 0 && p.value > goalSeconds;
                    return (
                        <circle
                            key={i}
                            cx={p.x.toFixed(1)}
                            cy={p.y.toFixed(1)}
                            r={3.5}
                            fill={exceeds ? '#ff9f43' : '#8ddba8'}
                            opacity={exceeds ? 1 : 0.75}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default Analysis;