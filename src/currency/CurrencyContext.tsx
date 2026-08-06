import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type CurrencyCode = 'COP' | 'USD'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'COP',
  setCurrency: () => undefined,
})

const STORAGE_KEY = 'amarilo_currency'

function readStored(): CurrencyCode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'USD' || raw === 'COP') return raw
  } catch {
    /* ignore */
  }
  return 'COP'
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    typeof window !== 'undefined' ? readStored() : 'COP',
  )

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext)
}
