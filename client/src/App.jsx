import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { apiCall } from './utils/api'
import LoginScreen from './pages/LoginScreen/LoginScreen'
import Lobby from './pages/Lobby/Lobby'
import CrewmateDashboard from './pages/CrewmateDashboard/CrewmateDashboard'
import ImposterDashboard from './pages/ImposterDashboard/ImposterDashboard'
import GhostDashboard from './pages/GhostDashboard/GhostDashboard'
import VotingUI from './pages/VotingUI/VotingUI'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import GameEnded from './pages/GameEnded/GameEnded'
import './App.css'

// Helper to determine the correct route for a player
function getPlayerRoute(player, gameStatus) {
  if (!player) return '/'
  if (gameStatus === 'ended') {
    return '/game-ended'
  }
  if (gameStatus === 'active' || gameStatus === 'meeting') {
    return '/game'
  }
  if (gameStatus === 'voting') {
    return '/voting'
  }
  // waiting — go to lobby
  return '/lobby'
}

// Inner component that has access to router hooks
function AppRoutes({ socket, player, setPlayer, gameState, setGameState, sessionLoaded }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Restore session: validate with server and redirect to correct page
  useEffect(() => {
    if (!sessionLoaded) return

    const savedPlayerId = localStorage.getItem('playerId')

    if (savedPlayerId && !player) {
      // We have a stored session — validate it with the server
      apiCall(`/api/auth/session?playerId=${savedPlayerId}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            const restoredPlayer = data.player
            setPlayer(restoredPlayer)
            localStorage.setItem('playerData', JSON.stringify(restoredPlayer))
            setGameState(data.gameState)

            const targetRoute = getPlayerRoute(restoredPlayer, data.gameState)
            navigate(targetRoute, { replace: true })
          } else {
            // Session invalid — clear stored data
            localStorage.removeItem('playerId')
            localStorage.removeItem('playerData')
          }
        })
        .catch(() => {
          // Server unreachable — try to use cached data
          const savedPlayerData = localStorage.getItem('playerData')
          if (savedPlayerData) {
            setPlayer(JSON.parse(savedPlayerData))
          }
        })
    }
  }, [sessionLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // When a logged-in player navigates back to "/", redirect them
  useEffect(() => {
    if (player && location.pathname === '/') {
      const targetRoute = getPlayerRoute(player, gameState)
      navigate(targetRoute, { replace: true })
    }
  }, [player, location.pathname, gameState, navigate])

  // Re-verify player role from server when entering the game page to prevent stale role data
  useEffect(() => {
    if (socket && player?.id && (gameState === 'active' || gameState === 'meeting')) {
      socket.emit('requestPlayerData', player.id)
    }
  }, [socket, player?.id, gameState])

  return (
    <Routes>
      <Route path="/" element={<LoginScreen setPlayer={setPlayer} socket={socket} gameState={gameState} />} />
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
      <Route path="/game-ended" element={
        player ? <GameEnded player={player} socket={socket} gameState={gameState} /> : <Navigate to="/" replace />
      } />
      <Route path="/voting" element={
        player ? <VotingUI player={player} socket={socket} /> : <Navigate to="/" replace />
      } />
      <Route path="/admin" element={<AdminDashboard socket={socket} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  const [socket, setSocket] = useState(null)
  const [player, setPlayer] = useState(null)
  const [gameState, setGameState] = useState('waiting')
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [showDeathOverlay, setShowDeathOverlay] = useState(false)

  useEffect(() => {
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
      // Re-join socket room if we have a player session
      const savedPlayerId = localStorage.getItem('playerId')
      if (savedPlayerId) {
        newSocket.emit('playerJoin', savedPlayerId)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    newSocket.on('gameStateUpdate', (state) => {
      setGameState(state)
    })

    newSocket.on('playerUpdate', (updatedPlayer) => {
      setPlayer(prev => {
        // If a crew member just died, show death overlay
        if (prev && prev.status === 'alive' && updatedPlayer.status === 'dead' && prev.role === 'crew') {
          setShowDeathOverlay(true)
        }
        const updated = { ...prev, ...updatedPlayer }
        localStorage.setItem('playerData', JSON.stringify(updated))
        return updated
      })
    })

    newSocket.on('forceDisconnect', () => {
      localStorage.removeItem('playerId')
      localStorage.removeItem('playerData')
      setPlayer(null)
      setShowDeathOverlay(false)
    })

    setSessionLoaded(true)

    return () => newSocket.close()
  }, [])

  return (
    <Router>
      <AppRoutes
        socket={socket}
        player={player}
        setPlayer={setPlayer}
        gameState={gameState}
        setGameState={setGameState}
        sessionLoaded={sessionLoaded}
      />
      {showDeathOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            border: '2px solid #E63946'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>💀</div>
            <h2 style={{ color: '#E63946', fontSize: '24px', marginBottom: '12px' }}>
              You Have Been Eliminated
            </h2>
            <p style={{ color: '#D4CDFF', fontSize: '16px', marginBottom: '24px', lineHeight: '1.5' }}>
              You are now a ghost. Head to Home Base to continue helping your team by completing tasks.
            </p>
            <button
              onClick={() => setShowDeathOverlay(false)}
              style={{
                padding: '12px 32px',
                background: '#9CA3AF',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              CONTINUE AS GHOST
            </button>
          </div>
        </div>
      )}
    </Router>
  )
}

export default App
