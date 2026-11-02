import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Users,
  Sparkles,
  CalendarCheck,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ChevronRight,
} from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import ProductImage from '../components/ui/ProductImage'
import EmptyState from '../components/ui/EmptyState'
import CreatePlanWizardModal from '../components/subscriptions/CreatePlanWizardModal'
import { useCursorList } from '../hooks/useCursorList'
import { listSubscriptions, listSubscriptionPlans } from '../api/subscriptions'

const TABS = [
  { id: 'subscribers', label: 'Active Subscribers', icon: Users },
  { id: 'plans', label: 'Meal Subscription Plans', icon: Sparkles },
]

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('subscribers')
  const [createPlanOpen, setCreatePlanOpen] = useState(false)
  const queryClient = useQueryClient()

  const subscriptionsQuery = useCursorList({
    queryKey: ['subscriptions'],
    queryFn: listSubscriptions,
    itemsKey: 'subscriptions',
  })

  const plansQuery = useCursorList({
    queryKey: ['subscription-plans'],
    queryFn: listSubscriptionPlans,
    itemsKey: 'plans',
  })

  return (
    <DashboardShell>
      <PageHeader
        title="Meal Subscriptions & Plans"
        description="Manage recurring homestyle meal rotations, scheduled deliveries, and customer subscriptions."
        action={
          <Button onClick={() => setCreatePlanOpen(true)} className="text-xs sm:text-sm">
            <Plus className="h-4 w-4" />
            <span>Create Meal Plan</span>
          </Button>
        }
      />

      {/* TABS SWITCHER */}
      <div className="mb-6 flex w-full sm:w-fit gap-1 rounded-2xl bg-white p-1.5 shadow-2xs border border-cream-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all select-none ${
              activeTab === id
                ? 'bg-chili-600 text-cream-50 shadow-xs'
                : 'text-ink-700 hover:bg-cream-100 hover:text-ink-950'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'subscribers' ? (
        <SubscribersTab query={subscriptionsQuery} />
      ) : (
        <PlansTab query={plansQuery} onOpenCreate={() => setCreatePlanOpen(true)} />
      )}

      {/* 4-Step Create Plan Wizard Modal */}
      <CreatePlanWizardModal
        open={createPlanOpen}
        onClose={() => setCreatePlanOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
          setActiveTab('plans')
        }}
      />
    </DashboardShell>
  )
}

