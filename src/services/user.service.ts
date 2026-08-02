import { apiClient } from '../api/client'
import { getApiErrorMessage } from './handleApiError'

interface CreateUserPayload {
  name: string
  email: string
}

interface UpdateUserPayload {
  name?: string
  email?: string
}

export async function createUser(payload: CreateUserPayload) {
  try {
    const { data } = await apiClient.post('/users', payload)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al crear el usuario'))
  }
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  try {
    const { data } = await apiClient.post(`/users/${id}/update`, payload)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al actualizar el usuario'))
  }
}
