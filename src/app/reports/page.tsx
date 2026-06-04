'use client';

import { useState, useEffect } from 'react';
import { salesService } from '@/services/sales';
import { dashboardService } from '@/services/dashboard';
import { Sale, DashboardStats } from '@/types/models';

function formatCurrency(value: number) {
  return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const PAYMENT_STYLES: Record<string, string> = {
  Cash: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  Card: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Online: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  Credit: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [salesData, statsData] = await Promise.all([
          salesService.getSales({ limit: 200 }),
          dashboardService.getStats(),
        ]);
        setSales(salesData);
        setStats(statsData);
      } catch (err) {
        setError('Failed to load report data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeSales = sales.filter((s) => !s.is_voided);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Sales performance overview</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
          Loading report data…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.total_revenue)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_transactions.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Transaction</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.average_transaction)}</p>
            </div>
          </div>

          {/* Top Products */}
          {stats.top_products.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Top Products</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-50 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">Product</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600">Units Sold</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.top_products.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{p.quantity_sold}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Sales */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Recent Sales</h2>
              <span className="text-xs text-gray-400">{activeSales.length} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">Invoice</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">Cashier</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">Payment</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600">Discount</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                        No sales data available.
                      </td>
                    </tr>
                  ) : (
                    activeSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">{sale.invoice_number}</td>
                        <td className="px-5 py-3 text-gray-700">{sale.cashier_name ?? `#${sale.cashier_id}`}</td>
                        <td className="px-5 py-3 text-gray-500">{formatDate(sale.created_at)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STYLES[sale.payment_method] ?? 'bg-gray-100 text-gray-600'}`}>
                            {sale.payment_method}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500">
                          {sale.discount > 0 ? `-${formatCurrency(sale.discount)}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(sale.net_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
