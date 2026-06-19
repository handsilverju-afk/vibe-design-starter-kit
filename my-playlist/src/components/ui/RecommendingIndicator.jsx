import styles from './RecommendingIndicator.module.css'

export function RecommendingIndicator({ visible }) {
  if (!visible) return null

  return (
    <div className={styles.wrap}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.text}>바이브 분석 중</span>
    </div>
  )
}
