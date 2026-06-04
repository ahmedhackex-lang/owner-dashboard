// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  total_revenue: number
  total_transactions: number
  total_products: number
  average_transaction: number
  recent_sales: Array<{
    id: number
    invoice_number: string
    net_amount: number
    payment_method: string
    created_at: string
  }>
  top_products: Array<{
    name: string
    quantity_sold: number
    revenue: number
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) setUser(JSON.parse(userData))

    // Fetch dashboard data
    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://resourceful-presence-production-a383.up.railway.app'

      // Fetch sales data
      const salesRes = await fetch(apiUrl + '/api/sales?limit=10', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      const salesData = await salesRes.json()

      // Fetch products count
      const productsRes = await fetch(apiUrl + '/api/products?limit=1', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      const productsData = await productsRes.json()

      // Fetch dashboard stats
      const statsRes = await fetch(apiUrl + '/api/dashboard/stats', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      const statsData = statsRes.ok ? await statsRes.json() : null

      // Calculate totals
      const sales = salesData.data || []
      const total_revenue = sales.reduce((sum: number, s: any) => sum + Number(s.net_amount), 0)
      const total_transactions = salesData.pagination?.total || sales.length
      const average_transaction = total_transactions > 0 ? total_revenue / total_transactions : 0

      setStats({
        total_revenue,
        total_transactions,
        total_products: productsData.pagination?.total || 0,
        average_transaction,
        recent_sales: sales.slice(0, 5),
        top_products: statsData?.top_products || []
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const formatCurrency = (amount: number) => {
    return 'PKR ' + amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Loading dashboard...</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Fetching data from Railway backend</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>📊 Owner Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b7280' }}>Welcome, <strong style={{ color: '#111827' }}>{user?.full_name || user?.username}</strong></span>
          <button onClick={handleLogout} style={{ background: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '80rem', margin: '0 auto' }}>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
            ⚠️ Error: {error}
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(stats?.total_revenue || 0)}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>All time</div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#16a34a' }}>{stats?.total_transactions || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>Total sales</div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', borderLeft: '4px solid #9333ea' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#9333ea' }}>{stats?.total_products || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>In catalog</div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', borderLeft: '4px solid #ea580c' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Sale</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ea580c' }}>{formatCurrency(stats?.average_transaction || 0)}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>Per transaction</div>
          </div>
        </div>

        {/* Recent Sales */}
        <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>📋 Recent Sales</h2>
          {stats?.recent_sales && stats.recent_sales.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Invoice</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_sales.map((sale: any) => (
                  <tr key={sale.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 500, color: '#111827' }}>{sale.invoice_number}</td>
                    <td style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>{new Date(sale.created_at).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 500 }}>{sale.payment_method}</span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{formatCurrency(Number(sale.net_amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</p>
              <p>No sales yet. Start using your POS to see data here!</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        {stats?.top_products && stats.top_products.length > 0 && (
          <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>🏆 Top Products</h2>
            {stats.top_products.slice(0, 5).map((product: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid #e5e7eb' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{product.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sold: {product.quantity_sold} units</div>
                </div>
                <div style={{ fontWeight: 600, color: '#2563eb' }}>{formatCurrency(product.revenue)}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}