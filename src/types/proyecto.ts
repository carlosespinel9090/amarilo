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
  relacionados: ProyectoCard[]
  seo?: {
    title?: string | null
    description?: string | null
  }
}
