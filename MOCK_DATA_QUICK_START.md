# Mock Data Generator - Quick Start Guide

## 🚀 Quick Setup (2 minutes)

### Step 1: Open Browser Console
- Press `F12` (or `Cmd+Option+I` on Mac)
- Go to "Console" tab

### Step 2: Generate Mock Data
Copy and paste this command:

```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.generateMockData(30);
})();
```

You should see:
```
✓ Mock data generated for 30 days
  - Total unique tasks: 45
  - Active tasks (template): 5
  - Days with data: 30
```

### Step 3: View the Data
1. Go to **Analysis** page → You should see charts with data!
2. Go to **Dashboard** page → Select past dates to see task history
3. Go to **Settings** page → Set daily focus target

---

## 📊 What Gets Generated

**30 days of realistic data with:**
- 3-7 random tasks per template
- 60-90% task completion rate
- Varied task durations (15-120 minutes)
- Occasional extra tasks
- Natural variation day-to-day

---

## 🔧 Useful Console Commands

### Check Your Data
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  console.log(mod.getDataSummary());
})();
```

**Output shows:**
- Total tasks in dictionary
- Active template count
- Days with data
- Total completed tasks
- Total focus hours

### Backup Your Data
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.exportData();
})();
```

Downloads a JSON file you can restore later.

### Clear Everything (⚠️ Careful!)
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.clearAllData();
})();
```

System will ask for confirmation before clearing.

---

## 📈 Testing the Analysis Page

After generating mock data:

1. **Check Stat Cards**
   - Should show averages and lifetime stats
   - Values should make sense (hours and minutes format)

2. **Check Daily Indicator**
   - Today's focus time shown
   - Compare against target (default 2 hours)
   - Color indicates status

3. **Check Weekly Chart**
   - 7 bars for last 7 days
   - Some green (goals met), some blue (in progress)
   - Labels and values visible

4. **Check Monthly Chart**
   - Many small bars for current month
   - Yellow color
   - Should have similar heights (realistic variation)

5. **Check Lifetime Chart**
   - Smooth red line showing trend
   - Points visible for each day
   - Shaded area below line

---

## 🎯 Testing Different Scenarios

### Test Daily Target Meeting
1. Go to Settings
2. Set daily target to 60 minutes (1 hour)
3. Today's focus must be ≥ 60 to see green indicator

### Test Different Time Ranges
1. Use Dashboard to create tasks on specific dates
2. Analysis automatically updates
3. Watch charts change in real-time

### Test Data Persistence
1. Generate mock data
2. View Analysis page
3. Close browser completely
4. Reopen app → Data still there!

---

## 🐛 Troubleshooting

**Charts Empty After Generating Data?**
- Refresh the page (F5)
- Check console for errors
- Verify mock data generated (check console output)

**Daily Indicator Not Changing Color?**
- Check if today's focus ≥ daily target
- Edit tasks on today's date to increase focus time

**Can't Import Console Commands?**
- Make sure you're using modern browser (Chrome, Firefox, Edge)
- Check if JavaScript is enabled

---

## 💡 Pro Tips

### Combine Real & Mock Data
1. Generate mock data (30 days back)
2. Create real tasks starting today
3. Real data gradually replaces mock data

### Adjust Data Quickly
1. Go to Dashboard
2. Edit specific date's tasks
3. Analysis updates automatically

### Test Edge Cases
- Edit tasks to create extreme daily values
- Set very high/low daily targets
- Run multiple days without completing tasks

---

## 📝 What to Test

Create a checklist:
- [ ] Mock data generates without errors
- [ ] Analysis page displays all 4 charts
- [ ] Stat cards show reasonable numbers
- [ ] Daily indicator reflects daily target
- [ ] Charts update when you change dates
- [ ] Settings save and persist
- [ ] Page is responsive on mobile
- [ ] Data persists after refresh

---

## 🎓 Learning Resources

### Files to Review
- `src/components/analysis.jsx` - Chart components
- `src/utils/taskUtils.js` - Data calculation logic
- `src/components/setting.jsx` - Settings management
- `src/utils/mockDataGenerator.js` - Data generation

### Key Concepts
- **Focus Time** = Sum of completed task durations
- **Daily Target** = Minutes you want to achieve daily
- **Goal Met** = Daily focus ≥ daily target
- **Completion Rate** = (Completed / Total) × 100

---

## 🚀 Moving to Real Data

When ready to use real data:
1. Delete mock data: `clearAllData()` (or let it naturally fade)
2. Use Dashboard to create real tasks
3. Set accurate durations
4. Watch analysis build over time

Real data integration is automatic - no code changes needed!

---

**Created:** March 8, 2026  
**LifeGraph Mock Data Generator v1.0**
