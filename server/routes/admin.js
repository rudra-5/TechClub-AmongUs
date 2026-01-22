const express = require('express')
const router = express.Router()
const db = require('../database/db')

// GET /api/admin/players
router.get('/players', (req, res) => {
  const players = db.getAllPlayers()
  res.json({ players })
})

// POST /api/admin/start-game
router.post('/start-game', (req, res) => {
  const gameState = db.getGameState()

  if (gameState.status !== 'waiting') {
    return res.status(400).json({ error: 'Game already started' })
  }

  // Assign roles (exactly 2 imposters, rest are crew)
  const activePlayers = db.getAllPlayers().filter(p => p.status !== 'offline')
  const imposterCount = 2

  // Shuffle and assign imposters
  const shuffled = [...activePlayers].sort(() => Math.random() - 0.5)
  shuffled.forEach((player, index) => {
    const role = index < imposterCount ? 'imposter' : 'crew'
    db.updatePlayer(player.id, { 
      role, 
      status: 'alive'
    })

    // Assign tasks to crew members (imposters get fake tasks)
    db.assignTasksToPlayer(player.id)
  })

  db.setGameState({
    status: 'active',
    timeRemaining: 1800 // Reset to 30 minutes
  })

  res.json({ success: true, message: 'Game started' })
})

// POST /api/admin/trigger-meeting
router.post('/trigger-meeting', (req, res) => {
  db.setGameState({ status: 'meeting' })
  res.json({ success: true, message: 'Meeting triggered' })
})

// POST /api/admin/start-voting
router.post('/start-voting', (req, res) => {
  db.setGameState({ status: 'voting' })
  db.clearVotes()
  res.json({ success: true, message: 'Voting started' })
})

// POST /api/admin/resume-game
router.post('/resume-game', (req, res) => {
  db.setGameState({ status: 'active' })
  res.json({ success: true, message: 'Game resumed' })
})

// POST /api/admin/end-round
router.post('/end-round', (req, res) => {
  db.setGameState({ status: 'ended' })
  res.json({ success: true, message: 'Round ended' })
})

// POST /api/admin/reset-all
router.post('/reset-all', (req, res) => {
  db.resetAll()
  res.json({ success: true, message: 'All data reset' })
})

module.exports = router
