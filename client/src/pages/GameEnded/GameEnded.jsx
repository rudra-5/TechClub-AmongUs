import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './GameEnded.module.css'

function GameEnded({ player, socket, gameState }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (gameState === 'waiting') {
      navigate('/', { replace: true })
    }
  }, [gameState, navigate])

  useEffect(() => {
    if (socket && player?.id) {
      socket.emit('playerJoin', player.id)
    }
  }, [socket, player])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>🎮</div>
        <h1 className={styles.title}>Game Over</h1>
        <p className={styles.message}>
          The game has ended. Please wait for the host to announce the results.
        </p>
        {player && (
          <div className={styles.playerInfo}>
            <span className={styles.playerId}>{player.id}</span>
            <span className={styles.playerRole}>
              {player.role === 'imposter' ? '🔪 Imposter' : '👤 Crewmate'}
            </span>
          </div>
        )}
        <div className={styles.waiting}>
          <div className={styles.dot}></div>
          <span>Waiting for host...</span>
        </div>
      </div>
    </div>
  )
}

export default GameEnded
