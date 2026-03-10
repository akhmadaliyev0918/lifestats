import React, { useState, useEffect } from 'react';
import './setting.css';
import {
    getDurations,
    saveDurations,
    getSessionData,
    saveSessionData,
    getGoalHours,
    saveGoalHours,
    getSettings,
    saveSettings
} from '../utils/focusTimerUtils';
import {
    getGoalAndTerm,
    saveGoalAndTerm
} from '../utils/taskUtils';

const Setting = () => {
    const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 });
    const [sessLen, setSessLen] = useState(4);
    const [goalH, setGoalH] = useState(2);
    const [goalM, setGoalM] = useState(0);
    const [goalText, setGoalText] = useState('Learn React');
    const [term, setTerm] = useState('2027-05-25');
    const [settings, setAllSettings] = useState({ autoStart: false, dnd: false, aod: false });
    const [lastSaved, setLastSaved] = useState(null);
    const [activePanel, setActivePanel] = useState('timer');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        setDurations(getDurations());
        const sess = getSessionData();
        setSessLen(sess.sessLen);
        const goal = getGoalHours();
        setGoalH(Math.floor(goal));
        setGoalM(Math.round((goal % 1) * 60));
        setAllSettings(getSettings());
        const goalData = getGoalAndTerm();
        setGoalText(goalData.goal);
        setTerm(goalData.term);
    };

    const handleDurationChange = (type, delta) => {
        const min = type === 'short' ? 1 : 5;
        const max = type === 'short' ? 15 : 60;
        const newVal = Math.max(min, Math.min(max, durations[type] + delta));
        const newDurs = { ...durations, [type]: newVal };
        setDurations(newDurs);
    };

    const handleSave = () => {
        saveDurations(durations);
        saveSessionData({ sessDone: 0, sessLen });
        const totalGoal = goalH + (goalM / 60);
        saveGoalHours(totalGoal);
        saveSettings(settings);
        saveGoalAndTerm({ goal: goalText, term });
        setLastSaved(new Date());
    };

    const handleReset = () => {
        loadSettings();
        setLastSaved(null);
    };

    const toggleSetting = (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setAllSettings(newSettings);
    };

    return (
        <div className="setting-view">
            <div className="settings-layout">
                {/* Left Navigation */}
                <div className="settings-nav">
                    <button
                        className={`settings-nav-item ${activePanel === 'timer' ? 'active' : ''}`}
                        onClick={() => setActivePanel('timer')}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="13" r="8" />
                            <polyline points="12 9 12 13 15 13" />
                            <line x1="9.5" y1="2" x2="14.5" y2="2" />
                        </svg>
                        Timer
                    </button>
                    <button
                        className={`settings-nav-item ${activePanel === 'alarm' ? 'active' : ''}`}
                        onClick={() => setActivePanel('alarm')}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        Alarm
                    </button>
                    <button
                        className={`settings-nav-item ${activePanel === 'goal' ? 'active' : ''}`}
                        onClick={() => setActivePanel('goal')}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                        Goal
                    </button>
                    <button
                        className={`settings-nav-item ${activePanel === 'appear' ? 'active' : ''}`}
                        onClick={() => setActivePanel('appear')}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        Appearance
                    </button>
                    <button
                        className={`settings-nav-item ${activePanel === 'about' ? 'active' : ''}`}
                        onClick={() => setActivePanel('about')}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        About
                    </button>
                </div>

                {/* Right Panel */}
                <div>
                    {/* TIMER PANEL */}
                    {activePanel === 'timer' && (
                        <div className="settings-panel">
                            <div className="duration-group">
                                <div className="duration-card">
                                    <div className="duration-card-label">Focus</div>
                                    <div className="duration-card-value">{durations.focus}</div>
                                    <div className="duration-card-unit">minutes</div>
                                    <div className="duration-btns">
                                        <button className="dur-btn" onClick={() => handleDurationChange('focus', -5)}>−</button>
                                        <button className="dur-btn" onClick={() => handleDurationChange('focus', 5)}>+</button>
                                    </div>
                                </div>
                                <div className="duration-card">
                                    <div className="duration-card-label">Short Break</div>
                                    <div className="duration-card-value">{durations.short}</div>
                                    <div className="duration-card-unit">minutes</div>
                                    <div className="duration-btns">
                                        <button className="dur-btn" onClick={() => handleDurationChange('short', -1)}>−</button>
                                        <button className="dur-btn" onClick={() => handleDurationChange('short', 1)}>+</button>
                                    </div>
                                </div>
                                <div className="duration-card">
                                    <div className="duration-card-label">Long Break</div>
                                    <div className="duration-card-value">{durations.long}</div>
                                    <div className="duration-card-unit">minutes</div>
                                    <div className="duration-btns">
                                        <button className="dur-btn" onClick={() => handleDurationChange('long', -5)}>−</button>
                                        <button className="dur-btn" onClick={() => handleDurationChange('long', 5)}>+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <div className="settings-section-title">Session</div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                            <rect x="14" y="14" width="7" height="7" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text">
                                        <div className="settings-row-title">Session length</div>
                                        <div className="settings-row-sub">{sessLen} focus intervals per session</div>
                                    </div>
                                    <div className="settings-row-control" style={{ minWidth: '200px' }}>
                                        <input
                                            type="range"
                                            className="step-slider"
                                            min="1"
                                            max="10"
                                            value={sessLen}
                                            onChange={(e) => setSessLen(parseInt(e.target.value))}
                                        />
                                        <div className="slider-labels">
                                            <span>1</span>
                                            <span>5</span>
                                            <span>10</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                            <line x1="4" y1="22" x2="4" y2="15" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text">
                                        <div className="settings-row-title">Daily focus goal</div>
                                        <div className="settings-row-sub">{goalH}h {goalM}m per day</div>
                                    </div>
                                    <div className="settings-row-control" style={{ minWidth: '220px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ flex: '1' }}>
                                                <div style={{ fontSize: '10px', color: '#8c9299', marginBottom: '4px', fontWeight: '600' }}>Hours</div>
                                                <input
                                                    type="range"
                                                    className="step-slider"
                                                    min="0"
                                                    max="12"
                                                    value={goalH}
                                                    onChange={(e) => setGoalH(parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div style={{ flex: '1' }}>
                                                <div style={{ fontSize: '10px', color: '#8c9299', marginBottom: '4px', fontWeight: '600' }}>Minutes</div>
                                                <input
                                                    type="range"
                                                    className="step-slider"
                                                    min="0"
                                                    max="59"
                                                    step="5"
                                                    value={goalM}
                                                    onChange={(e) => setGoalM(parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section">
                                <div className="settings-section-title">Automation</div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                            <polygon points="5 4 15 12 5 20 5 4" />
                                            <path d="M19 5v14" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text">
                                        <div className="settings-row-title">Auto start next timer</div>
                                        <div className="settings-row-sub">Automatically begin the next session</div>
                                    </div>
                                    <div className="settings-row-control">
                                        <button
                                            className={`toggle ${settings.autoStart ? 'on' : ''}`}
                                            onClick={() => toggleSetting('autoStart')}
                                        >
                                            <div className="toggle-knob">{settings.autoStart ? '✓' : '✕'}</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ALARM PANEL */}
                    {activePanel === 'alarm' && (
                        <div className="settings-panel">
                            <div className="settings-section">
                                <div className="settings-section-title">Sound</div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text">
                                        <div className="settings-row-title">Alarm sound</div>
                                        <div className="settings-row-sub">End of session notification</div>
                                    </div>
                                    <div className="settings-row-control">
                                        <select className="settings-select">
                                            <option>Bell</option>
                                            <option>Chime</option>
                                            <option>Digital</option>
                                            <option>Forest</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text">
                                        <div className="settings-row-title">Volume</div>
                                    </div>
                                    <div className="settings-row-control" style={{ minWidth: '160px' }}>
                                        <input type="range" className="step-slider" min="0" max="100" defaultValue="80" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GOAL PANEL */}
                    {activePanel === 'goal' && (
                        <div className="settings-panel">
                            <div className="settings-section">
                                <div className="settings-section-title">Life Goal</div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text" style={{ flex: 1 }}>
                                        <div className="settings-row-title">Your Goal</div>
                                        <div className="settings-row-sub">What do you want to achieve?</div>
                                    </div>
                                </div>
                                <div style={{ padding: '0 18px 18px' }}>
                                    <input
                                        type="text"
                                        value={goalText}
                                        onChange={(e) => setGoalText(e.target.value)}
                                        placeholder="e.g., Learn React, Build Portfolio..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: '#262a2f',
                                            color: '#e0e3e8',
                                            fontFamily: 'Nunito, sans-serif',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => e.target.style.backgroundColor = '#30353c'}
                                        onBlur={(e) => e.target.style.backgroundColor = '#262a2f'}
                                    />
                                </div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text">
                                        <div className="settings-row-title">Target Date</div>
                                        <div className="settings-row-sub">When do you want to achieve it?</div>
                                    </div>
                                    <div className="settings-row-control">
                                        <input
                                            type="date"
                                            value={term}
                                            onChange={(e) => setTerm(e.target.value)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: '#262a2f',
                                                color: '#96CCF8',
                                                fontFamily: 'Nunito, sans-serif',
                                                fontSize: '13px',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* APPEARANCE PANEL */}
                    {activePanel === 'appear' && (
                        <div className="settings-panel">
                            <div className="settings-section">
                                <div className="settings-section-title">Theme</div>
                                <div className="settings-row">
                                    <div className="settings-row-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                    </div>
                                    <div className="settings-row-text">
                                        <div className="settings-row-title">Color scheme</div>
                                    </div>
                                    <div className="settings-row-control">
                                        <select className="settings-select">
                                            <option>Forest Green</option>
                                            <option>Ocean Blue</option>
                                            <option>Midnight</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ABOUT PANEL */}
                    {activePanel === 'about' && (
                        <div className="settings-panel">
                            <div className="settings-section">
                                <div className="settings-row">
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: '#96CCF8',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '26px',
                                        flexShrink: 0
                                    }}>
                                        ⏱
                                    </div>
                                    <div>
                                        <div className="settings-row-title" style={{ fontSize: '17px' }}>Focus Timer</div>
                                        <div className="settings-row-sub">Version 1.0 — Web Edition</div>
                                        <div style={{ fontSize: '12px', color: '#96CCF8', marginTop: '3px' }}>
                                            Focus Timer v1.0-react
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save/Reset buttons */}
            <div className="button-group" style={{ marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={handleSave}>
                    ✓ Save Settings
                </button>
                <button className="btn btn-secondary" onClick={handleReset}>
                    ↻ Reset
                </button>
            </div>

            {lastSaved && (
                <div className="success-message" style={{ marginTop: '20px' }}>
                    ✓ Settings saved successfully at {lastSaved.toLocaleTimeString()}
                </div>
            )}
        </div>
    );
};

export default Setting;
