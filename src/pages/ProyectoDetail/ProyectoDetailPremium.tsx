import type { ProyectoDetail as ProyectoDetailType } from '../../types/proyecto'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { ProyectoDetailLayout, PremiumSidebar } from './ProyectoDetailLayout'
import '../../styles/layout/home.scss'
import '../../styles/layout/proyecto-detail.scss'
import '../../styles/layout/proyecto-detail-premium.scss'

type Props = {
  data: ProyectoDetailType
}

export function ProyectoDetailPremium({ data }: Props) {
  const locale = useLocale()

  return (
    <ProyectoDetailLayout
      data={data}
      className="proyecto-detail--premium"
      showAcabados
      badge={
        <>
          <span className="proyecto-detail__seg-pill proyecto-detail__seg-pill--premium">
            {t(locale, 'badgeProyectoPremium')}
          </span>
          {data.estado ? (
            <span className="proyecto-detail__seg-pill proyecto-detail__seg-pill--outline">
              {data.estado}
            </span>
          ) : null}
        </>
      }
      sidebar={<PremiumSidebar data={data} />}
    />
  )
}
