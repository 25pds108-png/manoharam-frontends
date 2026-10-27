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
  Utensils,
  Wheat,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { getPlanDetails } from '../api/subscriptions'
import { getPlanDietaryType } from '../lib/planDietaryType'

export default function PlanDetails() {
  const { planId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscription', 'plan-details', planId],
    queryFn: () => getPlanDetails(planId),
  })

  const plan = data?.plan
  const products = data?.products ?? []
  const dietaryType = plan ? getPlanDietaryType(plan) : 'VEG'
  const heroImage = plan?.image_url || plan?.image || products.find((p) => p.image_url)?.image_url

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

  return (
    <AppShell maxWidth="max-w-2xl">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-[#FAF6EF]/90 px-4 py-3 backdrop-blur-md border-b border-[#E6D9C5]/60">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1C1917] shadow-xs border border-[#E6D9C5] hover:bg-[#FAF6EF] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="truncate font-serif text-base font-bold text-[#1C1917]">
          {plan?.name ?? 'Plan Details'}
        </h1>
      </div>

      <div className="px-4 pb-44 sm:px-6 md:pb-28">
        {isLoading ? (
          <PlanDetailsSkeleton />
        ) : isError || !plan ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#F9C5C5] bg-[#FDF2F2] p-8 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#9B2C2C] shadow-xs">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <p className="font-serif text-sm font-bold text-[#1C1917]">This plan could not be loaded</p>
            <p className="text-xs text-[#78716C]">Please check your connection and retry.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 flex items-center gap-1.5 rounded-md border border-[#9B2C2C]/30 bg-white px-4 py-2 text-xs font-bold text-[#9B2C2C] shadow-xs hover:bg-[#9B2C2C] hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <>
            {/* Plan Hero Image */}
            <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E6D9C5] bg-[#F3EBDD]">
              {heroImage ? (
                <img src={heroImage} alt={plan.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#9B2C2C]/40">
                  <Utensils className="h-10 w-10" />
                </div>
              )}
              <div className="absolute left-3 top-3">
                <DietaryPill type={dietaryType} />
              </div>
              <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-[#1C1917] shadow-sm backdrop-blur-xs">
                ₹{Number(plan.price_per_week ?? 0).toFixed(0)}
                <span className="font-normal text-[#78716C]"> /week</span>
              </div>
            </div>

            {/* Plan Title & Tagline */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#FCE4E4] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#9B2C2C]">
                  {plan.category}
                </span>
                <span className="font-serif text-xs italic text-[#78716C]">
                  “Safe, as your mother's home.”
                </span>
              </div>

              <h2 className="mt-2 font-serif text-2xl font-bold text-[#1C1917]">{plan.name}</h2>
              {plan.description ? (
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#44403C]">
                  {plan.description}
                </p>
              ) : null}
            </div>

            {/* Nutrition summary */}
            {products.length > 0 ? (
              <div className="mt-5 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 shadow-xs">
                <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Weekly Nutrition Overview
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  <NutritionStat icon={Flame} label="Calories" value={Math.round(totals.calories)} />
                  <NutritionStat icon={Beef} label="Protein" value={Math.round(totals.protein)} unit="g" />
                  <NutritionStat icon={Wheat} label="Carbs" value={Math.round(totals.carbs)} unit="g" />
                  <NutritionStat icon={Droplet} label="Fat" value={Math.round(totals.fat)} unit="g" />
                  <NutritionStat icon={Leaf} label="Fiber" value={Math.round(totals.fiber)} unit="g" />
                </div>
              </div>
            ) : null}

            {/* Included products */}
            <div className="mt-6">
              <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Included Delicacies ({products.length})
              </p>

              {products.length === 0 ? (
                <p className="mt-3 text-xs text-[#78716C]">Items for this plan rotation will be announced soon.</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {products.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Subscribe CTA */}
      {!isLoading && plan ? (
        <div className="fixed inset-x-0 bottom-[calc(3.85rem+env(safe-area-inset-bottom))] z-30 border-t border-[#E6D9C5] bg-[#FAF6EF]/95 px-4 py-3 backdrop-blur-md md:bottom-0 md:z-10 shadow-lg">
          <div className="flex items-center justify-between gap-4 md:mx-auto md:max-w-2xl">
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#78716C]">Weekly plan starting at</p>
              <p className="font-serif text-lg font-bold text-[#9B2C2C]">
                ₹{Number(plan.price_per_week ?? 0).toFixed(0)}
                <span className="text-xs font-normal text-[#78716C]"> /week</span>
              </p>
            </div>
            <Link
              to={`/subscribe/${plan.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#9B2C2C] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23] active:scale-95 transition-all"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

function DietaryPill({ type }) {
  const isVeg = type === 'VEG'
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-[#1C1917] shadow-xs backdrop-blur-xs">
      <span
        className={[
          'flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border-[1.5px] bg-white',
          isVeg ? 'border-[#15803D]' : 'border-[#9B2C2C]',
        ].join(' ')}
      >
        <span className={['h-1.5 w-1.5 rounded-full', isVeg ? 'bg-[#15803D]' : 'bg-[#9B2C2C]'].join(' ')} />
      </span>
      {isVeg ? 'Pure Veg' : 'Non-Veg'}
    </span>
  )
}

function NutritionStat({ icon: Icon, label, value, unit }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-[#E6D9C5] bg-[#FAF6EF] py-2 text-center">
      <Icon className="h-3.5 w-3.5 text-[#9B2C2C]" />
      <span className="font-serif text-sm font-bold text-[#1C1917]">
        {value}
        {unit ? <span className="text-xs font-normal text-[#78716C]">{unit}</span> : null}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-[#78716C]">{label}</span>
    </div>
  )
}

function ProductRow({ product }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-3 shadow-2xs">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAF6EF] text-xs font-bold text-[#9B2C2C] border border-[#E6D9C5]">
        {product.delivery_order}
      </div>

      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#F3EBDD]">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#9B2C2C]/50">
            <Utensils className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-xs font-bold text-[#1C1917] sm:text-sm">{product.name}</p>
        <p className="text-[11px] text-[#78716C]">
          {product.quantity} {product.unit}
        </p>
      </div>

      {product.nutrition?.calories ? (
        <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#78716C]">
          <Flame className="h-3.5 w-3.5 text-[#D97706]" />
          <span>{Math.round(product.nutrition.calories)} cal</span>
        </div>
      ) : null}
    </li>
  )
}

function PlanDetailsSkeleton() {
  return (
    <div className="mt-3 animate-pulse space-y-4">
      <div className="aspect-[4/3] w-full rounded-2xl bg-[#F3EBDD]" />
      <div className="h-4 w-1/4 rounded bg-[#F3EBDD]" />
      <div className="h-6 w-2/3 rounded bg-[#F3EBDD]" />
      <div className="h-16 w-full rounded-xl bg-[#F3EBDD]" />
    </div>
  )
}