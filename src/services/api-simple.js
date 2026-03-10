/**
 * LIFEGRAPH SYNC SERVICE
 *
 * localStorage formatlari:
 *   ffv-taskDictionary  → { "localId": ["Title", duration] }
 *   ffv-taskHistory     → { "YYMMDD": "doneIds|pendingIds" }
 *   ffv-activeTasks     → ["localId1", "localId2"]
 *   ffv-goalAndTerm     → { goal, term }
 *   ffv-focusTimerDailyData → { "YYYY-MM-DD": { focus(sec), break(sec) } }
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LS = {
  DICT:    'ffv-taskDictionary',
  HISTORY: 'ffv-taskHistory',
  ACTIVE:  'ffv-activeTasks',
  GOAL:    'ffv-goalAndTerm',
  FOCUS:   'ffv-focusTimerDailyData',
};

const ls = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const http = async (endpoint, opts = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || res.status); }
  return res.json();
};

// Focus soniyalarni YYMMDD → daqiqaga
const focusToMinutesMap = (focusData) => {
  const result = {};
  Object.entries(focusData || {}).forEach(([iso, val]) => {
    const d = new Date(iso);
    const key = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    result[key] = Math.floor((val.focus || 0) / 60);
  });
  return result;
};

// ── Push lock: push ishlayotganda pull bloklanadi ─────────────────────────
let _pushInProgress = false;
let _pushTimer = null;

export const api = {
  isLoggedIn: () => true,
  getCurrentUser: () => ({ id: 'local-user' }),

  // Push ishlayotganmi? (polling bu flagni tekshiradi)
  isPushing: () => _pushInProgress,

  // ── PUSH: darhol yuborish (lock bilan) ───────────────────────────────────
  push: async () => {
    if (!navigator.onLine) return;
    _pushInProgress = true;
    try {
      await http('/sync/push', {
        method: 'POST',
        body: JSON.stringify({
          taskDictionary:  ls.get(LS.DICT, {}),
          taskHistory:     ls.get(LS.HISTORY, {}),
          activeTasks:     ls.get(LS.ACTIVE, []),
          goalAndTerm:     ls.get(LS.GOAL),
          focusMinutesMap: focusToMinutesMap(ls.get(LS.FOCUS, {})),
        })
      });
    } catch (e) {
      console.warn('push:', e.message);
    } finally {
      // Push tugagandan 2 soniya keyin lockni ochamiz
      // Shu 2 soniyada polling pull qilmaydi
      setTimeout(() => { _pushInProgress = false; }, 2000);
    }
  },

  // ── DEBOUNCED PUSH: tez-tez o'zgarishlarda (toggle spam) ─────────────────
  // 800ms ichida ko'p marta chaqirilsa, faqat oxirgisini yuboradi
  debouncedPush: () => {
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(() => api.push(), 800);
  },

  // ── PULL: serverdan lokalga (push lock bo'lsa o'tkazib yuboradi) ─────────
  syncFromServer: async () => {
    if (!navigator.onLine) return false;

    // Push ishlayotgan bo'lsa pull qilmaymiz — eski holat lokal ni buzishi mumkin
    if (_pushInProgress) {
      console.log('⏳ Push ishlayapti, pull o\'tkazib yuborildi');
      return false;
    }

    try {
      const data = await http('/sync/pull');
      if (!data.success) return false;

      // Push lock yana tekshiramiz (pull jarayonida push kelgan bo'lishi mumkin)
      if (_pushInProgress) return false;

      let changed = false;

      // Task dictionary
      if (data.taskDictionary) {
        const local = ls.get(LS.DICT, {});
        const serverKeys = new Set(Object.keys(data.taskDictionary));
        // Serverda yo'q lokallar (offline qo'shilgan)
        const offlineOnly = {};
        Object.entries(local).forEach(([k, v]) => {
          if (!serverKeys.has(k)) offlineOnly[k] = v;
        });
        const merged = { ...data.taskDictionary, ...offlineOnly };
        if (JSON.stringify(local) !== JSON.stringify(merged)) {
          ls.set(LS.DICT, merged);
          changed = true;
        }
      }

      // Active tasks — server ustunlik
      if (data.activeTasks !== undefined) {
        const local = ls.get(LS.ACTIVE, []);
        if (JSON.stringify(local) !== JSON.stringify(data.activeTasks)) {
          ls.set(LS.ACTIVE, data.activeTasks);
          changed = true;
        }
      }

      // Task history — SERVER USTUNLIK (bajarildi/bajarilmadi holati)
      if (data.taskHistory) {
        const local = ls.get(LS.HISTORY, {});
        if (JSON.stringify(local) !== JSON.stringify(data.taskHistory)) {
          ls.set(LS.HISTORY, data.taskHistory);
          changed = true;
        }
      }

      // Focus data
      if (data.focusData && Object.keys(data.focusData).length > 0) {
        const local = ls.get(LS.FOCUS, {});
        const merged = { ...local };
        let focusChanged = false;
        Object.entries(data.focusData).forEach(([dateKey, minutes]) => {
          const y = 2000 + parseInt(dateKey.slice(0,2));
          const m = parseInt(dateKey.slice(2,4)) - 1;
          const d = parseInt(dateKey.slice(4,6));
          const iso = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const serverSec = minutes * 60;
          if (!merged[iso] || merged[iso].focus < serverSec) {
            merged[iso] = { focus: serverSec, break: merged[iso]?.break || 0 };
            focusChanged = true;
          }
        });
        if (focusChanged) { ls.set(LS.FOCUS, merged); changed = true; }
      }

      // Goal
      if (data.goalAndTerm) {
        ls.set(LS.GOAL, data.goalAndTerm);
      }

      return changed;
    } catch (e) {
      console.warn('pull:', e.message);
      return false;
    }
  },

  syncToServer: async () => api.push(),

  // Moslik
  getTasks: () => {
    const dict = ls.get(LS.DICT, {});
    const active = ls.get(LS.ACTIVE, []);
    return active.map(id => ({
      _id: id, id,
      title: dict[id]?.[0] || '',
      duration: dict[id]?.[1] || 0,
      completed: false, isDone: false
    }));
  },
};

export default api;
