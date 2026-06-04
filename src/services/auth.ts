import { apiClient } from './api'

export const authService = {
  async login(credentials: FormData) {
    // Note: FastAPI OAuth2 uses Form Data
    const response = await apiClient.post('/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  async logout() {
    const response = await apiClient.post('/api/auth/logout')
    return response.data
  }
}
