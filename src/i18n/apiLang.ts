import type { Locale } from './config'

let currentLang: Locale = 'es'

export function setApiLang(lang: Locale) {
  currentLang = lang
}

export function getApiLang(): Locale {
  return currentLang
}
