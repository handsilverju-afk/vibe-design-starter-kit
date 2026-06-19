import styles from './PlaylistSheet.module.css'
import { PlaylistGrid } from './PlaylistGrid'

export function PlaylistSheet({ playlists, onPlay, currentId, isOpen, isCollapsed }) {
  return (
    <div
      className={[
        styles.sheet,
        isOpen ? styles.open : '',
        isOpen && isCollapsed ? styles.collapsed : '',
      ].join(' ')}
    >
      <div className={styles.handle} />
      {!isCollapsed && (
        <p className={styles.label}>오늘 바이브에 맞는 앨범이에요</p>
      )}
      <div className={styles.list}>
        <PlaylistGrid playlists={playlists} onPlay={onPlay} currentId={currentId} />
      </div>
    </div>
  )
}
