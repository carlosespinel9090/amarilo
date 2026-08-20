export interface HomeLink {
  title: string
  url: string
}

export interface FilterOption {
  id: number | string
  name: string
}

export interface ProyectoPrecio {
  currency_default: 'COP' | string
  mode: 'trm' | 'manual' | string
  cop: number | null
  usd: number | null
  trm: number | null
  trm_date: string | null
}

export interface ProyectoCard {
  id: number
  uuid: string
  title: string
  url: string
  /** @deprecated Prefer `precio.cop` — kept for API/FE compat. */
  precio_desde: string | number | null
  precio?: ProyectoPrecio | null
  ciudad: string | null
  zona?: string | null
  estado: string | null
  segmentos: string[]
  amenities: string[]
  area_m2: number | null
  hab_min: number | null
  hab_max: number | null
  banos: number | null
  torres?: number | null
  unidades?: number | null
  parqueadero?: string | null
  image_url: string | null
  variant: 'default' | 'premium' | string
}

export interface ArticleCard {
  id: number
  uuid: string
  title: string
  url: string
  summary: string
  created: number
  image_url: string | null
}

/** Hero background slide: muted video (no controls) or image. */
export interface HeroSlide {
  type: 'video' | 'image'
  url: string
  poster_url?: string | null
}

export type HomeSection =
  | {
      type: 'hero'
      data: {
        badge: string
        title: string
        subtitle: string
        search_cta: HomeLink | null
        /** Legacy single image; used when `slides` is empty. */
        image_url: string | null
        slides?: HeroSlide[]
      }
    }
  | { type: 'kpi_strip'; data: { title: string; items: Array<{ value: string; label: string }> } }
  | {
      type: 'ref_proyectos'
      data: {
        badge: string
        title: string
        text: string
        link: HomeLink | null
        items: ProyectoCard[]
      }
    }
  | {
      type: 'ref_proyectos_ciudad'
      data: { badge: string; title: string; text: string; items: ProyectoCard[] }
    }
  | {
      type: 'beneficios'
      data: {
        badge: string
        title: string
        text: string
        cards: Array<{
          title: string
          text: string
          link: HomeLink | null
          icon_url: string | null
        }>
        items: string[]
      }
    }
  | {
      type: 'asistente_split'
      data: {
        badge: string
        title: string
        text: string
        bullets: string[]
        primary: HomeLink | null
        secondary: HomeLink | null
        image_url: string | null
      }
    }
  | {
      type: 'split_cards'
      data: {
        title: string
        cards: Array<{ title: string; text: string; link: HomeLink | null; variant: string }>
      }
    }
  | {
      type: 'explora_necesidad'
      data: {
        badge: string
        title: string
        text: string
        routes: Array<{
          badge: string
          title: string
          text: string
          link: HomeLink | null
          image_url: string | null
        }>
      }
    }
  | {
      type: 'financiacion_split'
      data: {
        badge: string
        title: string
        text: string
        bullets: string[]
        link: HomeLink | null
        image_url: string | null
        reversed: boolean
      }
    }
  | {
      type: 'ref_articulos'
      data: { badge: string; title: string; link: HomeLink | null; items: ArticleCard[] }
    }
  | {
      type: 'texto_cta'
      data: {
        badge: string
        title: string
        text: string
        primary: HomeLink | null
        secondary: HomeLink | null
      }
    }

export interface HomePayload {
  lang?: string
  available_languages?: string[]
  sections: HomeSection[]
  filters: {
    ciudades: FilterOption[]
    tipos: FilterOption[]
    etapas: FilterOption[]
    presupuestos: FilterOption[]
  }
}
