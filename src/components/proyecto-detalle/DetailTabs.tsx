import { useLocale } from '../../i18n/LocaleContext'
import { t, type UiKey } from '../../i18n/ui'
import type { DetailTabId } from './detailTabUtils'

const TAB_LABELS: Record<DetailTabId, UiKey> = {
  resumen: 'tabResumen',
  tipologias: 'tabTipologias',
  ubicacion: 'tabUbicacionDetalle',
  amenidades: 'tabAmenidades',
  tour: 'tabTour',
  avances: 'tabAvancesDetalle',
}

type Props = {
  tabs: DetailTabId[]
  active: DetailTabId
  onChange: (id: DetailTabId) => void
}

export function DetailTabs({ tabs, active, onChange }: Props) {
  const locale = useLocale()
  if (!tabs.length) return null

  return (
    <div className="proyecto-detail__pill-tabs" role="tablist" aria-label="Secciones del proyecto">
      {tabs.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`proyecto-detail__pill-tab${active === id ? ' is-active' : ''}`}
          onClick={() => onChange(id)}
        >
          {t(locale, TAB_LABELS[id])}
        </button>
      ))}
    </div>
  )
}
