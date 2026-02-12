import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
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
  const [killNotification, setKillNotification] = useState(null) // { type: 'success' | 'friendly', victimId }
  const scannerRef = useRef(null)
  const scannedRef = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (gameState === 'meeting' || gameState === 'voting') {
      navigate('/voting', { replace: true })
    }
    if (gameState === 'ended') {
      navigate('/game-ended', { replace: true })
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

      socket.on('killResult', (result) => {
        if (result.success) {
          setKillNotification({ type: 'success', victimId: result.victimId })
        } else if (result.error && result.error.includes('FRIENDLY FIRE')) {
          setKillNotification({ type: 'friendly', victimId: null })
        }
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
        socket.off('killResult')
      }
    }
  }, [socket, player])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === 2) { // SCANNING
          await scannerRef.current.stop()
        }
      } catch (e) {
        // Ignore stop errors
      }
      scannerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!showScanner) return

    scannedRef.current = false
    const html5Qrcode = new Html5Qrcode('qr-reader')
    scannerRef.current = html5Qrcode

    html5Qrcode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        // Prevent double-scan
        if (scannedRef.current) return
        scannedRef.current = true

        socket.emit('attemptKill', { killerId: player.id, victimId: decodedText })

        // Stop camera then close overlay
        html5Qrcode.stop().catch(() => { }).finally(() => {
          scannerRef.current = null
          setShowScanner(false)
        })
      },
      () => { } // Ignore per-frame scan errors
    ).catch((err) => {
      console.error('Camera start failed:', err)
      setShowScanner(false)
    })

    return () => {
      stopScanner()
    }
  }, [showScanner, socket, player?.id, stopScanner])

  const handleCloseScanner = async () => {
    await stopScanner()
    setShowScanner(false)
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
          <button
            className={styles.closeBtn}
            onClick={handleCloseScanner}
          >
            ✕
          </button>
          <div id="qr-reader" className={styles.qrReader}></div>
          <div className={styles.scannerHint}>Point camera at player's QR code</div>
        </div>
      )}

      {selectedTask && (
        <VerificationModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onVerify={handleTaskComplete}
        />
      )}

      {killNotification && killNotification.type === 'success' && (
        <div className={styles.notification}>
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>💀</div>
            <h2>Kill Confirmed</h2>
            <p><strong>{killNotification.victimId}</strong> has been eliminated.</p>
            <button
              className={styles.notificationBtn}
              onClick={() => setKillNotification(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {killNotification && killNotification.type === 'friendly' && (
        <div className={`${styles.notification} ${styles.friendlyFireNotification}`}>
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>🛡️</div>
            <h2>Cannot Kill Ally!</h2>
            <p>This player is a fellow imposter. You cannot eliminate your own teammate.</p>
            <button
              className={styles.notificationBtn}
              onClick={() => setKillNotification(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImposterDashboard
