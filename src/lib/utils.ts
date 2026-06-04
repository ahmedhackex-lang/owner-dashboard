// src/lib/utils.ts
// PURE TYPESCRIPT - NO JSX ALLOWED

export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return 'PKR ' + amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}