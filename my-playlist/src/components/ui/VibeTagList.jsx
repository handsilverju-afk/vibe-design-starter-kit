import styles from './VibeTagList.module.css'

export function VibeTagList({ tags }) {
  return (
    <ul className={styles.list}>
      {tags.map(tag => (
        <li key={tag} className={styles.tag}>{tag}</li>
      ))}
    </ul>
  )
}
