import type { HomeLink, ProyectoCard } from './home'

export interface ProyectoPlano {
  title: string
  image_url: string
}

export interface ProyectoBanner {
  title: string
  url: string | null
  image_url: string | null
}

export interface ProyectoDetail extends ProyectoCard {
  destacado: boolean
  logo_url?: string | null
  como_llegar?: string | null
  torres?: number | null
  unidades?: number | null
  parqueadero?: string | null
  descripcion: string | null
  highlights: string[]
  galeria: string[]
  planos?: ProyectoPlano[]
  avances_obra?: string[]
  banner?: ProyectoBanner | null
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
