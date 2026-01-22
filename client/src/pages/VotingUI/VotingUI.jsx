import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './VotingUI.module.css'

function VotingUI({ player, socket }) {
  const [alivePlayers, setAlivePlayers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [votingOpen, setVotingOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (socket) {
      socket.on('alivePlayers', (players) => {
        setAlivePlayers(players)
      })

      socket.on('votingTimer', (time) => {
        setTimeRemaining(time)
        setVotingOpen(time <= 20) // Voting opens after 40 seconds
      })

      socket.on('gameStateUpdate', (state) => {
        if (state === 'active') {
          navigate('/game')
        }
      })

      socket.emit('requestAlivePlayers')
    }

    return () => {
      if (socket) {
        socket.off('alivePlayers')
        socket.off('votingTimer')
        socket.off('gameStateUpdate')
      }
    }
  }, [socket, navigate])

  const handleVote = (votedPlayerId) => {
    setSelectedPlayer(votedPlayerId)
  }

  const confirmVote = () => {
    socket.emit('castVote', { voterId: player.id, votedFor: selectedPlayer })
    setHasVoted(true)
    setSelectedPlayer(null)
  }

  const handleSkip = () => {
    socket.emit('castVote', { voterId: player.id, votedFor: 'skip' })
    setHasVoted(true)
  }

  const filteredPlayers = alivePlayers.filter(p => 
    p.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!player) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (player.status === 'dead') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>EMERGENCY MEETING</h1>
          <div className={styles.timer}>
            {timeRemaining}s
          </div>
        </div>
        <div className={styles.deadMessage}>
          <span className={styles.ghostIcon}>👻</span>
          <p>Ghosts cannot vote</p>
          <p className={styles.subtext}>Waiting for meeting to end...</p>
        </div>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>EMERGENCY MEETING</h1>
          <div className={styles.timer}>
            {timeRemaining}s
          </div>
        </div>
        <div className={styles.waitingMessage}>
          <div className={styles.checkmark}>✓</div>
          <p>Vote Cast</p>
          <p className={styles.subtext}>Waiting for others...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>EMERGENCY MEETING</h1>
        <div className={styles.timer}>
          {timeRemaining}s
        </div>
      </div>

      {!votingOpen ? (
        <div className={styles.discussionPhase}>
          <h2>Discussion Phase</h2>
          <p>Voting will open in {timeRemaining - 20} seconds</p>
          <div className={styles.discussIcon}>💬</div>
        </div>
      ) : (
        <>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.playerGrid}>
            {filteredPlayers.map(playerId => (
              <button
                key={playerId}
                className={`${styles.playerButton} ${playerId === player.id ? styles.self : ''}`}
                onClick={() => handleVote(playerId)}
              >
                {playerId}
                {playerId === player.id && <span className={styles.youTag}>YOU</span>}
              </button>
            ))}
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.skipButton} onClick={handleSkip}>
              SKIP VOTE
            </button>
          </div>
        </>
      )}

      {selectedPlayer && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <h2>Confirm Vote</h2>
            <p>Vote to eject <strong>{selectedPlayer}</strong>?</p>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmBtn} onClick={confirmVote}>
                CONFIRM
              </button>
              <button className={styles.cancelBtn} onClick={() => setSelectedPlayer(null)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VotingUI
