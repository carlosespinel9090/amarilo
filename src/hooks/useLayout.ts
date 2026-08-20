import { useEffect, useState } from 'react'
import { fetchLayout, clearLayoutCache } from '../utils/fetchLayout'
import type { SiteLayout } from '../types/layout'
import type { Locale } from '../i18n/config'
import { t } from '../i18n/ui'
import { resolveApiBaseUrl } from '../i18n/apiBaseUrl'

type CacheKey = `${string}:${Locale}`

const cacheByKey = new Map<CacheKey, SiteLayout>()
const pendingByKey = new Map<CacheKey, Promise<SiteLayout>>()

function cacheKey(locale: Locale): CacheKey {
  return `${resolveApiBaseUrl()}:${locale}`
}

export function useLayout(locale: Locale) {
  const key = cacheKey(locale)
  const [layout, setLayout] = useState<SiteLayout | null>(cacheByKey.get(key) ?? null)
  const [loading, setLoading] = useState(!cacheByKey.has(key))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const currentKey = cacheKey(locale)
    const cached = cacheByKey.get(currentKey)
    if (cached) {
      setLayout(cached)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    let request = pendingByKey.get(currentKey)
    if (!request) {
      request = fetchLayout(locale)
        .then((data) => {
          cacheByKey.set(currentKey, data)
          return data
        })
        .finally(() => {
          pendingByKey.delete(currentKey)
        })
      pendingByKey.set(currentKey, request)
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
  }, [locale, key])

  return { layout, loading, error }
}

export function invalidateLayoutCache(locale?: Locale) {
  if (locale) {
    cacheByKey.delete(cacheKey(locale))
    clearLayoutCache()
    return
  }
  cacheByKey.clear()
  clearLayoutCache()
}
