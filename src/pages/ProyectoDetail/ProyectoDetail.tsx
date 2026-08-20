import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProyecto } from '../../utils/fetchProyecto'
import type { ProyectoDetail as ProyectoDetailType } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { useAlternateUrls } from '../../i18n/AlternateUrlsContext'
import { localizedPath } from '../../i18n/config'
import { t } from '../../i18n/ui'
import { resolveLayout } from './resolveLayout'
import { ProyectoDetailVis } from './ProyectoDetailVis'
import { ProyectoDetailNoVis } from './ProyectoDetailNoVis'
import { ProyectoDetailPremium } from './ProyectoDetailPremium'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyecto-detail.scss'

export function ProyectoDetail() {
  const locale = useLocale()
  const { setUrls: setAlternateUrls } = useAlternateUrls()
  const { slug = '' } = useParams<{ slug: string }>()
  const [data, setData] = useState<ProyectoDetailType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setData(null)
    setError(null)
    setAlternateUrls(null)
    if (!slug) {
      setError(t(locale, 'proyectoError'))
      return
    }
    fetchProyecto(slug, locale)
      .then((payload) => {
        if (!mounted) return
        setData(payload)
        if (payload.urls) {
          setAlternateUrls(payload.urls)
        }
      })
      .catch(() => {
        if (mounted) setError(t(locale, 'proyectoError'))
      })
    return () => {
      mounted = false
      setAlternateUrls(null)
    }
  }, [slug, locale, setAlternateUrls])

  if (error) {
    return (
      <div className="home-container proyecto-detail__state">
        <p>{error}</p>
        <Link to={localizedPath('/', locale)}>{t(locale, 'volverHome')}</Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="home-container proyecto-detail__state">
        <p>{t(locale, 'loading')}</p>
      </div>
    )
  }

  const layout = resolveLayout(data)
  if (layout === 'premium') return <ProyectoDetailPremium data={data} />
  if (layout === 'vis') return <ProyectoDetailVis data={data} />
  return <ProyectoDetailNoVis data={data} />
}
