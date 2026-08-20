import type { ProyectoDetail, ProyectoTourEscena } from '../../types/proyecto'

export type DetailTabId =
  | 'resumen'
  | 'tipologias'
  | 'ubicacion'
  | 'amenidades'
  | 'tour'
  | 'avances'

export const DETAIL_TAB_ORDER: DetailTabId[] = [
  'resumen',
  'tipologias',
  'ubicacion',
  'amenidades',
  'tour',
  'avances',
]

function isHttpUrl(value: string | null | undefined): value is string {
  const v = value?.trim() ?? ''
  return /^https?:\/\//i.test(v)
}

/**
 * Escenas embebibles: prioriza `tour_escenas` con URL http(s);
 * si no hay ninguna válida, cae a `url_360` (comportamiento legacy Kuula).
 */
export function resolveTourEscenas(
  data: Pick<ProyectoDetail, 'url_360' | 'tour_escenas'>,
  fallbackTitle = 'Tour 360',
): ProyectoTourEscena[] {
  const fromCms = (data.tour_escenas ?? [])
    .map((escena) => {
      const url = escena.url?.trim() ?? ''
      const title = escena.title?.trim() || url || fallbackTitle
      return { title, url }
    })
    .filter((escena) => isHttpUrl(escena.url))

  if (fromCms.length) return fromCms

  const url = data.url_360?.trim() ?? ''
  if (isHttpUrl(url)) return [{ title: fallbackTitle, url }]
  return []
}

export function hasTour360(
  data: Pick<ProyectoDetail, 'url_360' | 'tour_escenas'>,
): boolean {
  return resolveTourEscenas(data).length > 0
}

/** Tabs visibles solo si su bloque CMS tiene contenido. */
export function availableDetailTabs(data: ProyectoDetail): DetailTabId[] {
  const tabs: DetailTabId[] = []
  if (data.descripcion?.trim() || (data.highlights?.length ?? 0) > 0) {
    tabs.push('resumen')
  }
  if ((data.tipologias?.length ?? 0) > 0) tabs.push('tipologias')
  const ubi = data.ubicacion_detalle
  if (
    ubi?.lat != null ||
    ubi?.lng != null ||
    (ubi?.pois?.length ?? 0) > 0 ||
    Boolean(data.como_llegar?.trim()) ||
    Boolean(ubi?.como_llegar?.trim())
  ) {
    tabs.push('ubicacion')
  }
  if ((data.amenidades_rich?.length ?? 0) > 0 || (data.amenities?.length ?? 0) > 0) {
    tabs.push('amenidades')
  }
  if (hasTour360(data)) tabs.push('tour')
  if ((data.avances?.length ?? 0) > 0 || (data.avances_obra?.length ?? 0) > 0) {
    tabs.push('avances')
  }
  return DETAIL_TAB_ORDER.filter((id) => tabs.includes(id))
}

export function isVisSegment(segmentos: string[] | undefined): boolean {
  return (segmentos ?? []).some((s) => /\bvis\b/i.test(s))
}

export function isPremiumSegment(segmentos: string[] | undefined): boolean {
  return (segmentos ?? []).some((s) => /premium/i.test(s))
}
