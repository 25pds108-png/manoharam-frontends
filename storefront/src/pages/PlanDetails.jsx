import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Beef,
  Droplet,
  Flame,
  Leaf,
  RefreshCw,
  Wheat,
  ShieldCheck,
  CalendarCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import ProductImage from '../components/ProductImage'
import Button from '../components/ui/Button'
import { getPlanDetails } from '../api/subscriptions'
import { getPlanDietaryType } from '../lib/planDietaryType'
import { useAuth } from '../context/AuthContext'

export default function PlanDetails() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscription', 'plan-details', planId],
    queryFn: () => getPlanDetails(planId),
  })

  const plan = data?.plan
  const products = data?.products ?? []
  const dietaryType = plan ? getPlanDietaryType(plan) : 'VEG'
  const isVeg = dietaryType === 'VEG'
  const heroImage = plan?.image_url || plan?.image || ''

  const totals = products.reduce(
    (acc, p) => ({
      calories: acc.calories + (p.nutrition?.calories ?? 0),
      protein: acc.protein + (p.nutrition?.protein ?? 0),
      carbs: acc.carbs + (p.nutrition?.carbs ?? 0),
      fat: acc.fat + (p.nutrition?.fat ?? 0),
      fiber: acc.fiber + (p.nutrition?.fiber ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  )

  const pricePerWeek = Number(plan?.price_per_week ?? 0)
  const pricePerDay = pricePerWeek / 7

  return (
    <AppShell maxWidth="max-w-4xl">
      {/* Top Back Navigation Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-cream-100/95 px-4 py-3.5 backdrop-blur-md border-b border-cream-300">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-50 text-ink-900 shadow-xs border border-cream-300 hover:bg-cream-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-chili-600 block">
            Plan Details
          </span>
          <h1 className="truncate font-serif text-base sm:text-lg font-bold text-ink-900">
            {plan?.name ?? 'Plan Details'}
          </h1>
        </div>
        <div className="w-10 shrink-0" />
      </div>

      <div className="px-4 pb-48 pt-4 sm:px-6 md:pb-36 space-y-8 animate-fade-in">
        {isLoading ? (
          <PlanDetailsSkeleton />
        ) : isError || !plan ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-chili-200 bg-chili-50 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-50 text-chili-600 shadow-xs">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="font-serif text-lg font-bold text-ink-900">This plan could not be loaded</p>
            <p className="text-xs text-ink-500">Please check your connection and retry.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : (
          <>
            {/* Plan Hero Presentation */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl border border-cream-300 bg-cream-200 shadow-md">
              <ProductImage
                src={heroImage}
                alt={plan.name}
                category={plan.category}
                className="h-full w-full object-cover"
              />

              {/* Ambient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />

              {/* Dietary Pill */}
              <div className="absolute left-4 top-4">
                <DietaryPill isVeg={isVeg} />
              </div>

              {/* Price badge */}
              <div className="absolute bottom-4 right-4 rounded-2xl bg-ink-950/85 px-4 py-2 text-cream-50 shadow-md backdrop-blur-md border border-cream-300/20">
                <span className="font-serif text-xl sm:text-2xl font-bold text-amber-300 tabular-nums">
                  ₹{pricePerWeek.toFixed(0)}
                </span>
                <span className="font-normal text-cream-200 text-xs"> /week</span>
              </div>
            </div>

            {/* Plan Header Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md bg-chili-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-chili-600">
                  {plan.category || 'Continuous Rotation'}
                </span>
                <span className="font-serif text-xs italic font-semibold text-chili-600">
                  “Safe, as your mother&apos;s home.”
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ink-900 leading-tight">
                {plan.name}
              </h2>

              {plan.description ? (
                <p className="text-sm sm:text-base leading-relaxed text-ink-700 font-sans">
                  {plan.description}
                </p>
              ) : null}

              {/* Daily breakdown estimate */}
              <div className="flex items-center gap-4 pt-2 text-xs text-ink-600 font-medium">
                <span className="inline-flex items-center gap-1.5 text-chili-600 font-semibold">
                  <Sparkles className="h-4 w-4" />
                  <span>≈ ₹{pricePerDay.toFixed(0)} / day</span>
                </span>
                <span className="text-cream-300">·</span>
                <span className="inline-flex items-center gap-1.5 text-amber-600">
                  <CalendarCheck className="h-4 w-4" />
                  <span>1-Tap Date Skipping Anytime</span>
                </span>
                <span className="text-cream-300">·</span>
                <span className="inline-flex items-center gap-1.5 text-success-600">
                  <Clock className="h-4 w-4" />
                  <span>Fresh Morning Delivery</span>
                </span>
              </div>
            </div>

            {/* Nutritional Summary Card */}
            {products.length > 0 ? (
              <div className="rounded-3xl border border-cream-300 bg-cream-50 p-6 shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-chili-600 block">
                    Health & Wellness
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink-900">
                    Weekly Nutritional Overview
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <NutritionStat icon={Flame} label="Calories" value={Math.round(totals.calories)} />
                  <NutritionStat icon={Beef} label="Protein" value={Math.round(totals.protein)} unit="g" />
                  <NutritionStat icon={Wheat} label="Carbs" value={Math.round(totals.carbs)} unit="g" />
                  <NutritionStat icon={Droplet} label="Fat" value={Math.round(totals.fat)} unit="g" />
                  <NutritionStat icon={Leaf} label="Fiber" value={Math.round(totals.fiber)} unit="g" />
                </div>
              </div>
            ) : null}

            {/* Included products */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-chili-600 block">
                  Curated Kitchen Menu
                </span>
                <h3 className="font-serif text-xl font-bold text-ink-900">
                  Included Delicacies & Rotations ({products.length})
                </h3>
              </div>

              {products.length === 0 ? (
                <div className="rounded-2xl border border-cream-300 bg-cream-50 p-6 text-center text-xs text-ink-500">
                  Items for this plan rotation will be announced soon.
                </div>
              ) : (
                <ul className="space-y-3">
                  {products.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </ul>
              )}
            </div>

            {/* Quality Standard */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-cream-300 bg-cream-50 p-5 text-xs text-ink-700 shadow-2xs">
              <ShieldCheck className="h-6 w-6 text-success-500 shrink-0" />
              <p className="leading-relaxed">
                <strong className="font-bold text-ink-900">Kitchen Purity Guarantee:</strong> Every meal rotation is slow-cooked fresh on the delivery morning using 100% cold-pressed oils, stone-ground masalas, and zero artificial preservatives. Safe for everyone in your family.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Subscribe CTA */}
      {!isLoading && plan ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-100/95 px-4 py-4 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between gap-4 mx-auto max-w-4xl">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-ink-500">Weekly plan rate</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-chili-600 tabular-nums leading-none mt-0.5">
                ₹{pricePerWeek.toFixed(0)}
                <span className="text-xs font-normal text-ink-500"> /week</span>
              </p>
            </div>
            {isAuthenticated ? (
              <Link to={`/subscribe/${plan.id}`}>
                <Button variant="primary" size="lg" className="px-6 py-3.5 shadow-md">
                  <span>Continue to Schedule</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/login" state={{ from: { pathname: `/subscribe/${plan.id}` } }}>
                <Button variant="primary" size="lg" className="px-6 py-3.5 shadow-md">
                  <span>Sign In to Subscribe</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

function DietaryPill({ isVeg }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-cream-50/95 px-3 py-1 text-xs font-bold text-ink-900 shadow-sm backdrop-blur-md">
      <span
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border-[1.5px] bg-cream-50 ${
          isVeg ? 'border-success-500' : 'border-chili-600'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isVeg ? 'bg-success-500' : 'bg-chili-600'
          }`}
        />
      </span>
      <span>{isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
    </span>
  )
}

function NutritionStat({ icon: Icon, label, value, unit }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-cream-300 bg-cream-100/70 p-3 text-center shadow-2xs">
      <Icon className="h-4 w-4 text-chili-600" />
      <span className="font-serif text-base font-bold text-ink-900 tabular-nums">
        {value}
        {unit ? <span className="text-xs font-normal text-ink-500">{unit}</span> : null}
      </span>
      <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500">{label}</span>
    </div>
  )
}

function ProductRow({ product }) {
  return (
    <li className="flex items-center gap-3.5 rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-xs transition-transform hover:-translate-y-0.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chili-100 text-xs font-bold text-chili-600 border border-chili-200 tabular-nums">
        {product.delivery_order || 1}
      </div>

      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200 border border-cream-300/60">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-base font-bold text-ink-900">{product.name}</p>
        <p className="text-xs text-ink-500 mt-0.5">
          {product.quantity} {product.unit}
        </p>
      </div>

      {product.nutrition?.calories ? (
        <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-lg border border-amber-300/60">
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span className="tabular-nums">{Math.round(product.nutrition.calories)} cal</span>
        </div>
      ) : null}
    </li>
  )
}

function PlanDetailsSkeleton() {
  return (
    <div className="mt-4 animate-pulse space-y-6">
      <div className="aspect-[16/9] w-full rounded-3xl bg-cream-200" />
      <div className="h-6 w-1/3 rounded-lg bg-cream-200" />
      <div className="h-10 w-2/3 rounded-lg bg-cream-200" />
      <div className="h-28 w-full rounded-3xl bg-cream-200" />
    </div>
  )
}