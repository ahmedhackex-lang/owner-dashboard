import { apiClient } from './api'
import { DashboardStats } from '@/types/models'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/api/dashboard/stats')
    return response.data
  }
}