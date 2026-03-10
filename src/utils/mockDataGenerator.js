/**
 * Mock Data Generator
 * Creates realistic mock data for testing the application
 * 
 * Usage:
 * import { generateMockData } from './utils/mockDataGenerator';
 * generateMockData(30); // Generate 30 days of mock data
 */

import {
  saveTaskDictionary,
  saveActiveTasks,
  saveTaskHistory,
  formatDateKey,
  generateTaskId
} from './taskUtils';

// Sample task templates for varied data
const SAMPLE_TASKS = [
  { title: 'Learn React Hooks', duration: 45 },
  { title: 'Practice JavaScript', duration: 60 },
  { title: 'Study CSS Grid', duration: 30 },
  { title: 'Read Documentation', duration: 20 },
  { title: 'Code Review', duration: 40 },
  { title: 'Debug Project', duration: 90 },
  { title: 'Design Components', duration: 50 },
  { title: 'Refactor Code', duration: 75 },
  { title: 'Write Tests', duration: 55 },
  { title: 'Plan Architecture', duration: 60 },
  { title: 'API Integration', duration: 80 },
  { title: 'Database Design', duration: 45 },
  { title: 'Optimize Performance', duration: 70 },
  { title: 'Security Check', duration: 50 },
  { title: 'Documentation', duration: 35 }
];

/**
 * Generate random task duration between min and max
 */
function randomDuration(min = 15, max = 120) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random number between min and max
 */
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random items from array
 */
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate mock data for specified number of days
 * 
 * @param {number} days - Number of days to generate data for (going backwards from today)
 */
export function generateMockData(days = 30) {
  const dictionary = {};
  const activeTasks = [];
  const history = {};

  // Create active tasks (recurring template)
  const activeTaskCount = randomNum(3, 6);
  const selectedActiveTasks = getRandomItems(SAMPLE_TASKS, activeTaskCount);
  selectedActiveTasks.forEach(task => {
    const taskId = generateTaskId();
    dictionary[taskId] = [task.title, task.duration];
    activeTasks.push(taskId);
  });

  // Generate history for each day
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = formatDateKey(date);

    // Randomly select tasks for this day
    const dayTaskCount = randomNum(2, activeTasks.length);
    const selectedTasks = getRandomItems(activeTasks, dayTaskCount);

    // Randomly mark some as done (60-90% completion)
    const completionRate = randomNum(60, 90) / 100;
    const completedCount = Math.ceil(selectedTasks.length * completionRate);
    const completedTasks = selectedTasks.slice(0, completedCount);
    const pendingTasks = selectedTasks.slice(completedCount);

    // Sometimes add extra tasks (not in active template)
    if (Math.random() > 0.7) {
      const extraTask = getRandomItems(SAMPLE_TASKS, 1)[0];
      const extraId = generateTaskId();
      dictionary[extraId] = [extraTask.title, extraTask.duration];
      
      if (Math.random() > 0.5) {
        completedTasks.push(extraId);
      } else {
        pendingTasks.push(extraId);
      }
    }

    const doneStr = completedTasks.join(',');
    const pendingStr = pendingTasks.join(',');
    history[dateKey] = `${doneStr}|${pendingStr}`;
  }

  // Save all data
  saveTaskDictionary(dictionary);
  saveActiveTasks(activeTasks);
  saveTaskHistory(history);

  console.log(`✓ Mock data generated for ${days} days`);
  console.log(`  - Total unique tasks: ${Object.keys(dictionary).length}`);
  console.log(`  - Active tasks (template): ${activeTasks.length}`);
  console.log(`  - Days with data: ${Object.keys(history).length}`);
  
  return {
    taskCount: Object.keys(dictionary).length,
    activeTaskCount: activeTasks.length,
    daysWithData: Object.keys(history).length
  };
}

/**
 * Clear all mock data (reset application)
 */
export function clearAllData() {
  if (window.confirm('⚠️ This will delete ALL data. Are you sure?')) {
    localStorage.removeItem('ffv-taskDictionary');
    localStorage.removeItem('ffv-activeTasks');
    localStorage.removeItem('ffv-taskHistory');
    localStorage.removeItem('ffv-goalAndTerm');
    localStorage.removeItem('ffv-dailyFocusTarget');
    console.log('✓ All data cleared');
    window.location.reload();
  }
}

/**
 * Get data summary (for debugging)
 */
export function getDataSummary() {
  const dictionary = JSON.parse(localStorage.getItem('ffv-taskDictionary') || '{}');
  const activeTasks = JSON.parse(localStorage.getItem('ffv-activeTasks') || '[]');
  const history = JSON.parse(localStorage.getItem('ffv-taskHistory') || '{}');

  let totalFocusMinutes = 0;
  let completedTasks = 0;

  Object.values(history).forEach(dayData => {
    const [done, pending] = dayData.split('|');
    const doneIds = done ? done.split(',').filter(id => id) : [];
    completedTasks += doneIds.length;

    doneIds.forEach(id => {
      if (dictionary[id]) {
        totalFocusMinutes += dictionary[id][1] || 0;
      }
    });
  });

  return {
    totalTasksInDictionary: Object.keys(dictionary).length,
    activeTemplates: activeTasks.length,
    daysWithData: Object.keys(history).length,
    completedTasks,
    totalFocusMinutes: totalFocusMinutes,
    totalFocusHours: (totalFocusMinutes / 60).toFixed(1)
  };
}

/**
 * Export data as JSON (for backup)
 */
export function exportData() {
  const data = {
    taskDictionary: JSON.parse(localStorage.getItem('ffv-taskDictionary') || '{}'),
    activeTasks: JSON.parse(localStorage.getItem('ffv-activeTasks') || '[]'),
    taskHistory: JSON.parse(localStorage.getItem('ffv-taskHistory') || '{}'),
    goalAndTerm: JSON.parse(localStorage.getItem('ffv-goalAndTerm') || '{}'),
    dailyFocusTarget: parseInt(localStorage.getItem('ffv-dailyFocusTarget') || '120'),
    exportedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lifegraph-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  console.log('✓ Data exported');
}

/**
 * Import data from JSON file
 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.taskDictionary) saveTaskDictionary(data.taskDictionary);
        if (data.activeTasks) saveActiveTasks(data.activeTasks);
        if (data.taskHistory) saveTaskHistory(data.taskHistory);
        if (data.goalAndTerm) {
          localStorage.setItem('ffv-goalAndTerm', JSON.stringify(data.goalAndTerm));
        }
        if (data.dailyFocusTarget) {
          localStorage.setItem('ffv-dailyFocusTarget', String(data.dailyFocusTarget));
        }

        console.log('✓ Data imported');
        resolve(true);
      } catch (error) {
        console.error('✗ Import failed:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
