import { Link } from 'react-router-dom'
import type { LayoutLink } from '../../types/layout'
import '../../styles/layout/utility-bar.scss'

interface UtilityBarProps {
  links: LayoutLink[]
}

function toTo(url: string) {
  return url.startsWith('http') ? url : url || '/'
}

export function UtilityBar({ links }: UtilityBarProps) {
  if (!links.length) return null

  return (
    <div className="utility-bar">
      <div className="utility-bar__inner">
        {links.map((link) => {
          const href = toTo(link.url)
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
      </div>
    </div>
  )
}
