import { apiClient } from '../api/client'
import type { HomeSection } from '../types/home'

export interface LandingPayload {
  id: number
  uuid: string
  title: string
  url: string
  es_home: boolean
  sections: HomeSection[]
  seo?: Record<string, unknown>
}

/** GET /api/landings/{slug} — slug or path alias without leading slash (e.g. "proyectos"). */
export async function fetchLanding(
  slug: string,
  lang?: string,
): Promise<LandingPayload | null> {
  try {
    const { data } = await apiClient.get<LandingPayload>(
      `/landings/${encodeURIComponent(slug.replace(/^\//, ''))}`,
      { params: lang ? { lang } : undefined },
    )
    return data
  } catch {
    return null
  }
}

export function landingHeroSection(
  landing: LandingPayload | null,
): Extract<HomeSection, { type: 'hero' }> | null {
  if (!landing?.sections?.length) return null
  const hero = landing.sections.find((s) => s.type === 'hero')
  return hero?.type === 'hero' ? hero : null
}
