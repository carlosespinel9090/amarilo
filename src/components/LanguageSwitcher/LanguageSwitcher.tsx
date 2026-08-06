import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { useAlternateUrls } from '../../i18n/AlternateUrlsContext'
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
  const { urls: alternateUrls } = useAlternateUrls()

  function pathForLocale(next: Locale): string {
    // Detail pages expose per-language CMS aliases (Pathauto).
    const alt = alternateUrls?.[next]
    if (alt) {
      return localizedPath(alt, next) + location.search
    }
    const canonical = stripLocalePrefix(location.pathname)
    return localizedPath(canonical, next) + location.search
  }

  function switchTo(next: Locale) {
    if (next === locale) return
    navigate(pathForLocale(next))
  }

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
          <Link key={code} to={pathForLocale(code)}>
            {LABELS[code]}
          </Link>
        ))}
      </span>
    </div>
  )
}
