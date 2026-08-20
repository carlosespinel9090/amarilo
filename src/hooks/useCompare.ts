import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'amarilo:compare-proyectos'
export const COMPARE_MAX = 3

type Listener = () => void

let memoryIds: number[] | null = null
const listeners = new Set<Listener>()

function normalizeIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<number>()
  const out: number[] = []
  for (const v of raw) {
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0 || seen.has(n)) continue
    seen.add(n)
    out.push(n)
    if (out.length >= COMPARE_MAX) break
  }
  return out
}

function readIds(): number[] {
  if (typeof window === 'undefined') return []
  if (memoryIds) return memoryIds
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      memoryIds = []
      return memoryIds
    }
    memoryIds = normalizeIds(JSON.parse(raw) as unknown)
    return memoryIds
  } catch {
    memoryIds = []
    return memoryIds
  }
}

function writeIds(ids: number[]) {
  memoryIds = normalizeIds(ids)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryIds))
  } catch {
    /* ignore quota / private mode */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return readIds()
}

function getServerSnapshot(): number[] {
  return []
}

/** Parse `?ids=12,34,56` (or space-separated) into up to COMPARE_MAX ids. */
export function parseCompareIdsParam(raw: string | null | undefined): number[] {
  if (!raw?.trim()) return []
  return normalizeIds(
    raw
      .split(/[, ]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  )
}

export function compareIdsQuery(ids: number[]): string {
  return ids.length ? `ids=${ids.join(',')}` : ''
}

export function useCompare() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const isCompared = useCallback((id: number) => ids.includes(id), [ids])

  const setIds = useCallback((next: number[]) => {
    writeIds(next)
  }, [])

  const add = useCallback((id: number): number[] => {
    const current = readIds()
    if (current.includes(id)) return current
    if (current.length >= COMPARE_MAX) return current
    const next = [...current, id]
    writeIds(next)
    return next
  }, [])

  const remove = useCallback((id: number): number[] => {
    const next = readIds().filter((x) => x !== id)
    writeIds(next)
    return next
  }, [])

  const toggle = useCallback((id: number): number[] => {
    const current = readIds()
    if (current.includes(id)) {
      const next = current.filter((x) => x !== id)
      writeIds(next)
      return next
    }
    if (current.length >= COMPARE_MAX) return current
    const next = [...current, id]
    writeIds(next)
    return next
  }, [])

  const clear = useCallback(() => {
    writeIds([])
  }, [])

  const canAdd = ids.length < COMPARE_MAX

  return {
    ids,
    ready,
    canAdd,
    isCompared,
    setIds,
    add,
    remove,
    toggle,
    clear,
  }
}
