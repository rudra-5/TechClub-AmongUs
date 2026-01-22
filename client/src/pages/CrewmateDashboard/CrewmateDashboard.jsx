import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskList from '../../components/TaskList/TaskList'
import VerificationModal from '../../components/VerificationModal/VerificationModal'
import styles from './CrewmateDashboard.module.css'

function CrewmateDashboard({ player, socket, gameState }) {
  const [tasks, setTasks] = useState([])
  const [globalProgress, setGlobalProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes in seconds
  const [selectedTask, setSelectedTask] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (gameState === 'voting') {
      navigate('/voting')
    }
  }, [gameState, navigate])

  useEffect(() => {
    if (socket) {
      socket.on('tasksUpdate', (updatedTasks) => {
        setTasks(updatedTasks)
      })

      socket.on('progressUpdate', (progress) => {
        setGlobalProgress(progress)
      })

      socket.on('timerUpdate', (time) => {
        setTimeRemaining(time)
      })

      // Request initial data
      socket.emit('requestTasks', player?.id)
    }

    return () => {
      if (socket) {
        socket.off('tasksUpdate')
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
    socket.emit('verifyTask', { playerId: player.id, taskId, pin })
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
          YOU ARE A CREWMATE
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
        <h2 className={styles.sectionTitle}>Your Tasks</h2>
        <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
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

export default CrewmateDashboard
