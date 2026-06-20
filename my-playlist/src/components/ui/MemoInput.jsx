import { useRef, useEffect } from 'react'
import styles from './MemoInput.module.css'

export function MemoInput({ value, onChange, loading, onKeyDown, className }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`
  }, [value])

  return (
    <div className={styles.wrap}>
      <textarea
        ref={textareaRef}
        className={`${styles.textarea} ${loading ? styles.loading : ''} ${className ?? ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="오늘 기분이나 일정을 적어보세요."
      />
    </div>
  )
}
