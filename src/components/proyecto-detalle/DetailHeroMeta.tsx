import type { ReactNode } from 'react'
import type { ProyectoDetail } from '../../types/proyecto'
import { formatHabRange, formatPriceFull } from '../../utils/formatProyecto'
import { useCurrency } from '../../currency/CurrencyContext'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'

type Props = {
  data: ProyectoDetail
  badge: ReactNode
  sidebar: ReactNode
}

export function DetailHeroMeta({ data, badge, sidebar }: Props) {
  const locale = useLocale()
  const { currency } = useCurrency()

  const areaConst =
    data.area_m2_construida ?? data.area_m2 ?? null
  const areaPriv = data.area_m2_privada ?? null
  const areaParts = [
    areaConst != null
      ? t(locale, 'areaConstruidaLabel').replace('{n}', String(Math.round(areaConst)))
      : null,
    areaPriv != null
      ? t(locale, 'areaPrivadaLabel').replace('{n}', String(Math.round(areaPriv)))
      : null,
  ].filter(Boolean)
  const habLabel = formatHabRange(data.hab_min, data.hab_max)
  const baths = data.banos != null ? `${data.banos} Baños` : null
  const rooms = [habLabel, baths].filter(Boolean).join(' - ')

  return (
    <header className="proyecto-detail__hero proyecto-detail__hero--split">
      <div className="proyecto-detail__hero-main">
        <div className="proyecto-detail__badges">{badge}</div>
        <h1 className="proyecto-detail__title">{data.title}</h1>
        <div className="proyecto-detail__meta-row">
          <p className="proyecto-detail__price">{formatPriceFull(data, currency)}</p>
          {areaParts.length ? (
            <p className="proyecto-detail__meta-item">{areaParts.join(' - ')}</p>
          ) : null}
          {data.ciudad ? (
            <p className="proyecto-detail__meta-item">
              <span className="proyecto-detail__pin-icon" aria-hidden />
              {data.ciudad}
            </p>
          ) : null}
          {rooms ? <p className="proyecto-detail__meta-item">{rooms}</p> : null}
        </div>
      </div>
      {sidebar}
    </header>
  )
}
