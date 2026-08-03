import type { SVGProps } from 'react'
import data from './projectSteps.data.json'

interface ProjectStepsButton {
  text: string
  href: string
}

interface ProjectStepsData {
  badge: string
  title: string
  description: string
  steps: string[]
  primaryButton: ProjectStepsButton
  secondaryButton: ProjectStepsButton
  image: {
    src: string
    alt: string
  }
}

const projectStepsData = data as ProjectStepsData

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProjectSteps() {
  return (
    <section className="relative overflow-hidden bg-ink px-md py-2xl text-white">

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-xl laptop:grid-cols-2">
        <div className="relative">
          <img
            src={projectStepsData.image.src}
            alt={projectStepsData.image.alt}
            className="relative aspect-[4/3] w-full rounded-xl object-cover shadow-card"
          />
        </div>

        <div>
          <span className="inline-block rounded-xs bg-yellow-light px-md py-sm text-label font-semibold font-sans text-small uppercase tracking-wide text-yellow-dark">
            {projectStepsData.badge}
          </span>

          <h2 className="mt-md text-h1 text-white text-[1.75rem] laptop:text-[1.75rem] font-semibold font-sans">
            {projectStepsData.title}
          </h2>
          <p className="mt-md max-w-(--container-xl) text-[1rem] text-white laptop:text-body-primary">
            {projectStepsData.description}
          </p>

          <ul className="mt-lg flex flex-col gap-sm">
            {projectStepsData.steps.map((step) => (
              <li key={step} className="flex items-center gap-sm">
                <CheckIcon className="h-5 w-5 shrink-0 text-yellow" />
                <span className="text-body-sm text-n-200">{step}</span>
              </li>
            ))}
          </ul>

          <div className="mt-xl flex flex-wrap gap-md">
            <a
              href={projectStepsData.primaryButton.href}
              className="inline-flex h-(--button-height-md) items-center justify-center rounded-pill bg-yellow px-lg font-sans text-body-sm font-bold text-ink transition-colors duration-300 hover:bg-yellow-deep"
            >
              {projectStepsData.primaryButton.text}
            </a>
            <a
              href={projectStepsData.secondaryButton.href}
              className="inline-flex h-(--button-height-md) items-center justify-center rounded-pill bg-white px-lg font-sans text-body-sm font-bold text-ink transition-colors duration-300 hover:bg-n-100"
            >
              {projectStepsData.secondaryButton.text}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
