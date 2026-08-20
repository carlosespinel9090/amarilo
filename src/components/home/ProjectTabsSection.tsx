import { useEffect, useMemo, useState } from 'react'
import type { FilterOption, HomeSection, ProyectoCard } from '../../types/home'
import { useLocale } from '../../i18n/LocaleContext'
import { Link } from 'react-router-dom'
import { t } from '../../i18n/ui'
import { fetchProyectos } from '../../utils/fetchProyectos'
import {
  buildProyectoQuery,
  type ProyectoListFilters,
} from '../../utils/proyectoFilters'
import { useFavorites } from '../../hooks/useFavorites'
import { ProjectCardView } from './ProjectCard'
import { pathFor } from '../../i18n/paths'

export type ProjectTabId =
  | 'destacados'
  | 'entrega'
  | 'vis'
  | 'inversion'
  | 'favoritos'

const TABS: ProjectTabId[] = ['destacados', 'entrega', 'vis', 'inversion', 'favoritos']

function tabLabel(locale: ReturnType<typeof useLocale>, tab: ProjectTabId): string {
  switch (tab) {
    case 'destacados':
      return t(locale, 'tabDestacados')
    case 'entrega':
      return t(locale, 'tabEntrega')
    case 'vis':
      return t(locale, 'tabVis')
    case 'inversion':
      return t(locale, 'tabInversion')
    case 'favoritos':
      return t(locale, 'tabFavoritos')
  }
}

function findEtapaEntrega(etapas: FilterOption[]): string | null {
  const match = etapas.find((e) =>
    /entrega\s*inmediata/i.test(String(e.name)),
  )
  return match ? String(match.id) : null
}

function filtersForTab(
  tab: ProjectTabId,
  ciudad: string,
  etapas: FilterOption[],
): ProyectoListFilters {
  const base: ProyectoListFilters = { limit: '3' }
  if (ciudad) base.ciudad = ciudad

  switch (tab) {
    case 'destacados':
      base.destacado = '1'
      break
    case 'entrega': {
      const etapaId = findEtapaEntrega(etapas)
      if (etapaId) base.etapa = etapaId
      break
    }
    case 'vis':
      base.segmento = 'VIS'
      break
    case 'inversion':
      base.segmento = 'Inversión'
      break
    case 'favoritos':
      break
  }
  return base
}

function headCopy(
  tab: ProjectTabId,
  data: Extract<HomeSection, { type: 'ref_proyectos' }>['data'],
  locale: ReturnType<typeof useLocale>,
) {
  if (tab === 'destacados') {
    return {
      badge: data.badge,
      title: data.title,
      text: data.text,
    }
  }
  const titles: Record<Exclude<ProjectTabId, 'destacados'>, string> = {
    entrega: t(locale, 'titleEntrega'),
    vis: t(locale, 'titleVis'),
    inversion: t(locale, 'titleInversion'),
    favoritos: t(locale, 'titleFavoritos'),
  }
  return {
    badge: data.badge,
    title: titles[tab],
    text: data.text,
  }
}

