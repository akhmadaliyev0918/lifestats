// Initialize app with sync and offline-first functionality
import { api } from '../services/api';

export const initializeApp = async () => {
    try {
        // Check if user is logged in
        if (api.isLoggedIn()) {
            console.log('User is logged in, validating token...');
            
            // Validate token is still valid
            const isTokenValid = await api.validateToken();
            
            if (!isTokenValid) {
                console.warn('⚠️ Token is invalid - requiring re-login');
                return;
            }
            
            console.log('User is logged in, attempting sync...');
            
            // Try to sync with server
            const syncResult = await api.syncTasks();
            
            if (syncResult.success) {
                console.log('✓ Sync successful');
            } else if (syncResult.offline) {
                console.log('⚠ Offline mode - using local data');
            }
            
            if (syncResult.hasConflicts) {
                console.log('⚠ Sync conflicts detected - server data used');
            }
        } else {
            console.log('User not logged in - using local storage only');
        }
    } catch (error) {
        console.error('App initialization error:', error);
        // App will still work with local data
    }
};

export const setupSyncListener = () => {
    // Auto-sync when user comes back online
    window.addEventListener('online', async () => {
        console.log('Back online - syncing...');
        if (api.isLoggedIn()) {
            try {
                await api.syncTasks();
                console.log('✓ Sync complete');
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    });

    // Warn user when going offline
    window.addEventListener('offline', () => {
        console.log('⚠ You are offline - changes will sync when back online');
    });
};
