const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const gameRoutes = require('./routes/game')
const adminRoutes = require('./routes/admin')
const { setupSocketHandlers } = require('./socket/handlers')

const app = express()
const server = http.createServer(app)

// Get client URL from environment or use default
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/admin', adminRoutes)

// Socket.io handlers
setupSocketHandlers(io)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.io listening for connections`)
  console.log(`CORS enabled for client: ${CLIENT_URL}`)
})
