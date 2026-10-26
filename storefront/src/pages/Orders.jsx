import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { getMyOrders } from '../api/orders'

export default function Orders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: getMyOrders,
  })

  const orders = data?.orders ?? []

  return (
    <AppShell>
      <PageHeader title="My orders" />

      <div className="px-4 md:mx-auto md:max-w-2xl">
        {isLoading ? <p className="py-12 text-center text-ink-300">Loading…</p> : null}
        {isError ? (
          <p className="py-12 text-center text-chili-500">Couldn't load your orders.</p>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-chili-50 text-chili-300">
              <Receipt className="h-9 w-9" strokeWidth={1.5} />
            </div>
            <h2 className="mt-5 font-display text-lg font-semibold text-ink-900">
              No orders yet
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Once you place an order, you'll be able to track it here.
            </p>
            <Link to="/">
              <Button className="mt-5">Browse the menu</Button>
            </Link>
          </div>
        ) : null}

        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-ink-900">Order #{order.id}</p>
                  <p className="text-sm text-ink-500">
                    {new Date(order.order_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink-900">
                    ₹{Number(order.total_amount).toFixed(0)}
                  </p>
                  <Badge tone={toneForStatus(order.status)} className="mt-1">
                    {formatStatusLabel(order.status)}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
