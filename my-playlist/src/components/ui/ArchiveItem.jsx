import styles from './ArchiveItem.module.css'

export function ArchiveItem({ date, memoPreview, playlistCount, onClick }) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <button className={styles.item} onClick={onClick}>
      <div className={styles.left}>
        <span className={styles.date}>{formatted}</span>
        <span className={styles.preview}>{memoPreview}</span>
      </div>
      <span className={styles.count}>🎵 {playlistCount}</span>
    </button>
  )
}
