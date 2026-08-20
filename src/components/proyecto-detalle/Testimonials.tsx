import type { ProyectoTestimonio } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { proyectoImageUrl } from '../../utils/proyectoImage'

type Props = {
  items: ProyectoTestimonio[] | undefined
}

function Stars({ rating }: { rating: number | null }) {
  const n = Math.max(0, Math.min(5, rating ?? 5))
  return (
    <div className="proyecto-detail__stars" aria-label={`${n} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < n ? 'is-on' : ''} aria-hidden>
          ★
        </span>
      ))}
    </div>
  )
}

export function Testimonials({ items }: Props) {
  const locale = useLocale()
  if (!items?.length) return null

  return (
    <section className="proyecto-detail__testimonials">
      <span className="home-badge home-badge--solid-yellow">{t(locale, 'casosExito')}</span>
      <h2 className="home-title">{t(locale, 'compradoresOrgullo')}</h2>
      <div className="proyecto-detail__testimonials-grid">
        {items.map((item) => (
          <article key={`${item.autor}-${item.quote.slice(0, 24)}`} className="proyecto-detail__testimonial">
            <img
              className="proyecto-detail__testimonial-photo"
              src={proyectoImageUrl(item.image_url)}
              alt=""
            />
            <span className="proyecto-detail__quote-mark" aria-hidden>
              ”
            </span>
            <p className="proyecto-detail__testimonial-quote">{item.quote}</p>
            <p className="proyecto-detail__testimonial-author">
              {[item.autor, item.subtitulo].filter(Boolean).join(', ')}
            </p>
            <Stars rating={item.rating} />
          </article>
        ))}
      </div>
    </section>
  )
}
