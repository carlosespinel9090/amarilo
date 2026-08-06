import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Locale } from '../i18n/config'

export type AlternateUrls = Partial<Record<Locale, string>>

interface AlternateUrlsContextValue {
  urls: AlternateUrls | null
  setUrls: (urls: AlternateUrls | null) => void
}

const AlternateUrlsContext = createContext<AlternateUrlsContextValue>({
  urls: null,
  setUrls: () => undefined,
})

export function AlternateUrlsProvider({ children }: { children: ReactNode }) {
  const [urls, setUrls] = useState<AlternateUrls | null>(null)
  const value = useMemo(() => ({ urls, setUrls }), [urls])
  return (
    <AlternateUrlsContext.Provider value={value}>{children}</AlternateUrlsContext.Provider>
  )
}

export function useAlternateUrls(): AlternateUrlsContextValue {
  return useContext(AlternateUrlsContext)
}
