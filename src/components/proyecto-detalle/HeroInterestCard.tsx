import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'

type Props = {
  className?: string
}

export function HeroInterestCard({ className = '' }: Props) {
  const locale = useLocale()
  return (
    <aside className={`proyecto-detail__interest-card ${className}`.trim()}>
      <p className="proyecto-detail__interest-card-title">{t(locale, 'teInteresaProyecto')}</p>
      <Link className="home-btn proyecto-detail__cta-yellow" to={pathFor('proyectos', locale)}>
        {t(locale, 'agendarVisita')}
      </Link>
      <Link className="home-btn home-btn--outline" to={localizedPath('/simulador', locale)}>
        {t(locale, 'simularCuota')}
      </Link>
    </aside>
  )
}
