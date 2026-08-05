import type { Locale } from './config'

const messages = {
  es: {
    loading: 'Cargando…',
    homeError: 'No se pudo cargar el home',
    layoutError: 'No se pudo cargar el layout',
    notFound: 'Página no encontrada',
    about: 'Acerca de',
    language: 'Idioma',
  },
  en: {
    loading: 'Loading…',
    homeError: 'Could not load home',
    layoutError: 'Could not load layout',
    notFound: 'Page not found',
    about: 'About',
    language: 'Language',
  },
  fr: {
    loading: 'Chargement…',
    homeError: "Impossible de charger l'accueil",
    layoutError: 'Impossible de charger la mise en page',
    notFound: 'Page introuvable',
    about: 'À propos',
    language: 'Langue',
  },
} as const

export type UiKey = keyof (typeof messages)['es']

export function t(locale: Locale, key: UiKey): string {
  return messages[locale][key] ?? messages.es[key]
}
