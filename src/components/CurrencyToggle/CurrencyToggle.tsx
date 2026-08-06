import { useCurrency, type CurrencyCode } from '../../currency/CurrencyContext'
import './CurrencyToggle.scss'

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="currency-toggle" role="group" aria-label="Moneda">
      {(['COP', 'USD'] as CurrencyCode[]).map((code) => (
        <button
          key={code}
          type="button"
          className={`currency-toggle__btn${currency === code ? ' is-active' : ''}`}
          aria-pressed={currency === code}
          onClick={() => setCurrency(code)}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
