import { useApp } from '../context/AppContext'
import { getEntries } from '../lib/storage'
import { ArchiveItem } from '../components/ui/ArchiveItem'
import { EmptyState } from '../components/ui/EmptyState'
import styles from './ArchiveScreen.module.css'

export function ArchiveScreen() {
  const { navigate } = useApp()
  const entries = getEntries()

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>기록</h1>
      </header>

      {entries.length === 0 ? (
        <EmptyState
          message={'아직 기록이 없어요.\n오늘 바이브를 남겨보세요!'}
          actionLabel="오늘 기록하러 가기"
          onAction={() => navigate('home')}
        />
      ) : (
        <ul className={styles.list}>
          {entries.map(entry => (
            <li key={entry.date}>
              <ArchiveItem
                date={entry.date}
                memoPreview={entry.memo.slice(0, 40)}
                playlistCount={entry.playlists.length}
                onClick={() => navigate('detail', entry.date)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
