import { apiClient } from '../api/client'

export const fetchFooter = async () => {
  const { data } = await apiClient.get('/footer')
  return data
}
