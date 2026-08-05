import type { Locale } from './config'

/**
 * Canonical route keys are Spanish segments (what CMS/API returns).
 * Each key maps to the slug per locale.
 */
export const ROUTE_SLUGS = {
  proyectos: { es: 'proyectos', en: 'projects', fr: 'projets' },
  contacto: { es: 'contacto', en: 'contact', fr: 'contact' },
  blog: { es: 'blog', en: 'blog', fr: 'blog' },
  financiacion: { es: 'financiacion', en: 'financing', fr: 'financement' },
  asistente: { es: 'asistente', en: 'assistant', fr: 'assistant' },
  herramientas: { es: 'herramientas', en: 'tools', fr: 'outils' },
  'conoce-amarilo': { es: 'conoce-amarilo', en: 'about-amarilo', fr: 'connaitre-amarilo' },
  about: { es: 'about', en: 'about', fr: 'a-propos' },
  nosotros: { es: 'nosotros', en: 'about-us', fr: 'a-propos-nous' },
  clientes: { es: 'clientes', en: 'clients', fr: 'clients' },
  pagar: { es: 'pagar', en: 'pay', fr: 'payer' },
  'portal-clientes': { es: 'portal-clientes', en: 'client-portal', fr: 'portail-clients' },
  'linea-etica': { es: 'linea-etica', en: 'ethics-line', fr: 'ligne-ethique' },
  aprende: { es: 'aprende', en: 'learn', fr: 'apprendre' },
  comparador: { es: 'comparador', en: 'comparator', fr: 'comparateur' },
  'compra-exterior': { es: 'compra-exterior', en: 'buy-abroad', fr: 'achat-exterieur' },
  simulador: { es: 'simulador', en: 'simulator', fr: 'simulateur' },
  sostenibilidad: { es: 'sostenibilidad', en: 'sustainability', fr: 'durabilite' },
  proveedores: { es: 'proveedores', en: 'suppliers', fr: 'fournisseurs' },
  'trabaja-con-nosotros': { es: 'trabaja-con-nosotros', en: 'careers', fr: 'carrieres' },
  legales: { es: 'legales', en: 'legal', fr: 'mentions-legales' },
  'politica-datos': { es: 'politica-datos', en: 'privacy-policy', fr: 'politique-donnees' },
  'mi-proyecto': { es: 'mi-proyecto', en: 'my-project', fr: 'mon-projet' },
  pagos: { es: 'pagos', en: 'payments', fr: 'paiements' },
  pqr: { es: 'pqr', en: 'support', fr: 'support' },
  avance: { es: 'avance', en: 'progress', fr: 'avancement' },
  'educacion-financiera': {
    es: 'educacion-financiera',
    en: 'financial-education',
    fr: 'education-financiere',
  },
  guias: { es: 'guias', en: 'guides', fr: 'guides' },
  inversion: { es: 'inversion', en: 'investment', fr: 'investissement' },
  testimonios: { es: 'testimonios', en: 'testimonials', fr: 'temoignages' },
  ciudad: { es: 'ciudad', en: 'city', fr: 'ville' },
} as const satisfies Record<string, Record<Locale, string>>

export type RouteKey = keyof typeof ROUTE_SLUGS

/** Reverse lookup: any locale slug → canonical Spanish key. */
const SLUG_TO_KEY: Map<string, RouteKey> = (() => {
  const map = new Map<string, RouteKey>()
  for (const key of Object.keys(ROUTE_SLUGS) as RouteKey[]) {
    const slugs = ROUTE_SLUGS[key]
    for (const slug of Object.values(slugs)) {
      map.set(slug, key)
    }
  }
  return map
})()

function splitPathAndSearch(path: string): { pathname: string; search: string; hash: string } {
  const hashIdx = path.indexOf('#')
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : ''
  const withoutHash = hashIdx >= 0 ? path.slice(0, hashIdx) : path
  const searchIdx = withoutHash.indexOf('?')
  const search = searchIdx >= 0 ? withoutHash.slice(searchIdx) : ''
  const pathname = searchIdx >= 0 ? withoutHash.slice(0, searchIdx) : withoutHash
  return { pathname, search, hash }
}

/** Strip /en or /fr prefix only (keeps localized or Spanish segments). */
export function stripLocalePrefixRaw(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|fr)(?=\/|$)/, '')
  return stripped === '' ? '/' : stripped
}

/** Map a single segment to its canonical Spanish key when known. */
function segmentToCanonical(segment: string): string {
  const key = SLUG_TO_KEY.get(segment)
  return key ?? segment
}

/** Map a canonical Spanish segment to the slug for a locale. */
function segmentToLocalized(segment: string, locale: Locale): string {
  if (segment in ROUTE_SLUGS) {
    return ROUTE_SLUGS[segment as RouteKey][locale]
  }
  return segment
}

/**
 * Pathname without locale prefix, with all known slugs in Spanish (canonical).
 * Preserves unknown segments (e.g. project node slugs).
 */
export function toCanonicalPath(pathname: string): string {
  const stripped = stripLocalePrefixRaw(pathname)
  if (stripped === '/') return '/'
  const parts = stripped.split('/').filter(Boolean).map(segmentToCanonical)
  return `/${parts.join('/')}`
}

/**
 * Convert a canonical (Spanish) path to locale-specific slugs (no locale prefix).
 */
export function toLocalizedSegments(canonicalPath: string, locale: Locale): string {
  if (!canonicalPath || canonicalPath === '/') return '/'
  const normalized = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
  const parts = normalized.split('/').filter(Boolean).map((s) => segmentToLocalized(s, locale))
  return parts.length ? `/${parts.join('/')}` : '/'
}

/** Absolute path for a known route key in a locale (includes /en|/fr prefix). */
export function pathFor(key: RouteKey, locale: Locale, rest = ''): string {
  const slug = ROUTE_SLUGS[key][locale]
  const suffix = rest
    ? rest.startsWith('/')
      ? rest
      : `/${rest}`
    : ''
  const body = `/${slug}${suffix}`
  if (locale === 'es') return body
  return `/${locale}${body}`
}

/**
 * Build a localized URL from a CMS/canonical path (or already-localized path).
 * External URLs are returned unchanged. Query/hash are preserved.
 */
export function localizePathname(path: string, locale: Locale, localePrefixFn: (l: Locale) => string): string {
  if (!path || path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path
  }
  const { pathname, search, hash } = splitPathAndSearch(path)
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  const canonical = toCanonicalPath(normalized)
  const localizedBody = toLocalizedSegments(canonical, locale)
  const prefix = localePrefixFn(locale)
  let result: string
  if (localizedBody === '/') {
    result = prefix || '/'
  } else {
    result = `${prefix}${localizedBody}`
  }
  return `${result}${search}${hash}`
}
