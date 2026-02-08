import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Lobby.module.css'

function Lobby({ player, socket, gameState }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (socket && player?.id) {
      socket.emit('playerJoin', player.id)
    }
  }, [socket, player])

  useEffect(() => {
    if (gameState === 'active') {
      navigate('/game')
    }
  }, [gameState, navigate])

  if (!player) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.pulseEffect}>
          <h1 className={styles.title}>Waiting for Host to Start...</h1>
        </div>

        <div className={styles.playerCard}>
          <div className={styles.playerId}>
            {player.id}
          </div>
          <div className={styles.roleRestricted}>
            <div className={styles.lockIcon}>🔒</div>
            <p>Role Restricted</p>
          </div>
        </div>

        <div className={styles.status}>
          <div className={styles.dot}></div>
          <span>Connected to server</span>
        </div>
      </div>
    </div>
  )
}

export default Lobby
