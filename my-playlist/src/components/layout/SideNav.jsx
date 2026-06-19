import { useApp } from '../../context/AppContext'
import styles from './SideNav.module.css'

function formatHistoryDate(dateStr) {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today) return '오늘'
  if (dateStr === yesterday) return '어제'
  return dateStr.slice(5).replace('-', '.')
}

export function SideNav() {
  const { navigate, view, newPlaylist, entries } = useApp()

  return (
    <nav className={styles.nav}>
      <button className={styles.logo} onClick={newPlaylist}>
        <span className={styles.logoText}>Vibe</span>
      </button>

      <button className={styles.newBtn} onClick={newPlaylist}>
        <span className={styles.newIcon}>+</span>
        새 뮤직리스트
      </button>

      {entries.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>히스토리</span>
          <div className={styles.historyList}>
            {entries.map(entry => {
              const entryKey = entry.sessionId ?? entry.date
              return (
                <button
                  key={entryKey}
                  className={`${styles.historyItem} ${view.screen === 'detail' && view.date === entryKey ? styles.active : ''}`}
                  onClick={() => navigate('detail', entryKey)}
                >
                  <span className={styles.historyDate}>{formatHistoryDate(entry.date)}</span>
                  <span className={styles.historyTitle}>
                    {entry.title ?? entry.memo.slice(0, 24)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
