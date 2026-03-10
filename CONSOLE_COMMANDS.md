# Console Commands for Testing

## 🚀 Quick Test Data Generation

### Small Test (1 hafta)
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.generateMockData(7);
})();
```

### Medium Test (1 oy)
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.generateMockData(30);
})();
```

### Large Test (3 oy)
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.generateMockData(90);
})();
```

### Extra Large Test (6 oy)
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.generateMockData(180);
})();
```

### Full Year Test
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.generateMockData(365);
})();
```

## 📊 View Data Summary
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  console.log(mod.getDataSummary());
})();
```

## 💾 Backup Your Data
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.exportData();
})();
```

## 🗑️ Clear All Data (⚠️ Be Careful!)
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.clearAllData();
})();
```

## 🔄 Clear and Generate Fresh
```javascript
(async () => {
  const mod = await import('./src/utils/mockDataGenerator.js');
  mod.clearAllData();
  // Wait for confirmation, then run:
  mod.generateMockData(90);
})();
```

---

**Steps:**
1. Open Browser Console (F12)
2. Go to "Console" tab
3. Copy one of the commands above
4. Paste it
5. Press Enter
6. Go to Analysis page → See updated data!
