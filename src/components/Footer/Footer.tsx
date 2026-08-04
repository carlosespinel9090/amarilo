import type { LayoutSocial, SiteLayout } from '../../types/layout'
import '../../styles/layout/footer.scss'

interface FooterProps {
  data: SiteLayout['footer'] | null
  error?: string | null
}

function socialLabel(network: string) {
  return network.slice(0, 2).toUpperCase()
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
      {socialLabel(item.network)}
    </a>
  )
}

export function Footer({ data, error }: FooterProps) {
  if (error && !data) {
    return <div className="site-footer__error">{error}</div>
  }

  if (!data) return null

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <p className="site-footer__brand-title">{data.brand.title}</p>
            <p className="site-footer__tagline">{data.brand.tagline}</p>
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
            <div key={column.title}>
              <h6 className="site-footer__column-title">{column.title}</h6>
              <ul className="site-footer__column-list">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.title}`}>
                    <a href={link.url}>{link.title}</a>
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
                <a href={link.url}>{link.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
