import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProyectoDetail } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { resolveTourEscenas } from './detailTabUtils'

type Props = {
  data: ProyectoDetail
}

export function TabTour360({ data }: Props) {
  const locale = useLocale()
  const escenas = resolveTourEscenas(data, t(locale, 'tabTour'))
  const [active, setActive] = useState(0)
  const current = escenas[Math.min(active, Math.max(escenas.length - 1, 0))]

  if (!current) {
    return (
      <div className="proyecto-detail__tab-panel">
        <h2 className="home-title">{t(locale, 'tabTour')}</h2>
        <p className="home-text">{t(locale, 'tourPendiente')}</p>
      </div>
    )
  }

  return (
    <div className="proyecto-detail__tab-panel">
      <h2 className="home-title">{t(locale, 'tabTour')}</h2>
      <p className="home-text">{t(locale, 'tourIntro')}</p>

      <div className="proyecto-detail__tour">
        <iframe
          title={current.title}
          src={current.url}
          loading="lazy"
          referrerPolicy="no-referrer"
          allowFullScreen
        />
        <p className="proyecto-detail__tour-vista">
          {t(locale, 'vistaTour')}: {current.title}
        </p>
        <a
          className="home-btn home-btn--dark"
          href={current.url}
          target="_blank"
          rel="noreferrer"
        >
          {t(locale, 'abrirTour')}
        </a>
      </div>

      {escenas.length > 1 ? (
        <div className="proyecto-detail__tour-escenas">
          {escenas.map((escena, idx) => (
            <button
              key={`${escena.title}-${escena.url}`}
              type="button"
              className={`proyecto-detail__tour-escena${active === idx ? ' is-active' : ''}`}
              onClick={() => setActive(idx)}
            >
              {escena.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="proyecto-detail__tour-cta">
        <p>{t(locale, 'experienciaCompleta')}</p>
        <div>
          <Link className="home-btn home-btn--outline" to={pathFor('proyectos', locale)}>
            {t(locale, 'agendarVisita')}
          </Link>
          <Link
            className="home-btn proyecto-detail__cta-yellow"
            to={localizedPath('/contacto', locale)}
          >
            {t(locale, 'quieroContacto')}
          </Link>
        </div>
      </div>
    </div>
  )
}
