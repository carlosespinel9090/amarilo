import type { ProyectoDetail as ProyectoDetailType } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { ProyectoDetailLayout, InterestSidebar } from './ProyectoDetailLayout'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyecto-detail.scss'
import '../../styles/layout/proyecto-detail-vis.scss'

type Props = {
  data: ProyectoDetailType
}

export function ProyectoDetailVis({ data }: Props) {
  const locale = useLocale()

  return (
    <ProyectoDetailLayout
      data={data}
      className="proyecto-detail--vis"
      showAcabados
      badge={
        <>
          <span className="proyecto-detail__seg-pill proyecto-detail__seg-pill--vis">
            {t(locale, 'badgeVis')}
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
