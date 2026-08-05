import { useEffect, useState } from 'react'
import { fetchHome } from '../utils/fetchHome'
import type { HomePayload } from '../types/home'
import { HomeSections } from '../components/home/HomeSections'
import { useLocale } from '../i18n/LocaleContext'
import { t } from '../i18n/ui'

export function Home() {
  const locale = useLocale()
  const [home, setHome] = useState<HomePayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setHome(null)
    setError(null)
    fetchHome(locale)
      .then((data) => {
        if (mounted) setHome(data)
      })
      .catch(() => {
        if (mounted) setError(t(locale, 'homeError'))
      })
    return () => {
      mounted = false
    }
  }, [locale])

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
        <p>{t(locale, 'loading')}</p>
      </div>
    )
  }

  return <HomeSections sections={home.sections} filters={home.filters} />
}
