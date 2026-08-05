export function formatPriceFull(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Consultar'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  const formatted = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(n)
  return `Desde $${formatted}`
}

export function formatHabRange(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null && min !== max) return `${min}-${max} Habitaciones`
  return `${min ?? max} Habitaciones`
}

export function formatSpecs(item: {
  area_m2: number | null
  hab_min: number | null
  hab_max: number | null
  banos: number | null
}): string {
  const parts: string[] = []
  if (item.area_m2 != null) parts.push(`${Math.round(item.area_m2)} m² área`)
  const hab = formatHabRange(item.hab_min, item.hab_max)
  if (hab) parts.push(hab)
  if (item.banos != null) parts.push(`${item.banos} Baños`)
  return parts.join(' - ')
}
