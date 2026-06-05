import { apiClient } from './api'

export const authService = {
  /**
   * Login using JSON instead of Form Data
   */
  async login(credentials: any) {
    // credentials should be { username, password }
    const response = await apiClient.post('/api/auth/login', {
      username: credentials.username || credentials.get?.('username'),
      password: credentials.password || credentials.get?.('password')
    })
    
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
    } catch (e) {
      // Ignore logout errors
    }
    window.location.href = '/login'
  }
}