export function ProjectTabsSection({
  data,
  ciudades,
  etapas,
}: {
  data: Extract<HomeSection, { type: 'ref_proyectos' }>['data']
  ciudades: FilterOption[]
  etapas: FilterOption[]
}) {
  const locale = useLocale()
  const { ids: favoriteIds, ready: favoritesReady } = useFavorites()
  const [tab, setTab] = useState<ProjectTabId>('destacados')
  const [ciudad, setCiudad] = useState('')
  const [items, setItems] = useState<ProyectoCard[]>(data.items.slice(0, 3))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const copy = useMemo(() => headCopy(tab, data, locale), [tab, data, locale])

  const verTodosHref = useMemo(() => {
    if (data.link?.url?.startsWith('http')) return data.link.url
    const filters = filtersForTab(tab, ciudad, etapas)
    delete filters.limit
    if (tab === 'favoritos') {
      return pathFor('proyectos', locale)
    }
    return `${pathFor('proyectos', locale)}${buildProyectoQuery(filters)}`
  }, [tab, ciudad, etapas, data.link, locale])

  useEffect(() => {
    let mounted = true

    if (tab === 'favoritos') {
      if (!favoritesReady) return
      if (favoriteIds.length === 0) {
        setItems([])
        setLoading(false)
        setError(false)
        return
      }

      setLoading(true)
      setError(false)
      const idSet = new Set(favoriteIds)
      fetchProyectos({ limit: '50', ...(ciudad ? { ciudad } : {}) }, locale)
        .then((payload) => {
          if (!mounted) return
          const matched = payload.items.filter((p) => idSet.has(p.id)).slice(0, 3)
          // Preserve favorite order
          const byId = new Map(matched.map((p) => [p.id, p]))
          const ordered = favoriteIds
            .map((id) => byId.get(id))
            .filter((p): p is ProyectoCard => Boolean(p))
            .slice(0, 3)
          setItems(ordered)
        })
        .catch(() => {
          if (!mounted) return
          setError(true)
          setItems([])
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })

      return () => {
        mounted = false
      }
    }

    setLoading(true)
    setError(false)
    const filters = filtersForTab(tab, ciudad, etapas)
    fetchProyectos(filters, locale)
      .then((payload) => {
        if (!mounted) return
        setItems(payload.items.slice(0, 3))
      })
      .catch(() => {
        if (!mounted) return
        // Fallback to CMS seed items for destacados only
        if (tab === 'destacados' && !ciudad) {
          setItems(data.items.slice(0, 3))
          setError(false)
        } else {
          setError(true)
          setItems([])
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [tab, ciudad, etapas, locale, favoriteIds, favoritesReady, data.items])

  return (
    <section className="home-section home-projects">
      <div className="home-container">
        <div
          className="home-projects__tabs"
          role="tablist"
          aria-label={t(locale, 'nuestrosProyectos')}
        >
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`home-projects__tab${tab === id ? ' is-active' : ''}${
                id === 'favoritos' ? ' home-projects__tab--fav' : ''
              }`}
              onClick={() => setTab(id)}
            >
              {tabLabel(locale, id)}
            </button>
          ))}
        </div>

        <div className="home-projects__head">
          <div className="home-projects__intro">
            {copy.badge ? (
              <span className="home-badge home-badge--solid-yellow">{copy.badge}</span>
            ) : null}
            <h2 className="home-title">{copy.title}</h2>
            {copy.text ? <p className="home-text">{copy.text}</p> : null}
          </div>
          {data.link ? (
            data.link.url.startsWith('http') ? (
              <a
                className="home-projects__all"
                href={verTodosHref}
                target="_blank"
                rel="noreferrer"
              >
                {data.link.title}
              </a>
            ) : (
              <Link className="home-projects__all" to={verTodosHref}>
                {data.link.title}
              </Link>
            )
          ) : null}
        </div>

        <div className="home-projects__chips" role="list">
          {ciudades.map((c) => {
            const value = String(c.id)
            return (
              <button
                key={value}
                type="button"
                className={`home-projects__chip${ciudad === value ? ' is-active' : ''}`}
                onClick={() => setCiudad((prev) => (prev === value ? '' : value))}
              >
                {c.name}
              </button>
            )
          })}
        </div>

        {loading ? (
          <p className="home-projects__status">{t(locale, 'loading')}</p>
        ) : null}
        {error ? (
          <p className="home-projects__status">{t(locale, 'proyectosError')}</p>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <p className="home-projects__status">
            {tab === 'favoritos'
              ? t(locale, 'sinFavoritos')
              : t(locale, 'sinProyectos')}
          </p>
        ) : null}

        <div className="home-projects__grid">
          {items.map((item) => (
            <ProjectCardView key={item.uuid} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
