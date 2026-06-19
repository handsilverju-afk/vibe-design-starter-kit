import styles from './DateBadge.module.css'

export function DateBadge({ date }) {
  const formatted = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : ''

  return <p className={styles.badge}>{formatted}</p>
}
