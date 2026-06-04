'use client';

import { useState, useEffect } from 'react';
import { salesService } from '@/services/sales';
import { Sale } from '@/types/models';

function formatCurrency(value: number) {
  return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const PAYMENT_STYLES: Record<string, string> = {
  Cash: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  Card: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Online: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  Credit: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};

type FilterType = 'all' | 'Cash' | 'Card' | 'Online' | 'Credit';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showVoided, setShowVoided] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await salesService.getSales({ limit: 200 });
        setSales(data);
      } catch (err) {
        setError('Failed to load sales. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = sales.filter((s) => {
    if (!showVoided && s.is_voided) return false;
    if (filter !== 'all' && s.payment_method !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.invoice_number.toLowerCase().includes(q) ||
        (s.cashier_name ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalNet = filtered.filter((s) => !s.is_voided).reduce((sum, s) => sum + s.net_amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.filter((s) => !s.is_voided).length} transactions · {formatCurrency(totalNet)} net
          </p>
        </div>
        <input
          type="text"
          placeholder="Search invoice or cashier…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'Cash', 'Card', 'Online', 'Credit'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {f === 'all' ? 'All Methods' : f}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showVoided}
            onChange={(e) => setShowVoided(e.target.checked)}
            className="rounded"
          />
          Show voided
        </label>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
          Loading sales…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Invoice</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Cashier</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Payment</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Total</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Discount</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Net</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      No sales found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`hover:bg-gray-50 transition-colors ${sale.is_voided ? 'opacity-50' : ''}`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{sale.invoice_number}</td>
                      <td className="px-5 py-3 text-gray-700">{sale.cashier_name ?? `#${sale.cashier_id}`}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(sale.created_at)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STYLES[sale.payment_method] ?? 'bg-gray-100 text-gray-600'}`}>
                          {sale.payment_method}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatCurrency(sale.total_amount)}</td>
                      <td className="px-5 py-3 text-right text-gray-500">
                        {sale.discount > 0 ? `-${formatCurrency(sale.discount)}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatCurrency(sale.net_amount)}</td>
                      <td className="px-5 py-3">
                        {sale.is_voided ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 ring-1 ring-red-200">
                            Voided
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
