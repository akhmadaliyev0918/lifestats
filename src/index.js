import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { api } from './services/api-simple';

// Expose api for debugging in browser console
if (process.env.NODE_ENV === 'development') {
  window.lifegraphAPI = api;
  console.log('%c====== LIFEGRAPH DEBUG ======', 'color: #00ff00; font-weight: bold; font-size: 14px');
  console.log('Commands:');
  console.log('  window.lifegraphAPI.debug()  - Show full debug info');
  console.log('  window.lifegraphAPI.addTask({title:"Test", duration:60})  - Create task');
  console.log('  window.lifegraphAPI.getTasks()  - Get all tasks');
  console.log('  window.lifegraphAPI.syncFromServer()  - Sync from server');
  console.log('%c==============================', 'color: #00ff00; font-weight: bold; font-size: 14px');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
