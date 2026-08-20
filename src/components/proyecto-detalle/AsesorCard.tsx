import { Link } from 'react-router-dom'
import type { ProyectoAsesor } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { proyectoImageUrl } from '../../utils/proyectoImage'

type Props = {
  asesor: ProyectoAsesor | null | undefined
  className?: string
}

export function AsesorCard({ asesor, className = '' }: Props) {
  const locale = useLocale()
  if (!asesor) {
    return (
      <aside className={`proyecto-detail__asesor-card ${className}`.trim()}>
        <p className="proyecto-detail__asesor-card-title">{t(locale, 'asesorPersonalizado')}</p>
        <Link className="home-btn proyecto-detail__cta-yellow" to={pathFor('proyectos', locale)}>
          {t(locale, 'agendarVisita')}
        </Link>
        <Link className="home-btn home-btn--outline" to={localizedPath('/simulador', locale)}>
          {t(locale, 'simularCuota')}
        </Link>
      </aside>
    )
  }

  const primary = asesor.links[0]
  const secondary = asesor.links[1]

  return (
    <aside className={`proyecto-detail__asesor-card ${className}`.trim()}>
      <p className="proyecto-detail__asesor-card-title">{t(locale, 'asesorPersonalizado')}</p>
      <div className="proyecto-detail__asesor-profile">
        <img
          src={proyectoImageUrl(asesor.image_url)}
          alt=""
          className="proyecto-detail__asesor-photo"
        />
        <div>
          <p className="proyecto-detail__asesor-name">{asesor.nombre}</p>
          {asesor.cargo ? (
            <p className="proyecto-detail__asesor-role">{asesor.cargo}</p>
          ) : null}
        </div>
      </div>
      <div className="proyecto-detail__asesor-actions">
        {primary ? (
          <a
            className="home-btn home-btn--outline"
            href={primary.url}
            target="_blank"
            rel="noreferrer"
          >
            {primary.title || t(locale, 'agendar')}
          </a>
        ) : (
          <Link className="home-btn home-btn--outline" to={pathFor('proyectos', locale)}>
            {t(locale, 'agendar')}
          </Link>
        )}
        {secondary ? (
          <a
            className="home-btn proyecto-detail__cta-yellow"
            href={secondary.url}
            target="_blank"
            rel="noreferrer"
          >
            {secondary.title || t(locale, 'hablarAhora')}
          </a>
        ) : (
          <Link
            className="home-btn proyecto-detail__cta-yellow"
            to={localizedPath('/contacto', locale)}
          >
            {t(locale, 'hablarAhora')}
          </Link>
        )}
      </div>
      <div className="proyecto-detail__asesor-links">
        <Link to={pathFor('proyectos', locale)}>{t(locale, 'agendarVisita')}</Link>
        <Link to={localizedPath('/simulador', locale)}>{t(locale, 'simularCuota')}</Link>
      </div>
    </aside>
  )
}
