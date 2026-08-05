import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import {
  LOCALES,
  type Locale,
  localizedPath,
  stripLocalePrefix,
} from '../../i18n/config'
import { t } from '../../i18n/ui'
import './LanguageSwitcher.scss'

const LABELS: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
  fr: 'FR',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const navigate = useNavigate()
  const location = useLocation()

  function switchTo(next: Locale) {
    if (next === locale) return
    // stripLocalePrefix → canónico ES; localizedPath → slugs del destino.
    const canonical = stripLocalePrefix(location.pathname)
    navigate(localizedPath(canonical, next) + location.search)
  }

  const canonical = stripLocalePrefix(location.pathname)

  return (
    <div className="lang-switcher" aria-label={t(locale, 'language')}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={
            code === locale
              ? 'lang-switcher__btn lang-switcher__btn--active'
              : 'lang-switcher__btn'
          }
          onClick={() => switchTo(code)}
          aria-current={code === locale ? 'true' : undefined}
        >
          {LABELS[code]}
        </button>
      ))}
      {/* fallback for crawlers */}
      <span className="lang-switcher__sr">
        {LOCALES.map((code) => (
          <Link key={code} to={localizedPath(canonical, code)}>
            {LABELS[code]}
          </Link>
        ))}
      </span>
    </div>
  )
}
