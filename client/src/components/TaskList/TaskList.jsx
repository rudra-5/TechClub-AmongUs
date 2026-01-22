import styles from './TaskList.module.css'

function TaskList({ tasks, onTaskClick, isGhost = false }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No tasks available</p>
      </div>
    )
  }

  return (
    <div className={styles.taskList}>
      {tasks.map(task => (
        <div
          key={task.id}
          className={`${styles.taskCard} ${task.completed ? styles.completed : ''} ${isGhost ? styles.ghost : ''}`}
          onClick={() => !task.completed && onTaskClick(task)}
        >
          <div className={styles.taskIcon}>
            {task.completed ? '✓' : '○'}
          </div>
          <div className={styles.taskInfo}>
            <div className={styles.taskName}>{task.name}</div>
            <div className={styles.taskRoom}>{task.room}</div>
          </div>
          <div className={styles.taskBadge}>
            {task.type === 'main' ? '★' : ''}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskList
