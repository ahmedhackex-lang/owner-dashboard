import { apiClient } from './api'
import { Sale } from '@/types/models'

export const salesService = {
  async getSales(params?: { skip?: number; limit?: number }) {
    const response = await apiClient.get('/api/sales', { params })
    return response.data
  },

  async getSaleById(id: number) {
    const response = await apiClient.get(`/api/sales/${id}`)
    return response.data
  }
}