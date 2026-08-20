import type { ProyectoAvance, ProyectoDetail } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { proyectoImageUrl } from '../../utils/proyectoImage'

type Props = {
  data: ProyectoDetail
}

function normalizeAvances(data: ProyectoDetail): ProyectoAvance[] {
  if (data.avances?.length) return data.avances
  return (data.avances_obra ?? []).map((src, i) => ({
    fecha: null,
    titulo: `Avance ${i + 1}`,
    image_url: src,
    images: [src],
    porcentaje: null,
  }))
}

export function TabAvances({ data }: Props) {
  const locale = useLocale()
  const avances = normalizeAvances(data)

  if (!avances.length) {
    return (
      <div className="proyecto-detail__tab-panel">
        <h2 className="home-title">{t(locale, 'avancesConfianza')}</h2>
        <p className="home-text">{t(locale, 'sinAvances')}</p>
      </div>
    )
  }

  const featured = avances[0]
  const rest = avances.slice(1)

  return (
    <div className="proyecto-detail__tab-panel">
      <h2 className="home-title">{t(locale, 'avancesConfianza')}</h2>
      <p className="home-text">{t(locale, 'avancesConfianzaText')}</p>

      {featured.image_url || data.video_url ? (
        <div className="proyecto-detail__avance-featured">
          {data.video_url ? (
            <a
              className="proyecto-detail__avance-video"
              href={data.video_url}
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundImage: `url(${proyectoImageUrl(featured.image_url)})`,
              }}
            >
              <span className="proyecto-detail__avance-play" aria-hidden />
              <span className="sr-only">{t(locale, 'verVideo')}</span>
            </a>
          ) : (
            <img src={proyectoImageUrl(featured.image_url)} alt={featured.titulo} />
          )}
          <div className="proyecto-detail__avance-featured-meta">
            {featured.fecha ? <span>{featured.fecha}</span> : null}
            <strong>{featured.titulo}</strong>
            {featured.porcentaje != null ? <span>{featured.porcentaje}%</span> : null}
          </div>
        </div>
      ) : null}

      {rest.length ? (
        <div className="proyecto-detail__avances-grid">
          {rest.map((item) => (
            <figure key={`${item.fecha}-${item.titulo}`}>
              <img src={proyectoImageUrl(item.image_url)} alt={item.titulo} />
              <figcaption>
                {item.fecha ? <span>{item.fecha}</span> : null}
                <strong>{item.titulo}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  )
}
