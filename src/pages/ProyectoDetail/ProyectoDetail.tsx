import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProyecto } from '../../utils/fetchProyecto'
import { formatHabRange, formatPriceFull } from '../../utils/formatProyecto'
import { proyectoGalleryImages, proyectoImageUrl } from '../../utils/proyectoImage'
import { postLead } from '../../utils/postLead'
import type { ProyectoDetail as ProyectoDetailType } from '../../types/proyecto'
import type { ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { useAlternateUrls } from '../../i18n/AlternateUrlsContext'
import { useCurrency } from '../../currency/CurrencyContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyecto-detail.scss'

type PlanosTab = 'planos' | 'ubicacion'

function isVisSegment(segmentos: string[] | undefined): boolean {
  return (segmentos ?? []).some((s) => /\bvis\b/i.test(s))
}

function ProjectCardLite({ item }: { item: ProyectoCard }) {
  const locale = useLocale()
  const { currency } = useCurrency()
  const slug = item.url.replace(/^\/proyectos\//, '').replace(/^\//, '')
  const to = pathFor('proyectos', locale, slug)
  const image = proyectoImageUrl(item.image_url)
  const vis = isVisSegment(item.segmentos)

  return (
    <article className={`project-card${item.variant === 'premium' ? ' project-card--premium' : ''}`}>
      <div
        className="project-card__media"
        style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }}
      >
        <div className="project-card__badges">
          {item.estado ? <span className="project-card__badge">{item.estado}</span> : null}
          <span className={`project-card__badge${vis ? '' : ' project-card__badge--outline'}`}>
            {t(locale, vis ? 'badgeVis' : 'badgeNoVis')}
          </span>
        </div>
      </div>
      <div className="project-card__body">
        <h3 className="project-card__title">{item.title}</h3>
        <p className="project-card__meta">{item.ciudad || 'Colombia'}</p>
        <p className="project-card__price">{formatPriceFull(item, currency)}</p>
        <ul className="project-card__specs">
          {(item.amenities ?? []).slice(0, 3).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
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

function LeadForm({ proyectoId }: { proyectoId: string }) {
  const locale = useLocale()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await postLead({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        origen: 'contacto',
        proyecto: proyectoId,
      })
      setStatus('ok')
      setNombre('')
      setEmail('')
      setTelefono('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return <p className="home-text proyecto-detail__lead-ok">{t(locale, 'leadOk')}</p>
  }

  return (
    <form className="proyecto-detail__lead-form" onSubmit={onSubmit}>
      <label>
        <span>{t(locale, 'leadNombre')}</span>
        <input
          required
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label>
        <span>{t(locale, 'leadEmail')}</span>
        <input
          required
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label>
        <span>{t(locale, 'leadTelefono')}</span>
        <input
          type="tel"
          name="telefono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          autoComplete="tel"
        />
      </label>
      {status === 'error' ? (
        <p className="proyecto-detail__lead-error">{t(locale, 'leadError')}</p>
      ) : null}
      <button type="submit" className="home-btn home-btn--dark" disabled={status === 'loading'}>
        {status === 'loading' ? t(locale, 'loading') : t(locale, 'leadEnviar')}
      </button>
    </form>
  )
}

export function ProyectoDetail() {
  const locale = useLocale()
  const { currency } = useCurrency()
  const { setUrls: setAlternateUrls } = useAlternateUrls()
  const { slug = '' } = useParams<{ slug: string }>()
  const [data, setData] = useState<ProyectoDetailType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [planosTab, setPlanosTab] = useState<PlanosTab>('planos')
  const [descOpen, setDescOpen] = useState(false)
  const contactBarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = contactBarRef.current
    if (!el) return

    const sync = () => {
      document.documentElement.style.setProperty(
        '--proyecto-contact-bar-height',
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      )
    }

    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--proyecto-contact-bar-height')
    }
  }, [data])

  useEffect(() => {
    let mounted = true
    setData(null)
    setError(null)
    setActiveImage(0)
    setDescOpen(false)
    setAlternateUrls(null)
    if (!slug) {
      setError(t(locale, 'proyectoError'))
      return
    }
    fetchProyecto(slug, locale)
      .then((payload) => {
        if (!mounted) return
        setData(payload)
        if (payload.urls) {
          setAlternateUrls(payload.urls)
        }
        if (!(payload.planos?.length) && payload.url_360) {
          setPlanosTab('ubicacion')
        }
      })
      .catch(() => {
        if (mounted) setError(t(locale, 'proyectoError'))
      })
    return () => {
      mounted = false
      setAlternateUrls(null)
    }
  }, [slug, locale, setAlternateUrls])

  const images = useMemo(
    () => (data ? proyectoGalleryImages(data) : []),
    [data],
  )
  const thumbs = images.slice(0, 3)
  const mainSrc = images[activeImage] ?? proyectoImageUrl(null)
  const desc = data?.descripcion?.trim() || ''
  const descLong = desc.length > 320
  const descShown = descOpen || !descLong ? desc : `${desc.slice(0, 320).trim()}…`

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

  const contactUrl = data.cta_asesor?.url || '/contacto'
  const whatsappUrl = data.whatsapp?.url || null
  const planos = data.planos ?? []
  const avances = data.avances_obra ?? []
  const amenities = data.amenities ?? []
  const highlights = data.highlights ?? []
  const showPlanosSection = planos.length > 0 || Boolean(data.url_360) || Boolean(data.como_llegar)
  const vis = isVisSegment(data.segmentos)
  const habLabel = formatHabRange(data.hab_min, data.hab_max)
  const baths =
    data.banos != null ? `${data.banos} Baños` : null
  const metaParts = [
    data.area_m2 != null
      ? t(locale, 'areaConstruida').replace('{n}', String(Math.round(data.area_m2)))
      : null,
    data.ciudad,
    habLabel,
    baths,
  ].filter(Boolean)

  return (
    <div className="proyecto-detail">
      <div className="proyecto-detail__pin">
        <div className="proyecto-detail__pin-inner home-container">
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
              <div className="proyecto-detail__title-row">
                <h1 className="proyecto-detail__title">{data.title}</h1>
                <span className="proyecto-detail__vis-pill">
                  {t(locale, vis ? 'badgeVis' : 'badgeNoVis')}
                </span>
              </div>
              <div className="proyecto-detail__meta-row">
                <p className="proyecto-detail__price">{formatPriceFull(data, currency)}</p>
                {metaParts.map((part) => (
                  <p key={String(part)} className="proyecto-detail__meta-item">
                    {part === data.ciudad ? (
                      <>
                        <span className="proyecto-detail__pin-icon" aria-hidden />
                        {part}
                      </>
                    ) : (
                      part
                    )}
                  </p>
                ))}
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
        </div>
      </div>

      <section className="proyecto-detail__gallery" aria-label={t(locale, 'galeria')}>
        <div className="home-container proyecto-detail__gallery-inner">
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
            {(thumbs.length ? thumbs : [mainSrc]).map((src, idx) => (
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
        </div>
      </section>

      <aside className="proyecto-detail__contact-bar" ref={contactBarRef}>
        <div className="home-container proyecto-detail__contact-bar-inner">
          <p>{t(locale, 'contactanosInfo')}</p>
          <div className="proyecto-detail__contact-actions">
            {contactUrl.startsWith('http') ? (
              <a className="home-btn proyecto-detail__cta-yellow" href={contactUrl} target="_blank" rel="noreferrer">
                {t(locale, 'quieroContacto')}
              </a>
            ) : (
              <Link className="home-btn proyecto-detail__cta-yellow" to={localizedPath(contactUrl, locale)}>
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

      <div className="proyecto-detail__body home-container">
        {desc ? (
          <section className="proyecto-detail__section">
            <h2 className="home-title">{t(locale, 'descripcionTitulo')}</h2>
            <p className="home-text">{descShown}</p>
            {descLong ? (
              <button
                type="button"
                className="proyecto-detail__text-toggle"
                onClick={() => setDescOpen((v) => !v)}
              >
                {t(locale, descOpen ? 'leerMenos' : 'leerMas')}
              </button>
            ) : null}
            {highlights.length ? (
              <div className="proyecto-detail__why">
                <h3 className="proyecto-detail__why-title">{t(locale, 'porQueElegir')}</h3>
                <ul className="proyecto-detail__why-list">
                  {highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {amenities.length ? (
          <section className="proyecto-detail__section">
            <h2 className="home-title">{t(locale, 'zonasComunes')}</h2>
            <ul className="proyecto-detail__zonas">
              {amenities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {showPlanosSection ? (
          <section className="proyecto-detail__section">
            <h2 className="home-title">{t(locale, 'planosUbicacion')}</h2>
            <div className="proyecto-detail__tabs" role="tablist">
              {(
                [
                  ['planos', 'tabPlanos'],
                  ['ubicacion', 'tabUbicacion'],
                ] as const
              ).map(([key, labelKey]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={planosTab === key}
                  className={`home-btn home-btn--outline${planosTab === key ? ' is-selected' : ''}`}
                  onClick={() => setPlanosTab(key)}
                >
                  {t(locale, labelKey)}
                </button>
              ))}
            </div>
            <div className="proyecto-detail__tab-panel" role="tabpanel">
              {planosTab === 'planos' ? (
                planos.length ? (
                  <div className="proyecto-detail__planos-grid">
                    {planos.map((p) => (
                      <figure key={`${p.title}-${p.image_url}`}>
                        <img src={p.image_url} alt={p.title} />
                        {p.title ? <figcaption>{p.title}</figcaption> : null}
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="home-text">{t(locale, 'tourPendiente')}</p>
                )
              ) : (
                <>
                  {data.como_llegar ? (
                    <p className="home-text">
                      <strong>{t(locale, 'comoLlegar')}: </strong>
                      {data.como_llegar}
                    </p>
                  ) : null}
                  {data.url_360 ? (
                    <div className="proyecto-detail__tour">
                      <iframe
                        title={t(locale, 'tabTour')}
                        src={data.url_360}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        allowFullScreen
                      />
                      <a
                        className="home-btn home-btn--dark"
                        href={data.url_360}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t(locale, 'abrirTour')}
                      </a>
                    </div>
                  ) : (
                    <p className="home-text">{t(locale, 'tourPendiente')}</p>
                  )}
                </>
              )}
            </div>
          </section>
        ) : null}

        <section className="proyecto-detail__section">
          <h2 className="home-title">{t(locale, 'avancesObra')}</h2>
          {avances.length ? (
            <div className="proyecto-detail__avances-grid">
              {avances.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          ) : (
            <p className="home-text">{t(locale, 'sinAvances')}</p>
          )}
        </section>

        {data.banner?.image_url || data.banner?.url ? (
          <section className="proyecto-detail__banner">
            {data.banner.url ? (
              <a href={data.banner.url} target="_blank" rel="noreferrer">
                {data.banner.image_url ? (
                  <img src={data.banner.image_url} alt={data.banner.title || ''} />
                ) : (
                  <span className="home-btn">{data.banner.title || data.banner.url}</span>
                )}
              </a>
            ) : data.banner.image_url ? (
              <img src={data.banner.image_url} alt={data.banner.title || ''} />
            ) : null}
          </section>
        ) : null}

        <section className="proyecto-detail__section proyecto-detail__lead">
          <h2 className="home-title">{t(locale, 'teLlamamos')}</h2>
          <p className="home-text">{t(locale, 'teLlamamosText')}</p>
          <LeadForm proyectoId={data.uuid} />
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
