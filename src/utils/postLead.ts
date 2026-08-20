import { apiClient } from '../api/client'

export async function postLead(payload: {
  nombre: string
  email: string
  telefono?: string
  origen?: string
  proyecto?: string
}): Promise<{ message: string; id?: string; uuid?: string }> {
  const { data } = await apiClient.post<{ message: string; id?: string; uuid?: string }>(
    '/leads',
    payload,
  )
  return data
}
