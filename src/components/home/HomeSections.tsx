import { Link } from 'react-router-dom'
import type { FilterOption, HomeLink, HomePayload, HomeSection, ProyectoCard } from '../../types/home'
import '../../styles/layout/home.scss'

function formatPrice(value: string | number | null) {
  if (value === null || value === undefined || value === '') return 'Consultar'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return `Desde $${Math.round(n / 1_000_000)}M`
}

function formatHab(min: number | null, max: number | null) {
  if (min == null && max == null) return null
  if (min != null && max != null && min !== max) return `${min}-${max} hab`
  return `${min ?? max} hab`
}

function Cta({ link, className }: { link: HomeLink | null; className?: string }) {
  if (!link) return null
  const external = link.url.startsWith('http')
  if (external) {
    return (
      <a className={className} href={link.url} target="_blank" rel="noreferrer">
        {link.title}
      </a>
    )
  }
  return (
    <Link className={className} to={link.url || '/'}>
      {link.title}
    </Link>
  )
}

function SelectField({
  label,
  options,
  defaultLabel,
}: {
  label: string
  options: FilterOption[]
  defaultLabel: string
}) {
  return (
    <div className="home-search__field">
      <label>{label}</label>
      <select defaultValue="">
        <option value="">{defaultLabel}</option>
        {options.map((opt) => (
          <option key={String(opt.id)} value={String(opt.id)}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Highlight trailing K / leading + in KPI values (Figma trust strip). */
function KpiValue({ value }: { value: string }) {
  const match = value.match(/^(\+?)(.+?)(K)?$/i)
  if (!match) return <>{value}</>
  const [, plus, mid, k] = match
  return (
    <>
      {plus ? <span className="home-kpi__accent">{plus}</span> : null}
      {mid}
      {k ? <span className="home-kpi__accent">{k}</span> : null}
    </>
  )
}

function ProjectCardView({
  item,
  compact = false,
}: {
  item: ProyectoCard
  compact?: boolean
}) {
  const premium = item.variant === 'premium'
  const hab = formatHab(item.hab_min, item.hab_max)
  const badges = [...(item.estado ? [item.estado] : []), ...item.segmentos].slice(0, 3)

  return (
    <article
      className={`project-card${premium ? ' project-card--premium' : ''}${compact ? ' project-card--compact' : ''}`}
    >
      <div
        className="project-card__media"
        style={
          item.image_url
            ? { backgroundImage: `url(${item.image_url})`, backgroundSize: 'cover' }
            : undefined
        }
      >
        <div className="project-card__badges">
          {badges.map((b) => (
            <span key={b} className="project-card__badge">
              {b}
            </span>
          ))}
        </div>
        <button type="button" className="project-card__fav" aria-label="Favorito" tabIndex={-1} />
      </div>
      <div className="project-card__body">
        <h3 className="project-card__title">{item.title}</h3>
        <p className="project-card__meta">{item.ciudad || 'Colombia'}</p>
        <p className="project-card__price">{formatPrice(item.precio_desde)}</p>
        {!compact ? (
          <ul className="project-card__specs">
            {item.area_m2 != null ? <li>{Math.round(item.area_m2)} m²</li> : null}
            {hab ? <li>{hab}</li> : null}
            {item.banos != null ? <li>{item.banos} baños</li> : null}
            {item.amenities.slice(0, 3).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : null}
        <div className="project-card__actions">
          <a className={`home-btn${premium || compact ? '' : ' home-btn--dark'}`} href={item.url}>
            Ver proyecto
          </a>
          {!compact ? (
            <button type="button" className="home-btn home-btn--outline">
              Comparar
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function SectionHero({
  data,
  filters,
}: {
  data: Extract<HomeSection, { type: 'hero' }>['data']
  filters: HomePayload['filters']
}) {
  return (
    <section className="home-section home-hero">
      <div className="home-hero__bg">
        {data.image_url ? (
          <img className="home-hero__bg-img" src={data.image_url} alt="" />
        ) : null}
      </div>
      <div className="home-hero__blob home-hero__blob--left" aria-hidden />
      <div className="home-hero__blob home-hero__blob--right" aria-hidden />
      <div className="home-container home-hero__content">
        {data.badge ? (
          <span className="home-badge home-badge--light">
            <span className="home-badge__dot" />
            {data.badge}
          </span>
        ) : null}
        <h1 className="home-hero__title">{data.title}</h1>
        <p className="home-hero__subtitle">{data.subtitle}</p>
        <form
          className="home-search"
          onSubmit={(e) => {
            e.preventDefault()
            window.location.href = data.search_cta?.url || '/proyectos'
          }}
        >
          <SelectField label="Ciudad" options={filters.ciudades} defaultLabel="Bogotá" />
          <SelectField label="Tipo" options={filters.tipos} defaultLabel="Apartamento" />
          <SelectField
            label="Presupuesto"
            options={filters.presupuestos}
            defaultLabel="$250M - $450M"
          />
          <SelectField label="Etapa" options={filters.etapas} defaultLabel="Todas" />
          <button type="submit" className="home-search__submit" aria-label="Buscar" />
        </form>
      </div>
    </section>
  )
}

function CityCarousel({
  data,
}: {
  data: Extract<HomeSection, { type: 'ref_proyectos_ciudad' }>['data']
}) {
  return (
    <section className="home-section home-city">
      <div className="home-container">
        <div className="home-city__head">
          <div>
            {data.badge ? <span className="home-badge home-badge--yellow">{data.badge}</span> : null}
            <h2 className="home-title">{data.title}</h2>
            {data.text ? <p className="home-text">{data.text}</p> : null}
          </div>
        </div>
        <div className="home-city__track">
          {data.items.map((item) => (
            <div key={item.uuid} className="home-city__slide">
              <ProjectCardView item={item} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionRenderer({
  section,
  filters,
}: {
  section: HomeSection
  filters: HomePayload['filters']
}) {
  switch (section.type) {
    case 'hero':
      return <SectionHero data={section.data} filters={filters} />
    case 'kpi_strip':
      return (
        <section className="home-section home-kpi">
          <div className="home-container home-kpi__grid">
            {section.data.items.map((item) => (
              <div key={`${item.value}-${item.label}`}>
                <p className="home-kpi__value">
                  <KpiValue value={item.value} />
                </p>
                <p className="home-kpi__label">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      )
    case 'ref_proyectos':
      return (
        <section className="home-section home-projects">
          <div className="home-container">
            <div className="home-projects__head">
              <div>
                {section.data.badge ? (
                  <span className="home-badge home-badge--yellow">{section.data.badge}</span>
                ) : null}
                <h2 className="home-title">{section.data.title}</h2>
                {section.data.text ? <p className="home-text">{section.data.text}</p> : null}
              </div>
              <Cta link={section.data.link} className="home-btn home-btn--outline" />
            </div>
            <div className="home-projects__grid">
              {section.data.items.map((item) => (
                <ProjectCardView key={item.uuid} item={item} />
              ))}
            </div>
          </div>
        </section>
      )
    case 'beneficios':
      return (
        <section className="home-section home-why">
          <div className="home-why__blobs" aria-hidden />
          <div className="home-container">
            {section.data.badge ? (
              <span className="home-badge home-badge--solid-yellow">{section.data.badge}</span>
            ) : null}
            <h2 className="home-title home-title--light">{section.data.title}</h2>
            {section.data.text ? <p className="home-text home-text--light">{section.data.text}</p> : null}
            <div className="home-why__grid">
              {section.data.cards.map((card) => (
                <article key={card.title} className="home-why__card">
                  <div className="home-why__icon">
                    {card.icon_url ? <img src={card.icon_url} alt="" /> : null}
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <Cta link={card.link} className="home-why__link" />
                </article>
              ))}
            </div>
          </div>
        </section>
      )
    case 'asistente_split':
      return (
        <section className="home-section home-assistant">
          <div className="home-container home-assistant__grid">
            <div
              className="home-assistant__media"
              style={
                section.data.image_url
                  ? {
                      backgroundImage: `url(${section.data.image_url})`,
                      backgroundSize: 'cover',
                    }
                  : undefined
              }
            />
            <div className="home-assistant__panel">
              {section.data.badge ? (
                <span className="home-badge home-badge--yellow">{section.data.badge}</span>
              ) : null}
              <h2 className="home-title">{section.data.title}</h2>
              {section.data.text ? <p className="home-text">{section.data.text}</p> : null}
              <ul className="home-assistant__list">
                {section.data.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="home-assistant__actions">
                <Cta link={section.data.primary} className="home-btn home-btn--dark" />
                <Cta link={section.data.secondary} className="home-btn home-btn--outline" />
              </div>
            </div>
          </div>
        </section>
      )
    case 'split_cards':
      return (
        <section className="home-section home-split">
          <div className="home-container">
            {section.data.title ? <h2 className="home-title">{section.data.title}</h2> : null}
            <div className="home-split__grid">
              {section.data.cards.map((card) => (
                <div
                  key={card.title}
                  className={`home-split__card${card.variant === 'simulador' ? ' home-split__card--simulador' : ''}`}
                >
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </div>
                  <Cta
                    link={card.link}
                    className={`home-btn${card.variant === 'simulador' ? ' home-btn--dark' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'explora_necesidad':
      return (
        <section className="home-section home-explore">
          <div className="home-container">
            {section.data.badge ? (
              <span className="home-badge home-badge--yellow">{section.data.badge}</span>
            ) : null}
            <h2 className="home-title">{section.data.title}</h2>
            {section.data.text ? <p className="home-text">{section.data.text}</p> : null}
            <div className="home-explore__grid">
              {section.data.routes.map((route) => (
                <a
                  key={route.title}
                  className="home-explore__card"
                  href={route.link?.url || '#'}
                  style={
                    route.image_url
                      ? {
                          backgroundImage: `linear-gradient(180deg, rgba(22,22,22,0.05) 30%, rgba(22,22,22,0.78) 100%), url(${route.image_url})`,
                        }
                      : undefined
                  }
                >
                  <div className="home-explore__body">
                    <h3>{route.title}</h3>
                    <p>{route.text}</p>
                    <span className="home-explore__cta">{route.link?.title || 'Explorar'} →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )
    case 'ref_proyectos_ciudad':
      return <CityCarousel data={section.data} />
    case 'financiacion_split':
      return (
        <section className="home-section home-finance">
          <div
            className={`home-container home-finance__grid${section.data.reversed ? ' is-reversed' : ''}`}
          >
            <div className="home-finance__copy">
              {section.data.badge ? (
                <span className="home-badge home-badge--solid-yellow">{section.data.badge}</span>
              ) : null}
              <h2 className="home-title home-title--light">{section.data.title}</h2>
              {section.data.text ? (
                <p className="home-text home-text--light">{section.data.text}</p>
              ) : null}
              {section.data.bullets.length ? (
                <ul className="home-finance__list">
                  {section.data.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              <div className="home-finance__actions">
                <Cta link={section.data.link} className="home-btn" />
              </div>
            </div>
            <div
              className="home-finance__media"
              style={
                section.data.image_url
                  ? {
                      backgroundImage: `url(${section.data.image_url})`,
                      backgroundSize: 'cover',
                    }
                  : undefined
              }
            />
          </div>
        </section>
      )
    case 'ref_articulos':
      return (
        <section className="home-section home-blog">
          <div className="home-container">
            <div className="home-blog__head">
              <div>
                {section.data.badge ? (
                  <span className="home-badge home-badge--yellow">{section.data.badge}</span>
                ) : null}
                <h2 className="home-title">{section.data.title}</h2>
              </div>
              <Cta link={section.data.link} className="home-blog__more" />
            </div>
            <div className="home-blog__grid">
              {section.data.items.map((item) => (
                <a key={item.uuid} className="home-blog__card" href={item.url}>
                  <div
                    className="home-blog__media"
                    style={
                      item.image_url
                        ? {
                            backgroundImage: `url(${item.image_url})`,
                            backgroundSize: 'cover',
                          }
                        : undefined
                    }
                  />
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="home-blog__cta">Leer artículo →</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )
    case 'texto_cta':
      return (
        <section className="home-section home-final">
          <div className="home-container">
            <div className="home-final__box">
              <div className="home-final__blob home-final__blob--left" aria-hidden />
              <div className="home-final__blob home-final__blob--right" aria-hidden />
              {section.data.badge ? (
                <span className="home-badge">{section.data.badge}</span>
              ) : null}
              <h2>{section.data.title}</h2>
              {section.data.text ? <p>{section.data.text}</p> : null}
              <div className="home-final__actions">
                <Cta link={section.data.primary} className="home-btn home-btn--white" />
                <Cta link={section.data.secondary} className="home-btn home-btn--dark" />
              </div>
            </div>
          </div>
        </section>
      )
    default:
      return null
  }
}

export function HomeSections({
  sections,
  filters,
}: {
  sections: HomeSection[]
  filters: HomePayload['filters']
}) {
  return (
    <>
      {sections.map((section, index) => (
        <SectionRenderer
          key={`${section.type}-${index}`}
          section={section}
          filters={filters}
        />
      ))}
    </>
  )
}
