import type { ProyectoCard } from './home'

export type PerfiladorFieldType = 'range' | 'toggle' | 'select' | 'chips' | 'amenity_grid'

export interface PerfiladorOption {
  id: string | number
  label: string
  icon?: string | null
  /** For zone chips filtered by city. */
  ciudad_id?: string | number | null
}

export interface PerfiladorFieldBase {
  key: string
  type: PerfiladorFieldType
  label: string
  help?: string | null
  required?: boolean
}

export interface PerfiladorRangeField extends PerfiladorFieldBase {
  type: 'range'
  min: number
  max: number
  step: number
  unit?: string | null
  format?: 'currency' | 'number' | string
  default?: [number, number] | number
}

export interface PerfiladorToggleField extends PerfiladorFieldBase {
  type: 'toggle'
  default?: boolean
  on_label?: string
  off_label?: string
}

export interface PerfiladorSelectField extends PerfiladorFieldBase {
  type: 'select'
  options: PerfiladorOption[]
  default?: string | number | null
  placeholder?: string | null
}

export interface PerfiladorChipsField extends PerfiladorFieldBase {
  type: 'chips'
  options: PerfiladorOption[]
  multiple?: boolean
  default?: Array<string | number>
  /** When set, options are filtered by this preference key (e.g. ciudad). */
  depends_on?: string | null
}

export interface PerfiladorAmenityGridField extends PerfiladorFieldBase {
  type: 'amenity_grid'
  options: PerfiladorOption[]
  default?: Array<string | number>
}

export type PerfiladorField =
  | PerfiladorRangeField
  | PerfiladorToggleField
  | PerfiladorSelectField
  | PerfiladorChipsField
  | PerfiladorAmenityGridField

export interface PerfiladorStep {
  id: number
  key: string
  title: string
  subtitle?: string | null
  fields: PerfiladorField[]
}

export interface PerfiladorCopy {
  banner_title?: string | null
  banner_text?: string | null
  continue_label?: string | null
  back_label?: string | null
  results_title?: string | null
  results_empty?: string | null
  counter_label?: string | null
  lead_title?: string | null
  lead_text?: string | null
  lead_submit?: string | null
  lead_whatsapp?: string | null
  download_pdf?: string | null
  favorite_label?: string | null
  match_label?: string | null
  preferences_title?: string | null
}

export interface PerfiladorSchema {
  steps: PerfiladorStep[]
  copy: PerfiladorCopy
  lang?: string
}

export type PerfiladorPreferences = Record<
  string,
  boolean | number | string | Array<string | number> | [number, number] | null | undefined
>

export interface PerfiladorMatchItem {
  proyecto: ProyectoCard
  score: number
  matched: number
  total: number
  matched_keys: string[]
}

export interface PerfiladorMatchResponse {
  items: PerfiladorMatchItem[]
  total_available: number
  preferences_echo?: PerfiladorPreferences
}

export interface PerfiladorMatchRequest {
  preferences: PerfiladorPreferences
  preview?: boolean
}
