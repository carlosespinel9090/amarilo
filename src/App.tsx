import { Link, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'
import { Footer } from './components/Footer'
import { useTrackPageView } from './analytics'

function App() {
  useTrackPageView()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <nav className="flex gap-4 border-b border-neutral-200 p-4 dark:border-neutral-700">
        <Link
          to="/"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
        >
          Inicio
        </Link>
        <Link
          to="/about"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
        >
          Acerca de
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App
