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
      <div className="px-4 py-6 sm:px-6">
        {/* User Profile Card */}
        <div className="rounded-2xl border border-[#E6D9C5] bg-[#FFFEFC] p-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#9B2C2C] font-serif text-2xl font-bold text-white ring-4 ring-[#FCE4E4]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-xl font-bold text-[#1C1917] truncate">
                  {profile?.name}
                </h1>
                <button
                  onClick={handleOpenEdit}
                  className="rounded-full p-1.5 text-[#78716C] hover:bg-[#FAF6EF] hover:text-[#9B2C2C] transition-colors"
                  aria-label="Edit profile details"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-[#78716C] truncate mt-0.5">{profile?.email}</p>
              {profile?.phone ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#44403C]">
                  <Phone className="h-3 w-3 text-[#9B2C2C]" />
                  <span>{profile.phone}</span>
                </p>
              ) : null}
            </div>
          </div>

          {profile?.address ? (
            <div className="mt-4 border-t border-[#E6D9C5] pt-3 flex items-start gap-2 text-xs text-[#44403C]">
              <MapPin className="h-3.5 w-3.5 text-[#9B2C2C] shrink-0 mt-0.5" />
              <p className="line-clamp-2">{profile.address}</p>
            </div>
          ) : null}
        </div>

        {/* Spend & Order Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 flex items-center gap-3 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF6EF] text-[#9B2C2C] border border-[#E6D9C5]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-[#1C1917]">{orders.length}</p>
              <p className="text-[11px] text-[#78716C]">Orders placed</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 flex items-center gap-3 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF6EF] text-[#9B2C2C] border border-[#E6D9C5]">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-[#1C1917]">
                ₹{totalSpent.toFixed(0)}
              </p>
              <p className="text-[11px] text-[#78716C]">Total purchases</p>
            </div>
          </div>
        </div>

        {/* Account Quick Links */}
        <p className="mt-6 font-serif text-xs font-bold uppercase tracking-wider text-[#78716C] px-1">
          Account & Delivery Preferences
        </p>

        <div className="mt-2 divide-y divide-[#E6D9C5] rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] shadow-xs overflow-hidden">
          <Link
            to="/orders"
            className="flex items-center gap-3 p-3.5 hover:bg-[#FAF6EF] transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FAF6EF] text-[#44403C]">
              <Package className="h-4 w-4" />
            </div>
            <span className="flex-1 text-xs font-bold text-[#1C1917]">My Orders & Invoices</span>
            <ChevronRight className="h-4 w-4 text-[#A8A29E]" />
          </Link>

          <Link
            to="/subscription"
            className="flex items-center gap-3 p-3.5 hover:bg-[#FAF6EF] transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FAF6EF] text-[#44403C]">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <span className="flex-1 text-xs font-bold text-[#1C1917]">My Meal Subscriptions</span>
            <ChevronRight className="h-4 w-4 text-[#A8A29E]" />
          </Link>

          <button
            type="button"
            onClick={() => setAddressBookOpen(true)}
            className="flex w-full items-center gap-3 p-3.5 text-left hover:bg-[#FAF6EF] transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FAF6EF] text-[#44403C]">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="flex-1 text-xs font-bold text-[#1C1917]">Saved Delivery Addresses</span>
            <ChevronRight className="h-4 w-4 text-[#A8A29E]" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPasswordError(null)
              setPasswordSuccess(null)
              setPasswordOpen(true)
            }}
            className="flex w-full items-center gap-3 p-3.5 text-left hover:bg-[#FAF6EF] transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FAF6EF] text-[#44403C]">
              <Lock className="h-4 w-4" />
            </div>
            <span className="flex-1 text-xs font-bold text-[#1C1917]">Security & Password</span>
            <ChevronRight className="h-4 w-4 text-[#A8A29E]" />
          </button>
        </div>

        {/* Brand promise */}
        <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-[#E6D9C5] bg-[#FAF6EF] p-3 text-xs text-[#78716C]">
          <ShieldCheck className="h-4 w-4 text-[#15803D] shrink-0" />
          <p className="font-serif italic text-xs text-[#9B2C2C]">
            “Safe, as your mother's home.”
          </p>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-[#9B2C2C]/30 bg-[#FFFEFC] py-3 text-xs font-bold text-[#9B2C2C] shadow-xs hover:bg-[#FDF2F2] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6D9C5] pb-3">
              <h3 className="font-serif text-base font-bold text-[#1C1917]">Edit Profile</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-full p-1 text-[#78716C] hover:bg-[#FAF6EF]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#44403C]">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#44403C]">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#44403C]">Delivery Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Door No, Street, Area, City, Pincode"
                  className="mt-1 w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C]"
                />
              </div>

              {editError ? (
                <p className="text-xs font-bold text-[#9B2C2C]">{editError}</p>
              ) : null}

              <div className="mt-4 flex gap-2 justify-end pt-2 border-t border-[#E6D9C5]">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  disabled={editSaving}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold text-[#78716C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-md bg-[#9B2C2C] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23]"
                >
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Change Password Modal */}
      {passwordOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6D9C5] pb-3">
              <h3 className="font-serif text-base font-bold text-[#1C1917]">Change Password</h3>
              <button
                onClick={() => setPasswordOpen(false)}
                className="rounded-full p-1 text-[#78716C] hover:bg-[#FAF6EF]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSavePassword} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#44403C]">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1 w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#44403C]">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-1 w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C]"
                />
              </div>

              {passwordError ? (
                <p className="text-xs font-bold text-[#9B2C2C]">{passwordError}</p>
              ) : null}

              {passwordSuccess ? (
                <p className="flex items-center gap-1.5 text-xs font-bold text-[#15803D]">
                  <Check className="h-3.5 w-3.5" /> {passwordSuccess}
                </p>
              ) : null}

              <div className="mt-4 flex gap-2 justify-end pt-2 border-t border-[#E6D9C5]">
                <button
                  type="button"
                  onClick={() => setPasswordOpen(false)}
                  disabled={passwordSaving}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold text-[#78716C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="rounded-md bg-[#9B2C2C] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23]"
                >
                  {passwordSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
