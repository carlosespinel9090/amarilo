import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProyectoDetail as ProyectoDetailType } from '../../types/proyecto'
import { proyectoGalleryImages } from '../../utils/proyectoImage'
import {
  AsesorCard,
  availableDetailTabs,
  DetailBreadcrumbs,
  DetailGallery,
  DetailHeroMeta,
  DetailTabPanel,
  DetailTabs,
  type DetailTabId,
  HeroInterestCard,
  SimilarProjects,
  StickyContactBar,
  Testimonials,
} from '../../components/proyecto-detalle'

type Props = {
  data: ProyectoDetailType
  className: string
  badge: ReactNode
  sidebar: ReactNode
  showAcabados?: boolean
}

export function ProyectoDetailLayout({
  data,
  className,
  badge,
  sidebar,
  showAcabados = false,
}: Props) {
  const [activeImage, setActiveImage] = useState(0)
  const tabs = useMemo(() => availableDetailTabs(data), [data])
  const [activeTab, setActiveTab] = useState<DetailTabId>(tabs[0] ?? 'resumen')
  const contactBarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (tabs.length && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0])
    }
  }, [tabs, activeTab])

  useEffect(() => {
    const el = contactBarRef.current
    if (!el) return

    const sync = () => {
      document.documentElement.style.setProperty(
        '--proyecto-contact-bar-height',
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      )
    }

    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--proyecto-contact-bar-height')
    }
  }, [data])

  const images = useMemo(() => proyectoGalleryImages(data), [data])
  const contactUrl = data.cta_asesor?.url || '/contacto'
  const whatsappUrl = data.whatsapp?.url || null

  return (
    <div className={`proyecto-detail ${className}`.trim()}>
      <div className="proyecto-detail__pin">
        <div className="proyecto-detail__pin-inner home-container">
          <DetailBreadcrumbs title={data.title} />
          <DetailHeroMeta data={data} badge={badge} sidebar={sidebar} />
        </div>
      </div>

      <DetailGallery
        title={data.title}
        images={images}
        activeImage={activeImage}
        onActiveImage={setActiveImage}
      />

      <StickyContactBar
        contactUrl={contactUrl}
        whatsappUrl={whatsappUrl}
        barRef={contactBarRef}
      />

      <div className="proyecto-detail__body home-container">
        {tabs.length ? (
          <section className="proyecto-detail__section proyecto-detail__tabs-section">
            <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            <DetailTabPanel data={data} active={activeTab} showAcabados={showAcabados} />
          </section>
        ) : null}

        <Testimonials items={data.testimonios} />
        <SimilarProjects items={data.relacionados} />
      </div>
    </div>
  )
}

export function InterestSidebar() {
  return <HeroInterestCard />
}

export function PremiumSidebar({ data }: { data: ProyectoDetailType }) {
  return <AsesorCard asesor={data.asesor} />
}
