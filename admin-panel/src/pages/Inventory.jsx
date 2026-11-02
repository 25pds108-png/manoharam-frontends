import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  AlertTriangle,
  Clock,
  Search,
  Package,
  ArrowRight,
  RefreshCw,
  Mail,
} from 'lucide-react'
import { listInventories, listExpiringBatches, listLowStock } from '../api/inventory'
import { getApiErrorMessage } from '../api/client'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

const TABS = [
  { id: 'all', label: 'All Stock', icon: Boxes },
  { id: 'low', label: 'Low Stock Alerts', icon: AlertTriangle },
  { id: 'expiring', label: 'Expiring Soon', icon: Clock },
]

function ErrorBox({ message }) {
  return message ? (
    <div className="mb-4 rounded-xl border border-chili-200 bg-chili-50 p-4 text-xs font-medium text-chili-700">
      {message}
    </div>
  ) : null
}

function AllStock() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async (nextCursor) => {
    setLoading(true)
    setError('')
    try {
      const data = await listInventories({ cursor: nextCursor || undefined })
      setRows((prev) => (nextCursor ? [...prev, ...data.inventory] : data.inventory))
      setHasMore(data.pagination.has_more)
      setCursor(data.pagination.next_cursor)
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(null)
  }, [load])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
    )
  }, [rows, search])

  return (
    <>
      <ErrorBox message={error} />

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search stock by product name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-pill border border-cream-300 bg-white py-2 pl-10 pr-4 text-xs text-ink-900 placeholder:text-ink-400 outline-none focus:border-chili-400 shadow-2xs"
          />
        </div>
        <p className="text-xs text-ink-500 self-center">
          Showing {filteredRows.length} item{filteredRows.length === 1 ? '' : 's'}
        </p>
      </div>

      <Card className="overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Batches</th>
                <th className="py-3 px-4 text-right">Total Produced</th>
                <th className="py-3 px-4 text-right">Remaining Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-xs">
              {filteredRows.map((r) => {
                const remaining = Number(r.remaining_quantity || 0)
                const isOutOfStock = remaining <= 0
                const isLow = remaining > 0 && remaining <= 10

                return (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/inventory/${r.id}`)}
                    className="cursor-pointer hover:bg-cream-50/70 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-ink-900 hover:text-chili-500">
                        {r.name}
                      </span>
                      <p className="text-[11px] text-ink-400">
                        {r.product_quantity} {r.product_unit} pack
                      </p>
                    </td>
                    <td className="py-3 px-4 text-ink-600">{r.category}</td>
                    <td className="py-3 px-4 text-center font-medium text-ink-900">
                      {r.batch_count}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-ink-900">
                      {Number(r.total_quantity)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span
                        className={
                          isOutOfStock
                            ? 'text-chili-600'
                            : isLow
                            ? 'text-warning-600'
                            : 'text-forest-600'
                        }
                      >
                        {remaining}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge tone={isOutOfStock ? 'chili' : isLow ? 'warning' : 'forest'}>
                        {isOutOfStock ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-chili-500 hover:text-chili-600">
                        Batches <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="divide-y divide-cream-100 md:hidden">
          {filteredRows.map((r) => {
            const remaining = Number(r.remaining_quantity || 0)
            const isOutOfStock = remaining <= 0
            const isLow = remaining > 0 && remaining <= 10

            return (
              <div
                key={r.id}
                onClick={() => navigate(`/inventory/${r.id}`)}
                className="cursor-pointer p-4 hover:bg-cream-50 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-ink-900 text-sm">{r.name}</h3>
                    <p className="text-[11px] text-ink-500">
                      {r.category} · {r.product_quantity} {r.product_unit} pack
                    </p>
                  </div>
                  <Badge tone={isOutOfStock ? 'chili' : isLow ? 'warning' : 'forest'}>
                    {isOutOfStock ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-cream-100 text-ink-600">
                  <span>Batches: <strong className="text-ink-900">{r.batch_count}</strong></span>
                  <span>Produced: <strong className="text-ink-900">{Number(r.total_quantity)}</strong></span>
                  <span>
                    Remaining:{' '}
                    <strong
                      className={
                        isOutOfStock
                          ? 'text-chili-600'
                          : isLow
                          ? 'text-warning-600'
                          : 'text-forest-600'
                      }
                    >
                      {remaining}
                    </strong>
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {loading && rows.length === 0 && (
          <div className="py-12 text-center text-sm text-ink-400">Loading stock inventory…</div>
        )}

        {!loading && filteredRows.length === 0 && (
          <EmptyState
            icon={Package}
            title="No inventory records found"
            description={search ? `No products match "${search}".` : 'No product stock available yet.'}
          />
        )}
      </Card>

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => load(cursor)}>
            Load More Products
          </Button>
        </div>
      )}
    </>
  )
}

function LowStock() {
  const navigate = useNavigate()
  const [threshold, setThreshold] = useState(10)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Deliberately manual: the endpoint emails the admin on every call that finds results.
  const run = async () => {
    setLoading(true)
    setError('')
    try {
      setResult(await listLowStock({ threshold }))
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-ink-900">
              Low Stock Inspection
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Scan warehouse batches for products below minimum threshold quantity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="low-stock-threshold" className="text-xs font-medium text-ink-700">
                Remaining &le;
              </label>
              <input
                id="low-stock-threshold"
                type="number"
                min="0"
                className="w-20 rounded-xl border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <Button onClick={run} loading={loading} className="text-xs shadow-sm">
              <RefreshCw className="h-3.5 w-3.5" /> Check Low Stock
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-cream-50 p-3 text-[11px] text-ink-500 border border-cream-200">
          <Mail className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Note: When low-stock items are detected, the system automatically dispatches an alert email to the admin.
          </span>
        </div>
      </Card>

      <ErrorBox message={error} />

      {result && (
        <>
          <div className="mb-3 flex items-center justify-between text-xs text-ink-600 font-medium">
            <span>
              Found <strong>{result.products.length}</strong> product(s) at or below threshold ({result.threshold}).
            </span>
            {result.products.length > 0 && (
              <span className={result.mail_sent ? 'text-forest-600' : 'text-chili-500'}>
                {result.mail_sent ? '✓ Email dispatch notification sent' : 'Notice: Email could not be sent'}
              </span>
            )}
          </div>

          <Card className="overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Pack Size</th>
                    <th className="py-3 px-4 text-right">Remaining Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-xs">
                  {result.products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/inventory/${p.id}`)}
                      className="cursor-pointer hover:bg-cream-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-ink-900 hover:text-chili-500">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-ink-600">
                        {p.product_quantity} {p.product_unit}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-chili-600">
                        {Number(p.remaining_quantity)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge tone="chili">NEEDS RESTOCK</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-chili-500 hover:text-chili-600">
                          Add Batch <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="divide-y divide-cream-100 md:hidden">
              {result.products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/inventory/${p.id}`)}
                  className="cursor-pointer p-4 hover:bg-cream-50 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-ink-900 text-sm">{p.name}</h3>
                      <p className="text-[11px] text-ink-500">{p.product_quantity} {p.product_unit} pack</p>
                    </div>
                    <Badge tone="chili">RESTOCK</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-cream-100 text-ink-600">
                    <span>Remaining Units:</span>
                    <strong className="text-sm font-bold text-chili-600">
                      {Number(p.remaining_quantity)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {result.products.length === 0 && (
              <EmptyState
                icon={Package}
                title="All stock levels healthy"
                description={`No products are currently at or below ${result.threshold} units.`}
              />
            )}
          </Card>
        </>
      )}
    </>
  )
}

function Expiring() {
  const navigate = useNavigate()
  const [days, setDays] = useState(3)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (d) => {
    setLoading(true)
    setError('')
    try {
      const data = await listExpiringBatches({ days: d })
      setBatches(data.batches)
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(3)
  }, [load])

  return (
    <>
      <Card className="p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-ink-900">
              Expiring Batches Radar
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Track fresh artisanal items reaching expiration window to avoid food wastage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="expiring-days" className="text-xs font-medium text-ink-700">
                Expiring within:
              </label>
              <input
                id="expiring-days"
                type="number"
                min="0"
                className="w-16 rounded-xl border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
              <span className="text-xs text-ink-500">days</span>
            </div>
            <Button onClick={() => load(days)} loading={loading} className="text-xs shadow-sm">
              Apply
            </Button>
          </div>
        </div>
      </Card>

      <ErrorBox message={error} />

      <Card className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Batch No.</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Remaining / Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-xs">
              {batches.map((b) => {
                const d = Number(b.days_remaining)
                const isExpired = d < 0
                const isToday = d === 0

                return (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/inventory/${b.product_id}`)}
                    className="cursor-pointer hover:bg-cream-50/70 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-ink-900 hover:text-chili-500">
                      {b.product_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-700">{b.batch_no}</td>
                    <td className="py-3 px-4 text-ink-800">{b.expiry_date}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge tone={isExpired ? 'chili' : isToday ? 'warning' : 'forest'}>
                        {isExpired
                          ? `EXPIRED ${Math.abs(d)}D AGO`
                          : isToday
                          ? 'EXPIRES TODAY'
                          : `${d} DAYS LEFT`}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-ink-900">
                      <span className="font-bold text-chili-600">{Number(b.remaining_quantity)}</span> / {Number(b.quantity)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-chili-500 hover:text-chili-600">
                        View Product <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="divide-y divide-cream-100 md:hidden">
          {batches.map((b) => {
            const d = Number(b.days_remaining)
            const isExpired = d < 0
            const isToday = d === 0

            return (
              <div
                key={b.id}
                onClick={() => navigate(`/inventory/${b.product_id}`)}
                className="cursor-pointer p-4 hover:bg-cream-50 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-ink-900 text-sm">{b.product_name}</h3>
                    <p className="text-[11px] font-mono text-ink-500">Batch: {b.batch_no}</p>
                  </div>
                  <Badge tone={isExpired ? 'chili' : isToday ? 'warning' : 'forest'}>
                    {isExpired
                      ? `EXPIRED ${Math.abs(d)}D AGO`
                      : isToday
                      ? 'TODAY'
                      : `${d}D LEFT`}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-cream-100 text-ink-600">
                  <span>Expiry: <strong className="text-ink-900">{b.expiry_date}</strong></span>
                  <span>
                    Stock: <strong className="text-chili-600">{Number(b.remaining_quantity)}</strong> / {Number(b.quantity)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {loading && batches.length === 0 && (
          <div className="py-12 text-center text-sm text-ink-400">Loading expiring batches…</div>
        )}

        {!loading && batches.length === 0 && (
          <EmptyState
            icon={Clock}
            title="No batches expiring in this window"
            description={`No inventory batches are scheduled to expire within ${days} days.`}
          />
        )}
      </Card>
    </>
  )
}

export default function Inventory() {
  const [tab, setTab] = useState('all')

  return (
    <DashboardShell>
      <PageHeader
        title="Inventory & Stock Levels"
        description="Monitor warehouse production batches, track expiring items, and automate low-stock notifications."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-chili-500 text-white shadow-xs'
                  : 'bg-white text-ink-700 border border-cream-300 hover:bg-cream-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {tab === 'all' && <AllStock />}
      {tab === 'low' && <LowStock />}
      {tab === 'expiring' && <Expiring />}
    </DashboardShell>
  )
}