const express = require('express')
const router = express.Router()
const db = require('../database/db')

// GET /api/game/state
router.get('/state', (req, res) => {
  const gameState = db.getGameState()
  res.json(gameState)
})

// GET /api/game/tasks/:playerId
router.get('/tasks/:playerId', (req, res) => {
  const { playerId } = req.params
  const player = db.getPlayer(playerId)

  if (!player) {
    return res.status(404).json({ error: 'Player not found' })
  }

  res.json({ tasks: player.tasks })
})

// POST /api/game/verify-task
router.post('/verify-task', (req, res) => {
  const { playerId, taskId, pin } = req.body

  if (!playerId || !taskId || !pin) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const isValid = db.verifyTaskPin(taskId, pin)

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid PIN' })
  }

  const completed = db.completeTask(playerId, taskId)

  if (!completed) {
    return res.status(400).json({ error: 'Task already completed or not found' })
  }

  const gameState = db.getGameState()

  res.json({
    success: true,
    globalProgress: gameState.globalProgress
  })
})

module.exports = router
