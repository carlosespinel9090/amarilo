import { useEffect, useState } from 'react'
import { fetchLayout, clearLayoutCache } from '../utils/fetchLayout'
import type { SiteLayout } from '../types/layout'
import type { Locale } from '../i18n/config'
import { t } from '../i18n/ui'

const cacheByLang = new Map<Locale, SiteLayout>()
const pendingByLang = new Map<Locale, Promise<SiteLayout>>()

export function useLayout(locale: Locale) {
  const [layout, setLayout] = useState<SiteLayout | null>(cacheByLang.get(locale) ?? null)
  const [loading, setLoading] = useState(!cacheByLang.has(locale))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const cached = cacheByLang.get(locale)
    if (cached) {
      setLayout(cached)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    let request = pendingByLang.get(locale)
    if (!request) {
      request = fetchLayout(locale)
        .then((data) => {
          cacheByLang.set(locale, data)
          return data
        })
        .finally(() => {
          pendingByLang.delete(locale)
        })
      pendingByLang.set(locale, request)
    }

    request
      .then((data) => {
        if (mounted) {
          setLayout(data)
          setError(null)
        }
      })
      .catch(() => {
        if (mounted) setError(t(locale, 'layoutError'))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [locale])

  return { layout, loading, error }
}

export function invalidateLayoutCache(locale?: Locale) {
  if (locale) {
    cacheByLang.delete(locale)
    clearLayoutCache()
    return
  }
  cacheByLang.clear()
  clearLayoutCache()
}
