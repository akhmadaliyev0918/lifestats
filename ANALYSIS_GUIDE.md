# LifeGraph - Analysis Page Guide

## 📊 Analysis Page Overview

The Analysis page provides comprehensive insights into your focus habits and task completion patterns.

### Components

#### 1. **Stat Cards (Top Section)**
Four cards showing key metrics:
- **Focus per Day Average** - Average daily focus time this week (hours:minutes)
- **Tasks Completed per Day** - Average completed tasks per day this week
- **Focus Lifetime** - Total focus time accumulated (hours:minutes)
- **Tasks Completed** - Total completed tasks

#### 2. **Daily Focus Indicator**
Shows your progress toward today's focus goal:
- **Current Focus Time** - How much you've focused today
- **Target** - Your daily focus target (set in Settings)
- **Status** - "Goal Met" (green) or "In Progress" (blue)

#### 3. **Weekly Chart**
Bar chart showing the last 7 days:
- **Blue bars** - Days below target
- **Green bars** - Days where focus target was met
- Days of week labeled on bottom
- Time scale on left side

#### 4. **Monthly Chart**
Bar chart showing current month:
- **Yellow bars** - Shows focus time for each day
- All days of the current month
- Helps identify weekly patterns

#### 5. **Lifetime Chart**
Smooth line chart showing trend over time:
- **Red line** - Your long-term focus trend
- Shows all available data points
- Filled area beneath for visual impact
- Great for identifying seasonal patterns

---

## ⚙️ Settings Page

### Daily Focus Target
Set how much you want to focus each day:

**Options:**
1. Use time inputs (hours : minutes)
2. Click quick preset buttons: 1h, 1.5h, 2h, 2.5h, 3h
3. Current target shows in real-time

**Example:** 
- 2h 30m target means you need 150 minutes of focus time (completed task duration) to meet your goal for the day

### Goal & Deadline
Set your learning goal and target completion date:
- Motivates you to stay on track
- Displayed on the main dashboard

### Data Storage
Your data is stored locally in your browser:
- ✓ Privacy - Data never leaves your device
- ✓ Persistent - Survives browser restarts
- ⚠️ Caution - Clearing browser data will erase records

---

## 🧪 Testing with Mock Data

### Generate Test Data

Open browser console (F12 → Console) and run:

```javascript
import { generateMockData } from './utils/mockDataGenerator.js';
generateMockData(30);
```

This creates:
- 30 days of realistic task data
- Varying completion rates
- Mix of task durations
- Enables testing of all charts

### View Data Summary

```javascript
import { getDataSummary } from './utils/mockDataGenerator.js';
console.log(getDataSummary());
```

Shows:
- Total tasks created
- Number of active templates
- Days with data
- Total focus hours

### Backup and Restore

**Export Data:**
```javascript
import { exportData } from './utils/mockDataGenerator.js';
exportData(); // Downloads JSON file
```

**Restore Data:**
```javascript
import { importData } from './utils/mockDataGenerator.js';
// Then select the JSON file from file picker
```

### Clear All Data

```javascript
import { clearAllData } from './utils/mockDataGenerator.js';
clearAllData(); // ⚠️ Warning prompt appears
```

---

## 📈 How Focus Time is Calculated

### Focus Time = Sum of Completed Task Durations

Example:
- Task 1: 30 minutes (Completed) ✓
- Task 2: 45 minutes (Completed) ✓
- Task 3: 20 minutes (Pending) ✗

**Daily Focus Time = 30 + 45 = 75 minutes**

### Tips for Accurate Tracking
1. Set realistic task durations
2. Only mark tasks as done when genuinely completed
3. Regularly review your focus patterns
4. Adjust daily target if needed

---

## 🎯 Understanding the Metrics

### Average Calculations
- **Per Day Average** = Total / 7 days (for weekly) or Total / days in month
- Based on your actual completion patterns
- Helps identify if you're meeting goals

### Goal Met Indicator
- **Daily Indicator:**
  - 🟢 Green = Today's focus ≥ Daily target
  - 🔵 Blue = Today's focus < Daily target (still in progress)

- **Weekly Chart:**
  - 🟢 Green bars = Day exceeded or met target
  - 🔵 Blue bars = Day fell short

### Lifetime Trend
- Shows your consistency over time
- Upward trend = Improving habits
- Flat trend = Steady performance
- Peaks and valleys = Variable effort

---

## 💡 Best Practices

### Setting Focus Targets
1. Start with realistic target (2-3 hours)
2. Based on your current capacity
3. Gradually increase as confidence grows
4. Adjust for seasonal changes

### Task Duration Estimates
- Be honest about time requirements
- Track actual time, refine estimates
- Account for breaks and distractions
- Review after completing tasks

### Regular Reviews
- Check Analysis page weekly
- Identify patterns and blockers
- Celebrate goal achievements
- Adjust targets as needed

---

## ❓ Frequently Asked Questions

**Q: Why doesn't pending tasks count toward focus time?**
A: Focus time represents actual productive work. Only completed tasks demonstrate focus achievement.

**Q: Can I edit past data?**
A: Yes, go to Dashboard, select a date, and edit/delete tasks. Changes automatically update analytics.

**Q: How is daily average calculated?**
A: Total focus time this week ÷ 7 days (shows realistic daily capacity)

**Q: What if I don't complete tasks?**
A: They show in the chart as time still invested, but the incomplete status helps track reality.

**Q: Can I export my data?**
A: Yes! Use the export function to backup as JSON, or just use browser's built-in backup features.

---

## 🔧 Troubleshooting

**Charts not showing data:**
- Generate mock data first
- Or complete some real tasks in Dashboard
- Analysis needs task history to display

**Daily target changes not reflected:**
- Refresh the page
- Or navigate away and back to Analysis

**Data disappeared:**
- Check browser storage isn't cleared
- Use exported backup to restore
- Check browser console for errors

---

*Last Updated: March 8, 2026*
*LifeGraph Analysis Features v1.0*
