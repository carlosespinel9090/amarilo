/** Imagen por defecto cuando el CMS no trae foto/galería. */
export const DEFAULT_PROYECTO_IMAGE = '/images/proyecto-default.jpg'

export function proyectoImageUrl(url: string | null | undefined): string {
  return url && url.trim() ? url : DEFAULT_PROYECTO_IMAGE
}

/** Galería usable: CMS + card; si vacío, una imagen default. */
export function proyectoGalleryImages(input: {
  image_url?: string | null
  galeria?: string[] | null
}): string[] {
  const imgs: string[] = []
  for (const src of input.galeria ?? []) {
    if (src && !imgs.includes(src)) imgs.push(src)
  }
  if (input.image_url && !imgs.includes(input.image_url)) {
    imgs.unshift(input.image_url)
  }
  return imgs.length ? imgs : [DEFAULT_PROYECTO_IMAGE]
}
