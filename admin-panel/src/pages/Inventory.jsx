import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listInventories, listExpiringBatches, listLowStock } from '../api/inventory'
import { getApiErrorMessage } from '../api/client'
import DashboardShell from '../components/layout/DashboardShell'

const TABS = [
  { id: 'all', label: 'All stock' },
  { id: 'low', label: 'Low stock' },
  { id: 'expiring', label: 'Expiring soon' },
]

const card = 'rounded-2xl border border-cream-300 bg-white'
const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500'
const td = 'px-4 py-3 text-sm text-ink-700'
const btn =
  'rounded-xl bg-chili-500 px-4 py-2 text-sm font-medium text-cream-50 hover:opacity-90 disabled:opacity-50'
const input = 'w-28 rounded-xl border border-cream-300 px-3 py-2 text-sm text-ink-900'

function ErrorBox({ message }) {
  return message ? (
    <p className="mb-4 rounded-xl bg-chili-50 px-4 py-3 text-sm text-chili-500">{message}</p>
  ) : null
}

function AllStock() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <>
      <ErrorBox message={error} />
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead className="border-b border-cream-200">
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Category</th>
              <th className={th}>Batches</th>
              <th className={th}>Total</th>
              <th className={th}>Remaining</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/inventory/${r.id}`)}
                className="cursor-pointer border-b border-cream-100 last:border-0 hover:bg-cream-50"
              >
                <td className={td}>
                  <span className="font-medium text-chili-500 hover:underline">
                    {r.name}
                  </span>
                  <div className="text-xs text-ink-300">
                    {r.product_quantity} {r.product_unit} pack
                  </div>
                </td>
                <td className={td}>{r.category}</td>
                <td className={td}>{r.batch_count}</td>
                <td className={td}>{Number(r.total_quantity)}</td>
                <td
                  className={`${td} font-medium ${
                    Number(r.remaining_quantity) === 0 ? 'text-chili-500' : ''
                  }`}
                >
                  {Number(r.remaining_quantity)}
                </td>
                <td className={td}>{r.status}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className={td} colSpan={6}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {loading && <p className="mt-4 text-sm text-ink-500">Loading…</p>}
      {hasMore && !loading && (
        <button className={`${btn} mt-4`} onClick={() => load(cursor)}>
          Load more
        </button>
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
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <label className="text-sm text-ink-700">Remaining at or below</label>
        <input
          type="number"
          min="0"
          className={input}
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
        <button className={btn} onClick={run} disabled={loading}>
          {loading ? 'Checking…' : 'Check low stock'}
        </button>
      </div>
      <p className="mb-4 text-xs text-ink-300">
        Heads up: if any products are low, the backend also emails the admin each time you run
        this check.
      </p>
      <ErrorBox message={error} />
      {result && (
        <>
          <p className="mb-3 text-sm text-ink-700">
            {result.products.length} product(s) at or below {result.threshold}.
            {result.products.length > 0 &&
              (result.mail_sent
                ? ' Notification email sent.'
                : ' Notification email could not be sent.')}
          </p>
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full">
              <thead className="border-b border-cream-200">
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Pack</th>
                  <th className={th}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {result.products.map((p) => (
                  <tr
                key={p.id}
                onClick={() => navigate(`/inventory/${p.id}`)}
                className="cursor-pointer border-b border-cream-100 last:border-0 hover:bg-cream-50"
              >
                    <td className={td}>
                      <span className="font-medium text-chili-500 hover:underline">
                        {p.name}
                      </span>
                    </td>
                    <td className={td}>
                      {p.product_quantity} {p.product_unit}
                    </td>
                    <td className={`${td} font-medium text-chili-500`}>
                      {Number(p.remaining_quantity)}
                    </td>
                  </tr>
                ))}
                {result.products.length === 0 && (
                  <tr>
                    <td className={td} colSpan={3}>
                      Nothing is running low.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-ink-700">Expiring within (days)</label>
        <input
          type="number"
          min="0"
          className={input}
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <button className={btn} onClick={() => load(days)} disabled={loading}>
          Apply
        </button>
      </div>
      <ErrorBox message={error} />
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead className="border-b border-cream-200">
            <tr>
              <th className={th}>Product</th>
              <th className={th}>Batch</th>
              <th className={th}>Expiry</th>
              <th className={th}>Days left</th>
              <th className={th}>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => {
              const d = Number(b.days_remaining)
              return (
                <tr
                key={b.id}
                onClick={() => navigate(`/inventory/${b.product_id}`)}
                className="cursor-pointer border-b border-cream-100 last:border-0 hover:bg-cream-50"
              >
                  <td className={td}>
                    <span className="font-medium text-chili-500 hover:underline">
                      {b.product_name}
                    </span>
                  </td>
                  <td className={td}>{b.batch_no}</td>
                  <td className={td}>{b.expiry_date}</td>
                  <td className={`${td} font-medium ${d < 0 ? 'text-chili-500' : ''}`}>
                    {d < 0 ? `Expired ${Math.abs(d)}d ago` : d === 0 ? 'Today' : `${d}d`}
                  </td>
                  <td className={td}>
                    {Number(b.remaining_quantity)} / {Number(b.quantity)}
                  </td>
                </tr>
              )
            })}
            {!loading && batches.length === 0 && (
              <tr>
                <td className={td} colSpan={5}>
                  No batches expiring in this window.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {loading && <p className="mt-4 text-sm text-ink-500">Loading…</p>}
    </>
  )
}

export default function Inventory() {
  const [tab, setTab] = useState('all')

  return (
    <DashboardShell>
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-ink-900">Inventory</h1>
      <p className="mb-6 text-sm text-ink-500">Stock levels, low-stock alerts and batch expiry.</p>

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-chili-50 text-chili-500' : 'text-ink-700 hover:bg-cream-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' && <AllStock />}
      {tab === 'low' && <LowStock />}
      {tab === 'expiring' && <Expiring />}
    </div>
    </DashboardShell>
  )
}