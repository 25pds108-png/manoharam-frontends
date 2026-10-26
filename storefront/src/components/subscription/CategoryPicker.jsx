import { Beef, Check, Leaf } from 'lucide-react'
import { DIETARY_CATEGORIES } from '../../lib/planDietaryType'

const ICONS = {
  VEG: Leaf,
  NON_VEG: Beef,
}

/**
 * Two large selectable cards — icon, bold title, one-line subtitle — with
 * an unmistakable selected state (filled icon circle + colored border +
 * checkmark) rather than a subtle underline. With only two options this
 * can afford generous size and a big touch target, which matters more
 * than density here.
 *
 * Only change from the previous pass: the selected icon circle uses a
 * soft two-stop gradient instead of a flat chili fill — closer to how
 * fresh produce is lit in photography (a highlight, not a flat swatch),
 * and it's the one place in this component worth spending that detail.
 */
export default function CategoryPicker({ selected, onSelect, counts }) {
  return (
    <div role="radiogroup" aria-label="Dietary category" className="grid grid-cols-2 gap-3 sm:gap-4">
      {DIETARY_CATEGORIES.map((cat) => {
        const Icon = ICONS[cat.id] ?? Leaf
        const isSelected = selected === cat.id
        const count = counts?.[cat.id]

        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(cat.id)}
            className={[
              'group relative flex flex-col items-center gap-2.5 rounded-card border-2 px-4 py-6 text-center',
              'transition-all duration-200 ease-out sm:py-7',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-400 focus-visible:ring-offset-2',
              isSelected
                ? 'border-chili-500 bg-chili-50/50 shadow-sm shadow-chili-500/10'
                : 'border-ink-900/10 bg-white hover:border-ink-900/20 hover:-translate-y-0.5',
            ].join(' ')}
          >
            {isSelected ? (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-chili-500">
                <Check className="h-3 w-3 text-cream-50" strokeWidth={3} />
              </span>
            ) : null}

            <span
              className={[
                'flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-200 sm:h-16 sm:w-16',
                isSelected
                  ? 'bg-gradient-to-br from-chili-400 to-chili-600 text-cream-50'
                  : 'bg-chili-50 text-chili-500',
              ].join(' ')}
            >
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
            </span>

            <span>
              <span className="flex items-center justify-center gap-1.5">
                <span className="font-display text-base font-bold text-ink-900 sm:text-lg">{cat.label}</span>
                {typeof count === 'number' ? (
                  <span className="rounded-full bg-ink-900/5 px-1.5 py-0.5 text-xs font-semibold text-ink-500">
                    {count}
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-500 sm:text-sm">{cat.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}