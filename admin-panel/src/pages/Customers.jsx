import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, User } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { listCustomers, updateCustomerStatus } from '../api/customers'

export default function Customers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'customers', submittedSearch, page],
    queryFn: () => listCustomers({ search: submittedSearch, page, limit }),
    keepPreviousData: true,
  })

  const statusMutation = useMutation({
    mutationFn: updateCustomerStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
    },
  })

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSubmittedSearch(search.trim())
  }

  const handleStatusChange = (customer, newStatus) => {
    if (customer.status === newStatus) return
    const confirmMsg =
      newStatus === 'blocked'
        ? `Are you sure you want to BLOCK customer ${customer.name}? They will be unable to log in.`
        : `Update status of ${customer.name} to "${newStatus}"?`
    if (window.confirm(confirmMsg)) {
      statusMutation.mutate({ customerId: customer.id, status: newStatus })
    }
  }

  const customers = data?.customers ?? []
  const totalPages = data?.total_pages ?? 1
  const totalCustomers = data?.total_customers ?? 0

  return (
    <DashboardShell>
      <PageHeader
        title="Customer Directory"
        description="Search customer profiles, view order volumes, and manage account statuses."
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-pill border border-cream-300 bg-white py-2 pl-10 pr-24 text-sm text-ink-900 placeholder:text-ink-300 outline-none focus:border-chili-400"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-pill bg-chili-500 px-3.5 py-1 text-xs font-semibold text-white hover:bg-chili-600"
          >
            Search
          </button>
        </form>

        <p className="text-sm text-ink-500 self-center">
          Total customers: <strong className="text-ink-900">{totalCustomers}</strong>
        </p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-ink-300">Loading customer accounts…</p>
        ) : isError ? (
          <p className="py-12 text-center text-sm text-chili-500">
            Error loading customers: {error?.message || 'Failed to fetch'}
          </p>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center">
            <User className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-2 text-sm font-medium text-ink-900">No customers found</p>
            <p className="text-xs text-ink-400">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Subscriptions</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {customers.map((c) => {
                  const statusTone =
                    c.status === 'active' ? 'forest' : c.status === 'blocked' ? 'chili' : 'warning'
                  return (
                    <tr key={c.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/customers/${c.id}`}
                          className="font-semibold text-ink-900 hover:text-chili-500 flex items-center gap-2"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-200 font-bold text-ink-700 uppercase">
                            {c.name?.slice(0, 1) || 'C'}
                          </div>
                          <span>{c.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-ink-800">{c.email}</p>
                        <p className="text-ink-400">{c.phone || '—'}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-ink-900">
                        {c.total_orders}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-ink-900">
                        {c.total_subscriptions}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-chili-600">
                        ₹{Number(c.total_spent || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge tone={statusTone}>{c.status?.toUpperCase() || 'ACTIVE'}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={c.status}
                            disabled={statusMutation.isLoading}
                            onChange={(e) => handleStatusChange(c, e.target.value)}
                            className="rounded-lg border border-cream-300 bg-white px-2 py-1 text-xs text-ink-900 outline-none focus:border-chili-400"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Blocked</option>
                          </select>
                          <Link
                            to={`/customers/${c.id}`}
                            className="rounded-lg bg-cream-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-cream-300"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-cream-200 px-4 py-3 bg-cream-50/30">
            <p className="text-xs text-ink-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-cream-300 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-cream-300 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </DashboardShell>
  )
}
