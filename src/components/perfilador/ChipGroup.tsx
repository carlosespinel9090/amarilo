import type { PerfiladorOption } from '../../types/perfilador'

type ChipGroupProps = {
  options: PerfiladorOption[]
  value: Array<string | number>
  onChange: (value: Array<string | number>) => void
  multiple?: boolean
  label?: string
  /** `circle` for habitaciones / parqueaderos style. */
  variant?: 'default' | 'circle'
}

export function ChipGroup({
  options,
  value,
  onChange,
  multiple = true,
  label,
  variant = 'default',
}: ChipGroupProps) {
  const selected = new Set(value.map(String))

  const toggle = (id: string | number) => {
    const key = String(id)
    if (multiple) {
      if (selected.has(key)) {
        onChange(value.filter((v) => String(v) !== key))
      } else {
        onChange([...value, id])
      }
      return
    }
    onChange(selected.has(key) ? [] : [id])
  }

  return (
    <div
      className={`perfilador-chips${variant === 'circle' ? ' perfilador-chips--circle' : ''}`}
      role="group"
      aria-label={label}
    >
      {options.map((opt) => {
        const active = selected.has(String(opt.id))
        return (
          <button
            key={String(opt.id)}
            type="button"
            className={`perfilador-chip${variant === 'circle' ? ' perfilador-chip--circle' : ''}${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => toggle(opt.id)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
