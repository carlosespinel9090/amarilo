import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProyectos, type ProyectosListResponse } from '../../utils/fetchProyectos'
import {
  buildProyectoQuery,
  parseProyectoFilters,
  type ProyectoListFilters,
} from '../../utils/proyectoFilters'
import { formatPriceFull } from '../../utils/formatProyecto'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import type { FilterOption, ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { useCurrency } from '../../currency/CurrencyContext'
import { localizedPath } from '../../i18n/config'
import { t } from '../../i18n/ui'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyectos-list.scss'

const PAGE_SIZE = 12

function ControlledSelect({
  label,
  name,
  options,
  value,
  emptyLabel,
  onChange,
  className,
}: {
  label: string
  name: string
  options: FilterOption[]
  value: string
  emptyLabel: string
  onChange: (name: string, value: string) => void
  className?: string
}) {
  return (
    <div className={className ?? 'proyectos-list__field'}>
      <label htmlFor={`pl-${name}`}>{label}</label>
      <select
        id={`pl-${name}`}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      >
        <option value="">{emptyLabel}</option>
        {options.map((opt) => (
          <option key={String(opt.id)} value={String(opt.id)}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function ResultCard({ item }: { item: ProyectoCard }) {
  const locale = useLocale()
  const { currency } = useCurrency()
  const premium = item.variant === 'premium'
  const image = proyectoImageUrl(item.image_url)
  const badges = [...(item.estado ? [item.estado] : []), ...item.segmentos].slice(0, 3)

  return (
    <article className={`project-card${premium ? ' project-card--premium' : ''}`}>
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
        <button type="button" className="project-card__fav" aria-label="Favorito" tabIndex={-1} />
      </div>
      <div className="project-card__body">
        <h3 className="project-card__title">{item.title}</h3>
        <p className="project-card__meta">{item.ciudad || 'Colombia'}</p>
        <p className="project-card__price">{formatPriceFull(item, currency)}</p>
        <ul className="project-card__specs">
          {item.amenities.slice(0, 3).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="project-card__actions">
          <Link
            className={`home-btn${premium ? '' : ' home-btn--dark'}`}
            to={localizedPath(item.url || '/', locale)}
          >
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

export function ProyectosList() {
  const locale = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()

  const filtersFromUrl = useMemo(
    () => parseProyectoFilters(searchParams),
    [searchParams],
  )

  // Filters in URL (no page); page only local for "cargar más".
  const urlFilters = useMemo(() => {
    const { page: _p, ...rest } = filtersFromUrl
    return rest
  }, [filtersFromUrl])

  const filtersKey = useMemo(() => JSON.stringify(urlFilters), [urlFilters])
  const lastFiltersKey = useRef(filtersKey)

  const [draft, setDraft] = useState<ProyectoListFilters>(urlFilters)
  const [data, setData] = useState<ProyectosListResponse | null>(null)
  const [items, setItems] = useState<ProyectoCard[]>([])
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setDraft(urlFilters)
  }, [urlFilters])

  useEffect(() => {
    const filtersChanged = lastFiltersKey.current !== filtersKey
    if (filtersChanged) {
      lastFiltersKey.current = filtersKey
      if (page !== 1) {
        setPage(1)
        return
      }
    }

    let mounted = true
    const append = page > 1 && !filtersChanged
    if (append) setLoadingMore(true)
    else {
      setLoading(true)
      setError(null)
    }

    const listFilters: ProyectoListFilters = {
      ...urlFilters,
      limit: String(PAGE_SIZE),
    }
    if (page > 1) {
      listFilters.page = String(page)
    }

    fetchProyectos(listFilters, locale)
      .then((payload) => {
        if (!mounted) return
        setData(payload)
        setItems((prev) => (append ? [...prev, ...payload.items] : payload.items))
      })
      .catch(() => {
        if (!mounted) return
        if (!append) {
          setError(t(locale, 'proyectosError'))
          setItems([])
          setData(null)
        }
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
        setLoadingMore(false)
      })

    return () => {
      mounted = false
    }
  }, [filtersKey, page, locale, urlFilters])

  const applyToUrl = (next: ProyectoListFilters) => {
    const cleaned = { ...next }
    delete cleaned.page
    delete cleaned.limit
    const qs = buildProyectoQuery(cleaned)
    const params = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs)
    setSearchParams(params)
  }

  const onBarChange = (name: string, value: string) => {
    setDraft((prev) => {
      const next: ProyectoListFilters = { ...prev }
      if (!value) {
        delete next[name as keyof ProyectoListFilters]
      } else {
        next[name as keyof ProyectoListFilters] = value
      }
      return next
    })
  }

  const submitBar = (e: FormEvent) => {
    e.preventDefault()
    applyToUrl(draft)
  }

  const applySidebar = (e: FormEvent) => {
    e.preventDefault()
    applyToUrl(draft)
  }

  const clearFilters = () => {
    setDraft({})
    setSearchParams({})
  }

  const filterOpts = data?.filters ?? {
    ciudades: [],
    tipos: [],
    etapas: [],
    presupuestos: [],
  }

  const total = data?.pager.total ?? 0
  const pages = data?.pager.pages ?? 0
  const canLoadMore = page < pages

  return (
    <div className="proyectos-list">
      <section className="proyectos-list__hero">
        <div className="proyectos-list__hero-bg" aria-hidden />
        <div className="home-container proyectos-list__hero-inner">
          <h1 className="proyectos-list__hero-title">{t(locale, 'exploraOferta')}</h1>
          <form className="home-search proyectos-list__bar" onSubmit={submitBar}>
            <ControlledSelect
              className="home-search__field"
              label={t(locale, 'filtroCiudad')}
              name="ciudad"
              options={filterOpts.ciudades}
              value={draft.ciudad ?? ''}
              emptyLabel={t(locale, 'todasCiudades')}
              onChange={onBarChange}
            />
            <ControlledSelect
              className="home-search__field"
              label={t(locale, 'filtroTipo')}
              name="tipo"
              options={filterOpts.tipos}
              value={draft.tipo ?? ''}
              emptyLabel={t(locale, 'todosTipos')}
              onChange={onBarChange}
            />
            <ControlledSelect
              className="home-search__field"
              label={t(locale, 'filtroPresupuesto')}
              name="presupuesto"
              options={filterOpts.presupuestos}
              value={draft.presupuesto ?? ''}
              emptyLabel={t(locale, 'todosPresupuestos')}
              onChange={onBarChange}
            />
            <ControlledSelect
              className="home-search__field"
              label={t(locale, 'filtroEtapa')}
              name="etapa"
              options={filterOpts.etapas}
              value={draft.etapa ?? ''}
              emptyLabel={t(locale, 'todasEtapas')}
              onChange={onBarChange}
            />
            <ControlledSelect
              className="home-search__field"
              label={t(locale, 'filtroHab')}
              name="hab"
              options={[
                { id: '1', name: '1' },
                { id: '2', name: '2' },
                { id: '3', name: '3' },
                { id: '4', name: '4' },
                { id: '5', name: '5' },
              ]}
              value={draft.hab ?? ''}
              emptyLabel={t(locale, 'todasHab')}
              onChange={onBarChange}
            />
            <button type="submit" className="home-search__submit" aria-label={t(locale, 'buscar')} />
          </form>
        </div>
      </section>

      <div className="home-container proyectos-list__body">
        <aside className="proyectos-list__sidebar">
          <h2 className="proyectos-list__sidebar-title">
            <span className="home-badge__dot" />
            {t(locale, 'filtros')}
          </h2>
          <form onSubmit={applySidebar} className="proyectos-list__sidebar-form">
            <ControlledSelect
              label={t(locale, 'filtroCiudad')}
              name="ciudad"
              options={filterOpts.ciudades}
              value={draft.ciudad ?? ''}
              emptyLabel={t(locale, 'todasCiudades')}
              onChange={onBarChange}
            />
            <ControlledSelect
              label={t(locale, 'filtroPresupuesto')}
              name="presupuesto"
              options={filterOpts.presupuestos}
              value={draft.presupuesto ?? ''}
              emptyLabel={t(locale, 'todosPresupuestos')}
              onChange={onBarChange}
            />
            <ControlledSelect
              label={t(locale, 'filtroTipo')}
              name="tipo"
              options={filterOpts.tipos}
              value={draft.tipo ?? ''}
              emptyLabel={t(locale, 'todosTipos')}
              onChange={onBarChange}
            />
            <ControlledSelect
              label={t(locale, 'filtroEtapa')}
              name="etapa"
              options={filterOpts.etapas}
              value={draft.etapa ?? ''}
              emptyLabel={t(locale, 'todasEtapas')}
              onChange={onBarChange}
            />
            <ControlledSelect
              label={t(locale, 'filtroHab')}
              name="hab"
              options={[
                { id: '1', name: '1' },
                { id: '2', name: '2' },
                { id: '3', name: '3' },
                { id: '4', name: '4' },
                { id: '5', name: '5' },
              ]}
              value={draft.hab ?? ''}
              emptyLabel={t(locale, 'todasHab')}
              onChange={onBarChange}
            />

            <p className="proyectos-list__sidebar-note">{t(locale, 'filtrosAvanzadosNota')}</p>

            <button type="submit" className="home-btn proyectos-list__apply">
              {t(locale, 'aplicarFiltros')}
            </button>
            <button type="button" className="proyectos-list__clear" onClick={clearFilters}>
              {t(locale, 'limpiarFiltros')}
            </button>
          </form>

          <aside className="proyectos-list__tip">
            <p>{t(locale, 'tipFinanciacion')}</p>
            <Link to={localizedPath('/financiacion', locale)} className="proyectos-list__tip-link">
              {t(locale, 'tipFinanciacionCta')}
            </Link>
          </aside>
        </aside>

        <div className="proyectos-list__results">
          <div className="proyectos-list__results-head">
            <span className="home-badge home-badge--solid-yellow">
              {loading && page === 1
                ? t(locale, 'loading')
                : t(locale, 'proyectosEncontrados').replace('{n}', String(total))}
            </span>
          </div>

          {error ? <p className="proyectos-list__error">{error}</p> : null}

          {!loading && !error && items.length === 0 ? (
            <p className="proyectos-list__empty">{t(locale, 'sinProyectos')}</p>
          ) : null}

          <div className="proyectos-list__grid">
            {items.map((item) => (
              <ResultCard key={item.uuid} item={item} />
            ))}
          </div>

          {canLoadMore ? (
            <div className="proyectos-list__more">
              <button
                type="button"
                className="home-btn home-btn--outline"
                disabled={loadingMore}
                onClick={() => setPage((p) => p + 1)}
              >
                {loadingMore ? t(locale, 'loading') : t(locale, 'cargarMas')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
