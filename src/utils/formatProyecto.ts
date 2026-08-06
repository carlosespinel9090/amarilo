import type { CurrencyCode } from '../currency/CurrencyContext'
import type { ProyectoPrecio } from '../types/home'

type PriceSource = {
  precio?: ProyectoPrecio | null
  precio_desde?: string | number | null
}

export function resolvePriceAmount(
  source: PriceSource,
  currency: CurrencyCode,
): number | null {
  if (source.precio) {
    const raw = currency === 'USD' ? source.precio.usd : source.precio.cop
    if (raw === null || raw === undefined) return null
    const n = Number(raw)
    return Number.isNaN(n) ? null : n
  }
  if (currency === 'USD') return null
  const legacy = source.precio_desde
  if (legacy === null || legacy === undefined || legacy === '') return null
  const n = Number(legacy)
  return Number.isNaN(n) ? null : n
}

/** Full price label, e.g. "Desde $310.000.000" / "Desde US$97,502.67". */
export function formatPriceFull(
  source: PriceSource | string | number | null | undefined,
  currency: CurrencyCode = 'COP',
): string {
  const amount =
    source !== null &&
    source !== undefined &&
    typeof source === 'object' &&
    !Array.isArray(source)
      ? resolvePriceAmount(source, currency)
      : currency === 'USD'
        ? null
        : (() => {
            if (source === null || source === undefined || source === '') return null
            const n = Number(source)
            return Number.isNaN(n) ? null : n
          })()

  if (amount === null) return 'Consultar'

  if (currency === 'USD') {
    const formatted = new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount)
    return `Desde ${formatted} USD`
  }

  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
  return `Desde ${formatted}`
}

/** Compact home-card price (millions for COP). */
export function formatPriceCompact(
  source: PriceSource,
  currency: CurrencyCode = 'COP',
): string {
  const amount = resolvePriceAmount(source, currency)
  if (amount === null) return 'Consultar'

  if (currency === 'USD') {
    const formatted = new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0,
    }).format(amount)
    return `Desde ${formatted} USD`
  }

  return `Desde $${Math.round(amount / 1_000_000)}M`
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
