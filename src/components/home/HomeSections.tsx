import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { FilterOption, HomeLink, HomePayload, HomeSection, ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import { buildProyectoQuery, parseProyectoFilters } from '../../utils/proyectoFilters'
import { HeroMediaSlider } from './HeroMediaSlider'
import { ProjectTabsSection } from './ProjectTabsSection'
import '../../styles/layout/home.scss'

/** Rewrite legacy teaser targets to the Perfilador wizard. */
function resolveHomeCtaUrl(url: string): string {
  const path = url.split(/[?#]/)[0] || '/'
  if (
    path === '/asistente' ||
    path === '/assistant' ||
    path === '/perfil' ||
    path === '/perfilador' ||
    path === '/profiler' ||
    path === '/profileur'
  ) {
    return '/perfilador'
  }
  return url
}

function Cta({ link, className }: { link: HomeLink | null; className?: string }) {
  const locale = useLocale()
  if (!link) return null
  const external = link.url.startsWith('http')
  if (external) {
    return (
      <a className={className} href={link.url} target="_blank" rel="noreferrer">
        {link.title}
      </a>
    )
  }
  const resolved = resolveHomeCtaUrl(link.url || '/')
  return (
    <Link className={className} to={localizedPath(resolved, locale)}>
      {link.title}
    </Link>
  )
}

function SelectField({
  label,
  name,
  options,
  defaultLabel,
  value,
  withPin = false,
}: {
  label: string
  name: string
  options: FilterOption[]
  defaultLabel: string
  value?: string
  withPin?: boolean
}) {
  return (
    <div className={`home-search__field${withPin ? ' home-search__field--pin' : ''}`}>
      <label htmlFor={`filter-${name}`}>{label}</label>
      <div className="home-search__control">
        {withPin ? <span className="home-search__pin" aria-hidden /> : null}
        <select id={`filter-${name}`} name={name} defaultValue={value ?? ''}>
          <option value="">{defaultLabel}</option>
          {options.map((opt) => (
            <option key={String(opt.id)} value={String(opt.id)}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>
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

function SectionHero({
  data,
  filters,
}: {
  data: Extract<HomeSection, { type: 'hero' }>['data']
  filters: HomePayload['filters']
}) {
  const locale = useLocale()
  const navigate = useNavigate()
  return (
    <section className="home-section home-hero">
      <div className="home-hero__media-shell">
        <div className="home-hero__bg">
          <HeroMediaSlider slides={data.slides} imageUrl={data.image_url} />
        </div>
        <div className="home-container home-hero__content">
          {data.badge ? (
            <span className="home-badge home-badge--light">
              <span className="home-badge__dot" />
              {data.badge}
            </span>
          ) : null}
          <h1 className="home-hero__title">{data.title}</h1>
          <p className="home-hero__subtitle">{data.subtitle}</p>
        </div>
      </div>
      <div className="home-container home-hero__search-wrap">
        <form
          className="home-search"
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const parsed = parseProyectoFilters(new FormData(form))
            const base = data.search_cta?.url || '/proyectos'
            if (base.startsWith('http')) {
              const url = new URL(base)
              Object.entries(parsed).forEach(([k, v]) => {
                if (v) url.searchParams.set(k, v)
              })
              window.location.href = url.toString()
              return
            }
            navigate(`${pathFor('proyectos', locale)}${buildProyectoQuery(parsed)}`)
          }}
        >
          <SelectField
            label={t(locale, 'filtroCiudad')}
            name="ciudad"
            options={filters.ciudades}
            defaultLabel="Ciudad"
            withPin
          />
          <SelectField
            label={t(locale, 'filtroTipo')}
            name="tipo"
            options={filters.tipos}
            defaultLabel="Selecciona"
          />
          <SelectField
            label={t(locale, 'filtroPresupuesto')}
            name="presupuesto"
            options={filters.presupuestos}
            defaultLabel="Define rango"
          />
          <SelectField
            label={t(locale, 'filtroEtapa')}
            name="etapa"
            options={filters.etapas}
            defaultLabel="Selecciona"
          />
          <button
            type="submit"
            className="home-search__submit"
            aria-label={t(locale, 'buscar')}
          />
        </form>
      </div>
    </section>
  )
}

function NovedadesCarousel({
  data,
}: {
  data: Extract<HomeSection, { type: 'ref_proyectos_ciudad' }>['data']
}) {
  const locale = useLocale()
  const [index, setIndex] = useState(0)
  const items = data.items

  useEffect(() => {
    setIndex(0)
  }, [items])

  if (!items.length) return null

  const current = items[Math.min(index, items.length - 1)] as ProyectoCard
  const image = proyectoImageUrl(current.image_url)
  const multi = items.length > 1

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + items.length) % items.length)
  }

  return (
    <section className="home-section home-novedades">
      <div className="home-novedades__blob" aria-hidden />
      <div className="home-container">
        <div className="home-novedades__head">
          {data.badge ? (
            <span className="home-badge home-badge--solid-yellow">{data.badge}</span>
          ) : null}
          <h2 className="home-title home-title--light">{data.title}</h2>
          {data.text ? <p className="home-text home-text--light">{data.text}</p> : null}
        </div>
        <div className="home-novedades__stage">
          {multi ? (
            <button
              type="button"
              className="home-novedades__nav home-novedades__nav--prev"
              aria-label={t(locale, 'anterior')}
              onClick={() => go(-1)}
            />
          ) : null}
          <Link
            className="home-novedades__slide"
            to={localizedPath(current.url || '/', locale)}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(22,22,22,0.05) 40%, rgba(22,22,22,0.55) 100%), url(${image})`,
            }}
          >
            <div className="home-novedades__caption">
              <h3>{current.title}</h3>
              {current.ciudad ? <p>{current.ciudad}</p> : null}
              <span className="home-novedades__cta">{t(locale, 'verProyecto')} →</span>
            </div>
          </Link>
          {multi ? (
            <button
              type="button"
              className="home-novedades__nav home-novedades__nav--next"
              aria-label={t(locale, 'siguiente')}
              onClick={() => go(1)}
            />
          ) : null}
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
  const locale = useLocale()
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
        <ProjectTabsSection
          data={section.data}
          ciudades={filters.ciudades}
          etapas={filters.etapas}
        />
      )
    case 'beneficios':
      return (
        <section className="home-section home-why">
          <div className="home-why__blobs" aria-hidden />
          <div className="home-container">
            {section.data.badge ? (
              <span className="home-badge home-badge--solid-yellow home-badge-yellow">{section.data.badge}</span>
            ) : null}
            <h2 className="home-title home-title--light">{section.data.title}</h2>
            {section.data.text ? (
              <p className="home-text home-text--light">{section.data.text}</p>
            ) : null}
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
          <div className="home-assistant__blob home-assistant__blob--left" aria-hidden />
          <div className="home-assistant__blob home-assistant__blob--right" aria-hidden />
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
                <span className="home-badge home-badge--solid-yellow">{section.data.badge}</span>
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
                <Link className="home-btn home-btn--outline" to={pathFor('about', locale)}>
                  {t(locale, 'conoceBlog')}
                </Link>
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
              {section.data.routes.map((route) => {
                const to = localizedPath(route.link?.url || '/', locale)
                return (
                  <Link
                    key={route.title}
                    className="home-explore__card"
                    to={to}
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
                      {route.text ? <p>{route.text}</p> : null}
                      <span className="home-explore__cta">
                        {route.link?.title || t(locale, 'verMas')} →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )
    case 'ref_proyectos_ciudad':
      return <NovedadesCarousel data={section.data} />
    case 'financiacion_split':
      return null
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
              {section.data.items.slice(0, 3).map((item) => (
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
                  <span className="home-blog__cta">{t(locale, 'leerArticulo')} →</span>
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
