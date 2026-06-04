import { apiClient } from './api'
import { User } from '@/types/models'

export const authService = {
  async login(username: string, password: string) {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    const { access_token, user } = response.data
    
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    
    return { access_token, user }
  },

  async logout() {
    await apiClient.post('/api/auth/logout')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }
}