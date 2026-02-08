import { useState } from 'react'
import styles from './VerificationModal.module.css'

function VerificationModal({ task, onClose, onVerify }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit)
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const handleSubmit = () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN')
      triggerShake()
      return
    }

    onVerify(task.id, pin)
    setPin('')
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${shake ? styles.shake : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>Task Verification</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.taskInfo}>
          <p className={styles.taskName}>{task.name}</p>
          {task.room && <p className={styles.taskRoom}>{task.room}</p>}
        </div>

        <div className={styles.instruction}>
          Ask Station Exec to enter PIN
        </div>

        <div className={styles.pinDisplay}>
          {[0, 1, 2, 3].map(index => (
            <div key={index} className={styles.pinDot}>
              {pin[index] ? '●' : '○'}
            </div>
          ))}
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              className={styles.keypadBtn}
              onClick={() => handlePinInput(num.toString())}
            >
              {num}
            </button>
          ))}
          <button
            className={`${styles.keypadBtn} ${styles.backspace}`}
            onClick={handleBackspace}
          >
            ⌫
          </button>
          <button
            className={styles.keypadBtn}
            onClick={() => handlePinInput('0')}
          >
            0
          </button>
          <button
            className={`${styles.keypadBtn} ${styles.submit}`}
            onClick={handleSubmit}
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerificationModal
