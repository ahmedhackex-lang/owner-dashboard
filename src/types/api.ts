export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}