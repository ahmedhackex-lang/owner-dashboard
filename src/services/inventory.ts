import { apiClient } from './api'
import { Product } from '@/types/models'

export const inventoryService = {
  async getProducts(params?: { skip?: number; limit?: number; search?: string }) {
    const response = await apiClient.get('/api/products', { params })
    return response.data
  },

  async getProductByBarcode(barcode: string) {
    const response = await apiClient.get(`/api/products/${barcode}`)
    return response.data
  }
}