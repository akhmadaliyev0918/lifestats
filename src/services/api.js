// Enhanced API service with offline-first sync and server integration
const STORAGE_KEY_TASKS = 'ffv-tasks';
const STORAGE_KEY_AUTH = 'ffv-auth';
const STORAGE_KEY_LAST_SYNC = 'ffv-last-sync';
const STORAGE_KEY_MOCK_USERS = 'ffv-mock-users';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const MOCK_AUTH_ENABLED = process.env.REACT_APP_MOCK_AUTH === 'true';

// Utility functions
const getStoredData = (key, defaultValue = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

const setStoredData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error writing to localStorage:', error);
    }
};

const getToken = () => {
    const auth = getStoredData(STORAGE_KEY_AUTH);
    return auth?.token;
};

// Mock auth functions (for development/testing when real auth is rate limited)
const mockAuth = {
    register: (email, username, password) => {
        const users = getStoredData(STORAGE_KEY_MOCK_USERS, {});
        if (users[email]) {
            throw new Error('Email already registered');
        }
        const token = 'mock_' + Math.random().toString(36).substr(2, 9);
        users[email] = { password, username, token };
        setStoredData(STORAGE_KEY_MOCK_USERS, users);
        return {
            token,
            user: { id: email, email, username }
        };
    },
    login: (email, password) => {
        const users = getStoredData(STORAGE_KEY_MOCK_USERS, {});
        const user = users[email];
        if (!user || user.password !== password) {
            throw new Error('Invalid login credentials');
        }
        return {
            token: user.token,
            user: { id: email, email, username: user.username }
        };
    }
};

const makeRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

