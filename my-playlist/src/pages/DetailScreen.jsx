import { useApp } from '../context/AppContext'
import { getEntryByKey } from '../lib/storage'
import { PlaylistGrid } from '../components/playlist/PlaylistGrid'
import styles from './DetailScreen.module.css'

function formatDetailDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return {
    dateLine: `${year}.${month}.${day}`,
    dayName: `${days[d.getDay()]}요일`,
  }
}

export function DetailScreen({ date }) {
  const { audio } = useApp()
  const entry = getEntryByKey(date)

  if (!entry) {
    return (
      <div className={styles.screen}>
        <p className={styles.notFound}>기록을 찾을 수 없어요.</p>
      </div>
    )
  }

  const { dateLine, dayName } = formatDetailDate(entry.date)

  function handlePlay(playlist) {
    if (entry.playlists.some(p => p.previewUrl)) {
      audio.toggle(playlist.id, entry.playlists)
    } else {
      const query = encodeURIComponent(`${playlist.title} ${playlist.artist ?? ''}`.trim())
      window.open(`https://music.apple.com/search?term=${query}`, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.inner}>
        <div className={styles.dateHeader}>
          <time className={styles.dateLine}>{dateLine}</time>
          <span className={styles.dayBadge}>{dayName}</span>
        </div>

        <div className={styles.quoteBlock}>
          <span className={styles.openQuote}>&ldquo;</span>
          <p className={styles.quoteText}>{entry.memo}</p>
        </div>

        <div className={styles.playlistSection}>
          <PlaylistGrid
            playlists={entry.playlists}
            onPlay={handlePlay}
            currentId={audio.currentId}
          />
        </div>
      </div>
    </div>
  )
}
