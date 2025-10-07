# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application for a Turkish football team recycling competition ("Takım Geri Dönüşüm Yarışması"). The application displays real-time scores for three teams (Galatasaray, Fenerbahçe, and Beşiktaş) based on recycled plastic bottles, with Firebase Firestore as the backend database.

## Development Commands

- `npm start` - Start development server (default port 3000)
- `npm run build` - Build for production (CI=false, no sourcemaps)
- `npm test` - Run tests in watch mode
- `npm run eject` - Eject from Create React App (not recommended)

## Tech Stack

- **Framework**: React 18 with Create React App
- **UI Library**: Material-UI v5 (@mui/material, @mui/icons-material)
- **Routing**: React Router DOM v7
- **Backend**: Firebase Firestore
- **Animations**: Framer Motion
- **Visual Effects**: Vanta.js (clouds effect with Three.js)
- **Audio**: Howler.js for goal sound effects
- **Date Handling**: Day.js with Material-UI Date Pickers
- **Deployment**: Vercel (configured in vercel.json)

## Architecture

### Application Structure

The app has two main routes configured in [src/App.js](src/App.js):
- `/` - Main scoreboard view with real-time team scores
- `/statistics` - Daily statistics view with date picker

### Context & State Management

**StatisticsContext** ([src/context/StatisticsContext.js](src/context/StatisticsContext.js)):
- Manages statistics state across the application using React Context + useReducer
- Implements caching mechanism with 5-minute TTL to reduce Firebase reads
- Provides actions: `setDate`, `setStats`, `setLoading`, `setError`, `updateCache`, `getCachedData`
- Wraps the entire application in [src/index.js](src/index.js:22)

### Firebase Integration

**Configuration** ([src/firebase.js](src/firebase.js)):
- Firebase config loaded from environment variables (REACT_APP_FIREBASE_*)
- Exports `db` (Firestore instance) used throughout the app
- **Important**: Firebase credentials must be set in environment variables before running

**Firestore Schema**:
```
scores (collection)
  - gs_total: number (Galatasaray total)
  - fb_total: number (Fenerbahçe total)
  - ts_total: number (Beşiktaş total)
  - gs_delta: number (recent change)
  - fb_delta: number (recent change)
  - ts_delta: number (recent change)
  - dayKey: string (format: YYYY-MM-DD)
  - timestamp: Firestore timestamp
```

### Real-time Updates

[src/App.js](src/App.js:194-213):
- Subscribes to Firestore changes using `onSnapshot`
- Queries latest score document ordered by timestamp
- Plays goal sound when any team's delta is 1 (if sound enabled)
- Sound preference persisted in localStorage

### Component Architecture

**Main Components**:
1. **App** ([src/App.js](src/App.js)) - Main container with scoreboard
   - TeamScore component (inline, lines 241-470): Displays individual team cards with animations
   - Vanta.js clouds background effect
   - Material-UI AppBar with navigation menu
   - Mobile-responsive drawer menu
   - Modal dialogs for recycling information

2. **Statistics** ([src/components/Statistics.js](src/components/Statistics.js)) - Daily statistics page
   - WinnerCard component: Shows daily winner with confetti animation
   - TeamStatsCard component: Individual team daily stats
   - DailyStatsCard component: Summary of all teams
   - Queries Firestore for specific date using `dayKey` field

### Team Configuration

Teams are hardcoded in [src/App.js](src/App.js:242-264):
- **gs**: Galatasaray (yellow/gold theme)
- **fb**: Fenerbahçe (blue theme)
- **ts**: Beşiktaş (black/white theme)

Each team has:
- Name, color, logo path, gradient, and border color
- Logo images in `/public` directory (gs-logo.png, fb-logo.png, bjk-logo.png)

### Audio System

[src/App.js](src/App.js:72-86):
- Howler.js loads `/public/goal.mp3`
- Sound state stored in localStorage as `soundEnabled`
- Volume controlled by `isSoundOn` state (0 or 1)
- Sound plays when delta changes detected in real-time listener

## Environment Variables Required

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

Create a `.env.local` file in the project root with these values.

## Deployment Notes

- Configured for Vercel in [vercel.json](vercel.json)
- Build command includes `CI=false` to ignore warnings as errors
- Sourcemaps disabled for production builds
- Client-side routing handled via Vercel rewrites
- All routes redirect to `/index.html` for SPA routing

## Key Dependencies

- **react-confetti**: Winner celebration animations
- **framer-motion**: Component animations and transitions
- **vanta** + **three**: 3D cloud background effect
- **howler**: Cross-browser audio playback
- **@mui/x-date-pickers** + **dayjs**: Date selection in statistics

## Important Notes

- The app expects Turkish language content (UI is in Turkish)
- Real-time updates depend on active Firestore connection
- Vanta.js effect cleanup is handled in useEffect return
- Statistics page implements memoization for performance optimization
- Cache in StatisticsContext reduces unnecessary Firebase reads

