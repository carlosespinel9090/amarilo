import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import type {
  FilterOption,
  HomeLink,
  HomePayload,
  HomeSection,
  ProyectoCard,
  SectionBackground,
} from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import { buildProyectoQuery, parseProyectoFilters } from '../../utils/proyectoFilters'
import {
  SectionBackgroundMedia,
  sectionBackgroundClassName,
  sectionBackgroundStyle,
  sectionHasBackground,
} from '../../utils/sectionBackground'
import { HeroMediaSlider } from './HeroMediaSlider'
import { ProjectTabsSection } from './ProjectTabsSection'
import novedadesBlobImg from '../../assets/images/icon-bg.png'
import finalCtaBgImg from '../../assets/images/final-cta-bg.jpg'
import whatsappIconImg from '../../assets/images/icon-whatsapp.png'
import asistenteDecorImg from '../../assets/images/asistente-decor.png'
import '../../styles/layout/home.scss'

function sectionClassName(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

function SectionShell({
  className,
  background,
  children,
  ...rest
}: {
  className: string
  background?: SectionBackground | null
  children: ReactNode
} & HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={sectionClassName('home-section', className, sectionBackgroundClassName(background))}
      style={sectionBackgroundStyle(background)}
      {...rest}
    >
      <SectionBackgroundMedia bg={background} />
      {children}
    </section>
  )
}

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

