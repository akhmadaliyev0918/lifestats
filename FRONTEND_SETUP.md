# FocusFlow Frontend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the client directory. Copy from `.env.example`:

```bash
cp .env.example .env
```

Update the API URL (make sure your backend server is running):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

### Authentication
- **Login/Register Modal**: Click the profile icon in navbar to access auth
- **Offline Support**: Works without internet connection
- **Auto-Sync**: When connected, data automatically syncs with server

### Data Sync System

#### How It Works
1. All data is stored in browser's localStorage by default
2. When you login, the app syncs with the backend server
3. Conflict resolution:
   - **Newer local data** → Updates server
   - **Newer server data** → Updates local storage
   - **Deleted on client** → Deleted on server

#### Online/Offline Behavior
- **Online**: Changes sync automatically with backend
- **Offline**: Changes stored locally, synced when reconnected
- **Indicator**: Check browser console for sync status

### API Endpoints Used

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/logout` - Logout

- `POST /api/tasks/sync` - Sync all tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Debugging

### Check Sync Status
Open browser console (F12) to see sync logs:
```
✓ Sync successful
⚠ Offline mode - using local data
✓ Back online - syncing...
```

### Check Local Storage
```javascript
// In browser console
localStorage.getItem('ffv-auth')  // Auth token
localStorage.getItem('ffv-tasks') // All tasks
```

### Check API Connection
```javascript
// In browser console
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Troubleshooting

### CORS Error
- Make sure backend server is running on `http://localhost:5000`
- Check `REACT_APP_API_URL` in `.env`

### Auth Modal Not Opening
- Make sure `AuthModal.jsx` is in components folder
- Check browser console for any errors

### Data Not Syncing
- Confirm user is logged in
- Check backend server is running
- Verify network connectivity
- Check browser console for error messages

### Tasks Not Showing
- If offline: only previously downloaded tasks show
- If online but not authorized: login first
- Check localStorage has `ffv-tasks` key

## Local Storage Keys

- `ffv-auth` - Authentication token and user data
- `ffv-tasks` - All tasks (synchronized with server)
- `ffv-analytics` - Analytics data
- `ffv-last-sync` - Last sync timestamp
