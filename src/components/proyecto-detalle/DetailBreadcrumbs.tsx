import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { localizedPath } from '../../i18n/config'
import { pathFor } from '../../i18n/paths'
import { t } from '../../i18n/ui'

type Props = {
  title: string
}

export function DetailBreadcrumbs({ title }: Props) {
  const locale = useLocale()
  return (
    <nav className="proyecto-detail__crumbs" aria-label="Breadcrumb">
      <Link to={localizedPath('/', locale)}>{t(locale, 'crumbHome')}</Link>
      <span aria-hidden>›</span>
      <Link to={pathFor('proyectos', locale)}>{t(locale, 'crumbProyectos')}</Link>
      <span aria-hidden>›</span>
      <span>{title}</span>
    </nav>
  )
}
