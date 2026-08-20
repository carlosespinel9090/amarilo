import type { ProyectoDetail } from '../../types/proyecto'
import { useCurrency } from '../../currency/CurrencyContext'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { formatCopAmount } from '../../utils/formatProyecto'
import { proyectoImageUrl } from '../../utils/proyectoImage'

type Props = {
  data: ProyectoDetail
}

export function TabTipologias({ data }: Props) {
  const locale = useLocale()
  const { currency } = useCurrency()
  const tipologias = data.tipologias ?? []
  const trm = data.precio?.trm ?? null

  if (!tipologias.length) return null

  return (
    <div className="proyecto-detail__tab-panel">
      <h2 className="home-title">{t(locale, 'tipologiasDisponibles')}</h2>
      <div className="proyecto-detail__tipologias-grid">
        {tipologias.map((item) => {
          const specs = [
            item.habitaciones != null ? `${item.habitaciones} hab` : null,
            item.banos != null ? `${item.banos} baños` : null,
          ]
            .filter(Boolean)
            .join(' | ')

          return (
            <article key={`${item.nombre}-${item.area_m2}`} className="proyecto-detail__tipologia-card">
              <div
                className="proyecto-detail__tipologia-media"
                style={{
                  backgroundImage: `url(${proyectoImageUrl(item.image_url)})`,
                }}
              />
              <div className="proyecto-detail__tipologia-body">
                <h3>
                  {item.nombre}
                  {item.area_m2 != null ? ` - ${Math.round(item.area_m2)}m²` : ''}
                </h3>
                {specs ? <p className="proyecto-detail__tipologia-specs">{specs}</p> : null}
                <p className="proyecto-detail__tipologia-price">
                  {formatCopAmount(item.precio_cop, currency, trm, 'compact')}
                </p>
                <button type="button" className="home-btn home-btn--outline">
                  {item.cta_label || t(locale, 'verTipologia')}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
