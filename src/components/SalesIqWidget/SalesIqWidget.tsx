import { useEffect } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import type { Locale } from '../../i18n/config'

declare global {
  interface Window {
    $zoho?: {
      salesiq?: {
        ready?: (...args: unknown[]) => void
        language?: (code: string) => void
        [key: string]: unknown
      }
    }
  }
}

/** SalesIQ codes align with site locales es/en/fr. */
function salesIqLang(locale: Locale): string {
  return locale
}

/**
 * Zoho SalesIQ live-chat widget. Loads once when VITE_SALESIQ_WIDGET_CODE is set.
 * Language follows the current site locale.
 */
export function SalesIqWidget() {
  const locale = useLocale()

  useEffect(() => {
    const wc = import.meta.env.VITE_SALESIQ_WIDGET_CODE?.trim()
    if (!wc) return

    window.$zoho = window.$zoho || {}
    const prevReady = window.$zoho.salesiq?.ready
    window.$zoho.salesiq = window.$zoho.salesiq || {}
    window.$zoho.salesiq.ready = function salesIqReady() {
      if (typeof prevReady === 'function') {
        try {
          prevReady()
        } catch {
          /* ignore prior ready errors */
        }
      }
      window.$zoho?.salesiq?.language?.(salesIqLang(locale))
    }

    if (!document.getElementById('zsiqscript')) {
      const script = document.createElement('script')
      script.id = 'zsiqscript'
      script.defer = true
      script.src = `https://salesiq.zohopublic.com/widget?wc=${encodeURIComponent(wc)}`
      document.body.appendChild(script)
    } else {
      window.$zoho.salesiq.language?.(salesIqLang(locale))
    }
  }, [locale])

  return null
}
