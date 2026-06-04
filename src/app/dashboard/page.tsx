// FILE: src/app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://resourceful-presence-production-a383.up.railway.app').replace('http://', 'https://')

function formatCurrency(value: number) {
  return '₨' + Math.round(value).toLocaleString('en-PK')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

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

const PAYMENT_COLORS: Record<string, string> = {
  Cash: '#dcfce7',
  Card: '#dbeafe',
  Online: '#ede9fe',
  Credit: '#ffedd5',
}
const PAYMENT_TEXT: Record<string, string> = {
  Cash: '#15803d',
  Card: '#1e40af',
  Online: '#6d28d9',
  Credit: '#c2410c',
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
    if (!token) { router.push('/login'); return }
    if (userData) setUser(JSON.parse(userData))
    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const headers = { 'Authorization': 'Bearer ' + token }

      const [salesRes, productsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/sales?limit=10`, { headers }),
        fetch(`${API_URL}/api/products?limit=1`, { headers }),
        fetch(`${API_URL}/api/dashboard/stats`, { headers }),
      ])

      if (salesRes.status === 401) { router.push('/login'); return }

      const salesData = await salesRes.json()
      const productsData = productsRes.ok ? await productsRes.json() : {}
      const statsData = statsRes.ok ? await statsRes.json() : null

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
        top_products: statsData?.top_products || [],
      })
    } catch (err: any) {
      setError('Connection error. Check your internet and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}>Loading dashboard…</div>
        <div style={{ fontSize: '0.875rem' }}>Connecting to backend</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Owner Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Welcome, <strong style={{ color: '#111827' }}>{user?.full_name || user?.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{ background: '#dc2626', color: 'white', padding: '0.4rem 0.9rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '80rem', margin: '0 auto' }}>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Revenue', value: formatCurrency(stats?.total_revenue || 0), sub: 'All time', color: '#2563eb' },
            { label: 'Transactions', value: (stats?.total_transactions || 0).toLocaleString(), sub: 'Total sales', color: '#16a34a' },
            { label: 'Products', value: (stats?.total_products || 0).toString(), sub: 'In catalog', color: '#9333ea' },
            { label: 'Avg. Sale', value: formatCurrency(stats?.average_transaction || 0), sub: 'Per transaction', color: '#ea580c' },
          ].map((card) => (
            <div key={card.label} style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.25rem', borderLeft: `4px solid ${card.color}` }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{card.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Recent Sales */}
        <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Recent Sales</h2>
          {stats?.recent_sales && stats.recent_sales.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Invoice', 'Date', 'Payment', 'Amount'].map(h => (
                      <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: h === 'Amount' ? 'right' : 'left', color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_sales.map((sale) => (
                    <tr key={sale.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#374151' }}>{sale.invoice_number}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(sale.created_at)}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ background: PAYMENT_COLORS[sale.payment_method] || '#f3f4f6', color: PAYMENT_TEXT[sale.payment_method] || '#374151', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 500 }}>
                          {sale.payment_method}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{formatCurrency(Number(sale.net_amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>
              No sales yet. Start using your POS to see data here.
            </div>
          )}
        </div>

        {/* Top Products */}
        {stats?.top_products && stats.top_products.length > 0 && (
          <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Top Products</h2>
            {stats.top_products.slice(0, 5).map((product, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500, color: '#111827', fontSize: '0.875rem' }}>{product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{product.quantity_sold} units sold</div>
                </div>
                <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.875rem' }}>{formatCurrency(product.revenue)}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
