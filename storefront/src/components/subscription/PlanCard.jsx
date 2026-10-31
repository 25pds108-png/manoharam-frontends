import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, ShieldCheck } from 'lucide-react'
import ProductImage from '../ProductImage'
import { getPlanDietaryType } from '../../lib/planDietaryType'
import { useAuth } from '../../context/AuthContext'

/**
 * Clean Indian dietary indicator mark (green square with dot for Veg, crimson for Non-Veg).
 */
function DietaryMark({ isVeg = true }) {
  return (
    <span
      title={isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
      aria-label={isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
      className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border-[1.5px] bg-white shrink-0 ${
        isVeg ? 'border-success-500' : 'border-chili-600'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isVeg ? 'bg-success-500' : 'bg-chili-600'
        }`}
      />
    </span>
  )
}

export default function PlanCard({ plan }) {
  const { isAuthenticated } = useAuth()
  const dietaryType = getPlanDietaryType(plan)
  const isVeg = dietaryType === 'VEG'
  const products = plan.products ?? []
  const rawImage = plan.image_url || plan.image || plan.products?.[0]?.image_url || ''
  const previewText = products.map((p) => p.name).join(' · ') || plan.description || ''
  const pricePerWeek = Number(plan.price_per_week ?? 0)
  const pricePerDay = pricePerWeek / 7

  const subscribeTo = isAuthenticated ? `/subscribe/${plan.id}` : '/login'
  const subscribeState = isAuthenticated ? undefined : { from: { pathname: `/subscribe/${plan.id}` } }

  return (
    <div className="card-hover-effect group flex flex-col overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 shadow-xs focus-within:ring-2 focus-within:ring-chili-500">
      {/* Plan Visual Image Header — Clean food photography without ugly sticker overlays */}
      <Link
        to={`/plans/${plan.id}`}
        className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-cream-200/50 block cursor-pointer"
      >
        <ProductImage
          src={rawImage}
          alt={plan.name}
          category={plan.category}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Dietary Pill badge positioned delicately in top left */}
        <div className="absolute left-3 top-3">
          <div className="flex items-center gap-1.5 rounded-full bg-cream-50/95 px-2.5 py-1 shadow-xs backdrop-blur-md border border-cream-300/60">
            <DietaryMark isVeg={isVeg} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isVeg ? 'text-success-600' : 'text-chili-600'}`}>
              {isVeg ? 'Pure Veg' : 'Non-Veg'}
            </span>
          </div>
        </div>
      </Link>

      {/* Plan Details Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <Link to={`/plans/${plan.id}`} className="block">
            <h3 className="font-serif text-lg font-bold text-ink-900 group-hover:text-chili-600 transition-colors line-clamp-1 leading-snug">
              {plan.name}
            </h3>
          </Link>

          {previewText ? (
            <p className="line-clamp-2 text-xs text-ink-600 leading-relaxed font-normal">
              {previewText}
            </p>
          ) : (
            <p className="text-xs text-ink-400 italic">
              Traditional South Indian home-cooked meal rotation.
            </p>
          )}

          {/* Value feature tags */}
          <div className="flex items-center gap-3 pt-1 text-[11px] text-ink-500 font-medium">
            <span className="inline-flex items-center gap-1 text-amber-600">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>1-Tap Date Skipping</span>
            </span>
            <span className="text-cream-300">·</span>
            <span className="inline-flex items-center gap-1 text-success-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Daily Delivery</span>
            </span>
          </div>
        </div>

        {/* Pricing & Subscription Action Bar — Integrated, prominent, and cohesive */}
        <div className="pt-3.5 border-t border-cream-300/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl sm:text-2xl font-bold text-chili-600 tabular-nums leading-none">
                ₹{pricePerWeek.toFixed(0)}
              </span>
              <span className="text-xs font-medium text-ink-500">/week</span>
            </div>
            {pricePerWeek > 0 ? (
              <p className="text-[11px] font-medium text-ink-400 mt-0.5">
                ≈ ₹{pricePerDay.toFixed(0)} / day
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/plans/${plan.id}`}
              className="text-xs font-semibold text-ink-600 hover:text-chili-600 px-2 py-1.5 transition-colors"
            >
              Details
            </Link>
            <Link
              to={subscribeTo}
              state={subscribeState}
              className="inline-flex items-center gap-1.5 rounded-xl bg-chili-600 px-4 py-2 text-xs font-bold text-cream-50 hover:bg-chili-700 active:scale-95 transition-all shadow-xs"
            >
              <span>Subscribe</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}