import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'amarilo:favorite-proyectos'

type Listener = () => void

let memoryIds: number[] | null = null
const listeners = new Set<Listener>()

function readIds(): number[] {
  if (typeof window === 'undefined') return []
  if (memoryIds) return memoryIds
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      memoryIds = []
      return memoryIds
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      memoryIds = []
      return memoryIds
    }
    memoryIds = parsed
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0)
    return memoryIds
  } catch {
    memoryIds = []
    return memoryIds
  }
}

function writeIds(ids: number[]) {
  memoryIds = ids
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
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

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const isFavorite = useCallback((id: number) => ids.includes(id), [ids])

  const toggleFavorite = useCallback((id: number) => {
    const current = readIds()
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    writeIds(next)
  }, [])

  return { ids, ready, isFavorite, toggleFavorite }
}
