import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser()
    }
    return Promise.reject(error)
  }
)

export default api