import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../utils/api'
import styles from './LoginScreen.module.css'

function LoginScreen({ setPlayer }) {
  const [playerId, setPlayerId] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [takenIds, setTakenIds] = useState([])
  const navigate = useNavigate()

  // Fetch taken player IDs on mount and periodically
  useEffect(() => {
    const fetchTakenPlayers = async () => {
      try {
        const response = await apiCall('/api/auth/taken-players')
        const data = await response.json()
        if (data.takenIds) {
          setTakenIds(data.takenIds)
        }
      } catch (err) {
        // Silently fail - dropdown will show all options
      }
    }

    fetchTakenPlayers()
    const interval = setInterval(fetchTakenPlayers, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ playerId, passcode })
      })

      const data = await response.json()

      if (response.ok) {
        const playerData = data.player
        setPlayer(playerData)
        localStorage.setItem('playerId', playerData.id)
        localStorage.setItem('playerData', JSON.stringify(playerData))

        // Navigate based on game state and player status
        // Use replace so login page is removed from history
        if (playerData.status === 'lobby' || playerData.status === 'offline') {
          navigate('/lobby', { replace: true })
        } else if (playerData.status === 'alive' || playerData.status === 'dead') {
          navigate('/game', { replace: true })
        } else {
          navigate('/lobby', { replace: true })
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
  }

  const playerIds = Array.from({ length: 12 }, (_, i) => {
    const num = (i + 1).toString().padStart(2, '0')
    return `P${num}`
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/uowd_TC_logo.png" alt="UOWD Tech Club" className={styles.logo} />
        <h1 className={styles.title}>Among Us</h1>
      </div>

      <div className={styles.loginCard}>
        <h2 className={styles.subtitle}>Enter Lobby</h2>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="playerId">Player ID</label>
            <select
              id="playerId"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">Select your ID</option>
              {playerIds.map(id => (
                <option
                  key={id}
                  value={id}
                  disabled={takenIds.includes(id)}
                >
                  {id}{takenIds.includes(id) ? ' (taken)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="passcode">Passcode</label>
            <input
              type="password"
              id="passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="e.g., P01-X"
              required
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn}>
            ENTER LOBBY
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginScreen
