import { useEffect, useState } from 'react'
import { fetchFooter } from '../../utils/fetchFooter'
import '../../styles/layout/footer.scss'

interface FooterItem {
  title: string
  url: string
}

function toFooterItems(data: unknown): FooterItem[] {
  const menu = (data as { footer?: { menu?: unknown[] } })?.footer?.menu

  if (!Array.isArray(menu)) return []

  return menu.map((item) => {
    const entry = item as {
      texto_enlace?: string
      enlace?: string | { url?: string }
    }

    return {
      title: entry.texto_enlace ?? 'Sin título',
      url:
        typeof entry.enlace === 'string'
          ? entry.enlace
          : (entry.enlace?.url ?? '#'),
    }
  })
}

export function Footer() {
  const [items, setItems] = useState<FooterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    fetchFooter()
      .then((data) => {
        if (isMounted) setItems(toFooterItems(data))
      })
      .catch(() => {
        if (isMounted) setError('No se pudieron cargar los datos del footer')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) return null

  if (error) {
    return <div className="footer-error">{error}</div>
  }

  return (
    <footer className="footer">
      <ul className="footer-list">
        {items.map((item) => (
          <li key={item.url} className="footer-item">
            <a href={item.url}>{item.title}</a>
          </li>
        ))}
      </ul>
    </footer>
  )
}