export const api = {
    // AUTH METHODS
    register: async (email, username, password) => {
        try {
            // Try real auth FIRST (even if mock enabled)
            try {
                const data = await makeRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ email, username, password })
                });
                
                if (data.token) {
                    setStoredData(STORAGE_KEY_AUTH, {
                        token: data.token,
                        refresh_token: data.refresh_token || '',
                        user: data.user
                    });
                }
                
                console.log('✅ Registered with real auth (Supabase)');
                return {
                    token: data.token,
                    user: data.user
                };
            } catch (supabaseError) {
                // If rate limited OR email validation issues, fall back to mock auth
                const errorMsg = supabaseError.message || '';
                const shouldFallback = errorMsg.includes('rate limit') ||
                                      errorMsg.includes('email') ||
                                      errorMsg.includes('Email');
                
                if (shouldFallback) {
                    console.warn('⚠️ Supabase registration failed (' + errorMsg + '), using mock auth');
                    const data = mockAuth.register(email, username, password);
                    setStoredData(STORAGE_KEY_AUTH, {
                        token: data.token,
                        refresh_token: '',
                        user: data.user
                    });
                    console.log('✅ Registered with mock auth (local storage)');
                    return data;
                }
                throw supabaseError;
            }
        } catch (error) {
            console.error('❌ Registration error:', error.message);
            throw error;
        }
    },

    login: async (email, password) => {
        try {
            // Try real auth FIRST (even if mock enabled)
            try {
                const data = await makeRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                if (data.token) {
                    setStoredData(STORAGE_KEY_AUTH, {
                        token: data.token,
                        refresh_token: data.refresh_token || '',
                        user: data.user
                    });
                }
                
                console.log('✅ Logged in with real auth (Supabase)');
                return {
                    token: data.token,
                    user: data.user
                };
            } catch (supabaseError) {
                // If real auth fails, try mock auth
                const errorMsg = supabaseError.message || '';
                const isMightBeMockAccount = errorMsg.includes('Invalid login credentials') || 
                                             errorMsg.includes('rate limit') ||
                                             errorMsg.includes('Email not confirmed') ||
                                             errorMsg.includes('email not confirmed');
                
                if (isMightBeMockAccount) {
                    try {
                        console.warn('⚠️ Real auth failed (' + errorMsg + '), checking mock accounts...');
                        const data = mockAuth.login(email, password);
                        setStoredData(STORAGE_KEY_AUTH, {
                            token: data.token,
                            refresh_token: '',
                            user: data.user
                        });
                        console.log('✅ Logged in with mock auth (local storage)');
                        return data;
                    } catch (mockError) {
                        // Mock auth also failed, show original error
                        throw supabaseError;
                    }
                }
                throw supabaseError;
            }
        } catch (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }
    },

    logout: async () => {
        try {
            if (!MOCK_AUTH_ENABLED) {
                await makeRequest('/auth/logout', { method: 'POST' });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        localStorage.removeItem(STORAGE_KEY_AUTH);
    },

    getCurrentUser: async () => {
        if (MOCK_AUTH_ENABLED) {
            const auth = getStoredData(STORAGE_KEY_AUTH);
            return auth?.user || null;
        }

        const data = await makeRequest('/auth/me');
        return data.user || data;
    },

    isLoggedIn: () => {
        return !!getToken();
    },

    // VALIDATE: Check if stored token is still valid
    validateToken: async () => {
        const token = getToken();
        if (!token) {
            console.log('⚠️ No token found');
            return false;
        }

        try {
            // Try to verify token with server
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ Token is valid');
                return true;
            } else {
                console.warn('❌ Token is invalid or expired');
                // Clear invalid token
                localStorage.removeItem(STORAGE_KEY_AUTH);
                return false;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            // On network error, assume token might still be valid
            return true;
        }
    },

    // DEBUG: Show all accounts and current auth status
    debug: () => {
        const auth = getStoredData(STORAGE_KEY_AUTH);
        const mockUsers = getStoredData(STORAGE_KEY_MOCK_USERS, {});
        
        console.group('🔍 Auth Debug Info');
        console.log('Current User:', auth ? { email: auth.user?.email, username: auth.user?.username } : 'Not logged in');
        console.log('Mock Accounts in Storage:', Object.keys(mockUsers).length > 0 ? mockUsers : 'None');
        console.log('Token:', auth?.token ? 'OK ✅' : 'None');
        console.log('Mock Auth Enabled:', MOCK_AUTH_ENABLED);
        console.log('API URL:', API_URL);
        console.groupEnd();
        
        // Also return for programmatic use
        return {
            currentUser: auth?.user,
            isLoggedIn: !!auth?.token,
            mockAccounts: mockUsers,
            mockAuthEnabled: MOCK_AUTH_ENABLED
        };
    },

    // DIAGNOSTIC: Test POST task request step by step
    testAddTask: async (title = 'Test Task', duration = 60) => {
        console.group('🧪 Testing Task Creation');
        
        // Step 1: Check token
        const token = getToken();
        console.log('Step 1: Token check');
        console.log('  Token exists:', !!token);
        console.log('  Token value:', token ? token.substring(0, 20) + '...' : 'NONE');
        
        // Step 2: Check localStorage
        console.log('\nStep 2: localStorage check');
        const oldTasks = getStoredData(STORAGE_KEY_TASKS);
        console.log('  Tasks in localStorage:', oldTasks.length);
        
        // Step 3: Create task object
        console.log('\nStep 3: Task object');
        const testTask = {
            title,
            duration,
            completed: false,
            date: new Date().toISOString().split('T')[0]
        };
        console.log('  Task:', testTask);
        
        // Step 4: Try POST request
        console.log('\nStep 4: Sending POST to /api/tasks');
        console.log('  URL:', API_URL + '/tasks');
        console.log('  Method: POST');
        console.log('  Headers:');
        console.log('    - Content-Type: application/json');
        console.log('    - Authorization: Bearer ' + (token ? token.substring(0, 20) + '...' : 'NONE'));
        
        try {
            const response = await makeRequest('/tasks', {
                method: 'POST',
                body: JSON.stringify(testTask)
            });
            console.log('✅ SUCCESS! Server response:');
            console.log(response);
            console.groupEnd();
            return response;
        } catch (error) {
            console.log('❌ ERROR! Server returned:');
            console.log('  Message:', error.message);
            console.groupEnd();
            throw error;
        }
    },

    // REFRESH: Load all fresh data from server
    refreshData: async () => {
        try {
            const token = getToken();
            if (!token) {
                console.log('📦 Not logged in, using localStorage only');
                return {
                    tasks: getStoredData(STORAGE_KEY_TASKS),
                    source: 'localStorage'
                };
            }

            console.log('🔄 Refreshing data from server...');
            const response = await makeRequest('/tasks');
            
            if (response.success && response.data) {
                // Save to localStorage
                setStoredData(STORAGE_KEY_TASKS, response.data);
                console.log('✅ Data refreshed from server, saved locally');
                
                return {
                    tasks: response.data,
                    source: 'server'
                };
            }
        } catch (error) {
            console.warn('⚠️ Could not refresh from server:', error.message);
        }
        
        return {
            tasks: getStoredData(STORAGE_KEY_TASKS),
            source: 'localStorage'
        };
    },

    // TASK SYNC METHODS
    syncTasks: async () => {
        const localTasks = getStoredData(STORAGE_KEY_TASKS);
        const lastSyncTime = localStorage.getItem(STORAGE_KEY_LAST_SYNC);

        try {
            const response = await makeRequest('/tasks/sync', {
                method: 'POST',
                body: JSON.stringify({
                    localTasks,
                    lastSyncTime
                })
            });

            // Update local tasks with server data
            const mergedTasks = [
                ...localTasks.filter(lt => !response.serverTasks.find(st => st._id === lt._id)),
                ...response.serverTasks
            ];

            // Remove deleted tasks
            const filteredTasks = mergedTasks.filter(t => !response.deletedTaskIds.includes(t._id));

            setStoredData(STORAGE_KEY_TASKS, filteredTasks);
            localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());

            return {
                success: true,
                tasks: filteredTasks,
                hasConflicts: response.hasConflicts
            };
        } catch (error) {
            console.error('Sync failed:', error);
            // Return local tasks if sync fails (offline mode)
            return {
                success: false,
                tasks: localTasks,
                offline: true
            };
        }
    },

    // TASK METHODS
    getTasks: async (dateStr = null) => {
        try {
            // Try to load from server if logged in
            const token = getToken();
            if (token) {
                try {
                    let url = '/tasks';
                    if (dateStr) {
                        url += `?date=${dateStr}`;
                    }
                    const response = await makeRequest(url);
                    if (response.success && response.data) {
                        console.log('✅ Tasks loaded from server');
                        return response.data;
                    }
                } catch (error) {
                    console.warn('⚠️ Could not load tasks from server, using localStorage:', error.message);
                }
            }
        } catch (error) {
            console.warn('Could not fetch from server:', error.message);
        }
        
        // Fallback to localStorage
        const localTasks = getStoredData(STORAGE_KEY_TASKS);
        if (dateStr) {
            return localTasks.filter(t => t.date === dateStr);
        }
        return localTasks;
    },

    getAnalytics: async () => {
        try {
            // Try to load from server if logged in
            const token = getToken();
            if (token) {
                try {
                    // Get all tasks from server
                    const response = await makeRequest('/tasks');
                    if (response.success && response.data) {
                        const tasks = response.data;
                        const heatmap = tasks.reduce((acc, task) => {
                            const date = task.date;
                            let dayData = acc.find(d => d.date === date);
                            if (!dayData) {
                                dayData = { date, total_tasks: 0, completed_tasks: 0 };
                                acc.push(dayData);
                            }
                            dayData.total_tasks += 1;
                            if (task.completed) dayData.completed_tasks += 1;
                            return acc;
                        }, []);
                        console.log('✅ Analytics loaded from server');
                        return { heatmap, source: 'server' };
                    }
                } catch (error) {
                    console.warn('⚠️ Could not load analytics from server:', error.message);
                }
            }
        } catch (error) {
            console.warn('Could not fetch analytics from server:', error.message);
        }
        
        // Fallback to localStorage
        const tasks = getStoredData(STORAGE_KEY_TASKS);
        const heatmap = tasks.reduce((acc, task) => {
            const date = task.date;
            let dayData = acc.find(d => d.date === date);
            if (!dayData) {
                dayData = { date, total_tasks: 0, completed_tasks: 0 };
                acc.push(dayData);
            }
            dayData.total_tasks += 1;
            if (task.completed) dayData.completed_tasks += 1;
            return acc;
        }, []);

        return { heatmap };
    },

    addTask: async (task) => {
        const token = getToken();
        const newTask = {
            ...task,
            _id: task._id || Date.now().toString(),
            id: task.id || Date.now().toString(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage first (offline-first)
        const tasks = getStoredData(STORAGE_KEY_TASKS);
        tasks.push(newTask);
        setStoredData(STORAGE_KEY_TASKS, tasks);
        console.log('📝 Task saved to localStorage:', newTask.title);

        // Try to sync with server if logged in
        if (token) {
            try {
                console.log('🔄 Syncing task to server...');
                const response = await makeRequest('/tasks', {
                    method: 'POST',
                    body: JSON.stringify(newTask)
                });
                console.log('✅ Task synced to server:', response.data);
                // Update local copy with server ID if available
                if (response.data && response.data.id) {
                    newTask.id = response.data.id;
                    tasks[tasks.length - 1] = newTask;
                    setStoredData(STORAGE_KEY_TASKS, tasks);
                }
            } catch (error) {
                console.warn('⚠️ Could not sync task to server:', error.message);
                // Task still saved locally, will sync on next refreshData() call
            }
        } else {
            console.log('📴 Offline mode - task saved locally only');
        }

        return newTask;
    },

    logTask: async (id, data) => {
        const tasks = getStoredData(STORAGE_KEY_TASKS);
        const index = tasks.findIndex(t => t.id === id || t._id === id);
        if (index !== -1) {
            tasks[index] = { 
                ...tasks[index], 
                ...data,
                updatedAt: new Date().toISOString()
            };
            setStoredData(STORAGE_KEY_TASKS, tasks);

            // Try to sync with server
            if (getToken() && tasks[index]._id) {
                try {
                    await makeRequest(`/tasks/${tasks[index]._id}`, {
                        method: 'PUT',
                        body: JSON.stringify(tasks[index])
                    });
                } catch (error) {
                    console.warn('Could not sync with server:', error);
                }
            }
        }
        return tasks[index];
    },

    deleteTask: async (id) => {
        let tasks = getStoredData(STORAGE_KEY_TASKS);
        const task = tasks.find(t => t.id === id || t._id === id);
        tasks = tasks.filter(t => t.id !== id && t._id !== id);
        setStoredData(STORAGE_KEY_TASKS, tasks);
        console.log('🗑️ Task deleted from localStorage');

        // Try to sync with server
        const token = getToken();
        if (token && task?._id) {
            try {
                console.log('🔄 Syncing deletion to server...');
                await makeRequest(`/tasks/${task._id}`, {
                    method: 'DELETE'
                });
                console.log('✅ Task deletion synced to server');
            } catch (error) {
                console.warn('⚠️ Could not sync deletion to server:', error.message);
            }
        } else {
            console.log('📴 Offline mode - deletion saved locally only');
        }
    },

    updateTask: async (id, data) => {
        const token = getToken();
        const tasks = getStoredData(STORAGE_KEY_TASKS);
        const index = tasks.findIndex(t => t.id === id || t._id === id);
        if (index !== -1) {
            tasks[index] = { 
                ...tasks[index], 
                ...data,
                updatedAt: new Date().toISOString()
            };
            setStoredData(STORAGE_KEY_TASKS, tasks);
            console.log('📝 Task updated in localStorage:', tasks[index].title);

            // Try to sync with server
            if (token && tasks[index]._id) {
                try {
                    console.log('🔄 Syncing task update to server...');
                    const response = await makeRequest(`/tasks/${tasks[index]._id}`, {
                        method: 'PUT',
                        body: JSON.stringify(tasks[index])
                    });
                    console.log('✅ Task update synced to server');
                } catch (error) {
                    console.warn('⚠️ Could not sync task update to server:', error.message);
                }
            } else {
                console.log('📴 Offline mode - update saved locally only');
            }
        }
        return tasks[index];
    }
};
