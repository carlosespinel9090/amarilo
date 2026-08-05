import { Link } from 'react-router-dom'
import styles from './NotFound.module.scss'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { t } from '../../i18n/ui'

export function NotFound() {
  const locale = useLocale()
  return (
    <div className={styles.container}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>{t(locale, 'notFound')}</h1>
      <p className={styles.description}>
        {locale === 'en'
          ? 'The path you requested does not exist or was moved.'
          : locale === 'fr'
            ? "La page demandée n'existe pas ou a été déplacée."
            : 'La ruta que buscas no existe o fue movida.'}
      </p>
      <Link to={localizedPath('/', locale)} className={styles.link}>
        {locale === 'en' ? 'Back to home' : locale === 'fr' ? "Retour à l'accueil" : 'Volver al inicio'}
      </Link>
    </div>
  )
}
