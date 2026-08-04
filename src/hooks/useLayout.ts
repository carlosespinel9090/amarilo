import { useEffect, useState } from 'react'
import { fetchLayout } from '../utils/fetchLayout'
import type { SiteLayout } from '../types/layout'

let cachedLayout: SiteLayout | null = null
let pending: Promise<SiteLayout> | null = null

export function useLayout() {
  const [layout, setLayout] = useState<SiteLayout | null>(cachedLayout)
  const [loading, setLoading] = useState(!cachedLayout)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    if (cachedLayout) {
      setLayout(cachedLayout)
      setLoading(false)
      return
    }

    const request =
      pending ??
      (pending = fetchLayout()
        .then((data: SiteLayout) => {
          cachedLayout = data
          return data
        })
        .finally(() => {
          pending = null
        }))

    request
      .then((data: SiteLayout) => {
        if (mounted) {
          setLayout(data)
          setError(null)
        }
      })
      .catch(() => {
        if (mounted) setError('No se pudo cargar el layout')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return { layout, loading, error }
}
