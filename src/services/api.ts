import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://resourceful-presence-production-a383.up.railway.app'

export const apiClient = axios.create({
  baseURL: API_URL.replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    
    // Parse FastAPI error messages (handles strings or detail arrays)
    let errorMessage = 'An unexpected error occurred'
    const data = error.response?.data as any
    
    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail[0].msg || data.detail[0]
      } else {
        errorMessage = data.detail
      }
    }

    if (typeof window !== 'undefined') {
      toast.error(String(errorMessage))
    }
    
    return Promise.reject(error)
  }
)
