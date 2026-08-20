import { Link, useNavigate } from 'react-router-dom'
import type { MouseEvent } from 'react'
import type { ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { useCurrency } from '../../currency/CurrencyContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { formatPriceCompact, formatPriceFull } from '../../utils/formatProyecto'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import { useFavorites } from '../../hooks/useFavorites'
import { compareIdsQuery, useCompare } from '../../hooks/useCompare'

function formatHab(min: number | null, max: number | null) {
  if (min == null && max == null) return null
  if (min != null && max != null && min !== max) return `${min}-${max} hab`
  return `${min ?? max} hab`
}

export function ProjectCardView({
  item,
  compact = false,
  priceMode = 'compact',
}: {
  item: ProyectoCard
  compact?: boolean
  priceMode?: 'compact' | 'full'
}) {
  const locale = useLocale()
  const navigate = useNavigate()
  const { currency } = useCurrency()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { add, isCompared } = useCompare()
  const premium = item.variant === 'premium'
  const compared = isCompared(item.id)
  const hab = formatHab(item.hab_min, item.hab_max)
  const premiumLabel = t(locale, 'badgePremium')
  const badges = [
    ...item.segmentos.filter((s) => !/premium/i.test(s)),
    ...(item.estado ? [item.estado] : []),
    ...(premium ? [premiumLabel] : []),
  ].slice(0, 3)
  const image = proyectoImageUrl(item.image_url)
  const favorited = isFavorite(item.id)
  const price =
    priceMode === 'full' ? formatPriceFull(item, currency) : formatPriceCompact(item, currency)
  const projectTo = localizedPath(item.url || '/', locale)
  const financeTo = pathFor('financiacion', locale)
  const onCompare = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = add(item.id)
    const q = compareIdsQuery(next)
    navigate(`${pathFor('comparador', locale)}${q ? `?${q}` : ''}`)
  }
  const availabilityParts = [
    item.unidades != null
      ? t(locale, 'specsUnidades').replace('{n}', String(item.unidades))
      : null,
    item.estado || null,
  ].filter(Boolean)
  const amenityItems =
    item.amenities.length > 0
      ? item.amenities.slice(0, 3)
      : [hab, item.area_m2 != null ? `${Math.round(item.area_m2)} m²` : null].filter(
          Boolean,
        ) as string[]

  const badgeClass = (label: string) => {
    if (/premium/i.test(label)) return ' project-card__badge--premium'
    if (/\bvis\b/i.test(label) || /no\s*vis/i.test(label)) return ' project-card__badge--vis'
    return ''
  }

  return (
    <article
      className={`project-card${premium ? ' project-card--premium' : ''}${compact ? ' project-card--compact' : ''}`}
    >
      <div
        className="project-card__media"
        style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }}
      >
        <div className="project-card__media-actions">
          <button
            type="button"
            className={`project-card__fav${favorited ? ' is-active' : ''}`}
            aria-label={favorited ? t(locale, 'quitarFavorito') : t(locale, 'anadirFavorito')}
            aria-pressed={favorited}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFavorite(item.id)
            }}
          />
          {!compact ? (
            <Link
              className="project-card__view"
              to={projectTo}
              aria-label={t(locale, 'vistaRapida')}
            />
          ) : null}
        </div>
      </div>
      <div className="project-card__body">
        {badges.length ? (
          <div className="project-card__badges">
            {badges.map((b) => (
              <span key={b} className={`project-card__badge${badgeClass(b)}`}>
                {b}
              </span>
            ))}
          </div>
        ) : null}
        <h3 className="project-card__title">{item.title}</h3>
        <p className="project-card__meta">
          <span className="project-card__pin" aria-hidden />
          <span>{item.ciudad || 'Colombia'}</span>
        </p>
        <p className="project-card__price-row">
          <span className="project-card__price">{price}</span>
          {!compact ? (
            <Link className="project-card__finance" to={financeTo}>
              {t(locale, 'financiacion')}
            </Link>
          ) : null}
        </p>
        {!compact && amenityItems.length ? (
          <ul className="project-card__specs">
            {amenityItems.map((a) => (
              <li key={a}>
                <span className="project-card__spec-icon" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
        ) : null}
        {availabilityParts.length && !compact ? (
          <p className="project-card__availability">{availabilityParts.join(' · ')}</p>
        ) : null}
        <div className="project-card__actions">
          <Link className="home-btn project-card__cta-primary" to={projectTo}>
            {t(locale, 'verProyecto')}
          </Link>
          {!compact ? (
            <button
              type="button"
              className={`home-btn home-btn--outline project-card__cta-secondary${compared ? ' is-active' : ''}`}
              aria-pressed={compared}
              onClick={onCompare}
            >
              {t(locale, 'comparar')}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
