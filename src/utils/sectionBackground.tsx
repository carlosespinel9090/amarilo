import type { CSSProperties, ReactNode } from 'react'
import type { SectionBackground } from '../../types/home'

export function sectionHasBackground(bg?: SectionBackground | null): boolean {
  if (!bg?.mode) return false
  if (bg.mode === 'color') return Boolean(bg.color)
  if (bg.mode === 'image') return Boolean(bg.image_url)
  if (bg.mode === 'video') return Boolean(bg.video_url)
  return false
}

/** Inline styles for color/image backgrounds (video uses a layer element). */
export function sectionBackgroundStyle(bg?: SectionBackground | null): CSSProperties | undefined {
  if (!sectionHasBackground(bg) || !bg) return undefined
  if (bg.mode === 'color' && bg.color) {
    return { background: bg.color }
  }
  if (bg.mode === 'image' && bg.image_url) {
    const safe = bg.image_url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    return {
      background: `center / cover no-repeat url("${safe}")`,
    }
  }
  if (bg.mode === 'video') {
    return { backgroundColor: '#161616' }
  }
  return undefined
}

export function SectionBackgroundMedia({ bg }: { bg?: SectionBackground | null }): ReactNode {
  if (!bg || bg.mode !== 'video' || !bg.video_url) return null
  return (
    <video
      className="home-section__bg-video"
      src={bg.video_url}
      poster={bg.poster_url || undefined}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
    />
  )
}

export function sectionBackgroundClassName(bg?: SectionBackground | null): string {
  return sectionHasBackground(bg) ? 'home-section--has-bg' : ''
}