/** Custom icons for the "beneficios" cards, in card order (1 -> 2 -> 3). */
const HOME_WHY_ICONS: ReactNode[] = [
  <svg key="1" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M20.5833 5.41663H5.41667C4.22005 5.41663 3.25 6.38668 3.25 7.58329V18.4166C3.25 19.6132 4.22005 20.5833 5.41667 20.5833H20.5833C21.78 20.5833 22.75 19.6132 22.75 18.4166V7.58329C22.75 6.38668 21.78 5.41663 20.5833 5.41663Z"
      stroke="#161616"
      strokeWidth="1.95"
    />
    <path d="M3.25 10.8334H22.75M8.66667 16.25H13" stroke="#161616" strokeWidth="1.95" />
  </svg>,
  <svg key="2" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M13.0007 2.16663L21.6673 6.49996V13C21.6673 18.4166 17.8757 21.6666 13.0007 23.8333C8.12565 21.6666 4.33398 18.4166 4.33398 13V6.49996L13.0007 2.16663Z"
      stroke="#161616"
      strokeWidth="1.95"
    />
    <path d="M9.75 13L11.9167 15.1667L16.25 10.8334" stroke="#161616" strokeWidth="1.95" />
  </svg>,
  <svg key="3" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M4.33398 21.125C4.33398 20.4067 4.61933 19.7178 5.12724 19.2099C5.63515 18.702 6.32402 18.4166 7.04232 18.4166H21.6673"
      stroke="#161616"
      strokeWidth="1.95"
    />
    <path
      d="M7.04232 2.16663H21.6673V23.8333H7.04232C6.32402 23.8333 5.63515 23.548 5.12724 23.04C4.61933 22.5321 4.33398 21.8433 4.33398 21.125V4.87496C4.33398 4.15666 4.61933 3.46779 5.12724 2.95988C5.63515 2.45197 6.32402 2.16663 7.04232 2.16663Z"
      stroke="#161616"
      strokeWidth="1.95"
    />
  </svg>,
]

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
  background,
}: {
  data: Extract<HomeSection, { type: 'hero' }>['data']
  filters: HomePayload['filters']
  background?: SectionBackground | null
}) {
  const locale = useLocale()
  const navigate = useNavigate()
  const hasSlides = Boolean(data.slides?.length || data.image_url)
  const heroBg = !hasSlides && sectionHasBackground(background) ? background : null
  let slides = data.slides
  let imageUrl = data.image_url
  if (heroBg?.mode === 'video' && heroBg.video_url) {
    slides = [{ type: 'video', url: heroBg.video_url, poster_url: heroBg.poster_url }]
  } else if (heroBg?.mode === 'image' && heroBg.image_url) {
    imageUrl = heroBg.image_url
  }

  return (
    <section
      className={sectionClassName('home-section', 'home-hero', sectionBackgroundClassName(heroBg))}
      style={heroBg?.mode === 'color' ? sectionBackgroundStyle(heroBg) : undefined}
    >
      <div className="home-hero__media-shell">
        <div
          className="home-hero__bg"
          style={
            heroBg?.mode === 'color' && heroBg.color
              ? { background: heroBg.color }
              : undefined
          }
        >
          <HeroMediaSlider slides={slides} imageUrl={imageUrl} />
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
      <div
        className="home-container home-hero__search-wrap"
        data-aos="fade-up"
        data-aos-duration="1300"
      >
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
  background,
}: {
  data: Extract<HomeSection, { type: 'ref_proyectos_ciudad' }>['data']
  background?: SectionBackground | null
}) {
  const locale = useLocale()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const mediaSlides = useMemo(() => {
    const fromCms = (data.slides || []).filter((s) => s.url)
    if (fromCms.length) return fromCms
    return (data.items || [])
      .map((item) => {
        const url = proyectoImageUrl(item.image_url)
        return url ? ({ type: 'image' as const, url }) : null
      })
      .filter((s): s is { type: 'image'; url: string } => Boolean(s))
  }, [data.slides, data.items])

  const projectFallback = !data.slides?.length && data.items?.length

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [mediaSlides])

  useEffect(() => {
    setPlaying(false)
    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
    }
  }, [index])

  if (!mediaSlides.length && !projectFallback) return null

  const slides = mediaSlides
  const current = slides[Math.min(index, Math.max(slides.length - 1, 0))]
  const multi = slides.length > 1
  const project = projectFallback
    ? data.items[Math.min(index, data.items.length - 1)]
    : null

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + slides.length) % slides.length)
  }

  const togglePlay = () => {
    const el = videoRef.current
    if (!el || current?.type !== 'video') return
    if (el.paused) {
      el.play().catch(() => {})
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <SectionShell className="home-novedades" background={background}>
      <div className="home-novedades__blob" aria-hidden>
        <img src={novedadesBlobImg} alt="" />
      </div>
      <div className="home-container" data-aos="fade-up" data-aos-duration="1600">
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
          {projectFallback && project ? (
            <Link
              className="home-novedades__slide"
              to={localizedPath(project.url || '/', locale)}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(22,22,22,0.05) 40%, rgba(22,22,22,0.55) 100%), url(${proyectoImageUrl(project.image_url)})`,
              }}
            >
              <div className="home-novedades__caption">
                <h3>{project.title}</h3>
                {project.ciudad ? <p>{project.ciudad}</p> : null}
                <span className="home-novedades__cta">{t(locale, 'verProyecto')} →</span>
              </div>
            </Link>
          ) : (
            <div className="home-novedades__slide home-novedades__slide--media">
              {current?.type === 'video' ? (
                <>
                  <video
                    ref={videoRef}
                    className="home-novedades__media"
                    src={current.url}
                    poster={current.poster_url || undefined}
                    playsInline
                    preload="metadata"
                    onEnded={() => setPlaying(false)}
                  />
                  {!playing ? (
                    <button
                      type="button"
                      className="home-novedades__play"
                      aria-label={t(locale, 'verMas')}
                      onClick={togglePlay}
                    />
                  ) : null}
                </>
              ) : (
                <div
                  className="home-novedades__media"
                  style={{
                    backgroundImage: current?.url ? `url(${current.url})` : undefined,
                  }}
                />
              )}
            </div>
          )}
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
    </SectionShell>
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
      return (
        <SectionHero data={section.data} filters={filters} background={section.background} />
      )
    case 'kpi_strip':
      return (
        <SectionShell className="home-kpi" background={section.background}>
          <div className="home-container home-kpi__grid">
            {section.data.items.map((item) => (
              <div key={`${item.value}-${item.label}`} data-aos="fade-up" data-aos-duration="1600">
                <p className="home-kpi__value">
                  <KpiValue value={item.value} />
                </p>
                <p className="home-kpi__label">{item.label}</p>
              </div>
            ))}
          </div>
        </SectionShell>
      )
    case 'ref_proyectos':
      return (
        <ProjectTabsSection
          data={section.data}
          ciudades={filters.ciudades}
          etapas={filters.etapas}
          background={section.background}
        />
      )
    case 'beneficios':
      return (
        <SectionShell className="home-why" background={section.background}>
          <div className="home-why__blobs" aria-hidden />
          <div className="home-container" data-aos="zoom-in" data-aos-duration="1600">
            {section.data.badge ? (
              <span className="home-badge home-badge--solid-yellow home-badge-yellow">{section.data.badge}</span>
            ) : null}
            <h2 className="home-title home-title--light">{section.data.title}</h2>
            {section.data.text ? (
              <p className="home-text home-text--light">{section.data.text}</p>
            ) : null}
            <div className="home-why__grid">
              {section.data.cards.map((card, index) => (
                <article key={card.title} className="home-why__card">
                  <div className="home-why__icon">{HOME_WHY_ICONS[index % HOME_WHY_ICONS.length]}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <Cta link={card.link} className="home-why__link" />
                </article>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    case 'asistente_split':
      return (
        <SectionShell className="home-assistant" background={section.background}>
          <div
            className="home-assistant__decor home-assistant__decor--left"
            aria-hidden
            style={{
              WebkitMaskImage: `url(${asistenteDecorImg})`,
              maskImage: `url(${asistenteDecorImg})`,
            }}
          />
          <div
            className="home-assistant__decor home-assistant__decor--right"
            aria-hidden
            style={{
              WebkitMaskImage: `url(${asistenteDecorImg})`,
              maskImage: `url(${asistenteDecorImg})`,
            }}
          />
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
            <div className="home-assistant__panel" data-aos="zoom-in" data-aos-duration="1600">
              {section.data.badge ? (
                <span className="home-badge home-badge--on-yellow">{section.data.badge}</span>
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
                <Cta link={section.data.secondary} className="home-btn home-btn--white" />
                <Link className="home-btn home-btn--white" to={pathFor('perfilador', locale)}>
                  {t(locale, 'capacidadPago')}
                </Link>
              </div>
            </div>
          </div>
        </SectionShell>
      )
    case 'split_cards':
      return (
        <SectionShell className="home-split" background={section.background}>
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
        </SectionShell>
      )
    case 'explora_necesidad':
      return (
        <SectionShell
          className="home-explore"
          background={section.background}
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          <div className="home-container">
            {section.data.badge ? (
              <span className="home-badge home-badge--yellow home-badge--solid-yellow">{section.data.badge}</span>
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
        </SectionShell>
      )
    case 'ref_proyectos_ciudad':
      return <NovedadesCarousel data={section.data} background={section.background} />
    case 'financiacion_split':
      return null
    case 'ref_articulos':
      return (
        <SectionShell
          className="home-blog"
          background={section.background}
          data-aos="fade-up"
          data-aos-duration="1400"
        >
          <div className="home-container">
            <div className="home-blog__head">
              <div>
                {section.data.badge ? (
                  <span className="home-badge home-badge--yellow home-badge--solid-yellow">{section.data.badge}</span>
                ) : null}
                <h2 className="home-title">{section.data.title}</h2>
                {section.data.text ? <p className="home-text">{section.data.text}</p> : null}
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
                  >
                    {item.badge ? <span className="home-blog__tag">{item.badge}</span> : null}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="home-blog__cta">{t(locale, 'leerArticulo')} →</span>
                </a>
              ))}
            </div>
          </div>
        </SectionShell>
      )
    case 'texto_cta':
      return (
        <SectionShell className="home-final" background={section.background}>
          <div className="home-container" data-aos="zoom-in" data-aos-duration="1600">
            <div
              className="home-final__box"
              style={{ backgroundImage: `url(${finalCtaBgImg})` }}
            >
              <div className="home-final__content">
                {section.data.badge ? (
                  <span className="home-badge">{section.data.badge}</span>
                ) : null}
                <h2>{section.data.title}</h2>
                {section.data.text ? <p>{section.data.text}</p> : null}
                <div className="home-final__actions">
                  <Cta link={section.data.primary} className="home-btn home-btn--white" />
                  {section.data.secondary ? (
                    <a
                      className="home-btn home-btn--wa"
                      href={section.data.secondary.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        className="home-final__wa-icon"
                        src={whatsappIconImg}
                        alt=""
                        width={18}
                        height={18}
                      />
                      <span>{section.data.secondary.title}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </SectionShell>
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
