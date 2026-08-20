import { useEffect, useRef, type ReactNode } from 'react'
import { Outlet, Route, Routes, useLocation, matchPath } from 'react-router-dom'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { ProyectoDetail } from './pages/ProyectoDetail'
import { ProyectosList } from './pages/ProyectosList'
import { NotFound } from './pages/NotFound'
import { UtilityBar } from './components/UtilityBar'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { useLayout } from './hooks/useLayout'
import { useTrackPageView } from './analytics'
import { LocaleContext } from './i18n/LocaleContext'
import { type Locale, DEFAULT_LOCALE, LOCALES } from './i18n/config'
import { ROUTE_SLUGS, type RouteKey } from './i18n/paths'
import { setApiLang } from './i18n/apiLang'
import { t } from './i18n/ui'
import { CurrencyProvider } from './currency/CurrencyContext'
import { AlternateUrlsProvider } from './i18n/AlternateUrlsContext'
import { SalesIqWidget } from './components/SalesIqWidget/SalesIqWidget'
import './styles/layout/site-chrome.scss'

/** Páginas con componente real, registradas bajo el slug de cada locale. */
const PAGE_ROUTES: Array<{ key: RouteKey; element: ReactNode }> = [
  { key: 'about', element: <About /> },
]

const LOCALE_ROOTS: Array<{ path: string; locale: Locale }> = [
  { path: '/', locale: DEFAULT_LOCALE },
  ...LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((locale) => ({
    path: `/${locale}`,
    locale,
  })),
]

function isProyectoDetailPath(pathname: string): boolean {
  for (const locale of LOCALES) {
    const base = ROUTE_SLUGS.proyectos[locale]
    const pattern =
      locale === DEFAULT_LOCALE ? `/${base}/:slug` : `/${locale}/${base}/:slug`
    if (matchPath({ path: pattern, end: true }, pathname)) {
      return true
    }
  }
  return false
}

function Shell({ locale }: { locale: Locale }) {
  // Sync before child effects fetch (module-level api lang).
  setApiLang(locale)
  useTrackPageView()
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const { layout, error } = useLayout(locale)
  const { pathname } = useLocation()
  const isDetail = isProyectoDetailPath(pathname)
  const chromeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDetail) {
      document.documentElement.style.removeProperty('--site-chrome-height')
      return
    }
    const el = chromeRef.current
    if (!el) return

    const apply = () => {
      document.documentElement.style.setProperty(
        '--site-chrome-height',
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      )
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--site-chrome-height')
    }
  }, [isDetail, layout?.header, layout?.utility])

  return (
    <LocaleContext.Provider value={locale}>
      <CurrencyProvider>
        <AlternateUrlsProvider>
          <div
            className={`min-h-screen bg-white text-[#161616]${isDetail ? ' is-proyecto-detail' : ''}`}
          >
            <div
              ref={chromeRef}
              className={`site-chrome${isDetail ? ' site-chrome--sticky' : ''}`}
            >
              <UtilityBar links={layout?.utility ?? []} />
              {layout?.header ? (
                <Header
                  logoAlt={layout.header.logo_alt}
                  logoUrl={layout.header.logo_url}
                  menu={layout.header.menu}
                  cta={layout.header.cta}
                />
              ) : null}
            </div>

            <main>
              <Outlet />
            </main>

            <Footer data={layout?.footer ?? null} error={error ? t(locale, 'layoutError') : null} />
            <SalesIqWidget />
          </div>
        </AlternateUrlsProvider>
      </CurrencyProvider>
    </LocaleContext.Provider>
  )
}

function App() {
  return (
    <Routes>
      {/* Rutas explícitas /en y /fr: un /:lang genérico hacía que /proyectos
          se interpretara como idioma y redirigiera al home en español. */}
      {LOCALE_ROOTS.map(({ path, locale }) => (
        <Route key={path} path={path} element={<Shell locale={locale} />}>
          <Route index element={<Home />} />
          {PAGE_ROUTES.map(({ key, element }) => (
            <Route key={key} path={ROUTE_SLUGS[key][locale]} element={element} />
          ))}
          <Route
            path={ROUTE_SLUGS.proyectos[locale]}
            element={<ProyectosList />}
          />
          <Route
            path={`${ROUTE_SLUGS.proyectos[locale]}/:slug`}
            element={<ProyectoDetail />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      ))}
    </Routes>
  )
}

export default App
