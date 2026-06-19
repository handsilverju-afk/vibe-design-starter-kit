import styles from './AiOrb.module.css'

export function AiOrb({ size = 60, loading = false, compact = false }) {
  return (
    <div
      className={`${styles.orbWrap} ${loading ? styles.loading : ''} ${compact ? styles.compact : ''}`}
      style={{ width: size, height: size }}
    >
      <div className={styles.orb} />
    </div>
  )
}
