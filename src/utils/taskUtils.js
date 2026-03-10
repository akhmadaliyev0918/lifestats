/**
 * Task Management Utilities
 * Handles data compression, packing/unpacking, and CRUD operations
 */

import { format } from 'date-fns';
import { getDateData } from './focusTimerUtils';
import { api } from '../services/api-simple';

// STORAGE KEYS
const STORAGE_KEYS = {
  TASK_DICTIONARY: 'ffv-taskDictionary',
  ACTIVE_TASKS: 'ffv-activeTasks',
  TASK_HISTORY: 'ffv-taskHistory',
  GOAL_AND_TERM: 'ffv-goalAndTerm',
  DAILY_FOCUS_TARGET: 'ffv-dailyFocusTarget'
};

/**
 * Get or initialize taskDictionary
 * Format: { "id": ["Title", Duration] }
 */
export function getTaskDictionary() {
  const data = localStorage.getItem(STORAGE_KEYS.TASK_DICTIONARY);
  return data ? JSON.parse(data) : {};
}

/**
 * Save taskDictionary to storage
 */
export function saveTaskDictionary(dict) {
  localStorage.setItem(STORAGE_KEYS.TASK_DICTIONARY, JSON.stringify(dict));
}

/**
 * Get or initialize activeTasks array
 * Format: ["id1", "id2", ...]
 */
export function getActiveTasks() {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TASKS);
  return data ? JSON.parse(data) : [];
}

/**
 * Save activeTasks to storage
 */
export function saveActiveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TASKS, JSON.stringify(tasks));
}

/**
 * Get or initialize taskHistory
 * Format: { "YYMMDD": "doneIds|pendingIds" }
 */
export function getTaskHistory() {
  const data = localStorage.getItem(STORAGE_KEYS.TASK_HISTORY);
  return data ? JSON.parse(data) : {};
}

/**
 * Save taskHistory to storage
 */
export function saveTaskHistory(history) {
  localStorage.setItem(STORAGE_KEYS.TASK_HISTORY, JSON.stringify(history));
}

/**
 * Get goal and term
 * Format: { goal: "string", term: "YYYY-MM-DD" }
 */
export function getGoalAndTerm() {
  const data = localStorage.getItem(STORAGE_KEYS.GOAL_AND_TERM);
  return data ? JSON.parse(data) : { goal: 'Learn React', term: '2027-05-25' };
}

/**
 * Save goal and term
 */
export function saveGoalAndTerm(goalData) {
  localStorage.setItem(STORAGE_KEYS.GOAL_AND_TERM, JSON.stringify(goalData));
}

/**
 * Format date to YYMMDD string for task history key
 */
export function formatDateKey(date) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Generate unique ID
 */
export function generateTaskId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * PACK: Convert task array to compressed string format
 * Input: [{ id, isDone }, ...]
 * Output: "doneIds|pendingIds" (e.g., "1,3,4|2,5")
 */
export function packTasks(tasks) {
  const doneIds = tasks.filter(t => t.isDone).map(t => t.id);
  const pendingIds = tasks.filter(t => !t.isDone).map(t => t.id);
  
  const doneStr = doneIds.join(',');
  const pendingStr = pendingIds.join(',');
  
  return `${doneStr}|${pendingStr}`;
}

/**
 * UNPACK: Convert compressed string to task array
 * Input: "1,3,4|2,5", taskDictionary
 * Output: [{ id, title, duration, isDone }, ...]
 */
export function unpackTasks(packedStr, taskDictionary) {
  if (!packedStr || !packedStr.includes('|')) {
    return [];
  }

  const [doneStr, pendingStr] = packedStr.split('|');
  const tasks = [];

  // Process done tasks
  if (doneStr && doneStr.trim()) {
    const doneIds = doneStr.split(',').filter(id => id && id.trim());
    doneIds.forEach(id => {
      if (taskDictionary[id]) {
        const [title, duration] = taskDictionary[id];
        tasks.push({
          id,
          title,
          duration,
          isDone: true
        });
      }
    });
  }

  // Process pending tasks
  if (pendingStr && pendingStr.trim()) {
    const pendingIds = pendingStr.split(',').filter(id => id && id.trim());
    pendingIds.forEach(id => {
      if (taskDictionary[id]) {
        const [title, duration] = taskDictionary[id];
        tasks.push({
          id,
          title,
          duration,
          isDone: false
        });
      }
    });
  }

  return tasks;
}

/**
 * ADD: Create new task
 * Saves to localStorage AND syncs to server via API
 */
export function addTask(title, duration) {
  console.group('📝 taskUtils.addTask()');
  console.log('Input:', { title, duration });

  const dictionary = getTaskDictionary();
  const activeTasks = getActiveTasks();
  const history = getTaskHistory();

  const newId = generateTaskId();
  dictionary[newId] = [title, duration || 0];
  activeTasks.push(newId);

  const today = formatDateKey(new Date());
  const todayData = history[today] || '|';
  const [done, pending] = todayData.split('|');
  const newPending = pending ? `${pending},${newId}` : newId;
  history[today] = `${done}|${newPending}`;

  saveTaskDictionary(dictionary);
  saveActiveTasks(activeTasks);
  saveTaskHistory(history);

  // Darhol serverga push
  api.push();

  return newId;
}

