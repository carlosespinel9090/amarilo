import axios from 'axios'
import { apiClient } from '../api/client'
import type { ProyectoDetail } from '../types/proyecto'
import type { Locale } from '../i18n/config'

type ProyectoListItem = { id: number; url: string; title?: string }

/**
 * id = nid, uuid o slug (reserva-del-parque).
 * Si el BE aún no resuelve slug (p. ej. Pantheon sin el fix), cae al listado y reintenta por nid.
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

    const { data: list } = await apiClient.get<{ items: ProyectoListItem[] }>('/proyectos', {
      params: { ...params, limit: 50, q: id.replace(/-/g, ' ') },
    })
    const needle = id.toLowerCase()
    const match = (list.items ?? []).find((item) => {
      const url = (item.url || '').replace(/\/$/, '').toLowerCase()
      return url.endsWith(`/${needle}`) || url.endsWith(needle)
    })
    if (!match) {
      throw err
    }

    const { data } = await apiClient.get<ProyectoDetail>(`/proyectos/${match.id}`, { params })
    return data
  }
}
