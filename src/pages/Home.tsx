import { useEffect, useState } from 'react'
import { fetchHome } from '../utils/fetchHome'
import type { HomePayload } from '../types/home'
import { HomeSections } from '../components/home/HomeSections'

export function Home() {
  const [home, setHome] = useState<HomePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchHome()
      .then((data) => {
        if (mounted) setHome(data)
      })
      .catch(() => {
        if (mounted) setError('No se pudo cargar el home')
      })
    return () => {
      mounted = false
    }
  }, [])

  if (error) {
    return (
      <div className="home-container" style={{ padding: '48px 32px' }}>
        <p>{error}</p>
      </div>
    )
  }

  if (!home) {
    return (
      <div className="home-container" style={{ padding: '48px 32px' }}>
        <p>Cargando…</p>
      </div>
    )
  }

  return <HomeSections sections={home.sections} filters={home.filters} />
}
