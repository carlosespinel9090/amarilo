import type { PerfiladorOption } from '../../types/perfilador'

type AmenityGridProps = {
  options: PerfiladorOption[]
  value: Array<string | number>
  onChange: (value: Array<string | number>) => void
  label?: string
}

function AmenityIcon({ label, icon }: { label: string; icon?: string | null }) {
  if (icon) {
    return <img className="perfilador-amenity__img" src={icon} alt="" />
  }
  const key = label.toLowerCase()
  let glyph = '★'
  if (key.includes('piscina') || key.includes('pool')) glyph = '◈'
  else if (key.includes('gim') || key.includes('gym')) glyph = '✦'
  else if (key.includes('pet') || key.includes('mascota')) glyph = '♡'
  else if (key.includes('seguridad') || key.includes('security')) glyph = '⬡'
  else if (key.includes('verde') || key.includes('green')) glyph = '❀'
  else if (key.includes('bbq') || key.includes('asado')) glyph = '▣'
  else if (key.includes('cowork') || key.includes('salon') || key.includes('salón')) glyph = '⌂'
  return (
    <span className="perfilador-amenity__glyph" aria-hidden>
      {glyph}
    </span>
  )
}

export function AmenityGrid({ options, value, onChange, label }: AmenityGridProps) {
  const selected = new Set(value.map(String))

  const toggle = (id: string | number) => {
    const key = String(id)
    if (selected.has(key)) {
      onChange(value.filter((v) => String(v) !== key))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="perfilador-amenities" role="group" aria-label={label}>
      {options.map((opt) => {
        const active = selected.has(String(opt.id))
        return (
          <button
            key={String(opt.id)}
            type="button"
            className={`perfilador-amenity${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => toggle(opt.id)}
          >
            <AmenityIcon label={opt.label} icon={opt.icon} />
            <span className="perfilador-amenity__label">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
