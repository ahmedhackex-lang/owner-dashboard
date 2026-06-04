'use client'

import { useState, useEffect } from 'react'

interface SalesData {
  id: string
  invoice_number: string
  cashier_name?: string
  net_amount: number
  payment_method: string
  created_at: string
  is_voided: boolean
}

interface UseSalesOptions {
  limit?: number
}

interface UseSalesReturn {
  data: SalesData[] | null
  isLoading: boolean
  error: Error | null
}

export function useSales({ limit = 50 }: UseSalesOptions): UseSalesReturn {
  const [data, setData] = useState<SalesData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API endpoint
        const response = await fetch(`/api/sales?limit=${limit}`)
        if (!response.ok) {
          throw new Error('Failed to fetch sales')
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSales()
  }, [limit])

  return { data, isLoading, error }
}
