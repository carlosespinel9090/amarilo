import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProyecto } from '../../utils/fetchProyecto'
import { formatPriceFull, formatSpecs } from '../../utils/formatProyecto'
import { proyectoGalleryImages, proyectoImageUrl } from '../../utils/proyectoImage'
import type { ProyectoDetail } from '../../types/proyecto'
import type { ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyecto-detail.scss'

type TrustTab = 'avances' | 'testimonios' | 'tour'

function ProjectCardLite({ item }: { item: ProyectoCard }) {
  const locale = useLocale()
  const slug = item.url.replace(/^\/proyectos\//, '').replace(/^\//, '')
  const to = pathFor('proyectos', locale, slug)
  const badges = [...(item.estado ? [item.estado] : []), ...item.segmentos].slice(0, 2)
  const image = proyectoImageUrl(item.image_url)

  return (
    <article className={`project-card${item.variant === 'premium' ? ' project-card--premium' : ''}`}>
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
      </div>
      <div className="project-card__body">
        <h3 className="project-card__title">{item.title}</h3>
        <p className="project-card__meta">{item.ciudad || 'Colombia'}</p>
        <p className="project-card__price">{formatPriceFull(item.precio_desde)}</p>
        <ul className="project-card__specs">
          {item.amenities.slice(0, 3).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        {item.estado ? (
          <p className="proyecto-detail__card-status">{item.estado}</p>
        ) : null}
        <div className="project-card__actions">
          <Link className="home-btn home-btn--dark" to={to}>
            {t(locale, 'verProyecto')}
          </Link>
          <button type="button" className="home-btn home-btn--outline">
            {t(locale, 'comparar')}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProyectoDetail() {
  const locale = useLocale()
  const { slug = '' } = useParams<{ slug: string }>()
  const [data, setData] = useState<ProyectoDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [trustTab, setTrustTab] = useState<TrustTab>('avances')

  useEffect(() => {
    let mounted = true
    setData(null)
    setError(null)
    setActiveImage(0)
    if (!slug) {
      setError(t(locale, 'proyectoError'))
      return
    }
    fetchProyecto(slug, locale)
      .then((payload) => {
        if (mounted) setData(payload)
      })
      .catch(() => {
        if (mounted) setError(t(locale, 'proyectoError'))
      })
    return () => {
      mounted = false
    }
  }, [slug, locale])

  const images = useMemo(
    () => (data ? proyectoGalleryImages(data) : []),
    [data],
  )
  const mainSrc = images[activeImage] ?? proyectoImageUrl(null)

  if (error) {
    return (
      <div className="home-container proyecto-detail__state">
        <p>{error}</p>
        <Link to={localizedPath('/', locale)}>{t(locale, 'volverHome')}</Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="home-container proyecto-detail__state">
        <p>{t(locale, 'loading')}</p>
      </div>
    )
  }

  const specs = formatSpecs(data)
  const contactUrl = data.cta_asesor?.url || '/contacto'
  const whatsappUrl = data.whatsapp?.url || null

  const trustBody = (() => {
    if (trustTab === 'tour') {
      if (data.url_360) {
        return (
          <a className="home-btn home-btn--dark" href={data.url_360} target="_blank" rel="noreferrer">
            {t(locale, 'abrirTour')}
          </a>
        )
      }
      return <p className="home-text">{t(locale, 'tourPendiente')}</p>
    }
    if (trustTab === 'testimonios') {
      return <p className="home-text">{t(locale, 'testimoniosPendiente')}</p>
    }
    if (data.highlights?.length) {
      return (
        <ul className="proyecto-detail__highlights">
          {data.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )
    }
    return <p className="home-text">{data.descripcion || t(locale, 'sinAvances')}</p>
  })()

  return (
    <div className="proyecto-detail">
      <div className="home-container">
        <nav className="proyecto-detail__crumbs" aria-label="Breadcrumb">
          <Link to={localizedPath('/', locale)}>{t(locale, 'crumbHome')}</Link>
          <span aria-hidden>›</span>
          <Link to={pathFor('proyectos', locale)}>{t(locale, 'crumbProyectos')}</Link>
          <span aria-hidden>›</span>
          <span>{data.title}</span>
        </nav>

        <header className="proyecto-detail__hero">
          <div className="proyecto-detail__hero-main">
            {data.estado ? (
              <span className="home-badge home-badge--solid-yellow">{data.estado}</span>
            ) : null}
            <h1 className="proyecto-detail__title">{data.title}</h1>
            <div className="proyecto-detail__meta-row">
              <p className="proyecto-detail__price">{formatPriceFull(data.precio_desde)}</p>
              {data.ciudad ? (
                <p className="proyecto-detail__location">
                  <span className="proyecto-detail__pin" aria-hidden />
                  {data.ciudad}
                </p>
              ) : null}
              {specs ? <p className="proyecto-detail__specs">{specs}</p> : null}
            </div>
          </div>
          <div className="proyecto-detail__hero-actions">
            <Link className="home-btn home-btn--outline" to={pathFor('proyectos', locale)}>
              {t(locale, 'agendarVisita')}
            </Link>
            <Link className="home-btn home-btn--outline" to={localizedPath('/simulador', locale)}>
              {t(locale, 'simularCuota')}
            </Link>
          </div>
        </header>

        <section className="proyecto-detail__gallery" aria-label={t(locale, 'galeria')}>
          <div className="proyecto-detail__gallery-main">
            <img src={mainSrc} alt={data.title} />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="proyecto-detail__nav proyecto-detail__nav--prev"
                  aria-label={t(locale, 'anterior')}
                  onClick={() =>
                    setActiveImage((i) => (i - 1 + images.length) % images.length)
                  }
                />
                <button
                  type="button"
                  className="proyecto-detail__nav proyecto-detail__nav--next"
                  aria-label={t(locale, 'siguiente')}
                  onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                />
              </>
            ) : null}
          </div>
          <div className="proyecto-detail__thumbs">
            {images.slice(0, 3).map((src, idx) => (
              <button
                key={`${src}-${idx}`}
                type="button"
                className={`proyecto-detail__thumb${activeImage === idx ? ' is-active' : ''}`}
                onClick={() => setActiveImage(idx)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="proyecto-detail__contact-bar">
        <div className="home-container proyecto-detail__contact-bar-inner">
          <p>{t(locale, 'contactanosInfo')}</p>
          <div className="proyecto-detail__contact-actions">
            {contactUrl.startsWith('http') ? (
              <a className="home-btn" href={contactUrl} target="_blank" rel="noreferrer">
                {t(locale, 'quieroContacto')}
              </a>
            ) : (
              <Link className="home-btn" to={localizedPath(contactUrl, locale)}>
                {t(locale, 'quieroContacto')}
              </Link>
            )}
            {whatsappUrl ? (
              <a
                className="home-btn proyecto-detail__wa"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t(locale, 'escribirWhatsapp')}
              </a>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="home-container">
        <section className="proyecto-detail__trust">
          <h2 className="home-title">{t(locale, 'avancesConfianza')}</h2>
          <p className="home-text">{t(locale, 'avancesConfianzaText')}</p>
          <div className="proyecto-detail__tabs" role="tablist">
            {(
              [
                ['avances', 'tabAvances'],
                ['testimonios', 'tabTestimonios'],
                ['tour', 'tabTour'],
              ] as const
            ).map(([key, labelKey]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={trustTab === key}
                className={`home-btn home-btn--outline${trustTab === key ? ' is-selected' : ''}`}
                onClick={() => setTrustTab(key)}
              >
                {t(locale, labelKey)}
              </button>
            ))}
          </div>
          <div className="proyecto-detail__tab-panel" role="tabpanel">
            {trustBody}
          </div>
        </section>

        {data.relacionados?.length ? (
          <section className="proyecto-detail__related">
            <h2 className="home-title">{t(locale, 'proyectosSimilares')}</h2>
            <div className="proyecto-detail__related-grid">
              {data.relacionados.slice(0, 3).map((item) => (
                <ProjectCardLite key={item.uuid} item={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
