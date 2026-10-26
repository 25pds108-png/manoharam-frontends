import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import ProductImage from './ProductImage'

export default function ProductCard({ product }) {
  const nutrition = product.nutrition
  const hasCalories = Number(nutrition?.calories) > 0

  return (
    <Link
      to={`/product/${product.id}`}
      className="block overflow-hidden rounded-card bg-white shadow-sm shadow-ink-900/5 transition-all duration-200 active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-lg md:hover:shadow-ink-900/10"
    >
      <div className="relative">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="aspect-square w-full"
        />
        {hasCalories ? (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-pill bg-ink-900/70 px-2 py-1 text-[11px] font-medium text-cream-50 backdrop-blur-sm">
            <Flame className="h-3 w-3 text-amber-300" />
            {Math.round(nutrition.calories)} kcal
          </span>
        ) : null}
      </div>
      <div className="p-3 lg:p-4">
        <h3 className="line-clamp-1 font-display text-base font-semibold text-ink-900 lg:text-lg">
          {product.name}
        </h3>
        {product.description ? (
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-500 lg:text-base">{product.description}</p>
        ) : null}
        <p className="mt-1.5 font-semibold text-chili-500 lg:text-lg">
          ₹{Number(product.selling_price).toFixed(0)}
          <span className="ml-1 text-xs font-normal text-ink-300 lg:text-sm">/ {product.unit}</span>
        </p>

        {hasCalories ? (
          <div className="mt-2.5 grid grid-cols-5 gap-1 border-t border-ink-900/[0.06] pt-2 lg:gap-1.5 lg:pt-2.5">
            <NutrientStat label="Cal" value={nutrition.calories} />
            <NutrientStat label="Pro" value={nutrition.protein} unit="g" />
            <NutrientStat label="Carb" value={nutrition.carbs} unit="g" />
            <NutrientStat label="Fat" value={nutrition.fat} unit="g" />
            <NutrientStat label="Fib" value={nutrition.fiber} unit="g" />
          </div>
        ) : null}
      </div>
    </Link>
  )
}

// Keeps every nutrient cell the same predictable width: whole numbers
// stay whole, anything with a fraction is rounded to 1 decimal place.
// Without this, values like 33.333333 or 16.666667 render wider than
// their grid column and collide with the neighboring stat.
function formatNutrient(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0'
  const rounded = Math.round(num * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function NutrientStat({ label, value, unit = '' }) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <span className="truncate text-[10px] font-semibold tabular-nums text-ink-900 sm:text-xs lg:text-sm">
        {formatNutrient(value)}
        {unit}
      </span>
      <span className="text-[8px] font-medium uppercase tracking-wide text-ink-300 sm:text-[9px] lg:text-[10px]">
        {label}
      </span>
    </div>
  )
}