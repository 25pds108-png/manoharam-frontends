import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Plus, Trash2, Edit2, X, Check, Home, Briefcase, Building } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import {
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '../api/addresses'
import { getApiErrorMessage } from '../api/client'

const initialForm = {
  id: null,
  recipient_name: '',
  recipient_phone: '',
  address_line1: '',
  address_line2: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  postal_code: '',
  landmark: '',
  address_type: 'HOME',
  is_default: false,
}

export default function AddressBookModal({ isOpen, onClose, onSelectAddress }) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: isOpen,
  })

  const addresses = data?.addresses ?? []

  const saveMutation = useMutation({
    mutationFn: (payload) => (payload.id ? updateAddress(payload) : addAddress(payload)),
    onSuccess: (res) => {
      if (res.success) {
        setActionSuccess(form.id ? 'Address updated!' : 'Address added!')
        setIsEditing(false)
        setForm(initialForm)
        queryClient.invalidateQueries({ queryKey: ['addresses'] })
      } else {
        setActionError(res.message || 'Could not save address')
      }
    },
    onError: (err) => {
      setActionError(getApiErrorMessage(err, 'Could not save address'))
    },
  })

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['addresses'] })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['addresses'] })
      }
    },
  })

  if (!isOpen) return null

  const handleStartAdd = () => {
    setActionError(null)
    setActionSuccess(null)
    setForm(initialForm)
    setIsEditing(true)
  }

  const handleStartEdit = (addr) => {
    setActionError(null)
    setActionSuccess(null)
    setForm({
      id: addr.id,
      recipient_name: addr.recipient_name || '',
      recipient_phone: addr.recipient_phone || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || 'Chennai',
      state: addr.state || 'Tamil Nadu',
      postal_code: addr.postal_code || '',
      landmark: addr.landmark || '',
      address_type: addr.address_type || 'HOME',
      is_default: Boolean(addr.is_default),
    })
    setIsEditing(true)
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    setActionError(null)
    setActionSuccess(null)
    if (!form.address_line1.trim() || !form.city.trim() || !form.postal_code.trim()) {
      setActionError('Address Line 1, City, and Pincode are required.')
      return
    }
    saveMutation.mutate(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
      <Card className="w-full max-w-lg p-5 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-chili-500" />
            <h3 className="font-display text-base font-semibold text-ink-900">
              {isEditing
                ? form.id
                  ? 'Edit Delivery Address'
                  : 'Add Delivery Address'
                : 'Saved Delivery Addresses'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink-400 hover:bg-cream-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {actionError ? (
          <p className="mt-2 text-xs font-medium text-chili-600 bg-chili-50 p-2 rounded-lg">
            {actionError}
          </p>
        ) : null}
        {actionSuccess ? (
          <p className="mt-2 text-xs font-medium text-success-700 bg-success-50 p-2 rounded-lg">
            {actionSuccess}
          </p>
        ) : null}

        <div className="flex-1 overflow-y-auto py-3">
          {isEditing ? (
            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-ink-700">Recipient Name</label>
                  <input
                    type="text"
                    value={form.recipient_name}
                    onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-700">Phone</label>
                  <input
                    type="tel"
                    value={form.recipient_phone}
                    onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
                    placeholder="10-digit number"
                    className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-700">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  placeholder="Flat / Door / House No., Building Name"
                  className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-700">Address Line 2</label>
                <input
                  type="text"
                  value={form.address_line2}
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                  placeholder="Street, Sector, Area"
                  className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-ink-700">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-700">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-700">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-ink-700">Landmark</label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    placeholder="Near Bus Stand"
                    className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-700">Type</label>
                  <select
                    value={form.address_type}
                    onChange={(e) => setForm({ ...form, address_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  >
                    <option value="HOME">HOME</option>
                    <option value="WORK">WORK</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_default_addr"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="rounded border-cream-300 text-chili-500 focus:ring-chili-500"
                />
                <label htmlFor="is_default_addr" className="text-xs text-ink-700">
                  Set as default delivery address
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-cream-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={saveMutation.isPending}
                  className="text-xs py-1.5"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saveMutation.isPending} className="text-xs py-1.5 px-4">
                  Save Address
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-xs text-ink-500">
                  {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
                </p>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="inline-flex items-center gap-1 rounded-pill bg-cream-100 px-3 py-1 text-xs font-semibold text-chili-600 hover:bg-cream-200 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Address
                </button>
              </div>

              {isLoading ? (
                <p className="text-xs text-ink-400 py-6 text-center">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 rounded-card border border-dashed border-cream-300 bg-cream-50/50">
                  <MapPin className="h-8 w-8 text-cream-300 mx-auto" />
                  <p className="mt-2 text-xs font-medium text-ink-600">No saved addresses</p>
                  <Button onClick={handleStartAdd} className="mt-3 text-xs py-1.5 px-3">
                    Add First Address
                  </Button>
                </div>
              ) : (
                addresses.map((addr) => {
                  const isDef = Boolean(addr.is_default)
                  const fullText = [
                    addr.address_line1,
                    addr.address_line2,
                    addr.landmark ? `(Near ${addr.landmark})` : null,
                    addr.city,
                    addr.postal_code,
                  ]
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <div
                      key={addr.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        isDef
                          ? 'border-chili-300 bg-cream-50/40'
                          : 'border-cream-200 bg-white hover:border-cream-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-100 text-ink-700 text-[10px]">
                            {addr.address_type === 'WORK' ? (
                              <Briefcase className="h-3 w-3" />
                            ) : addr.address_type === 'OTHER' ? (
                              <Building className="h-3 w-3" />
                            ) : (
                              <Home className="h-3 w-3" />
                            )}
                          </span>
                          <span className="text-xs font-bold text-ink-900">
                            {addr.recipient_name || 'Delivery Address'}
                          </span>
                          {isDef ? (
                            <span className="rounded-full bg-success-50 text-success-700 text-[9px] font-bold px-1.5 py-0.2">
                              DEFAULT
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(addr)}
                            className="p-1 text-ink-400 hover:text-ink-800"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this address?')) {
                                deleteMutation.mutate(addr.id)
                              }
                            }}
                            className="p-1 text-ink-400 hover:text-chili-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-1 text-xs text-ink-600 leading-snug">{fullText}</p>
                      {addr.recipient_phone ? (
                        <p className="mt-0.5 text-[11px] text-ink-400">Phone: {addr.recipient_phone}</p>
                      ) : null}

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-cream-100">
                        {!isDef ? (
                          <button
                            type="button"
                            onClick={() => defaultMutation.mutate(addr.id)}
                            className="text-[11px] font-medium text-chili-600 hover:underline"
                          >
                            Set as default
                          </button>
                        ) : (
                          <span className="text-[11px] text-success-700 font-medium flex items-center gap-1">
                            <Check className="h-3 w-3" /> Primary address
                          </span>
                        )}

                        {onSelectAddress ? (
                          <Button
                            variant="primary"
                            onClick={() => {
                              onSelectAddress(fullText)
                              onClose()
                            }}
                            className="text-xs py-1 px-3"
                          >
                            Use this
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
