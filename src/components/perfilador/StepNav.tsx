type StepNavProps = {
  current: number
  total: number
  onBack?: () => void
  onContinue?: () => void
  onSkip?: () => void
  backLabel?: string
  continueLabel?: string
  skipLabel?: string
  showBack?: boolean
}

export function StepNav({
  current,
  total,
  onBack,
  onContinue,
  onSkip,
  backLabel = 'Volver',
  continueLabel = 'Continuar',
  skipLabel = 'Omitir por ahora',
  showBack = true,
}: StepNavProps) {
  return (
    <nav className="perfilador-stepnav" aria-label="Navegación del perfilador">
      <div className="perfilador-stepnav__left">
        {showBack ? (
          <button type="button" className="perfilador-stepnav__back" onClick={onBack}>
            « {backLabel}
          </button>
        ) : (
          <span className="perfilador-stepnav__back-spacer" />
        )}
      </div>

      <div className="perfilador-stepnav__center" aria-live="polite">
        <span className="perfilador-stepnav__label">
          Paso {current} de {total}
        </span>
        <ol className="perfilador-stepnav__dots">
          {Array.from({ length: total }, (_, i) => {
            const step = i + 1
            const active = step === current
            const done = step < current
            return (
              <li
                key={step}
                className={`perfilador-stepnav__dot${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                aria-current={active ? 'step' : undefined}
              />
            )
          })}
        </ol>
      </div>

      <div className="perfilador-stepnav__right">
        <button type="button" className="home-btn perfilador-stepnav__continue" onClick={onContinue}>
          {continueLabel} »
        </button>
        {onSkip ? (
          <button type="button" className="perfilador-stepnav__skip" onClick={onSkip}>
            {skipLabel}
          </button>
        ) : null}
      </div>
    </nav>
  )
}
