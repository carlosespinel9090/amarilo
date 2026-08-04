import { apiClient } from '../api/client'
import type { HomePayload } from '../types/home'

export async function fetchHome(): Promise<HomePayload> {
  const { data } = await apiClient.get<HomePayload>('/home')
  return data
}
