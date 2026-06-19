import { useApp } from '../../context/AppContext'
import styles from './BottomNav.module.css'

export function BottomNav() {
  const { view, navigate } = useApp()
  const active = view.screen === 'home' ? 'home' : 'archive'

  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.tab} ${active === 'home' ? styles.active : ''}`}
        onClick={() => navigate('home')}
      >
        <span className={styles.icon}>🎵</span>
        <span className={styles.label}>오늘</span>
      </button>
      <button
        className={`${styles.tab} ${active === 'archive' ? styles.active : ''}`}
        onClick={() => navigate('archive')}
      >
        <span className={styles.icon}>📋</span>
        <span className={styles.label}>기록</span>
      </button>
    </nav>
  )
}
