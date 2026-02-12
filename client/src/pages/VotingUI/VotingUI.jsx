import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './VotingUI.module.css'

function VotingUI({ player, socket, gameState }) {
  const [alivePlayers, setAlivePlayers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [votingTimeRemaining, setVotingTimeRemaining] = useState(60)
  const navigate = useNavigate()

  const isMeeting = gameState === 'meeting'
  const isVoting = gameState === 'voting'

  // Navigate based on gameState prop (not socket listener, to avoid removing App.jsx's listener)
  useEffect(() => {
    if (gameState === 'active') {
      navigate('/game', { replace: true })
    }
    if (gameState === 'ended') {
      navigate('/game-ended', { replace: true })
    }
  }, [gameState, navigate])

  useEffect(() => {
    if (socket && player?.id) {
      socket.emit('playerJoin', player.id)

      socket.on('alivePlayers', (players) => {
        setAlivePlayers(players)
      })

      socket.on('votingTimer', (time) => {
        setVotingTimeRemaining(time)
      })

      socket.emit('requestAlivePlayers')
    }

    return () => {
      if (socket) {
        socket.off('alivePlayers')
        socket.off('votingTimer')
      }
    }
  }, [socket, player])

  // Reset vote state when transitioning from meeting to voting
  useEffect(() => {
    if (isVoting) {
      setHasVoted(false)
      setSelectedPlayer(null)
    }
  }, [isVoting])

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

  // Dead players see a waiting screen
  if (player.status === 'dead') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>EMERGENCY MEETING</h1>
          {isVoting && (
            <div className={styles.timer}>
              {votingTimeRemaining}s
            </div>
          )}
        </div>
        <div className={styles.deadMessage}>
          <span className={styles.ghostIcon}>👻</span>
          <p>Ghosts cannot vote</p>
          <p className={styles.subtext}>Waiting for meeting to end...</p>
        </div>
      </div>
    )
  }

  // MEETING phase — discussion, waiting for admin to start voting
  if (isMeeting) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>EMERGENCY MEETING</h1>
        </div>
        <div className={styles.discussionPhase}>
          <div className={styles.discussIcon}>💬</div>
          <h2>Discussion Phase</h2>
          <p>Discuss with your team. Voting will be opened by the host.</p>
        </div>
      </div>
    )
  }

  // VOTING phase — already voted
  if (hasVoted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>EMERGENCY MEETING</h1>
          <div className={styles.timer}>
            {votingTimeRemaining}s
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

  // VOTING phase — cast your vote
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>EMERGENCY MEETING</h1>
        <div className={styles.timer}>
          {votingTimeRemaining}s
        </div>
      </div>

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
