import styles from './Toast.module.css'

export function Toast({ message }) {
  return (
    <div className={styles.toast}>
      {message}
    </div>
  )
}
