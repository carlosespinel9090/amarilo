import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { postLead } from '../../utils/postLead'
import { useLocale } from '../../i18n/LocaleContext'
import { pathFor } from '../../i18n/paths'

type LeadSidebarProps = {
  title?: string
  text?: string
  whatsappLabel?: string
  whatsappUrl?: string | null
  nombreLabel?: string
  telefonoLabel?: string
  checkboxLabel?: string
  contactNote?: string
  downloadLabel?: string
  viewAllLabel?: string
  okMessage?: string
  errorMessage?: string
  loadingLabel?: string
}

export function LeadSidebar({
  title = 'Guarda tus recomendaciones',
  text = 'Recibe alertas de nuevos proyectos que coincidan con tu perfil.',
  whatsappLabel = 'Escribir por WhatsApp',
  whatsappUrl = null,
  nombreLabel = 'Nombre completo',
  telefonoLabel = 'Celular / WhatsApp',
  checkboxLabel = 'Acepto recibir información de proyectos por WhatsApp.',
  contactNote = 'Te contactaremos en menos de 24h',
  downloadLabel = 'Descargar PDF',
  viewAllLabel = 'Ver todos los proyectos',
  okMessage = 'Gracias. Te contactaremos pronto.',
  errorMessage = 'No se pudo enviar. Intenta de nuevo.',
  loadingLabel = 'Cargando…',
}: LeadSidebarProps) {
  const locale = useLocale()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [whatsappOk, setWhatsappOk] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim()) return
    setStatus('loading')
    try {
      await postLead({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        origen: 'perfilador',
      })
      setStatus('ok')
      if (whatsappUrl && whatsappOk) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      }
      setNombre('')
      setTelefono('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <aside className="perfilador-lead">
      <h2 className="perfilador-lead__title">{title}</h2>
      {text ? <p className="perfilador-lead__text">{text}</p> : null}

      {status === 'ok' ? (
        <p className="perfilador-lead__ok">{okMessage}</p>
      ) : (
        <form className="perfilador-lead__form" onSubmit={onSubmit}>
          <label>
            <span>{nombreLabel}</span>
            <input
              required
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label>
            <span>{telefonoLabel}</span>
            <input
              required
              type="tel"
              name="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              autoComplete="tel"
            />
          </label>
          <label className="perfilador-lead__check">
            <input
              type="checkbox"
              checked={whatsappOk}
              onChange={(e) => setWhatsappOk(e.target.checked)}
            />
            <span>{checkboxLabel}</span>
          </label>
          {status === 'error' ? <p className="perfilador-lead__error">{errorMessage}</p> : null}
          <button
            type="submit"
            className="perfilador-lead__wa"
            disabled={status === 'loading'}
          >
            <span className="perfilador-lead__wa-icon" aria-hidden>
              ✆
            </span>
            {status === 'loading' ? loadingLabel : whatsappLabel}
          </button>
          <p className="perfilador-lead__note">{contactNote}</p>
        </form>
      )}

      <div className="perfilador-lead__links">
        <button type="button" className="perfilador-lead__link" disabled title="Próximamente">
          {downloadLabel}
        </button>
        <Link className="perfilador-lead__link" to={pathFor('proyectos', locale)}>
          {viewAllLabel}
        </Link>
      </div>
    </aside>
  )
}
