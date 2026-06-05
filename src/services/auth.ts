import { apiClient } from './api'

export const authService = {
  async login(credentials: any) {
    const response = await apiClient.post('/api/auth/login', {
      username: credentials.username,
      password: credentials.password
    })
    
    if (response.data.access_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    }
    
    return response.data
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      try {
        await apiClient.post('/api/auth/logout')
      } catch (e) { /* ignore logout errors */ }
      window.location.href = '/login'
    }
  }
}
