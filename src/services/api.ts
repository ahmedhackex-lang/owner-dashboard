import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'

/**
 * 2026 Production API Configuration
 * Forces HTTPS to prevent Mixed Content errors
 */

// 1. Get the URL from environment
let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://resourceful-presence-production-a383.up.railway.app'

// 2. FORCE HTTPS and Remove Trailing Slashes
const API_URL = rawUrl.replace('http://', 'https://').replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for secure cookie/session handling
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    
    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    
    // Detailed error logging for debugging
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data)

    const errorMessage = (error.response?.data as any)?.detail || 'Connection error. Check your internet.'
    
    if (typeof window !== 'undefined') {
      toast.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)
