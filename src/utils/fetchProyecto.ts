import axios from 'axios'
import { apiClient } from '../api/client'
import type { ProyectoDetail } from '../types/proyecto'
import type { Locale } from '../i18n/config'

type ProyectoListItem = { id: number; url: string; title?: string; uuid?: string }

/**
 * id = nid, uuid o slug (reserva-del-parque).
 * Si el BE aún no resuelve slug cross-lang, cae al listado y reintenta por nid.
 */
export async function fetchProyecto(id: string, lang?: Locale): Promise<ProyectoDetail> {
  const params = lang ? { lang } : undefined
  try {
    const { data } = await apiClient.get<ProyectoDetail>(
      `/proyectos/${encodeURIComponent(id)}`,
      { params },
    )
    return data
  } catch (err) {
    if (!axios.isAxiosError(err) || err.response?.status !== 404) {
      throw err
    }
    if (/^\d+$/.test(id) || /^[0-9a-f-]{36}$/i.test(id)) {
      throw err
    }

    const needle = id.toLowerCase()
    const q = id.replace(/-/g, ' ')

    // Prefer current lang list; if empty/no match, retry without relying on title lang.
    const { data: list } = await apiClient.get<{ items: ProyectoListItem[] }>('/proyectos', {
      params: { ...params, limit: 50, q },
    })
    let match = findBySlug(list.items ?? [], needle)

    // Pathauto slugs differ per language — if q returned a single hit, trust it.
    if (!match && (list.items?.length ?? 0) === 1) {
      match = list.items[0]
    }

    if (!match) {
      // Last resort: search in default lang (ES aliases / titles), then load by nid.
      const { data: esList } = await apiClient.get<{ items: ProyectoListItem[] }>('/proyectos', {
        params: { lang: 'es', limit: 50, q },
      })
      match = findBySlug(esList.items ?? [], needle)
      if (!match && (esList.items?.length ?? 0) === 1) {
        match = esList.items[0]
      }
    }

    if (!match) {
      throw err
    }

    const { data } = await apiClient.get<ProyectoDetail>(`/proyectos/${match.id}`, { params })
    return data
  }
}

function findBySlug(items: ProyectoListItem[], needle: string): ProyectoListItem | undefined {
  return items.find((item) => {
    const url = (item.url || '').replace(/\/$/, '').toLowerCase()
    return url.endsWith(`/${needle}`) || url.endsWith(needle)
  })
}
