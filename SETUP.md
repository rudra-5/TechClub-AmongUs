# Among Us Game - Setup Guide

This is a real-time multiplayer Among Us-style web application for UOWD Tech Club events.

## Project Structure

```
AmongUs/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/   # All page components
│   │   ├── components/  # Shared components
│   │   └── App.jsx  # Main app with routing
│   └── package.json
│
└── server/          # Express + Socket.io backend
    ├── routes/      # API routes
    ├── socket/      # WebSocket handlers
    ├── database/    # In-memory database
    ├── utils/       # Utility functions
    └── server.js    # Main server file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

### 1. Install Client Dependencies

```bash
cd client
npm install
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

## Configuration

### Server Configuration

Create a `.env` file in the `server` folder:

```env
PORT=3001
NODE_ENV=development
```

### Client Configuration

The client is pre-configured to connect to `http://localhost:3001` for the backend.

## Running the Application

### 1. Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### 2. Start the Client

In a new terminal:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:3000`

### 3. Access the Application

- **Players**: Navigate to `http://localhost:3000`
- **Admin Dashboard**: Navigate to `http://localhost:3000/admin`

## Player Setup

### Generate QR Codes

Players need QR codes on their backs for the kill mechanic. Generate them:

```bash
cd server
node utils/qrGenerator.js
```

QR codes will be saved in `server/qr-codes/` folder. Print these and attach to players' backs.

## Game Flow

### 1. Before the Event

1. Generate and print QR codes for all 30 players (P01-P30)
2. Print passcodes on sticky notes (default: P01-X, P02-X, etc.)
3. Set up task verification PINs with Station Execs
4. Start the server and client applications

### 2. Player Login

- Players select their ID (P01-P30) from dropdown
- Enter their passcode from sticky note
- Wait in lobby for host to start

### 3. Admin Controls

Admin can:
- **Start Game**: Assigns roles and starts timer (30 minutes)
- **Trigger Meeting**: Pauses game for discussion
- **Start Voting**: Opens voting UI for all players
- **Resume Game**: Continues game after voting
- **Finish Game**: Ends current round
- **Reset All Data**: Clears everything for next group

### 4. Gameplay

**Crewmates**:
- Complete tasks by getting PINs from Station Execs
- Each task completion adds to global progress bar
- Win by completing all tasks or voting out imposters

**Imposters**:
- Scan QR codes on players' backs to kill them
- 5-minute cooldown after each kill
- Can fake tasks to blend in
- Win by reducing crew numbers below imposter count

**Ghosts** (Dead Players):
- Go to Home Base
- Can only complete main tasks
- Cannot vote in meetings

### 5. Meetings & Voting

- Host triggers meeting (e.g., when 5 players are dead)
- 40 seconds discussion phase
- 20 seconds voting phase
- Players vote to eject someone or skip

## Default Credentials

### Player Login
- **IDs**: P01 through P30
- **Passcodes**: P01-X through P30-X (customizable in server code)

### Task PINs
Task PINs are randomly generated on server startup and logged to console. In production, these should be manually set and distributed to Station Execs.

## Tech Stack

### Frontend
- React 18
- React Router v6
- Socket.io Client
- Vite
- CSS Modules

### Backend
- Node.js
- Express
- Socket.io
- In-memory database (can be replaced with MongoDB, PostgreSQL, etc.)

## Color Scheme

The app uses Tech Club colors:
- Purple Primary: #977DFF
- Lavender Light: #D4CDFF
- Soft Black: #1B1C2E
- Bright Cyan: #79F0F8
- Pale Blue: #E2FDFD
- Navy Blue: #0B054F

## Features Implemented

✅ Login system with player ID and passcode
✅ Lobby waiting room
✅ Role assignment (Crewmates & Imposters)
✅ Task verification with PIN system
✅ Global progress tracking
✅ 30-minute game timer
✅ QR code kill mechanic for imposters
✅ 5-minute kill cooldown
✅ Ghost mode for eliminated players
✅ Emergency meeting system
✅ Voting UI with discussion phase
✅ Admin dashboard with full game control
✅ Real-time updates via WebSockets
✅ Player statistics tracking
✅ Round reset functionality

## Troubleshooting

### Client can't connect to server
- Ensure server is running on port 3001
- Check CORS settings in `server/server.js`
- Verify Socket.io connection in browser console

### Tasks not verifying
- Check that task PINs are logged in server console
- Ensure Station Execs have correct PINs
- Verify player is logged in and has tasks assigned

### QR scanning not working
- Ensure camera permissions are granted
- Use good lighting for QR codes
- QR codes should be printed clearly

### Game state not syncing
- Check WebSocket connection in browser console
- Ensure `playerJoin` event is emitted after login
- Verify server is broadcasting state updates

## Future Enhancements

- Persistent database (MongoDB/PostgreSQL)
- Admin panel for customizing task PINs
- Player chat during meetings
- Sound effects and animations
- Vote results display
- Game statistics and leaderboards
- Multiple rounds tracking
- Custom task creation

## Support

For issues or questions, contact the UOWD Tech Club development team.
