import { useState, useEffect } from 'react'

interface SalesData {
  id: string
  invoice_number: string
  cashier_name: string
  net_amount: number
  payment_method: string
  created_at: string
  is_voided: boolean
}

interface UseSalesProps {
  limit?: number
}

export function useSales({ limit = 50 }: UseSalesProps) {
  const [data, setData] = useState<SalesData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true)
        // Replace with your actual API endpoint
        const response = await fetch(`/api/sales?limit=${limit}`)
        if (!response.ok) throw new Error('Failed to fetch sales')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData([]) // Empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchSales()
  }, [limit])

  return { data, isLoading, error }
}
