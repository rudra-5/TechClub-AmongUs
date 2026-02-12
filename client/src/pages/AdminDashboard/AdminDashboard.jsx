import { useState, useEffect } from 'react'
import styles from './AdminDashboard.module.css'

function AdminDashboard({ socket }) {
  const [players, setPlayers] = useState([])
  const [globalProgress, setGlobalProgress] = useState(0)
  const [gameState, setGameState] = useState('waiting')
  const [timeRemaining, setTimeRemaining] = useState(1800)
  const [searchTerm, setSearchTerm] = useState('')
  const [taskPins, setTaskPins] = useState([])
  const [voteResults, setVoteResults] = useState([])

  useEffect(() => {
    if (socket) {
      socket.on('adminPlayersUpdate', (playersList) => {
        setPlayers(playersList)
      })

      socket.on('progressUpdate', (progress) => {
        setGlobalProgress(progress)
      })

      socket.on('gameStateUpdate', (state) => {
        setGameState(state)
      })

      socket.on('timerUpdate', (time) => {
        setTimeRemaining(time)
      })

      socket.on('taskPinsUpdate', (pins) => {
        setTaskPins(pins)
      })

      socket.on('voteResultsUpdate', (results) => {
        setVoteResults(results)
      })

      // Request admin data (no playerJoin needed for admin)
      socket.emit('requestAdminData')

      // Refresh admin data every 2 seconds
      const interval = setInterval(() => {
        socket.emit('requestAdminData')
      }, 2000)

      return () => {
        clearInterval(interval)
        socket.off('adminPlayersUpdate')
        socket.off('progressUpdate')
        socket.off('gameStateUpdate')
        socket.off('timerUpdate')
        socket.off('taskPinsUpdate')
        socket.off('voteResultsUpdate')
      }
    }
  }, [socket])

  const handleStartGame = () => {
    if (window.confirm('Start the game? This will assign roles and start the timer.')) {
      socket.emit('startGame')
    }
  }

  const handleTriggerMeeting = () => {
    if (window.confirm('Trigger emergency meeting? All players will be pulled into the meeting screen for discussion.')) {
      socket.emit('triggerMeeting')
    }
  }

  const handleStartVoting = () => {
    if (window.confirm('Open voting? Players will be able to cast their votes.')) {
      socket.emit('startVoting')
    }
  }

  const handleResumeGame = () => {
    socket.emit('resumeGame')
  }

  const handleEjectPlayer = (playerId) => {
    const player = players.find(p => p.id === playerId)
    const roleLabel = player?.role === 'imposter' ? '🔪 IMPOSTER' : '👤 CREW'
    if (window.confirm(`Eject ${playerId}? They are: ${roleLabel}. They will become a ghost.`)) {
      socket.emit('ejectPlayer', playerId)
    }
  }

  const handleEndRound = () => {
    if (window.confirm('End the current round?')) {
      socket.emit('endRound')
    }
  }

  const handleResetAll = () => {
    if (window.confirm('RESET ALL DATA? This will clear all progress and disconnect all players. This action cannot be undone.')) {
      const secondConfirm = window.confirm('Are you absolutely sure? Type YES to confirm.')
      if (secondConfirm) {
        socket.emit('resetAll')
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredPlayers = players.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deadCount = players.filter(p => p.status === 'dead').length
  const aliveCrewCount = players.filter(p => p.role === 'crew' && p.status === 'alive').length
  const aliveImposterCount = players.filter(p => p.role === 'imposter' && p.status === 'alive').length

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/uowd_TC_logo.png" alt="Logo" className={styles.logo} />
          <h1>Admin Dashboard</h1>
        </div>
        <div className={styles.gameState}>
          <span className={`${styles.stateBadge} ${styles[gameState]}`}>
            {gameState.toUpperCase()}
          </span>
          <span className={styles.timer}>⏱️ {formatTime(timeRemaining)}</span>
        </div>
      </header>

      <div className={styles.controls}>
        <button
          className={styles.btnStart}
          onClick={handleStartGame}
          disabled={gameState === 'active' || gameState === 'voting'}
        >
          START GAME
        </button>
        <button
          className={styles.btnDanger}
          onClick={handleTriggerMeeting}
          disabled={gameState !== 'active'}
        >
          CALL MEETING
        </button>
        <button
          className={styles.btnVote}
          onClick={handleStartVoting}
          disabled={gameState !== 'meeting'}
        >
          OPEN VOTING
        </button>
        <button
          className={styles.btnResume}
          onClick={handleResumeGame}
          disabled={gameState !== 'voting'}
        >
          RESUME GAME
        </button>
        <button
          className={styles.btnEnd}
          onClick={handleEndRound}
        >
          FINISH GAME
        </button>
      </div>

      {(gameState === 'meeting' || gameState === 'voting') && (
        <div className={styles.voteResultsSection}>
          <h2>Vote Results</h2>
          {voteResults.length === 0 ? (
            <p className={styles.noVotes}>
              {gameState === 'meeting' ? 'Voting has not started yet.' : 'No votes cast yet.'}
            </p>
          ) : (
            <div className={styles.voteResultsList}>
              {voteResults.map(({ playerId, votes }) => {
                const targetPlayer = players.find(p => p.id === playerId)
                const isSkip = playerId === 'skip'
                const isAlive = targetPlayer?.status === 'alive'
                return (
                  <div key={playerId} className={styles.voteResultCard}>
                    <div className={styles.voteResultInfo}>
                      <span className={styles.voteResultName}>
                        {isSkip ? '⏭️ SKIP' : playerId}
                      </span>
                      {!isSkip && targetPlayer && (
                        <span className={`${styles.roleBadge} ${styles[targetPlayer.role]}`}>
                          {targetPlayer.role === 'imposter' ? '🔪' : '👤'} {targetPlayer.role}
                        </span>
                      )}
                    </div>
                    <div className={styles.voteResultRight}>
                      <span className={styles.voteCount}>{votes} vote{votes !== 1 ? 's' : ''}</span>
                      {!isSkip && isAlive && (
                        <button
                          className={styles.ejectBtn}
                          onClick={() => handleEjectPlayer(playerId)}
                        >
                          EJECT
                        </button>
                      )}
                      {!isSkip && !isAlive && (
                        <span className={styles.ejectedTag}>DEAD</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{aliveCrewCount}</div>
          <div className={styles.statLabel}>Alive Crew</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{aliveImposterCount}</div>
          <div className={styles.statLabel}>Alive Imposters</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{deadCount}</div>
          <div className={styles.statLabel}>Dead Players</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{globalProgress}%</div>
          <div className={styles.statLabel}>Task Progress</div>
        </div>
      </div>

      <div className={styles.progressSection}>
        <h2>Global Task Progress</h2>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${globalProgress}%` }}
          >
            {globalProgress}%
          </div>
        </div>
      </div>

      <div className={styles.taskPinsSection}>
        <h2>Task Verification PINs</h2>
        <div className={styles.taskPinsList}>
          {taskPins.map(task => (
            <div key={task.id} className={styles.taskPinCard}>
              <div className={styles.taskPinInfo}>
                <div className={styles.taskPinName}>{task.name}</div>
                {task.room && <div className={styles.taskPinRoom}>{task.room}</div>}
              </div>
              <div className={styles.taskPinValue}>{task.pin || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.playersSection}>
        <div className={styles.playersHeader}>
          <h2>Player List ({players.length})</h2>
          <input
            type="text"
            placeholder="Search player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Kills</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map(player => (
                <tr key={player.id} className={player.status === 'dead' ? styles.deadRow : ''}>
                  <td>{player.id}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[player.role]}`}>
                      {player.role === 'imposter' ? '🔪' : '👤'} {player.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[player.status]}`}>
                      {player.status}
                    </span>
                  </td>
                  <td>{player.tasksCompleted || 0}/{player.totalTasks || 0}</td>
                  <td>{player.kills || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>⚠️ Danger Zone</h3>
        <button className={styles.btnReset} onClick={handleResetAll}>
          RESET ALL DATA
        </button>
        <p className={styles.warning}>
          This will wipe all progress, revive all players, and disconnect current sessions.
          Use this when switching between rounds.
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard
