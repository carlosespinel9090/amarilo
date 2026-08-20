import type { ProyectoDetail as ProyectoDetailType } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { ProyectoDetailLayout, InterestSidebar } from './ProyectoDetailLayout'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyecto-detail.scss'
import '../../styles/layout/proyecto-detail-novis.scss'

type Props = {
  data: ProyectoDetailType
}

export function ProyectoDetailNoVis({ data }: Props) {
  const locale = useLocale()

  return (
    <ProyectoDetailLayout
      data={data}
      className="proyecto-detail--novis"
      showAcabados
      badge={
        <>
          <span className="proyecto-detail__seg-pill proyecto-detail__seg-pill--novis">
            {t(locale, 'badgeNoVis')}
          </span>
          {data.estado ? (
            <span className="proyecto-detail__seg-pill proyecto-detail__seg-pill--outline">
              {data.estado}
            </span>
          ) : null}
        </>
      }
      sidebar={<InterestSidebar />}
    />
  )
}
