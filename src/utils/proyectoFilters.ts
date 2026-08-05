import type { Locale } from '../i18n/config'
import { pathFor } from '../i18n/paths'

/** Query keys shared by Home hero ↔ listado ↔ GET /api/proyectos */
export const PROYECTO_FILTER_KEYS = ['ciudad', 'tipo', 'presupuesto', 'etapa'] as const

export type ProyectoFilterKey = (typeof PROYECTO_FILTER_KEYS)[number]

export type ProyectoListFilters = Partial<Record<ProyectoFilterKey, string>> & {
  page?: string
  limit?: string
  q?: string
}

/** Read known filter params from URLSearchParams / FormData-like. */
export function parseProyectoFilters(
  source: URLSearchParams | FormData | Record<string, string>,
): ProyectoListFilters {
  const get = (key: string): string => {
    if (source instanceof URLSearchParams || source instanceof FormData) {
      const v = source.get(key)
      return v == null ? '' : String(v).trim()
    }
    return String(source[key] ?? '').trim()
  }

  const out: ProyectoListFilters = {}
  for (const key of PROYECTO_FILTER_KEYS) {
    const v = get(key)
    if (v) out[key] = v
  }
  const page = get('page')
  if (page) out.page = page
  const limit = get('limit')
  if (limit) out.limit = limit
  const q = get('q')
  if (q) out.q = q
  return out
}

/** Build query string without empty values. */
export function buildProyectoQuery(filters: ProyectoListFilters): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v != null && String(v).trim() !== '') {
      params.set(k, String(v).trim())
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** Localized list path + optional query. */
export function proyectosListPath(locale: Locale, filters: ProyectoListFilters = {}): string {
  return `${pathFor('proyectos', locale)}${buildProyectoQuery(filters)}`
}

/** Axios/API params object (drops empty). */
export function toApiProyectoParams(filters: ProyectoListFilters): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(filters)) {
    if (v == null || String(v).trim() === '') continue
    if (k === 'page' || k === 'limit') {
      const n = Number(v)
      if (!Number.isNaN(n) && n > 0) out[k] = n
      continue
    }
    out[k] = String(v)
  }
  return out
}
