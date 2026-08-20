import { apiClient } from '../api/client'

export type TrmPayload = {
  currency_pair: string
  valor: number
  fecha: string | null
  source?: string
  lang?: string
}

export async function fetchTrm(): Promise<TrmPayload> {
  const { data } = await apiClient.get<TrmPayload>('/trm')
  return data
}
