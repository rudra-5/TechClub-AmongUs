import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import LoginScreen from './pages/LoginScreen/LoginScreen'
import Lobby from './pages/Lobby/Lobby'
import CrewmateDashboard from './pages/CrewmateDashboard/CrewmateDashboard'
import ImposterDashboard from './pages/ImposterDashboard/ImposterDashboard'
import GhostDashboard from './pages/GhostDashboard/GhostDashboard'
import VotingUI from './pages/VotingUI/VotingUI'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [player, setPlayer] = useState(() => {
    // Restore player data from localStorage on reload
    const savedPlayerData = localStorage.getItem('playerData')
    return savedPlayerData ? JSON.parse(savedPlayerData) : null
  })
  const [gameState, setGameState] = useState('waiting') // waiting, active, voting, ended

  useEffect(() => {
    // Use environment variable or empty string (relative path for dev proxy)
    const serverUrl = import.meta.env.VITE_SERVER_URL || ''
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    newSocket.on('gameStateUpdate', (state) => {
      setGameState(state)
    })

    newSocket.on('playerUpdate', (updatedPlayer) => {
      setPlayer(prev => {
        const updated = { ...prev, ...updatedPlayer }
        localStorage.setItem('playerData', JSON.stringify(updated))
        return updated
      })
    })

    newSocket.on('forceDisconnect', () => {
      // Clear player data on forced disconnect (reset)
      localStorage.removeItem('playerId')
      localStorage.removeItem('playerData')
      setPlayer(null)
    })

    return () => newSocket.close()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen setPlayer={setPlayer} />} />
        <Route path="/lobby" element={
          player ? <Lobby player={player} socket={socket} gameState={gameState} /> : <Navigate to="/" replace />
        } />
        <Route path="/game" element={
          player ? (
            player.role === 'imposter' && player.status === 'alive' ? (
              <ImposterDashboard player={player} socket={socket} gameState={gameState} />
            ) : player.status === 'dead' ? (
              <GhostDashboard player={player} socket={socket} gameState={gameState} />
            ) : (
              <CrewmateDashboard player={player} socket={socket} gameState={gameState} />
            )
          ) : <Navigate to="/" replace />
        } />
        <Route path="/voting" element={
          player ? <VotingUI player={player} socket={socket} /> : <Navigate to="/" replace />
        } />
        <Route path="/admin" element={<AdminDashboard socket={socket} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
