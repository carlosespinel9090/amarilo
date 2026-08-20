import { useEffect, useMemo, useState } from 'react'
import { COMPARE_MAX } from '../../hooks/useCompare'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { fetchProyectos } from '../../utils/fetchProyectos'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import type { ProyectoCard } from '../../types/home'

type Props = {
  open: boolean
  onClose: () => void
  excludeIds: number[]
  onAdd: (id: number) => void
  canAdd: boolean
}

export function AddProjectModal({ open, onClose, excludeIds, onAdd, canAdd }: Props) {
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ProyectoCard[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    fetchProyectos({ limit: '50' }, locale)
      .then((res) => {
        if (!cancelled) setItems(res.items)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, locale])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((p) => !excludeIds.includes(p.id))
      .filter((p) => {
        if (!q) return true
        const hay = `${p.title} ${p.ciudad ?? ''} ${p.zona ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
      .slice(0, 20)
  }, [items, excludeIds, query])

  if (!open) return null

  return (
    <div className="comparador-modal__overlay" role="presentation" onClick={onClose}>
      <div
        className="comparador-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="comparador-modal__header">
          <h2 id="compare-modal-title" className="comparador-modal__title">
            {t(locale, 'compareModalTitle')}
          </h2>
          <button
            type="button"
            className="comparador-modal__close"
            aria-label={t(locale, 'compareModalClose')}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="comparador-modal__body">
          {!canAdd ? (
            <p className="comparador-modal__hint">{t(locale, 'compareModalFull')}</p>
          ) : null}
          <input
            className="comparador-modal__search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(locale, 'compareModalSearch')}
            aria-label={t(locale, 'compareModalSearch')}
            autoFocus
          />
          {loading ? (
            <p className="comparador-modal__hint">{t(locale, 'loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="comparador-modal__empty">{t(locale, 'compareModalEmpty')}</p>
          ) : (
            <ul className="comparador-modal__list">
              {filtered.map((item) => {
                const image = proyectoImageUrl(item.image_url)
                const full = excludeIds.length >= COMPARE_MAX
                return (
                  <li key={item.uuid}>
                    <button
                      type="button"
                      className="comparador-modal__item"
                      disabled={full || !canAdd}
                      onClick={() => {
                        onAdd(item.id)
                        if (excludeIds.length + 1 >= COMPARE_MAX) onClose()
                      }}
                    >
                      <span
                        className="comparador-modal__item-thumb"
                        style={{ backgroundImage: `url(${image})` }}
                        aria-hidden
                      />
                      <span className="comparador-modal__item-meta">
                        <strong>{item.title}</strong>
                        <span>{item.ciudad || 'Colombia'}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
