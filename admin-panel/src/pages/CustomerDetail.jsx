import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, User, MapPin, Package, CalendarCheck } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import Card from '../components/ui/Card'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { getCustomerDetails, updateCustomerStatus } from '../api/customers'

export default function CustomerDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const customerId = Number(id)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'customer', customerId],
    queryFn: () => getCustomerDetails(customerId),
    enabled: !!customerId,
  })

  const statusMutation = useMutation({
    mutationFn: updateCustomerStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customerId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
    },
  })

  const customer = data?.customer
  const addresses = data?.addresses ?? []
  const orders = data?.orders ?? []
  const subscriptions = data?.subscriptions ?? []

  const handleStatusChange = (newStatus) => {
    if (customer?.status === newStatus) return
    const msg =
      newStatus === 'blocked'
        ? `Are you sure you want to BLOCK customer ${customer.name}? They will lose account access.`
        : `Change status of ${customer.name} to "${newStatus}"?`
    if (window.confirm(msg)) {
      statusMutation.mutate({ customerId, status: newStatus })
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="py-24 text-center">
          <p className="text-sm text-ink-400">Loading customer profile…</p>
        </div>
      </DashboardShell>
    )
  }

  if (isError || !customer) {
    return (
      <DashboardShell>
        <div className="py-24 text-center">
          <p className="text-sm text-chili-500">
            {error?.message || 'Customer profile not found.'}
          </p>
          <Link to="/customers" className="mt-4 inline-block text-xs font-semibold text-chili-500">
            Back to Customers
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const statusTone =
    customer.status === 'active' ? 'forest' : customer.status === 'blocked' ? 'chili' : 'warning'

  return (
    <DashboardShell>
      <div className="mb-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{customer.name}</h1>
          <p className="text-xs text-ink-400">
            Customer ID #{customer.id} · Registered on{' '}
            {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-ink-500">Account Status:</span>
          <select
            value={customer.status}
            disabled={statusMutation.isLoading}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 outline-none focus:border-chili-400"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
          <Badge tone={statusTone}>{customer.status.toUpperCase()}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Information Card */}
        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-cream-100 pb-3 mb-4">
            <User className="h-4 w-4 text-chili-500" />
            <h2 className="font-display text-base font-semibold text-ink-900">
              Personal Details
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-ink-400 font-medium">Full Name</p>
              <p className="text-ink-900 font-semibold text-sm">{customer.name}</p>
            </div>
            <div>
              <p className="text-ink-400 font-medium">Email Address</p>
              <p className="text-ink-900 font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-ink-400 font-medium">Phone</p>
              <p className="text-ink-900 font-medium">{customer.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-ink-400 font-medium">Primary Registration Address</p>
              <p className="text-ink-700 leading-relaxed">{customer.address || 'Not provided'}</p>
            </div>
          </div>
        </Card>

        {/* Saved Delivery Addresses Card */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-cream-100 pb-3 mb-4">
            <MapPin className="h-4 w-4 text-forest-600" />
            <h2 className="font-display text-base font-semibold text-ink-900">
              Saved Delivery Addresses ({addresses.length})
            </h2>
          </div>

          {addresses.length === 0 ? (
            <p className="text-xs text-ink-400 py-4">No saved delivery addresses in address book.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-3.5 rounded-xl border text-xs ${
                    addr.is_default
                      ? 'border-forest-300 bg-forest-50/30'
                      : 'border-cream-200 bg-cream-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-ink-900">{addr.recipient_name}</span>
                    {addr.is_default ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-2 py-0.5 rounded-pill">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="text-ink-700">{addr.address_line1}</p>
                  {addr.address_line2 ? <p className="text-ink-600">{addr.address_line2}</p> : null}
                  <p className="text-ink-600">
                    {addr.city}, {addr.state} - {addr.postal_code}
                  </p>
                  <p className="text-ink-400 mt-1">Phone: {addr.recipient_phone}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Orders History */}
      <div className="mt-8">
        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-cream-100 pb-3 mb-4">
            <Package className="h-4 w-4 text-ink-700" />
            <h2 className="font-display text-base font-semibold text-ink-900">
              Past Orders ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-ink-400 py-4">No orders placed by this customer yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-cream-200 text-ink-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 pr-3">Order ID</th>
                    <th className="py-2.5 pr-3">Date</th>
                    <th className="py-2.5 pr-3">Total Amount</th>
                    <th className="py-2.5 pr-3">Payment</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream-50/70">
                      <td className="py-2.5 pr-3 font-semibold text-ink-900">#{o.id}</td>
                      <td className="py-2.5 pr-3 text-ink-500">
                        {o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 pr-3 font-bold text-chili-600">
                        ₹{Number(o.total_amount).toFixed(2)}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-700">
                        {o.payment_method} · {o.payment_status}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge tone={toneForStatus(o.status)}>{formatStatusLabel(o.status)}</Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/orders/${o.id}`}
                          className="font-semibold text-chili-500 hover:text-chili-600"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Subscriptions History */}
      <div className="mt-8">
        <Card className="p-5">
          <div className="flex items-center gap-2 border-b border-cream-100 pb-3 mb-4">
            <CalendarCheck className="h-4 w-4 text-forest-600" />
            <h2 className="font-display text-base font-semibold text-ink-900">
              Subscriptions ({subscriptions.length})
            </h2>
          </div>

          {subscriptions.length === 0 ? (
            <p className="text-xs text-ink-400 py-4">No subscriptions registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-cream-200 text-ink-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 pr-3">Subscription ID</th>
                    <th className="py-2.5 pr-3">Plan Name</th>
                    <th className="py-2.5 pr-3">Period</th>
                    <th className="py-2.5 pr-3">Total Amount</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-cream-50/70">
                      <td className="py-2.5 pr-3 font-semibold text-ink-900">#{s.id}</td>
                      <td className="py-2.5 pr-3 font-medium text-ink-900">{s.plan_name}</td>
                      <td className="py-2.5 pr-3 text-ink-500">
                        {s.start_date} to {s.end_date}
                      </td>
                      <td className="py-2.5 pr-3 font-bold text-forest-700">
                        ₹{Number(s.total_amount).toFixed(2)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge tone={toneForStatus(s.status)}>{formatStatusLabel(s.status)}</Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/subscriptions/${s.id}`}
                          className="font-semibold text-chili-500 hover:text-chili-600"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
