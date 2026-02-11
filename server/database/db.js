// In-memory database (for simplicity)
// For production, use MongoDB, PostgreSQL, etc.

let gameState = {
  status: 'waiting', // waiting, active, meeting, voting, ended
  round: 1,
  timeRemaining: 1800, // 30 minutes in seconds
  globalProgress: 0,
  timerInterval: null
}

let players = {}

// All 16 tasks — same weightage (weight: 1 each), no room
let tasks = {
  main: [
    { name: 'Correct Python code', weight: 1 },
    { name: 'Binary Hangman', weight: 1 },
    { name: 'QR scan & Follow Tech Club', weight: 1 },
    { name: 'Circuit Puzzle', weight: 1 },
    { name: 'Strong Password (Website)', weight: 1 },
    { name: 'Circuit Wiring', weight: 1 },
    { name: 'Dobot Teach & Playback', weight: 1 },
    { name: 'Wire Fix', weight: 1 },
    { name: 'Keyboard Speed Test', weight: 1 },
    { name: 'Water Cup Transfer', weight: 1 },
    { name: 'Paper Airplane Landing', weight: 1 },
    { name: 'Cloud Storage vs Local Storage', weight: 1 },
    { name: 'Error Finding in App Screen', weight: 1 },
    { name: 'Sentence Decode via Emojis', weight: 1 },
    { name: 'Fix the Keyboard', weight: 1 },
    { name: 'Sort Balls According to their color from Ball Pit', weight: 1 }
  ],
  filler: []
}

// PIN codes for each task (station exec codes)
let taskPins = {}

// Store kill cooldowns
let killCooldowns = {}

// Store votes
let votes = {}

// Initialize database
function initializeDatabase() {
  // Create 12 players
  for (let i = 1; i <= 12; i++) {
    const playerId = `P${i.toString().padStart(2, '0')}`
    players[playerId] = {
      id: playerId,
      passcode: `${playerId}-X`, // Simple default passcode
      role: 'crew', // Will be assigned on game start
      status: 'offline', // offline, lobby, alive, dead
      tasks: [],
      tasksCompleted: 0,
      totalTasks: 0,
      kills: 0,
      socketId: null
    }
  }

  // Generate random PINs for tasks (in production, these would be set by admins)
  regenerateTaskPins()
  console.log('Database initialized')
  console.log('Task PINs:', taskPins)
}

// Helper function to regenerate task PINs
function regenerateTaskPins() {
  tasks.main.forEach((task, index) => {
    taskPins[`main-${index}`] = Math.floor(1000 + Math.random() * 9000).toString()
  })
  tasks.filler.forEach((task, index) => {
    taskPins[`filler-${index}`] = Math.floor(1000 + Math.random() * 9000).toString()
  })
}

// Database access functions
const db = {
  // Game state
  getGameState: () => gameState,
  setGameState: (updates) => {
    gameState = { ...gameState, ...updates }
  },

  // Players
  getPlayer: (playerId) => players[playerId],
  getAllPlayers: () => Object.values(players),
  updatePlayer: (playerId, updates) => {
    if (players[playerId]) {
      players[playerId] = { ...players[playerId], ...updates }
    }
  },
  authenticatePlayer: (playerId, passcode) => {
    const player = players[playerId]
    return player && player.passcode === passcode
  },

  // Tasks
  getTasks: () => tasks,
  getTaskPin: (taskId) => taskPins[taskId],
  getAllTaskPins: () => {
    // Return task PINs with task information
    const allTaskPins = []
    
    tasks.main.forEach((task, index) => {
      allTaskPins.push({
        id: `main-${index}`,
        type: 'main',
        name: task.name,
        room: task.room,
        pin: taskPins[`main-${index}`]
      })
    })
    
    tasks.filler.forEach((task, index) => {
      allTaskPins.push({
        id: `filler-${index}`,
        type: 'filler',
        name: task.name,
        room: task.room,
        pin: taskPins[`filler-${index}`]
      })
    })
    
    return allTaskPins
  },
  regenerateTaskPins: () => {
    regenerateTaskPins()
    console.log('Task PINs regenerated:', taskPins)
  },
  assignTasksToPlayer: (playerId) => {
    const player = players[playerId]
    if (!player) return

    // Assign 10 main tasks (all 16 tasks have equal weight; no filler)
    const mainCount = Math.min(10, tasks.main.length)
    const mainTaskIndices = getRandomIndices(tasks.main.length, mainCount)

    const playerTasks = mainTaskIndices.map(i => ({
      id: `main-${i}`,
      type: 'main',
      ...tasks.main[i],
      completed: false
    }))

    players[playerId].tasks = playerTasks
    players[playerId].totalTasks = playerTasks.length
  },

  verifyTaskPin: (taskId, pin) => {
    return taskPins[taskId] === pin
  },

  completeTask: (playerId, taskId) => {
    const player = players[playerId]
    if (!player) return false

    const task = player.tasks.find(t => t.id === taskId)
    if (!task || task.completed) return false

    task.completed = true
    player.tasksCompleted++

    // Calculate global progress
    calculateGlobalProgress()
    return true
  },

  // Kill cooldowns
  getKillCooldown: (playerId) => killCooldowns[playerId] || 0,
  setKillCooldown: (playerId, cooldown) => {
    killCooldowns[playerId] = cooldown
  },

  // Votes
  castVote: (voterId, votedFor) => {
    votes[voterId] = votedFor
  },
  getVotes: () => votes,
  clearVotes: () => {
    votes = {}
  },

  // Reset
  resetAll: () => {
    // Regenerate task PINs before resetting
    regenerateTaskPins()
    console.log('Task PINs regenerated on reset:', taskPins)
    
    initializeDatabase()
    gameState = {
      status: 'waiting',
      round: 1,
      timeRemaining: 1800,
      globalProgress: 0,
      timerInterval: null
    }
    killCooldowns = {}
    votes = {}
  }
}

// Helper functions
function getRandomIndices(max, count) {
  const indices = []
  while (indices.length < count) {
    const rand = Math.floor(Math.random() * max)
    if (!indices.includes(rand)) {
      indices.push(rand)
    }
  }
  return indices
}

function calculateGlobalProgress() {
  // Only count crew (and ghost) tasks — imposters have fake tasks that shouldn't affect progress
  const crewPlayers = Object.values(players).filter(p => p.status !== 'offline' && p.role !== 'imposter')
  if (crewPlayers.length === 0) {
    gameState.globalProgress = 0
    return
  }

  let totalWeight = 0
  let completedWeight = 0

  crewPlayers.forEach(player => {
    player.tasks.forEach(task => {
      totalWeight += task.weight
      if (task.completed) {
        completedWeight += task.weight
      }
    })
  })

  gameState.globalProgress = totalWeight > 0 
    ? Math.round((completedWeight / totalWeight) * 100) 
    : 0
}

// Initialize on startup
initializeDatabase()

module.exports = db
