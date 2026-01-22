# Among Us Server

Express + Socket.io backend for the Among Us game.

## API Endpoints

### Authentication

**POST** `/api/auth/login`
```json
{
  "playerId": "P01",
  "passcode": "P01-X"
}
```

### Game

**GET** `/api/game/state`
- Returns current game state

**GET** `/api/game/tasks/:playerId`
- Returns tasks for a specific player

**POST** `/api/game/verify-task`
```json
{
  "playerId": "P01",
  "taskId": "main-0",
  "pin": "1234"
}
```

### Admin

**GET** `/api/admin/players`
- Returns all players

**POST** `/api/admin/start-game`
- Starts the game and assigns roles

**POST** `/api/admin/trigger-meeting`
- Triggers emergency meeting

**POST** `/api/admin/start-voting`
- Opens voting UI

**POST** `/api/admin/resume-game`
- Resumes game after voting

**POST** `/api/admin/end-round`
- Ends current round

**POST** `/api/admin/reset-all`
- Resets all data (use between rounds)

## Socket.io Events

### Client → Server

- `playerJoin(playerId)` - Player connects with their ID
- `requestTasks(playerId)` - Request player's tasks
- `requestGhostTasks(playerId)` - Request main tasks only (for ghosts)
- `requestTeammates(playerId)` - Request imposter teammates
- `verifyTask({ playerId, taskId, pin })` - Verify a task
- `verifyFakeTask({ playerId, taskId, pin })` - Verify fake task (imposter)
- `verifyGhostTask({ playerId, taskId, pin })` - Verify ghost task
- `attemptKill({ killerId, victimId })` - Attempt to kill a player
- `requestAlivePlayers()` - Request list of alive players
- `castVote({ voterId, votedFor })` - Cast a vote
- `requestAdminData()` - Request all admin data
- `startGame()` - Admin starts game
- `triggerMeeting()` - Admin triggers meeting
- `startVoting()` - Admin starts voting
- `resumeGame()` - Admin resumes game
- `endRound()` - Admin ends round
- `resetAll()` - Admin resets all data

### Server → Client

- `gameStateUpdate(status)` - Game state changed
- `timerUpdate(seconds)` - Timer updated
- `progressUpdate(percentage)` - Global progress updated
- `tasksUpdate(tasks[])` - Player's tasks updated
- `ghostTasksUpdate(tasks[])` - Ghost's main tasks updated
- `teammatesUpdate(ids[])` - Imposter teammates list
- `killCooldownUpdate(seconds)` - Kill cooldown updated
- `playerUpdate(player)` - Player data updated
- `killResult({ success, error, victimId })` - Kill attempt result
- `alivePlayers(ids[])` - List of alive player IDs
- `votingTimer(seconds)` - Voting timer update
- `voteConfirmed({ votedFor })` - Vote confirmed
- `voteUpdate({ totalVotes })` - Vote count updated
- `adminPlayersUpdate(players[])` - All players data (admin only)
- `taskVerified({ success, taskId, error })` - Task verification result
- `forceDisconnect()` - Force disconnect (on reset)

## Database Schema

### Player
```javascript
{
  id: 'P01',
  passcode: 'P01-X',
  role: 'crew' | 'imposter',
  status: 'offline' | 'lobby' | 'alive' | 'dead',
  tasks: [...],
  tasksCompleted: 0,
  totalTasks: 0,
  kills: 0,
  socketId: 'socket-id'
}
```

### Task
```javascript
{
  id: 'main-0',
  type: 'main' | 'filler',
  name: 'Fix Wiring',
  room: 'Electrical Room',
  weight: 5,
  completed: false
}
```

### Game State
```javascript
{
  status: 'waiting' | 'active' | 'meeting' | 'voting' | 'ended',
  round: 1,
  timeRemaining: 1800,
  globalProgress: 0
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

# Generate QR codes
node utils/qrGenerator.js
```
