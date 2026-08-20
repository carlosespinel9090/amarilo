import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProjectCardView } from '../../components/home/ProjectCard'
import { AddProjectModal } from '../../components/comparador/AddProjectModal'
import { CompareLeadForm } from '../../components/comparador/CompareLeadForm'
import { CompareTable } from '../../components/comparador/CompareTable'
import {
  COMPARE_MAX,
  parseCompareIdsParam,
  useCompare,
} from '../../hooks/useCompare'
import { useLocale } from '../../i18n/LocaleContext'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'
import type { ProyectoCard } from '../../types/home'
import { fetchProyectos } from '../../utils/fetchProyectos'
import '../../styles/layout/home.scss'
import '../../styles/layout/comparador.scss'

export function Comparador() {
  const locale = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const { ids, ready, canAdd, setIds, add, remove } = useCompare()
  const hydratedFromUrl = useRef(false)

  const [allItems, setAllItems] = useState<ProyectoCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Hydrate compare list from ?ids= once localStorage is ready.
  useEffect(() => {
    if (!ready || hydratedFromUrl.current) return
    hydratedFromUrl.current = true
    const fromUrl = parseCompareIdsParam(searchParams.get('ids'))
    if (fromUrl.length) {
      setIds(fromUrl)
    }
  }, [ready, searchParams, setIds])

  // Keep URL in sync with current compare ids.
  useEffect(() => {
    if (!ready || !hydratedFromUrl.current) return
    const next = ids.join(',')
    const current = searchParams.get('ids') ?? ''
    if (next === current) return
    if (next) {
      setSearchParams({ ids: next }, { replace: true })
    } else if (current) {
      setSearchParams({}, { replace: true })
    }
  }, [ids, ready, searchParams, setSearchParams])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchProyectos({ limit: '50' }, locale)
      .then((res) => {
        if (!cancelled) setAllItems(res.items)
      })
      .catch(() => {
        if (!cancelled) {
          setAllItems([])
          setError(t(locale, 'proyectosError'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [locale])

  const compared = useMemo(() => {
    const byId = new Map(allItems.map((p) => [p.id, p]))
    return ids.map((id) => byId.get(id) ?? null).filter((p): p is ProyectoCard => p != null)
  }, [allItems, ids])

  const exploreItems = useMemo(() => {
    const exclude = new Set(ids)
    return allItems.filter((p) => !exclude.has(p.id)).slice(0, 3)
  }, [allItems, ids])

  const openAdd = () => {
    if (!canAdd) return
    setModalOpen(true)
  }

  const scrollToLead = () => {
    document.getElementById('comparador-asesoria')?.scrollIntoView({ behavior: 'smooth' })
  }

  const count = compared.length

  return (
    <div className="comparador">
      <section className="comparador__hero">
        <div className="comparador__hero-bg" aria-hidden />
        <div className="home-container comparador__hero-inner">
          <h1 className="comparador__hero-title">{t(locale, 'compareHeroTitle')}</h1>
          <p className="comparador__hero-sub">{t(locale, 'compareHeroSub')}</p>
        </div>
      </section>

      <div className="home-container comparador__section">
        <div className="comparador__toolbar">
          <h2 className="comparador__toolbar-title">
            {t(locale, 'compareCounting').replace('{n}', String(count))}
          </h2>
          <div className="comparador__toolbar-actions">
            <button
              type="button"
              className="home-btn home-btn--outline"
              onClick={openAdd}
              disabled={!canAdd}
            >
              {t(locale, 'compareAddProject')}
            </button>
            <button type="button" className="home-btn home-btn--dark" onClick={scrollToLead}>
              {t(locale, 'compareNeedAdvice')}
            </button>
          </div>
        </div>

        {loading && !allItems.length ? (
          <p>{t(locale, 'loading')}</p>
        ) : error && !allItems.length ? (
          <p className="comparador__empty">{error}</p>
        ) : count === 0 ? (
          <div className="comparador__empty">
            <h2>{t(locale, 'compareEmptyTitle')}</h2>
            <p>{t(locale, 'compareEmptyText')}</p>
            <Link className="home-btn" to={pathFor('proyectos', locale)}>
              {t(locale, 'compareExploreCta')}
            </Link>
          </div>
        ) : (
          <CompareTable
            projects={compared}
            onRemove={remove}
            onAddSlot={openAdd}
            canAdd={canAdd}
          />
        )}

        <CompareLeadForm proyectoTitle={compared[0]?.title ?? null} />

        <section className="comparador__explore">
          <h2 className="comparador__explore-title">{t(locale, 'compareExploreTitle')}</h2>
          <div className="comparador__explore-grid">
            {exploreItems.map((item) => (
              <ProjectCardView key={item.uuid} item={item} priceMode="full" />
            ))}
          </div>
        </section>
      </div>

      <AddProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        excludeIds={ids}
        canAdd={canAdd}
        onAdd={(id) => {
          if (ids.length >= COMPARE_MAX) return
          add(id)
        }}
      />
    </div>
  )
}
