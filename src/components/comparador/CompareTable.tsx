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
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0,
    }).format(amount) + ' USD'
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

  return (
    <div className="comparador__table-wrap">
      <div className="comparador__table" role="table" aria-label={t(locale, 'compareCounting').replace('{n}', String(projects.filter(Boolean).length))}>
        <div className="comparador__label-col" role="rowgroup">
          <div className="comparador__label-spacer" aria-hidden />
          {ROWS.map((row) => (
            <div key={row.key} className="comparador__row-label" role="rowheader">
              {t(locale, row.labelKey)}
            </div>
          ))}
        </div>

        {slots.map((item, idx) => (
          <div key={item?.uuid ?? `slot-${idx}`} className="comparador__col" role="columnheader">
            {item ? (
              <>
                <div className="comparador__col-head">
                  <h3 className="comparador__col-title">{item.title}</h3>
                  <div
                    className="comparador__thumb"
                    style={{ backgroundImage: `url(${proyectoImageUrl(item.image_url)})` }}
                    role="img"
                    aria-label={item.title}
                  />
                  <div className="comparador__col-actions">
                    <Link
                      className="home-btn"
                      to={localizedPath(item.url || '/', locale)}
                    >
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
                {ROWS.map((row) => (
                  <div key={row.key} className="comparador__cell" role="cell">
                    {cellValue(item, row.key, currency, dash)}
                  </div>
                ))}
              </>
            ) : (
              <>
                <button
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
                {ROWS.map((row) => (
                  <div key={row.key} className="comparador__cell" role="cell">
                    {dash}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
