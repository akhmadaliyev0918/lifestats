import React, { useState, useEffect } from 'react';
import './focus.css';
import {
    getDurations,
    getSessionData,
    saveSessionData,
    getGoalHours,
    addFocusSeconds,
    addBreakSeconds,
    getDateData,
    formatSeconds,
    formatHoursMinutes,
    today
} from '../utils/focusTimerUtils';

const Focus = () => {
    const MODES = {
        focus: {
            label: 'Focus',
            rl: 'FOCUS',
            unt: '05:00',
            untype: 'Short break',
            badge: 'FOCUS',
            bc: 'focus',
            tips: [
                'Stay deep. Close distracting tabs. Full commitment to each interval.',
                'One task only. Pick a single task before starting.',
                'Build the streak. Each completed pomodoro compounds your focus.'
            ]
        },
        short: {
            label: 'Short Break',
            rl: 'SHORT BREAK',
            unt: '25:00',
            untype: 'Focus',
            badge: 'SHORT BREAK',
            bc: 'break',
            tips: [
                'Step away. Stand up, stretch, hydrate.',
                'Rest your eyes. Look away from the screen for 60 seconds.'
            ]
        },
        long: {
            label: 'Long Break',
            rl: 'LONG BREAK',
            unt: '25:00',
            untype: 'Focus',
            badge: 'LONG BREAK',
            bc: 'break',
            tips: [
                'Great work! You completed a full session. Take a real break.',
                'Reflect. What did you accomplish? What\'s the next priority?'
            ]
        }
    };

    const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 });
    const [curMode, setCurMode] = useState('focus');
    const [remainSec, setRemainSec] = useState(25 * 60);
    const [totalSec, setTotalSec] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [focusSec, setFocusSec] = useState(0);
    const [breakSec, setBreakSec] = useState(0);
    const [sessDone, setSessDone] = useState(0);
    const [sessLen, setSessLen] = useState(4);
    const [goalH, setGoalH] = useState(2);
    const [currentTip, setCurrentTip] = useState('');

    const C = 2 * Math.PI * 133; // circumference

    // Initialize data
    useEffect(() => {
        const durs = getDurations();
        setDurations(durs);
        const sess = getSessionData();
        setSessDone(sess.sessDone);
        setSessLen(sess.sessLen);
        setGoalH(getGoalHours());

        // Load today's data
        const todayData = getDateData(today());
        setFocusSec(todayData.focus);
        setBreakSec(todayData.break);

        // Set random tip
        const tips = MODES.focus.tips;
        setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, []);

    // Timer loop
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setRemainSec(prev => {
                if (prev > 0) {
                    const newVal = prev - 1;
                    if (curMode === 'focus') {
                        setFocusSec(f => f + 1);
                        addFocusSeconds(1);
                    } else {
                        setBreakSec(b => b + 1);
                        addBreakSeconds(1);
                    }
                    return newVal;
                } else {
                    // Timer complete
                    setIsRunning(false);
                    if (curMode === 'focus') {
                        setSessDone(s => s + 1);
                        saveSessionData({ sessDone: sessDone + 1, sessLen });
                    }
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, curMode, sessDone, sessLen]);

    const handleSetMode = (mode) => {
        setIsRunning(false);
        setCurMode(mode);
        const dur = durations[mode] * 60;
        setTotalSec(dur);
        setRemainSec(dur);
        const tips = MODES[mode].tips;
        setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    };

    const handleToggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        const dur = durations[curMode] * 60;
        setRemainSec(dur);
    };

    const handleSkip = () => {
        setIsRunning(false);
        const nextMode = curMode === 'focus' ? 'short' : 'focus';
        handleSetMode(nextMode);
    };

    const pct = remainSec / totalSec;
    const ringOffset = C * (1 - pct);

    return (
        <div className="focus-view">
            <div className="focus-container">
                {/* Mode tabs */}
                <div className="mode-tabs">
                    <button
                        className={`mode-tab ${curMode === 'focus' ? 'active' : ''}`}
                        onClick={() => handleSetMode('focus')}
                    >
                        Focus
                    </button>
                    <button
                        className={`mode-tab ${curMode === 'short' ? 'active' : ''}`}
                        onClick={() => handleSetMode('short')}
                    >
                        Short Break
                    </button>
                    <button
                        className={`mode-tab ${curMode === 'long' ? 'active' : ''}`}
                        onClick={() => handleSetMode('long')}
                    >
                        Long Break
                    </button>
                </div>

                {/* Main content */}
                <div className="focus-main">
                    {/* Left: Timer */}
                    <div className="focus-left">
                        {/* Ring */}
                        <div className={`ring-container ${isRunning ? 'running' : ''}`}>
                            <svg width="300" height="300" viewBox="0 0 300 300">
                                <circle className="ring-track" cx="150" cy="150" r="133" />
                                <circle
                                    className="ring-progress"
                                    cx="150"
                                    cy="150"
                                    r="133"
                                    style={{
                                        strokeDasharray: C,
                                        strokeDashoffset: ringOffset
                                    }}
                                />
                            </svg>
                            <div className="ring-inner">
                                <div className="timer-digits">{formatSeconds(remainSec)}</div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="timer-controls">
                            <button
                                className={`btn-play ${isRunning ? 'running' : ''}`}
                                onClick={handleToggleTimer}
                            >
                                {isRunning ? (
                                    <>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="6" y="4" width="4" height="16" />
                                            <rect x="14" y="4" width="4" height="16" />
                                        </svg>
                                        <span>Pause</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        <span>{remainSec === totalSec ? 'Start' : 'Resume'}</span>
                                    </>
                                )}
                            </button>
                            <button className="btn-round" onClick={handleReset} title="Reset (R)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                </svg>
                            </button>
                            <button className="btn-pill" onClick={handleSkip} title="Skip (S)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 4 15 12 5 20 5 4" />
                                    <line x1="19" y1="5" x2="19" y2="19" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="linear-progress">
                            <div className="linear-progress-fill" style={{ width: (pct * 100) + '%' }} />
                        </div>

                        {/* Up next */}
                        <div className="up-next-bar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                            <div className="up-next-content">
                                <div className="up-next-label">Up next</div>
                                <div className="up-next-info">
                                    <span className="up-next-time">{MODES[curMode].unt}</span>
                                    <span className="up-next-type">{MODES[curMode].untype}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="focus-right">
                        {/* Today stats */}
                        <div className="info-card">
                            <div className="info-card-title">Today</div>
                            <div className="today-mini-row">
                                <div className="today-mini-card focus">
                                    <div className="today-mini-label">Focus</div>
                                    <div className="today-mini-value">{formatHoursMinutes(focusSec)}</div>
                                </div>
                                <div className="today-mini-card break">
                                    <div className="today-mini-label">Break</div>
                                    <div className="today-mini-value">{formatHoursMinutes(breakSec)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Session progress */}
                        <div className="info-card">
                            <div className="info-card-title">Session Progress</div>
                            <div className="session-progress">
                                {Array.from({ length: sessLen }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`sess-dot ${i < sessDone % sessLen ? 'done' : ''}`}
                                    />
                                ))}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '11px', color: '#8ab88d' }}>
                                {sessDone % sessLen} of {sessLen} sessions done
                                {sessDone % sessLen === sessLen ? ' — Long break next!' : ''}
                            </div>
                        </div>

                        {/* Goal progress */}
                        <div className="info-card">
                            <div className="info-card-title">Daily Goal</div>
                            <div className="goal-bar-wrap">
                                <div className="goal-label-row">
                                    <span>{formatHoursMinutes(focusSec)} / {goalH}h 0m</span>
                                    <span className="goal-pct">
                                        {Math.min(100, Math.round((focusSec / (goalH * 3600)) * 100))}%
                                    </span>
                                </div>
                                <div className="linear-progress" style={{ height: '5px', marginTop: '0' }}>
                                    <div
                                        className="linear-progress-fill"
                                        style={{
                                            width: Math.min(100, (focusSec / (goalH * 3600)) * 100) + '%'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="info-card" style={{ background: '#2d4659', borderColor: 'transparent' }}>
                            <div className="info-card-title">Tip</div>
                            <div className="timer-tip">{currentTip}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Focus;
