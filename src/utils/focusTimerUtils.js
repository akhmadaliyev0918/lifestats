/**
 * Focus Timer Utilities
 * Handles focus/break time tracking and session management
 */

import { api } from '../services/api-simple';

const STORAGE_KEYS = {
  DAILY_DATA: 'ffv-focusTimerDailyData', // { date: { focus: seconds, break: seconds } }
  DURATIONS: 'ffv-focusTimerDurations', // { focus, short, long }
  SESSIONS: 'ffv-focusTimerSessions', // { sessDone, sessLen }
  GOAL_HOURS: 'ffv-focusTimerGoalHours', // number
  SETTINGS: 'ffv-focusTimerSettings' // { autoStart, dnd, aod, etc }
};

// Get today's date string (YYYY-MM-DD)
export function today() {
  return new Date().toISOString().slice(0, 10);
}

// ═══ DAILY DATA ═══
export function getDailyData() {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_DATA);
  return data ? JSON.parse(data) : {};
}

export function saveDailyData(data) {
  localStorage.setItem(STORAGE_KEYS.DAILY_DATA, JSON.stringify(data));
}

export function getDateData(dateStr) {
  const dailyData = getDailyData();
  return dailyData[dateStr] || { focus: 0, break: 0 };
}

export function addFocusSeconds(seconds, dateStr = null) {
  const d = dateStr || today();
  const dailyData = getDailyData();
  if (!dailyData[d]) dailyData[d] = { focus: 0, break: 0 };
  dailyData[d].focus += seconds;
  saveDailyData(dailyData);
  api.push();
}

export function addBreakSeconds(seconds, dateStr = null) {
  const d = dateStr || today();
  const dailyData = getDailyData();
  if (!dailyData[d]) dailyData[d] = { focus: 0, break: 0 };
  dailyData[d].break += seconds;
  saveDailyData(dailyData);
}

// ═══ DURATIONS ═══
export function getDurations() {
  const data = localStorage.getItem(STORAGE_KEYS.DURATIONS);
  return data ? JSON.parse(data) : { focus: 25, short: 5, long: 15 };
}

export function saveDurations(durations) {
  localStorage.setItem(STORAGE_KEYS.DURATIONS, JSON.stringify(durations));
}

// ═══ SESSIONS ═══
export function getSessionData() {
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return data ? JSON.parse(data) : { sessDone: 0, sessLen: 4 };
}

export function saveSessionData(data) {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data));
}

// ═══ GOAL ═══
export function getGoalHours() {
  const data = localStorage.getItem(STORAGE_KEYS.GOAL_HOURS);
  return data ? parseFloat(data) : 2;
}

export function saveGoalHours(hours) {
  localStorage.setItem(STORAGE_KEYS.GOAL_HOURS, String(hours));
}

// ═══ SETTINGS ═══
export function getSettings() {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : { autoStart: false, dnd: false, aod: false };
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// ═══ FORMATTING ═══
export function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatHoursMinutes(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// ═══ DATA AGGREGATION ═══
export function getLastDays(n) {
  const days = [];
  const dailyData = getDailyData();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.push({
      key,
      label: dayNames[d.getDay()],
      focus: (dailyData[key]?.focus || 0),
      break: (dailyData[key]?.break || 0)
    });
  }
  return days;
}

export function getMonthDays() {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = [];
  const dailyData = getDailyData();
  for (let i = 1; i <= Math.min(daysInMonth, 31); i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: String(i),
      focus: (dailyData[key]?.focus || 0),
      break: (dailyData[key]?.break || 0)
    });
  }
  return days;
}

export function getYearData() {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  const dailyData = getDailyData();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    let total = 0;
    Object.entries(dailyData).forEach(([k, v]) => {
      const kd = new Date(k);
      if (kd.getFullYear() === yr && kd.getMonth() === mo) total += v.focus;
    });
    data.push({ label: months[d.getMonth()], value: total });
  }
  return data;
}

export function getTodayTotal() {
  const data = getDateData(today());
  return data.focus + data.break;
}

export function getLifetimeTotal() {
  const dailyData = getDailyData();
  let total = 0;
  Object.values(dailyData).forEach(d => {
    total += (d.focus || 0) + (d.break || 0);
  });
  return total;
}

// ═══ TASK COMPLETION ═══
export function getTodayTaskStats() {
  const taskHistory = localStorage.getItem('ffv-taskHistory');
  const taskDictionary = localStorage.getItem('ffv-taskDictionary');
  
  if (!taskHistory || !taskDictionary) {
    return { completedTasks: 0, totalTasks: 0, completionPercentage: 0 };
  }

  const history = JSON.parse(taskHistory);
  const dateKey = formatTodayDateKey();
  const dayData = history[dateKey];

  if (!dayData) {
    return { completedTasks: 0, totalTasks: 0, completionPercentage: 0 };
  }

  const [doneStr, pendingStr] = dayData.split('|');
  const doneIds = doneStr ? doneStr.split(',').filter(id => id && id.trim()) : [];
  const pendingIds = pendingStr ? pendingStr.split(',').filter(id => id && id.trim()) : [];

  const completedTasks = doneIds.length;
  const totalTasks = doneIds.length + pendingIds.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { completedTasks, totalTasks, completionPercentage };
}

function formatTodayDateKey() {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function getLifetimeTaskStats() {
  const taskHistory = localStorage.getItem('ffv-taskHistory');
  
  if (!taskHistory) {
    return { completedTasks: 0, totalTasks: 0 };
  }

  const history = JSON.parse(taskHistory);
  let totalCompleted = 0;
  let totalCount = 0;

  Object.values(history).forEach(dayData => {
    if (!dayData) return;
    const [doneStr, pendingStr] = dayData.split('|');
    const doneIds = doneStr ? doneStr.split(',').filter(id => id && id.trim()) : [];
    const pendingIds = pendingStr ? pendingStr.split(',').filter(id => id && id.trim()) : [];
    
    totalCompleted += doneIds.length;
    totalCount += doneIds.length + pendingIds.length;
  });

  return { completedTasks: totalCompleted, totalTasks: totalCount };
}
