import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'sonner'

// Single source of truth for the API base URL.
// Reads NEXT_PUBLIC_API_URL (baked in at build time).
// Validates that it's HTTPS in production to prevent mixed-content blocks.
function resolveBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || ''

  if (!url) {
    const errorMsg =
      'NEXT_PUBLIC_API_URL is not set. Add it in Vercel Environment Variables and redeploy.'
    if (typeof window !== 'undefined') {
      toast.error(errorMsg)
    }
    throw new Error(errorMsg)
  }

  // Warn loudly (but don't block) if URL is not HTTPS in browser context
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    url.startsWith('http://')
  ) {
    const errorMsg = `API URL must use HTTPS when served over HTTPS. Got: ${url}`
    toast.error(errorMsg)
    throw new Error(errorMsg)
  }

  // Strip trailing slash to avoid double-slash URLs
  return url.replace(/\/+$/, '')
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor: attach JWT
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

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      const errorMessage =
        (error.response?.data as any)?.detail ||
        (error.response?.data as any)?.error?.message ||
        error.message ||
        'An error occurred'
      toast.error(errorMessage)
    }
    return Promise.reject(error)
  }
)
