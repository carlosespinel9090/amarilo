import type { ProyectoAmenidadRich, ProyectoDetail } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { proyectoImageUrl } from '../../utils/proyectoImage'

type Props = {
  data: ProyectoDetail
}

function toCards(data: ProyectoDetail): ProyectoAmenidadRich[] {
  if (data.amenidades_rich?.length) return data.amenidades_rich
  return (data.amenities ?? []).map((titulo) => ({
    titulo,
    descripcion: null,
    image_url: null,
    icon: null,
  }))
}

export function TabAmenidades({ data }: Props) {
  const locale = useLocale()
  const cards = toCards(data)
  if (!cards.length) return null

  return (
    <div className="proyecto-detail__tab-panel">
      <h2 className="home-title">{t(locale, 'tabAmenidades')}</h2>
      <div className="proyecto-detail__amenidades-grid">
        {cards.map((item) => (
          <article
            key={item.titulo}
            className={`proyecto-detail__amenidad-card${item.image_url ? ' has-image' : ''}`}
            style={
              item.image_url
                ? { backgroundImage: `url(${proyectoImageUrl(item.image_url)})` }
                : undefined
            }
          >
            <div className="proyecto-detail__amenidad-body">
              <h3>{item.titulo}</h3>
              {item.descripcion ? <p>{item.descripcion}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
