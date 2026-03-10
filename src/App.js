import React, { useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import Dashboard from './components/dashboard';
import Analysis from './components/analysis';
import Focus from './components/focus';
import Setting from './components/setting';
import { api } from './services/api-simple';

// Global event — boshqa komponentlar ham tinglaydi
export const SYNC_EVENT = 'lifegraph:synced';

function App() {
  const pollInterval = useRef(null);
  const pushInterval = useRef(null);

  const pullAndNotify = useCallback(async () => {
    const changed = await api.syncFromServer();
    if (changed) {
      // O'zgarish bo'lsa barcha komponentlarga xabar beramiz
      window.dispatchEvent(new Event(SYNC_EVENT));
    }
  }, []);

  useEffect(() => {
    // App ochilganda darhol serverdan yuklaymiz
    pullAndNotify();

    // Har 10 soniyada polling — boshqa qurilmada o'zgarish bormi?
    pollInterval.current = setInterval(pullAndNotify, 10_000);

    // Har 30 soniyada push — lokal o'zgarishlarni yuboramiz
    pushInterval.current = setInterval(() => {
      if (navigator.onLine) api.push();
    }, 30_000);

    // Online bo'lganda darhol pull
    const onOnline = () => pullAndNotify();

    // Sahifadan chiqishda push
    const onUnload = () => api.push();

    window.addEventListener('online', onOnline);
    window.addEventListener('beforeunload', onUnload);

    // Debug
    window.lg = { push: api.push, pull: pullAndNotify };

    return () => {
      clearInterval(pollInterval.current);
      clearInterval(pushInterval.current);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [pullAndNotify]);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Sidebar />
          <div className="view-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/settings" element={<Setting />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
