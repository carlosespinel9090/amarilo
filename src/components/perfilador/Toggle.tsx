type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  onLabel?: string
  offLabel?: string
  id?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  onLabel = 'Sí',
  offLabel = 'No',
  id = 'perfilador-toggle',
}: ToggleProps) {
  return (
    <div className="perfilador-toggle">
      <span className="perfilador-toggle__label" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        className={`perfilador-toggle__switch${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="perfilador-toggle__knob" />
        <span className="perfilador-toggle__text">{checked ? onLabel : offLabel}</span>
      </button>
    </div>
  )
}
