'use client'

import { useSales } from '@/hooks/useSales'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function SalesPage() {
  const { data: sales, isLoading } = useSales({ limit: 50 })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Sales History</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Sales History</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales?.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                  <TableCell>{sale.cashier_name || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(sale.net_amount)}</TableCell>
                  <TableCell>{sale.payment_method}</TableCell>
                  <TableCell>{formatDateTime(sale.created_at)}</TableCell>
                  <TableCell>
                    {sale.is_voided ? (
                      <Badge variant="destructive">Voided</Badge>
                    ) : (
                      <Badge variant="default">Completed</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}