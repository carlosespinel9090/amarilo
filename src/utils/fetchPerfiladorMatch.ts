import { apiClient } from '../api/client'
import type { PerfiladorMatchRequest, PerfiladorMatchResponse } from '../types/perfilador'

export async function fetchPerfiladorMatch(
  body: PerfiladorMatchRequest,
): Promise<PerfiladorMatchResponse> {
  const { data } = await apiClient.post<PerfiladorMatchResponse>('/perfilador/match', body)
  return data
}
