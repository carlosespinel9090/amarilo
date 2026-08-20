import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AmenityGrid } from '../../components/perfilador/AmenityGrid'
import { ChipGroup } from '../../components/perfilador/ChipGroup'
import { ExploreProjects } from '../../components/perfilador/ExploreProjects'
import { LeadSidebar } from '../../components/perfilador/LeadSidebar'
import { MatchCard } from '../../components/perfilador/MatchCard'
import { PreferencePills, type PreferencePill } from '../../components/perfilador/PreferencePills'
import { RangeSlider } from '../../components/perfilador/RangeSlider'
import { StepNav } from '../../components/perfilador/StepNav'
import { Toggle } from '../../components/perfilador/Toggle'
import { useCurrency, type CurrencyCode } from '../../currency/CurrencyContext'
import { useTrm } from '../../hooks/useTrm'
import { useLocale } from '../../i18n/LocaleContext'
import { t } from '../../i18n/ui'
import type {
  PerfiladorField,
  PerfiladorMatchItem,
  PerfiladorPreferences,
  PerfiladorSchema,
} from '../../types/perfilador'
import { fetchPerfiladorMatch } from '../../utils/fetchPerfiladorMatch'
import { fetchPerfiladorSchema } from '../../utils/fetchPerfiladorSchema'
import { formatBudgetAmount } from '../../utils/formatProyecto'
import '../../styles/layout/perfilador.scss'
import '../../styles/layout/home.scss'

const HERO_IMAGE = '/images/proyecto-default.jpg'

function defaultForField(field: PerfiladorField): PerfiladorPreferences[string] {
  switch (field.type) {
    case 'range':
      if (Array.isArray(field.default)) return field.default
      if (typeof field.default === 'number') return [field.min, field.default]
      return [field.min, field.max]
    case 'toggle':
      return field.default ?? false
    case 'select':
      return field.default ?? null
    case 'chips':
    case 'amenity_grid':
      return field.default ?? []
    default:
      return null
  }
}

function buildInitialPreferences(schema: PerfiladorSchema): PerfiladorPreferences {
  const prefs: PerfiladorPreferences = {}
  for (const step of schema.steps) {
    for (const field of step.fields) {
      prefs[field.key] = defaultForField(field)
    }
  }
  return prefs
}

function asIdList(value: PerfiladorPreferences[string]): Array<string | number> {
  if (Array.isArray(value)) return value as Array<string | number>
  if (value == null || value === false) return []
  return [value as string | number]
}

function asRange(
  value: PerfiladorPreferences[string],
  field: Extract<PerfiladorField, { type: 'range' }>,
): [number, number] {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    return [value[0], value[1]]
  }
  return [field.min, field.max]
}

function fieldOptions(field: PerfiladorField, prefs: PerfiladorPreferences) {
  if (field.type !== 'chips' && field.type !== 'amenity_grid' && field.type !== 'select') {
    return []
  }
  if (field.type === 'chips' && field.depends_on) {
    const depIds = asIdList(prefs[field.depends_on]).map(String)
    if (!depIds.length) return field.options
    return field.options.filter((opt) => {
      if (opt.ciudad_id == null) return true
      return depIds.includes(String(opt.ciudad_id))
    })
  }
  return field.options
}

function preferencePills(
  schema: PerfiladorSchema,
  prefs: PerfiladorPreferences,
  currency: CurrencyCode,
  trm: number,
): PreferencePill[] {
  const pills: PreferencePill[] = []
  for (const step of schema.steps) {
    for (const field of step.fields) {
      const val = prefs[field.key]
      if (val == null || val === false || (Array.isArray(val) && val.length === 0)) continue

      if (field.type === 'range') {
        const [lo, hi] = asRange(val, field)
        const fmt =
          field.format === 'currency'
            ? (n: number) => formatBudgetAmount(n, currency, trm)
            : (n: number) => `${n}${field.unit ? ` ${field.unit}` : ''}`
        pills.push({ key: field.key, label: `${field.label}: ${fmt(lo)}–${fmt(hi)}` })
        continue
      }
      if (field.type === 'toggle') {
        if (val === true) pills.push({ key: field.key, label: field.label })
        continue
      }
      if (field.type === 'select') {
        const opt = field.options.find((o) => String(o.id) === String(val))
        if (opt) pills.push({ key: field.key, label: opt.label })
        continue
      }
      if (field.type === 'chips' || field.type === 'amenity_grid') {
        const ids = asIdList(val).map(String)
        const labels = field.options.filter((o) => ids.includes(String(o.id))).map((o) => o.label)
        if (labels.length) {
          const prefix =
            field.key === 'zona' || field.key === 'ciudad'
              ? ''
              : field.key === 'hab' || field.key === 'habitaciones'
                ? `${labels.join(', ')} hab`
                : field.label
          if (field.key === 'zona' || field.key === 'ciudad') {
            pills.push({ key: field.key, label: labels.join(', ') })
          } else if (field.key === 'hab' || field.key === 'habitaciones') {
            pills.push({ key: field.key, label: prefix })
          } else {
            pills.push({ key: field.key, label: `${field.label}: ${labels.join(', ')}` })
          }
        }
      }
    }
  }
  return pills
}

