import { Link } from 'react-router-dom'
import { ArrowRight, Utensils } from 'lucide-react'
import { getPlanDietaryType } from '../../lib/planDietaryType'

/**
 * The small green/maroon square-and-dot mark used on Indian food
 * packaging and menus to indicate veg vs. non-veg at a glance.
 */
function DietaryMark({ type }) {
  const isVeg = type === 'VEG'
  return (
    <span
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      className={[
        'flex h-4 w-4 items-center justify-center rounded-[3px] border-[1.5px] bg-white',
        isVeg ? 'border-green-600' : 'border-[#8b2e2e]',
      ].join(' ')}
    >
      <span className={['h-1.5 w-1.5 rounded-full', isVeg ? 'bg-green-600' : 'bg-[#8b2e2e]'].join(' ')} />
    </span>
  )
}

/**
 * Photo-forward plan card: the food is the actual product, so it leads.
 *
 * Changes from the previous version:
 * - A bottom gradient scrim sits behind the image badges so they stay
 *   legible regardless of what's in the photo, instead of relying on a
 *   flat white chip that can float awkwardly over a busy shot.
 * - Price now shows both /week and a computed /day figure — the weekly
 *   number is what's billed, the daily one is what people actually judge
 *   value against when comparing a subscription to buying groceries.
 * - The veg/non-veg signal now carries a hairline accent down the card
 *   body, not just the small square mark on the photo, so a grid of many
 *   cards stays scannable by dietary type at a glance — the same way a
 *   printed menu uses a colored rule next to a dish name.
 *
 * Links to /plans/:id — the public, no-auth plan-details page — rather
 * than straight into /subscribe/:id (SubscriptionSetup, gated behind
 * RequireAuth). That keeps browsing open to logged-out visitors, matching
 * Home's "public — browse freely" flow; the auth wall only kicks in once
 * someone actually taps Continue on the details page.
 */
export default function PlanCard({ plan }) {
  const dietaryType = getPlanDietaryType(plan)
  const isVeg = dietaryType === 'VEG'
  const products = plan.products ?? []
  const heroImage = plan.image_url || plan.image || products.find((p) => p.image_url)?.image_url
  const previewText = products.map((p) => p.name).join(' · ')
  const pricePerWeek = Number(plan.price_per_week ?? 0)
  const pricePerDay = pricePerWeek / 7

  return (
    <Link
      to={`/plans/${plan.id}`}
      className={[
        'group flex flex-col overflow-hidden rounded-card bg-white shadow-md shadow-ink-900/5 ring-1 ring-ink-900/[0.04]',
        'border-l-[3px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink-900/10',
        isVeg ? 'border-l-green-600/70' : 'border-l-[#8b2e2e]/70',
      ].join(' ')}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-chili-50">
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-chili-300">
            <Utensils className="h-7 w-7" />
          </div>
        )}

        {/* Scrim keeps the badges readable over any photo, bright or dark. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />

        <div className="absolute left-2.5 top-2.5 rounded-md bg-white p-1 shadow-sm">
          <DietaryMark type={dietaryType} />
        </div>

        <div className="absolute bottom-2.5 right-2.5 flex items-baseline gap-1 rounded-pill bg-white px-2.5 py-1 text-xs font-bold text-ink-900 shadow-sm">
          ₹{pricePerWeek.toFixed(0)}
          <span className="font-normal text-ink-400">/wk</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="font-display text-sm font-semibold leading-snug text-ink-900 line-clamp-2 sm:text-[15px]">
          {plan.name}
        </h3>
        {previewText ? <p className="line-clamp-1 text-xs text-ink-400">{previewText}</p> : null}

        <div className="mt-auto flex items-end justify-between pt-2.5">
          <div>
            {products.length > 0 ? (
              <p className="text-xs text-ink-300">{products.length} items</p>
            ) : null}
            {pricePerWeek > 0 ? (
              <p className="text-xs font-medium text-ink-500">≈₹{pricePerDay.toFixed(0)}/day</p>
            ) : null}
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-pill bg-chili-50 px-3 py-1.5 text-xs font-semibold text-chili-500 transition-colors duration-200 group-hover:bg-chili-500 group-hover:text-cream-50">
            Choose
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}