/**
 * DELETE: Remove task from current date
 */
export function deleteTask(taskId, date) {
  const activeTasks = getActiveTasks();
  const history = getTaskHistory();

  // Remove from activeTasks
  const activeIdx = activeTasks.indexOf(taskId);
  if (activeIdx !== -1) {
    activeTasks.splice(activeIdx, 1);
  }

  // Remove from taskHistory for the specific date
  const dateKey = formatDateKey(date);
  if (history[dateKey]) {
    const [done, pending] = history[dateKey].split('|');
    const newDone = done.split(',').filter(id => id && id !== taskId).join(',');
    const newPending = pending.split(',').filter(id => id && id !== taskId).join(',');
    history[dateKey] = `${newDone}|${newPending}`;
  }

  // DO NOT delete from dictionary (preserve history)

  saveActiveTasks(activeTasks);
  saveTaskHistory(history);
  api.push();
}

/**
 * EDIT: Update task (creates new entry in dictionary)
 */
export function editTask(oldId, newTitle, newDuration, date) {
  const dictionary = getTaskDictionary();
  const activeTasks = getActiveTasks();
  const history = getTaskHistory();

  const newId = generateTaskId();
  dictionary[newId] = [newTitle, newDuration || 0];

  // Update activeTasks
  const activeIdx = activeTasks.indexOf(oldId);
  if (activeIdx !== -1) {
    activeTasks[activeIdx] = newId;
  }

  // Update taskHistory
  const dateKey = formatDateKey(date);
  if (history[dateKey]) {
    const [done, pending] = history[dateKey].split('|');
    
    const newDone = done
      .split(',')
      .map(id => (id === oldId ? newId : id))
      .filter(id => id)
      .join(',');
    
    const newPending = pending
      .split(',')
      .map(id => (id === oldId ? newId : id))
      .filter(id => id)
      .join(',');

    history[dateKey] = `${newDone}|${newPending}`;
  }

  saveTaskDictionary(dictionary);
  saveActiveTasks(activeTasks);
  saveTaskHistory(history);
  api.push();

  return newId;
}

/**
 * TOGGLE: Mark task as done/pending for a date
 */
export function toggleTask(taskId, date, isDone) {
  const history = getTaskHistory();
  const dateKey = formatDateKey(date);

  if (!history[dateKey]) {
    history[dateKey] = `|${taskId}`;
  }

  const [done, pending] = history[dateKey].split('|');
  const doneIds = done ? done.split(',').filter(id => id) : [];
  const pendingIds = pending ? pending.split(',').filter(id => id) : [];

  // Remove from both
  const newDone = doneIds.filter(id => id !== taskId);
  const newPending = pendingIds.filter(id => id !== taskId);

  // Add to appropriate list
  if (isDone) {
    newDone.push(taskId);
  } else {
    newPending.push(taskId);
  }

  history[dateKey] = `${newDone.join(',')}|${newPending.join(',')}`;
  saveTaskHistory(history);
  api.debouncedPush(); // debounce: 800ms ichida ko'p marta bosishda faqat oxirgisi yuboriladi
}

/**
 * SAVE: Save tasks for a specific date
 */
export function saveTasksForDate(date, tasks) {
  const history = getTaskHistory();
  const dateKey = formatDateKey(date);
  const packedStr = packTasks(tasks);
  
  if (packedStr.trim() === '|' || !packedStr) {
    // Clear empty entries
    if (history[dateKey]) {
      delete history[dateKey];
    }
  } else {
    history[dateKey] = packedStr;
  }
  
  saveTaskHistory(history);
}

/**
 * LOAD: Get tasks for a specific date
 * If no history for this date, populate from activeTasks template
 */
export function loadTasksForDate(date) {
  const dictionary = getTaskDictionary();
  const history = getTaskHistory();
  const activeTasks = getActiveTasks();
  const dateKey = formatDateKey(date);

  let packedStr = history[dateKey];
  
  // If no history for this date, create from activeTasks template
  if (!packedStr && activeTasks.length > 0) {
    // All activeTasks start as pending (not done) for new dates
    packedStr = `|${activeTasks.join(',')}`;
    
    // Save this to history so it persists
    history[dateKey] = packedStr;
    saveTaskHistory(history);
  }
  
  return unpackTasks(packedStr, dictionary);
}

/**
 * Calculate stats for a date range
 */
export function calculateStats(startDate, endDate) {
  const history = getTaskHistory();
  let totalTasks = 0;
  let completedTasks = 0;
  let totalFocusMinutes = 0;

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const key = formatDateKey(currentDate);
    
    // Calculate task stats
    if (history[key]) {
      const [done, pending] = history[key].split('|');
      const doneCount = done && done.trim() ? done.split(',').filter(id => id).length : 0;
      const pendingCount = pending && pending.trim() ? pending.split(',').filter(id => id).length : 0;
      
      totalTasks += doneCount + pendingCount;
      completedTasks += doneCount;
    }
    
    // Calculate focus time from focus timer data
    const dateStr = currentDate.toISOString().slice(0, 10);
    const focusData = getDateData(dateStr);
    totalFocusMinutes += Math.floor(focusData.focus / 60);
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalFocusMinutes
  };
}

