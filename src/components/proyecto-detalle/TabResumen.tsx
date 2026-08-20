import { useState } from 'react'
import type { ProyectoDetail } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'

type Props = {
  data: ProyectoDetail
  showAcabados?: boolean
}

export function TabResumen({ data, showAcabados = false }: Props) {
  const locale = useLocale()
  const desc = data.descripcion?.trim() || ''
  const [open, setOpen] = useState(false)
  const long = desc.length > 420
  const shown = open || !long ? desc : `${desc.slice(0, 420).trim()}…`
  const highlights = data.highlights ?? []
  const acabados = showAcabados ? (data.amenidades_rich ?? []).slice(0, 4) : []

  return (
    <div className="proyecto-detail__tab-panel">
      {desc ? (
        <>
          <h2 className="home-title">{t(locale, 'descripcionTitulo')}</h2>
          <p className="home-text">{shown}</p>
          {long ? (
            <button
              type="button"
              className="proyecto-detail__text-toggle"
              onClick={() => setOpen((v) => !v)}
            >
              {t(locale, open ? 'leerMenos' : 'leerMas')}
            </button>
          ) : null}
        </>
      ) : null}

      {highlights.length ? (
        <div className="proyecto-detail__why">
          <h3 className="proyecto-detail__why-title">{t(locale, 'porQueElegir')}</h3>
          <ul className="proyecto-detail__why-list">
            {highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {acabados.length ? (
        <div className="proyecto-detail__acabados">
          <h3 className="proyecto-detail__acabados-title">{t(locale, 'acabadosLujo')}</h3>
          <div className="proyecto-detail__acabados-grid">
            {acabados.map((item) => (
              <article key={item.titulo} className="proyecto-detail__acabado-card">
                <span className="proyecto-detail__acabado-icon" aria-hidden />
                <h4>{item.titulo}</h4>
                {item.descripcion ? <p>{item.descripcion}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
