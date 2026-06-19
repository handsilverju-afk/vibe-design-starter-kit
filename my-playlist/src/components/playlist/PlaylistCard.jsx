import { VibeTagList } from '../ui/VibeTagList'
import styles from './PlaylistCard.module.css'

export function PlaylistCard({ title, artist, tags, artworkUrl, previewUrl, platform, reason, isPlaying, onPlay }) {
  return (
    <button
      className={`${styles.item} ${isPlaying ? styles.playing : ''}`}
      onClick={onPlay}
    >
      <div className={styles.thumb}>
        {artworkUrl
          ? <img src={artworkUrl} alt={title} className={styles.thumbImg} />
          : <div className={styles.thumbFallback}>🎵</div>
        }
        {isPlaying && <div className={styles.thumbOverlay}>■</div>}
      </div>
      <div className={styles.info}>
        <span className={styles.title}>{title}</span>
        {artist && <span className={styles.artist}>{artist}</span>}
        <VibeTagList tags={tags} />
      </div>
      <span className={`${styles.playBtn} ${isPlaying ? styles.playBtnActive : ''}`}>
        {isPlaying ? '■' : '▶'}
      </span>
    </button>
  )
}