function isCircleChipField(field: PerfiladorField): boolean {
  if (field.type !== 'chips') return false
  const key = field.key.toLowerCase()
  if (key.includes('hab') || key.includes('parqueadero') || key.includes('parking')) return true
  return field.options.every((o) => String(o.label).length <= 3)
}

function partitionStepFields(fields: PerfiladorField[]) {
  const amenityIdx = fields.findIndex((f) => f.type === 'amenity_grid')
  if (amenityIdx === -1) return { left: fields, right: [] as PerfiladorField[] }
  return {
    left: fields.slice(0, amenityIdx),
    right: fields.slice(amenityIdx),
  }
}

function FieldBlock({
  field,
  prefs,
  onChange,
  currency,
  trm,
}: {
  field: PerfiladorField
  prefs: PerfiladorPreferences
  onChange: (key: string, value: PerfiladorPreferences[string]) => void
  currency: CurrencyCode
  trm: number
}) {
  const value = prefs[field.key]

  if (field.type === 'range') {
    const range = asRange(value, field)
    const fmt =
      field.format === 'currency'
        ? (n: number) => formatBudgetAmount(n, currency, trm)
        : (n: number) => `${n}${field.unit ? `${field.unit}` : ''}`
    return (
      <fieldset className="perfilador-field">
        <legend>{field.label}</legend>
        {field.help ? <p className="perfilador-field__help">{field.help}</p> : null}
        <RangeSlider
          min={field.min}
          max={field.max}
          step={field.step}
          value={range}
          onChange={(next) => onChange(field.key, next)}
          formatValue={fmt}
        />
      </fieldset>
    )
  }

  if (field.type === 'toggle') {
    return (
      <fieldset className="perfilador-field perfilador-field--toggle">
        <Toggle
          id={`pf-${field.key}`}
          label={field.label}
          checked={Boolean(value)}
          onChange={(checked) => onChange(field.key, checked)}
          onLabel={field.on_label}
          offLabel={field.off_label}
        />
      </fieldset>
    )
  }

  if (field.type === 'select') {
    const options = fieldOptions(field, prefs)
    return (
      <fieldset className="perfilador-field">
        <legend>{field.label}</legend>
        <div className="perfilador-select-wrap">
          <span className="perfilador-select-wrap__pin" aria-hidden>
            📍
          </span>
          <select
            className="perfilador-select"
            value={value == null ? '' : String(value)}
            onChange={(e) => onChange(field.key, e.target.value || null)}
          >
            <option value="">{field.placeholder || 'Selecciona'}</option>
            {options.map((opt) => (
              <option key={String(opt.id)} value={String(opt.id)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
    )
  }

  if (field.type === 'chips') {
    const options = fieldOptions(field, prefs)
    const circle = isCircleChipField(field)
    return (
      <fieldset className="perfilador-field">
        <legend>{field.label}</legend>
        <ChipGroup
          label={field.label}
          options={options}
          multiple={field.multiple !== false}
          value={asIdList(value)}
          onChange={(next) => onChange(field.key, next)}
          variant={circle ? 'circle' : 'default'}
        />
      </fieldset>
    )
  }

  if (field.type === 'amenity_grid') {
    return (
      <fieldset className="perfilador-field">
        <legend>{field.label}</legend>
        <AmenityGrid
          label={field.label}
          options={field.options}
          value={asIdList(value)}
          onChange={(next) => onChange(field.key, next)}
        />
      </fieldset>
    )
  }

  return null
}

export function Perfilador() {
  const locale = useLocale()
  const { currency } = useCurrency()
  const { trm } = useTrm()
  const [searchParams, setSearchParams] = useSearchParams()
  const pasoParam = Number(searchParams.get('paso') || '1')
  const paso = Number.isFinite(pasoParam) && pasoParam >= 1 && pasoParam <= 3 ? pasoParam : 1

  const [schema, setSchema] = useState<PerfiladorSchema | null>(null)
  const [prefs, setPrefs] = useState<PerfiladorPreferences>({})
  const [totalAvailable, setTotalAvailable] = useState<number | null>(null)
  const [matches, setMatches] = useState<PerfiladorMatchItem[]>([])
  const [loadingSchema, setLoadingSchema] = useState(true)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoadingSchema(true)
    fetchPerfiladorSchema(true)
      .then((data) => {
        if (!mounted) return
        setSchema(data)
        setPrefs(buildInitialPreferences(data))
      })
      .finally(() => {
        if (mounted) setLoadingSchema(false)
      })
    return () => {
      mounted = false
    }
  }, [locale])

  const setPaso = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('paso', String(next))
          return p
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const updatePref = useCallback((key: string, value: PerfiladorPreferences[string]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'ciudad' && 'zona' in prev) {
        next.zona = []
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!schema || paso >= 3) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      fetchPerfiladorMatch({ preferences: prefs, preview: true })
        .then((res) => {
          if (!cancelled) setTotalAvailable(res.total_available)
        })
        .catch(() => {
          if (!cancelled) setTotalAvailable(null)
        })
    }, 280)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [schema, prefs, paso])

  useEffect(() => {
    if (!schema || paso !== 3) return
    let cancelled = false
    setLoadingMatch(true)
    setMatchError(null)
    fetchPerfiladorMatch({ preferences: prefs, preview: false })
      .then((res) => {
        if (cancelled) return
        setMatches(res.items ?? [])
        setTotalAvailable(res.total_available)
      })
      .catch(() => {
        if (cancelled) return
        setMatches([])
        setMatchError(t(locale, 'perfiladorMatchError'))
      })
      .finally(() => {
        if (!cancelled) setLoadingMatch(false)
      })
    return () => {
      cancelled = true
    }
  }, [schema, paso, prefs, locale])

  const copy = schema?.copy ?? {}
  const step = schema?.steps.find((s) => s.id === paso) ?? schema?.steps[paso - 1]
  const pills = useMemo(
    () => (schema ? preferencePills(schema, prefs, currency, trm) : []),
    [schema, prefs, currency, trm],
  )
  const stepTotal = Math.min(3, schema?.steps.length ?? 3)

  const counterText = useMemo(() => {
    if (totalAvailable == null) return null
    const template =
      paso === 2
        ? copy.counter_label || '{n} proyectos encontrados con tus amenidades deseadas'
        : copy.counter_label || '{n} proyectos disponibles según tus preferencias'
    return template.replace('{n}', String(totalAvailable))
  }, [totalAvailable, copy.counter_label, paso])

  const step2Parts = useMemo(() => {
    if (!step || paso !== 2) return null
    return partitionStepFields(step.fields)
  }, [step, paso])

  if (loadingSchema || !schema) {
    return (
      <div className="perfilador">
        <div className="home-container perfilador__loading">
          <p>{t(locale, 'loading')}</p>
        </div>
      </div>
    )
  }

  const heroTitle = copy.banner_title || 'Tenemos el lugar perfecto para ti'
  const heroSub =
    copy.banner_text ||
    'Responde unas preguntas y te mostraremos los proyectos que mejor se adaptan a lo que buscas.'
  const resultsTitle = copy.results_title || '¡Estos lugares son perfectos para ti!'
  const resultsSub =
    step?.subtitle ||
    'Seleccionamos las mejores opciones según tus preferencias — conócelos y elige tu favorito.'

  return (
    <div className={`perfilador${paso === 3 ? ' perfilador--results' : ''}`}>
      {paso < 3 ? (
        <header className="perfilador__hero">
          <div
            className="perfilador__hero-bg"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            aria-hidden
          />
          <div className="perfilador__hero-overlay" aria-hidden />
          <div className="home-container perfilador__hero-content">
            <h1 className="perfilador__hero-title">{heroTitle}</h1>
            <p className="perfilador__hero-sub">{heroSub}</p>
            <div className="perfilador__hero-dots" aria-hidden>
              <span className="is-active" />
              <span />
              <span />
            </div>
          </div>
        </header>
      ) : null}

      <div className="perfilador__stage">
        <div className="home-container">
          {paso < 3 && step ? (
            <>
              <div className="perfilador__card">
                <header className="perfilador__card-head">
                  <h2 className="perfilador__card-title">{step.title}</h2>
                  {step.subtitle ? <p className="perfilador__card-sub">{step.subtitle}</p> : null}
                </header>

                {paso === 1 ? (
                  <div className="perfilador__fields">
                    {step.fields.map((field) => (
                      <FieldBlock
                        key={field.key}
                        field={field}
                        prefs={prefs}
                        onChange={updatePref}
                        currency={currency}
                        trm={trm}
                      />
                    ))}
                    {counterText ? (
                      <p className="perfilador__counter">
                        <span aria-hidden>✓</span> {counterText}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {paso === 2 && step2Parts ? (
                  <div className="perfilador__cols">
                    <div className="perfilador__col">
                      <h3 className="perfilador__col-title">
                        <span aria-hidden>🏙</span> Tipo de inmueble
                      </h3>
                      {step2Parts.left.map((field) => (
                        <FieldBlock
                          key={field.key}
                          field={field}
                          prefs={prefs}
                          onChange={updatePref}
                          currency={currency}
                          trm={trm}
                        />
                      ))}
                    </div>
                    <div className="perfilador__col">
                      <h3 className="perfilador__col-title">
                        <span aria-hidden>♡</span> Amenidades deseadas
                      </h3>
                      {step2Parts.right.map((field) => (
                        <FieldBlock
                          key={field.key}
                          field={field}
                          prefs={prefs}
                          onChange={updatePref}
                          currency={currency}
                          trm={trm}
                        />
                      ))}
                      {counterText ? (
                        <p className="perfilador__counter">
                          <span aria-hidden>✓</span> {counterText}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="perfilador__nav-card">
                <StepNav
                  current={paso}
                  total={stepTotal}
                  showBack={paso > 1}
                  onBack={() => setPaso(Math.max(1, paso - 1))}
                  onContinue={() => setPaso(Math.min(3, paso + 1))}
                  onSkip={() => setPaso(3)}
                  backLabel={copy.back_label || 'Volver'}
                  continueLabel={copy.continue_label || 'Continuar'}
                />
              </div>
            </>
          ) : null}

          {paso === 3 ? (
            <div className="perfilador__results-wrap">
              <header className="perfilador__results-head">
                <h1 className="perfilador__results-title">{resultsTitle}</h1>
                <p className="perfilador__results-sub">{resultsSub}</p>
                <PreferencePills
                  items={pills}
                  onRemove={(key) => {
                    const field = schema.steps.flatMap((s) => s.fields).find((f) => f.key === key)
                    if (!field) return
                    updatePref(key, defaultForField(field))
                  }}
                />
              </header>

              <div className="perfilador__body--split">
                <div className="perfilador__results">
                  {loadingMatch ? <p>{t(locale, 'loading')}</p> : null}
                  {matchError ? <p className="perfilador__error">{matchError}</p> : null}
                  {!loadingMatch && !matchError && matches.length === 0 ? (
                    <p className="perfilador__empty">{copy.results_empty || t(locale, 'perfiladorEmpty')}</p>
                  ) : null}
                  <div className="perfilador__match-list">
                    {matches.map((item) => (
                      <MatchCard
                        key={item.proyecto.uuid || item.proyecto.id}
                        item={item}
                        matchLabel={copy.match_label || 'match!'}
                        viewLabel="Ver detalles"
                        scheduleLabel="Agendar visita"
                      />
                    ))}
                  </div>
                  {matches.length > 0 ? (
                    <button type="button" className="perfilador__more" disabled>
                      Ver más ↓
                    </button>
                  ) : null}
                  <div className="perfilador__results-back">
                    <button
                      type="button"
                      className="perfilador-stepnav__back"
                      onClick={() => setPaso(2)}
                    >
                      « {copy.back_label || 'Volver'}
                    </button>
                  </div>
                </div>

                <LeadSidebar
                  title={copy.lead_title ?? undefined}
                  text={copy.lead_text ?? undefined}
                  whatsappLabel={copy.lead_whatsapp ?? undefined}
                  nombreLabel="Nombre completo"
                  telefonoLabel="Celular / WhatsApp"
                  downloadLabel={copy.download_pdf ?? undefined}
                  okMessage={t(locale, 'leadOk')}
                  errorMessage={t(locale, 'leadError')}
                  loadingLabel={t(locale, 'loading')}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ExploreProjects title={paso === 3 ? 'Explora otras opciones' : 'Explora más proyectos'} />
    </div>
  )
}
