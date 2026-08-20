import type { LayoutSocial, SiteLayout } from '../../types/layout'
import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import '../../styles/layout/footer.scss'

const FALLBACK_LOGO = '/images/amarilo-logo.png'

interface FooterProps {
  data: SiteLayout['footer'] | null
  error?: string | null
}

function SocialGlyph({ network }: { network: string }) {
  const key = network.toLowerCase()
  if (key.includes('facebook') || key === 'fb') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="site-footer__social-icon">
        <path
          fill="currentColor"
          d="M14 8h2.5V5.5H14c-2.2 0-4 1.8-4 4V12H7.5v2.5H10V20h2.5v-5.5h2.3L15.3 12H12.5v-2c0-.6.4-1 1-1H14Z"
        />
      </svg>
    )
  }
  if (key.includes('instagram') || key === 'ig') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="site-footer__social-icon">
        <path
          fill="currentColor"
          d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm5.3-8.2a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0ZM12 4.5c-2.04 0-2.3.01-3.1.05-.8.04-1.34.16-1.82.35-.5.2-.92.45-1.34.87-.42.42-.67.84-.87 1.34-.19.48-.31 1.02-.35 1.82-.04.8-.05 1.06-.05 3.1s.01 2.3.05 3.1c.04.8.16 1.34.35 1.82.2.5.45.92.87 1.34.42.42.84.67 1.34.87.48.19 1.02.31 1.82.35.8.04 1.06.05 3.1.05s2.3-.01 3.1-.05c.8-.04 1.34-.16 1.82-.35.5-.2.92-.45 1.34-.87.42-.42.67-.84.87-1.34.19-.48.31-1.02.35-1.82.04-.8.05-1.06.05-3.1s-.01-2.3-.05-3.1c-.04-.8-.16-1.34-.35-1.82-.2-.5-.45-.92-.87-1.34-.42-.42-.84-.67-1.34-.87-.48-.19-1.02-.31-1.82-.35-.8-.04-1.06-.05-3.1-.05Zm0-1.5c2.08 0 2.34.01 3.16.05.81.04 1.37.17 1.85.36.51.2.94.44 1.38.88.44.44.68.87.88 1.38.19.48.32 1.04.36 1.85.04.82.05 1.08.05 3.16s-.01 2.34-.05 3.16c-.04.81-.17 1.37-.36 1.85-.2.51-.44.94-.88 1.38-.44.44-.87.68-1.38.88-.48.19-1.04.32-1.85.36-.82.04-1.08.05-3.16.05s-2.34-.01-3.16-.05c-.81-.04-1.37-.17-1.85-.36a3.7 3.7 0 0 1-1.38-.88 3.7 3.7 0 0 1-.88-1.38c-.19-.48-.32-1.04-.36-1.85C4.51 14.34 4.5 14.08 4.5 12s.01-2.34.05-3.16c.04-.81.17-1.37.36-1.85.2-.51.44-.94.88-1.38.44-.44.87-.68 1.38-.88.48-.19 1.04-.32 1.85-.36C9.66 4.51 9.92 4.5 12 4.5Z"
        />
      </svg>
    )
  }
  if (key.includes('youtube') || key === 'yt') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="site-footer__social-icon">
        <path
          fill="currentColor"
          d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1A31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-4.8ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z"
        />
      </svg>
    )
  }
  return <span className="site-footer__social-fallback">{network.slice(0, 2).toUpperCase()}</span>
}

function SocialIcon({ item }: { item: LayoutSocial }) {
  return (
    <a
      className="site-footer__social-link"
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={item.network}
    >
      <SocialGlyph network={item.network} />
    </a>
  )
}

function FooterLink({ url, title }: { url: string; title: string }) {
  const locale = useLocale()
  if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return <a href={url}>{title}</a>
  }
  return <Link to={localizedPath(url || '/', locale)}>{title}</Link>
}

export function Footer({ data, error }: FooterProps) {
  const locale = useLocale()

  if (error && !data) {
    return <div className="site-footer__error">{error}</div>
  }

  if (!data) return null

  const logoSrc = data.brand.logo_url || FALLBACK_LOGO
  const logoAlt = data.brand.title || 'Amarilo'

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link to={localizedPath('/', locale)} className="site-footer__logo" aria-label={logoAlt}>
              <img className="site-footer__logo-img" src={logoSrc} alt={logoAlt} width={124} height={97} />
            </Link>
            {data.brand.social.length > 0 ? (
              <ul className="site-footer__social">
                {data.brand.social.map((item) => (
                  <li key={item.network}>
                    <SocialIcon item={item} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {data.columns.map((column) => (
            <div key={column.title} className="site-footer__column">
              <h6 className="site-footer__column-title">{column.title}</h6>
              <ul className="site-footer__column-list">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.title}`}>
                    <FooterLink url={link.url} title={link.title} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">{data.copyright}</p>
          <ul className="site-footer__legal">
            {data.legal.map((link) => (
              <li key={`${link.title}-${link.url}`}>
                <FooterLink url={link.url} title={link.title} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
