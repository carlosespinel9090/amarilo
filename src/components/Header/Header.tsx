import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { LayoutLink } from '../../types/layout'
import '../../styles/layout/header.scss'

interface HeaderProps {
  logoAlt: string
  logoUrl: string | null
  menu: LayoutLink[]
  cta: LayoutLink
}

function normalizePath(url: string) {
  if (!url || url === '/') return '/'
  return url.replace(/\/$/, '') || '/'
}

function isActive(pathname: string, url: string) {
  const current = normalizePath(pathname)
  const target = normalizePath(url)
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}

export function Header({ logoAlt, logoUrl, menu, cta }: HeaderProps) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo" aria-label={logoAlt}>
          {logoUrl ? (
            <img className="site-header__logo-img" src={logoUrl} alt={logoAlt} />
          ) : (
            <>
              <span className="site-header__logo-mark" aria-hidden />
              <span className="site-header__logo-text">Amarilo</span>
            </>
          )}
        </Link>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`site-header__nav${open ? ' site-header__nav--open' : ''}`}
          aria-label="Principal"
        >
          {menu.map((item) => {
            const active = isActive(pathname, item.url)
            return (
              <Link
                key={`${item.title}-${item.url}`}
                to={item.url || '/'}
                className={`site-header__link${active ? ' is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.title}
                {active ? <span className="site-header__link-underline" /> : null}
              </Link>
            )
          })}
        </nav>

        <Link className="site-header__cta" to={cta.url || '/contacto'}>
          {cta.title}
        </Link>
      </div>
    </header>
  )
}
