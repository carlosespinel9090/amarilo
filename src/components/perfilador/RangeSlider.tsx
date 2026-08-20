type RangeSliderProps = {
  min: number
  max: number
  step: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (n: number) => string
  ariaLabelMin?: string
  ariaLabelMax?: string
}

export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatValue = String,
  ariaLabelMin = 'Mínimo',
  ariaLabelMax = 'Máximo',
}: RangeSliderProps) {
  const [lo, hi] = value
  const span = max - min || 1
  const left = ((lo - min) / span) * 100
  const right = ((hi - min) / span) * 100
  const pillLeft = Math.min(92, Math.max(8, (left + right) / 2))

  const setLo = (raw: number) => {
    const next = Math.min(raw, hi)
    onChange([next, hi])
  }
  const setHi = (raw: number) => {
    const next = Math.max(raw, lo)
    onChange([lo, next])
  }

  return (
    <div className="perfilador-range">
      <div className="perfilador-range__track-wrap">
        <div
          className="perfilador-range__pill"
          style={{ left: `${pillLeft}%` }}
          aria-hidden
        >
          {formatValue(lo)} – {formatValue(hi)}
        </div>
        <div className="perfilador-range__track" />
        <div
          className="perfilador-range__fill"
          style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }}
        />
        <input
          type="range"
          className="perfilador-range__input perfilador-range__input--lo"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={ariaLabelMin}
          onChange={(e) => setLo(Number(e.target.value))}
        />
        <input
          type="range"
          className="perfilador-range__input perfilador-range__input--hi"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={ariaLabelMax}
          onChange={(e) => setHi(Number(e.target.value))}
        />
      </div>
      <div className="perfilador-range__bounds">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}
