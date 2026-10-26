import { useNavigate } from 'react-router-dom'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { useCursorList } from '../hooks/useCursorList'
import { listOrders } from '../api/orders'

export default function Orders() {
  const { items: orders, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCursorList({ queryKey: ['orders'], queryFn: listOrders, itemsKey: 'orders' })

  const navigate = useNavigate();

  return (
    <DashboardShell>
      <PageHeader title="Orders" description="All customer orders." />

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-200 text-ink-500">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
         

<tbody className="divide-y divide-cream-100">
  {orders.map((order) => (
    <tr
      key={order.id}
      onClick={() => navigate(`/orders/${order.id}`)}
      className="cursor-pointer hover:bg-cream-50 transition-colors"
    >
      <td className="px-5 py-3 font-medium text-chili-500">
        #{order.id}
      </td>

      <td className="px-5 py-3 text-ink-900">
        {order.customer_name}
      </td>

      <td className="px-5 py-3 text-ink-700">
        {new Date(order.order_date).toLocaleDateString("en-IN")}
      </td>

      <td className="px-5 py-3 font-medium text-ink-900">
        ₹{Number(order.total_amount).toFixed(0)}
      </td>

      <td className="px-5 py-3">
        <Badge tone={toneForStatus(order.status)}>
          {formatStatusLabel(order.status)}
        </Badge>
      </td>
    </tr>
  ))}
</tbody>
        </table>

        {isLoading ? <p className="p-6 text-center text-ink-300">Loading…</p> : null}
        {isError ? <p className="p-6 text-center text-chili-500">Couldn't load orders.</p> : null}
        {!isLoading && orders.length === 0 ? (
          <p className="p-6 text-center text-ink-300">No orders yet.</p>
        ) : null}
      </Card>

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </DashboardShell>
  )
}
