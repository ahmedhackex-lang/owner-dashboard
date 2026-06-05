import { apiClient } from './api'

export const authService = {
  async login(credentials: any) {
    let payload = { username: '', password: '' }

    // Handle both FormData (from standard HTML forms) and Objects (from React Hook Form)
    if (credentials instanceof FormData) {
      payload.username = credentials.get('username') as string
      payload.password = credentials.get('password') as string
    } else {
      payload.username = credentials.username
      payload.password = credentials.password
    }

    const response = await apiClient.post('/api/auth/login', payload)
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  async logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    try {
      await apiClient.post('/api/auth/logout')
    } catch (e) { /* ignore */ }
    window.location.href = '/login'
  }
}
