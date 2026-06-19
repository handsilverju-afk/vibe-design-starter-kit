import styles from './MemoInput.module.css'

export function MemoInput({ value, onChange, loading, onKeyDown, className }) {
  return (
    <div className={styles.wrap}>
      <textarea
        className={`${styles.textarea} ${loading ? styles.loading : ''} ${className ?? ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="오늘 기분이나 일정을 적어보세요."
        rows={2}
      />
    </div>
  )
}
