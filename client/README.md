# Among Us Client

React + Vite frontend for the Among Us game.

## Features

### Pages

1. **Login Screen** (`/`)
   - Player ID selection (P01-P30)
   - Passcode input
   - Login validation

2. **Lobby** (`/lobby`)
   - Waiting room before game starts
   - Shows player ID
   - Role is hidden until game starts

3. **Crewmate Dashboard** (`/game`)
   - Global progress bar
   - 30-minute timer
   - Task list with main/filler tasks
   - Task verification modal with PIN keypad

4. **Imposter Dashboard** (`/game`)
   - Same UI as crewmate (for disguise)
   - Fake task list
   - Kill button with cooldown
   - QR scanner for killing
   - Shows imposter teammates

5. **Ghost Dashboard** (`/game`)
   - Grey theme
   - Only main tasks visible
   - Can help team by completing tasks
   - Lower progress contribution

6. **Voting UI** (`/voting`)
   - Emergency meeting screen
   - 40s discussion phase
   - 20s voting phase
   - Grid of alive players
   - Skip vote option
   - Confirmation modal

7. **Admin Dashboard** (`/admin`)
   - Game control buttons
   - Live player statistics
   - Global progress bar
   - Player list table with roles/status
   - Reset functionality

### Components

1. **TaskList**
   - Displays all tasks
   - Shows completion status
   - Main tasks marked with star
   - Click to verify

2. **VerificationModal**
   - Task information display
   - 4-digit PIN keypad
   - Error handling
   - Shake animation on error

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Routing

The app uses React Router for navigation:

- `/` - Login Screen (public)
- `/lobby` - Lobby (requires login)
- `/game` - Game Dashboard (role-based routing)
- `/voting` - Voting UI (during meetings)
- `/admin` - Admin Dashboard (no auth required - add in production)

## State Management

- Player state stored in App component
- Socket.io for real-time updates
- Local storage for player ID persistence

## WebSocket Events

See `server/README.md` for complete list of Socket.io events.

## Styling

- CSS Modules for component-scoped styles
- Tech Club color palette
- Responsive design
- Mobile-first approach

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Camera API support required for QR scanning
- WebSocket support required
