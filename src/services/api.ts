import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'

// Fallback to your railway URL if env is missing, but ensure it's HTTPS
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://resourceful-presence-production-a383.up.railway.app'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (add auth token)
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
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    
    const errorMessage = (error.response?.data as any)?.detail || (error.response?.data as any)?.error?.message || 'An error occurred'
    
    // Only show toast if we are in the browser
    if (typeof window !== 'undefined') {
      toast.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)
