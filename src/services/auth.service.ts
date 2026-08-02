import { apiClient } from '../api/client'
import { getApiErrorMessage } from './handleApiError'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

export async function login(payload: LoginPayload) {
  try {
    const { data } = await apiClient.post('/auth/login', payload)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al iniciar sesión'))
  }
}

export async function register(payload: RegisterPayload) {
  try {
    const { data } = await apiClient.post('/auth/register', payload)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al registrar el usuario'))
  }
}
