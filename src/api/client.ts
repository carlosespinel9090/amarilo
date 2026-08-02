import axios from 'axios'
import { store } from '../store'
import { logout } from '../store/authSlice'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token ?? import.meta.env.VITE_JWT_TOKEN

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token expirado o inválido: limpiamos la sesión;
      // una ruta privada que lea isAuthenticated redirige sola al login
      store.dispatch(logout())
    }

    return Promise.reject(error)
  },
)
