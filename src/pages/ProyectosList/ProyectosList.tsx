import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProyectos, type ProyectosListResponse } from '../../utils/fetchProyectos'
import {
  buildProyectoQuery,
  parseProyectoFilters,
  type ProyectoListFilters,
} from '../../utils/proyectoFilters'
import type { FilterOption, ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { t } from '../../i18n/ui'
import { ProjectCardView } from '../../components/home/ProjectCard'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyectos-list.scss'

/** Common segmento labels used by Explora / tabs (API accepts name or tid). */
const SEGMENTO_OPTIONS: FilterOption[] = [
  { id: 'VIS', name: 'VIS' },
  { id: 'Inversión', name: 'Inversión' },
]

const HAB_OPTIONS = [
  { id: '1', name: '1' },
  { id: '2', name: '2' },
  { id: '3', name: '3' },
  { id: '4', name: '4+' },
] as const

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

function presupuestoLabel(
  options: FilterOption[],
  value: string,
  emptyLabel: string,
): string {
  if (!value) {
    if (options.length === 0) return emptyLabel
    if (options.length === 1) return options[0].name
    return `${options[0].name} – ${options[options.length - 1].name}`
  }
  return options.find((o) => String(o.id) === value)?.name ?? emptyLabel
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

  const segmentoOptions = useMemo(() => {
    const current = (draft.segmento ?? urlFilters.segmento ?? '').trim()
    if (!current) return SEGMENTO_OPTIONS
    if (SEGMENTO_OPTIONS.some((o) => String(o.id) === current || o.name === current)) {
      return SEGMENTO_OPTIONS
    }
    return [{ id: current, name: current }, ...SEGMENTO_OPTIONS]
  }, [draft.segmento, urlFilters.segmento])

  const total = data?.pager.total ?? 0
  const pages = data?.pager.pages ?? 0
  const canLoadMore = page < pages

  return (
    <div className="proyectos-list">
      <section className="proyectos-list__hero">
        <div className="proyectos-list__hero-bg" aria-hidden />
        <div className="proyectos-list__hero-blob proyectos-list__hero-blob--left" aria-hidden />
        <div className="proyectos-list__hero-blob proyectos-list__hero-blob--right" aria-hidden />
        <div className="home-container proyectos-list__hero-inner">
          <h1 className="proyectos-list__hero-title">{t(locale, 'exploraOferta')}</h1>
          <p className="proyectos-list__hero-sub">{t(locale, 'exploraOfertaSub')}</p>
        </div>
      </section>

      <div className="home-container proyectos-list__search-wrap">
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
          <button type="submit" className="home-search__submit" aria-label={t(locale, 'buscar')} />
        </form>
      </div>

      <div className="home-container proyectos-list__body">
        <aside className="proyectos-list__sidebar">
          <h2 className="proyectos-list__sidebar-title">
            <span className="proyectos-list__sidebar-dot" aria-hidden />
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

            <div className="proyectos-list__field">
              <label htmlFor="pl-presupuesto-range">{t(locale, 'filtroRangoPrecio')}</label>
              <input
                id="pl-presupuesto-range"
                className="proyectos-list__price-slider"
                type="range"
                min={-1}
                max={Math.max(filterOpts.presupuestos.length - 1, -1)}
                step={1}
                disabled={filterOpts.presupuestos.length === 0}
                value={(() => {
                  const idx = filterOpts.presupuestos.findIndex(
                    (o) => String(o.id) === (draft.presupuesto ?? ''),
                  )
                  return idx >= 0 ? idx : -1
                })()}
                aria-valuetext={presupuestoLabel(
                  filterOpts.presupuestos,
                  draft.presupuesto ?? '',
                  t(locale, 'todosPresupuestos'),
                )}
                onChange={(e) => {
                  const idx = Number(e.target.value)
                  if (idx < 0) {
                    onBarChange('presupuesto', '')
                    return
                  }
                  const opt = filterOpts.presupuestos[idx]
                  onBarChange('presupuesto', opt ? String(opt.id) : '')
                }}
              />
              <p className="proyectos-list__price-value" id="pl-presupuesto-label">
                {presupuestoLabel(
                  filterOpts.presupuestos,
                  draft.presupuesto ?? '',
                  t(locale, 'todosPresupuestos'),
                )}
              </p>
            </div>

            <div className="proyectos-list__field">
              <span className="proyectos-list__field-label" id="pl-tipo-label">
                {t(locale, 'filtroTipoInmueble')}
              </span>
              <div className="proyectos-list__chips" role="group" aria-labelledby="pl-tipo-label">
                {filterOpts.tipos.map((opt) => {
                  const id = String(opt.id)
                  const selected = (draft.tipo ?? '') === id
                  return (
                    <button
                      key={id}
                      type="button"
                      className={
                        selected
                          ? 'proyectos-list__chip proyectos-list__chip--active'
                          : 'proyectos-list__chip'
                      }
                      aria-pressed={selected}
                      onClick={() => onBarChange('tipo', selected ? '' : id)}
                    >
                      {opt.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="proyectos-list__field">
              <span className="proyectos-list__field-label" id="pl-hab-label">
                {t(locale, 'filtroHab')}
              </span>
              <div className="proyectos-list__hab" role="group" aria-labelledby="pl-hab-label">
                {HAB_OPTIONS.map((opt) => {
                  const selected = (draft.hab ?? '') === opt.id
                  const label = opt.id === '4' ? t(locale, 'hab4Plus') : opt.name
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={
                        selected
                          ? 'proyectos-list__hab-btn proyectos-list__hab-btn--active'
                          : 'proyectos-list__hab-btn'
                      }
                      aria-pressed={selected}
                      onClick={() => onBarChange('hab', selected ? '' : opt.id)}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="proyectos-list__field">
              <span className="proyectos-list__field-label" id="pl-etapa-label">
                {t(locale, 'filtroEtapaProyecto')}
              </span>
              <div className="proyectos-list__checks" role="group" aria-labelledby="pl-etapa-label">
                {filterOpts.etapas.map((opt) => {
                  const id = String(opt.id)
                  const checked = (draft.etapa ?? '') === id
                  return (
                    <label key={id} className="proyectos-list__check">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onBarChange('etapa', checked ? '' : id)}
                      />
                      <span>{opt.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <ControlledSelect
              label={t(locale, 'filtroSegmento')}
              name="segmento"
              options={segmentoOptions}
              value={draft.segmento ?? ''}
              emptyLabel={t(locale, 'todosSegmentos')}
              onChange={onBarChange}
            />

            <button type="submit" className="home-btn proyectos-list__apply">
              {t(locale, 'aplicarFiltros')}
            </button>
            <button type="button" className="proyectos-list__clear" onClick={clearFilters}>
              {t(locale, 'limpiarFiltros')}
            </button>

            <div className="proyectos-list__tip">
              <span className="proyectos-list__tip-icon" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5V15h8v-1.5A6 6 0 0 0 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p>{t(locale, 'tipFinanciacion')}</p>
            </div>
          </form>
        </aside>

        <div className="proyectos-list__results">
          <div className="proyectos-list__results-head">
            <p className="proyectos-list__count">
              <span className="proyectos-list__count-dot" aria-hidden />
              {loading && page === 1
                ? t(locale, 'loading')
                : t(locale, 'proyectosEncontrados').replace('{n}', String(total))}
            </p>
            <label className="proyectos-list__sort">
              <span>{t(locale, 'ordenarPor')}</span>
              <select defaultValue="relevancia" aria-label={t(locale, 'ordenarPor')}>
                <option value="relevancia">{t(locale, 'relevancia')}</option>
              </select>
            </label>
          </div>

          {error ? <p className="proyectos-list__error">{error}</p> : null}

          {!loading && !error && items.length === 0 ? (
            <p className="proyectos-list__empty">{t(locale, 'sinProyectos')}</p>
          ) : null}

          <div className="proyectos-list__grid">
            {items.map((item) => (
              <ProjectCardView key={item.uuid} item={item} priceMode="full" />
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

      <section className="proyectos-list__cta">
        <div className="home-container">
          <div className="proyectos-list__cta-box">
            <div className="proyectos-list__cta-blob" aria-hidden />
            <div className="proyectos-list__cta-copy">
              <h2>{t(locale, 'listoHogar')}</h2>
              <p>{t(locale, 'listoHogarSub')}</p>
            </div>
            <div className="proyectos-list__cta-actions">
              <Link className="home-btn home-btn--white" to={localizedPath('/contacto', locale)}>
                {t(locale, 'quieroContactoCta')}
              </Link>
              <a
                className="home-btn home-btn--outline proyectos-list__cta-wa"
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
              >
                {t(locale, 'whatsappCta')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
