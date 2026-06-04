export interface User {
  id: number
  username: string
  full_name: string
  role: 'cashier' | 'admin' | 'owner' | 'developer'
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface Product {
  id: number
  barcode: string
  name: string
  category: string
  brand?: string
  cost_price: number
  retail_price: number
  stock_quantity: number
  reorder_alert_level: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Sale {
  id: number
  invoice_number: string
  cashier_id: number
  cashier_name?: string
  total_amount: number
  discount: number
  net_amount: number
  payment_method: 'Cash' | 'Card' | 'Online' | 'Credit'
  is_voided: boolean
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: number
  product_name: string
  quantity: number
  retail_price_at_sale: number
  cost_price_at_sale: number
  subtotal: number
}

export interface DashboardStats {
  total_revenue: number
  total_transactions: number
  average_transaction: number
  top_products: Array<{
    name: string
    quantity_sold: number
    revenue: number
  }>
}