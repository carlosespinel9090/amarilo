import { useState, type FormEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import { postLead } from '../../utils/postLead'

type Props = {
  proyectoTitle?: string | null
}

export function CompareLeadForm({ proyectoTitle }: Props) {
  const locale = useLocale()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim() || !email.trim()) return
    setStatus('loading')
    try {
      await postLead({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        origen: 'contacto',
        ...(proyectoTitle ? { proyecto: proyectoTitle } : {}),
      })
      setStatus('ok')
      setNombre('')
      setTelefono('')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="comparador__lead" id="comparador-asesoria">
      <h2 className="comparador__lead-title">{t(locale, 'compareLeadTitle')}</h2>
      {status === 'ok' ? (
        <p className="comparador__lead-msg comparador__lead-msg--ok">{t(locale, 'leadOk')}</p>
      ) : (
        <form className="comparador__lead-form" onSubmit={onSubmit}>
          <label className="comparador__lead-field">
            <span>{t(locale, 'compareLeadNombre')}</span>
            <input
              required
              name="nombre"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>
          <label className="comparador__lead-field">
            <span>{t(locale, 'compareLeadCelular')}</span>
            <input
              required
              type="tel"
              name="telefono"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </label>
          <label className="comparador__lead-field">
            <span>{t(locale, 'compareLeadCorreo')}</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {status === 'error' ? (
            <p className="comparador__lead-msg comparador__lead-msg--error">{t(locale, 'leadError')}</p>
          ) : null}
          <button
            type="submit"
            className="home-btn comparador__lead-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? t(locale, 'loading') : t(locale, 'compareLeadCta')}
          </button>
        </form>
      )}
    </div>
  )
}
