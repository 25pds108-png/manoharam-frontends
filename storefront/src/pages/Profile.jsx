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
  ShieldCheck,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AppShell from '../components/layout/AppShell'
import AddressBookModal from '../components/AddressBookModal'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/orders'
import { getProfile, updateProfile, changePassword } from '../api/auth'
import { getApiErrorMessage } from '../api/client'
import Button from '../components/ui/Button'
import { HeritageKolamDivider } from '../components/ui/HeritagePattern'

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
    <AppShell maxWidth="max-w-2xl">
      <div className="animate-fade-in-up px-4 py-6 sm:px-6">
        {/* User Profile Card */}
        <div className="rounded-3xl border border-cream-300 bg-cream-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-chili-600 font-serif text-2xl font-bold text-cream-50 shadow-inner ring-4 ring-chili-200">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h1 className="font-serif text-xl font-bold text-ink-900 truncate">
                  {profile?.name || 'Customer'}
                </h1>
                <button
                  onClick={handleOpenEdit}
                  className="rounded-full p-2 text-ink-500 hover:bg-cream-200 hover:text-chili-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
                  aria-label="Edit profile details"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-ink-500 truncate mt-0.5">{profile?.email}</p>
              {profile?.phone ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-700">
                  <Phone className="h-3.5 w-3.5 text-chili-600" />
                  <span>{profile.phone}</span>
                </p>
              ) : null}
            </div>
          </div>

          {profile?.address ? (
            <div className="mt-4 border-t border-cream-300 pt-3 flex items-start gap-2 text-xs text-ink-700">
              <MapPin className="h-3.5 w-3.5 text-chili-600 shrink-0 mt-0.5" />
              <p className="line-clamp-2">{profile.address}</p>
            </div>
          ) : null}
        </div>

        {/* Spend & Order Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4 flex items-center gap-3.5 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-chili-600 border border-cream-300">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-ink-900">{orders.length}</p>
              <p className="text-[11px] font-medium text-ink-500">Orders placed</p>
            </div>
          </div>

          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4 flex items-center gap-3.5 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-chili-600 border border-cream-300">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold tabular-nums text-ink-900">
                ₹{totalSpent.toFixed(0)}
              </p>
              <p className="text-[11px] font-medium text-ink-500">Total purchases</p>
            </div>
          </div>
        </div>

        <HeritageKolamDivider className="my-5 text-cream-300 opacity-60" />

        {/* Account Quick Links */}
        <p className="mt-2 font-serif text-xs font-bold uppercase tracking-wider text-ink-500 px-1">
          Account & Delivery Preferences
        </p>

        <div className="mt-2 divide-y divide-cream-300 rounded-2xl border border-cream-300 bg-cream-50 shadow-xs overflow-hidden">
          <Link
            to="/orders"
            className="flex items-center gap-3.5 p-4 hover:bg-cream-100 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-200 text-ink-700">
              <Package className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-ink-900">My Orders & Invoices</span>
              <p className="text-[11px] text-ink-500 truncate">Track deliveries and view itemized bills</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-400" />
          </Link>

          <Link
            to="/subscription"
            className="flex items-center gap-3.5 p-4 hover:bg-cream-100 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-200 text-ink-700">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-ink-900">My Meal Subscriptions</span>
              <p className="text-[11px] text-ink-500 truncate">Manage daily schedules, skip meals & renewals</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-400" />
          </Link>

          <button
            type="button"
            onClick={() => setAddressBookOpen(true)}
            className="flex w-full items-center gap-3.5 p-4 text-left hover:bg-cream-100 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-200 text-ink-700">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-ink-900">Saved Delivery Addresses</span>
              <p className="text-[11px] text-ink-500 truncate">Manage home, office and secondary delivery locations</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPasswordError(null)
              setPasswordSuccess(null)
              setPasswordOpen(true)
            }}
            className="flex w-full items-center gap-3.5 p-4 text-left hover:bg-cream-100 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-200 text-ink-700">
              <Lock className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-ink-900">Security & Password</span>
              <p className="text-[11px] text-ink-500 truncate">Update your account login password</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-400" />
          </button>
        </div>

        {/* Brand promise */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-xs">
          <ShieldCheck className="h-5 w-5 text-success-500 shrink-0" />
          <div>
            <p className="font-serif italic text-xs font-bold text-chili-600">
              “Safe, as your mother&apos;s home.”
            </p>
            <p className="text-[11px] text-ink-600 mt-0.5">
              100% natural cold-pressed sesame oil, zero chemicals, and traditional South Indian slow-cooking.
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-chili-300 bg-cream-50 py-3 text-xs font-bold text-chili-600 shadow-xs hover:bg-chili-50 hover:border-chili-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={addressBookOpen}
        onClose={() => setAddressBookOpen(false)}
      />

      {/* Edit Profile Modal */}
      {editOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-3xl border border-cream-300 bg-cream-50 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cream-300 pb-3">
              <h3 className="font-serif text-base font-bold text-ink-900">Edit Profile</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-full p-1 text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-ink-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-100 p-2.5 text-xs text-ink-900 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-700">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-100 p-2.5 text-xs text-ink-900 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-700">Delivery Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Door No, Street, Area, City, Pincode"
                  className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-100 p-2.5 text-xs text-ink-900 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500"
                />
              </div>

              {editError ? (
                <p className="rounded-xl bg-danger-100 p-2.5 text-xs font-bold text-danger-500 border border-danger-200">
                  {editError}
                </p>
              ) : null}

              <div className="mt-4 flex gap-2 justify-end pt-3 border-t border-cream-300">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={editSaving}
                  className="text-xs px-3.5 py-1.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={editSaving}
                  loading={editSaving}
                  className="text-xs px-4 py-1.5"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Change Password Modal */}
      {passwordOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-3xl border border-cream-300 bg-cream-50 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cream-300 pb-3">
              <h3 className="font-serif text-base font-bold text-ink-900">Change Password</h3>
              <button
                onClick={() => setPasswordOpen(false)}
                className="rounded-full p-1 text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSavePassword} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-ink-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-100 p-2.5 text-xs text-ink-900 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-700">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-100 p-2.5 text-xs text-ink-900 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500"
                />
              </div>

              {passwordError ? (
                <p className="rounded-xl bg-danger-100 p-2.5 text-xs font-bold text-danger-500 border border-danger-200">
                  {passwordError}
                </p>
              ) : null}

              {passwordSuccess ? (
                <p className="flex items-center gap-1.5 rounded-xl bg-success-100 p-2.5 text-xs font-bold text-success-500 border border-success-200">
                  <Check className="h-3.5 w-3.5" /> {passwordSuccess}
                </p>
              ) : null}

              <div className="mt-4 flex gap-2 justify-end pt-3 border-t border-cream-300">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordOpen(false)}
                  disabled={passwordSaving}
                  className="text-xs px-3.5 py-1.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={passwordSaving}
                  loading={passwordSaving}
                  className="text-xs px-4 py-1.5"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
