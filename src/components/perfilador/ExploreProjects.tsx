import { Link, useNavigate } from 'react-router-dom'
import type { ProyectoCard, ProyectoPrecio } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { useCurrency } from '../../currency/CurrencyContext'
import { FALLBACK_TRM, useTrm } from '../../hooks/useTrm'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { formatPriceCompact } from '../../utils/formatProyecto'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import { compareIdsQuery, useCompare } from '../../hooks/useCompare'

function stubPrecio(cop: number, trm: number = FALLBACK_TRM, trmDate: string | null = null): ProyectoPrecio {
  return {
    currency_default: 'COP',
    mode: 'trm',
    cop,
    usd: Math.round((cop / trm) * 100) / 100,
    trm,
    trm_date: trmDate,
  }
}

const STUB_BASE: Array<Omit<ProyectoCard, 'precio'> & { precio_desde: number }> = [
  {
    id: 9001,
    uuid: 'stub-torres-del-sol',
    title: 'Torres del Sol',
    url: '/proyectos',
    precio_desde: 410_000_000,
    ciudad: 'Bogotá, Zona Norte',
    estado: 'Entrega inmediata',
    segmentos: ['No VIS'],
    amenities: ['Piscina', 'Gym', 'Seguridad'],
    area_m2: 95,
    hab_min: 2,
    hab_max: 3,
    banos: 2,
    unidades: 12,
    image_url: null,
    variant: 'default',
  },
  {
    id: 9002,
    uuid: 'stub-reserva-verde',
    title: 'Reserva Verde',
    url: '/proyectos',
    precio_desde: 520_000_000,
    ciudad: 'Bogotá, Sabana',
    estado: 'Entrega en 4 meses',
    segmentos: ['Premium'],
    amenities: ['Piscina', 'Gym', 'BBQ'],
    area_m2: 110,
    hab_min: 3,
    hab_max: 3,
    banos: 2,
    unidades: 8,
    image_url: null,
    variant: 'default',
  },
  {
    id: 9003,
    uuid: 'stub-mirador-norte',
    title: 'Mirador Norte',
    url: '/proyectos',
    precio_desde: 350_000_000,
    ciudad: 'Bogotá, Zona Norte',
    estado: 'Sobre planos',
    segmentos: ['No VIS'],
    amenities: ['Coworking', 'Seguridad'],
    area_m2: 78,
    hab_min: 2,
    hab_max: 2,
    banos: 2,
    unidades: 20,
    image_url: null,
    variant: 'default',
  },
]

function buildStubProjects(trm: number, trmDate: string | null): ProyectoCard[] {
  return STUB_BASE.map((item) => ({
    ...item,
    precio: stubPrecio(item.precio_desde, trm, trmDate),
  }))
}

type ExploreProjectsProps = {
  title?: string
  items?: ProyectoCard[]
}

export function ExploreProjects({
  title = 'Explora más proyectos',
  items,
}: ExploreProjectsProps) {
  const locale = useLocale()
  const navigate = useNavigate()
  const { currency } = useCurrency()
  const { trm, fecha } = useTrm()
  const { add, isCompared } = useCompare()
  const resolvedItems = items ?? buildStubProjects(trm, fecha)

  return (
    <section className="perfilador-explore">
      <div className="home-container">
        <h2 className="perfilador-explore__title">{title}</h2>
        <div className="perfilador-explore__grid">
          {resolvedItems.map((item) => {
            const image = proyectoImageUrl(item.image_url)
            const badges = [...(item.estado ? [item.estado] : []), ...item.segmentos].slice(0, 3)
            const units =
              item.unidades != null
                ? `${item.unidades} uds. disponibles${item.estado ? ` · ${item.estado}` : ''}`
                : item.estado
            const compared = isCompared(item.id)
            const onCompare = () => {
              const next = add(item.id)
              const q = compareIdsQuery(next)
              navigate(`${pathFor('comparador', locale)}${q ? `?${q}` : ''}`)
            }
            return (
              <article key={item.uuid} className="project-card perfilador-explore__card">
                <div
                  className="project-card__media"
                  style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }}
                >
                  <div className="project-card__badges">
                    {badges.map((b) => (
                      <span key={b} className="project-card__badge">
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="perfilador-explore__media-actions">
                    <button type="button" className="project-card__fav" aria-label="Favorito" tabIndex={-1} />
                    <button type="button" className="perfilador-explore__eye" aria-label="Vista" tabIndex={-1}>
                      👁
                    </button>
                  </div>
                </div>
                <div className="project-card__body">
                  <h3 className="project-card__title">{item.title}</h3>
                  <p className="project-card__meta">
                    <span aria-hidden>📍</span> {item.ciudad || 'Colombia'}
                  </p>
                  <p className="project-card__price">{formatPriceCompact(item, currency)}</p>
                  <ul className="project-card__specs">
                    {item.amenities.slice(0, 3).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  {units ? <p className="perfilador-explore__units">{units}</p> : null}
                  <div className="project-card__actions perfilador-explore__actions">
                    <Link className="home-btn" to={localizedPath(item.url || '/', locale)}>
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
          })}
        </div>
      </div>
    </section>
  )
}
