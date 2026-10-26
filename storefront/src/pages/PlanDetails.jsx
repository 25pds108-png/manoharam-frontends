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
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getPlanDetails } from '../api/subscriptions'
import { getPlanDietaryType } from '../lib/planDietaryType'

/**
 * Public, no-auth landing page for a single plan, reached by tapping a
 * PlanCard (`/plans/:planId` — deliberately not under `/subscribe/:planId`,
 * which is already SubscriptionSetup and sits behind RequireAuth). Backed
 * by get_subscription_details.php, the one endpoint that actually returns
 * a plan's real products + nutrition (listSubscribableSalads only has
 * id/name/category/price_per_week).
 *
 * This screen only owns "show the plan." The CTA below hands off to the
 * existing gated flow at `/subscribe/:planId` (SubscriptionSetup ->
 * SubscriptionReview) for date/duration + confirmation — someone not
 * logged in can browse here freely and only hits the auth wall once they
 * tap Continue, via RequireAuth's normal redirect-to-login handling.
 */
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
    <AppShell>
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-cream-50/90 px-4 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink-900 shadow-sm ring-1 ring-ink-900/[0.06] transition-colors duration-200 hover:bg-ink-900/5"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="truncate font-display text-base font-semibold text-ink-900">
          {plan?.name ?? 'Plan details'}
        </h1>
      </div>

      <div className="px-4 pb-44 md:mx-auto md:max-w-xl md:pb-28">
        {isLoading ? (
          <PlanDetailsSkeleton />
        ) : isError || !plan ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-card border border-dashed border-chili-200 bg-chili-50/40 px-5 py-14 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-chili-500 shadow-sm">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <p className="text-sm font-semibold text-ink-900">This plan didn't load</p>
            <p className="text-sm text-ink-500">Check your connection and try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-sm font-semibold text-chili-500 shadow-sm ring-1 ring-chili-200 transition-colors duration-200 hover:bg-chili-500 hover:text-cream-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-card bg-chili-50">
              {heroImage ? (
                <img src={heroImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-chili-300">
                  <Utensils className="h-8 w-8" />
                </div>
              )}
              <div className="absolute left-3 top-3">
                <DietaryPill type={dietaryType} />
              </div>
              <div className="absolute bottom-3 right-3 rounded-pill bg-white/95 px-3 py-1.5 text-sm font-bold text-ink-900 shadow-sm backdrop-blur-sm">
                ₹{Number(plan.price_per_week ?? 0).toFixed(0)}
                <span className="font-normal text-ink-400"> /week</span>
              </div>
            </div>

            {/* Name + category + description */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chili-500">
                {plan.category}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-ink-900">{plan.name}</h2>
              {plan.description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{plan.description}</p>
              ) : null}
            </div>

            {/* Nutrition summary */}
            {products.length > 0 ? (
              <Card className="mt-5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Nutrition, full menu
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  <NutritionStat icon={Flame} label="Calories" value={Math.round(totals.calories)} />
                  <NutritionStat icon={Beef} label="Protein" value={Math.round(totals.protein)} unit="g" />
                  <NutritionStat icon={Wheat} label="Carbs" value={Math.round(totals.carbs)} unit="g" />
                  <NutritionStat icon={Droplet} label="Fat" value={Math.round(totals.fat)} unit="g" />
                  <NutritionStat icon={Leaf} label="Fiber" value={Math.round(totals.fiber)} unit="g" />
                </div>
              </Card>
            ) : null}

            {/* Product list */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                What's included{products.length > 0 ? ` · ${products.length} items` : ''}
              </p>

              {products.length === 0 ? (
                <p className="mt-3 text-sm text-ink-400">No items are listed on this plan yet.</p>
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

      {/* Sticky CTA */}
      {!isLoading && plan ? (
        <div className="fixed inset-x-0 bottom-[calc(3.85rem+env(safe-area-inset-bottom))] z-30 border-t border-ink-900/[0.06] bg-cream-50/95 px-4 py-3 backdrop-blur-sm md:bottom-0 md:z-10">
          <div className="flex items-center justify-between gap-4 md:mx-auto md:max-w-xl">
            <div>
              <p className="text-xs text-ink-400">Starting at</p>
              <p className="font-display text-lg font-semibold text-ink-900">
                ₹{Number(plan.price_per_week ?? 0).toFixed(0)}
                <span className="text-sm font-normal text-ink-400"> /week</span>
              </p>
            </div>
            <Link to={`/subscribe/${plan.id}`} className="shrink-0">
              <Button className="flex items-center gap-1.5">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
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
    <span className="flex items-center gap-1.5 rounded-pill bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur-sm">
      <span
        className={[
          'flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border-[1.5px] bg-white',
          isVeg ? 'border-green-600' : 'border-[#8b2e2e]',
        ].join(' ')}
      >
        <span className={['h-1.5 w-1.5 rounded-full', isVeg ? 'bg-green-600' : 'bg-[#8b2e2e]'].join(' ')} />
      </span>
      {isVeg ? 'Veg' : 'Non-veg'}
    </span>
  )
}

function NutritionStat({ icon: Icon, label, value, unit }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card bg-ink-900/[0.03] py-2.5 text-center">
      <Icon className="h-4 w-4 text-chili-500" />
      <span className="font-display text-sm font-semibold text-ink-900">
        {value}
        {unit ? <span className="text-xs font-normal text-ink-400">{unit}</span> : null}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-ink-300">{label}</span>
    </div>
  )
}

function ProductRow({ product }) {
  return (
    <li className="flex items-center gap-3 rounded-card bg-white p-2.5 shadow-sm shadow-ink-900/5 ring-1 ring-ink-900/[0.04]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chili-50 text-xs font-bold text-chili-500">
        {product.delivery_order}
      </div>

      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-chili-50">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-chili-300">
            <Utensils className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{product.name}</p>
        <p className="text-xs text-ink-400">
          {product.quantity} {product.unit}
        </p>
      </div>

      {product.nutrition?.calories ? (
        <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-ink-400">
          <Flame className="h-3.5 w-3.5 text-chili-400" />
          {Math.round(product.nutrition.calories)}
        </div>
      ) : null}
    </li>
  )
}

function PlanDetailsSkeleton() {
  return (
    <div className="mt-2 animate-pulse">
      <div className="aspect-[4/3] w-full rounded-card bg-ink-900/5" />
      <div className="mt-4 h-3 w-1/4 rounded-full bg-ink-900/5" />
      <div className="mt-2 h-5 w-2/3 rounded-full bg-ink-900/5" />
      <div className="mt-3 h-3 w-full rounded-full bg-ink-900/5" />
      <div className="mt-1.5 h-3 w-5/6 rounded-full bg-ink-900/5" />
      <div className="mt-5 h-20 w-full rounded-card bg-ink-900/5" />
      <div className="mt-6 space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[68px] w-full rounded-card bg-ink-900/5" />
        ))}
      </div>
    </div>
  )
}