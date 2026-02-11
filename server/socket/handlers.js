const db = require('../database/db')

function setupSocketHandlers(io) {
  // Timer management
  let timerInterval = null

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval)
    
    timerInterval = setInterval(() => {
      const gameState = db.getGameState()
      
      if (gameState.status === 'active') {
        if (gameState.timeRemaining > 0) {
          db.setGameState({ timeRemaining: gameState.timeRemaining - 1 })
          io.emit('timerUpdate', gameState.timeRemaining - 1)
        } else {
          // Time's up
          db.setGameState({ status: 'ended' })
          io.emit('gameStateUpdate', 'ended')
          clearInterval(timerInterval)
        }
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  // Kill cooldown management
  const killCooldownTimers = {}

  function startKillCooldown(playerId) {
    const cooldownDuration = 180 // 3 minutes in seconds
    db.setKillCooldown(playerId, cooldownDuration)

    if (killCooldownTimers[playerId]) {
      clearInterval(killCooldownTimers[playerId])
    }

    killCooldownTimers[playerId] = setInterval(() => {
      const currentCooldown = db.getKillCooldown(playerId)
      if (currentCooldown > 0) {
        db.setKillCooldown(playerId, currentCooldown - 1)
        io.to(playerId).emit('killCooldownUpdate', currentCooldown - 1)
      } else {
        clearInterval(killCooldownTimers[playerId])
        delete killCooldownTimers[playerId]
      }
    }, 1000)
  }

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Player joins with their ID
    socket.on('playerJoin', (playerId) => {
      const player = db.getPlayer(playerId)
      if (player) {
        db.updatePlayer(playerId, { socketId: socket.id })
        socket.join(playerId) // Join a room with their player ID
        
        // Send current game state
        const gameState = db.getGameState()
        socket.emit('gameStateUpdate', gameState.status)
        socket.emit('timerUpdate', gameState.timeRemaining)
        socket.emit('progressUpdate', gameState.globalProgress)

        console.log(`Player ${playerId} joined`)
      }
    })

    // Request full player data (for role verification)
    socket.on('requestPlayerData', (playerId) => {
      const player = db.getPlayer(playerId)
      if (player) {
        socket.emit('playerUpdate', {
          role: player.role,
          status: player.status
        })
      }
    })

    // Request player tasks
    socket.on('requestTasks', (playerId) => {
      const player = db.getPlayer(playerId)
      if (player) {
        socket.emit('tasksUpdate', player.tasks)
      }
    })

    // Request ghost tasks (main tasks only)
    socket.on('requestGhostTasks', (playerId) => {
      const player = db.getPlayer(playerId)
      if (player) {
        const mainTasks = player.tasks.filter(t => t.type === 'main')
        socket.emit('ghostTasksUpdate', mainTasks)
      }
    })

    // Request imposter teammates
    socket.on('requestTeammates', (playerId) => {
      const player = db.getPlayer(playerId)
      if (player && player.role === 'imposter') {
        const imposters = db.getAllPlayers()
          .filter(p => p.role === 'imposter' && p.id !== playerId && p.status !== 'offline')
          .map(p => p.id)
        socket.emit('teammatesUpdate', imposters)
      }
    })

    // Verify task (crew)
    socket.on('verifyTask', ({ playerId, taskId, pin }) => {
      const isValid = db.verifyTaskPin(taskId, pin)
      
      if (isValid) {
        const completed = db.completeTask(playerId, taskId)
        if (completed) {
          const player = db.getPlayer(playerId)
          const gameState = db.getGameState()
          
          // Update player's task list
          socket.emit('tasksUpdate', player.tasks)
          
          // Broadcast progress to everyone
          io.emit('progressUpdate', gameState.globalProgress)
          
          socket.emit('taskVerified', { success: true, taskId })
          
          // Check if all tasks are complete (100%)
          if (gameState.globalProgress >= 100) {
            db.setGameState({ status: 'ended' })
            stopTimer()
            io.emit('gameStateUpdate', 'ended')
            console.log('Game ended - All tasks completed!')
          }
        }
      } else {
        socket.emit('taskVerified', { success: false, error: 'Invalid PIN' })
      }
    })

    // Verify fake task (imposter - doesn't add progress)
    socket.on('verifyFakeTask', ({ playerId, taskId, pin }) => {
      const isValid = db.verifyTaskPin(taskId, pin)
      
      if (isValid) {
        const player = db.getPlayer(playerId)
        const task = player.tasks.find(t => t.id === taskId)
        
        if (task) {
          task.completed = true
          socket.emit('tasksUpdate', player.tasks)
          socket.emit('taskVerified', { success: true, taskId })
        }
      } else {
        socket.emit('taskVerified', { success: false, error: 'Invalid PIN' })
      }
    })

    // Verify ghost task (lower weight contribution)
    socket.on('verifyGhostTask', ({ playerId, taskId, pin }) => {
      const isValid = db.verifyTaskPin(taskId, pin)
      
      if (isValid) {
        const completed = db.completeTask(playerId, taskId)
        if (completed) {
          const player = db.getPlayer(playerId)
          const gameState = db.getGameState()
          
          socket.emit('ghostTasksUpdate', player.tasks.filter(t => t.type === 'main'))
          io.emit('progressUpdate', gameState.globalProgress)
          socket.emit('taskVerified', { success: true, taskId })
          
          // Check if all tasks are complete (100%)
          if (gameState.globalProgress >= 100) {
            db.setGameState({ status: 'ended' })
            stopTimer()
            io.emit('gameStateUpdate', 'ended')
            console.log('Game ended - All tasks completed!')
          }
        }
      } else {
        socket.emit('taskVerified', { success: false, error: 'Invalid PIN' })
      }
    })

    // Attempt kill
    socket.on('attemptKill', ({ killerId, victimId }) => {
      const killer = db.getPlayer(killerId)
      const victim = db.getPlayer(victimId)

      if (!killer || !victim) {
        socket.emit('killResult', { success: false, error: 'Player not found' })
        return
      }

      // Check if trying to kill an ally imposter
      if (victim.role === 'imposter') {
        socket.emit('killResult', { success: false, error: 'FRIENDLY FIRE! Cannot kill ally.' })
        return
      }

      // Check cooldown
      const cooldown = db.getKillCooldown(killerId)
      if (cooldown > 0) {
        socket.emit('killResult', { success: false, error: 'Kill on cooldown' })
        return
      }

      // Perform kill
      db.updatePlayer(victimId, { status: 'dead' })
      db.updatePlayer(killerId, { kills: (killer.kills || 0) + 1 })

      // Start cooldown
      startKillCooldown(killerId)

      // Notify killer
      socket.emit('killResult', { success: true, victimId })

      // Notify victim
      io.to(victimId).emit('playerUpdate', { status: 'dead' })

      // Broadcast to admin
      io.emit('adminPlayersUpdate', db.getAllPlayers())

      console.log(`${killerId} killed ${victimId}`)

      // Check if imposters win (equal or outnumber crew, or eliminated all crew)
      const allPlayers = db.getAllPlayers()
      const aliveCrewCount = allPlayers.filter(p => p.role === 'crew' && p.status === 'alive').length
      const aliveImposterCount = allPlayers.filter(p => p.role === 'imposter' && p.status === 'alive').length
      
      if (aliveImposterCount > 0 && aliveImposterCount >= aliveCrewCount) {
        db.setGameState({ status: 'ended' })
        stopTimer()
        io.emit('gameStateUpdate', 'ended')
        console.log('Game ended - Imposters win!')
      }
    })

    // Request alive players (for voting)
    socket.on('requestAlivePlayers', () => {
      const alivePlayers = db.getAllPlayers()
        .filter(p => p.status === 'alive')
        .map(p => p.id)
      socket.emit('alivePlayers', alivePlayers)
    })

    // Cast vote
    socket.on('castVote', ({ voterId, votedFor }) => {
      db.castVote(voterId, votedFor)
      socket.emit('voteConfirmed', { votedFor })
      
      // Notify admin of vote count
      const votes = db.getVotes()
      io.emit('voteUpdate', { totalVotes: Object.keys(votes).length })
    })

    // Admin: request all data
    socket.on('requestAdminData', () => {
      const players = db.getAllPlayers()
      const gameState = db.getGameState()
      const taskPins = db.getAllTaskPins()
      
      socket.emit('adminPlayersUpdate', players)
      socket.emit('gameStateUpdate', gameState.status)
      socket.emit('progressUpdate', gameState.globalProgress)
      socket.emit('timerUpdate', gameState.timeRemaining)
      socket.emit('taskPinsUpdate', taskPins)
    })

    // Admin: start game
    socket.on('startGame', () => {
      const activePlayers = db.getAllPlayers().filter(p => p.status === 'lobby')
      const imposterCount = 2 // Exactly 2 imposters

      // Shuffle and assign roles
      const shuffled = [...activePlayers].sort(() => Math.random() - 0.5)
      shuffled.forEach((player, index) => {
        const role = index < imposterCount ? 'imposter' : 'crew'
        db.updatePlayer(player.id, { 
          role, 
          status: 'alive'
        })

        db.assignTasksToPlayer(player.id)
      })

      db.setGameState({
        status: 'active',
        timeRemaining: 1800
      })

      // Start timer
      startTimer()

      // Notify everyone
      io.emit('gameStateUpdate', 'active')
      io.emit('timerUpdate', 1800)
      
      // Send each player their role
      activePlayers.forEach(player => {
        const updatedPlayer = db.getPlayer(player.id)
        io.to(player.id).emit('playerUpdate', {
          role: updatedPlayer.role,
          status: updatedPlayer.status
        })
      })

      console.log('Game started')
    })

    // Admin: trigger meeting
    socket.on('triggerMeeting', () => {
      db.setGameState({ status: 'meeting' })
      stopTimer()
      io.emit('gameStateUpdate', 'meeting')
      console.log('Meeting triggered')
    })

    // Admin: start voting
    socket.on('startVoting', () => {
      db.setGameState({ status: 'voting' })
      db.clearVotes()
      io.emit('gameStateUpdate', 'voting')
      
      // Start voting timer (60 seconds)
      let votingTime = 60
      const votingInterval = setInterval(() => {
        votingTime--
        io.emit('votingTimer', votingTime)
        
        if (votingTime <= 0) {
          clearInterval(votingInterval)
        }
      }, 1000)
      
      console.log('Voting started')
    })

    // Admin: resume game
    socket.on('resumeGame', () => {
      db.setGameState({ status: 'active' })
      io.emit('gameStateUpdate', 'active')
      startTimer()
      console.log('Game resumed')
    })

    // Admin: end round
    socket.on('endRound', () => {
      db.setGameState({ status: 'ended' })
      stopTimer()
      io.emit('gameStateUpdate', 'ended')
      console.log('Round ended')
    })

    // Admin: reset all
    socket.on('resetAll', () => {
      db.resetAll()
      stopTimer()
      
      // Clear all cooldowns
      Object.keys(killCooldownTimers).forEach(playerId => {
        clearInterval(killCooldownTimers[playerId])
      })
      
      const taskPins = db.getAllTaskPins()
      
      io.emit('gameStateUpdate', 'waiting')
      io.emit('progressUpdate', 0)
      io.emit('timerUpdate', 1800)
      io.emit('taskPinsUpdate', taskPins)
      
      // Disconnect all players
      io.emit('forceDisconnect')
      
      console.log('All data reset')
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}

module.exports = { setupSocketHandlers }
