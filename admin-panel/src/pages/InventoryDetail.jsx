import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductInventory, createBatch, updateBatch } from '../api/inventory'
import { getApiErrorMessage } from '../api/client'
import DashboardShell from '../components/layout/DashboardShell'

const card = 'rounded-2xl border border-cream-300 bg-white'
const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500'
const td = 'px-4 py-3 text-sm text-ink-700'
const field = 'w-full rounded-xl border border-cream-300 px-3 py-2 text-sm text-ink-900'
const btn =
  'rounded-xl bg-chili-500 px-4 py-2 text-sm font-medium text-cream-50 hover:opacity-90 disabled:opacity-50'
const btnGhost = 'rounded-xl px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100'

const emptyForm = { batch_no: '', manufactured_date: '', expiry_date: '', quantity: '' }

export default function InventoryDetail() {
  const { productId: id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // editingId === null while the form is open → create mode
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await getProductInventory(id))
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (b) => {
    setEditingId(b.id)
    setForm({
      batch_no: b.batch_no,
      manufactured_date: b.manufactured_date,
      expiry_date: b.expiry_date,
      quantity: b.quantity,
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        await updateBatch({
          id: editingId,
          batch_no: form.batch_no,
          manufactured_date: form.manufactured_date,
          expiry_date: form.expiry_date,
        })
      } else {
        await createBatch({
          product_id: Number(id),
          batch_no: form.batch_no,
          manufactured_date: form.manufactured_date,
          expiry_date: form.expiry_date,
          quantity: Number(form.quantity),
        })
      }
      closeForm()
      await load()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && !data) {
    return (
      <DashboardShell>
        <p className="text-sm text-ink-500">Loading…</p>
      </DashboardShell>
    )
  }
  if (error && !data) {
    return (
      <DashboardShell>
        <p className="rounded-xl bg-chili-50 px-4 py-3 text-sm text-chili-500">{error}</p>
        <Link to="/inventory" className="mt-4 inline-block text-sm text-chili-500 hover:underline">
          ← Back to inventory
        </Link>
      </DashboardShell>
    )
  }

  const { product, summary, batches } = data
  const today = new Date().toISOString().slice(0, 10)

  return (
    <DashboardShell>
    <div>
      <Link to="/inventory" className="text-sm text-chili-500 hover:underline">
        ← Back to inventory
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{product.name}</h1>
          <p className="text-sm text-ink-500">
            {product.category} · {product.quantity} {product.unit} pack · {product.status}
          </p>
        </div>
        <button className={btn} onClick={openCreate}>
          Add batch
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Batches', summary.batch_count],
          ['Total produced', Number(summary.total_quantity)],
          ['Remaining', Number(summary.remaining_quantity)],
        ].map(([label, value]) => (
          <div key={label} className={`${card} px-5 py-4`}>
            <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={submit} className={`${card} mb-6 p-5`}>
          <h2 className="mb-4 text-base font-semibold text-ink-900">
            {editingId ? 'Edit batch' : 'Add batch'}
          </h2>
          {formError && (
            <p className="mb-4 rounded-xl bg-chili-50 px-4 py-3 text-sm text-chili-500">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-ink-700">
              Batch no.
              <input className={field} value={form.batch_no} onChange={set('batch_no')} required />
            </label>
            <label className="text-sm text-ink-700">
              Quantity
              <input
                type="number"
                min="1"
                step="any"
                className={`${field} disabled:bg-cream-100`}
                value={form.quantity}
                onChange={set('quantity')}
                disabled={!!editingId}
                required={!editingId}
              />
              {editingId && (
                <span className="text-xs text-ink-300">
                  Quantity can't be changed after creation.
                </span>
              )}
            </label>
            <label className="text-sm text-ink-700">
              Manufactured date
              <input
                type="date"
                className={field}
                value={form.manufactured_date}
                onChange={set('manufactured_date')}
                required
              />
            </label>
            <label className="text-sm text-ink-700">
              Expiry date
              <input
                type="date"
                className={field}
                value={form.expiry_date}
                min={form.manufactured_date || undefined}
                onChange={set('expiry_date')}
                required
              />
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" className={btn} disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create batch'}
            </button>
            <button type="button" className={btnGhost} onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead className="border-b border-cream-200">
            <tr>
              <th className={th}>Batch</th>
              <th className={th}>Manufactured</th>
              <th className={th}>Expiry</th>
              <th className={th}>Quantity</th>
              <th className={th}>Remaining</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => {
              const expired = b.expiry_date < today
              return (
                <tr key={b.id} className="border-b border-cream-100 last:border-0">
                  <td className={`${td} font-medium text-ink-900`}>{b.batch_no}</td>
                  <td className={td}>{b.manufactured_date}</td>
                  <td className={`${td} ${expired ? 'font-medium text-chili-500' : ''}`}>
                    {b.expiry_date}
                    {expired && ' (expired)'}
                  </td>
                  <td className={td}>{Number(b.quantity)}</td>
                  <td className={td}>{Number(b.remaining_quantity)}</td>
                  <td className={`${td} text-right`}>
                    <button className="text-chili-500 hover:underline" onClick={() => openEdit(b)}>
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
            {batches.length === 0 && (
              <tr>
                <td className={td} colSpan={6}>
                  No batches yet. Add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </DashboardShell>
  )
}