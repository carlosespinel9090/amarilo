import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from './gtm'

export function useTrackPageView() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])
}
