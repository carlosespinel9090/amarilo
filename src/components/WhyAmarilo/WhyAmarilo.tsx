import type { ReactElement, SVGProps } from 'react'
import data from './whyAmarilo.data.json'

type IconName = 'card' | 'shield' | 'device'

interface WhyAmariloItem {
  icon: IconName
  title: string
  description: string
  linkText: string
  linkHref: string
}

interface WhyAmariloData {
  badge: string
  title: string
  description: string
  items: WhyAmariloItem[]
}

const whyAmariloData = data as WhyAmariloData

function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeviceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M11 18h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const icons: Record<
  IconName,
  (props: SVGProps<SVGSVGElement>) => ReactElement
> = {
  card: CardIcon,
  shield: ShieldIcon,
  device: DeviceIcon,
}

export function WhyAmarilo() {
  return (
    <section className="bg-ink px-md py-2xl text-white">
      <div className="mx-auto max-w-6xl">
        <span className="inline-block rounded-pill bg-yellow px-md py-xs text-label font-bold uppercase tracking-wide text-ink">
          {whyAmariloData.badge}
        </span>

        <h2 className="mt-md text-h2 font-bold">{whyAmariloData.title}</h2>
        <p className="mt-sm max-w-(--container-md) text-body text-n-300">
          {whyAmariloData.description}
        </p>

        <div className="mt-xl grid grid-cols-1 gap-lg md:grid-cols-3">
          {whyAmariloData.items.map((item) => {
            const Icon = icons[item.icon]

            return (
              <div
                key={item.title}
                className="rounded-xl bg-white p-lg text-ink shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow">
                  <Icon className="h-6 w-6 text-ink" />
                </div>

                <h3 className="mt-md text-h4 font-semibold font-sans">{item.title}</h3>
                <p className="mt-xs text-body-sm text-n-500">
                  {item.description}
                </p>

                <a
                  href={item.linkHref}
                  className="mt-md inline-flex items-center gap-xs text-label font-bold text-ink hover:underline"
                >
                  {item.linkText} →
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
