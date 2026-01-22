const express = require('express')
const router = express.Router()
const db = require('../database/db')

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

module.exports = router
