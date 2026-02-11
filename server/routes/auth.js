const express = require('express')
const router = express.Router()
const db = require('../database/db')

// GET /api/auth/taken-players
router.get('/taken-players', (req, res) => {
  const allPlayers = db.getAllPlayers()
  const takenIds = allPlayers
    .filter(p => p.status !== 'offline')
    .map(p => p.id)
  res.json({ takenIds })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { playerId, passcode } = req.body

  if (!playerId || !passcode) {
    return res.status(400).json({ error: 'Player ID and passcode are required' })
  }

  const isAuthenticated = db.authenticatePlayer(playerId, passcode)

  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const player = db.getPlayer(playerId)
  const gameState = db.getGameState()

  // Update player status
  db.updatePlayer(playerId, { status: 'lobby' })

  res.json({
    success: true,
    player: {
      id: player.id,
      role: player.role,
      status: player.status
    },
    gameState: gameState.status
  })
})

// GET /api/auth/session — validate a stored session
router.get('/session', (req, res) => {
  const playerId = req.query.playerId

  if (!playerId) {
    return res.status(400).json({ valid: false, error: 'Player ID is required' })
  }

  const player = db.getPlayer(playerId)

  if (!player) {
    return res.status(404).json({ valid: false, error: 'Player not found' })
  }

  // Player exists and was previously authenticated (not offline means they logged in)
  const gameState = db.getGameState()

  res.json({
    valid: true,
    player: {
      id: player.id,
      role: player.role,
      status: player.status,
      tasks: player.tasks,
      tasksCompleted: player.tasksCompleted,
      totalTasks: player.totalTasks,
      kills: player.kills
    },
    gameState: gameState.status
  })
})

module.exports = router
