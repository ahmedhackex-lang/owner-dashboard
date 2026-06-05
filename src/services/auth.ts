import { apiClient } from './api'

/**
 * Shared logic to normalize credentials
 */
const normalizeCredentials = (credentials: any) => {
  let payload = { username: '', password: '' }
  if (credentials instanceof FormData) {
    payload.username = credentials.get('username') as string
    payload.password = credentials.get('password') as string
  } else {
    payload.username = credentials.username
    payload.password = credentials.password
  }
  return payload
}

/**
 * Named Export: login
 * (Required by /src/app/login/page.tsx)
 */
export const login = async (credentials: any) => {
  const payload = normalizeCredentials(credentials)
  const response = await apiClient.post('/api/auth/login', payload)
  
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }
  return response.data
}

/**
 * Named Export: logout
 */
export const logout = async () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  try {
    await apiClient.post('/api/auth/logout')
  } catch (e) { /* ignore */ }
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * Default Object Export
 */
export const authService = {
  login,
  logout
}
