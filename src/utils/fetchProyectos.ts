import { apiClient } from '../api/client'
import type { FilterOption, ProyectoCard } from '../types/home'
import type { Locale } from '../i18n/config'
import { type ProyectoListFilters, toApiProyectoParams } from './proyectoFilters'

export interface ProyectosListResponse {
  items: ProyectoCard[]
  pager: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    ciudades: FilterOption[]
    tipos: FilterOption[]
    etapas: FilterOption[]
    presupuestos: FilterOption[]
    segmentos?: FilterOption[]
  }
  lang?: string
}

export async function fetchProyectos(
  filters: ProyectoListFilters = {},
  lang?: Locale,
): Promise<ProyectosListResponse> {
  const params = {
    ...toApiProyectoParams(filters),
    ...(lang ? { lang } : {}),
  }
  const { data } = await apiClient.get<ProyectosListResponse>('/proyectos', { params })
  return data
}
