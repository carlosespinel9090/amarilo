export interface LayoutLink {
  title: string
  url: string
}

export interface LayoutSocial {
  network: string
  url: string
}

export interface LayoutColumn {
  title: string
  links: LayoutLink[]
}

export interface SiteLayout {
  lang?: string
  available_languages?: string[]
  utility: LayoutLink[]
  header: {
    logo_alt: string
    logo_url: string | null
    menu: LayoutLink[]
    cta: LayoutLink
  }
  footer: {
    brand: {
      title: string
      tagline: string
      social: LayoutSocial[]
    }
    columns: LayoutColumn[]
    copyright: string
    legal: LayoutLink[]
  }
}
