import type { ProyectoDetail, ProyectoLayout } from '../../types/proyecto'

/** Prioridad: Premium → VIS → No VIS (mismo criterio que el API). */
export function resolveLayout(
  data: Pick<ProyectoDetail, 'layout' | 'segmentos' | 'variant'>,
): ProyectoLayout {
  if (data.layout === 'premium' || data.layout === 'vis' || data.layout === 'novis') {
    return data.layout
  }

  const segmentos = data.segmentos ?? []
  for (const seg of segmentos) {
    if (/premium/i.test(seg)) return 'premium'
  }
  for (const seg of segmentos) {
    if (/\bvis\b/i.test(seg)) return 'vis'
  }
  if (data.variant === 'premium') return 'premium'
  return 'novis'
}
