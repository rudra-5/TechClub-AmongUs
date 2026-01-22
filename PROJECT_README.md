# Among Us - UOWD Tech Club Event Game

A real-time multiplayer web application based on Among Us for Tech Club events. Built with React + Vite frontend and Express + Socket.io backend.

## 🚀 Quick Start

### Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Run the Application

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

- **Players**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Server**: http://localhost:3001

## 📋 Features

✅ Login system with 30 player IDs (P01-P30)
✅ Role assignment (Crewmates & Imposters)
✅ Task verification with PIN system
✅ QR code kill mechanic
✅ Real-time WebSocket updates
✅ Emergency meetings & voting
✅ Ghost mode for eliminated players
✅ Admin dashboard for game control
✅ 30-minute game timer
✅ Global progress tracking

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Comprehensive setup and configuration guide
- **[client/README.md](./client/README.md)** - Frontend documentation
- **[server/README.md](./server/README.md)** - Backend API and Socket.io events
- **[README.md](./README.md)** - Original game design document

## 🎮 Game Flow

1. Players login with ID (P01-P30) and passcode
2. Admin starts game from dashboard
3. Roles assigned: ~3 Imposters, rest Crewmates
4. **Crewmates**: Complete tasks by getting PINs from Station Execs
5. **Imposters**: Scan QR codes on players' backs to eliminate them
6. Admin triggers meetings when needed
7. Players vote to eject suspicious players
8. Game ends when tasks complete or imposters win

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- React Router v6
- Socket.io Client
- CSS Modules
- html5-qrcode

**Backend:**
- Node.js
- Express
- Socket.io
- In-memory database

## 🎨 Design

Theme uses Tech Club colors:
- Purple Primary: #977DFF
- Lavender Light: #D4CDFF
- Soft Black: #1B1C2E
- Bright Cyan: #79F0F8
- Pale Blue: #E2FDFD
- Navy Blue: #0B054F

Role-based theming:
- Crewmate: Blue/Green (Safe, Clean)
- Imposter: Red/Black (Danger)
- Ghost: Grey (Inactive)
- Admin: Neutral Dashboard

## 📦 Project Structure

```
AmongUs/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # All UI screens
│   │   ├── components/  # Shared components
│   │   └── App.jsx      # Main app with routing
│   └── public/          # Static assets
│
├── server/              # Express + Socket.io backend
│   ├── routes/          # API routes (auth, game, admin)
│   ├── socket/          # WebSocket event handlers
│   ├── database/        # In-memory database
│   └── utils/           # QR code generator
│
└── README.md            # Original design document
```

## 🔧 Setup for Event

1. Generate QR codes: `cd server && node utils/qrGenerator.js`
2. Print QR codes and attach to players' backs
3. Prepare passcode sticky notes (P01-X, P02-X, etc.)
4. Set up task verification PINs with Station Execs
5. Start server and client applications
6. Open admin dashboard on host device

## 🎯 Game Mechanics

### Crewmates
- Complete tasks to fill progress bar
- Get PIN from Station Exec to verify tasks
- Vote to eject imposters in meetings
- Win by completing all tasks OR ejecting all imposters

### Imposters
- Eliminate crewmates by scanning their QR codes
- 5-minute cooldown between kills
- Fake task completion to blend in
- Win by reducing crew numbers below imposter count

### Ghosts (Eliminated Players)
- Go to Home Base
- Complete main tasks only (contributes less to progress)
- Cannot vote in meetings

## 📱 Admin Controls

- **Start Game**: Assign roles and begin timer
- **Trigger Meeting**: Pause game for discussion
- **Start Voting**: Open voting UI for players
- **Resume Game**: Continue after voting
- **Finish Game**: End current round
- **Reset All**: Clear data for next group

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md) for detailed troubleshooting guide.

## 📄 License

Created for UOWD Tech Club events.
