import { useApp } from '../../context/AppContext'
import styles from './SideNav.module.css'

function formatHistoryDate(dateStr, savedAt) {
  const today = new Date().toISOString().slice(0, 10)
  if (dateStr === today) {
    if (savedAt) {
      const d = new Date(savedAt)
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return `오늘 ${h}:${m}`
    }
    return '오늘'
  }
  return dateStr.replace(/-/g, '.')
}

export function SideNav() {
  const { view, newPlaylist, openHistory, entries } = useApp()

  return (
    <nav className={styles.nav}>
      <button className={styles.logo} onClick={newPlaylist}>
        <span className={styles.logoText}>Vibe</span>
      </button>

      <button className={styles.newBtn} onClick={newPlaylist}>
        <span className={styles.newIcon}>+</span>
        새 뮤직 리스트
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
                  onClick={() => openHistory(entryKey)}
                >
                  <span className={styles.historyTitle}>
                    {entry.title ?? entry.memo.slice(0, 24)}
                  </span>
                  <span className={styles.historyDate}>{formatHistoryDate(entry.date, entry.savedAt)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
