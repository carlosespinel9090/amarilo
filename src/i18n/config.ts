import { localizePathname, toCanonicalPath, stripLocalePrefixRaw } from './paths'

export const LOCALES = ['es', 'en', 'fr'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

/** Prefijo de ruta: es → '' ; en → '/en' ; fr → '/fr' */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`
}

/**
 * Une prefijo de idioma + path interno con slugs traducidos.
 * CMS envía paths canónicos en ES (/proyectos) → /en/projects, /fr/projets.
 */
export function localizedPath(path: string, locale: Locale): string {
  return localizePathname(path, locale, localePrefix)
}

/** Extrae locale desde pathname. */
export function localeFromPathname(pathname: string): Locale {
  const m = pathname.match(/^\/(en|fr)(?=\/|$)/)
  return m ? (m[1] as Locale) : DEFAULT_LOCALE
}

/**
 * Pathname sin prefijo de idioma y con slugs en forma canónica (ES).
 * Útil para el LanguageSwitcher: /en/projects → /proyectos.
 */
export function stripLocalePrefix(pathname: string): string {
  return toCanonicalPath(pathname)
}

/** Solo quita /en|/fr, sin traducir slugs. */
export { stripLocalePrefixRaw, toCanonicalPath }
