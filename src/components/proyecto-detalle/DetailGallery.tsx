import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { proyectoImageUrl } from '../../utils/proyectoImage'

type Props = {
  title: string
  images: string[]
  activeImage: number
  onActiveImage: (index: number) => void
}

export function DetailGallery({ title, images, activeImage, onActiveImage }: Props) {
  const locale = useLocale()
  const thumbs = images.slice(0, 3)
  const mainSrc = images[activeImage] ?? proyectoImageUrl(null)

  return (
    <section className="proyecto-detail__gallery" aria-label={t(locale, 'galeria')}>
      <div className="home-container proyecto-detail__gallery-inner">
        <div className="proyecto-detail__gallery-main">
          <img src={mainSrc} alt={title} />
          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="proyecto-detail__nav proyecto-detail__nav--prev"
                aria-label={t(locale, 'anterior')}
                onClick={() =>
                  onActiveImage((activeImage - 1 + images.length) % images.length)
                }
              />
              <button
                type="button"
                className="proyecto-detail__nav proyecto-detail__nav--next"
                aria-label={t(locale, 'siguiente')}
                onClick={() => onActiveImage((activeImage + 1) % images.length)}
              />
            </>
          ) : null}
        </div>
        <div className="proyecto-detail__thumbs">
          {(thumbs.length ? thumbs : [mainSrc]).map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              className={`proyecto-detail__thumb${activeImage === idx ? ' is-active' : ''}`}
              onClick={() => onActiveImage(idx)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
