import { useEffect, type ReactNode } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { About } from './pages/About'
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

function Shell({ locale }: { locale: Locale }) {
  // Sync before child effects fetch (module-level api lang).
  setApiLang(locale)
  useTrackPageView()
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const { layout, error } = useLayout(locale)

  return (
    <LocaleContext.Provider value={locale}>
      <div className="min-h-screen bg-white text-[#161616]">
        <UtilityBar links={layout?.utility ?? []} />
        {layout ? (
          <Header
            logoAlt={layout.header.logo_alt}
            logoUrl={layout.header.logo_url}
            menu={layout.header.menu}
            cta={layout.header.cta}
          />
        ) : null}

        <main>
          <Outlet />
        </main>

        <Footer data={layout?.footer ?? null} error={error ? t(locale, 'layoutError') : null} />
      </div>
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
          <Route path="*" element={<NotFound />} />
        </Route>
      ))}
    </Routes>
  )
}

export default App
