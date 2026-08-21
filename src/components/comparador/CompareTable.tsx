import { Link } from 'react-router-dom'
import type { ProyectoCard } from '../../types/home'
import { useCurrency } from '../../currency/CurrencyContext'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { t, type UiKey } from '../../i18n/ui'
import { COMPARE_MAX } from '../../hooks/useCompare'
import { resolvePriceAmount } from '../../utils/formatProyecto'
import { proyectoImageUrl } from '../../utils/proyectoImage'
import type { CurrencyCode } from '../../currency/CurrencyContext'

type RowKey = 'ubicacion' | 'valor' | 'metraje' | 'amenidades' | 'entrega'

const ROWS: Array<{ key: RowKey; labelKey: UiKey }> = [
  { key: 'ubicacion', labelKey: 'compareRowUbicacion' },
  { key: 'valor', labelKey: 'compareRowValor' },
  { key: 'metraje', labelKey: 'compareRowMetraje' },
  { key: 'amenidades', labelKey: 'compareRowAmenidades' },
  { key: 'entrega', labelKey: 'compareRowEntrega' },
]

function formatComparePrice(item: ProyectoCard, currency: CurrencyCode): string {
  const amount = resolvePriceAmount(item, currency)
  if (amount == null) return 'Consultar'
  if (currency === 'USD') {
    return (
      new Intl.NumberFormat('es-CO', {
        maximumFractionDigits: 0,
      }).format(amount) + ' USD'
    )
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function cellValue(
  item: ProyectoCard | null,
  row: RowKey,
  currency: CurrencyCode,
  dash: string,
): string {
  if (!item) return dash
  switch (row) {
    case 'ubicacion': {
      const parts = [item.ciudad, item.zona].filter(Boolean)
      return parts.length ? parts.join(', ') : dash
    }
    case 'valor':
      return formatComparePrice(item, currency)
    case 'metraje':
      return item.area_m2 != null ? `${Math.round(item.area_m2)} m²` : dash
    case 'amenidades':
      return item.amenities.length ? item.amenities.join(', ') : dash
    case 'entrega':
      return item.estado || dash
    default:
      return dash
  }
}

type Props = {
  projects: Array<ProyectoCard | null>
  onRemove: (id: number) => void
  onAddSlot: () => void
  canAdd: boolean
}

export function CompareTable({ projects, onRemove, onAddSlot, canAdd }: Props) {
  const locale = useLocale()
  const { currency } = useCurrency()
  const dash = t(locale, 'compareDash')
  const slots: Array<ProyectoCard | null> = [...projects]
  while (slots.length < COMPARE_MAX) slots.push(null)
  const filled = projects.filter(Boolean).length

  return (
    <div className="comparador__table-wrap">
      <div
        className="comparador__table"
        role="table"
        aria-label={t(locale, 'compareCounting').replace('{n}', String(filled))}
      >
        {/* Row 1: corner + project headers (same CSS grid row → shared height) */}
        <div className="comparador__corner" aria-hidden />
        {slots.map((item, idx) =>
          item ? (
            <div key={item.uuid} className="comparador__col-head" role="columnheader">
              <h3 className="comparador__col-title">{item.title}</h3>
              <div
                className="comparador__thumb"
                style={{ backgroundImage: `url(${proyectoImageUrl(item.image_url)})` }}
                role="img"
                aria-label={item.title}
              />
              <div className="comparador__col-actions">
                <Link className="home-btn" to={localizedPath(item.url || '/', locale)}>
                  {t(locale, 'verProyecto')}
                </Link>
                <button
                  type="button"
                  className="comparador__remove"
                  onClick={() => onRemove(item.id)}
                >
                  {t(locale, 'compareRemove')}
                </button>
              </div>
            </div>
          ) : (
            <button
              key={`slot-${idx}`}
              type="button"
              className="comparador__slot"
              onClick={onAddSlot}
              disabled={!canAdd}
            >
              <span className="comparador__slot-plus" aria-hidden>
                +
              </span>
              {t(locale, 'compareEmptySlot')}
            </button>
          ),
        )}

        {/* Attribute rows: label + 3 cells share one grid row */}
        {ROWS.map((row) => (
          <div key={row.key} className="comparador__attr-row" role="row">
            <div className="comparador__row-label" role="rowheader">
              {t(locale, row.labelKey)}
            </div>
            {slots.map((item, idx) => (
              <div
                key={`${row.key}-${item?.uuid ?? `empty-${idx}`}`}
                className="comparador__cell"
                role="cell"
              >
                {cellValue(item, row.key, currency, dash)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
