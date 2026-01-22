import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoginScreen.module.css'

function LoginScreen({ setPlayer }) {
  const [playerId, setPlayerId] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, passcode })
      })

      const data = await response.json()

      if (response.ok) {
        setPlayer(data.player)
        localStorage.setItem('playerId', data.player.id)
        navigate('/lobby')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
  }

  const playerIds = Array.from({ length: 30 }, (_, i) => {
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
                <option key={id} value={id}>{id}</option>
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
