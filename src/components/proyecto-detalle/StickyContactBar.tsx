import { Link } from 'react-router-dom'
import type { RefObject } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { t } from '../../i18n/ui'

type Props = {
  contactUrl: string
  whatsappUrl: string | null
  barRef: RefObject<HTMLElement | null>
}

export function StickyContactBar({ contactUrl, whatsappUrl, barRef }: Props) {
  const locale = useLocale()

  return (
    <aside className="proyecto-detail__contact-bar" ref={barRef}>
      <div className="home-container proyecto-detail__contact-bar-inner">
        <p>{t(locale, 'contactanosInfo')}</p>
        <div className="proyecto-detail__contact-actions">
          {contactUrl.startsWith('http') ? (
            <a
              className="home-btn proyecto-detail__cta-yellow"
              href={contactUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t(locale, 'quieroContacto')}
            </a>
          ) : (
            <Link
              className="home-btn proyecto-detail__cta-yellow"
              to={localizedPath(contactUrl, locale)}
            >
              {t(locale, 'quieroContacto')}
            </Link>
          )}
          {whatsappUrl ? (
            <a
              className="home-btn proyecto-detail__wa"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t(locale, 'escribirWhatsapp')}
            </a>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
