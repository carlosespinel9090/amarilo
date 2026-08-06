import type { HomeLink, ProyectoCard } from './home'

export interface ProyectoDetail extends ProyectoCard {
  destacado: boolean
  descripcion: string | null
  highlights: string[]
  galeria: string[]
  cta_asesor: HomeLink | null
  whatsapp: HomeLink | null
  url_360: string | null
  video_url: string | null
  /** Path aliases per language (e.g. es/en/fr) for the language switcher. */
  urls?: Partial<Record<'es' | 'en' | 'fr', string>>
  relacionados: ProyectoCard[]
  seo?: {
    title?: string | null
    description?: string | null
  }
}
