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

// Get client URLs from environment or use defaults
// Support multiple origins (comma-separated)
const CLIENT_URLS = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000']

console.log('Allowed origins:', CLIENT_URLS)

const io = new Server(server, {
  cors: {
    origin: CLIENT_URLS,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (CLIENT_URLS.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn(`Blocked by CORS: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
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
  console.log(`CORS enabled for clients: ${CLIENT_URLS.join(', ')}`)
})
