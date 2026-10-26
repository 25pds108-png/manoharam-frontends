import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import Card from '../components/ui/Card'
import ProductImage from '../components/ui/ProductImage'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import {
  getSubscriptionDetails,
  approveSubscription,
  rejectSubscription,
  updateSubscription,
} from '../api/subscriptions'
import { getApiErrorMessage } from '../api/client'

// Mirrors update_subscription.php's $allowedStatuses.
const STATUS_OPTIONS = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']

export default function SubscriptionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => getSubscriptionDetails(id),
  })

  const [pendingStatus, setPendingStatus] = useState('')
  const [error, setError] = useState(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const subscription = data?.subscription

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription', id] })
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
  }

  const handleApprove = async () => {
    setError(null)
    setIsApproving(true)
    try {
      const result = await approveSubscription(id)
      if (result.success) {
        refresh()
      } else {
        setError(result.message || 'Could not approve subscription')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not approve subscription'))
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async (e) => {
    e?.preventDefault()
    setError(null)
    setIsRejecting(true)
    try {
      const result = await rejectSubscription({ subscriptionId: id, reason: rejectReason })
      if (result.success) {
        setRejectModalOpen(false)
        setRejectReason('')
        refresh()
      } else {
        setError(result.message || 'Could not reject subscription')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reject subscription'))
    } finally {
      setIsRejecting(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!pendingStatus) return
    setError(null)
    setIsUpdating(true)
    try {
      const result = await updateSubscription({ subscriptionId: id, status: pendingStatus })
      if (result.success) {
        refresh()
        setPendingStatus('')
      } else {
        setError(result.message || 'Could not update subscription')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update subscription'))
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <p className="text-center text-ink-300">Loading…</p>
      </DashboardShell>
    )
  }

  if (isError || !subscription) {
    return (
      <DashboardShell>
        <p className="text-center text-chili-500">Couldn't load this subscription.</p>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <button
        onClick={() => navigate('/subscriptions')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to subscriptions
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-semibold text-ink-900">
                Subscription #{subscription.id}
              </h1>
              <Badge tone={toneForStatus(subscription.status)}>
                {formatStatusLabel(subscription.status)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {subscription.start_date} – {subscription.end_date}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-700">
              <span>{subscription.weeks} week{subscription.weeks === 1 ? '' : 's'}</span>
              <span>₹{subscription.total_amount.toFixed(2)} total</span>
              {subscription.exclude_saturday ? <span className="text-ink-500">No Saturday deliveries</span> : null}
              {subscription.exclude_sunday ? <span className="text-ink-500">No Sunday deliveries</span> : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">
              Salads in rotation
            </h2>
            <div className="mt-3 space-y-3">
              {subscription.products.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-300">
                      #{product.delivery_order}
                    </p>
                    <p className="font-display text-base font-semibold text-ink-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-ink-500">
                      {product.quantity} {product.unit}
                    </p>
                    <p className="mt-1 text-xs text-ink-300">
                      {product.nutrition.calories} kcal · {product.nutrition.protein}g protein ·{' '}
                      {product.nutrition.carbs}g carbs · {product.nutrition.fat}g fat ·{' '}
                      {product.nutrition.fiber}g fiber
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink-900">Plan</h2>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-300">
                {subscription.plan.category}
              </p>
            </div>
            <p className="mt-2 text-sm text-ink-900">{subscription.plan.name}</p>
            <p className="text-sm text-ink-500">₹{subscription.plan.price_per_week}/week</p>
            {subscription.plan.description ? (
              <p className="mt-2 text-sm text-ink-500">{subscription.plan.description}</p>
            ) : null}
          </Card>

          {subscription.delivery_schedule.length > 0 ? (
            <Card className="p-5">
              <h2 className="font-display text-base font-semibold text-ink-900">
                Delivery schedule
              </h2>
              <div className="mt-3 max-h-72 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-ink-500">
                    <tr>
                      <th className="py-1.5 pr-3 font-medium">#</th>
                      <th className="py-1.5 pr-3 font-medium">Date</th>
                      <th className="py-1.5 font-medium">Salad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {subscription.delivery_schedule.map((entry) => (
                      <tr key={entry.sequence}>
                        <td className="py-1.5 pr-3 text-ink-300">{entry.sequence}</td>
                        <td className="py-1.5 pr-3 text-ink-700">{entry.delivery_date}</td>
                        <td className="py-1.5 text-ink-900">{entry.product_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {subscription.skip_dates.length > 0 ? (
            <Card className="p-5">
              <h2 className="font-display text-base font-semibold text-ink-900">
                Skipped deliveries
              </h2>
              <div className="mt-3 space-y-2">
                {subscription.skip_dates.map((skip) => (
                  <div
                    key={skip.skip_date}
                    className="flex items-center justify-between rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-2.5 text-sm"
                  >
                    <div>
                      <p className="text-ink-900">{skip.skip_date}</p>
                      <p className="text-xs text-ink-300">
                        {skip.skip_type}
                        {skip.reason ? ` · ${skip.reason}` : ''}
                      </p>
                    </div>
                    {skip.refund_amount ? (
                      <p className="text-ink-700">₹{skip.refund_amount.toFixed(2)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Customer</h2>
            <p className="mt-2 text-sm text-ink-900">{subscription.customer.name}</p>
            <p className="text-sm text-ink-500">{subscription.customer.email}</p>
            <p className="text-sm text-ink-500">{subscription.customer.phone}</p>
            {subscription.customer.address ? (
              <p className="mt-2 text-sm text-ink-500">{subscription.customer.address}</p>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Actions</h2>

            {error ? <p className="mt-2 text-sm font-medium text-chili-500">{error}</p> : null}

            {subscription.status === 'PENDING' ? (
              <div className="mt-3 flex flex-col gap-2">
                <Button onClick={handleApprove} loading={isApproving} className="w-full">
                  Approve subscription
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setRejectModalOpen(true)}
                  className="w-full text-chili-500 hover:bg-chili-50 hover:text-chili-600"
                >
                  Reject subscription
                </Button>
              </div>
            ) : null}

            <p className="mt-4 text-xs font-medium text-ink-500">Or set a specific status</p>
            <select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value)}
              className="mt-2 w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-chili-400"
            >
              <option value="">Select status…</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {formatStatusLabel(s)}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              onClick={handleUpdateStatus}
              loading={isUpdating}
              disabled={!pendingStatus}
              className="mt-3 w-full"
            >
              Update status
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject subscription request"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-sm text-ink-700">
            Are you sure you want to reject this subscription request for{' '}
            <span className="font-semibold">{subscription.customer?.name}</span>?
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              Reason for rejection (optional)
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Delivery address outside service coverage area, salad item unavailable..."
              className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-chili-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRejectModalOpen(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isRejecting}
              className="bg-chili-500 text-white hover:bg-chili-600"
            >
              Confirm rejection
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  )
}