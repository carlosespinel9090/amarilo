import { createContext, useContext } from 'react'
import type { Locale } from './config'
import { DEFAULT_LOCALE } from './config'

export const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function useLocale(): Locale {
  return useContext(LocaleContext)
}
