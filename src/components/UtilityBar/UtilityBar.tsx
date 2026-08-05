import { Link } from 'react-router-dom'
import type { LayoutLink } from '../../types/layout'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { LanguageSwitcher } from '../LanguageSwitcher'
import '../../styles/layout/utility-bar.scss'

interface UtilityBarProps {
  links: LayoutLink[]
}

function toTo(url: string, locale: ReturnType<typeof useLocale>) {
  if (url.startsWith('http')) return url
  return localizedPath(url || '/', locale)
}

export function UtilityBar({ links }: UtilityBarProps) {
  const locale = useLocale()

  return (
    <div className="utility-bar" style={{ flex: 1 }}>
      <div className="utility-bar__inner">
        {links.map((link) => {
          const href = toTo(link.url, locale)
          if (href.startsWith('http')) {
            return (
              <a
                key={`${link.title}-${link.url}`}
                className="utility-bar__link"
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                {link.title}
              </a>
            )
          }
          return (
            <Link
              key={`${link.title}-${link.url}`}
              className="utility-bar__link"
              to={href}
            >
              {link.title}
            </Link>
          )
        })}
        <LanguageSwitcher />
      </div>
    </div>
  )
}
