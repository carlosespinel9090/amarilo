import { apiClient } from '../api/client'
import type { PerfiladorSchema } from '../types/perfilador'
import { FALLBACK_PERFILADOR_SCHEMA } from './perfiladorFallback'

export async function fetchPerfiladorSchema(useFallback = true): Promise<PerfiladorSchema> {
  try {
    const { data } = await apiClient.get<PerfiladorSchema>('/perfilador/schema')
    if (data?.steps?.length) return data
    if (useFallback) return FALLBACK_PERFILADOR_SCHEMA
    throw new Error('Schema vacío')
  } catch (err) {
    if (useFallback) return FALLBACK_PERFILADOR_SCHEMA
    throw err
  }
}
