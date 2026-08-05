import { useLocale } from '../i18n/LocaleContext'
import { t } from '../i18n/ui'

export function About() {
  const locale = useLocale()
  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {t(locale, 'about')}
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        React 19 + TypeScript + Vite + Tailwind + axios + react-router-dom.
      </p>
    </div>
  )
}
