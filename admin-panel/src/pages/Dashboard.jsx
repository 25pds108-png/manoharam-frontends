import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarCheck,
  AlertCircle,
  ChefHat,
  Truck,
  TrendingUp,
  DollarSign,
  Users,
  PackageX,
  Calendar,
} from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { getDailyDispatch } from '../api/subscriptions'
import { getDashboardStats, getSalesReport } from '../api/dashboard'

export default function Dashboard() {
  const [dispatchDate, setDispatchDate] = useState(() => {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  })

  // Date range for sales report: default to current month
  const [salesRange, setSalesRange] = useState(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const today = now.toISOString().slice(0, 10)
    return { startDate: firstDay, endDate: today }
  })

  // 1. Executive real-time dashboard stats from /admin_routes/get_dashboard_stats.php
  const statsQuery = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: getDashboardStats,
  })

  // 2. Kitchen daily dispatch from /admin_routes/get_daily_dispatch.php
  const dispatchQuery = useQuery({
    queryKey: ['daily-dispatch', dispatchDate],
    queryFn: () => getDailyDispatch(dispatchDate),
  })

  // 3. Sales report analytics from /admin_routes/sales_report.php
  const salesQuery = useQuery({
    queryKey: ['admin', 'sales-report', salesRange.startDate, salesRange.endDate],
    queryFn: () => getSalesReport(salesRange),
  })

  const metrics = statsQuery.data?.metrics
  const recentOrders = statsQuery.data?.recent_orders ?? []
  const recentSubscriptions = statsQuery.data?.recent_subscriptions ?? []
  const dispatchData = dispatchQuery.data
  const salesData = salesQuery.data

  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard & Analytics"
        description="Real-time operations, revenue metrics, and kitchen dispatches."
      />

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Revenue Today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chili-50 text-chili-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-chili-500">
            ₹{Number(metrics?.revenue_today ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-ink-300">
            This month: ₹{Number(metrics?.revenue_month ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Pending Orders</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {metrics?.pending_orders ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-300">
            Today's orders: {metrics?.orders_today ?? 0}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Active Subscriptions</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-forest-600">
            {metrics?.active_subscriptions ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-300">
            Subscribers receiving daily meals
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Total Customers</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-200 text-ink-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {metrics?.total_customers ?? 0}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-300">
            {Number(metrics?.low_stock_products_count ?? 0) > 0 ? (
              <span className="flex items-center gap-1 text-chili-600 font-medium">
                <PackageX className="h-3.5 w-3.5" /> {metrics.low_stock_products_count} low-stock items
              </span>
            ) : (
              <span>Inventory levels optimal</span>
            )}
          </div>
        </Card>
      </div>

      {/* Sales Analytics & Top Products Section */}
      <div className="mt-8">
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-cream-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chili-50 text-chili-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink-900">
                  Sales Reports & Revenue Analytics
                </h2>
                <p className="text-xs text-ink-500">
                  Calculated from backend order history (excludes cancelled orders).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ink-400" />
              <input
                type="date"
                value={salesRange.startDate}
                onChange={(e) => setSalesRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="rounded-xl border border-cream-300 bg-white px-2.5 py-1 text-xs font-medium text-ink-900 outline-none focus:border-chili-400"
              />
              <span className="text-xs text-ink-300">to</span>
              <input
                type="date"
                value={salesRange.endDate}
                onChange={(e) => setSalesRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="rounded-xl border border-cream-300 bg-white px-2.5 py-1 text-xs font-medium text-ink-900 outline-none focus:border-chili-400"
              />
            </div>
          </div>

          {salesQuery.isLoading ? (
            <p className="py-6 text-center text-sm text-ink-300">Loading sales report…</p>
          ) : salesData ? (
            <div className="mt-5 space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
                  <p className="text-xs font-medium text-ink-500">Total Orders in Period</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink-900">
                    {salesData.summary?.total_orders ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
                  <p className="text-xs font-medium text-ink-500">Total Net Revenue</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-chili-500">
                    ₹{Number(salesData.summary?.total_revenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
                  <p className="text-xs font-medium text-ink-500">Average Order Value (AOV)</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-forest-600">
                    ₹{Number(salesData.summary?.average_order_value ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Top Selling Products */}
              {salesData.top_selling_products?.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Top Selling Products
                  </h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-cream-200 text-xs font-medium text-ink-500">
                        <tr>
                          <th className="py-2 pr-3">Product Name</th>
                          <th className="py-2 pr-3">Category</th>
                          <th className="py-2 pr-3 text-right">Units Sold</th>
                          <th className="py-2 text-right">Product Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100 text-xs">
                        {salesData.top_selling_products.map((p) => (
                          <tr key={p.id} className="hover:bg-cream-50/70">
                            <td className="py-2.5 pr-3 font-medium text-ink-900">{p.name}</td>
                            <td className="py-2.5 pr-3 text-ink-500">{p.category}</td>
                            <td className="py-2.5 pr-3 text-right font-medium text-ink-900">
                              {Number(p.total_quantity_sold)}
                            </td>
                            <td className="py-2.5 text-right font-semibold text-chili-600">
                              ₹{Number(p.total_product_revenue).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>

      {/* Kitchen Production & Daily Dispatch */}
      <div className="mt-8">
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-cream-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink-900">
                  Kitchen Production & Daily Dispatch
                </h2>
                <p className="text-xs text-ink-500">
                  Daily subscriber batch preparation and dispatch routes.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="dispatch-date-input" className="text-xs font-medium text-ink-500">
                Date:
              </label>
              <input
                id="dispatch-date-input"
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="rounded-xl border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-900 outline-none focus:border-chili-400"
              />
            </div>
          </div>

          {dispatchQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-ink-300">Loading daily dispatch report…</p>
          ) : dispatchQuery.isError ? (
            <p className="py-8 text-center text-sm text-chili-500">
              Couldn't load dispatch report for {dispatchDate}.
            </p>
          ) : (
            <div className="mt-5 space-y-6">
              {/* Production summary breakdown */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Kitchen Prep Requirements ({dispatchData?.dispatch_date} · {dispatchData?.day_of_week})
                </h3>
                {dispatchData?.kitchen_production_summary?.length > 0 ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {dispatchData.kitchen_production_summary.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center justify-between rounded-xl border border-cream-200 bg-cream-50/50 p-3.5"
                      >
                        <div>
                          <p className="font-medium text-ink-900">{item.product_name}</p>
                          <p className="text-xs text-ink-500">
                            Portion size: {item.portion_size} {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center rounded-pill bg-forest-100 px-2.5 py-1 text-xs font-bold text-forest-700">
                            {item.total_packs} packs
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-ink-300">
                    No salad production required for this date.
                  </p>
                )}
              </div>

              {/* Delivery Schedule / Route */}
              {dispatchData?.deliveries?.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-ink-500" /> Deliveries to Dispatch ({dispatchData.deliveries.length})
                  </h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-cream-200 text-xs font-medium text-ink-500">
                        <tr>
                          <th className="py-2 pr-3">Customer</th>
                          <th className="py-2 pr-3">Phone</th>
                          <th className="py-2 pr-3">Salad to Deliver</th>
                          <th className="py-2 pr-3">Address</th>
                          <th className="py-2 text-right">Subscription</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100 text-xs">
                        {dispatchData.deliveries.map((del) => (
                          <tr key={del.subscription_id} className="hover:bg-cream-50/70">
                            <td className="py-2.5 pr-3 font-medium text-ink-900">
                              {del.customer_name}
                            </td>
                            <td className="py-2.5 pr-3 text-ink-700">{del.customer_phone || '—'}</td>
                            <td className="py-2.5 pr-3 text-ink-900 font-medium">
                              {del.scheduled_product
                                ? `${del.scheduled_product.name} (${del.scheduled_product.quantity} ${del.scheduled_product.unit})`
                                : del.plan_name}
                            </td>
                            <td className="py-2.5 pr-3 text-ink-500 max-w-xs truncate">
                              {del.delivery_address || '—'}
                            </td>
                            <td className="py-2.5 text-right">
                              <Link
                                to={`/subscriptions/${del.subscription_id}`}
                                className="font-medium text-chili-500 hover:text-chili-600"
                              >
                                #{del.subscription_id}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Orders & Subscriptions from Dashboard Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-900">
              Recent Orders
            </h2>
            <Link to="/orders" className="text-sm font-medium text-chili-500">
              View all
            </Link>
          </div>

          {statsQuery.isLoading ? <p className="mt-4 text-sm text-ink-300">Loading…</p> : null}

          {!statsQuery.isLoading && recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-ink-300">No recent orders.</p>
          ) : null}

          <div className="mt-3 space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-cream-100"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning-500" />
                  <span className="text-sm text-ink-900">
                    Order #{order.id} — {order.customer_name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={toneForStatus(order.status)}>{formatStatusLabel(order.status)}</Badge>
                  <span className="text-sm font-semibold text-ink-900">
                    ₹{Number(order.total_amount).toFixed(0)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-900">
              Recent Subscriptions
            </h2>
            <Link to="/subscriptions" className="text-sm font-medium text-chili-500">
              View all
            </Link>
          </div>

          {statsQuery.isLoading ? (
            <p className="mt-4 text-sm text-ink-300">Loading…</p>
          ) : null}

          {!statsQuery.isLoading && recentSubscriptions.length === 0 ? (
            <p className="mt-4 text-sm text-ink-300">No recent subscriptions.</p>
          ) : null}

          <div className="mt-3 space-y-2">
            {recentSubscriptions.map((sub) => (
              <Link
                key={sub.id}
                to={`/subscriptions/${sub.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-cream-100"
              >
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-forest-500" />
                  <span className="text-sm text-ink-900">
                    {sub.customer_name} — {sub.plan_name}
                  </span>
                </div>
                <Badge tone={toneForStatus(sub.status)}>{formatStatusLabel(sub.status)}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}
