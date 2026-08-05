import { apiClient } from '../api/client'
import type { HomePayload } from '../types/home'

export async function fetchHome(lang?: string): Promise<HomePayload> {
  const { data } = await apiClient.get<HomePayload>('/home', {
    params: lang ? { lang } : undefined,
  })
  return data
}
