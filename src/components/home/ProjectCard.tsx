import { Link } from 'react-router-dom'
import type { ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { useCurrency } from '../../currency/CurrencyContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { formatPriceCompact, formatPriceFull } from '../../utils/formatProyecto'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import { useFavorites } from '../../hooks/useFavorites'

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
  const { currency } = useCurrency()
  const { isFavorite, toggleFavorite } = useFavorites()
  const premium = item.variant === 'premium'
  const hab = formatHab(item.hab_min, item.hab_max)
  const premiumLabel = t(locale, 'badgePremium')
  const badges = [
    ...(item.estado ? [item.estado] : []),
    ...item.segmentos.filter((s) => !/premium/i.test(s)),
    ...(premium ? [premiumLabel] : []),
  ].slice(0, 3)
  const image = proyectoImageUrl(item.image_url)
  const favorited = isFavorite(item.id)
  const price =
    priceMode === 'full' ? formatPriceFull(item, currency) : formatPriceCompact(item, currency)
  const projectTo = localizedPath(item.url || '/', locale)
  const financeTo = pathFor('financiacion', locale)
  const compareTo = pathFor('comparador', locale)
  const availability =
    item.unidades != null
      ? t(locale, 'specsUnidades').replace('{n}', String(item.unidades))
      : null

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
              <span
                key={b}
                className={`project-card__badge${
                  /premium/i.test(b) ? ' project-card__badge--premium' : ''
                }`}
              >
                {b}
              </span>
            ))}
          </div>
        ) : null}
        <h3 className="project-card__title">{item.title}</h3>
        <p className="project-card__meta">
          <span className="project-card__pin" aria-hidden />
          {item.ciudad || 'Colombia'}
        </p>
        <p className="project-card__price-row">
          <span className="project-card__price">{price}</span>
          {!compact ? (
            <Link className="project-card__finance" to={financeTo}>
              {t(locale, 'financiacion')}
            </Link>
          ) : null}
        </p>
        {!compact ? (
          <ul className="project-card__specs">
            {item.amenities.slice(0, 4).map((a) => (
              <li key={a}>{a}</li>
            ))}
            {!item.amenities.length && hab ? <li>{hab}</li> : null}
            {!item.amenities.length && item.area_m2 != null ? (
              <li>{Math.round(item.area_m2)} m²</li>
            ) : null}
          </ul>
        ) : null}
        {availability && !compact ? (
          <p className="project-card__availability">{availability}</p>
        ) : null}
        <div className="project-card__actions">
          <Link className="home-btn" to={projectTo}>
            {t(locale, 'verProyecto')}
          </Link>
          {!compact ? (
            <Link className="home-btn home-btn--outline" to={compareTo}>
              {t(locale, 'comparar')}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
