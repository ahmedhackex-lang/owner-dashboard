// FILE: src/app/inventory/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventory';
import { Product } from '@/types/models';

type StockStatus = 'all' | 'ok' | 'low' | 'out';

function getStockStatus(product: Product): StockStatus {
  if (product.stock_quantity === 0) return 'out';
  if (product.stock_quantity <= product.reorder_alert_level) return 'low';
  return 'ok';
}

function formatPKR(value: number) {
  return '₨' + Math.round(value).toLocaleString('en-PK');
}

const STATUS_STYLES: Record<string, string> = {
  ok:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  low: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  out: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};
const STATUS_LABELS: Record<string, string> = {
  ok: 'In Stock', low: 'Low Stock', out: 'Out of Stock',
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockStatus>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await inventoryService.getProducts({ limit: 200 });
        setProducts(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        setError('Failed to load inventory. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? '').toLowerCase().includes(search.toLowerCase());
    const status = getStockStatus(p);
    return matchesSearch && (filter === 'all' || status === filter) && p.is_active;
  });

  const counts = {
    all: products.filter((p) => p.is_active).length,
    ok:  products.filter((p) => p.is_active && getStockStatus(p) === 'ok').length,
    low: products.filter((p) => p.is_active && getStockStatus(p) === 'low').length,
    out: products.filter((p) => p.is_active && getStockStatus(p) === 'out').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.all} active products</p>
        </div>
        <input
          type="text"
          placeholder="Search name, barcode, category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'ok', 'low', 'out'] as StockStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading inventory…</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Barcode</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Brand</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Cost</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Retail</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No products match your search.</td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.barcode}</td>
                        <td className="px-4 py-3 text-gray-500">{product.category}</td>
                        <td className="px-4 py-3 text-gray-500">{product.brand ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatPKR(product.cost_price)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPKR(product.retail_price)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${status === 'out' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-gray-900'}`}>
                            {product.stock_quantity}
                          </span>
                          <span className="text-gray-400 text-xs ml-1">/ {product.reorder_alert_level} min</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
                            {STATUS_LABELS[status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
