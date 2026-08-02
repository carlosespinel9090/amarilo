import styles from './InfoBadge.module.scss'

interface InfoBadgeProps {
  title: string
  subtitle: string
}

export function InfoBadge({ title, subtitle }: InfoBadgeProps) {
  return (
    <div className={styles.badge}>
      <span className={styles.dot} />
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  )
}
