export type PreferencePill = {
  key: string
  label: string
}

type PreferencePillsProps = {
  items: PreferencePill[]
  title?: string
  onRemove?: (key: string) => void
}

export function PreferencePills({ items, title, onRemove }: PreferencePillsProps) {
  if (!items.length) return null
  return (
    <div className="perfilador-pills">
      {title ? <h3 className="perfilador-pills__title">{title}</h3> : null}
      <ul className="perfilador-pills__list">
        {items.map((item) => (
          <li key={item.key} className="perfilador-pill">
            <span>{item.label}</span>
            {onRemove ? (
              <button
                type="button"
                className="perfilador-pill__remove"
                aria-label={`Quitar ${item.label}`}
                onClick={() => onRemove(item.key)}
              >
                ×
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