function SubscribersTab({ query }) {
  const {
    items: subscriptions,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = query

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((sub) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        sub.customer_name?.toLowerCase().includes(q) ||
        sub.phone?.includes(q) ||
        sub.plan_name?.toLowerCase().includes(q) ||
        sub.product_name?.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [subscriptions, search, statusFilter])

  return (
    <div className="space-y-4">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-cream-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search subscribers by name, phone, or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm outline-none focus:border-chili-500 focus:bg-white transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-ink-700 outline-none focus:border-chili-500"
        >
          <option value="ALL">All Statuses ({subscriptions.length})</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-xs text-ink-400">Loading subscribers…</Card>
      ) : isError ? (
        <Card className="p-8 text-center text-chili-600 text-xs">
          Couldn't load customer subscriptions.
        </Card>
      ) : filteredSubs.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={search ? 'No matching subscribers found' : 'No customer subscriptions yet'}
          description={
            search
              ? 'Try modifying your search query or status filter.'
              : 'Customer recurring meal orders and subscription cycles will appear here.'
          }
        />
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-cream-200 bg-cream-50/70 text-xs font-bold uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Subscription Plan</th>
                    <th className="px-5 py-3.5">Active Period</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-xs">
                  {filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-ink-950 text-sm">{sub.customer_name}</p>
                        <p className="text-[11px] text-ink-500">{sub.phone}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-ink-900">{sub.plan_name || 'Meal Plan'}</p>
                        {sub.product_name ? (
                          <p className="text-[11px] text-ink-500">Dish: {sub.product_name}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span>{sub.start_date}</span>
                          <span className="text-cream-400">→</span>
                          <span>{sub.end_date}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={toneForStatus(sub.status)}>
                          {formatStatusLabel(sub.status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/subscriptions/${sub.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-chili-600 hover:bg-chili-50 transition-colors"
                        >
                          <span>Manage</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card List View (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredSubs.map((sub) => (
              <Link key={sub.id} to={`/subscriptions/${sub.id}`} className="block">
                <Card className="p-4 space-y-3 hover:border-cream-400 transition-colors">
                  <div className="flex items-start justify-between gap-2 border-b border-cream-100 pb-2.5">
                    <div>
                      <p className="font-bold text-ink-950 text-sm">{sub.customer_name}</p>
                      <p className="text-xs text-ink-500">{sub.phone}</p>
                    </div>
                    <Badge tone={toneForStatus(sub.status)}>
                      {formatStatusLabel(sub.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-ink-400 block">
                        Plan
                      </span>
                      <span className="font-semibold text-ink-900">{sub.plan_name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-ink-400 block">
                        Schedule
                      </span>
                      <span className="font-medium text-ink-700">
                        {sub.start_date} – {sub.end_date}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cream-100 flex items-center justify-end text-xs font-bold text-chili-600">
                    <span>Manage Subscriber →</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            size="sm"
          >
            Load More Subscribers
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function PlansTab({ query, onOpenCreate }) {
  const { items: plans, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = query
  const [search, setSearch] = useState('')

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const q = search.toLowerCase().trim()
      return (
        !q ||
        plan.name?.toLowerCase().includes(q) ||
        plan.category?.toLowerCase().includes(q) ||
        plan.description?.toLowerCase().includes(q)
      )
    })
  }, [plans, search])

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-cream-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search plans by name, diet, or rotation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm outline-none focus:border-chili-500 focus:bg-white transition-colors"
          />
        </div>
        <span className="text-xs font-semibold text-ink-600 self-center">
          {filteredPlans.length} Plans Active
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-60 rounded-2xl bg-white border border-cream-200 animate-pulse p-4 space-y-3"
            >
              <div className="h-28 rounded-xl bg-cream-200" />
              <div className="h-4 w-3/4 rounded bg-cream-200" />
              <div className="h-3 w-1/2 rounded bg-cream-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center text-chili-600 text-xs">
          Couldn't load subscription plans.
        </Card>
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={search ? 'No matching plans' : 'No subscription plans created yet'}
          description={
            search
              ? 'Try adjusting your search terms.'
              : 'Create a weekly recurring subscription plan using the 4-step wizard.'
          }
          actionLabel="Create Plan"
          onAction={onOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPlans.map((plan) => {
            const products = plan.products || []
            return (
              <Link key={plan.id} to={`/subscriptions/plans/${plan.id}`} className="group">
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:border-cream-400 group-hover:-translate-y-0.5">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream-100">
                    <ProductImage
                      src={plan.image_url || plan.products?.[0]?.image_url}
                      alt={plan.name}
                      category={plan.category}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <Badge tone={toneForStatus(plan.status)}>
                        {formatStatusLabel(plan.status)}
                      </Badge>
                    </div>
                    {plan.category ? (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="inline-block rounded-md bg-ink-950/80 px-2 py-0.5 text-[10px] font-bold text-cream-50 backdrop-blur-xs">
                          {plan.category === 'VEG' ? 'Pure Vegetarian' : 'Non-Veg'}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-ink-950 group-hover:text-chili-600 transition-colors">
                        {plan.name}
                      </h3>
                      {plan.description ? (
                        <p className="mt-1 text-xs text-ink-500 line-clamp-2 leading-relaxed">
                          {plan.description}
                        </p>
                      ) : null}
                    </div>

                    {/* Delivery rotation preview */}
                    <div className="space-y-1.5 pt-2 border-t border-cream-100">
                      <div className="flex items-center justify-between text-[11px] text-ink-500 font-semibold">
                        <span>Rotation ({products.length} Days)</span>
                        <span className="text-chili-600 font-bold">Details →</span>
                      </div>
                      <div className="flex items-center gap-1 overflow-hidden">
                        {products.slice(0, 4).map((p, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-cream-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 truncate max-w-[90px]"
                            title={p.name}
                          >
                            D{idx + 1}: {p.name}
                          </span>
                        ))}
                        {products.length > 4 ? (
                          <span className="text-[10px] text-ink-400 font-bold">
                            +{products.length - 4}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-cream-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
                          Weekly Price
                        </span>
                        <p className="font-display text-lg font-bold text-chili-600">
                          ₹{Number(plan.price_per_week || 0).toLocaleString('en-IN')}
                          <span className="text-[11px] font-normal text-ink-500 ml-1">/ wk</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-chili-600 group-hover:underline">
                        Manage Plan
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            size="sm"
          >
            Load More Plans
          </Button>
        </div>
      ) : null}
    </div>
  )
}