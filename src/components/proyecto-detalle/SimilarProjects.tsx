import { Link, useNavigate } from 'react-router-dom'
import type { ProyectoCard } from '../../types/home'
import { useCurrency } from '../../currency/CurrencyContext'
import { useLocale } from '../../i18n/LocaleContext'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { formatPriceCompact } from '../../utils/formatProyecto'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import { compareIdsQuery, useCompare } from '../../hooks/useCompare'
import { isPremiumSegment, isVisSegment } from './detailTabUtils'

type Props = {
  items: ProyectoCard[] | undefined
}

function ProjectCardLite({ item }: { item: ProyectoCard }) {
  const locale = useLocale()
  const navigate = useNavigate()
  const { currency } = useCurrency()
  const { add, isCompared } = useCompare()
  const slug = item.url.replace(/^\/proyectos\//, '').replace(/^\//, '')
  const to = pathFor('proyectos', locale, slug)
  const image = proyectoImageUrl(item.image_url)
  const premium = isPremiumSegment(item.segmentos) || item.variant === 'premium'
  const vis = isVisSegment(item.segmentos)
  const compared = isCompared(item.id)

  const onCompare = () => {
    const next = add(item.id)
    const q = compareIdsQuery(next)
    navigate(`${pathFor('comparador', locale)}${q ? `?${q}` : ''}`)
  }

  return (
    <article
      className={`project-card${premium ? ' project-card--premium' : ''}`}
    >
      <div
        className="project-card__media"
        style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }}
      >
        <div className="project-card__badges">
          {item.estado ? <span className="project-card__badge">{item.estado}</span> : null}
          <span
            className={`project-card__badge${premium || vis ? '' : ' project-card__badge--outline'}`}
          >
            {premium
              ? t(locale, 'badgePremium')
              : t(locale, vis ? 'badgeVis' : 'badgeNoVis')}
          </span>
        </div>
      </div>
      <div className="project-card__body">
        <h3 className="project-card__title">{item.title}</h3>
        <p className="project-card__meta">{item.ciudad || 'Colombia'}</p>
        <p className="project-card__price">{formatPriceCompact(item, currency)}</p>
        <ul className="project-card__specs">
          {(item.amenities ?? []).slice(0, 3).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="project-card__actions">
          <Link className="home-btn home-btn--dark" to={to}>
            {t(locale, 'verProyecto')}
          </Link>
          <button
            type="button"
            className={`home-btn home-btn--outline${compared ? ' is-active' : ''}`}
            aria-pressed={compared}
            onClick={onCompare}
          >
            {t(locale, 'comparar')}
          </button>
        </div>
      </div>
    </article>
  )
}

export function SimilarProjects({ items }: Props) {
  const locale = useLocale()
  if (!items?.length) return null

  return (
    <section className="proyecto-detail__related">
      <h2 className="home-title">{t(locale, 'proyectosSimilares')}</h2>
      <div className="proyecto-detail__related-grid">
        {items.slice(0, 3).map((item) => (
          <ProjectCardLite key={item.uuid} item={item} />
        ))}
      </div>
    </section>
  )
}
