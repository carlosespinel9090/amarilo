import type { ProyectoDetail } from '../../types/proyecto'
import type { DetailTabId } from './detailTabUtils'
import { TabAmenidades } from './TabAmenidades'
import { TabAvances } from './TabAvances'
import { TabResumen } from './TabResumen'
import { TabTipologias } from './TabTipologias'
import { TabTour360 } from './TabTour360'
import { TabUbicacion } from './TabUbicacion'

type Props = {
  data: ProyectoDetail
  active: DetailTabId
  showAcabados?: boolean
}

export function DetailTabPanel({ data, active, showAcabados = false }: Props) {
  switch (active) {
    case 'resumen':
      return <TabResumen data={data} showAcabados={showAcabados} />
    case 'tipologias':
      return <TabTipologias data={data} />
    case 'ubicacion':
      return <TabUbicacion data={data} />
    case 'amenidades':
      return <TabAmenidades data={data} />
    case 'tour':
      return <TabTour360 data={data} />
    case 'avances':
      return <TabAvances data={data} />
    default:
      return null
  }
}
