import type { ProyectoDetail } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'

type Props = {
  data: ProyectoDetail
}

export function TabUbicacion({ data }: Props) {
  const locale = useLocale()
  const ubi = data.ubicacion_detalle
  const como = ubi?.como_llegar || data.como_llegar || ''
  const lat = ubi?.lat
  const lng = ubi?.lng
  const pois = ubi?.pois ?? []
  const hasCoords = lat != null && lng != null
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : null
  const wazeUrl = hasCoords ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` : null
  const embedUrl = hasCoords
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : null

  return (
    <div className="proyecto-detail__tab-panel">
      <h2 className="home-title">{t(locale, 'ubicacionEntorno')}</h2>
      {como ? <p className="home-text">{como}</p> : null}

      {embedUrl ? (
        <div className="proyecto-detail__map-wrap">
          <div className="proyecto-detail__map-actions">
            {wazeUrl ? (
              <a className="home-btn home-btn--outline" href={wazeUrl} target="_blank" rel="noreferrer">
                {t(locale, 'abrirWaze')}
              </a>
            ) : null}
            {mapsUrl ? (
              <a className="home-btn home-btn--outline" href={mapsUrl} target="_blank" rel="noreferrer">
                {t(locale, 'abrirMaps')}
              </a>
            ) : null}
          </div>
          <iframe
            title={t(locale, 'ubicacionEntorno')}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ) : null}

      {pois.length ? (
        <ul className="proyecto-detail__pois">
          {pois.map((poi) => {
            const label =
              poi.texto?.trim() ||
              (poi.minutos != null
                ? `${poi.nombre} - ${poi.minutos} min`
                : poi.nombre)
            return <li key={`${poi.nombre}-${poi.minutos}`}>{label}</li>
          })}
        </ul>
      ) : null}
    </div>
  )
}
