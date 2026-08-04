import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'
import { UtilityBar } from './components/UtilityBar'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { useLayout } from './hooks/useLayout'
import { useTrackPageView } from './analytics'

function App() {
  useTrackPageView()
  const { layout, error } = useLayout()

  return (
    <div className="min-h-screen bg-white text-[#161616]">
      {layout ? <UtilityBar links={layout.utility} /> : null}
      {layout ? (
        <Header
          logoAlt={layout.header.logo_alt}
          logoUrl={layout.header.logo_url}
          menu={layout.header.menu}
          cta={layout.header.cta}
        />
      ) : null}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer data={layout?.footer ?? null} error={error} />
    </div>
  )
}

export default App
