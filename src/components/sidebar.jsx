import React from 'react';
import './sidebar.css';
import { NavLink } from 'react-router-dom';

// icon URLs (could be moved to a shared file)
import dashboardUrl from '../source/icons/dashboard.svg';
import analysisUrl from '../source/icons/stats.svg';
import focusTimerUrl from '../source/icons/focus.svg';
import settingsUrl from '../source/icons/settings.svg';


const Sidebar = ({ active }) => {
  const items = [
    { to: '/', label: 'Dashboard', icon: dashboardUrl, key: 'dashboard' },
    { to: '/analysis', label: 'Analysis', icon: analysisUrl, key: 'analysis' },
    { to: '/focus', label: 'Focus Timer', icon: focusTimerUrl, key: 'focus-timer' },
    { to: '/settings', label: 'Settings', icon: settingsUrl, key: 'settings' },
  ];

  return (
    <div className="sidebar">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            `sidebar-item${isActive ? ' active' : ''}`
          }
        >
          <mdui-icon src={it.icon}></mdui-icon>
          {it.label}
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
