import { Link } from 'react-router-dom'
import type { PerfiladorMatchItem } from '../../types/perfilador'
import { useLocale } from '../../i18n/LocaleContext'
import { useCurrency } from '../../currency/CurrencyContext'
import { localizedPath } from '../../i18n/config'
import { formatPriceFull } from '../../utils/formatProyecto'

type MatchCardProps = {
  item: PerfiladorMatchItem
  matchLabel?: string
  viewLabel?: string
  scheduleLabel?: string
}

export function MatchCard({
  item,
  matchLabel = 'match!',
  viewLabel = 'Ver detalles',
  scheduleLabel = 'Agendar visita',
}: MatchCardProps) {
  const locale = useLocale()
  const { currency } = useCurrency()
  const { proyecto, score, matched, total } = item
  const zona = proyecto.ciudad || 'Colombia'
  const entrega = proyecto.estado || null
  const isVis = proyecto.segmentos.some((s) => /vis/i.test(s))

  return (
    <article className="perfilador-match">
      <div className="perfilador-match__main">
        <div className="perfilador-match__head">
          <h3 className="perfilador-match__title">{proyecto.title}</h3>
          <span className="perfilador-match__score">
            {score}% {matchLabel}
          </span>
        </div>
        <p className="perfilador-match__meta">
          <span className="perfilador-match__pin" aria-hidden>
            📍
          </span>
          {zona}
        </p>
        <div className="perfilador-match__facts">
          <span className="perfilador-match__building" aria-hidden>
            🏢
          </span>
          <span className="perfilador-match__price">{formatPriceFull(proyecto, currency)}</span>
          {entrega ? <span className="perfilador-match__tag">{entrega}</span> : null}
          {isVis ? <span className="perfilador-match__tag perfilador-match__tag--vis">VIS</span> : null}
        </div>
        <p className="perfilador-match__fulfilled">
          <span aria-hidden>✓</span> Cumple {matched} de {total} criterios de tu búsqueda
        </p>
      </div>
      <div className="perfilador-match__actions">
        <Link
          className="home-btn home-btn--outline perfilador-match__btn"
          to={localizedPath(proyecto.url || '/', locale)}
        >
          {viewLabel}
        </Link>
        <Link
          className="home-btn perfilador-match__btn"
          to={localizedPath(proyecto.url || '/', locale)}
        >
          {scheduleLabel}
        </Link>
      </div>
    </article>
  )
}
