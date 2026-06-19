import styles from './EmptyState.module.css'

export function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.message}>{message}</p>
      {actionLabel && (
        <button className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
