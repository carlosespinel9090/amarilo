import { apiClient } from '../api/client'
import type { SiteLayout } from '../types/layout'

export async function fetchLayout(): Promise<SiteLayout> {
  const { data } = await apiClient.get<SiteLayout>('/layout')
  return data
}
