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

export type ProyectoLayout = 'vis' | 'novis' | 'premium'

export interface ProyectoTipologia {
  nombre: string
  area_m2: number | null
  habitaciones: number | null
  banos: number | null
  precio_cop: number | null
  image_url: string | null
  cta_label: string | null
}

export interface ProyectoPoi {
  nombre: string
  tipo: string | null
  minutos: number | null
  texto: string | null
}

export interface ProyectoUbicacionDetalle {
  lat: number | null
  lng: number | null
  como_llegar: string | null
  pois: ProyectoPoi[]
}

export interface ProyectoAmenidadRich {
  titulo: string
  descripcion: string | null
  image_url: string | null
  icon: string | null
}

export interface ProyectoAvance {
  fecha: string | null
  titulo: string
  image_url: string | null
  images?: string[]
  porcentaje: number | null
}

export interface ProyectoTestimonio {
  quote: string
  autor: string | null
  subtitulo: string | null
  image_url: string | null
  rating: number | null
}

export interface ProyectoAsesor {
  nombre: string
  cargo: string | null
  image_url: string | null
  links: HomeLink[]
}

export interface ProyectoTourEscena {
  title: string
  url: string
}

export interface ProyectoDetail extends ProyectoCard {
  destacado: boolean
  layout?: ProyectoLayout | string | null
  area_m2_privada?: number | null
  area_m2_construida?: number | null
  logo_url?: string | null
  como_llegar?: string | null
  ubicacion_detalle?: ProyectoUbicacionDetalle | null
  tipologias?: ProyectoTipologia[]
  amenidades_rich?: ProyectoAmenidadRich[]
  avances?: ProyectoAvance[]
  testimonios?: ProyectoTestimonio[]
  asesor?: ProyectoAsesor | null
  tour_escenas?: ProyectoTourEscena[]
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
