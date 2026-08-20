import { useEffect, useState } from 'react'
import { fetchTrm, type TrmPayload } from '../utils/fetchTrm'

/** Approximate TRM used when the API is unavailable (stubs / offline). */
export const FALLBACK_TRM = 3053

let cached: TrmPayload | null = null
let pending: Promise<TrmPayload> | null = null

function loadTrm(): Promise<TrmPayload> {
  if (cached) return Promise.resolve(cached)
  if (!pending) {
    pending = fetchTrm()
      .then((data) => {
        if (data?.valor && data.valor > 0) {
          cached = data
        }
        return data
      })
      .finally(() => {
        pending = null
      })
  }
  return pending
}

export function useTrm() {
  const [trm, setTrm] = useState<number>(cached?.valor && cached.valor > 0 ? cached.valor : FALLBACK_TRM)
  const [fecha, setFecha] = useState<string | null>(cached?.fecha ?? null)
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let mounted = true
    if (cached?.valor && cached.valor > 0) {
      setTrm(cached.valor)
      setFecha(cached.fecha)
      setLoading(false)
      return
    }

    setLoading(true)
    loadTrm()
      .then((data) => {
        if (!mounted) return
        if (data?.valor && data.valor > 0) {
          setTrm(data.valor)
          setFecha(data.fecha)
        }
      })
      .catch(() => {
        /* keep FALLBACK_TRM */
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return { trm, fecha, loading }
}
