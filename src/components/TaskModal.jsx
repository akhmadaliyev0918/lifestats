import React from 'react';
import './dashboard.css';

export default function TaskModal({ open, onClose, onSubmit, title, duration, setTitle, setDuration, isUpdate }) {
  if (!open) return null;
  return (
    <div className="modal-blur-bg">
      <div className="modal-card">
        <h2>{isUpdate ? 'Update Task' : 'Add Task'}</h2>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Duration (min)"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />
          <div className="modal-actions">
            <button type="submit">{isUpdate ? 'Update' : 'Add'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
