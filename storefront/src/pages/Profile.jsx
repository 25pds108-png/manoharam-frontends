import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight,
  LogOut,
  Package,
  CalendarCheck,
  Receipt,
  Wallet,
  Edit2,
  Lock,
  Phone,
  MapPin,
  X,
  Check,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import AddressBookModal from '../components/AddressBookModal'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/orders'
import { getProfile, updateProfile, changePassword } from '../api/auth'
import { getApiErrorMessage } from '../api/client'

export default function Profile() {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [addressBookOpen, setAddressBookOpen] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editError, setEditError] = useState(null)
  const [editSaving, setEditSaving] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: getMyOrders,
  })

  const profile = profileData?.profile || authUser
  const orders = ordersData?.orders ?? []
  const totalSpent = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  const initials = (profile?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleOpenEdit = () => {
    setEditName(profile?.name || '')
    setEditPhone(profile?.phone || '')
    setEditAddress(profile?.address || '')
    setEditError(null)
    setEditOpen(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setEditError(null)
    setEditSaving(true)
    try {
      const res = await updateProfile({
        name: editName,
        phone: editPhone,
        address: editAddress,
      })
      if (res.success) {
        setEditOpen(false)
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        refetchProfile()
      } else {
        setEditError(res.message || 'Could not update profile')
      }
    } catch (err) {
      setEditError(getApiErrorMessage(err, 'Could not update profile'))
    } finally {
      setEditSaving(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    setPasswordSaving(true)
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      })
      if (res.success) {
        setPasswordSuccess('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setTimeout(() => {
          setPasswordOpen(false)
          setPasswordSuccess(null)
        }, 1500)
      } else {
        setPasswordError(res.message || 'Could not change password')
      }
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'Could not change password'))
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  return (
    <AppShell>
      <div className="md:mx-auto md:max-w-xl md:pt-10">
        {/* Profile banner */}
        <div className="bg-gradient-to-b from-chili-500 to-chili-600 px-4 pb-14 pt-6 md:rounded-card md:pb-12">
          <p className="font-display text-lg font-semibold text-cream-50/90">My Account</p>
        </div>

        <div className="-mt-10 px-4">
          <Card className="flex items-center gap-4 p-5 shadow-lg shadow-chili-900/10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-chili-500 font-display text-xl font-semibold text-cream-50 ring-4 ring-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate font-display text-lg font-semibold text-ink-900">
                  {profile?.name}
                </p>
                <button
                  onClick={handleOpenEdit}
                  className="rounded-full p-1 text-ink-400 hover:text-chili-500 transition-colors"
                  aria-label="Edit profile"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="truncate text-sm text-ink-500">{profile?.email}</p>
              {profile?.phone ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                  <Phone className="h-3 w-3" /> {profile.phone}
                </p>
              ) : null}
              {profile?.address ? (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-ink-400 line-clamp-1">
                  <MapPin className="h-3 w-3 shrink-0 mt-0.5" /> {profile.address}
                </p>
              ) : null}
            </div>
          </Card>

          {/* Stats */}
          <Card className="mt-4 flex divide-x divide-cream-200 p-0">
            <div className="flex flex-1 items-center gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chili-50 text-chili-500">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-ink-900">{orders.length}</p>
                <p className="text-xs text-ink-500">Orders placed</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chili-50 text-chili-500">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-ink-900">
                  ₹{totalSpent.toFixed(0)}
                </p>
                <p className="text-xs text-ink-500">Total spent</p>
              </div>
            </div>
          </Card>

          <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-wide text-ink-300">
            Account & Security
          </p>
          <Card className="mt-2 divide-y divide-cream-200">
            <Link
              to="/orders"
              className="flex items-center gap-3 p-4 transition-colors hover:bg-cream-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-700">
                <Package className="h-4.5 w-4.5" />
              </div>
              <span className="flex-1 font-medium text-ink-900">Order history</span>
              <ChevronRight className="h-4 w-4 text-ink-300" />
            </Link>
            <Link
              to="/subscription"
              className="flex items-center gap-3 p-4 transition-colors hover:bg-cream-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-700">
                <CalendarCheck className="h-4.5 w-4.5" />
              </div>
              <span className="flex-1 font-medium text-ink-900">My subscription</span>
              <ChevronRight className="h-4 w-4 text-ink-300" />
            </Link>
            <button
              onClick={() => setAddressBookOpen(true)}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-cream-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-700">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <span className="flex-1 font-medium text-ink-900">Saved delivery addresses</span>
              <ChevronRight className="h-4 w-4 text-ink-300" />
            </button>
            <button
              onClick={() => {
                setPasswordError(null)
                setPasswordSuccess(null)
                setPasswordOpen(true)
              }}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-cream-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-700">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <span className="flex-1 font-medium text-ink-900">Change password</span>
              <ChevronRight className="h-4 w-4 text-ink-300" />
            </button>
          </Card>

          <button
            onClick={handleSignOut}
            className="mt-6 mb-8 flex w-full items-center justify-center gap-2 rounded-pill border border-chili-200 bg-white py-3.5 font-semibold text-chili-500 transition-colors hover:bg-chili-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={addressBookOpen}
        onClose={() => setAddressBookOpen(false)}
      />

      {/* Edit Profile Modal */}
      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <Card className="w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink-900">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="rounded-full p-1 text-ink-400 hover:bg-cream-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cream-300 p-2.5 text-sm text-ink-900 focus:border-chili-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full rounded-xl border border-cream-300 p-2.5 text-sm text-ink-900 focus:border-chili-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">Delivery Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street, Door No, Area, City, Pincode"
                  className="mt-1 w-full rounded-xl border border-cream-300 p-2.5 text-sm text-ink-900 focus:border-chili-500 focus:outline-none"
                />
              </div>

              {editError ? (
                <p className="text-xs font-medium text-chili-500">{editError}</p>
              ) : null}

              <div className="mt-5 flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={editSaving}>
                  Cancel
                </Button>
                <Button type="submit" loading={editSaving}>
                  Save changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {/* Change Password Modal */}
      {passwordOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
          <Card className="w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink-900">Change Password</h3>
              <button onClick={() => setPasswordOpen(false)} className="rounded-full p-1 text-ink-400 hover:bg-cream-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSavePassword} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1 w-full rounded-xl border border-cream-300 p-2.5 text-sm text-ink-900 focus:border-chili-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-1 w-full rounded-xl border border-cream-300 p-2.5 text-sm text-ink-900 focus:border-chili-500 focus:outline-none"
                />
              </div>

              {passwordError ? (
                <p className="text-xs font-medium text-chili-500">{passwordError}</p>
              ) : null}

              {passwordSuccess ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-success-600">
                  <Check className="h-3.5 w-3.5" /> {passwordSuccess}
                </p>
              ) : null}

              <div className="mt-5 flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setPasswordOpen(false)} disabled={passwordSaving}>
                  Cancel
                </Button>
                <Button type="submit" loading={passwordSaving}>
                  Update password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </AppShell>
  )
}
