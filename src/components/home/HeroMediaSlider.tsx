import { useEffect, useMemo, useRef, useState } from 'react'
import type { HeroSlide } from '../../types/home'

const ROTATE_MS = 7000

function resolveSlides(
  slides: HeroSlide[] | undefined,
  imageUrl: string | null,
): HeroSlide[] {
  if (slides?.length) {
    return slides.filter((s) => s.url)
  }
  if (imageUrl) {
    return [{ type: 'image', url: imageUrl }]
  }
  return []
}

export function HeroMediaSlider({
  slides: slidesProp,
  imageUrl,
}: {
  slides?: HeroSlide[]
  imageUrl: string | null
}) {
  const slides = useMemo(
    () => resolveSlides(slidesProp, imageUrl),
    [slidesProp, imageUrl],
  )
  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setIndex(0)
  }, [slides])

  const active = slides[index] ?? null
  const multi = slides.length > 1

  useEffect(() => {
    if (!multi || reducedMotion) return
    if (active?.type === 'video') return

    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [multi, reducedMotion, active?.type, slides.length])

  useEffect(() => {
    const el = videoRef.current
    if (!el || active?.type !== 'video') return
    if (reducedMotion) {
      el.pause()
      return
    }
    el.muted = true
    const play = el.play()
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        /* autoplay may be blocked */
      })
    }
  }, [active, index, reducedMotion])

  const onVideoEnded = () => {
    if (!multi || reducedMotion) return
    setIndex((i) => (i + 1) % slides.length)
  }

  return (
    <div className="home-hero__slider" aria-hidden={slides.length === 0}>
      {active?.type === 'video' ? (
        <video
          key={`v-${active.url}-${index}`}
          ref={videoRef}
          className="home-hero__media"
          src={active.url}
          poster={active.poster_url || undefined}
          autoPlay={!reducedMotion}
          muted
          loop={!multi}
          playsInline
          controls={false}
          onEnded={onVideoEnded}
        />
      ) : active?.type === 'image' ? (
        <img
          key={`i-${active.url}-${index}`}
          className="home-hero__media"
          src={active.url}
          alt=""
        />
      ) : null}

      {multi ? (
        <div className="home-hero__dots" role="tablist" aria-label="Slides">
          {slides.map((slide, i) => (
            <button
              key={`${slide.type}-${slide.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              className={`home-hero__dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
