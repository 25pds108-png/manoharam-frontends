import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getPlanDietaryType } from '../../lib/planDietaryType'
import { useAuth } from '../../context/AuthContext'
import traditionalMeals from '../../assets/food/traditional-meals.jpg'
import mangoPickle from '../../assets/food/mango-pickle.jpg'

function DietaryMark({ type }) {
  const isVeg = type === 'VEG'
  return (
    <span
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      className={[
        'flex h-4 w-4 items-center justify-center rounded-[2px] border-[1.5px] bg-white',
        isVeg ? 'border-[#15803D]' : 'border-[#9B2C2C]',
      ].join(' ')}
    >
      <span className={['h-1.5 w-1.5 rounded-full', isVeg ? 'bg-[#15803D]' : 'bg-[#9B2C2C]'].join(' ')} />
    </span>
  )
}

export default function PlanCard({ plan }) {
  const { isAuthenticated } = useAuth()
  const dietaryType = getPlanDietaryType(plan)
  const isVeg = dietaryType === 'VEG'
  const products = plan.products ?? []
  const rawImage = plan.image_url || plan.image || products.find((p) => p.image_url)?.image_url
  const isPlaceholder = !rawImage || rawImage.includes('example.com')
  const defaultFoodImg = plan.name?.toLowerCase().includes('pickle') ? mangoPickle : traditionalMeals
  const [imgSrc, setImgSrc] = useState(isPlaceholder ? defaultFoodImg : rawImage)
  const previewText = products.map((p) => p.name).join(' · ')
  const pricePerWeek = Number(plan.price_per_week ?? 0)
  const pricePerDay = pricePerWeek / 7

  const subscribeTo = isAuthenticated ? `/subscribe/${plan.id}` : '/login'
  const subscribeState = isAuthenticated ? undefined : { from: { pathname: `/subscribe/${plan.id}` } }

  return (
    <div
      className={[
        'group flex flex-col overflow-hidden rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] shadow-xs transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-[#9B2C2C]/30 hover:shadow-md',
        isVeg ? 'border-l-4 border-l-[#15803D]' : 'border-l-4 border-l-[#9B2C2C]',
      ].join(' ')}
    >
      <Link
        to={`/plans/${plan.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3EBDD] block cursor-pointer"
      >
        <img
          src={imgSrc}
          alt={plan.name}
          onError={() => setImgSrc(defaultFoodImg)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute left-2.5 top-2.5 rounded-md bg-white/95 p-1 shadow-xs backdrop-blur-xs">
          <DietaryMark type={dietaryType} />
        </div>

        <div className="absolute bottom-2.5 right-2.5 flex items-baseline gap-1 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-[#1C1917] shadow-xs backdrop-blur-xs">
          ₹{pricePerWeek.toFixed(0)}
          <span className="font-normal text-[#78716C]">/wk</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div>
          <Link to={`/plans/${plan.id}`} className="block">
            <h3 className="font-serif text-sm font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors line-clamp-1 sm:text-base">
              {plan.name}
            </h3>
          </Link>
          {previewText ? (
            <p className="mt-1 line-clamp-1 text-xs text-[#78716C]">{previewText}</p>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#E6D9C5]/60 pt-2.5">
          <div>
            {pricePerWeek > 0 ? (
              <p className="text-[11px] font-semibold text-[#78716C]">≈ ₹{pricePerDay.toFixed(0)}/day</p>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to={`/plans/${plan.id}`}
              className="text-[11px] font-semibold text-[#78716C] hover:text-[#9B2C2C] px-2 py-1 transition-colors"
            >
              Details
            </Link>
            <Link
              to={subscribeTo}
              state={subscribeState}
              className="inline-flex items-center gap-1 rounded-md bg-[#FCE4E4] px-3 py-1 text-xs font-bold text-[#9B2C2C] hover:bg-[#9B2C2C] hover:text-white active:scale-95 transition-all shadow-2xs"
            >
              <span>Subscribe</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}