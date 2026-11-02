import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Edit,
  Boxes,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react'
import { getProductInventory, createBatch, updateBatch } from '../api/inventory'
import { getApiErrorMessage } from '../api/client'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import EmptyState from '../components/ui/EmptyState'

const emptyForm = { batch_no: '', manufactured_date: '', expiry_date: '', quantity: '' }

export default function InventoryDetail() {
  const { productId: id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal form state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successNotice, setSuccessNotice] = useState('')

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
    const today = new Date().toISOString().slice(0, 10)
    const future = new Date()
    future.setDate(future.getDate() + 90) // default 90 days expiry

    setEditingId(null)
    setForm({
      batch_no: `BATCH-${Date.now().toString().slice(-6)}`,
      manufactured_date: today,
      expiry_date: future.toISOString().slice(0, 10),
      quantity: '',
    })
    setFormError('')
    setShowModal(true)
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
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
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
          batch_no: form.batch_no.trim(),
          manufactured_date: form.manufactured_date,
          expiry_date: form.expiry_date,
        })
        setSuccessNotice('Batch updated successfully.')
      } else {
        await createBatch({
          product_id: Number(id),
          batch_no: form.batch_no.trim(),
          manufactured_date: form.manufactured_date,
          expiry_date: form.expiry_date,
          quantity: Number(form.quantity),
        })
        setSuccessNotice('New production batch registered.')
      }
      closeModal()
      await load()
      setTimeout(() => setSuccessNotice(''), 4000)
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && !data) {
    return (
      <DashboardShell>
        <div className="py-24 text-center">
          <p className="text-sm text-ink-400">Loading product inventory batches…</p>
        </div>
      </DashboardShell>
    )
  }

  if (error && !data) {
    return (
      <DashboardShell>
        <div className="py-16 text-center">
          <p className="rounded-xl bg-chili-50 p-4 text-sm font-semibold text-chili-600 inline-block border border-chili-200">
            {error}
          </p>
          <div className="mt-4">
            <Link to="/inventory" className="text-xs font-semibold text-chili-500 hover:underline">
              ← Return to inventory
            </Link>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const { product, summary, batches } = data
  const today = new Date().toISOString().slice(0, 10)

  return (
    <DashboardShell>
      <div className="mb-4">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Inventory
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{product.name}</h1>
          <p className="text-xs text-ink-500 mt-0.5">
            {product.category} · {product.quantity} {product.unit} pack size · Status:{' '}
            <span className="font-semibold text-ink-700">{product.status}</span>
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0 shadow-sm">
          <Plus className="h-4 w-4" /> Add Production Batch
        </Button>
      </div>

      {successNotice ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-forest-50 p-3.5 text-xs font-semibold text-forest-800 border border-forest-200">
          <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      ) : null}

      {/* Product Inventory Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Production Batches</span>
            <Boxes className="h-4 w-4 text-ink-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">
            {summary.batch_count}
          </p>
          <p className="text-[11px] text-ink-400 mt-0.5">Total recorded batches</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Total Units Produced</span>
            <Package className="h-4 w-4 text-ink-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">
            {Number(summary.total_quantity)}
          </p>
          <p className="text-[11px] text-ink-400 mt-0.5">Lifetime packaged items</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Remaining Stock</span>
            <Clock className="h-4 w-4 text-chili-500" />
          </div>
          <p
            className={`mt-2 font-display text-2xl font-bold ${
              Number(summary.remaining_quantity) === 0 ? 'text-chili-600' : 'text-forest-600'
            }`}
          >
            {Number(summary.remaining_quantity)}
          </p>
          <p className="text-[11px] text-ink-400 mt-0.5">Ready for storefront sale</p>
        </Card>
      </div>

      {/* Batches Table / Cards */}
      <Card className="overflow-hidden">
        <div className="border-b border-cream-200 bg-cream-50/50 px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-ink-900">
            Recorded Batches ({batches.length})
          </h2>
        </div>

        {/* Desktop View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cream-200 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Manufactured</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-center">Batch Status</th>
                <th className="py-3 px-4 text-right">Produced Units</th>
                <th className="py-3 px-4 text-right">Remaining Units</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-xs">
              {batches.map((b) => {
                const expired = b.expiry_date < today
                const remaining = Number(b.remaining_quantity)
                const isSoldOut = remaining <= 0

                return (
                  <tr key={b.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-ink-900">{b.batch_no}</td>
                    <td className="py-3 px-4 text-ink-700">{b.manufactured_date}</td>
                    <td className="py-3 px-4">
                      <span className={expired ? 'font-semibold text-chili-600' : 'text-ink-800'}>
                        {b.expiry_date}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge tone={expired ? 'chili' : isSoldOut ? 'warning' : 'forest'}>
                        {expired ? 'EXPIRED' : isSoldOut ? 'DEPLETED' : 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-ink-900">
                      {Number(b.quantity)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-chili-600">
                      {remaining}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEdit(b)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-chili-500 hover:bg-chili-50 hover:text-chili-600"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Dates
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="divide-y divide-cream-100 md:hidden">
          {batches.map((b) => {
            const expired = b.expiry_date < today
            const remaining = Number(b.remaining_quantity)
            const isSoldOut = remaining <= 0

            return (
              <div key={b.id} className="p-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-ink-900 text-sm">{b.batch_no}</span>
                    <p className="text-[11px] text-ink-500">Mfg: {b.manufactured_date}</p>
                  </div>
                  <Badge tone={expired ? 'chili' : isSoldOut ? 'warning' : 'forest'}>
                    {expired ? 'EXPIRED' : isSoldOut ? 'DEPLETED' : 'ACTIVE'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-ink-700 pt-1 border-t border-cream-100">
                  <span>
                    Expiry:{' '}
                    <strong className={expired ? 'text-chili-600' : 'text-ink-900'}>
                      {b.expiry_date}
                    </strong>
                  </span>
                  <span>
                    Stock: <strong className="text-chili-600">{remaining}</strong> / {Number(b.quantity)}
                  </span>
                </div>

                <div className="pt-1 text-right">
                  <button
                    onClick={() => openEdit(b)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-chili-500 hover:underline"
                  >
                    <Edit className="h-3 w-3" /> Edit Batch Dates
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {batches.length === 0 && (
          <EmptyState
            icon={Package}
            title="No batches recorded yet"
            description="Register a new production batch above to initialize stock for this product."
          />
        )}
      </Card>

      {/* Production Batch Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingId ? 'Edit Batch Dates' : 'Add Production Batch'}
        description={
          editingId
            ? 'Update the manufacturing date or expiry date for this batch.'
            : 'Register a newly produced batch with quantity, manufacturing date, and expiry date.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={submit} className="space-y-4">
          {formError ? (
            <div className="rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs font-semibold text-chili-700">
              {formError}
            </div>
          ) : null}

          <Field
            label="Batch Identifier / Number"
            name="batch_no"
            value={form.batch_no}
            onChange={set('batch_no')}
            required
            placeholder="e.g. BATCH-202611-01"
            help="Unique code printed on physical package label."
          />

          <Field
            label="Produced Quantity (Units)"
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={set('quantity')}
            required={!editingId}
            disabled={!!editingId}
            placeholder="e.g. 50"
            help={
              editingId
                ? 'Produced quantity cannot be edited once recorded to preserve audit integrity.'
                : 'Total units produced in this kitchen batch run.'
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Manufactured Date"
              name="manufactured_date"
              type="date"
              value={form.manufactured_date}
              onChange={set('manufactured_date')}
              required
            />
            <Field
              label="Expiry Date"
              name="expiry_date"
              type="date"
              min={form.manufactured_date || undefined}
              value={form.expiry_date}
              onChange={set('expiry_date')}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-100">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save Changes' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  )
}