import { Link } from 'react-router-dom'
import styles from './NotFound.module.scss'

export function NotFound() {
  return (
    <div className={styles.container}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Página no encontrada</h1>
      <p className={styles.description}>
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/" className={styles.link}>
        Volver al inicio
      </Link>
    </div>
  )
}
