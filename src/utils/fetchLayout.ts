import { apiClient } from '../api/client'
import type { SiteLayout } from '../types/layout'

export async function fetchLayout(lang?: string): Promise<SiteLayout> {
  const { data } = await apiClient.get<SiteLayout>('/layout', {
    params: lang ? { lang } : undefined,
  })
  return data
}

export function clearLayoutCache() {
  // Hook-level cache lives in useLayout; kept for API symmetry.
}
