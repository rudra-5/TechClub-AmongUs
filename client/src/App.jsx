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
  const [player, setPlayer] = useState(null)
  const [gameState, setGameState] = useState('waiting') // waiting, active, voting, ended

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
    const newSocket = io(serverUrl)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
    })

    newSocket.on('gameStateUpdate', (state) => {
      setGameState(state)
    })

    newSocket.on('playerUpdate', (updatedPlayer) => {
      setPlayer(updatedPlayer)
    })

    return () => newSocket.close()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen setPlayer={setPlayer} />} />
        <Route path="/lobby" element={<Lobby player={player} socket={socket} gameState={gameState} />} />
        <Route path="/game" element={
          player?.role === 'imposter' && player?.status === 'alive' ? (
            <ImposterDashboard player={player} socket={socket} gameState={gameState} />
          ) : player?.status === 'dead' ? (
            <GhostDashboard player={player} socket={socket} gameState={gameState} />
          ) : (
            <CrewmateDashboard player={player} socket={socket} gameState={gameState} />
          )
        } />
        <Route path="/voting" element={<VotingUI player={player} socket={socket} />} />
        <Route path="/admin" element={<AdminDashboard socket={socket} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
