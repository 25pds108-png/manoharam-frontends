import { DIETARY_CATEGORIES } from '../../lib/planDietaryType'

/**
 * Dietary Badge: Standard Indian food labeling mark.
 */
function DietaryMark({ type }) {
  const isVeg = type === 'VEG'
  return (
    <span
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

export default function CategoryPicker({ selected, onSelect, counts }) {
  return (
    <div className="flex justify-center my-2">
      <div
        role="radiogroup"
        aria-label="Dietary meal preference"
        className="inline-flex w-full sm:w-auto items-center gap-1.5 rounded-2xl border border-cream-300 bg-cream-200/50 p-1.5 shadow-inner"
      >
        {DIETARY_CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id
          const isVeg = cat.id === 'VEG'
          const count = counts?.[cat.id] ?? 0

          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(cat.id)}
              className={`relative flex flex-1 sm:flex-initial items-center justify-center gap-2.5 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500 cursor-pointer ${
                isSelected
                  ? 'bg-cream-50 text-ink-900 shadow-sm border border-cream-300/80'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-cream-100/60'
              }`}
            >
              <DietaryMark type={cat.id} />

              <span className="font-serif tracking-tight text-ink-900">
                {isVeg ? 'Pure Veg' : 'Non-Veg'}
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                  isSelected
                    ? isVeg
                      ? 'bg-success-100 text-success-500 border border-success-200'
                      : 'bg-chili-100 text-chili-600 border border-chili-200'
                    : 'bg-cream-300/60 text-ink-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}