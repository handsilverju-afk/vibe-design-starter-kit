import styles from './ErrorBanner.module.css'

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className={styles.banner}>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retry} onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  )
}
