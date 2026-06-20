import { PlaylistCard } from './PlaylistCard'
import styles from './PlaylistGrid.module.css'

export function PlaylistGrid({ playlists, onPlay, currentId, isPaused }) {
  return (
    <ul className={styles.grid}>
      {playlists.map(p => (
        <li key={p.id}>
          <PlaylistCard
            title={p.title}
            artist={p.artist}
            tags={p.tags}
            artworkUrl={p.artworkUrl}
            previewUrl={p.previewUrl}
            platform={p.platform}
            reason={p.reason}
            isActive={currentId === p.id}
            isPlaying={currentId === p.id && !isPaused}
            onPlay={() => onPlay(p)}
          />
        </li>
      ))}
    </ul>
  )
}