/**
 * Calculate stats for Today
 */
export function getStatsToday() {
  const today = new Date();
  return calculateStats(today, today);
}

/**
 * Calculate stats for this week
 */
export function getStatsThisWeek() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  return calculateStats(startOfWeek, today);
}

/**
 * Calculate stats for this month
 */
export function getStatsThisMonth() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return calculateStats(startOfMonth, today);
}

/**
 * Calculate stats for lifetime
 */
export function getStatsLifetime() {
  const history = getTaskHistory();
  const allKeys = Object.keys(history).sort();
  
  if (allKeys.length === 0) {
    return { totalTasks: 0, completedTasks: 0, completionRate: 0, totalFocusMinutes: 0 };
  }

  const firstKey = allKeys[0];
  const lastKey = allKeys[allKeys.length - 1];

  // Parse dates from keys
  const firstDate = new Date(`20${firstKey.slice(0, 2)}-${firstKey.slice(2, 4)}-${firstKey.slice(4, 6)}`);
  const lastDate = new Date(`20${lastKey.slice(0, 2)}-${lastKey.slice(2, 4)}-${lastKey.slice(4, 6)}`);

  return calculateStats(firstDate, lastDate);
}

/**
 * Get or initialize daily focus target (in minutes)
 */
export function getDailyFocusTarget() {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_FOCUS_TARGET);
  return data ? parseInt(data) : 120; // Default 2 hours
}

/**
 * Save daily focus target (in minutes)
 */
export function saveDailyFocusTarget(minutes) {
  localStorage.setItem(STORAGE_KEYS.DAILY_FOCUS_TARGET, String(minutes));
}

/**
 * Calculate total focus minutes (sum of completed task durations) for a date
 */
export function getFocusTimeForDate(date) {
  const dictionary = getTaskDictionary();
  const history = getTaskHistory();
  const dateKey = formatDateKey(date);
  
  if (!history[dateKey]) return 0;
  
  const [done] = history[dateKey].split('|');
  if (!done || !done.trim()) return 0;
  
  const doneIds = done.split(',').filter(id => id && id.trim());
  return doneIds.reduce((total, id) => {
    if (dictionary[id]) {
      const [, duration] = dictionary[id];
      return total + (duration || 0);
    }
    return total;
  }, 0);
}

/**
 * Get focus times for a range of dates
 * Returns array of { date, focusMinutes }
 */
export function getFocusTimesForRange(startDate, endDate) {
  const result = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const focusTime = getFocusTimeForDate(currentDate);
    result.push({
      date: new Date(currentDate),
      focusMinutes: focusTime
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

/**
 * Get weekly focus times (last 7 days including today)
 */
export function getWeeklyFocusTimes() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // End of week is Saturday of the same week
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return getFocusTimesForRange(startOfWeek, endOfWeek);
}

/**
 * Get monthly focus times (this month)
 */
export function getMonthlyFocusTimes() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return getFocusTimesForRange(startOfMonth, today);
}

/**
 * Get lifetime focus times
 */
export function getLifetimeFocusTimes() {
  const history = getTaskHistory();
  const allKeys = Object.keys(history).sort();
  
  if (allKeys.length === 0) {
    return [];
  }

  const firstKey = allKeys[0];
  const lastKey = allKeys[allKeys.length - 1];

  const firstDate = new Date(`20${firstKey.slice(0, 2)}-${firstKey.slice(2, 4)}-${firstKey.slice(4, 6)}`);
  const lastDate = new Date(`20${lastKey.slice(0, 2)}-${lastKey.slice(2, 4)}-${lastKey.slice(4, 6)}`);

  return getFocusTimesForRange(firstDate, lastDate);
}

/**
 * Get stats with focus times included
 */
export function getStatsWithFocusTime(startDate, endDate) {
  const history = getTaskHistory();
  const dictionary = getTaskDictionary();
  let totalTasks = 0;
  let completedTasks = 0;
  let totalFocusMinutes = 0;

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const key = formatDateKey(currentDate);
    if (history[key]) {
      const [done, pending] = history[key].split('|');
      const doneCount = done && done.trim() ? done.split(',').filter(id => id).length : 0;
      const pendingCount = pending && pending.trim() ? pending.split(',').filter(id => id).length : 0;
      
      totalTasks += doneCount + pendingCount;
      completedTasks += doneCount;
      
      // Calculate focus time from completed tasks
      if (done && done.trim()) {
        const doneIds = done.split(',').filter(id => id && id.trim());
        // eslint-disable-next-line no-loop-func
        doneIds.forEach(id => {
          if (dictionary[id]) {
            const [, duration] = dictionary[id];
            totalFocusMinutes += duration || 0;
          }
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalFocusMinutes
  };
}
