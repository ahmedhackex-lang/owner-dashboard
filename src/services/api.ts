import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (add auth token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    const errorMessage = (error.response?.data as any)?.error?.message || 'An error occurred'
    toast.error(errorMessage)
    
    return Promise.reject(error)
  }
)