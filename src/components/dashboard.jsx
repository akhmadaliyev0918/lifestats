import React from 'react';
import './dashboard.css';
import addUrl from '../source/icons/add.svg';
import 'mdui/components/checkbox.js';
import { useState, useEffect, useRef } from 'react';
import TaskModal from './TaskModal';
import { format, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api-simple';
import { SYNC_EVENT } from '../App';
import {
  getGoalAndTerm,
  loadTasksForDate,
  saveTasksForDate,
  addTask,
  deleteTask,
  editTask,
  toggleTask,
  getStatsToday,
  getStatsThisWeek,
  getStatsThisMonth,
  getStatsLifetime,
  formatDateKey,
  getTaskHistory
} from '../utils/taskUtils';
const Dashboard = () => {
    const [date, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedStat, setSelectedStat] = useState('today');
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, completionRate: 0, totalFocusMinutes: 0 });
    const [goalAndTerm, setGoalAndTerm] = useState({ goal: 'Learn React', term: '2027-05-25' });
    const underlineRef = useRef(null);
    const prevDateRef = useRef(date);
    const statRefs = {
      today: useRef(null),
      week: useRef(null),
      month: useRef(null),
      lifetime: useRef(null)
    };

    const dateStr = format(date, 'yyyy-MM-dd');

    // App ochilganda va server sync bo'lganda UI yangilanadi
    useEffect(() => {
        loadData();

        // App.js polling dan signal kelganda UI yangilaymiz
        const onSync = () => loadData();
        window.addEventListener(SYNC_EVENT, onSync);
        return () => window.removeEventListener(SYNC_EVENT, onSync);
    }, []);

    function loadTasks() {
        loadData();
    }

    useEffect(() => {
        // Save current date's tasks before loading new date
        if (prevDateRef.current) {
            const lastDateStr = format(prevDateRef.current, 'yyyy-MM-dd');
            const currentDateStr = format(date, 'yyyy-MM-dd');
            
            // If date has changed, save previous date's tasks
            if (lastDateStr !== currentDateStr && tasks) {
                saveTasksForDate(prevDateRef.current, tasks);
            }
        }
        
        // Update reference to current date
        prevDateRef.current = new Date(date);
        
        // Load tasks for the new date
        loadData();
        const goalData = getGoalAndTerm();
        setGoalAndTerm(goalData);
    }, [dateStr]);

    useEffect(() => {
        updateStats();
        updateUnderlinePosition();
    }, [selectedStat]);

    function loadData() {
        const tasksForDate = loadTasksForDate(date);
        setTasks(tasksForDate);
        
        // Build heatmap data from history
        const history = getTaskHistory();
        const heatmap = Object.keys(history).map(key => {
            const [done, pending] = history[key].split('|');
            const doneCount = done && done.trim() ? done.split(',').filter(id => id).length : 0;
            const pendingCount = pending && pending.trim() ? pending.split(',').filter(id => id).length : 0;
            
            return {
                date: key,
                completed_tasks: doneCount,
                total_tasks: doneCount + pendingCount
            };
        });
        setHeatmapData(heatmap);
    }

    function updateStats() {
        let statsData;
        
        switch (selectedStat) {
            case 'week':
                statsData = getStatsThisWeek();
                break;
            case 'month':
                statsData = getStatsThisMonth();
                break;
            case 'lifetime':
                statsData = getStatsLifetime();
                break;
            case 'today':
            default:
                statsData = getStatsToday();
        }
        
        setStats(statsData);
    }

    function updateUnderlinePosition() {
        const currentRef = statRefs[selectedStat];
        if (currentRef?.current && underlineRef?.current) {
            const element = currentRef.current;
            underlineRef.current.style.width = `${element.offsetWidth}px`;
            underlineRef.current.style.left = `${element.offsetLeft}px`;
        }
    }

    async function handleAddTask(e) {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        
        const duration = newTaskDuration ? parseInt(newTaskDuration) : 0;
        addTask(newTaskTitle, duration);
        
        setNewTaskTitle('');
        setNewTaskDuration('');
        setModalOpen(false);
        loadData();
    }

    function handleToggleTask(task) {
        const newIsDone = !task.isDone;
        toggleTask(task.id, date, newIsDone);
        loadData();
        updateStats();
    }

    function handleUpdateTask(id, updatedFields) {
        editTask(id, updatedFields.title, updatedFields.duration, date);
        setEditingTask(null);
        loadData();
        updateStats();
    }

    function handleDeleteTask(id) {
        deleteTask(id, date);
        loadData();
        updateStats();
    }

    // Heatmap generation
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

    const getHeatmapColor = (day) => {
        const dayKey = formatDateKey(day);
        const today = new Date();

        // Check if future
        if (day > today) return 'bg-stone-200'; // Light Neutral (Future)

        // Find data for this day
        const dayData = heatmapData.find(d => d.date === dayKey);

        if (!dayData || dayData.total_tasks === 0) {
            return 'bg-stone-300'; // Neutral Grey (Inactive or 0 tasks)
        }

        const completionRate = (dayData.completed_tasks / dayData.total_tasks) * 100;

        if (completionRate === 0) return 'bg-red-500';
        if (completionRate < 50) return 'bg-orange-400';
        if (completionRate < 80) return 'bg-emerald-300';
        return 'bg-emerald-500';
    };

    const current_date = new Date();
    const time_left_days = Math.floor((new Date(goalAndTerm.term) - current_date) / (1000 * 60 * 60 * 24));

    return (
        <div className="content-view">
            <div className="content-header">
                <div id="content-title">
                    {`Goal: ${goalAndTerm.goal}`}
                    <br />
                    <p id="content-term">{`Term: ${goalAndTerm.term}`}</p>
                </div>
                <div className="date-navigation">
                    <button onClick={() => setDate(new Date(date.getTime() - 24*60*60*1000))} className="nav-btn">
                        <ChevronLeft size={20} />
                    </button>
                    <input 
                        type="date" 
                        value={dateStr}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        className="date-input"
                    />
                    <button onClick={() => setDate(new Date(date.getTime() + 24*60*60*1000))} className="nav-btn">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div id="time-left">
                    {time_left_days}
                </div>
            </div>

            <div className="content-tasks">
                <div className="content-tasks-left">
                    <div className="todo-header">
                        <p>Task</p>
                        <button onClick={() => { setModalOpen(true); setNewTaskTitle(''); setNewTaskDuration(''); }}><img src={addUrl} alt="Add" /></button>
                    </div>
                    <div className="todo-list">
                        {tasks.map((task) => (
                            <div className={`todo-item${task.isDone ? ' completed' : ''}`} key={task.id} onClick={() => handleToggleTask(task)}>
                                <div className="todo-item-left">
                                    <mdui-checkbox
                                        checked={task.isDone}
                                        onChange={() => handleToggleTask(task)}
                                        id={`checkbox-${task.id}`}
                                        style={{
                                            '--mdui-color-primary': '#9fcaff',
                                            '--mdui-color-outline': 'white'
                                        }}
                                    ></mdui-checkbox>
                                    <span className="task-title">{task.title}</span>
                                </div>
                                <div className="todo-item-right">
                                    <span className="task-duration">
                                        <span>{task.duration}</span>
                                        <span style={{ margin: '0 2px', fontWeight: 'bold' }}>|</span>
                                        <span>min</span>
                                    </span>
                                    <button id='btn1' onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTask(task);
                                        setNewTaskTitle(task.title);
                                        setNewTaskDuration(task.duration || '');
                                    }}><Edit2 size={20} /></button>
                                    <button id='btn2' onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                    }}><Trash2 size={20} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="content-tasks-right">
                    <div className="content-tasks-right-top">
                        <div className="ctrt-top">
                            <div 
                                className={`stat ${selectedStat === 'today' ? 'active' : ''}`}
                                ref={statRefs.today}
                                onClick={() => setSelectedStat('today')}
                            >
                                <p>Today</p>
                            </div>
                            <div 
                                className={`stat ${selectedStat === 'week' ? 'active' : ''}`}
                                ref={statRefs.week}
                                onClick={() => setSelectedStat('week')}
                            >
                                <p>This Week</p>
                            </div>
                            <div 
                                className={`stat ${selectedStat === 'month' ? 'active' : ''}`}
                                ref={statRefs.month}
                                onClick={() => setSelectedStat('month')}
                            >
                                <p>This Month</p>
                            </div>
                            <div 
                                className={`stat ${selectedStat === 'lifetime' ? 'active' : ''}`}
                                ref={statRefs.lifetime}
                                onClick={() => setSelectedStat('lifetime')}
                            >
                                <p>Lifetime</p>
                            </div>
                            <div className="bottomline" ref={underlineRef}></div>
                        </div>
                        <div className="ctrt-bottom">
                            <div className="focus-time">
                                <div className='focus-time-title'>Focus time</div>
                                <div className='focus-time-data'>{Math.floor(stats.totalFocusMinutes / 60)}h {stats.totalFocusMinutes % 60}m</div>
                            </div>
                            <div className="task-complated">
                                <div className='task-complated-title'>Task completed</div>
                                <div className='task-complated-data'>{stats.completedTasks}</div>
                            </div>
                        </div>
                    </div>
                    <div className="content-tasks-right-bottom">
                        <div className="heatmap">
                            {daysInYear.map(day => (
                                <div 
                                    key={format(day, 'yyyy-MM-dd')} 
                                    className={`heatmap-day ${getHeatmapColor(day)}`}
                                    title={format(day, 'MMM dd, yyyy')}
                                    onClick={() => setDate(day)}
                                >
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            <TaskModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAddTask}
                title={newTaskTitle}
                duration={newTaskDuration}
                setTitle={setNewTaskTitle}
                setDuration={setNewTaskDuration}
                isUpdate={false}
            />
            
            {/* Update Task Modal */}
            {editingTask && (
                <TaskModal
                    open={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateTask(editingTask.id, {
                            title: newTaskTitle,
                            duration: newTaskDuration ? parseInt(newTaskDuration) : 0
                        });
                        setEditingTask(null);
                    }}
                    title={newTaskTitle}
                    duration={newTaskDuration}
                    setTitle={setNewTaskTitle}
                    setDuration={setNewTaskDuration}
                    isUpdate={true}
                />
            )}
        </div>
    );
};

export default Dashboard;
