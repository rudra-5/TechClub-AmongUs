import { useState, useEffect } from 'react'
import TaskList from '../../components/TaskList/TaskList'
import VerificationModal from '../../components/VerificationModal/VerificationModal'
import styles from './GhostDashboard.module.css'

function GhostDashboard({ player, socket, gameState }) {
  const [tasks, setTasks] = useState([])
  const [globalProgress, setGlobalProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(1800)
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    if (socket && player?.id) {
      socket.emit('playerJoin', player.id)

      socket.on('ghostTasksUpdate', (mainTasks) => {
        setTasks(mainTasks)
      })

      socket.on('progressUpdate', (progress) => {
        setGlobalProgress(progress)
      })

      socket.on('timerUpdate', (time) => {
        setTimeRemaining(time)
      })

      socket.emit('requestGhostTasks', player.id)
    }

    return () => {
      if (socket) {
        socket.off('ghostTasksUpdate')
        socket.off('progressUpdate')
        socket.off('timerUpdate')
      }
    }
  }, [socket, player])

  const handleTaskClick = (task) => {
    if (!task.completed) {
      setSelectedTask(task)
    }
  }

  const handleTaskComplete = (taskId, pin) => {
    socket.emit('verifyGhostTask', { playerId: player.id, taskId, pin })
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
        <div className={styles.identityBadge}>
          <span className={styles.ghostIcon}>👻</span>
          YOU ARE A GHOST
        </div>
        <div className={styles.timer}>
          ⏱️ {formatTime(timeRemaining)}
        </div>
      </header>

      <div className={styles.instruction}>
        <p>You have been eliminated. Go to Home Base and help your team by completing main tasks!</p>
      </div>

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
        <h2 className={styles.sectionTitle}>Main Tasks Only</h2>
        <TaskList tasks={tasks} onTaskClick={handleTaskClick} isGhost={true} />
      </div>

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

export default GhostDashboard
