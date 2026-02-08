import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import TaskList from '../../components/TaskList/TaskList'
import VerificationModal from '../../components/VerificationModal/VerificationModal'
import styles from './ImposterDashboard.module.css'

function ImposterDashboard({ player, socket, gameState }) {
  const [tasks, setTasks] = useState([])
  const [globalProgress, setGlobalProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(1800)
  const [killCooldown, setKillCooldown] = useState(0)
  const [teammates, setTeammates] = useState([])
  const [showScanner, setShowScanner] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (gameState === 'voting') {
      navigate('/voting')
    }
  }, [gameState, navigate])

  useEffect(() => {
    if (socket && player?.id) {
      socket.emit('playerJoin', player.id)

      socket.on('tasksUpdate', (updatedTasks) => {
        setTasks(updatedTasks)
      })

      socket.on('progressUpdate', (progress) => {
        setGlobalProgress(progress)
      })

      socket.on('timerUpdate', (time) => {
        setTimeRemaining(time)
      })

      socket.on('killCooldownUpdate', (cooldown) => {
        setKillCooldown(cooldown)
      })

      socket.on('teammatesUpdate', (imposterTeam) => {
        setTeammates(imposterTeam)
      })

      socket.emit('requestTasks', player.id)
      socket.emit('requestTeammates', player.id)
    }

    return () => {
      if (socket) {
        socket.off('tasksUpdate')
        socket.off('progressUpdate')
        socket.off('timerUpdate')
        socket.off('killCooldownUpdate')
        socket.off('teammatesUpdate')
      }
    }
  }, [socket, player])

  useEffect(() => {
    let scanner
    if (showScanner) {
      scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        facingMode: "environment" // Use back camera directly
      })

      scanner.render(onScanSuccess, onScanError)
    }

    return () => {
      if (scanner) {
        scanner.clear()
      }
    }
  }, [showScanner])

  const onScanSuccess = (decodedText) => {
    socket.emit('attemptKill', { killerId: player.id, victimId: decodedText })
    setShowScanner(false)
  }

  const onScanError = (error) => {
    // Ignore scan errors
  }

  const handleKillClick = () => {
    if (killCooldown === 0) {
      setShowScanner(true)
    }
  }

  const handleTaskClick = (task) => {
    if (!task.completed) {
      setSelectedTask(task)
    }
  }

  const handleTaskComplete = (taskId, pin) => {
    socket.emit('verifyFakeTask', { playerId: player.id, taskId, pin })
    setSelectedTask(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!player) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.identityBadge}>
            YOU ARE AN IMPOSTER
          </div>
          <div className={styles.teammates}>
            Allies: {teammates.join(', ')}
          </div>
        </div>
        <div className={styles.timer}>
          ⏱️ {formatTime(timeRemaining)}
        </div>
      </header>

      <div className={styles.progressSection}>
        <h3>Global Progress</h3>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${globalProgress}%` }}
          >
            {globalProgress}%
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <h2 className={styles.sectionTitle}>Fake Tasks (for cover)</h2>
        <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
      </div>

      <button
        className={`${styles.killButton} ${killCooldown > 0 ? styles.cooldown : ''}`}
        onClick={handleKillClick}
        disabled={killCooldown > 0}
      >
        {killCooldown > 0 ? (
          <>
            <span className={styles.cooldownIcon}>⏳</span>
            <span>{formatTime(killCooldown)}</span>
          </>
        ) : (
          <>
            <span className={styles.killIcon}>🔪</span>
            <span>KILL</span>
          </>
        )}
      </button>

      {showScanner && (
        <div className={styles.scannerOverlay}>
          <div className={styles.scannerHeader}>
            <h2>Scan Victim's QR Code</h2>
            <button
              className={styles.closeBtn}
              onClick={() => setShowScanner(false)}
            >
              ✕
            </button>
          </div>
          <div id="qr-reader" className={styles.qrReader}></div>
        </div>
      )}

      {selectedTask && (
        <VerificationModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onVerify={handleTaskComplete}
        />
      )}
    </div>
  )
}

export default ImposterDashboard
